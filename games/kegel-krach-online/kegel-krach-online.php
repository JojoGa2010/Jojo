<?php
/**
 * Plugin Name: Kegel-Krach Online
 * Description: Verbindet das bestehende Kegel-Krach-HTML-Spiel mit privaten und offenen WordPress-Lobbys.
 * Version: 1.0.0
 * Requires PHP: 7.4
 * Author: Digitalwohnen
 */
if (!defined('ABSPATH')) { exit; }

final class KK_Online {
    private static function table() { global $wpdb; return $wpdb->prefix . 'kk_online_rooms'; }
    public static function install() {
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $table = self::table();
        $charset = $wpdb->get_charset_collate();
        dbDelta("CREATE TABLE $table (
            code varchar(4) NOT NULL,
            touched bigint unsigned NOT NULL,
            payload longtext NOT NULL,
            PRIMARY KEY  (code),
            KEY touched (touched)
        ) ENGINE=InnoDB $charset;");
        if (!wp_next_scheduled('kk_online_cleanup')) { wp_schedule_event(time(), 'hourly', 'kk_online_cleanup'); }
    }
    public static function cleanup() {
        global $wpdb;
        $wpdb->query($wpdb->prepare('DELETE FROM ' . self::table() . ' WHERE touched < %d', time() - 7200));
    }
    public static function assets() {
        // Loading on all public pages also supports Elementor HTML widgets and changed slugs.
        // The client does nothing unless the original Kegel-Krach game is present.
        echo '<script data-nowprocket="" data-cfasync="false">window.KKOnlineConfig=' . wp_json_encode(array('api' => rest_url('kegel-krach/v1/')), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) . ';</script>';
        echo '<script data-nowprocket="" data-cfasync="false" src="' . esc_url(plugins_url('assets/online.js', __FILE__)) . '?ver=1.0.0"></script>';
    }
    public static function routes() {
        register_rest_route('kegel-krach/v1', '/rooms', array(
            'methods' => 'POST', 'callback' => array(__CLASS__, 'rooms'), 'permission_callback' => '__return_true',
        ));
    }
    private static function fail($message, $status = 400) { return new WP_Error('kk_online', $message, array('status' => $status)); }
    private static function response($data) {
        $r = new WP_REST_Response($data);
        $r->header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        return $r;
    }
    private static function person($p) {
        return array('uid' => $p['uid'], 'n' => $p['n'], 'skin' => $p['skin']);
    }
    private static function event(&$room, $type, $data, $uid) {
        $room['seq']++;
        $room['events'][] = array('seq' => $room['seq'], 'type' => $type, 'data' => $data, 'uid' => $uid);
        if (count($room['events']) > 256) { $room['events'] = array_slice($room['events'], -256); }
    }
    private static function throttle($bucket, $max, $seconds) {
        $key = 'kk_rate_' . md5($bucket . '|' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
        $count = (int) get_transient($key);
        if ($count >= $max) { return false; }
        set_transient($key, $count + 1, $seconds);
        return true;
    }
    public static function rooms($request) {
        global $wpdb;
        if (strlen($request->get_body()) > 100000) { return self::fail('Nachricht zu groß.', 413); }
        $body = $request->get_json_params();
        if (!is_array($body)) { return self::fail('Ungültige Anfrage.'); }
        $op = $body['op'] ?? '';
        $table = self::table();
        $now = time();
        if ($op === 'list') {
            $rows = $wpdb->get_col($wpdb->prepare("SELECT payload FROM $table WHERE touched > %d ORDER BY touched DESC LIMIT 100", $now - 90));
            $out = array();
            foreach ($rows as $json) {
                $room = json_decode($json, true);
                if (!$room || !$room['public'] || $room['started'] || $room['host_seen'] < $now - 90 || count($room['members']) >= 4) { continue; }
                $out[] = array('code' => $room['code'], 'n' => $room['members'][0]['n'], 'c' => count($room['members']));
                if (count($out) >= 20) { break; }
            }
            return self::response(array('rooms' => $out));
        }
        if ($op === 'create' || $op === 'join') {
            if (!self::throttle($op, $op === 'create' ? 12 : 80, 600)) { return self::fail('Bitte warte etwas, bevor du eine weitere Lobby öffnest.', 429); }
            $uid = preg_replace('/[^a-zA-Z0-9_-]/', '', (string) ($body['uid'] ?? ''));
            if (strlen($uid) < 3 || strlen($uid) > 40) { return self::fail('Ungültige Spielerkennung.'); }
            $token = bin2hex(random_bytes(24));
            $member = array('uid' => $uid, 'n' => mb_substr(sanitize_text_field($body['n'] ?? 'Kegler'), 0, 14), 'skin' => max(0, min(3, (int) ($body['skin'] ?? 0))), 'hash' => hash('sha256', $token), 'seen' => $now, 'chat_at' => 0, 'act_at' => 0);
            if ($op === 'create') {
                for ($i = 0; $i < 12; $i++) {
                    $code = '';
                    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
                    for ($j = 0; $j < 4; $j++) { $code .= $alphabet[random_int(0, strlen($alphabet) - 1)]; }
                    $room = array('code' => $code, 'public' => !empty($body['public']), 'started' => false, 'host_seen' => $now, 'members' => array($member), 'seq' => 0, 'events' => array());
                    if ($wpdb->insert($table, array('code' => $code, 'touched' => $now, 'payload' => wp_json_encode($room)), array('%s', '%d', '%s'))) {
                        return self::response(array('code' => $code, 'token' => $token, 'seq' => 0));
                    }
                }
                return self::fail('Lobby konnte nicht erstellt werden.', 503);
            }
        }
        $code = strtoupper((string) ($body['code'] ?? ''));
        if (!preg_match('/^[A-Z]{4}$/', $code)) { return self::fail('Bitte den vierstelligen Lobby-Code eingeben.'); }
        $wpdb->query('START TRANSACTION');
        try {
            $json = $wpdb->get_var($wpdb->prepare("SELECT payload FROM $table WHERE code = %s FOR UPDATE", $code));
            $room = $json ? json_decode($json, true) : null;
            if (!$room || $room['host_seen'] < $now - 90) { return self::fail('Lobby nicht gefunden oder der Gastgeber ist nicht mehr verbunden.', 404); }
            if ($op === 'join') {
                if ($room['started']) { return self::fail('Dieses Spiel läuft bereits.'); }
                if (count($room['members']) >= 4) { return self::fail('Diese Lobby ist bereits voll.'); }
                foreach ($room['members'] as $p) { if ($p['uid'] === $member['uid']) { return self::fail('Du bist dieser Lobby bereits beigetreten.'); } }
                $room['members'][] = $member;
                $reply = array('code' => $code, 'token' => $token, 'seq' => $room['seq']);
            } else {
                $index = -1;
                $hash = hash('sha256', (string) ($body['token'] ?? ''));
                foreach ($room['members'] as $i => $p) { if (hash_equals($p['hash'], $hash)) { $index = $i; break; } }
                if ($index < 0) { return self::fail('Keine gültige Verbindung zur Lobby.', 403); }
                $host = $index === 0;
                $p = $room['members'][$index];
                $room['members'][$index]['seen'] = $now;
                if ($host) { $room['host_seen'] = $now; }
                if ($op === 'poll') {
                    $after = max(0, (int) ($body['after'] ?? 0));
                    if ($room['events'] && $after < $room['events'][0]['seq'] - 1) { return self::fail('Die Verbindung war zu lange unterbrochen. Bitte eine neue Partie starten.', 409); }
                    $events = array_values(array_filter($room['events'], function ($e) use ($after) { return $e['seq'] > $after; }));
                    $reply = array('events' => $events);
                } elseif ($op === 'emit') {
                    $type = $body['type'] ?? '';
                    $data = $body['data'] ?? array();
                    if (!is_array($data)) { return self::fail('Ungültige Spieldaten.'); }
                    if ($type === 'hello') {
                        if ($room['started']) { return self::fail('Dieses Spiel läuft bereits.'); }
                        // Server membership is the source of truth, including simultaneous joins.
                        self::event($room, 'lobby', array('L' => array_map(array(__CLASS__, 'person'), $room['members']), 'pub' => $room['public']), 'server');
                    } elseif ($type === 'lobby') {
                        if (!$host) { return self::fail('Nur der Gastgeber kann die Lobby ändern.', 403); }
                        $data = array('L' => array_map(array(__CLASS__, 'person'), $room['members']), 'pub' => $room['public']);
                        self::event($room, $type, $data, $p['uid']);
                    } elseif ($type === 'game') {
                        if (!$host || $room['started']) { return self::fail('Spiel kann nicht gestartet werden.', 403); }
                        if (!isset($data['G']['pl']) || !is_array($data['G']['pl']) || count($data['G']['pl']) < 2 || count($data['G']['pl']) > 4) { return self::fail('Mindestens zwei Spieler oder Bots erforderlich.'); }
                        $human_ids = array();
                        foreach ($data['G']['pl'] as $player) { if (empty($player['bot'])) { $human_ids[] = $player['uid'] ?? ''; } }
                        $registered = array_column($room['members'], 'uid');
                        sort($human_ids); sort($registered);
                        if ($human_ids !== $registered) { return self::fail('Die Lobby hat sich geändert. Bitte erneut starten.'); }
                        $room['started'] = true;
                        self::event($room, $type, $data, $p['uid']);
                    } elseif ($type === 'ev') {
                        if (!$host || !$room['started']) { return self::fail('Nur der Gastgeber darf Spielzüge verteilen.', 403); }
                        if (!isset($data['evs']) || !is_array($data['evs']) || count($data['evs']) > 3) { return self::fail('Ungültiger Spielzug.'); }
                        self::event($room, $type, $data, $p['uid']);
                    } elseif ($type === 'act') {
                        if (!$room['started'] || !isset($data['a']['t']) || !in_array($data['a']['t'], array('roll', 'move'), true)) { return self::fail('Ungültige Spielaktion.'); }
                        if (microtime(true) - $p['act_at'] < .15) { return self::fail('Bitte kurz warten.', 429); }
                        $room['members'][$index]['act_at'] = microtime(true);
                        $action = array('t' => $data['a']['t']);
                        if ($action['t'] === 'move') { $action['i'] = max(0, min(3, (int) ($data['a']['i'] ?? 0))); }
                        self::event($room, $type, array('uid' => $p['uid'], 'a' => $action), $p['uid']);
                    } elseif ($type === 'chat') {
                        if (microtime(true) - $p['chat_at'] < 1.5) { return self::fail('Nicht spammen! Bitte kurz warten.', 429); }
                        $room['members'][$index]['chat_at'] = microtime(true);
                        self::event($room, $type, array('n' => $p['n'], 't' => mb_substr(sanitize_text_field($data['t'] ?? ''), 0, 40), 'u' => $p['uid']), $p['uid']);
                    } else { return self::fail('Unbekannte Nachricht.'); }
                    $reply = array('ok' => true);
                } else { return self::fail('Unbekannte Anfrage.'); }
            }
            $saved = $wpdb->update($table, array('payload' => wp_json_encode($room), 'touched' => $now), array('code' => $code), array('%s', '%d'), array('%s'));
            if ($saved === false) { return self::fail('Spielstand konnte nicht gespeichert werden.', 503); }
            $wpdb->query('COMMIT');
            return self::response($reply);
        } finally { $wpdb->query('ROLLBACK'); }
    }
}
register_activation_hook(__FILE__, array('KK_Online', 'install'));
register_deactivation_hook(__FILE__, function () { wp_clear_scheduled_hook('kk_online_cleanup'); });
add_action('kk_online_cleanup', array('KK_Online', 'cleanup'));
add_action('rest_api_init', array('KK_Online', 'routes'));
add_action('wp_footer', array('KK_Online', 'assets'), 100);
