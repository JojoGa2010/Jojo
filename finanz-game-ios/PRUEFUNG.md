# Prüfung des nativen Neuaufbaus

Stand: 30. Oktober 2026.

Erfolgreich:

- Xcode-Simulator-Build in Debug und Release.
- Projektdatei mit `plutil` geprüft.
- Neun Regel-Prüfdateien: Kataloge, Wirtschaft/Monatsabschluss, Bewerbungen, Alltag, Gesundheit, automatische Ernährung, exakte Tipp-/Halterate, ältere Web-Navigation und zusätzliche native Aktionen/Logodateien.
- Echte JavaScriptCore-Verbindung unter macOS: Spielstand, Swift-Array-Unterschrift, vollständige Bewerbung mit drei Antworten, Jobaufgabe, Firmengründung, Bankwechsel, Dienste, Kreditaufnahme/Tilgung, JSON-Rückübernahme und Offline-Fortschritt.
- Neue native App im iPhone-Simulator installiert und gestartet; Verdienstansicht mit nativer Leiste und Karte sichtbar geprüft.
- Desktop-Dateien mit der Auslieferung abgeglichen; vorhandene persönliche Signierung bleibt ausschließlich lokal erhalten.

Grenzen der Prüfung:

Der neue Xcode-Bedientest wurde gebaut, blieb auf diesem Rechner aber beim Start des Testprogramms ohne ausgeführte Testfälle hängen. Der Lauf wurde beendet. Auch eine anschließende erneute Simulator-Installation erreichte ein Zeitlimit. Daher gilt der vollständige automatisierte Bedienablauf ausdrücklich noch nicht als bestanden. Der Test ist unter `FinanzGameUITests` enthalten und verwendet ausschließlich einen getrennten Test-Spielstand. Die Einzelansichten außer der gestarteten Verdienstansicht sind nicht durch Bildschirmaufnahmen abgenommen.

Die App wurde nicht auf einem echten iPhone oder über den App Store getestet oder veröffentlicht. Das laufende Browser-Spiel wurde durch diesen nativen Neuaufbau nicht geändert.
