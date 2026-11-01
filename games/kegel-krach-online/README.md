# Kegel-Krach Online 1.6 für WordPress

## Update installieren

1. **Kegel-Krach-Online-v1.6.zip** herunterladen und nicht entpacken.
2. WordPress: **Plugins → Neues Plugin hinzufügen → Plugin hochladen**.
3. ZIP auswählen und **Aktuelles durch hochgeladenes ersetzen** bestätigen.
4. Falls nötig Plugin aktivieren, **WP-Rocket-Cache leeren** und die Spielseite auf allen Geräten neu laden.

Den bestehenden Spielcode in Elementor stehen lassen. Laufende Partien vor dem Update beenden.

## Neu in Version 1.6

Ein Kick sperrt nicht nur die Sitzung auf dem Server: Die entfernte Person wird aus der Lobby-Ansicht ins Spielmenü zurückgeschickt. Dort steht dauerhaft **„Du wurdest vom Admin aus der Gruppe entfernt. Du bist nicht mehr in dieser Lobby.“** bis sie **Verstanden** wählt oder eine neue Lobby öffnet. Alte Nachrichten/Antworten einer bereits geschlossenen Verbindung verändern keine neu eröffnete Lobby.

Jeder Monat erhält einen eigenen Hintergrund mit Muster, passende Menükarten, Akzentfarben, Dialogfarben und ein eigenes Brett-Farbschema. Die Teamfarben und ursprünglichen Kegel bleiben erhalten. Im Menü steht die aktuelle Monatsausgabe.

| Monat | Gestaltung |
| --- | --- |
| Januar | Eiskristalle, Eisblau |
| Februar | Violetter Winterabend |
| März | Erstes Grün |
| April | Kühler Frühlingsregen |
| Mai | Blütenwiese |
| Juni | Sommer am Wasser |
| Juli | Warme Sonnentage |
| August | Spätsommer in Terrakotta |
| September | Erntezeit |
| Oktober | Goldener Herbst |
| November | Nebel und Kupfer |
| Dezember | Festlicher Winter |

Die fallenden Elemente richten sich unabhängig davon nach der Jahreszeit: **Dezember–Februar Schnee/Eiskristalle**, **März–Mai Blüten**, **Juni–August goldene Licht-/Pollenpartikel**, **September–November Herbstblätter**. Während des Spiels sind sie dezenter und fangen keine Eingaben ab. Bei aktivierter Systemeinstellung für reduzierte Bewegung werden sie ausgeblendet.

Die Datumswahl verwendet den Kalender des Geräts. Ein offenes Spiel prüft jede Minute und bei Rückkehr zum Browser, ob ein neuer Monat begonnen hat. Es ist kein monatliches Plugin-Update erforderlich. Die Advent-Ausnahme des ursprünglichen HTML wird durch das echte Dezember-/Novemberdesign ersetzt.

Zusätzlich geprüft: alle zwölf unterschiedlichen Hintergrund- und Brett-Paletten, Jahreszeitengrenzen, unveränderte Figuren/Teamfarben und tatsächliche Rückkehr der gekickten Person ins Menü mit quittierbarer Meldung. Entwickler: `npm run test:themes -- /absoluter/Pfad/Kegel-Krach.html`.

## Weiterhin enthalten: Änderungen aus 1.5

- Die ursprünglichen Kegel, Figurenzeichnung, Beschriftungen und Kamera sind wieder aktiv. Das Plugin ersetzt die Zeichenfunktionen nicht mehr.
- Gewürfelt wird auf Handy und Computer wieder durch Antippen des großen animierten Würfels. Er ist zusätzlich per Enter oder Leertaste bedienbar.
- Die zusätzlichen Würfel- und Figurknöpfe wurden vollständig entfernt.
- Eine Figur wird nur durch direktes Antippen auf dem Brett bewegt. Auch bei genau einem erlaubten Zug erfolgt keine automatische Bewegung. Ein Tippen auf ein leeres Zielfeld oder ein Wischen löst keinen Zug aus.
- Eine kleine Stoppuhr neben der Zuganzeige läuft ab Spielbeginn, stoppt am Partieende und beginnt bei einer neuen Partie wieder bei 00:00. Sie zeigt die lokale verstrichene Spielzeit, inklusive Wartezeiten; es gibt keine Zugzeitbegrenzung.
- Das Logo ist eine eigens gezeichnete SVG-Kegel-Marke ohne Emoji. Logo und Überschriften führen weiterhin zur Website-Startseite.
- Der Handy-Chat bleibt einklappbar; das Brett nutzt den frei gewordenen Platz. Kleine Würfel der Mitspieler berücksichtigen den versetzten Handy-Spielbereich.

## Online spielen

Gerät A: **Mit Freunden → Namen eingeben → Private Lobby erstellen**. Gerät B öffnet dieselbe Seite und tritt mit dem vierstelligen Code bei. Sobald beide Namen angezeigt werden, startet der Admin die Partie. Freie Plätze lassen sich mit Bots füllen. **Online → Offenes Spiel erstellen** zeigt eine echte wartende Lobby in der öffentlichen Liste. **Schnellspiel** tritt einer offenen Lobby bei oder erstellt eine neue.

**Zurück** verlässt die wartende Lobby und führt ins Spielmenü. Der Admin kann andere Spieler vor dem Spielstart über **Aus Lobby entfernen** kicken. Die Sitzung verliert ihren Zugriff; dies ist kein dauerhafter Identitäts-Bann und ein erneuter Beitritt mit dem Code ist möglich.

## Admin-Wechsel

Nach 60 Sekunden ohne menschliche Eingabe oder ohne Verbindung verliert der Admin seine Rolle. Ein zufälliger verbundener Mitspieler bekommt 20 Sekunden Zeit, ausdrücklich zu übernehmen. Ablehnung oder Zeitablauf fragt einen anderen verbundenen Spieler. Wenn niemand übernimmt, bleibt die Partie pausiert und jeder kann zum Menü zurückkehren.

Bei Annahme wird der zuletzt auf dem Server gespeicherte Stand übernommen; Figuren des ausgeschiedenen Admins werden zu Bots. Der frühere Admin kann mit seiner alten Sitzung nicht mehr eingreifen. Ein Neuladen stellt die eigene Sitzung nicht wieder her.

## Logo und Startseite

Das dauerhaft sichtbare Kegel-Krach-Logo, die Überschriften und der Admin-Dialog verlinken die WordPress-Website-Startseite (`home_url`). Auch reguläre WordPress-Logos werden auf allen Seiten auf diese Adresse gesetzt. Vor Navigation wird die Online-Lobby nach Möglichkeit verlassen; ein Verbindungsproblem blockiert die Navigation höchstens 1,2 Sekunden.

## Voraussetzungen und Fehlerbehebung

PHP 7.4 oder neuer, InnoDB-Datenbank, WordPress-REST-API und ein Theme mit `wp_footer` werden benötigt. Nach jedem Update den Cache leeren. Falls WP Rocket JavaScript verzögert, `kegel-krach-online` in die Ausnahmen aufnehmen. Eine Sicherheits-Erweiterung darf `/kegel-krach/v1/rooms` nicht blockieren.

Spielregeln und Bots laufen weiterhin im Browser des Admins. Der WordPress-Server authentifiziert Teilnehmer, bindet Aktionen und Chat an Sitzungsschlüssel und erlaubt nur dem Admin, Ergebnisse zu verteilen. Das ist für private Freizeitpartien ausgelegt, nicht für manipulationssichere Turniere oder Einsätze.

Die Synchronisierung fragt ungefähr einmal pro Sekunde ab. Viele gleichzeitige Partien benötigen entsprechend leistungsfähiges Hosting. Namen und Spielnachrichten liegen vorübergehend in einer eigenen Datenbanktabelle. Ein stündlicher WordPress-Cron-Lauf entfernt seit zwei Stunden inaktive Räume. Keine Übertragung an externe Spielserver.

## Prüfungen für Entwickler

Node.js 24.18 oder neuer: `npm install`, `npm run check`, `npm run test:server`, `npm run test:client -- /absoluter/Pfad/Kegel-Krach.html`, `KK_MOBILE=1 npm run test:client -- /absoluter/Pfad/Kegel-Krach.html` und `npm run test:visuals -- /absoluter/Pfad/Kegel-Krach.html /absoluter/Ausgabeordner`.

Geprüft: Lobby, Start/Züge/Chat mit zwei getrennten Original-Spielclients, Rollenwechsel und Kick-Rechte, Rückkehr der ursprünglichen Zeichenfunktionen, direkter Figurtreffer statt Zielfeldtreffer, Wischschutz, Würfel-Klick, manuelle Einzelzüge, Stoppuhr Start/Stopp/Neustart, SVG-Logo und WordPress-Assets. Lokale Browser-Vorschauen ergänzen die automatischen Tests.

Nicht geprüft: tatsächliche InnoDB-Sperren, das Live-Hosting und echte Mobilgeräte/Bildschirmtastaturen. Nach Installation einen Test mit zwei Geräten durchführen.
