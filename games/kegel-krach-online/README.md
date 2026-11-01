# Kegel-Krach Online für WordPress

## Installation auf digitalwohnen.at

1. Die Datei **Kegel-Krach-Online.zip** herunterladen. Nicht entpacken.
2. In WordPress **Plugins → Neues Plugin hinzufügen → Plugin hochladen** öffnen.
3. ZIP auswählen, **Jetzt installieren**, dann **Aktivieren** anklicken.
4. In **WP Rocket → Cache leeren** den Cache löschen.
5. `https://digitalwohnen.at/spiel/` neu öffnen. Unter dem Menü steht nach kurzer Zeit **„✓ Online-Verbindung über deine Website bereit“**.

Der bisherige HTML-Code in Elementor bleibt erhalten, einschließlich der funktionierenden Layout-Korrektur und des Vollbild-Knopfs. Dieses Plugin ergänzt die Online-Verbindung automatisch. Kein zusätzlicher HTML-Zusatz und kein fremder Dienst nötig.

## Mit zwei Geräten spielen

1. Gerät A: **Mit Freunden → Name eingeben → Private Lobby erstellen**.
2. Den vierstelligen Code an die mitspielende Person weitergeben.
3. Gerät B: dieselbe Spielseite öffnen, **Mit Freunden**, eigenen Namen eingeben, Code eintragen, **Beitreten**.
4. Sobald beide Namen in der Lobby stehen, drückt der Gastgeber **Spiel starten**. „Freie Plätze mit Bots füllen“ kann ausgeschaltet werden.

Für einen Test auf einem einzigen Computer das zweite Spiel in einem privaten Browserfenster öffnen. Die Spielseite muss auf beiden Geräten geladen bleiben. Der Gastgeber führt die Partie aus; wenn er die Seite verlässt oder sein Gerät die Seite im Hintergrund anhält, muss eine neue Partie begonnen werden.

**Online → Offenes Spiel erstellen** macht eine wartende Lobby in der Liste sichtbar. **Schnellspiel** tritt einer offenen Lobby bei oder erstellt eine neue. Angezeigte Lobbys sind echte Räume auf dieser WordPress-Website.

## Wenn die Bereit-Meldung fehlt

- Plugin aktivieren und WP-Rocket-Cache leeren.
- Falls „JavaScript-Ausführung verzögern“ aktiv ist, `kegel-krach-online` in die Ausnahmen aufnehmen. Das Plugin setzt zusätzlich das WP-Rocket-Ausschlussattribut.
- Die WordPress-REST-API darf durch ein Sicherheitsplugin nicht für `/kegel-krach/v1/rooms` blockiert sein.
- PHP 7.4 oder neuer, eine WordPress-Datenbank mit InnoDB und ein Theme, das `wp_footer` aufruft, werden benötigt.

## Technik und Grenzen

- Kleine POST-Anfragen synchronisieren Nachrichten ungefähr einmal pro Sekunde. Der Endpunkt liefert `Cache-Control: no-store`.
- Vier Spieler pro Lobby, zufälliger vierstelliger Code und ein geheimer Sitzungsschlüssel je Teilnehmer. Nur ein Hash des Schlüssels liegt in der Datenbank. Die Schlüssel werden nicht an Mitspieler verteilt.
- Nur der Gastgeber darf Spielstände und Würfelergebnisse senden. Aktionen und Chat werden auf dem Server an die authentifizierte Spielerkennung gebunden. Die Spielregeln werden wie bisher im Browser des Gastgebers geprüft. Das ist für private Freizeitpartien ausgelegt, nicht für manipulationssichere Turniere oder Einsätze.
- InnoDB-Transaktionen mit Zeilensperren schützen parallele Lobby-Änderungen. Die letzten 256 Nachrichten werden für kurze Unterbrechungen aufbewahrt. Ein abgelaufener Nachrichten-Cursor zeigt einen Fehler statt einen falschen Spielstand.
- Der Gastgeber muss mindestens alle 90 Sekunden verbunden bleiben. Ein Neuladen setzt die Partie nicht fort. Verlassene Gastplätze können in dieser Version nicht neu besetzt werden.
- Ein stündlicher WordPress-Cron-Lauf entfernt Räume ohne Aktivität seit zwei Stunden. Deaktivieren des Plugins stoppt diesen Aufräumauftrag.
- Die API speichert Namen, Figurenwahl und Spielnachrichten vorübergehend in einer eigenen WordPress-Tabelle. Es werden keine Daten an externe Spielserver geschickt.
- Bei vielen gleichzeitig laufenden Partien muss die Leistungsfähigkeit des WordPress-Hostings geprüft werden. Es ist ein Abfrageverfahren, kein WebSocket-Server.

## Prüfungen

`tests/server.php` prüft die PHP-Endpunkte mit einer WordPress-/Datenbank-Testumgebung: Lobby, Mitgliedschaft, geheime Schlüssel, öffentliche/private Räume, Spielstart, Spielzüge, Chat, Kapazität und Verbindungsabbruch. Diese Tests ersetzen keinen Test auf dem tatsächlichen WordPress-Hosting.

Ein Test auf digitalwohnen.at mit zwei Geräten ist nach dem Installieren noch erforderlich.

Für Entwickler: Mit Node.js 24.18 oder neuer `npm install`, `npm run check`, `npm run test:server` und `npm run test:client -- /absoluter/Pfad/Kegel-Krach.html` ausführen. Der Clienttest startet zwei getrennte DOM-Umgebungen mit dem ursprünglichen Spielcode und einem gemeinsamen Testtransport. Grafik und Animationen werden dabei ausgelassen. Der PHP-Test verwendet eine simulierte WordPress-Datenbank und prüft nicht die tatsächlichen InnoDB-Sperren.

Das Plugin kann jederzeit über **Plugins → Deaktivieren** abgeschaltet werden; der bisherige Bot-Modus bleibt davon unabhängig.
