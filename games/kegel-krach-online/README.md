# Kegel-Krach Online 1.8 für WordPress

## Update installieren

1. **Kegel-Krach-Online-v1.8.zip** herunterladen und nicht entpacken.
2. WordPress: **Plugins → Neues Plugin hinzufügen → Plugin hochladen**.
3. ZIP auswählen und **Aktuelles durch hochgeladenes ersetzen** bestätigen.
4. Falls nötig Plugin aktivieren, **WP-Rocket-Cache leeren** und die Spielseite auf allen Geräten neu laden.

Den bestehenden Spielcode in Elementor stehen lassen. Laufende Partien vor dem Update beenden.

## Neu in 1.8

Die Kerzen am 1./2. November stammten vom Allerheiligen-/Allerseelen-Extra. Diese beiden Extras sind entfernt. Auch die ursprünglichen Partikel werden beim Laden unmittelbar auf die saisonalen Elemente gesetzt, sodass keine November-Kerzen übernommen werden.

Es gibt **20 zusätzliche Skins, insgesamt 30**. Neu sind Feuerwehr, Polizei, Koch, Cowboy, Ritter, Doktor, Detektiv, Gärtner, Kapitän, Rennfahrer, Musiker, Maler, Samurai, Roboter, Taucher, Pharao, Punk, Elf, Biene und Bergsteiger.

Klassik, Tonne, Spitzi, Boss, Pilot, Wikinger, Pirat, Zauberer, Ninja und Astronaut bleiben erhalten. Die ursprünglichen vier Skins sind pixelgenau unverändert. Neue Skins funktionieren in privaten, öffentlichen und Bot-Partien; die Auswahl wird lokal gespeichert. Auch Bots können alle 30 Skins verwenden. Die Teamfarbe bleibt unabhängig vom Skin erkennbar.

## Spiel und Bedienung

- Zwei bis sechs Spieler mit je vier Kegeln. Für zwei bis vier bleibt das ursprüngliche Brett erhalten. Fünf/sechs verwenden sechs Startbereiche und eine gemeinsame 60-Felder-Runde im gleichen Holz-/Farbstil, mit vier Zielfeldern je Team. Lila und Orange ergänzen die ursprünglichen Teamfarben.
- Solo sind bis zu fünf Bots möglich. In Online-Lobbys kann der Admin Bots auf insgesamt zwei bis sechs Spieler auffüllen lassen; Standard ist vier.
- Gewürfelt wird am großen animierten Würfel, durch Antippen oder per Enter/Leertaste. Figuren werden direkt auf dem Brett angetippt, auch bei nur einem erlaubten Zug. Es gibt keine zusätzlichen Würfel-/Figurknöpfe. Zielfeld-Tipps und Wischbewegungen führen keinen Zug aus.
- Eine kleine Stoppuhr läuft ab Spielbeginn, stoppt am Partieende und beginnt bei der nächsten Partie bei 00:00. Sie zeigt die lokale verstrichene Spielzeit inklusive Wartezeiten; keine Zugzeitbegrenzung.
- Der Handy-Chat ist einklappbar. Das eigene SVG-Logo führt zur **Start-Lobby des Spiels** (`/spiel/`), auch aus einer laufenden Partie. Eine Online-Lobby wird nach Möglichkeit vorher verlassen; Verbindungsprobleme blockieren die Navigation höchstens 1,2 Sekunden.

## Lobbys und Admin

Gerät A erstellt unter **Mit Freunden** eine private Lobby. Gerät B öffnet dieselbe Seite und tritt mit dem vierstelligen Code bei. Danach startet der Admin die Partie. Offene Spiele erscheinen unter **Online**; Schnellspiel tritt einer offenen Lobby bei oder erstellt eine neue.

**Zurück** verlässt die wartende Lobby und führt ins Spielmenü. Vor dem Start kann der Admin andere Spieler entfernen. Die gekickte Person verliert ihren Zugriff, wird ins Spielmenü geschickt und erhält eine Meldung zum Bestätigen. Das ist kein dauerhafter Identitäts-Bann; ein erneuter Beitritt mit dem Code ist möglich.

Nach 60 Sekunden ohne menschliche Eingabe oder Verbindung verliert der Admin seine Rolle. Ein zufälliger verbundener Mitspieler erhält 20 Sekunden zur ausdrücklichen Übernahme. Bei Ablehnung oder Zeitablauf wird jemand anderes gefragt. Wenn niemand übernimmt, bleibt die Partie pausiert und jeder kann ins Menü zurückkehren. Bei Annahme wird der gespeicherte Stand übernommen; Figuren des ausgeschiedenen Admins werden Bots. Ein Neuladen stellt die eigene Sitzung nicht wieder her.

## Monatsgestaltung und Festtags-Extras

Jeder Monat besitzt eigene Hintergründe/Muster, Menükarten, Akzent-, Dialog- und Brettfarben. Monat oder Design werden nicht ausgeschrieben. Schnee im Winter, Blüten im Frühling, goldene Licht-/Pollenpartikel im Sommer und Blätter im Herbst bleiben dezent und fangen keine Eingaben ab. Bei reduzierter Bewegung werden sie ausgeblendet.

Grafische Extras gelten nur am jeweiligen lokalen Kalendertag. Enthalten sind Neujahr, Dreikönigstag, Valentinstag, Ostersonntag/-montag, 1. Mai, Pfingstsonntag/-montag, österreichischer Nationalfeiertag, Halloween, Nikolaus, Weihnachtsabend, Weihnachten, 26. Dezember und Silvester. Tages-/Jahresvarianten wechseln. Um Mitternacht und bei Rückkehr in den Browser werden die Extras aktualisiert oder entfernt. Die Monatsgestaltung bleibt dabei erhalten.

Ostern und Pfingsten werden für den gregorianischen Kalender jährlich berechnet. Testdaten: [US Census Bureau](https://www.census.gov/data/software/x13as/genhol/easter-dates.html). Es wird der Kalender des Geräts verwendet; kein jährliches Plugin-Update notwendig.

## Voraussetzungen und Grenzen

PHP 7.4 oder neuer, eine InnoDB-Datenbank, die WordPress-REST-API und ein Theme mit `wp_footer` werden benötigt. Falls WP Rocket JavaScript verzögert, `kegel-krach-online` in die Ausnahmen aufnehmen. Sicherheitsplugins dürfen `/kegel-krach/v1/rooms` nicht blockieren.

Regeln und Bots laufen weiterhin im Browser des Admins. Der Server authentifiziert Teilnehmer und bindet Aktionen/Chat an Sitzungsschlüssel. Nur der Admin kann Ergebnisse verteilen. Für Freizeitpartien, nicht für manipulationssichere Turniere oder Einsätze. Viele gleichzeitige Partien benötigen entsprechend leistungsfähiges Hosting, da die Synchronisierung etwa einmal pro Sekunde abfragt.

Namen und Spielnachrichten liegen vorübergehend in einer eigenen Datenbanktabelle. Ein stündlicher Cron-Lauf entfernt seit zwei Stunden inaktive Räume. Keine Übertragung an externe Spielserver.

## Prüfungen für Entwickler

Node.js 24.18 oder neuer: `npm install`, `npm run check`, `npm run test:server`, `npm run test:client -- /absoluter/Pfad/Kegel-Krach.html`, `KK_MOBILE=1 npm run test:client -- /absoluter/Pfad/Kegel-Krach.html`, `npm run test:visuals -- /absoluter/Pfad/Kegel-Krach.html /absoluter/Ausgabeordner`, `npm run test:players -- /absoluter/Pfad/Kegel-Krach.html /absoluter/Ausgabeordner`, `npm run test:themes -- /absoluter/Pfad/Kegel-Krach.html`.

Geprüft: 30 auswählbare/gerenderte Skins, direkter Treffer jeder neuen Figur, sechs getrennte Clients mit Skins 24–29 bei identischen Spielständen, Server-Speicherung bis Skin 29, Sechser-Regeln und ursprüngliche Skins, Uhr/Logo/Kick/Admin-Wechsel, alle Monats-/Festtagsgrenzen und fehlende November-Kerzen. Lokale Browser-Prüfung der Skin-Auswahl und November-Dekoration ergänzt die automatischen Tests.

Nicht geprüft: das Live-Hosting, tatsächliche InnoDB-Sperren, echte Mobilgeräte und Bildschirmtastaturen. Nach Installation mit zwei Geräten testen.
