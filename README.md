# Wortklar

Eigenständiger SwiftUI-Prototyp für Mac, iPhone und iPad. Keine QuillBot-Logos, keine kopierte Oberfläche und keine Verbindung zu QuillBot.

## Sofort in Xcode starten

1. Öffne den Ordner **Wortklar**. Falls du eine ZIP-Datei heruntergeladen hast: zuerst doppelklicken, um sie zu entpacken.
2. Doppelklicke **Wortklar.xcodeproj**. Du musst kein neues Xcode-Projekt erstellen und keinen Code kopieren.
3. Wähle oben in Xcode das Projekt **Wortklar** und daneben **My Mac**. Das ist für den ersten Versuch am einfachsten.
4. Klicke oben links auf das Dreieck **▶** oder drücke **⌘R**.
6. Probiere **Kopieren** und **Verlauf**. Ein Klick auf einen Verlaufseintrag stellt den gespeicherten Text wieder her.

Voraussetzung: **Xcode 26 oder neuer**, **macOS 26** für die Mac-App beziehungsweise **iOS/iPadOS 26** für die mobile App. Geprüft mit Xcode 26.6.

## Eingabefeld und Tastatur

Auf dem Mac startet **Enter** die Bearbeitung im ausgewählten Modus. **Umschalt (⇧) + Enter** fügt eine neue Zeile ein. Leere Eingaben und Eingaben über 3.000 Zeichen werden nicht verarbeitet. Während einer Bearbeitung bleibt die Eingabe gesperrt.

Das Textfeld verwendet 17-Punkt-Systemschrift, mehr Zeilenabstand und einen dezenten Rahmen. Die überlagerte Platzhalterschrift wurde durch einen Hinweis unter dem Feld ersetzt.

Auf iPhone/iPad bleibt die Bildschirmtastatur für mehrzeilige Eingaben verfügbar; die Bearbeitung lässt sich über den Knopf starten. Die Enter-Kurzbefehle sind dort für eine externe Tastatur vorgesehen und noch nicht am Gerät geprüft.

## Eigene Texte bearbeiten

Gib deinen Text ein, wähle einen Modus und klicke **Text bearbeiten** oder drücke auf dem Mac **Enter**.


- Verbessern: Klarheit, Lesefluss und Grammatik.
- Rechtschreibung: Schreibweise, Grammatik und Zeichensetzung.
- Professionell: sachlicher und höflicher Ton.
- Kürzen: wesentliche Aussagen kompakt formulieren.
- Ausführlicher: ausführlicher formulieren, ohne absichtlich Fakten hinzuzufügen.
- Anders formulieren: anderer Wortlaut bei gleicher Bedeutung.
- Übersetzen: gewählte Ausgangssprache (Deutsch, Englisch oder Französisch) nach Englisch oder Französisch.




## Auf dem iPhone starten

1. Verbinde dein iPhone mit dem Mac und bestätige gegebenenfalls „Diesem Computer vertrauen“.
2. Wähle dein iPhone oben als Zielgerät in Xcode.
3. Falls Xcode nach einer Signierung fragt: links das blaue Projektsymbol öffnen, unter **TARGETS → Wortklar → Signing & Capabilities** dein eigenes **Team** auswählen. Falls nötig, vorher unter **Xcode → Settings → Accounts** deine Apple-ID hinzufügen.
4. Falls die Bundle-ID bereits vergeben ist, ändere **Bundle Identifier** in einen eindeutigen Wert wie `com.deinname.wortklar`.
5. Aktiviere den Entwicklermodus auf dem iPhone nur, wenn Xcode dazu auffordert, und folge den Gerätehinweisen.
6. Drücke **⌘R**.

Für den iPhone-Simulator oben ein installiertes iPhone auswählen. Falls keiner angeboten wird, kann Xcode die iOS-Simulator-Komponente über seine Einstellungen herunterladen.

## Verlauf und Grenzen

- Bis zu 50 Einträge werden lokal in UserDefaults gespeichert und über App-Neustarts hinweg behalten.
- Die App überträgt den Verlauf nicht an einen eigenen Server. Betriebssystem-Backups können App-Daten enthalten.
- „Verlauf → Alle löschen“ entfernt die gespeicherten Einträge nach Bestätigung. Der aktuell geöffnete Text bleibt im Editor.
- Maximal 3.000 Eingabezeichen. Auch darunter kann das lokale Modell bei komplexen Texten seine Kontextgrenze erreichen.
- KI-Ausgaben können Fehler enthalten. Besonders bei „Ausführlicher“ und Übersetzungen das Ergebnis prüfen.
- Prototyp mit eigenem App-Icon; ohne App-Store-Veröffentlichung oder Cloud-Synchronisierung.

## Struktur

- `WortklarApp.swift`: App-Einstieg.
- `Models/EditorModel.swift`: Bearbeitungsablauf, Prüfung der Eingabe, Übersetzung und Verlauf.
- `Services/WritingService.swift`: lokale KI-Anbindung.
- `Views/EditorView.swift`: anpassbarer Editor für schmale und breite Fenster, Moduswahl und Kopieren.
- `Views/HistoryView.swift`: Verlauf, Wiederherstellen und Löschen.
- `Tests/ModelChecks.swift`: ausführbare Prüfungen ohne zusätzliche Bibliotheken.

## Prüfung

Erfolgreich geprüft am 11. September 2026:

- macOS-App mit Xcode gebaut.
- App für den iOS-Simulator mit Xcode gebaut.

Nicht live geprüft: visuelles Verhalten im gestarteten Simulator, Zwischenablage, echte KI-Generierung und Sprachdownloads. Der Simulator-Dienst war in der Arbeitsumgebung nicht erreichbar. Ein erfolgreicher Build ersetzt diese Gerätetests nicht.

Entwickler können die Modellprüfungen im Projektordner mit `bash Tests/run-checks.sh` ausführen.

## GitHub

Ziel-Repository: [JojoGa2010/Jojo](https://github.com/JojoGa2010/Jojo).

Upload noch ausstehend: GitHub verweigert der verbundenen Integration den Schreibzugriff (403). Das lokale Projekt ist vollständig vorbereitet. Die folgenden Download-Schritte gelten nach dem erfolgreichen Upload.

Auf der Repository-Seite **Code → Download ZIP** wählen, ZIP entpacken und **Wortklar.xcodeproj** doppelklicken. Dann oben in Xcode **My Mac** wählen und **⌘R** drücken.

## Apple-Dokumentation

- [Foundation Models](https://developer.apple.com/documentation/foundationmodels)
- [TranslationSession](https://developer.apple.com/documentation/translation/translationsession)

Aktuelle Editor-Prüfung: Mac-Build und native Tastaturprüfungen bestanden (Enter, Umschalt+Enter, gehaltene Taste und gesperrtes Feld).
Die erneute vollständige iOS-Simulator-Bauprüfung nach den Icon- und Editoränderungen ist durch fehlende Simulator-Laufzeiten beim Verarbeiten des Asset-Katalogs blockiert. Der frühere iOS-Build vor diesen Änderungen war erfolgreich.

Übersetzungsfix: frische Sitzung je Versuch, explizite Ausgangssprache, Vorbereitung der Sprachpakete, eigene Abbruchmeldung und Schutz vor verspäteten Ergebnissen. Automatisch mit simulierten Übersetzungsoperationen geprüft; tatsächliche Apple-Sprachdownloads müssen am Gerät bestätigt werden.

