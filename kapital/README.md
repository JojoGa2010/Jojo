# KAPITAL – Dein nächster Zug

Eigenständiger, mobil bedienbarer Prototyp einer fiktiven Wirtschaftssimulation. Keine Verbindung zu echten Banken, kein echtes Geld. Namen der Banken dienen nur zur Auswahl; die Spielkarten sind eigene Entwürfe ohne echte Banklogos.

## Einfach spielen

1. Die veröffentlichte Spielseite öffnen.
2. Unter **Karriere** kostenlos als Aushilfe bewerben. Dein Gehalt fließt automatisch.
3. Auf **Übersicht** die Bankkarte gedrückt halten. Das gibt zusätzliches Geld und Erfahrung. Am Computer geht auch die Leertaste bei ausgewählter Karte.
4. Über **Bank wechseln** Raiffeisen, Sparkasse, Volksbank, Bank Austria, N26 oder Revolut auswählen. Die Konditionen sind im Spiel gleich.
5. Unter **Börse** Anteile handeln; unter **Besitz** Immobilien, Unternehmen, Sammlerstücke, Autos, Schiffe, Flughäfen und Inseln kaufen oder finanzieren.
6. Unter **Finanzen** Kredite verwalten. Über das Zahnrad den Spielstand exportieren oder wieder importieren.

## Speicherstand

Automatisch im Browser auf diesem Gerät. Browserdaten löschen löscht auch den Stand. Für Gerätewechsel die Exportdatei verwenden. Kein Cloudkonto, keine Zahlung, keine Verbindung zu echten Konten.

## Wirtschaft und Zeit

Ein Spielmonat dauert zwölf echte Minuten. Alle Gehälter, Mieten, laufenden Kosten und Raten verwenden diese Zeitbasis. Offline-Fortschritt ist auf einen Spielmonat begrenzt. Weiterbildung kostet einmalig und erfordert Erfahrung; Bewerbungen werden beim Erfüllen der Bedingungen angenommen.

Startkapital 2.500 €. Aushilfe: 1.550 € monatlich. Besitzpreise von 6.500 € bis 85 Mio. €. Ausgewiesene Betriebserträge sind nach Kosten. Privatfahrzeuge und Naturinsel verursachen Unterhalt. Kurse sind zufällig simuliert und ändern sich alle 30 Sekunden; Aktien werden mit 0,5 % Gebühr gehandelt. Keine echte Marktpreisanbindung. Alle Werte sind Spielparameter, keine Finanzberatung oder Bankkonditionen.

Kredite: nominal 6,5 % Jahreszins, laufende Verzinsung und Tilgung; 36 Spielmonate bei Privatkredit, 60 bei Objektfinanzierung. Objektfinanzierung benötigt 30 % Eigenkapital. Gesamtraten maximal 40 % des Gehalts und positiver Besitzerträge. Kreditrahmen berücksichtigt Einkommen und Besitz. Verkaufserlös 90 % des Kaufpreises, bestehende Kredite laufen weiter. Reicht das Geld nicht, bleiben unbezahlte Schulden verzinst bestehen. Kosten können das Guthaben im Prototyp auf null senken; ein erweitertes Insolvenzverfahren ist noch nicht enthalten.

## Technik und Prüfung

Statische HTML/CSS/JavaScript-App ohne Installation oder Build. `dist/index.html` kann lokal geöffnet oder der Ordner `dist` auf einem statischen Webhost bereitgestellt werden. Google Fonts optional, Systemschriften als Ersatz. Spielmechanik unabhängig von der Oberfläche in `engine.js`.

Prüfung: `node test-engine.cjs`. Start eines lokalen Webservers: `python3 -m http.server 8088 --directory dist`.

Umfang: alle beschriebenen Grundaktionen spielbar; keine Mehrspielerfunktion, reale Bankanbindung oder individuell modellierten Unternehmensprozesse. Moderne Browser vorausgesetzt.
