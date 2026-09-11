import SwiftUI
struct HistoryView: View {
    @ObservedObject var model: EditorModel
    @Environment(\.dismiss) private var dismiss
    @State private var confirmDelete = false
    var body: some View {
        NavigationStack {
            Group {
                if model.history.isEmpty {
                    ContentUnavailableView("Noch keine Texte", systemImage: "clock", description: Text("Deine bearbeiteten Texte erscheinen hier."))
                } else {
                    List(model.history) { entry in
                        Button {
                            model.restore(entry); dismiss()
                        } label: {
                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    Text(entry.mode.rawValue).font(.headline)
                                    if entry.demo { Text("BEISPIEL").font(.caption).foregroundStyle(.secondary) }
                                    Spacer()
                                    Text(entry.date, style: .date).font(.caption)
                                }
                                Text(entry.output).lineLimit(3).foregroundStyle(.secondary)
                            }.padding(.vertical, 6)
                        }.buttonStyle(.plain)
                    }
                }
            }
            .navigationTitle("Verlauf")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Schließen") { dismiss() } }
                ToolbarItem(placement: .primaryAction) { Button("Alle löschen", role: .destructive) { confirmDelete = true }.disabled(model.history.isEmpty) }
            }
            .confirmationDialog("Den gesamten Verlauf löschen?", isPresented: $confirmDelete) {
                Button("Verlauf löschen", role: .destructive) { model.deleteHistory() }
            } message: { Text("Gespeicherte Texte werden von diesem Gerät entfernt.") }
        }
        #if os(macOS)
        .frame(minWidth: 560, minHeight: 450)
        #endif
    }
}
