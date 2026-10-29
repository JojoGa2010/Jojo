# Finanz Game – iPhone-App für Xcode

## Öffnen

1. **FinanzGame.xcodeproj** doppelklicken.
2. In Xcode einen iPhone-Simulator auswählen und **▶** drücken.
3. Für ein echtes iPhone unter **Signing & Capabilities → Team** dein eigenes Apple-Konto wählen, dein iPhone verbinden und als Ziel auswählen. Eine persönliche Signierung und Veröffentlichung im App Store sind nicht eingerichtet.

SwiftUI stellt die native iPhone-Menüleiste bereit; auf iOS 26+ mit aktuellem SDK verwendet sie die systemeigene Liquid-Glass-Darstellung. Die Spielseiten sind lokal gebündelte Web-Inhalte in WKWebView, ohne Login oder externe Verbindung. Export und Import nutzen iOS-Dateidialoge. Mindestversion: iOS 17. Keine Drittanbieter-Pakete erforderlich.

## Monatsauszahlung: alle zehn Minuten

Ein Spielmonat dauert **600 Sekunden**. Gehalt, Nettomieten, Besitzerträge, Firmengewinne, Unterhalt und Kreditraten werden **erst am Monatsende** verbucht. Ein Countdown zeigt die nächste Auszahlung. Neue Firmen und neu erworbener Besitz werden für die tatsächliche Besitzzeit anteilig gerechnet. Negative Erträge und unbezahlte Kosten können offene Rechnungen erzeugen; sie werden bei folgenden Monatsabschlüssen verrechnet. Kredite bleiben auch bei fehlender Zahlungsfähigkeit bestehen.

Bei Rückkehr werden vergangene Monatsabschlüsse nachgerechnet. iOS braucht keinen dauerhaften Hintergrundprozess. Firmen und Vermietungen laufen offline weiter. Arbeitsaufgaben erledigst du aktiv: Ohne neue Aufgaben gibt es im folgenden Monat kein automatisches Jobgehalt. Der Tipp-Modus bleibt eine Ausnahme: Jeder Tipp bringt sofort eine Spielgeldeinheit und 0,1 XP. Alternativ kann Gedrückthalten ausgewählt werden.

## Bewerbung, Fragen und Unterschrift

Unter **Karriere** stehen 55 anklickbare Jobkarten mit Gehalt, Anforderungen, Suche und Branchenfilter bereit.

1. Bewerbung vorbereiten und mit Finger oder Maus im Unterschriftsfeld unterschreiben. Die Unterschrift gilt nur im fiktiven Spiel, ist kein Vertrag und wird nicht an einen echten Arbeitgeber übermittelt. Erst beim unterschriebenen Absenden wird die erforderliche Weiterbildung bezahlt. Ein noch nicht unterschriebener Entwurf kann verworfen werden.
2. Die Unterlagenprüfung dauert 45 Sekunden. Danach folgen genau drei Bewerbungsfragen.
3. Jede Frage kann ohne Zeitlimit gelesen werden. **Erst mit Start beginnt die Zeitmessung**, und die Antworten erscheinen sofort ohne Wartezeit. Das gilt ebenfalls für Arbeitsaufgaben. Während des Lesens und zwischen Fragen läuft kein Bewerbungs-Zeitlimit.
4. Jede richtige Antwort gibt 80 Punkte plus bis zu 20 Tempopunkte. Pro Sekunde nach Start sinkt der Bonus um einen Punkt bis auf null nach 20 Sekunden. Falsche Antworten ergeben null Punkte. Langsames richtiges Antworten ist somit immer besser als schnelles falsches. Die Gesamtbewertung ist der gerundete Durchschnitt der drei Fragen, maximal 100 Punkte.
5. Der Chef prüft die Antworten 30 Sekunden. Für die Zusage sind **mindestens zwei richtige Antworten und 60/100 Gesamtpunkte** nötig. Ohne Zusage wird der gewünschte Job nicht freigeschaltet. Eine vorhandene andere Stelle bleibt bei Absage erhalten. Alle drei richtigen Antworten reichen auch ohne Tempobonus für eine Zusage.
6. Unterschrift, Prüfung, Fragen und Entscheidung werden mit animierten Schritten dargestellt. Animationen respektieren die Bewegungs-Einstellungen des Spiels und Geräts. Die Unterschrift wird während der laufenden Bewerbung im lokalen Spielstand gespeichert; die Entscheidungshistorie enthält Ergebnis und Punkte ohne weitere Unterschriftkopien.
7. In der aktiven Stelle pro Monat drei Arbeitsaufgaben richtig beantworten. Eine richtige Aufgabe ergibt ein Drittel des Gehalts, drei das volle Gehalt; die Beschäftigungszeit wird anteilig gerechnet. Zwei erfolgreiche Arbeitsmonate, Erfahrung und Weiterbildungskosten ermöglichen ein Gehalts-Upgrade. Es gibt fünf Upgrades mit je 15 % mehr Grundgehalt.

Frühere noch laufende Bewerbungen wechseln einmalig in den Unterschriftsentwurf. Bereits bezahlte Weiterbildungen werden nicht erneut berechnet. Bestehende Jobs und Vermögenswerte bleiben erhalten.

## Eigene Firma gründen

Auf der Übersicht **Firma gründen** oder unter **Besitz → Unternehmen** öffnen. Namen und Geschäftsmodell wählen: Digital-Service ab 750 €, Reinigungsfirma, Café, Kreativagentur oder Logistikfirma. Maximal zehn Firmen. Umsatz und Kosten werden separat ausgewiesen. Der Monatsumsatz schwankt um bis zu 15 %, weshalb Gewinne variieren und auch Verluste möglich sind. Jede Firma kann bis Stufe 5 ausgebaut werden; der Ausbau kostet Kapital und verändert Umsatz sowie Kosten. Einnahmen werden erst beim nächsten Monatsabschluss gutgeschrieben, im Gründungsmonat zeitanteilig.

## Weitere Inhalte

- Sechs eigene virtuelle Bankkartenentwürfe: Raiffeisen, Sparkasse, Volksbank, Bank Austria, N26, Revolut. Keine offiziellen Kartenkopien, Zahlungsdaten oder Bankverbindungen.
- 27 reale Unternehmen mit lokal gespeicherten Logos plus vier bestehende fiktive Anlagen. Alle Kurse sind **simulierte Spielkurse**, keine Live-Daten. Aktienhandel: 0,5 % Gebühr pro Kauf/Verkauf. Quellen in **LOGO-SOURCES.md**.
- 25 Immobilien mit realen Städtenamen, aber fiktiven Objekten, Preisen und Mieten; weitere Kategorien: Unternehmen, Autos, Sammlerstücke, Schiffe, Flughäfen, Inseln.
- Finanzierungen unter Übersicht oder Einstellungen. Privatkredit: 36 Monate, Objektfinanzierung: 60 Monate und 30 % Eigenkapital, nominaler Spieljahreszins 6,5 %. Alle Monate sind Spielmonate. Bestehende Unternehmen können weiterhin gekauft werden.
- Einstellungen für Hell/Dunkel/System, Glas-Effekt, Animationen, Währungssymbol, Cent-Anzeige und Verdienst-Modus. Währungsanzeige nutzt 1:1-Spielwerte.

## Speicherstand

App und Browser speichern getrennt. Einen früheren Browserstand dort exportieren und in der App über **Einstellungen → Spielstand importieren** laden. Alte Spielstände behalten Guthaben, Aktien, Besitz und Jobs. Beim Umstieg auf das neue Zehn-Minuten-System bleibt der relative Monatsfortschritt erhalten; bereits ausgezahltes Geld wird nicht erneut ausgeschüttet. Frühere Jobs bleiben aktiv, brauchen künftig aber Arbeitsaufgaben.

Vor dem Löschen der App den Spielstand exportieren. Darstellungs-Einstellungen werden gerätebezogen separat gespeichert.

## Projekt und Prüfungen

`FinanzGame/FinanzGameApp.swift`: SwiftUI, native Navigation und Dateiübergabe. `FinanzGame/Web/`: lokale Spielseiten und Mechanik. `FinanzGame/Assets.xcassets/`: App-Icon.

Mit Node.js: `node test-catalog.cjs`, `node test-economy.cjs`, `node test-navigation.cjs` und `node test-application.cjs`. Sie prüfen Katalog, Logos, Speicherübernahme, Handel, Tipp-Modus, Monatsgrenzen, Bewerbungen, Probeaufgaben, Beförderung, Firmengründung, Ausbau und Online-/Offline-Abrechnung.

## Bilder und Icon

Mit dem integrierten ImageGen-Werkzeug erstellt. Bildatlas-Prompt: Fotorealistische acht Motive – Wiener Wohnhaus, Café, mechanische Uhr, Elektroauto, Segelyacht, Flughafen, Inselresort, Finanzskyline bei Abendlicht. Icon-Prompt: Goldenes F mit steigendem Finanzpfeil auf nachtblauem Hintergrund, minimalistisch und ohne zusätzliche Schrift. Die Bilder sind dekorative Spielmotive; keine konkreten Kaufangebote. Originale liegen lokal im Projekt.

Alle wirtschaftlichen Werte und Entscheidungen sind fiktive Spielregeln. Keine echten Konten, Zahlungen, Anstellungsverhältnisse oder Finanzprodukte.

## Mittiger Verdienst-Bereich und Kontostand
Die native Leiste enthält von links: Karriere, Börse, **Verdienen**, Besitz, Einstellungen. Die Tipp-Karte liegt im dritten und damit mittleren Eintrag. Die App startet im Verdienst-Bereich. Die Vermögensübersicht bleibt über den Button darunter erreichbar. Der verfügbare Kontostand steht in der nativen Kopfzeile über allen Spielseiten und wird bei Tipps, Käufen, Monatsabschlüssen und Währungswechseln aktualisiert.
