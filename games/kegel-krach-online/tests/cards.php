<?php
require '/harness.php';
function cards($b){return KK_Cards::request(new Request($b));}
function cv($s,$op,$extra=[]){return cards(array_merge(['op'=>$op,'code'=>$s['view']['code'],'token'=>$s['token']],$extra));}
function save_state($s,$state){global $wpdb;$wpdb->rows[$s['view']['code']]['payload']=json_encode($state);}
function state($s){global $wpdb;return json_decode($wpdb->rows[$s['view']['code']]['payload'],true);}
function card($id,$c,$v){return ['id'=>$id,'c'=>$c,'v'=>$v];}
$deck=KK_Cards::deck();ok(count($deck)===108&&count(array_unique(array_column($deck,'id')))===108,'108 unique card IDs and classic color/symbol distribution');
$host=cards(['op'=>'create','name'=>'Anna'])->data;$guest=cards(['op'=>'join','code'=>$host['view']['code'],'name'=>'Ben'])->data;
ok(strlen($host['view']['code'])===6&&strlen($host['token'])===48,'card lobby created with six-letter code and private token');
ok(cv($guest,'start',['bots'=>0]) instanceof WP_Error,'guest cannot start card round');
ok(cv($host,'start',['bots'=>5]) instanceof WP_Error,'more than six card players rejected');
$started=cv($host,'start',['bots'=>2]);ok(!($started instanceof WP_Error)&&count($started->data['view']['players'])===4,'host starts two humans plus two bots');
$h=cv($host,'poll')->data['view'];$g=cv($guest,'poll')->data['view'];
ok(count($h['hand'])===7&&count($g['hand'])===7&&$h['hand']!==$g['hand'],'each human receives their own seven cards');
$json=json_encode($h);ok(!str_contains($json,'hash')&&!str_contains($json,'deck')&&!str_contains($json,$guest['token'])&&!str_contains($json,'discard'),'server never exposes other hands, deck, hashes or session secrets');
ok(cards(['op'=>'join','code'=>$host['view']['code'],'name'=>'Late']) instanceof WP_Error,'late card join rejected');
ok(cv($guest,'draw',['rev'=>$h['rev']]) instanceof WP_Error,'out-of-turn card draw rejected');
ok(cv($host,'play',['card'=>999,'rev'=>$h['rev']]) instanceof WP_Error,'invented card rejected');
ok(cv($host,'draw',['rev'=>$h['rev']-1]) instanceof WP_Error,'stale card action revision rejected');
// Deterministic mid-round fixture: no reliance on shuffle outcomes.
$s=state($host);$s['players']=array_slice($s['players'],0,2);$s['players'][0]['hand']=[card(0,'r','2'),card(1,'b','9'),card(2,'r','5')];$s['players'][1]['hand']=[card(3,'g','3'),card(4,'y','4')];$s['discard']=[card(5,'r','7')];$s['color']='r';$s['turn']=0;$s['dir']=1;$s['drawn']=null;$s['winner']=null;$s['deck']=[card(6,'g','4'),card(7,'r','8')];save_state($host,$s);
ok(cv($host,'play',['card'=>1,'rev'=>$s['rev']]) instanceof WP_Error,'non-matching color and number rejected');
$draw=cv($host,'draw',['rev'=>$s['rev']])->data['view'];ok($draw['drawn']===7&&$draw['turn']===0&&$draw['playable']===[7],'after drawing only newly drawn matching card can be played');
ok(cv($host,'draw',['rev'=>$draw['rev']]) instanceof WP_Error,'cannot repeatedly draw within same turn');
ok(cv($host,'play',['card'=>0,'rev'=>$draw['rev']]) instanceof WP_Error,'cannot play previously held card after drawing');
$pass=cv($host,'pass',['rev'=>$draw['rev']])->data['view'];ok($pass['turn']===1,'drawn playable card can be kept by passing');
$s=state($host);$s['turn']=0;$s['drawn']=null;$s['players'][0]['hand']=[card(0,'r','reverse'),card(1,'g','9')];$s['deck']=KK_Cards::deck();save_state($host,$s);
$r=cv($host,'play',['card'=>0,'last'=>true,'rev'=>$s['rev']])->data['view'];ok($r['turn']===0&&count($r['hand'])===1,'reverse skips opponent with two players and last-card call prevents penalty');
$s=state($host);$s['color']='g';$s['players'][0]['hand']=[card(0,'g','skip'),card(1,'b','9')];save_state($host,$s);
$r=cv($host,'play',['card'=>0,'rev'=>$s['rev']])->data['view'];ok(count($r['hand'])===3&&$r['turn']===0,'missing last-card call draws two penalty cards');
$s=state($host);$s['players'][0]['hand']=[card(0,'w','draw4'),card(1,'g','9')];$s['color']='g';save_state($host,$s);
ok(cv($host,'play',['card'=>0,'color'=>'r','rev'=>$s['rev']]) instanceof WP_Error,'draw four illegal while same-color card is held');
$s['players'][0]['hand']=[card(0,'w','draw4'),card(1,'b','9')];save_state($host,$s);
ok(cv($host,'play',['card'=>0,'color'=>'pink','rev'=>$s['rev']]) instanceof WP_Error,'invalid wild color rejected');
$before=count($s['players'][1]['hand']);$r=cv($host,'play',['card'=>0,'color'=>'r','last'=>true,'rev'=>$s['rev']])->data['view'];ok($r['color']==='r'&&$r['players'][1]['count']===$before+4&&$r['turn']===0,'valid draw four changes color, draws four and skips opponent');
$s=state($host);$s['players'][0]['hand']=[card(0,'r','draw2')];$s['color']='r';save_state($host,$s);$before=count($s['players'][1]['hand']);
$r=cv($host,'play',['card'=>0,'rev'=>$s['rev']])->data['view'];ok($r['winner']===$host['uid']&&$r['players'][1]['count']===$before+2,'winning action card still applies draw-two penalty');
ok(cv($host,'draw',['rev'=>$r['rev']]) instanceof WP_Error,'finished round rejects actions');
$r=cv($host,'start',['bots'=>0])->data['view'];ok($r['winner']===null&&count($r['hand'])===7,'host can restart a finished round');
cv($host,'leave');$r=cv($guest,'poll')->data['view'];ok($r['players'][0]['bot']&&$r['host']===$guest['uid'],'leaving host becomes bot and connected guest becomes host');
ok(cv($host,'poll') instanceof WP_Error,'leaving card session loses access');
// Empty draw pile recycles everything except the current top card.
$s=state($guest);$s['deck']=[];$s['discard']=[card(40,'b','5'),card(41,'g','7'),card(42,'r','2')];$s['turn']=1;$s['drawn']=null;$s['next_at']=microtime(true)+100;save_state($guest,$s);$before=count($s['players'][1]['hand']);
$r=cv($guest,'draw',['rev'=>$s['rev']])->data['view'];ok(count($r['hand'])===$before+1&&$r['top']['id']===42,'empty deck reshuffled without moving discard top');
// Exhausting the pile must not end a game while somebody can still play.
$s=state($guest);$s['deck']=[];$s['discard']=[card(42,'r','2')];$s['color']='r';$s['turn']=1;$s['drawn']=null;$s['stalled']=count($s['players'])-1;$s['players'][1]['hand']=[card(7,'r','5')];save_state($guest,$s);
$r=cv($guest,'draw',['rev'=>$s['rev']])->data['view'];ok($r['winner']===null,'voluntary draw with empty pile cannot force draw while a legal card remains');
// A complete bot-only simulation exercises all action types and terminates.
$sim=['code'=>'SIMULA','players'=>[['uid'=>'h','n'=>'H','seen'=>time(),'bot'=>false]],'host'=>'h','started'=>false,'rev'=>1];KK_Cards::start($sim,5);foreach($sim['players'] as &$p)$p['bot']=true;unset($p);
$turns=0;while($sim['winner']===null&&$turns<2500){$sim['next_at']=0;KK_Cards::tick($sim);$turns++;}
ok($sim['winner']!==null,'six-bot card simulation reaches round end');
echo 'Card simulation: '.$turns." turns\n";
