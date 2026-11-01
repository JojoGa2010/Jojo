# Kegel-Krach Online für WordPress

## Update auf Version 1.3

Die neue ZIP-Datei über **Plugins → Neues Plugin hinzufügen → Plugin hochladen** hochladen. WordPress zeigt die vorhandene Version an: **Aktuelles durch hochgeladenes ersetzen** wählen. Danach den WP-Rocket-Cache leeren und die Spielseite auf allen Geräten neu laden. Bestehende Partien vor dem Update beenden. Der Elementor-Spielcode bleibt unverändert.

## Neu in Version 1.3

Die Figuren sind größer und plastischer gezeichnet: mit Farbverläufen, Lichtkanten, Bodenschatten, deutlicheren Augen und ausgearbeiteten Hüten. Nummern 1–4 unterscheiden die eigenen Figuren. Spielernamen stehen gesammelt im Startbereich statt über jeder einzelnen Figur. Die Auswahl-, Lobby- und Menü-Vorschauen berücksichtigen die Bildschirmauflösung.

Die Kamera lässt mehr Platz für hohe Hüte am oberen Rand. Die Figuren bleiben in geneigten Ansichten aufrecht. Klickkoordinaten und Kameraprojektion verwenden dieselbe neue Einrahmung. Es handelt sich weiterhin um die Canvas-Darstellung mit plastischer Schattierung; es wird keine WebGL-Engine benötigt.

Zusätzliche Prüfungen: alle 16 Farb-/Figurenkombinationen, normales und geneigtes Brett, springende Figuren und korrektes Anklicken in der geneigten Ansicht. Renderbilder wurden lokal visuell geprüft. Die Darstellung auf echten Smartphones und auf dem Live-Hosting muss nach dem Update geprüft werden. Entwickler können `npm run test:visuals -- /absoluter/Pfad/Kegel-Krach.html /absoluter/Ausgabeordner` ausführen.

## Neu in Version 1.2

Die wartende Lobby wird nur bei geänderter Mitgliedschaft oder Admin-Rolle neu aufgebaut. Leere Plätze pulsieren nicht mehr. Dadurch bleiben Anzeige und Knöpfe während des Wartens stabil.

Der Admin sieht bei anderen Spielern **Aus Lobby entfernen**. Dies funktioniert in privaten und offenen Lobbys vor dem Spielstart. Der Platz wird sofort frei und die entfernte Sitzung erhält die Meldung **„Der Admin hat dich aus der Lobby entfernt.“**. Gäste können niemanden entfernen; der Admin kann sich über **Zurück** selbst abmelden. Ein Kick ist kein dauerhafter Identitäts-Bann: Die Person kann erneut mit dem Code beitreten.

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

Für einen Test auf einem einzigen Computer das zweite Spiel in einem privaten Browserfenster öffnen. In privaten und offenen Lobbys führt **← Zurück** zum Menü und meldet den Spieler von der Lobby ab. Verlässt der Admin die Lobby über diesen Knopf, beginnt die Übernahme sofort.

Nach **60 Sekunden ohne Eingabe** (Mausbewegung, Tippen, Berührung) oder ohne Serververbindung verliert der Admin seine Rolle. Die Meldung **„Admin hat das Spiel verlassen“** erscheint. Ein zufällig ausgewählter Mitspieler, der in den letzten 20 Sekunden verbunden war, wird gefragt, ob er Admin sein möchte. Er hat 20 Sekunden für **Ja, ich übernehme** oder **Nein, danke**. Bei Ablehnung oder Fristablauf wird ein anderer verbundener Mitspieler gefragt. Wenn niemand übernimmt, bleibt das Spiel pausiert und jeder kann zum Menü zurückkehren.

Bei einer laufenden Partie wird der zuletzt auf dem Server gespeicherte Spielstand übernommen. Ein Bot spielt die Figuren des ausgeschiedenen Admins weiter. Der ausgeschiedene Admin kann mit seiner alten Sitzung nicht mehr eingreifen. Die neue Rolle wird erst nach ausdrücklicher Zustimmung vergeben.

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
- Ein Neuladen setzt die eigene Sitzung nicht fort. Verlassene Gastplätze in einer wartenden Lobby werden wieder frei. Eine laufende Partie bleibt auf ihre ursprünglichen Figurenplätze beschränkt; ausgeschiedene Figuren werden zu Bots.
- Admin-Wechsel werden auf dem Server unter einer Zeilensperre entschieden. Eine Versionsnummer je Admin-Generation verhindert, dass alte Admin-Ereignisse den übernommenen Spielstand überschreiben. Automatische Spielanimationen und Bot-Züge zählen nicht als menschliche Eingabe.
- Ein stündlicher WordPress-Cron-Lauf entfernt Räume ohne Aktivität seit zwei Stunden. Deaktivieren des Plugins stoppt diesen Aufräumauftrag.
- Die API speichert Namen, Figurenwahl und Spielnachrichten vorübergehend in einer eigenen WordPress-Tabelle. Es werden keine Daten an externe Spielserver geschickt.
- Bei vielen gleichzeitig laufenden Partien muss die Leistungsfähigkeit des WordPress-Hostings geprüft werden. Es ist ein Abfrageverfahren, kein WebSocket-Server.

## Prüfungen

`tests/server.php` prüft die PHP-Endpunkte mit einer WordPress-/Datenbank-Testumgebung: Lobby, Mitgliedschaft, geheime Schlüssel, öffentliche/private Räume, Spielstart, Spielzüge, Chat, Kapazität sowie die 59-/60-Sekunden-Grenze, Annahme/Ablehnung einer Übernahme, abgelaufene Angebote, entzogene Admin-Rechte und Lobby-Austritt. Diese Tests ersetzen keinen Test auf dem tatsächlichen WordPress-Hosting.

Ein Test auf digitalwohnen.at mit zwei Geräten ist nach dem Installieren noch erforderlich.

Für Entwickler: Mit Node.js 24.18 oder neuer `npm install`, `npm run check`, `npm run test:server` und `npm run test:client -- /absoluter/Pfad/Kegel-Krach.html` ausführen. Der Clienttest startet zwei getrennte DOM-Umgebungen mit dem ursprünglichen Spielcode und einem gemeinsamen Testtransport. Grafik und Animationen werden dabei ausgelassen. Der PHP-Test verwendet eine simulierte WordPress-Datenbank und prüft nicht die tatsächlichen InnoDB-Sperren.

Das Plugin kann jederzeit über **Plugins → Deaktivieren** abgeschaltet werden; der bisherige Bot-Modus bleibt davon unabhängig.
