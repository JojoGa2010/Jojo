# AER — FPV Playground

Ein eigenständiges 3D-Drohnenspiel für Desktop und Laptop. Kostenlos, ohne Konto, ohne Installation und ohne externe Bibliotheken. Alle Grafiken entstehen direkt im Browser. Keine Netzwerkzugriffe, keine kostenpflichtigen Dienste.

## So startest du

1. ZIP-Datei entpacken.
2. Den Ordner `drone-game` öffnen.
3. **index.html doppelklicken**. Die beiden Dateien `game.js` und `style.css` müssen daneben liegen bleiben.
4. Im Browser **Abheben**, dann **Los geht’s** anklicken.

Verwende einen aktuellen Browser mit WebGL und aktivierter Hardwarebeschleunigung (Safari, Chrome, Edge oder Firefox). Eine Tastatur ist erforderlich; es gibt keine Touchsteuerung.

Falls dein Browser lokale Dateien einschränkt: Im Spielordner `python3 -m http.server 8080` ausführen und http://localhost:8080 öffnen. Beenden mit Strg+C. Python wird nur für diese alternative Startmöglichkeit benötigt.

## Steuerung

| Taste | Funktion |
|---|---|
| W / S | Vorwärts / rückwärts |
| A / D | Seitwärts links / rechts |
| Pfeil links / rechts | Drehen |
| Pfeil oben / unten | Steigen / sinken |
| E / Q | Alternativ steigen / sinken |
| Umschalt halten | Sportmodus: bis ca. 112 km/h |
| M | Sportmodus dauerhaft ein-/ausschalten |
| P / Escape | Pause / weiter |
| R | Neue Runde |

Die Drohne hält automatisch ihre Höhe und bremst beim Loslassen ab. Das ist eine zugängliche Arcade-Steuerung, keine vollständige Simulation einer echten Renndrohne.

## Ziel

Fliege durch alle zehn Tore in ihrer Reihenfolge, jeweils von der Anflugseite. Das nächste Tor ist limettengrün, die übrigen sind türkis. Folge dem Richtungshinweis und der Karte. Der Anflug startet geradeaus: Für Tor 1 zunächst W halten.

Hindernisse, Bäume, Boden und Torränder haben Kollisionen. Nach einer Kollision wird die Drohne hinter das letzte geschaffte Tor zurückgesetzt; die Runde erhält drei Strafsekunden. Flughöhe: 0,8 bis 110 Meter; das Trainingsgebiet ist begrenzt. Auch das Verlassen dieses Bereichs setzt die Drohne zurück. Du kannst die Landschaft frei erkunden; es gibt kein Zeitlimit.

Die Gesamtzeit inklusive Strafsekunden und die persönliche Bestzeit erscheinen im Spiel. Die Bestzeit wird nur lokal im jeweiligen Browser gespeichert, soweit dieser es erlaubt. Bei lokalen Dateien kann sich die Speicherung je nach Browser unterscheiden. Beim Wechsel zu einem anderen Fenster pausiert das Spiel automatisch.

## Dateien und Technik

- `index.html`: Oberfläche und Steuerungshilfe
- `style.css`: Gestaltung
- `game.js`: eigene WebGL-3D-Darstellung, Flugbewegung, Kollisionen, Tore, Karte, Zeitmessung

Keine Build-Schritte, npm-Pakete, Schriftendienste oder Bilddownloads. Die Dateien können unverändert auf einem statischen Webhost wie GitHub Pages bereitgestellt werden. Dieser Download allein aktiviert kein Online-Hosting.

## Prüfung dieser Version

Im Browser geprüft: 3D-Startansicht, Startdialog, Vorwärtsflug durch das erste Tor, Sportmodus, Höhenänderung und Pause. Zusätzlich automatisiert geprüft: alle zehn Torübergänge, Höchstgeschwindigkeit im Sportmodus, Hinderniskollision mit Strafzeit, Rennabschluss, lokale Bestzeit und Neustart. Eine komplette Rennrunde wurde nicht manuell durchgeflogen; andere Browser und mobile Geräte wurden nicht separat getestet.
