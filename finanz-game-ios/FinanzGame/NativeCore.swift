import SwiftUI
import JavaScriptCore
import WebKit
import UniformTypeIdentifiers

struct J: Identifiable {
    let raw: Any
    init(_ raw: Any? = nil) { self.raw = raw ?? NSNull() }
    subscript(_ key: String) -> J { J((raw as? [String: Any])?[key]) }
    subscript(_ index: Int) -> J { let a = array; return a.indices.contains(index) ? a[index] : J() }
    var array: [J] { (raw as? [Any] ?? []).map { J($0) } }
    var string: String { raw as? String ?? "" }
    var number: Double { (raw as? NSNumber)?.doubleValue ?? 0 }
    var int: Int { Int(number) }
    var bool: Bool { (raw as? NSNumber)?.boolValue ?? false }
    var isNull: Bool { raw is NSNull }
    var id: String { self["id"].string.isEmpty ? self["name"].string : self["id"].string }
}

struct GamePreferences: Codable, Equatable {
    var theme = "system"
    var currency = "EUR"
    var decimals = true
    var motion = true
    var glass = true
    var earningMode = "tap"
}

// Debug-only routes let simulator previews use an isolated save, never the player's data.
enum GameTestLaunch {
    static func option(_ key: String) -> String? {
        #if DEBUG
        let args = ProcessInfo.processInfo.arguments
        guard args.contains("-finanz-ui-test"), let i = args.firstIndex(of: key), args.indices.contains(i + 1) else { return nil }
        return args[i + 1]
        #else
        return nil
        #endif
    }
}

enum GameTab: String, CaseIterable, Identifiable {
    case career, wealth, earn, life, settings
    var id: String { rawValue }
    var title: String { switch self { case .career: "Karriere"; case .wealth: "Vermögen"; case .earn: "Verdienen"; case .life: "Essen"; case .settings: "Einstellungen" } }
    var symbol: String { switch self { case .career: "briefcase.fill"; case .wealth: "chart.pie.fill"; case .earn: "creditcard.fill"; case .life: "fork.knife"; case .settings: "gearshape.fill" } }
}

@MainActor
final class NativeGameStore: NSObject, ObservableObject, WKScriptMessageHandler {
    @Published var state = J()
    @Published var tab: GameTab = .earn
    @Published var loading = true
    @Published var toast: String?
    @Published var failure: String?
    @Published var preferences = GamePreferences() { didSet { if let data = try? JSONEncoder().encode(preferences) { defaults.set(data, forKey: "finanzgame.native.preferences") } } }
    private let defaults: UserDefaults
    private let context = JSContext()!
    private var game: JSValue!
    private var jsState: JSValue!
    private var migrationView: WKWebView?
    private var initialized = false
    private var timer: Timer?
    private var lastTick = Date()
    private var lastSave = Date()
    private var holding = false
    private var active = true
    private var toastGeneration = 0
    let saveKey = "finanzgame.native.save.v2"
    var jobs: [J] = []; var stocks: [J] = []; var assets: [J] = []
    var companyTypes: [J] = []; var products: [J] = []; var medicines: [J] = []; var questions: [J] = []; var banks: [String] = []; var services: [J] = []

    override init() {
        #if DEBUG
        let testing = ProcessInfo.processInfo.arguments.contains("-finanz-ui-test")
        defaults = testing ? UserDefaults(suiteName: "com.jojoga.finanzgame.ui-tests")! : .standard
        if testing && ProcessInfo.processInfo.arguments.contains("-finanz-ui-test-clean") { defaults.removePersistentDomain(forName: "com.jojoga.finanzgame.ui-tests") }
        #else
        let testing = false
        defaults = .standard
        #endif
        super.init()
        guard let folder = Bundle.main.url(forResource: "Web", withExtension: nil), let source = try? String(contentsOf: folder.appendingPathComponent("engine.js"), encoding: .utf8) else { failure = "Die lokale Spiellogik fehlt."; loading = false; return }
        context.evaluateScript("var window = this;")
        context.evaluateScript(source)
        guard context.exception == nil, let value = context.objectForKeyedSubscript("Game"), !value.isUndefined else { failure = "Die Spiellogik konnte nicht geladen werden."; loading = false; return }
        game = value
        func catalog(_ name: String) -> [J] { J(game.forProperty(name)?.toArray()).array }
        jobs = catalog("JOBS"); stocks = catalog("STOCKS"); assets = catalog("ASSETS"); companyTypes = catalog("COMPANY_TYPES"); products = catalog("SHOP"); medicines = catalog("MEDICINES"); questions = catalog("QUESTIONS"); services = catalog("SERVICES"); banks = catalog("BANKS").map(\.string)
        if let data = defaults.data(forKey: "finanzgame.native.preferences"), let p = try? JSONDecoder().decode(GamePreferences.self, from: data) { preferences = p }
        if let value = GameTestLaunch.option("-finanz-ui-test-tab"), let target = GameTab(rawValue: value) { tab = target }
        if let value = GameTestLaunch.option("-finanz-ui-test-theme"), ["light", "dark"].contains(value) { preferences.theme = value }
        jsState = game.forProperty("fresh")?.call(withArguments: [])
        if let data = defaults.data(forKey: saveKey) {
            do { try setSave(data, offline: true); finishLoading() }
            catch { failure = "Dein gespeicherter Stand konnte nicht geladen werden. Er wurde nicht überschrieben. Bitte importiere eine Sicherung."; refresh(); loading = false }
        } else if testing {
            finishLoading()
        } else {
            refresh()
            let configuration = WKWebViewConfiguration()
            configuration.userContentController.add(self, name: "legacySave")
            // Read the original file origin before any old UI scripts run. No Web UI is displayed.
            let script = "try { window.webkit.messageHandlers.legacySave.postMessage({save:localStorage.getItem('kapital-v1')||'',prefs:localStorage.getItem('kapital-preferences')||''}); } catch(e) { window.webkit.messageHandlers.legacySave.postMessage({save:'',prefs:''}); } window.stop();"
            configuration.userContentController.addUserScript(WKUserScript(source: script, injectionTime: .atDocumentStart, forMainFrameOnly: true))
            migrationView = WKWebView(frame: .zero, configuration: configuration)
            migrationView?.loadFileURL(folder.appendingPathComponent("index.html"), allowingReadAccessTo: folder)
            DispatchQueue.main.asyncAfter(deadline: .now() + 4) { [weak self] in
                guard let self, !self.initialized else { return }
                self.refresh(); self.loading = false
                self.failure = "Der bisherige Spielstand konnte noch nicht automatisch gelesen werden. Importiere ihn unter Einstellungen, oder starte dort bewusst ein neues Spiel. Dein alter Stand bleibt erhalten."
            }
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard !initialized, message.frameInfo.isMainFrame, let body = message.body as? [String: String] else { return }
        let text = body["save"] ?? ""
        if !text.isEmpty, let data = text.data(using: .utf8) {
            defaults.set(data, forKey: "finanzgame.legacy.backup")
            do { try setSave(data, offline: true) }
            catch { failure = "Der alte Stand ist gesichert, konnte aber nicht übernommen werden. Importiere eine Spielstand-Datei. Es wurde kein alter Stand gelöscht."; loading = false; refresh(); return }
        }
        if let data = body["prefs"]?.data(using: .utf8), let p = try? JSONDecoder().decode(GamePreferences.self, from: data) { preferences = p }
        finishLoading()
    }

    private func finishLoading() {
        initialized = true; loading = false; lastTick = Date(); refresh(); persist()
        migrationView?.stopLoading(); migrationView?.configuration.userContentController.removeScriptMessageHandler(forName: "legacySave"); migrationView = nil
        timer?.invalidate()
        let t = Timer(timeInterval: 0.2, repeats: true) { [weak self] _ in Task { @MainActor in self?.advance() } }
        RunLoop.main.add(t, forMode: .common); timer = t
    }
    private func setSave(_ data: Data, offline: Bool) throws {
        guard data.count <= 1_000_000, let text = String(data: data, encoding: .utf8) else { throw CocoaError(.fileReadCorruptFile) }
        context.exception = nil; context.setObject(text, forKeyedSubscript: "incomingSave" as NSString)
        guard let parsed = context.evaluateScript("Game.migrate(JSON.parse(incomingSave))"), context.exception == nil, game.forProperty("valid")?.call(withArguments: [parsed])?.toBool() == true else { context.exception = nil; throw CocoaError(.fileReadCorruptFile) }
        jsState = parsed
        if offline { _ = game.forProperty("catchUp")?.call(withArguments: [jsState!]) }
        else { jsState.setValue(Date().timeIntervalSince1970 * 1000, forProperty: "last") }
    }
    func advance() {
        guard initialized, active else { return }
        let now = Date(), seconds = max(0, now.timeIntervalSince(lastTick)); lastTick = now
        context.exception = nil
        _ = game.forProperty("tick")?.call(withArguments: [jsState!, seconds, holding])
        if let error = context.exception { failure = "Die Simulation wurde angehalten: \(error.toString() ?? "Unbekannter Fehler")"; active = false; return }
        refresh()
        if now.timeIntervalSince(lastSave) >= 3 { persist(); lastSave = now }
    }
    func pause() { advance(); holding = false; active = false; persist() }
    func resume() {
        guard initialized else { return }
        holding = false; _ = game.forProperty("catchUp")?.call(withArguments: [jsState!]); lastTick = Date(); active = true; refresh(); persist()
    }
    func hold(_ pressed: Bool) { guard pressed != holding, initialized else { return }; advance(); holding = pressed; if !pressed { persist() } }
    func tap() {
        guard initialized else { return }; advance()
        let amount = game.forProperty("tap")?.call(withArguments: [jsState!])?.toDouble() ?? 0
        if amount == 0 { inform("Du bist erschöpft. Öffne Essen und Gesundheit.") }
        else { UIImpactFeedbackGenerator(style: .soft).impactOccurred() }
        refresh(); persist()
    }
    @discardableResult func perform(_ name: String, _ arguments: [Any] = [], success: String? = nil) -> Bool {
        guard initialized else { inform("Bitte übernimm zuerst deinen Spielstand oder starte ein neues Spiel in den Einstellungen."); return false }
        advance(); context.exception = nil
        let result = game.forProperty(name)?.call(withArguments: [jsState!] + arguments)
        if let e = context.exception { inform("Aktion nicht möglich: \(e.toString() ?? "Fehler")"); context.exception = nil; return false }
        if result?.isString == true, let message = result?.toString(), !message.isEmpty { inform(message); refresh(); return false }
        refresh(); persist(); if let success { inform(success) }; return true
    }
    func derived(_ name: String, _ args: [Any] = []) -> J { J(game.forProperty(name)?.call(withArguments: [jsState!] + args)?.toObject()) }
    func rawDerived(_ name: String, _ args: [Any]) -> J { J(game.forProperty(name)?.call(withArguments: args)?.toObject()) }
    private func refresh() { state = J(jsState?.toDictionary()) }
    func persist() { guard initialized, let data = try? JSONSerialization.data(withJSONObject: jsState.toDictionary() ?? [:]) else { return }; defaults.set(data, forKey: saveKey) }
    func exportData() throws -> Data { advance(); return try JSONSerialization.data(withJSONObject: jsState.toDictionary() ?? [:], options: [.prettyPrinted, .sortedKeys]) }
    func importData(_ data: Data) throws { try setSave(data, offline: false); failure = nil; if !initialized { finishLoading() } else { lastTick = Date(); refresh(); persist() }; inform("Spielstand übernommen.") }
    func reset() { jsState = game.forProperty("fresh")?.call(withArguments: []); failure = nil; if !initialized { finishLoading() } else { refresh(); persist(); lastTick = Date() }; inform("Neues Spiel gestartet.") }
    func inform(_ message: String) { toast = message; toastGeneration += 1; let generation = toastGeneration; DispatchQueue.main.asyncAfter(deadline: .now() + 3.5) { [weak self] in if self?.toastGeneration == generation { self?.toast = nil } } }
    func money(_ amount: Double, compact: Bool = false) -> String { amount.formatted(.currency(code: preferences.currency).locale(Locale(identifier: "de_AT")).precision(.fractionLength(compact || !preferences.decimals ? 0 : 2))) }
    func remaining(_ target: Double) -> String { let t = max(0, Int(ceil(target - state["elapsed"].number))); return String(format: "%d:%02d", t / 60, t % 60) }
    var payCountdown: String { remaining(state["elapsed"].number + derived("nextPay").number) }
    var currentJob: J { let i = state["job"].int; return jobs.indices.contains(i) ? jobs[i] : J() }
    var workDone: Bool { state["work"]["completed"].int == 1 }
    var appearance: ColorScheme? { preferences.theme == "dark" ? .dark : preferences.theme == "light" ? .light : nil }
}

struct GameSaveDocument: FileDocument {
    static var readableContentTypes: [UTType] { [.json] }
    var data: Data
    init(data: Data = Data()) { self.data = data }
    init(configuration: ReadConfiguration) throws { data = configuration.file.regularFileContents ?? Data() }
    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper { FileWrapper(regularFileWithContents: data) }
}
