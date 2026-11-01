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
ok(poll_room($guest) instanceof WP_Error,'disconnected host reported');
