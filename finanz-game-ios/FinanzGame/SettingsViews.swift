import SwiftUI
import UniformTypeIdentifiers

struct SettingsScreen:View {
    @EnvironmentObject var store:NativeGameStore
    @State private var importing=false
    @State private var exporting=false
    @State private var document=GameSaveDocument()
    @State private var resetConfirmation=false
    var body:some View {
        Form {
            Section("Darstellung") {
                Picker("Modus",selection:$store.preferences.theme){Text("Wie auf dem Gerät").tag("system");Text("Hell").tag("light");Text("Dunkel").tag("dark")}
                Toggle("Sanfte Animationen",isOn:$store.preferences.motion)
                Toggle("Glas-Effekte",isOn:$store.preferences.glass)
                Picker("Währungssymbol",selection:$store.preferences.currency){Text("Euro · €").tag("EUR");Text("US-Dollar · $").tag("USD");Text("Franken · CHF").tag("CHF");Text("Pfund · £").tag("GBP")}
                Toggle("Cent anzeigen",isOn:$store.preferences.decimals)
                Text("Nur die Anzeige ändert sich. Alle Währungen gelten im Spiel 1:1, ohne echten Wechselkurs.").font(.caption).foregroundStyle(.secondary)
            }
            Section("Karte") { Picker("Geld verdienen",selection:$store.preferences.earningMode){Text("Tippen · 1 pro Tipp").tag("tap");Text("Gedrückthalten · 1 pro Sekunde").tag("hold")} }
            Section("Dein Spielstand") {
                Button("Spielstand exportieren",systemImage:"square.and.arrow.up") { do{document=GameSaveDocument(data:try store.exportData());exporting=true}catch{store.inform("Export nicht möglich.")} }
                Button("Spielstand importieren",systemImage:"square.and.arrow.down"){importing=true}
                Text("Lokaler Speicher auf diesem Gerät. Einen alten Browser- oder App-Stand kannst du als JSON-Datei übernehmen. Vor dem Löschen der App bitte exportieren.").font(.caption).foregroundStyle(.secondary)
                Button("Neues Spiel starten",role:.destructive){resetConfirmation=true}
            }
            Section("So läuft dein Spiel") {
                Text("Ein Monat dauert 10 Minuten. Nach einer erfolgreichen Bewerbung gibt es eine Jobaufgabe pro Monat. Die richtige Antwort schaltet das anteilige Gehalt frei.")
                Text("Firmen, Mieten, Rechnungen und Kreditraten werden monatlich verbucht. Beim Wiederöffnen werden vergangene Abschlüsse nachberechnet.")
                Text("Tippen ergibt 1 Spiel-Euro pro Tipp, Halten 1 pro Sekunde. Erschöpfung pausiert diese Aktionen. Essen und Gesundheit haben ihren eigenen Tab.")
            }.font(.subheadline)
            Section("Finanz Game · Neuaufbau") { Text("Native iPhone-Oberfläche mit lokal geprüfter Simulation. Banknamen, Firmenlogos und Bilder dienen nur der Identifizierung im Spiel. Keine echten Konten, Käufe, Medikamente oder Finanzprodukte.").font(.caption).foregroundStyle(.secondary) }
        }
        .navigationTitle("Einstellungen").navigationBarTitleDisplayMode(.inline)
        .fileImporter(isPresented:$importing,allowedContentTypes:[.json]) { result in
            do { let url=try result.get();let access=url.startAccessingSecurityScopedResource();defer{if access{url.stopAccessingSecurityScopedResource()}};try store.importData(Data(contentsOf:url)) } catch { store.inform("Diese Datei ist kein gültiger Finanz-Game-Spielstand.") }
        }
        .fileExporter(isPresented:$exporting,document:document,contentType:.json,defaultFilename:"Finanz-Game-Spielstand") { result in if case .failure = result { store.inform("Export wurde nicht abgeschlossen.") } }
        .confirmationDialog("Wirklich neu anfangen?",isPresented:$resetConfirmation,titleVisibility:.visible) { Button("Spielstand ersetzen",role:.destructive){store.reset()};Button("Abbrechen",role:.cancel){} } message: { Text("Exportiere deinen jetzigen Stand zuerst, wenn du ihn behalten möchtest.") }
    }
}
