import SwiftUI
import WebKit
import UniformTypeIdentifiers

@main
struct FinanzGameApp: App {
    var body: some Scene {
        WindowGroup { GameRootView() }
    }
}

enum GameTab: String, CaseIterable, Identifiable {
    case career, stocks, earn, assets, settings
    var id: String { rawValue }
    var title: String {
        switch self {
        case .earn: "Verdienen"
        case .career: "Karriere"
        case .stocks: "Börse"
        case .assets: "Besitz"
        case .settings: "Einstellungen"
        }
    }
    var symbol: String {
        switch self {
        case .earn: "creditcard.fill"
        case .career: "briefcase.fill"
        case .stocks: "chart.xyaxis.line"
        case .assets: "building.2.fill"
        case .settings: "gearshape.fill"
        }
    }
}

/// One persistent web view preserves one economy and one save across native tabs.
@MainActor
final class GameController: NSObject, ObservableObject, WKNavigationDelegate, WKScriptMessageHandler {
    @Published var selection: GameTab = .earn
    @Published var ready = false
    @Published var appearance = "system"
    @Published var balanceText = "…"
    @Published var exportURL: URL?
    @Published var showImporter = false
    @Published var errorMessage: String?
    let webView: WKWebView

    override init() {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        let controller = WKUserContentController()
        controller.addUserScript(WKUserScript(source: "document.documentElement.classList.add('native-app');", injectionTime: .atDocumentStart, forMainFrameOnly: true))
        configuration.userContentController = controller
        webView = WKWebView(frame: .zero, configuration: configuration)
        super.init()
        controller.add(self, name: "finanz")
        webView.navigationDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        if let folder = Bundle.main.url(forResource: "Web", withExtension: nil),
           FileManager.default.fileExists(atPath: folder.appendingPathComponent("index.html").path) {
            webView.loadFileURL(folder.appendingPathComponent("index.html"), allowingReadAccessTo: folder)
        } else { errorMessage = "Die Spieldateien fehlen im App-Paket." }
    }

    func navigate(_ tab: GameTab) {
        guard ready else { return }
        webView.evaluateJavaScript("page='\(tab.rawValue)';render();window.scrollTo(0,0);")
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        ready = true
        navigate(selection)
        webView.evaluateJavaScript("window.webkit.messageHandlers.finanz.postMessage({type:'appearance',value:preferences.theme});")
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        errorMessage = error.localizedDescription
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame, let body = message.body as? [String: Any], let type = body["type"] as? String else { return }
        switch type {
        case "balance":
            if let value = body["value"] as? String, value.count <= 100 { balanceText = value }
        case "appearance":
            if let value = body["value"] as? String, ["system", "light", "dark"].contains(value) { appearance = value }
        case "navigate":
            if let value = body["value"] as? String, let tab = GameTab(rawValue: value) { selection = tab }
        case "export":
            guard let value = body["value"] as? String, value.utf8.count <= 100_000 else { return }
            do {
                let url = FileManager.default.temporaryDirectory.appendingPathComponent("Finanz-Game-Spielstand.json")
                try value.write(to: url, atomically: true, encoding: .utf8)
                exportURL = url
            } catch { errorMessage = "Der Spielstand konnte nicht exportiert werden." }
        case "import": showImporter = true
        default: break
        }
    }

    func importSave(_ result: Result<URL, Error>) {
        do {
            let url = try result.get()
            let granted = url.startAccessingSecurityScopedResource()
            defer { if granted { url.stopAccessingSecurityScopedResource() } }
            let data = try Data(contentsOf: url)
            guard data.count <= 100_000 else { throw CocoaError(.fileReadTooLarge) }
            let object = try JSONSerialization.jsonObject(with: data)
            let canonical = try JSONSerialization.data(withJSONObject: object)
            let json = String(decoding: canonical, as: UTF8.self)
            // JSON is passed as an argument rather than interpolated as executable code.
            webView.callAsyncJavaScript("return window.importNativeSave(payload);", arguments: ["payload": json], in: nil, in: .page) { [weak self] result in
                if case .failure = result { self?.errorMessage = "Die Datei ist kein gültiger Finanz-Game-Spielstand." }
            }
        } catch { errorMessage = "Die Spielstand-Datei konnte nicht geladen werden." }
    }

    func background() { webView.evaluateJavaScript("holding=false;G.catchUp(state);save();") }
    func foreground() { webView.evaluateJavaScript("G.catchUp(state);save();update();") }
}

struct GameRootView: View {
    @StateObject private var game = GameController()
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        VStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 7) {
                HStack {
                    Label("Finanz Game", systemImage: "chart.line.uptrend.xyaxis.circle.fill")
                        .font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                    Spacer()
                    Text("SIMULATION").font(.system(size: 9, weight: .semibold, design: .rounded))
                        .padding(.horizontal, 9).padding(.vertical, 4)
                        .background(.thinMaterial, in: Capsule())
                }
                HStack(alignment: .firstTextBaseline) {
                    Text("Kontostand").font(.caption).foregroundStyle(.secondary)
                    Spacer(minLength: 12)
                    Text(game.balanceText)
                        .font(.system(size: 29, weight: .bold, design: .rounded))
                        .monospacedDigit().lineLimit(1).minimumScaleFactor(0.55)
                        .accessibilityLabel("Kontostand " + game.balanceText)
                }
            }.padding(.horizontal, 20).padding(.vertical, 12)
                .background(.regularMaterial)


            ZStack(alignment: .bottom) {
                GameWebView(webView: game.webView)
                if !game.ready { ProgressView("Dein Spiel wird geladen …").frame(maxWidth: .infinity, maxHeight: .infinity).background(.background) }
            }

            // System TabView adopts Liquid Glass automatically on iOS 26 with the iOS 26 SDK.
            // iOS 17–18 use the native material tab bar provided by that OS.
            TabView(selection: $game.selection) {
                ForEach(GameTab.allCases) { tab in
                    Color.clear
                        .tabItem { Label(tab.title, systemImage: tab.symbol) }
                        .tag(tab)
                }
            }.frame(height: 58).tint(.teal)
        }
        .preferredColorScheme(game.appearance == "system" ? nil : game.appearance == "dark" ? .dark : .light)
        .onChange(of: game.selection) { _, tab in game.navigate(tab) }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active { game.foreground() }
            else { game.background() }
        }
        .fileImporter(isPresented: $game.showImporter, allowedContentTypes: [.json], onCompletion: game.importSave)
        .sheet(isPresented: Binding(get: { game.exportURL != nil }, set: { if !$0 { game.exportURL = nil } })) {
            if let url = game.exportURL { ShareSheet(url: url).presentationDetents([.medium, .large]) }
        }
        .alert("Finanz Game", isPresented: Binding(get: { game.errorMessage != nil }, set: { if !$0 { game.errorMessage = nil } })) {
            Button("OK") { game.errorMessage = nil }
        } message: { Text(game.errorMessage ?? "") }
    }
}

struct GameWebView: UIViewRepresentable {
    let webView: WKWebView
    func makeUIView(context: Context) -> WKWebView { webView }
    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

struct ShareSheet: UIViewControllerRepresentable {
    let url: URL
    func makeUIViewController(context: Context) -> UIActivityViewController { UIActivityViewController(activityItems: [url], applicationActivities: nil) }
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
