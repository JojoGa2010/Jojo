# Finanz Game – iPhone-App für Xcode

## Öffnen

1. **FinanzGame.xcodeproj** doppelklicken.
2. In Xcode einen iPhone-Simulator auswählen und **▶** drücken.
3. Für ein echtes iPhone unter **Signing & Capabilities → Team** dein eigenes Apple-Konto wählen, dein iPhone verbinden und als Ziel auswählen. Eine persönliche Signierung und Veröffentlichung im App Store sind nicht eingerichtet.

SwiftUI stellt die native iPhone-Menüleiste bereit; auf iOS 26+ mit aktuellem SDK verwendet sie die systemeigene Liquid-Glass-Darstellung. Die Spielseiten sind lokal gebündelte Web-Inhalte in WKWebView, ohne Login oder externe Verbindung. Export und Import nutzen iOS-Dateidialoge. Mindestversion: iOS 17. Keine Drittanbieter-Pakete erforderlich.

## Monatsauszahlung: alle zehn Minuten

Ein Spielmonat dauert **600 Sekunden**. Gehalt, Nettomieten, Besitzerträge, Firmengewinne, Unterhalt und Kreditraten werden **erst am Monatsende** verbucht. Ein Countdown zeigt die nächste Auszahlung. Neue Firmen und neu erworbener Besitz werden für die tatsächliche Besitzzeit anteilig gerechnet. Negative Erträge und unbezahlte Kosten können offene Rechnungen erzeugen; sie werden bei folgenden Monatsabschlüssen verrechnet. Kredite bleiben auch bei fehlender Zahlungsfähigkeit bestehen.

Bei Rückkehr werden vergangene Monatsabschlüsse nachgerechnet. iOS braucht keinen dauerhaften Hintergrundprozess. Firmen und Vermietungen laufen offline weiter. Arbeitsaufgaben erledigst du aktiv: Ohne neue Aufgaben gibt es im folgenden Monat kein automatisches Jobgehalt. Der Tipp-Modus bleibt eine Ausnahme: Jeder Tipp bringt sofort eine Spielgeldeinheit und 0,1 XP. Alternativ kann Gedrückthalten ausgewählt werden.

## Bewerbung, Arbeiten und Beförderung

Unter **Karriere** findest du 55 anklickbare Jobkarten mit Suche und Branchenfilter. In jeder Detailansicht siehst du Gehalt, Anforderungen und mögliche Upgrades.

1. Bewerbung einreichen. Erfahrung und Weiterbildungskosten werden geprüft. Die Weiterbildung wird bei Bewerbung bezahlt, auch bei späterer Absage.
2. 45 Sekunden auf die Unterlagenprüfung warten. Deine bisherige Stelle bleibt bestehen.
3. In der zweiminütigen Probephase drei Arbeitssituationen beantworten. Jede Aufgabe braucht zehn Sekunden Lesezeit; zwischen Aufgaben liegen zehn Sekunden Freigabezeit.
4. Der Chef überlegt weitere 30 Sekunden. Mindestens zwei gute Antworten ergeben eine Zusage. Sonst gibt es eine Absage; danach kannst du dich erneut bewerben. Keine Zusage ohne aktive Probearbeit.
5. In der aktiven Stelle pro Spielmonat drei Aufgaben richtig erledigen. Eine richtige Aufgabe ergibt ein Drittel des Gehalts, drei Aufgaben das volle Gehalt. Falsche Antworten geben keinen Gehaltsanteil; weitere Versuche sind möglich. Neue Aufgaben gibt es im nächsten Monat. Bei Wechsel wird vorher erarbeitetes Gehalt vorgemerkt, und Beschäftigungszeit wird anteilig gerechnet.
6. Zwei Monate mit jeweils drei richtigen Aufgaben, die nötige Erfahrung und die Weiterbildungskosten ermöglichen ein Gehalts-Upgrade. Es gibt fünf Upgrades; jede Stufe erhöht das Grundgehalt um 15 %.

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

Mit Node.js: `node test-catalog.cjs` und `node test-economy.cjs`. Sie prüfen Katalog, Logos, Speicherübernahme, Handel, Tipp-Modus, Monatsgrenzen, Bewerbungen, Probeaufgaben, Beförderung, Firmengründung, Ausbau und Online-/Offline-Abrechnung.

## Bilder und Icon

Mit dem integrierten ImageGen-Werkzeug erstellt. Bildatlas-Prompt: Fotorealistische acht Motive – Wiener Wohnhaus, Café, mechanische Uhr, Elektroauto, Segelyacht, Flughafen, Inselresort, Finanzskyline bei Abendlicht. Icon-Prompt: Goldenes F mit steigendem Finanzpfeil auf nachtblauem Hintergrund, minimalistisch und ohne zusätzliche Schrift. Die Bilder sind dekorative Spielmotive; keine konkreten Kaufangebote. Originale liegen lokal im Projekt.

Alle wirtschaftlichen Werte und Entscheidungen sind fiktive Spielregeln. Keine echten Konten, Zahlungen, Anstellungsverhältnisse oder Finanzprodukte.
