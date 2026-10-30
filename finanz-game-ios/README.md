# Finanz Game – neue native iPhone-App

## Start in Xcode

1. **FinanzGame.xcodeproj** doppelklicken.
2. Oben das Schema **FinanzGame** und einen iPhone-Simulator auswählen.
3. **▶** drücken. Die App startet bei **Verdienen**.
4. Für dein echtes iPhone: unter **Signing & Capabilities → Team** dein Apple-Konto wählen, das iPhone verbinden und als Ziel auswählen. Eine Veröffentlichung im App Store ist damit noch nicht eingerichtet.

Alle sichtbaren Spielseiten sind neu in **SwiftUI** gebaut. Die echte iPhone-Menüleiste übernimmt mit aktuellem SDK ab iOS 26 die systemeigene Liquid-Glass-Darstellung. Auf älteren Systemen erscheint die entsprechende native Leiste. Mindestversion: iOS 17; iPhone und iPad. Keine zusätzlichen Pakete, Anmeldung oder Internetverbindung nötig.

## Wo finde ich was?

| Unten im Menü | Funktionen |
| --- | --- |
| Karriere | 55 Berufe, Suche und Branchen, Jobdetails, Bewerbungen, Unterschrift, drei Fragen, Monatsaufgabe und Beförderung |
| Vermögen | Vermögensverlauf, Aktien, Besitz, eigene Firmen und Kredite |
| **Verdienen – in der Mitte** | Virtuelle Bankkarte, Tippen und Halten, Bankwechsel, nächster Monatsabschluss |
| **Essen** | Ausschließlich hier: Vorräte, automatische Ernährung, Gesundheit, Spielarzt, Rezepte, Handys, Geräte und Rechnungen |
| Einstellungen | Hell/Dunkel/System, Bewegung, Glasflächen, Währungsanzeige, Cent-Anzeige, Spielstand importieren/exportieren |

Der Kontostand bleibt über den fünf Hauptbereichen sichtbar. Eigenständige Bankkartenentwürfe für Raiffeisen, Sparkasse, Volksbank, Bank Austria, N26 und Revolut. Die Karte ist eine native Grafik; beim Halten wird kein Text markiert.

## Geld und Zeit

- Startkapital: **2.500 Spiel-Euro**.
- Tippen: **genau 1 Spiel-Euro pro Tipp**. Halten: **genau 1 Spiel-Euro pro Sekunde**, auch anteilig. Job und Gehaltsstufe ändern diese Rate nicht. Erschöpfung pausiert den aktiven Verdienst.
- Ein Spielmonat dauert **10 echte Minuten**. Gehalt, Firmen, Mieten, Rechnungen und Kreditraten werden erst beim Monatsabschluss verbucht. Neue Käufe und Firmen zählen zeitanteilig.
- Beim Wiederöffnen wird die vergangene Zeit nachberechnet. iOS muss die App dafür nicht ständig im Hintergrund ausführen. Halte-Verdienst läuft im Hintergrund nicht weiter. Jobgehalt benötigt die jeweilige Monatsaufgabe; ausgelassene Aufgaben werden nicht automatisch erledigt.
- Die Währungswahl verändert nur das Symbol, alle Spielwerte bleiben 1:1. Alle Kurse, Preise, Gehälter und Zinsen sind fiktive Spielparameter.

## Bewerben und arbeiten

1. Beruf öffnen und **Bewerbung vorbereiten** wählen. Anforderungen an Erfahrung und Weiterbildung werden geprüft.
2. Mit dem Finger unterschreiben und absenden. Erst dann wird eine eventuell nötige Weiterbildung bezahlt. Einen Entwurf kannst du verwerfen.
3. Die Unterlagenprüfung dauert **45 Sekunden**.
4. Es folgen genau **drei Fragen**. Du kannst unbegrenzt lesen. Erst **Start** aktiviert die Zeitmessung und zeigt die Antworten sofort an. Richtig: 80 Punkte plus bis zu 20 Tempopunkte; der Bonus sinkt pro Sekunde um einen Punkt. Falsch: null Punkte.
5. Der Chef prüft **30 Sekunden**. Mindestens zwei richtige Antworten und durchschnittlich 60/100 Punkte sind nötig. Drei richtige Antworten reichen auch ohne Tempobonus. Eine Absage entfernt keinen bereits bestehenden anderen Job.
6. Nach der Zusage gibt es **eine Aufgabe und einen Versuch pro Spielmonat**. Richtig beantwortet: zeitanteiliges Monatsgehalt freigeschaltet. Falsch oder ausgelassen: kein Jobgehalt für diesen Monat.
7. Je zwei erfolgreiche Arbeitsmonate, Erfahrung und Weiterbildungskosten ermöglichen eine Beförderung. Fünf Upgrades mit jeweils 15 % mehr Grundgehalt.

Die gezeichnete Unterschrift ist nur Teil der fiktiven Bewerbung und bleibt lokal. Keine echten Arbeitgeber oder Verträge.

## Investieren, kaufen und gründen

Unter **Vermögen** gibt es 27 reale Unternehmensnamen mit lokal gespeicherten Logos und vier fiktive Anlagen. Spielkurse ändern sich; es sind keine Live-Börsendaten. Je Kauf oder Verkauf fallen 0,5 % Spielgebühr an. Logoquellen stehen in **LOGO-SOURCES.md**.

**Besitz** enthält 25 Immobilien mit realen Städtenamen und fiktiven Objekten sowie Unternehmen, Autos, Sammlerstücke, Schiffe, Flughäfen und Inseln. Kauf mit Guthaben oder Finanzierung. Verkauf: 90 % des Kaufpreises; bestehende Kredite laufen weiter.

Unter **Firmen → Eigene Firma gründen** wählst du Namen und Geschäftsmodell. Digital-Service ab 750 Spiel-Euro, außerdem Reinigungsfirma, Café, Kreativagentur und Logistikfirma. Höchstens zehn Firmen; jede hat fünf Stufen. Umsatz, Kosten und erwarteter Gewinn werden separat angezeigt. Umsatzschwankungen bis 15 % verändern die Monatsgewinne; Verluste sind möglich. Gewinne kommen am Monatsende.

**Kredite**: Privatkredit über 36 Spielmonate; Objektfinanzierung über 60 Monate mit 30 % Eigenkapital. Nominaler Spieljahreszins: 6,5 %. Die Summe der Monatsraten darf 40 % des monatlichen Job- und positiven Besitzeinkommens nicht übersteigen. Kreditrahmen wird geprüft; vollständige vorzeitige Tilgung ist möglich. Schulden verschwinden bei Geldmangel nicht.

## Essen und Gesundheit

Nur unter dem unteren Eintrag **Essen** sichtbar, mit den Bereichen Übersicht, Essen, Gesundheit und Haushalt.

Du kaufst Lebensmittel; gegessen wird **immer automatisch**. Bei vorhandenen Vorräten bleibt die Sättigung bei 100 %. Es wird nur die benötigte Menge entnommen; angebrochene Portionen bleiben gespeichert. Kein manueller Essen-Knopf und kein Abschalter. Der Kauf bei Sättigungsdefizit füllt sofort auf, soweit der Vorrat reicht. Die Übersicht zeigt ungeöffnete Portionen, die angebrochene Mahlzeit und die ungefähre Versorgungsdauer. Lebensmittel werden nicht automatisch nachgekauft.

Acht Lebensmittel, acht fiktive Handy-Modelle und sechs Geräte. Einmaliger Startvorrat: zwei Mahlzeiten und ein Brot. Pro Spielmonat werden 80 Sättigungspunkte verbraucht. Bei leerem Magen sinkt die Lebensenergie um 40 Punkte pro Monat. Null Lebensenergie pausiert Kartenverdienst und Jobaufgaben; dein Vermögen bleibt erhalten. Bei leerem Vorrat, weniger als 1,50 Spielgeld und höchstens 15 % Sättigung ist einmal pro Monat eine kostenlose Notmahlzeit verfügbar.

Strom 45, Wasser 12 und Internet 25 Spielgeld pro Monat, zuzüglich Geräteverbrauch. Dienste sind für künftige Kosten abschaltbar; offene Rechnungen bleiben bestehen. Ein Kühlschrank verbessert eine neu geöffnete Portion um 10 %, wenn Strom aktiv und bezahlt ist. Geräte werden im Vermögen mit 70 % des Kaufpreises bewertet.

**Gesundheit**: fiktiver Spielarzt für 25 Spielgeld, Untersuchung nach 30 Sekunden. Bei Bedarf stellt er eines von drei fiktiven Spielrezepten aus. Nur das passende Spielmittel kann einmal innerhalb von zwei Spielmonaten gekauft und automatisch angewendet werden. Keine echten Wirkstoffe, Dosierungen oder Behandlungsempfehlungen.

## Speicherstand und Umstieg

Die App speichert automatisch lokal. **Einstellungen → Spielstand exportieren** erstellt eine JSON-Sicherung. Diese Datei kann auf einem anderen Gerät oder nach einer Neuinstallation importiert werden. Vor dem Löschen der App zuerst exportieren.

Beim ersten Start des Neuaufbaus versucht die App, den bisherigen lokalen App-Spielstand einmalig aus dem alten Speicher zu übernehmen. Der gelesene Stand wird zusätzlich gesichert. Schlägt die Übernahme fehl, meldet die App das und überschreibt den vorhandenen Stand nicht. Du kannst dann eine JSON-Sicherung importieren oder bewusst ein neues Spiel starten. Browser und App speichern getrennt: Einen Browserstand zuerst dort exportieren, anschließend in der App importieren. Guthaben, Jobs, Besitz, Aktien und kompatible Bewerbungen bleiben erhalten.

## Aufbau und Prüfungen

- `FinanzGameApp.swift`: Start, fünf native Bereiche, Kontostand, Karte und Bankauswahl.
- `NativeCore.swift`: lokaler Speicher, Import/Export, einmalige Übernahme und Verbindung zur Simulation.
- `CareerViews.swift`, `WealthViews.swift`, `LifeViews.swift`, `SettingsViews.swift`: vollständige SwiftUI-Spielseiten.
- `NativeComponents.swift`: gemeinsame Oberfläche, lokale Bilder, Logos und Unterschriftsfeld.
- `Web/engine.js`: gemeinsam genutzte Spielregeln, in der nativen App lokal durch JavaScriptCore ausgeführt. Vorhandene Web-Dateien bleiben für alte Speicher und Kompatibilität enthalten; sie werden nicht als Spieloberfläche angezeigt. Nur die einmalige alte Speicherübernahme verwendet eine unsichtbare WKWebView.
- Lokale Bildmotive und 31 PNG-Logos werden ohne Netzwerk geladen. Das goldene F-App-Icon bleibt enthalten.

Die Regelprüfungen laufen mit `node --test test-*.cjs`. `test-native.cjs` prüft zusätzliche Aktionen und Bilddateien; `test-navigation.cjs` prüft ausschließlich die erhaltene ältere Web-Oberfläche.

Die echte JavaScriptCore-Verbindung lässt sich unter macOS aus dem Projektordner prüfen:

```
xcrun swift Tests/NativeEngineBridge.swift FinanzGame/Web/engine.js
```

In Xcode mit ausgewähltem iPhone-Simulator prüft **Product → Test** native Navigation, Tippbetrag, Bankwechsel, Unterschrift, Essenskauf, Firmengründung und erneutes Laden. Diese Bedienprüfung verwendet ausschließlich einen eigenen Test-Spielstand; dein echter Stand bleibt getrennt. Die dafür nötigen Startargumente sind nur im Debug-Build verfügbar.

Finanz Game ist eine **fiktive Simulation**. Keine echten Konten, Zahlungen, Finanzprodukte, Anstellungsverhältnisse oder Behandlungen. Bank- und Unternehmensnamen dienen der Identifizierung im Spiel; keine Verbindung zu diesen Unternehmen.
