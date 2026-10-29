# Finanz Game – iPhone-App für Xcode

## Öffnen

1. **FinanzGame.xcodeproj** doppelklicken.
2. In Xcode einen iPhone-Simulator auswählen und **▶** drücken.
3. Für ein echtes iPhone unter **Signing & Capabilities → Team** dein eigenes Apple-Konto wählen, dein iPhone verbinden und als Ziel auswählen. Eine persönliche Signierung und Veröffentlichung im App Store sind nicht eingerichtet.

SwiftUI stellt die native iPhone-Menüleiste bereit; auf iOS 26+ mit aktuellem SDK verwendet sie die systemeigene Liquid-Glass-Darstellung. Die Spielseiten sind lokal gebündelte Web-Inhalte in WKWebView, ohne Login oder externe Verbindung. Export und Import nutzen iOS-Dateidialoge. Mindestversion: iOS 17. Keine Drittanbieter-Pakete erforderlich.

## Monatsauszahlung: alle zehn Minuten

Ein Spielmonat dauert **600 Sekunden**. Gehalt, Nettomieten, Besitzerträge, Firmengewinne, Unterhalt und Kreditraten werden **erst am Monatsende** verbucht. Ein Countdown zeigt die nächste Auszahlung. Neue Firmen und neu erworbener Besitz werden für die tatsächliche Besitzzeit anteilig gerechnet. Negative Erträge und unbezahlte Kosten können offene Rechnungen erzeugen; sie werden bei folgenden Monatsabschlüssen verrechnet. Kredite bleiben auch bei fehlender Zahlungsfähigkeit bestehen.

Bei Rückkehr werden vergangene Monatsabschlüsse nachgerechnet. iOS braucht keinen dauerhaften Hintergrundprozess. Firmen und Vermietungen laufen offline weiter. Nach der erfolgreichen Bewerbung gibt es genau eine Arbeitsaufgabe pro Spielmonat. Eine richtige Antwort schaltet das volle zeitanteilige Monatsgehalt frei. Eine falsche oder ausgelassene Antwort gibt kein Jobgehalt für diesen Monat; erst im nächsten Monat gibt es wieder eine Aufgabe. Der Tipp-Modus bleibt eine Ausnahme: Jeder Tipp bringt sofort eine Spielgeldeinheit und 0,1 XP. Alternativ kann Gedrückthalten ausgewählt werden.

## Bewerbung, Fragen und Unterschrift

Unter **Karriere** stehen 55 anklickbare Jobkarten mit Gehalt, Anforderungen, Suche und Branchenfilter bereit.

1. Bewerbung vorbereiten und mit Finger oder Maus im Unterschriftsfeld unterschreiben. Die Unterschrift gilt nur im fiktiven Spiel, ist kein Vertrag und wird nicht an einen echten Arbeitgeber übermittelt. Erst beim unterschriebenen Absenden wird die erforderliche Weiterbildung bezahlt. Ein noch nicht unterschriebener Entwurf kann verworfen werden.
2. Die Unterlagenprüfung dauert 45 Sekunden. Danach folgen genau drei Bewerbungsfragen.
3. Jede Frage kann ohne Zeitlimit gelesen werden. **Erst mit Start beginnt die Zeitmessung**, und die Antworten erscheinen sofort ohne Wartezeit. Das gilt ebenfalls für Arbeitsaufgaben. Während des Lesens und zwischen Fragen läuft kein Bewerbungs-Zeitlimit.
4. Jede richtige Antwort gibt 80 Punkte plus bis zu 20 Tempopunkte. Pro Sekunde nach Start sinkt der Bonus um einen Punkt bis auf null nach 20 Sekunden. Falsche Antworten ergeben null Punkte. Langsames richtiges Antworten ist somit immer besser als schnelles falsches. Die Gesamtbewertung ist der gerundete Durchschnitt der drei Fragen, maximal 100 Punkte.
5. Der Chef prüft die Antworten 30 Sekunden. Für die Zusage sind **mindestens zwei richtige Antworten und 60/100 Gesamtpunkte** nötig. Ohne Zusage wird der gewünschte Job nicht freigeschaltet. Eine vorhandene andere Stelle bleibt bei Absage erhalten. Alle drei richtigen Antworten reichen auch ohne Tempobonus für eine Zusage.
6. Unterschrift, Prüfung, Fragen und Entscheidung werden mit animierten Schritten dargestellt. Animationen respektieren die Bewegungs-Einstellungen des Spiels und Geräts. Die Unterschrift wird während der laufenden Bewerbung im lokalen Spielstand gespeichert; die Entscheidungshistorie enthält Ergebnis und Punkte ohne weitere Unterschriftkopien.
7. In der aktiven Stelle gibt es pro Monat genau eine Arbeitsaufgabe. Eine richtige Antwort ergibt das volle zeitanteilige Gehalt. Die Bewerbung muss nur einmal erfolgreich abgeschlossen werden; bei einem Jobwechsel gibt es eine neue Bewerbung. Zwei erfolgreiche Arbeitsmonate, Erfahrung und Weiterbildungskosten ermöglichen ein Gehalts-Upgrade. Es gibt fünf Upgrades mit je 15 % mehr Grundgehalt.

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

Mit Node.js: `node test-catalog.cjs`, `node test-economy.cjs`, `node test-navigation.cjs` und `node test-application.cjs` und `node test-life.cjs`. Sie prüfen Katalog, Logos, Speicherübernahme, Handel, Tipp-Modus, Monatsgrenzen, Bewerbungen, Probeaufgaben, Beförderung, Firmengründung, Ausbau und Online-/Offline-Abrechnung.

## Bilder und Icon

Mit dem integrierten ImageGen-Werkzeug erstellt. Bildatlas-Prompt: Fotorealistische acht Motive – Wiener Wohnhaus, Café, mechanische Uhr, Elektroauto, Segelyacht, Flughafen, Inselresort, Finanzskyline bei Abendlicht. Icon-Prompt: Goldenes F mit steigendem Finanzpfeil auf nachtblauem Hintergrund, minimalistisch und ohne zusätzliche Schrift. Die Bilder sind dekorative Spielmotive; keine konkreten Kaufangebote. Originale liegen lokal im Projekt.

Alle wirtschaftlichen Werte und Entscheidungen sind fiktive Spielregeln. Keine echten Konten, Zahlungen, Anstellungsverhältnisse oder Finanzprodukte.

## Mittiger Verdienst-Bereich und Kontostand
Die native Leiste enthält von links: Karriere, **Vermögen**, **Verdienen**, **Essen**, Einstellungen. Vermögen bündelt Besitz und Börse; Der untere Eintrag Essen bündelt Lebensmittel, Gesundheit, Handys und Haushalt. Die Tipp-Karte liegt im dritten und damit mittleren Eintrag. Die App startet im Verdienst-Bereich. Die Vermögensübersicht bleibt über den Button darunter erreichbar. Der verfügbare Kontostand steht in der nativen Kopfzeile über allen Spielseiten und wird bei Tipps, Käufen, Monatsabschlüssen und Währungswechseln aktualisiert.

## Alltags-Shop, Hunger und Haushalt
Über den eigenen unteren Menüeintrag **Essen** oder **Essen & Alltag** unter den Statusanzeigen erreichbar. Enthält acht Lebensmittel, acht eigene fiktive Handy-Modelle und sechs Haushaltsgeräte. Lebensmittel kommen in deinen Vorrat und werden bei jedem Sättigungsdefizit automatisch in der benötigten Menge gegessen. Es gibt keinen manuellen Essen-Knopf und keinen Abschalter mehr. Nicht essbare Gegenstände werden dauerhaft gekauft; das zuletzt gekaufte Handy ist ausgewählt. Geräte zählen mit 70 % des Kaufpreises zum Nettovermögen.

Sättigung und Lebensenergie beginnen bei 100 %. Pro Zehn-Minuten-Monat werden 80 Sättigungspunkte benötigt. Solange Essen vorhanden ist, wird dieser Verbrauch automatisch ausgeglichen und die Sättigung bei 100 % gehalten. Bei leerem Magen sinkt die Lebensenergie um 40 Punkte pro Monat. Bei null kannst du weder Jobaufgaben noch Tipp-/Halteverdienst ausführen, bis du isst. Es gibt keinen dauerhaften Tod oder Verlust des Vermögens. Zwei Mahlzeiten und ein Brot sind als einmaliger Startvorrat enthalten. Automatisches Essen aus vorhandenen Vorräten ist immer aktiv, auch bei älteren Speicherständen. Es kauft kein Essen selbstständig. Wenn du bei einem Sättigungsdefizit neue Lebensmittel kaufst, wird sofort bis auf 100 % aufgefüllt, soweit der Vorrat reicht. Es gibt keine frühere 15-%-Verbrauchsgrenze mehr. Ein Kühlschrank verbessert die Sättigungswirkung um 10 %, wenn Strom aktiv und bezahlt ist.

Strom kostet 45, Wasser 12 und Internet 25 Spielgeldeinheiten pro Monat. Der Stromverbrauch gekaufter Geräte kommt hinzu. Kosten werden zeitanteilig vorgemerkt und am Monatsende bezahlt; nicht bezahlte Rechnungen bleiben offen. Bei offenen Rechnungen pausiert der Kühlschrank-Bonus. Die Dienste lassen sich für künftige Kosten abschalten; alte Rechnungen bleiben bestehen. Im Shop können offene Rechnungen auch vorzeitig mit verfügbarem Guthaben bezahlt werden.

Bei leerem Vorrat, weniger als 1,50 Spielgeldeinheiten und höchstens 15 % Sättigung gibt es einmal pro Monat eine kostenlose Notmahlzeit. Sie stellt mindestens 35 % Sättigung und 20 % Lebensenergie her, damit du erneut Tipp-Geld für Essen verdienen kannst.

Alles läuft offline nach denselben Regeln weiter. Beim Umstieg erhalten ältere Spielstände die Alltagswerte und den Startvorrat einmalig. Bereits richtig erledigte Jobaufgaben gelten für den laufenden Monat als erledigt. Guthaben, Bewerbung, Aktien und bestehender Besitz bleiben erhalten.

## Spielarzt und Spielrezepte
Unter **Essen → Gesundheit**. Ein fiktiver Arztbesuch kostet 25 Spielgeldeinheiten und dauert 30 Sekunden. Bei schlechten Spielwerten oder einem fiktiven Befund stellt der Spielarzt ein passendes Rezept aus; bei guten Werten wird keines ausgestellt. Drei frei erfundene Spielmittel verändern ausschließlich die Lebensenergie im Spiel. Sie enthalten keine realen Wirkstoffe, Dosierungen oder Behandlungsempfehlungen.

Die Apotheke erlaubt nur das zum Rezept passende Spielmittel. Das Rezept gilt zwei Spielmonate und kann genau einmal eingelöst werden. Kauf und Anwendung erfolgen gemeinsam. Rezept, Untersuchung und Ergebnis werden lokal gespeichert und offline nachgerechnet. Das Spiel kann alle sechs Monate einen fiktiven Spiel-Infekt auslösen. Erschöpfung durch Hunger ist ebenfalls ein möglicher Spielbefund.

Zusätzliche Prüfung: `node test-health.cjs` kontrolliert automatische Ernährung beim Kauf, Arztgebühr und Wartezeit, Rezeptpflicht, falsches/abgelaufenes Rezept, Einmalverwendung und Offline-Fortschritt.

## Korrigierte Ernährung und Vorratsanzeige
Sättigung wird aus vorhandenen Lebensmitteln sofort aufgefüllt und anschließend automatisch bei 100 % gehalten. Die Spielzeit verbraucht weiter 80 Sättigungspunkte pro Monat. Statt ganze Portionen unnötig zu verbrauchen, wird eine angefangene Portion gespeichert und nur die benötigte Nährmenge entnommen. Sie bleibt auch beim Schließen/Import des Spiels erhalten. Erst wenn weder ungeöffnete noch angefangene Portionen verfügbar sind, sinkt die Sättigung.

Im Essen-Bereich werden ungeöffnete Portionen, eine angebrochene Portion mit Restanteil und die geschätzte Versorgungsdauer laufend aktualisiert. Die Dauer umfasst Vorrat plus aktuelle Sättigung und wird in echten Minuten angezeigt. Der Kühlschrank-Bonus gilt beim Öffnen einer Portion. Es werden keine zusätzlichen Lebensmittel automatisch gekauft. Vorhandene Vorräte und Guthaben bleiben beim Update unverändert.

Prüfung: `node test-feeding.cjs` kontrolliert unter anderem das Auffüllen bei 0, 14, 15, 20, 35, 60, 90, 99 und 100 %, Restportionen, Nährmengen-Erhaltung, Online-/Offline-Gleichheit, Kühlschrankeffekt und Speicherübernahme.

## Fester Halteverdienst
Gedrückthalten auf der Karte ergibt genau eine Spielgeldeinheit pro Sekunde, unabhängig von Job und Gehaltsstufe. Tippen ergibt unverändert eine Spielgeldeinheit pro Tipp. Bei Euro-Anzeige entspricht das jeweils 1 €. Angebrochene Sekunden werden zeitanteilig berechnet. Bestehende Erschöpfungsregeln gelten weiter.

## Übersichtlicher Essen-und-Gesundheit-Bereich
Sättigung, Lebensenergie, Vorräte und Gesundheit werden ausschließlich im unteren Menüeintrag **Essen** angezeigt. Sie erscheinen nicht mehr über der Karte, Karriere, Börse, Besitz oder Einstellungen. Der Kontostand bleibt wie bisher oben sichtbar.

Im Bereich Essen gibt es vier Abschnitte: **Übersicht** mit zwei Statuskarten und Versorgungsdauer; **Essen** mit Vorrat und Einkauf; **Gesundheit** mit Spielarzt und Rezepten; **Haushalt** mit Handys, Geräten und Rechnungen. Es werden keine Haushaltsrechnungen mehr zwischen Lebensmitteln angezeigt. Die Spielmechanik und automatische Ernährung laufen unverändert weiter.
