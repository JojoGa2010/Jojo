<?php
/** Farben-Krach: server-authoritative private hands and validated card actions. */
if (!defined('ABSPATH')) { exit; }
final class KK_Cards {
    private static function table() { global $wpdb; return $wpdb->prefix . 'kk_card_rooms'; }
    public static function install() {
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $table=self::table(); $charset=$wpdb->get_charset_collate();
        dbDelta("CREATE TABLE $table (
            code varchar(6) NOT NULL,
            touched bigint unsigned NOT NULL,
            payload longtext NOT NULL,
            PRIMARY KEY  (code),
            KEY touched (touched)
        ) ENGINE=InnoDB $charset;");
    }
    public static function cleanup() { global $wpdb; $wpdb->query($wpdb->prepare('DELETE FROM '.self::table().' WHERE touched < %d',time()-7200)); }
    public static function routes() { register_rest_route('kegel-krach/v1','/cards',array('methods'=>'POST','callback'=>array(__CLASS__,'request'),'permission_callback'=>'__return_true')); }
    private static function fail($text,$status=400) { return new WP_Error('kk_cards',$text,array('status'=>$status)); }
    private static function response($data) { $r=new WP_REST_Response($data);$r->header('Cache-Control','no-store, private');return $r; }
    public static function deck() {
        $deck=array();$id=0;
        foreach(array('r','y','g','b') as $color) {
            $deck[]=array('id'=>$id++,'c'=>$color,'v'=>'0');
            foreach(array('1','2','3','4','5','6','7','8','9','skip','reverse','draw2') as $value) for($i=0;$i<2;$i++) $deck[]=array('id'=>$id++,'c'=>$color,'v'=>$value);
        }
        foreach(array('wild','draw4') as $value)for($i=0;$i<4;$i++)$deck[]=array('id'=>$id++,'c'=>'w','v'=>$value);
        shuffle($deck);return $deck;
    }
    private static function advance(&$s,$steps=1) { $s['turn']=($s['turn']+$s['dir']*$steps+count($s['players'])*4)%count($s['players']);$s['drawn']=null;$s['next_at']=microtime(true)+1.1; }
    private static function take(&$s,$seat,$number) {
        for($i=0;$i<$number;$i++) {
            if(!$s['deck']&&count($s['discard'])>1) { $top=array_pop($s['discard']);$s['deck']=$s['discard'];shuffle($s['deck']);$s['discard']=array($top); }
            if(!$s['deck'])break;
            $s['players'][$seat]['hand'][]=array_pop($s['deck']);
        }
    }
    public static function start(&$room,$bots) {
        $people=array_values(array_filter($room['players'],function($p){return empty($p['bot']);}));
        for($i=0;$i<$bots;$i++)$people[]=array('uid'=>'bot'.$i,'n'=>array('Karten-Karl','Farb-Fee','Zahlen-Zorro','Blitz-Berta','Misch-Michi')[$i],'bot'=>true,'seen'=>time());
        if(count($people)<2||count($people)>6)return self::fail('Wähle insgesamt zwei bis sechs Spieler.');
        $room['players']=$people;$room['deck']=self::deck();$room['discard']=array();$room['turn']=0;$room['dir']=1;$room['drawn']=null;$room['winner']=null;$room['ended_at']=null;$room['stalled']=0;
        foreach($room['players'] as $i=>&$p)$p['hand']=array();unset($p);
        for($i=0;$i<7;$i++)foreach($room['players'] as $seat=>$p)self::take($room,$seat,1);
        // A neutral number starts this house-rule version, so nobody misses the first turn.
        $index=0;while(!is_numeric($room['deck'][$index]['v']))$index++;
        $top=array_splice($room['deck'],$index,1)[0];$room['discard'][]=$top;$room['color']=$top['c'];$room['started']=true;$room['next_at']=microtime(true)+1.1;$room['message']='Die Karten sind verteilt. Los geht’s!';$room['rev']++;
        return true;
    }
    public static function legal($s,$seat,$card) {
        if($card['v']==='draw4') { foreach($s['players'][$seat]['hand'] as $other)if($other['c']===$s['color'])return false;return true; }
        $top=end($s['discard']);return $card['c']==='w'||$card['c']===$s['color']||$card['v']===$top['v'];
    }
    public static function action(&$s,$seat,$body) {
        if(!$s['started']||$s['winner']!==null)return self::fail('Die Partie läuft gerade nicht.',409);
        if($s['turn']!==$seat)return self::fail('Du bist noch nicht dran.',409);
        $p=&$s['players'][$seat];$op=$body['op']??'';
        if($op==='draw') {
            if($s['drawn']!==null)return self::fail('Du hast schon gezogen. Spiele diese Karte oder passe.',409);
            $before=count($p['hand']);self::take($s,$seat,1);
            if(count($p['hand'])===$before) { $s['stalled']++;$s['message']='Keine Karte ziehbar. Nächster Spieler.';self::advance($s);if($s['stalled']>=count($s['players'])) {
                $possible=false;foreach($s['players'] as $k=>$person)foreach($person['hand'] as $held)if(self::legal($s,$k,$held))$possible=true;
                if(!$possible){$s['winner']='draw';$s['ended_at']=time();$s['message']='Keine weiteren Züge möglich – unentschieden.';}
            } }
            else { $s['stalled']=0;$last=end($p['hand']);$s['message']=$p['n'].' zieht eine Karte.';if(self::legal($s,$seat,$last))$s['drawn']=$last['id'];else self::advance($s); }
        } elseif($op==='pass') {
            if($s['drawn']===null)return self::fail('Ziehe zuerst eine Karte.');
            $s['message']=$p['n'].' passt.';self::advance($s);
        } elseif($op==='play') {
            $index=null;foreach($p['hand'] as $i=>$card)if($card['id']===($body['card']??null)){$index=$i;break;}
            if($index===null)return self::fail('Diese Karte hast du nicht.',409);
            $card=$p['hand'][$index];
            if(($s['drawn']!==null&&$card['id']!==$s['drawn'])||!self::legal($s,$seat,$card))return self::fail('Diese Karte passt gerade nicht.',409);
            if($card['c']==='w'&&!in_array($body['color']??'',array('r','y','g','b'),true))return self::fail('Wähle eine Farbe.');
            array_splice($p['hand'],$index,1);$s['discard'][]=$card;$s['color']=$card['c']==='w'?$body['color']:$card['c'];$s['stalled']=0;
            $s['message']=$p['n'].' legt '.self::label($card).'.';
            if(count($p['hand'])===1) {
                if(empty($body['last'])) { self::take($s,$seat,2);$s['message'].=' Letzte Karte vergessen: +2!'; }
                else $s['message'].=' LETZTE KARTE!';
            }
            $won=!count($p['hand']);$steps=1;$v=$card['v'];
            if($v==='reverse') { if(count($s['players'])===2)$steps=2;else $s['dir']*=-1; }
            if($v==='skip')$steps=2;
            if($v==='draw2'||$v==='draw4') { $next=($seat+$s['dir']+count($s['players']))%count($s['players']);$amount=$v==='draw2'?2:4;self::take($s,$next,$amount);$s['message'].=' '.$s['players'][$next]['n'].' zieht '.$amount.' und setzt aus.';$steps=2; }
            self::advance($s,$steps);
            if($won) { $s['ended_at']=time();$s['winner']=$p['uid'];$s['message']=$p['n'].' gewinnt die Runde!'; }
        } else return self::fail('Unbekannte Spielaktion.');
        $s['rev']++;return true;
    }
    public static function label($card) { $labels=array('skip'=>'Aussetzen','reverse'=>'Richtungswechsel','draw2'=>'+2','wild'=>'Farbwahl','draw4'=>'+4');$colors=array('r'=>'Rot','y'=>'Gelb','g'=>'Grün','b'=>'Blau','w'=>'');return trim($colors[$card['c']].' '.($labels[$card['v']]??$card['v'])); }
    public static function tick(&$s) {
        $now=time();$changed=false;
        foreach($s['players'] as &$p)if(empty($p['bot'])&&$p['seen']<$now-90) { if($s['started']){$p['bot']=true;$p['hash']='';$p['n'].=' (Bot)';$changed=true;} }
        unset($p);
        $humans=array_filter($s['players'],function($p){return empty($p['bot']);});
        if(!$s['started']) { $s['players']=array_values(array_filter($s['players'],function($p)use($now){return $p['seen']>=$now-90;}));$humans=$s['players']; }
        if(!in_array($s['host'],array_column($humans,'uid'),true)&&$humans){$s['host']=array_values($humans)[0]['uid'];$changed=true;}
        if($changed)$s['rev']++;
        if(!$s['started']||$s['winner']!==null||microtime(true)<$s['next_at']||empty($s['players'][$s['turn']]['bot']))return;
        $seat=$s['turn'];$hand=$s['players'][$seat]['hand'];$choices=array_values(array_filter($hand,function($c)use($s,$seat){return ($s['drawn']===null||$s['drawn']===$c['id'])&&self::legal($s,$seat,$c);}));
        if(!$choices) { self::action($s,$seat,array('op'=>$s['drawn']===null?'draw':'pass'));return; }
        // Keep wilds for later and prefer the most common color in the bot's own hand.
        $counts=array('r'=>0,'y'=>0,'g'=>0,'b'=>0);foreach($hand as $c)if(isset($counts[$c['c']]))$counts[$c['c']]++;arsort($counts);$favorite=key($counts);
        usort($choices,function($a,$b)use($favorite){$score=function($c)use($favorite){return ($c['c']==='w'?-10:0)+($c['c']===$favorite?3:0)+(in_array($c['v'],array('draw2','skip','reverse'),true)?2:0);};return $score($b)-$score($a);});
        self::action($s,$seat,array('op'=>'play','card'=>$choices[0]['id'],'color'=>$favorite,'last'=>true));
    }
    public static function view($s,$uid) {
        $seat=array_search($uid,array_column($s['players'],'uid'),true);$players=array();
        foreach($s['players'] as $p)$players[]=array('uid'=>$p['uid'],'n'=>$p['n'],'bot'=>!empty($p['bot']),'count'=>count($p['hand']??array()));
        $hand=$seat===false?array():($s['players'][$seat]['hand']??array());$playable=array();
        if($s['started']&&$s['winner']===null&&$s['turn']===$seat)foreach($hand as $c)if(($s['drawn']===null||$s['drawn']===$c['id'])&&self::legal($s,$seat,$c))$playable[]=$c['id'];
        return array('code'=>$s['code'],'rev'=>$s['rev'],'host'=>$s['host'],'started'=>$s['started'],'players'=>$players,'hand'=>$hand,'playable'=>$playable,'seat'=>$seat,'turn'=>$s['turn']??0,'dir'=>$s['dir']??1,'top'=>$s['started']?end($s['discard']):null,'color'=>$s['color']??null,'drawn'=>$s['drawn']??null,'winner'=>$s['winner']??null,'message'=>$s['message'],'started_at'=>$s['started_at']??null,'ended_at'=>$s['ended_at']??null);
    }
    public static function request($request) {
        global $wpdb;
        if(strlen($request->get_body())>3000)return self::fail('Nachricht zu groß.',413);
        $b=$request->get_json_params();if(!is_array($b))return self::fail('Ungültige Anfrage.');$op=$b['op']??'';$table=self::table();$now=time();
        if($op==='create'||$op==='join') {
            $key='kk_cards_rate_'.md5($_SERVER['REMOTE_ADDR']??'local');$rate=(int)get_transient($key);if($rate>=40)return self::fail('Bitte kurz warten.',429);set_transient($key,$rate+1,60);
        }
        if($op==='create') {
            $token=bin2hex(random_bytes(24));$uid=bin2hex(random_bytes(8));$person=array('uid'=>$uid,'n'=>mb_substr(sanitize_text_field((string)($b['name']??'Spieler')),0,18)?:'Spieler','hash'=>hash('sha256',$token),'seen'=>$now,'bot'=>false);
            $s=array('code'=>'','players'=>array($person),'host'=>$uid,'started'=>false,'rev'=>1,'message'=>'Teile den Code mit deinen Freunden.','started_at'=>null);
            if(!empty($b['solo'])) { $result=self::start($s,max(1,min(5,(int)($b['bots']??3))));if($result instanceof WP_Error)return $result;$s['started_at']=$now; }
            for($i=0;$i<8;$i++) { $s['code']='';for($j=0;$j<6;$j++)$s['code'].='ABCDEFGHJKLMNPQRSTUVWXYZ'[random_int(0,22)];if($wpdb->insert($table,array('code'=>$s['code'],'touched'=>$now,'payload'=>wp_json_encode($s)),array('%s','%d','%s'))!==false)return self::response(array('token'=>$token,'uid'=>$uid,'view'=>self::view($s,$uid))); }
            return self::fail('Raum konnte nicht erstellt werden.',503);
        }
        $code=strtoupper((string)($b['code']??''));if(!preg_match('/^[A-Z]{6}$/',$code))return self::fail('Gib den sechsstelligen Karten-Code ein.');
        $wpdb->query('START TRANSACTION');
        try {
            $raw=$wpdb->get_var($wpdb->prepare("SELECT payload FROM $table WHERE code = %s FOR UPDATE",$code));$s=$raw?json_decode($raw,true):null;
            if(!$s)return self::fail('Kartenraum nicht gefunden.',404);
            $token=(string)($b['token']??'');$seat=false;$uid=null;
            if($op==='join') {
                self::tick($s);if($s['started'])return self::fail('Die Runde läuft schon.',409);if(count($s['players'])>=6)return self::fail('Der Raum ist voll.',409);if(!$s['players'])return self::fail('Dieser Raum ist abgelaufen.',410);
                $token=bin2hex(random_bytes(24));$uid=bin2hex(random_bytes(8));$s['players'][]=array('uid'=>$uid,'n'=>mb_substr(sanitize_text_field((string)($b['name']??'Spieler')),0,18)?:'Spieler','hash'=>hash('sha256',$token),'seen'=>$now,'bot'=>false);$s['rev']++;
            } else {
                foreach($s['players'] as $i=>$p)if(empty($p['bot'])&&hash_equals($p['hash'],hash('sha256',$token))){$seat=$i;$uid=$p['uid'];break;}
                if($seat===false)return self::fail('Du bist nicht mehr in diesem Kartenraum.',403);
                $s['players'][$seat]['seen']=$now;self::tick($s);$seat=array_search($uid,array_column($s['players'],'uid'),true);
                if($op==='leave') {
                    if($s['started']){$s['players'][$seat]['bot']=true;$s['players'][$seat]['hash']='';$s['players'][$seat]['n'].=' (Bot)';}
                    else array_splice($s['players'],$seat,1);
                    if($s['host']===$uid){$humans=array_values(array_filter($s['players'],function($p){return empty($p['bot']);}));$s['host']=$humans?$humans[0]['uid']:null;}$s['rev']++;
                } elseif($op==='start') {
                    if($s['host']!==$uid)return self::fail('Nur der Gastgeber kann starten.',403);
                    if($s['started']&&$s['winner']===null)return self::fail('Die Runde läuft bereits.',409);
                    $bots=max(0,min(5,(int)($b['bots']??0)));$result=self::start($s,$bots);if($result instanceof WP_Error)return $result;$s['started_at']=$now;
                } elseif(in_array($op,array('play','draw','pass'),true)) {
                    if(!isset($b['rev'])||$b['rev']!==$s['rev'])return self::fail('Der Spielstand hat sich geändert. Bitte noch einmal versuchen.',409);
                    $result=self::action($s,$seat,$b);if($result instanceof WP_Error)return $result;
                } elseif($op!=='poll')return self::fail('Unbekannte Anfrage.');
            }
            if($wpdb->update($table,array('payload'=>wp_json_encode($s),'touched'=>$now),array('code'=>$code),array('%s','%d'),array('%s'))===false)return self::fail('Speichern fehlgeschlagen.',503);
            $wpdb->query('COMMIT');return self::response(array('token'=>$token,'uid'=>$uid,'view'=>self::view($s,$uid)));
        } finally { $wpdb->query('ROLLBACK'); }
    }
}
