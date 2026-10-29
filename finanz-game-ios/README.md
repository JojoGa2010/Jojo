# Finanz Game – iPhone-App für Xcode

## Öffnen und spielen

1. **FinanzGame.xcodeproj** doppelklicken.
2. Oben in Xcode als Ziel einen **iPhone-Simulator** auswählen.
3. Auf das dreieckige **Play-Symbol** drücken. Beim ersten Start kann es etwas dauern.
4. Im Spiel unter **Karriere** einen Job auswählen. Auf der Übersicht die Bankkarte gedrückt halten, um zusätzlich Geld und Erfahrung zu sammeln.

Für den Simulator wird kein kostenpflichtiges Entwicklerkonto benötigt. Für dein echtes iPhone: iPhone verbinden, in Xcode unter **Signing & Capabilities → Team** dein eigenes Apple-Konto auswählen und als Ziel dein iPhone wählen. Eine persönliche Signierung wurde nicht konfiguriert. Die App wurde nicht im App Store veröffentlicht.

## Was enthalten ist

- App-Name **Finanz Game** und ein vollständiges Xcode-Projekt, ohne zusätzliche Paketinstallation.
- Native SwiftUI-Menüleiste mit Apple-Systemsymbolen. Mit aktuellem SDK auf iOS 26 und neuer verwendet sie die systemeigene Liquid-Glass-Darstellung. Frühere iOS-Versionen zeigen ihre native Systemleiste.
- Lokal gebündeltes Spiel in WKWebView. Die Spielseiten sind Web-Inhalte; Navigation, Teilen und Dateiimport verwenden iOS. Kein bloßer Link auf die bisherige Website, kein Login erforderlich.
- Sechs individuell gestaltete virtuelle Bankkarten mit Chip, Reflexen, Kartennummer und eigenen Farbstilen: Raiffeisen, Sparkasse, Volksbank, Bank Austria, N26, Revolut. Das sind eigene Simulation-Entwürfe, keine Reproduktionen offizieller Karten oder echten Zahlungsdaten.
- Acht lokal gespeicherte Bildmotive: Immobilien, Café, Uhr, Auto, Yacht, Flughafen, Insel und Finanzmetropole. Die Motive sind KI-generiert; sie zeigen die Spielkategorien und keine verbindlichen realen Kaufangebote.
- 55 Jobs, Aktien, Besitz, Kreditfinanzierung, Hintergrundabrechnung, Hell/Dunkel/System und Anzeige-Einstellungen.
- **Finanzierungen** findest du auf der Übersicht und in den Einstellungen.

## Spielstand übernehmen

Browser und iPhone-App verwenden getrennte Speicher. Deinen bisherigen Stand auf der Website unter **Einstellungen → Spielstand exportieren** sichern. Die JSON-Datei auf dem iPhone in **Finanz Game → Einstellungen → Spielstand importieren** auswählen. Exporte der App werden über das iOS-Teilen-Menü gespeichert. Einstellungen zur Darstellung werden auf dem jeweiligen Gerät separat gespeichert.

Die App speichert lokal und rechnet Einkommen sowie Kosten bei Rückkehr nach. iOS muss dafür keinen dauerhaften Hintergrundprozess ausführen. Löschen der App kann ihren lokalen Spielstand entfernen: vorher exportieren.

## Projektaufbau

- `FinanzGame/FinanzGameApp.swift`: SwiftUI-App, native Navigation, WKWebView und Dateiübergabe.
- `FinanzGame/Web/`: vollständiges lokales Spiel und Bilddateien.
- `FinanzGame.xcodeproj`: direkt in Xcode zu öffnendes Projekt.

iOS 17 oder neuer. SwiftUI, WebKit und Apple-Systemframeworks, keine Drittanbieter-Abhängigkeiten. Das Projekt nutzt automatisch generierte App-Metadaten. Die optionalen Google-Schriften wurden für den App-Build durch Systemschriften ersetzt, sodass keine externen Ressourcen benötigt werden.

## Bildquelle

Erstellt mit dem integrierten ImageGen-Werkzeug. Prompt: Fotorealistischer Bildatlas mit acht getrennten Motiven – Wiener Wohnhaus, modernes Café, mechanische Luxusuhr, silbernes Elektroauto, Segelyacht, Flughafen, tropisches Inselresort und Finanzskyline bei Abendlicht. Warme Beleuchtung, keine Benutzeroberfläche und keine Beschriftung. Datei: `FinanzGame/Web/assets/scenes.jpg`.

Alle Werte und Bankkarten gehören ausschließlich zur fiktiven Simulation. Keine echten Bankkonten, Zahlungen oder Finanzprodukte.
