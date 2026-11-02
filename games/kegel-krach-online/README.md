# Kegel-Krach Online 2.0 für WordPress

## Update installieren

1. **Kegel-Krach-Online-v2.0.zip** herunterladen und nicht entpacken.
2. WordPress: **Plugins → Neues Plugin hinzufügen → Plugin hochladen**.
3. ZIP auswählen und **Aktuelles durch hochgeladenes ersetzen** bestätigen.
4. Falls nötig Plugin aktivieren, **WP-Rocket-Cache leeren** und die Spielseite auf allen Geräten neu laden.

Den bestehenden Spielcode in Elementor stehen lassen. Laufende Partien vor dem Update beenden.

## Neu in 2.0

- Beim Schlagen holt der Kegel mit dem Unterkörper aus und stößt in Richtung des Gegners. Erst beim Kontakt fliegt der getroffene Kegel zurück ins Haus. Gilt auf beiden Brettarten.
- Bots antworten auf menschliche Chatnachrichten, auch in Online-Partien. Grüße, Fragen zum Spiel und kurze Spaßnachrichten erhalten passende Antworten aus lokalen Dialogregeln; es wird kein externer KI-Dienst verwendet. Pro Nachricht antwortet ein Bot, mit kurzer Verzögerung. Nur der aktuelle Admin verteilt Bot-Antworten; der Server verhindert, dass andere Spieler Bot-Nachrichten vortäuschen.
- Wenn genau ein legaler Zug möglich ist, zieht das Spiel nach kurzer Pause automatisch. Bei mehreren Möglichkeiten bleibt die direkte Figurenauswahl. Veraltete automatische Züge werden beim Wechsel von Phase, Partie oder Verbindung verworfen.

Geprüft: Kontakt vor Wegflug, Kick in acht Richtungen, beide Brettarten, Bot-Antworten zwischen zwei Online-Clients, Berechtigungen am Server, automatische Einzelzüge und Abbruch veralteter Timer. Entwickler: `npm run test:behaviors -- /absoluter/Pfad/Kegel-Krach.html /absoluter/Ausgabeordner`.

## Neu in 1.9: beweglicher Kopf und Körper

Während einer Partie bewegen sich Kopf, Oberkörper und Unterkörper der Kegel unabhängig voneinander: Der Kopf dreht und nickt, der Oberkörper atmet/wippt, und der Unterkörper balanciert am festen Fußpunkt. Beim Springen und Schlagen ist die Bewegung etwas lebhafter. Hüte und Kopfschmuck folgen dem Kopf; die Körperteile bleiben verbunden.

Die Animation verformt die bestehenden Skin-Zeichnungen und funktioniert mit allen 30 Skins auf dem ursprünglichen und dem Sechserbrett. Im Auswahlmenü bleiben die bisherigen Vorschauen erhalten. Die Bewegung ist rein lokal und kosmetisch; Positionen, Würfelergebnisse, Regeln und Online-Spielstände ändern sich dadurch nicht.

Bei aktivierter Systemeinstellung **Bewegung reduzieren** wird die neue Gelenkanimation ausgeschaltet. Ein begrenzter Sprite-Cache hält den Speicherverbrauch klein. Eine kleine Vorschau-GIF zeigt mehrere Bewegungsphasen.

Zusätzliche Prüfungen: unabhängige Gelenkwinkel, verankerter Fußpunkt, keine umgefalteten Flächen, Rendering aller 30 Skins, unveränderte Menü-Vorschauen und Spielstände, ruhende Figuren bei reduzierter Bewegung sowie erfolgreiche Figurtreffer in mehreren Bewegungsphasen auf beiden Brettarten. Entwickler: `npm run test:animation -- /absoluter/Pfad/Kegel-Krach.html /absoluter/Ausgabeordner`.

## Weiterhin enthalten: Version 1.8

Die Kerzen am 1./2. November stammten vom Allerheiligen-/Allerseelen-Extra. Diese beiden Extras sind entfernt. Auch die ursprünglichen Partikel werden beim Laden unmittelbar auf die saisonalen Elemente gesetzt, sodass keine November-Kerzen übernommen werden.

Es gibt **20 zusätzliche Skins, insgesamt 30**. Neu sind Feuerwehr, Polizei, Koch, Cowboy, Ritter, Doktor, Detektiv, Gärtner, Kapitän, Rennfahrer, Musiker, Maler, Samurai, Roboter, Taucher, Pharao, Punk, Elf, Biene und Bergsteiger.

Klassik, Tonne, Spitzi, Boss, Pilot, Wikinger, Pirat, Zauberer, Ninja und Astronaut bleiben erhalten. Die ursprünglichen vier Skins sind pixelgenau unverändert. Neue Skins funktionieren in privaten, öffentlichen und Bot-Partien; die Auswahl wird lokal gespeichert. Auch Bots können alle 30 Skins verwenden. Die Teamfarbe bleibt unabhängig vom Skin erkennbar.

## Spiel und Bedienung

- Zwei bis sechs Spieler mit je vier Kegeln. Für zwei bis vier bleibt das ursprüngliche Brett erhalten. Fünf/sechs verwenden sechs Startbereiche und eine gemeinsame 60-Felder-Runde im gleichen Holz-/Farbstil, mit vier Zielfeldern je Team. Lila und Orange ergänzen die ursprünglichen Teamfarben.
- Solo sind bis zu fünf Bots möglich. In Online-Lobbys kann der Admin Bots auf insgesamt zwei bis sechs Spieler auffüllen lassen; Standard ist vier.
- Gewürfelt wird am großen animierten Würfel, durch Antippen oder per Enter/Leertaste. Bei mehreren erlaubten Zügen werden Figuren direkt auf dem Brett angetippt. Ein einzelner erlaubter Zug wird automatisch ausgeführt. Es gibt keine zusätzlichen Würfel-/Figurknöpfe. Zielfeld-Tipps und Wischbewegungen führen keinen Zug aus.
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
