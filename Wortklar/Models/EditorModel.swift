import SwiftUI
import Translation
@MainActor
final class EditorModel: ObservableObject {
    @Published var input = ""
    @Published var output = ""
    @Published var mode: WritingMode = .improve
    @Published var target = "en"
    @Published var source = "de"
    @Published var busy = false
    @Published var message: String?
    @Published var history: [HistoryEntry] = []
    struct TranslationRequest: Identifiable {
        let id = UUID()
        let input: String
        let source: String
        let target: String
        var configuration: TranslationSession.Configuration {
            .init(source: Locale.Language(identifier: source), target: Locale.Language(identifier: target))
        }
    }
    @Published var translationRequest: TranslationRequest?
    private let defaults: UserDefaults
    private let historyKey = "wortklar.history.v1"
    let service = WritingService()
    var valid: Bool { !input.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && input.count <= 3000 }
    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        if let data = defaults.data(forKey: historyKey) {
            do { history = try JSONDecoder().decode([HistoryEntry].self, from: data) }
            catch { message = "Der gespeicherte Verlauf konnte nicht gelesen werden." }
        }
    }
    func process() async {
        guard !busy else { return }
        guard valid else { return }
        message = nil; output = ""
        if mode == .translate {
            guard source != target else {
                message = "Bitte wähle unterschiedliche Ausgangs- und Zielsprachen."
                return
            }
            busy = true
            translationRequest = TranslationRequest(input: input, source: source, target: target)
            return
        }
        guard service.available else {
            message = "Die lokale KI ist nicht verfügbar. Aktiviere Apple Intelligence auf einem unterstützten Gerät und warte auf den Modelldownload."
            return
        }
        busy = true
        defer { busy = false }
        do {
            output = try await service.rewrite(input, mode: mode)
            if output.isEmpty { message = "Es wurde kein Text erzeugt. Bitte versuche es erneut." }
            else { save() }
        } catch { message = "Bearbeitung nicht möglich. Versuche einen kürzeren Text. Details: \(error.localizedDescription)" }
    }
    func translate(using session: TranslationSession, request: TranslationRequest) async {
        await runTranslation(request: request) {
            try await session.prepareTranslation()
            try Task.checkCancellation()
            return try await session.translate(request.input).targetText
        }
    }

    // Each attempt owns its state; a late completion cannot overwrite a newer result.
    func runTranslation(request: TranslationRequest, operation: () async throws -> String) async {
        guard translationRequest?.id == request.id else { return }
        defer {
            if translationRequest?.id == request.id { busy = false }
        }
        do {
            let result = try await operation()
            try Task.checkCancellation()
            guard translationRequest?.id == request.id else { return }
            guard !result.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
                message = "Die Übersetzung war leer. Bitte starte sie erneut."
                return
            }
            output = result
            save()
        } catch {
            guard translationRequest?.id == request.id else { return }
            let wasCancelled = error is CancellationError
            let error = error as NSError
            if Task.isCancelled || error.domain == NSCocoaErrorDomain && error.code == NSUserCancelledError
                || error.domain == NSURLErrorDomain && error.code == NSURLErrorCancelled
                || wasCancelled {
                message = "Die Übersetzung wurde abgebrochen. Klicke erneut auf „Text bearbeiten“ und bestätige gegebenenfalls den Sprachdownload."
            } else {
                message = "Die Übersetzung konnte nicht abgeschlossen werden. Prüfe die gewählten Sprachen und deine Internetverbindung für den Sprachdownload. Details: \(error.localizedDescription)"
            }
        }
    }
    func restore(_ item: HistoryEntry) {
        guard !busy else { return }
        translationRequest = nil
        input = item.input; output = item.output; mode = item.mode; target = item.target; message = nil
    }
    func deleteHistory() { history = []; defaults.removeObject(forKey: historyKey) }
    private func save() {
        history.insert(HistoryEntry(input: input, output: output, mode: mode, target: target, demo: false), at: 0)
        history = Array(history.prefix(50))
        do { defaults.set(try JSONEncoder().encode(history), forKey: historyKey) }
        catch { message = "Das Ergebnis wurde erstellt, aber nicht im Verlauf gespeichert." }
    }
}
