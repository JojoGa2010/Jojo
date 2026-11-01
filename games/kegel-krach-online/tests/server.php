<?php
// Endpoint checks with a transactional in-memory wpdb test double.
define('ABSPATH', '/wordpress/');
class WP_Error { public $message; public $data; function __construct($code, $message, $data) { $this->message=$message; $this->data=$data; } }
class WP_REST_Response { public $data; function __construct($data) { $this->data=$data; } function header($a,$b) {} }
function add_action(...$args) {} function register_activation_hook(...$args) {} function register_deactivation_hook(...$args) {}
function wp_json_encode($data, $flags=0) { return json_encode($data,$flags); }
function sanitize_text_field($text) { return trim(strip_tags($text)); }
$rates=[];
function get_transient($key) { global $rates; return $rates[$key]??false; }
function set_transient($key,$value,$ttl) { global $rates; $rates[$key]=$value; }
class DB {
 public $prefix='wp_'; public $rows=[]; private $backup;
 function prepare($sql,...$args) { return ['sql'=>$sql,'args'=>$args]; }
 function query($sql) { if($sql==='START TRANSACTION') $this->backup=$this->rows; if($sql==='COMMIT') $this->backup=null; if($sql==='ROLLBACK'&&$this->backup!==null){$this->rows=$this->backup;$this->backup=null;} return 1; }
 function insert($table,$data,$formats) { if(isset($this->rows[$data['code']]))return false; $this->rows[$data['code']]=$data; return 1; }
 function get_var($query) { return $this->rows[$query['args'][0]]['payload']??null; }
 function get_col($query) { return array_column(array_filter($this->rows,fn($r)=>$r['touched']>$query['args'][0]),'payload'); }
 function update($table,$data,$where,...$formats) { $this->rows[$where['code']]=array_merge($this->rows[$where['code']],$data); return 1; }
}
$wpdb=new DB();
class Request { private $data; function __construct($data){$this->data=$data;} function get_body(){return json_encode($this->data);} function get_json_params(){return $this->data;} }
require '/plugin.php';
function call_api($data){return KK_Online::rooms(new Request($data));}
function ok($condition,$message){if(!$condition)throw new Exception('FAIL: '.$message);echo 'PASS: '.$message."\n";}
function send_event($session,$type,$data){return call_api(['op'=>'emit','code'=>$session['code'],'token'=>$session['token'],'type'=>$type,'data'=>$data]);}
function poll_room($session,$after=0){return call_api(['op'=>'poll','code'=>$session['code'],'token'=>$session['token'],'after'=>$after]);}
$host=call_api(['op'=>'create','uid'=>'host01','n'=>'Anna','skin'=>1,'public'=>true])->data;
ok(strlen($host['code'])===4 && strlen($host['token'])===48,'create lobby with private session token');
$guest=call_api(['op'=>'join','code'=>$host['code'],'uid'=>'guest01','n'=>'Ben','skin'=>2])->data;
send_event($guest,'hello',['uid'=>'spoof']);
$events=poll_room($host)->data['events'];
ok(count($events[0]['data']['L'])===2 && $events[0]['data']['L'][1]['uid']==='guest01','host receives server-verified guest membership');
ok(!str_contains(json_encode($events),'hash') && !str_contains(json_encode($events),$guest['token']),'session secrets stay out of messages');
ok(count(call_api(['op'=>'list'])->data['rooms'])===1,'public lobby discoverable');
ok(call_api(['op'=>'poll','code'=>$host['code'],'token'=>'wrong']) instanceof WP_Error,'unknown token rejected');
ok(send_event($guest,'game',['G'=>['pl'=>[['uid'=>'host01'],['uid'=>'guest01']]]]) instanceof WP_Error,'guest cannot start game');
ok(send_event($host,'game',['G'=>['pl'=>[['uid'=>'host01'],['bot'=>1,'uid'=>'B1']]]]) instanceof WP_Error,'start rejects stale lobby membership');
ok(!(send_event($host,'game',['G'=>['pl'=>[['uid'=>'host01'],['uid'=>'guest01']]]]) instanceof WP_Error),'host starts game for registered players');
ok(count(call_api(['op'=>'list'])->data['rooms'])===0,'started game removed from public list');
ok(call_api(['op'=>'join','code'=>$host['code'],'uid'=>'late01','n'=>'Late']) instanceof WP_Error,'late join rejected');
send_event($guest,'act',['uid'=>'host01','a'=>['t'=>'roll']]);
$events=poll_room($host)->data['events'];
$action=end($events);
ok($action['type']==='act' && $action['data']['uid']==='guest01','action identity bound to token, not caller payload');
ok(send_event($guest,'ev',['evs'=>[]]) instanceof WP_Error,'guest cannot forge roll results');
send_event($host,'ev',['evs'=>[['t'=>'roll','k'=>1,'d'=>6]]]);
$events=poll_room($guest)->data['events'];
$last=end($events);
ok($last['type']==='ev' && $last['data']['evs'][0]['d']===6,'guest receives host roll result');
ok(count(poll_room($guest,$last['seq'])->data['events'])===0,'cursor prevents duplicate delivery');
send_event($guest,'chat',['u'=>'host01','n'=>'Fake','t'=>'Hallo']);
$events=poll_room($host)->data['events'];$last=end($events);
ok($last['data']['u']==='guest01' && $last['data']['n']==='Ben','chat identity cannot be spoofed');
ok(send_event($guest,'chat',['t'=>'spam']) instanceof WP_Error,'rapid repeated chat rejected');
$private=call_api(['op'=>'create','uid'=>'other01','n'=>'Private'])->data;
ok(count(call_api(['op'=>'list'])->data['rooms'])===0,'private room excluded from public list');
for($i=0;$i<3;$i++)call_api(['op'=>'join','code'=>$private['code'],'uid'=>'person'.$i,'n'=>'P']);
ok(call_api(['op'=>'join','code'=>$private['code'],'uid'=>'overflow','n'=>'P']) instanceof WP_Error,'fifth player rejected');
$row=json_decode($wpdb->rows[$host['code']]['payload'],true);$row['host_seen']=time()-91;$wpdb->rows[$host['code']]['payload']=json_encode($row);
$status=poll_room($guest)->data['status'];
ok($status['host_uid']===null && $status['offer']['uid']==='guest01','offline admin triggers offer for connected guest');
ok($status['state']['pl'][0]['bot']===1,'departed admin becomes bot without changing board indices');
$accepted=call_api(['op'=>'answer','code'=>$guest['code'],'token'=>$guest['token'],'accept'=>true])->data['status'];
ok($accepted['host_uid']==='guest01' && $accepted['L'][0]['uid']==='guest01','acceptance promotes candidate and preserves lobby crown');
ok(send_event($host,'ev',['evs'=>[]]) instanceof WP_Error,'departed admin token loses authority');
$stale=call_api(['op'=>'emit','code'=>$guest['code'],'token'=>$guest['token'],'epoch'=>1,'type'=>'ev','data'=>['evs'=>[]]]);
ok($stale instanceof WP_Error,'old generation cannot overwrite migrated state');
$new=call_api(['op'=>'emit','code'=>$guest['code'],'token'=>$guest['token'],'epoch'=>$accepted['epoch'],'type'=>'ev','data'=>['evs'=>[]]]);
ok(!($new instanceof WP_Error),'new admin can publish using current generation');
function age_room($session,$key,$age){global $wpdb;$r=json_decode($wpdb->rows[$session['code']]['payload'],true);$r[$key]=time()-$age;$wpdb->rows[$session['code']]['payload']=json_encode($r);}
$idle=call_api(['op'=>'create','uid'=>'idlehost','n'=>'Idle'])->data;
$ig=call_api(['op'=>'join','code'=>$idle['code'],'uid'=>'idleguest','n'=>'Guest'])->data;
age_room($idle,'host_active',59);
ok(poll_room($ig)->data['status']['host_uid']==='idlehost','59 seconds idle keeps admin');
age_room($idle,'host_active',60);
ok(poll_room($ig)->data['status']['offer']['uid']==='idleguest','60 seconds idle triggers handover even with live heartbeat');
$third=call_api(['op'=>'create','uid'=>'thirdhost','n'=>'Admin'])->data;
$g1=call_api(['op'=>'join','code'=>$third['code'],'uid'=>'thirdguest1','n'=>'A'])->data;
$g2=call_api(['op'=>'join','code'=>$third['code'],'uid'=>'thirdguest2','n'=>'B'])->data;
call_api(['op'=>'leave','code'=>$third['code'],'token'=>$third['token']]);
$s=poll_room($g1)->data['status'];$chosen=$s['offer']['uid']==='thirdguest1'?$g1:$g2;$other=$s['offer']['uid']==='thirdguest1'?$g2:$g1;
ok(call_api(['op'=>'answer','code'=>$other['code'],'token'=>$other['token'],'accept'=>true]) instanceof WP_Error,'only selected candidate can accept');
$declined=call_api(['op'=>'answer','code'=>$chosen['code'],'token'=>$chosen['token'],'accept'=>false])->data['status'];
ok($declined['offer']['uid']!==$s['offer']['uid'],'decline asks another connected player');
$r=json_decode($wpdb->rows[$third['code']]['payload'],true);$r['offer']['expires']=time()-1;$wpdb->rows[$third['code']]['payload']=json_encode($r);
ok(poll_room($other)->data['status']['offer']===null,'expired last offer leaves explicit no-admin state');
$leave=call_api(['op'=>'create','uid'=>'leavehost','n'=>'Admin'])->data;
$lg=call_api(['op'=>'join','code'=>$leave['code'],'uid'=>'leaveguest','n'=>'Guest'])->data;
call_api(['op'=>'leave','code'=>$lg['code'],'token'=>$lg['token']]);
ok(count(poll_room($leave)->data['status']['L'])===1,'back removes guest from lobby');
ok(poll_room($lg) instanceof WP_Error,'left guest session is revoked');
$kh=call_api(['op'=>'create','uid'=>'kickhost','n'=>'Admin'])->data;
$kg=call_api(['op'=>'join','code'=>$kh['code'],'uid'=>'kickguest','n'=>'Guest'])->data;
$unauthorized=call_api(['op'=>'kick','code'=>$kg['code'],'token'=>$kg['token'],'uid'=>'kickhost']);
ok($unauthorized instanceof WP_Error && $unauthorized->data['status']===403,'guest cannot kick admin');
ok(call_api(['op'=>'kick','code'=>$kh['code'],'token'=>$kh['token'],'uid'=>'kickhost']) instanceof WP_Error,'admin cannot kick self');
$kicked=call_api(['op'=>'kick','code'=>$kh['code'],'token'=>$kh['token'],'uid'=>'kickguest']);
ok(count($kicked->data['status']['L'])===1,'admin kick frees lobby slot');
$removed=poll_room($kg);
ok($removed instanceof WP_Error && str_contains($removed->message,'entfernt'),'kicked session revoked with clear explanation');
ok(call_api(['op'=>'kick','code'=>$guest['code'],'token'=>$guest['token'],'uid'=>'host01']) instanceof WP_Error,'kick rejected after game starts');
