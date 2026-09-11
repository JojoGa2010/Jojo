import Foundation
@main struct ModelChecks {
    @MainActor static func main() async {
        let name = "WortklarChecks-\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: name)!
        defer { defaults.removePersistentDomain(forName: name) }
        let model = EditorModel(defaults: defaults)
        assert(!model.valid)
        model.input = "   \n "
        assert(!model.valid)
        model.input = String(repeating: "a", count: 3001)
        assert(!model.valid)
        model.input = "Guten Morgen"
        model.mode = .translate
        model.source = "en"
        model.target = "en"
        await model.process()
        assert(!model.busy && model.translationRequest == nil)
        model.source = "de"
        await model.process()
        let first = model.translationRequest!
        await model.runTranslation(request: first) { throw CancellationError() }
        assert(!model.busy && model.output.isEmpty && model.history.isEmpty)
        assert(model.message?.contains("abgebrochen") == true)
        await model.process()
        let second = model.translationRequest!
        assert(first.id != second.id && model.busy)
        await model.runTranslation(request: first) { "Veraltetes Ergebnis" }
        assert(model.output.isEmpty && model.busy)
        await model.runTranslation(request: second) { "Good morning" }
        assert(model.output == "Good morning" && !model.busy && model.history.count == 1)
        await model.process()
        await model.runTranslation(request: model.translationRequest!) {
            throw NSError(domain: NSCocoaErrorDomain, code: NSUserCancelledError)
        }
        assert(!model.busy && model.history.count == 1)
        assert(model.message?.contains("abgebrochen") == true)
        print("PASS: same-language validation, cancellation, fresh retry, stale completion isolation and successful translation persistence")
        let restored = EditorModel(defaults: defaults)
        assert(restored.history.count == 1)
        assert(restored.history[0].demo == false)
        restored.restore(restored.history[0])
        assert(restored.input == "Guten Morgen" && restored.output == "Good morning")
        restored.deleteHistory()
        assert(EditorModel(defaults: defaults).history.isEmpty)
        print("PASS: validation, real-result persistence, restore and deletion")
    }
}
