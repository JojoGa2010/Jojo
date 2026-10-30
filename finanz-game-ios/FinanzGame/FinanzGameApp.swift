import SwiftUI

@main
struct FinanzGameApp: App {
    @StateObject private var store = NativeGameStore()
    var body: some Scene { WindowGroup { NativeGameRoot().environmentObject(store).preferredColorScheme(store.appearance) } }
}

struct NativeGameRoot: View {
    @EnvironmentObject var store: NativeGameStore
    @Environment(\.scenePhase) private var scenePhase
    var body: some View {
        VStack(spacing: 0) {
            WalletHeader()
            if store.loading { Spacer(); ProgressView("Spielstand wird übernommen …"); Spacer() }
            else if store.state.isNull { Spacer();EmptyPanel(title:"Spieldateien nicht verfügbar",description:"Öffne das vollständige Xcode-Projekt und baue die App erneut.");Spacer() }
            else {
                TabView(selection: $store.tab) {
                    NavigationStack { CareerScreen() }.tabItem { Label(GameTab.career.title, systemImage: GameTab.career.symbol) }.tag(GameTab.career)
                    NavigationStack { WealthScreen() }.tabItem { Label(GameTab.wealth.title, systemImage: GameTab.wealth.symbol) }.tag(GameTab.wealth)
                    NavigationStack { EarnScreen() }.tabItem { Label(GameTab.earn.title, systemImage: GameTab.earn.symbol) }.tag(GameTab.earn)
                    NavigationStack { LifeScreen() }.tabItem { Label(GameTab.life.title, systemImage: GameTab.life.symbol) }.tag(GameTab.life)
                    NavigationStack { SettingsScreen() }.tabItem { Label(GameTab.settings.title, systemImage: GameTab.settings.symbol) }.tag(GameTab.settings)
                }.tint(.gameGold)
            }
        }
        .overlay(alignment: .bottom) { if let toast = store.toast { Text(toast).font(.subheadline.weight(.medium)).multilineTextAlignment(.center).padding(15).background(.regularMaterial, in: RoundedRectangle(cornerRadius: 17)).shadow(color: .black.opacity(0.12), radius: 20).padding(.horizontal, 20).padding(.bottom, 88).allowsHitTesting(false).accessibilityAddTraits(.updatesFrequently) } }
        .onChange(of: store.tab) { _, _ in store.hold(false) }
        .onChange(of: scenePhase) { _, phase in if phase == .active { store.resume() } else { store.pause() } }
        .alert("Finanz Game", isPresented: Binding(get: { store.failure != nil }, set: { if !$0 { store.failure = nil } })) { Button("OK") { store.failure = nil } } message: { Text(store.failure ?? "") }
    }
}
struct WalletHeader: View {
    @EnvironmentObject var store: NativeGameStore
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Label("FINANZ GAME", systemImage: "chart.line.uptrend.xyaxis.circle.fill").font(.system(size: 11, weight: .bold, design: .rounded)).tracking(1.4).foregroundStyle(Color.gameGold)
                Spacer(); Text("FIKTIVE SIMULATION").font(.system(size: 8, weight: .semibold)).foregroundStyle(.secondary)
            }
            HStack(alignment: .firstTextBaseline) {
                Text("Kontostand").font(.caption).foregroundStyle(.secondary)
                Spacer()
                Text(store.loading ? "…" : store.money(store.state["cash"].number)).font(.system(size: 30, weight: .bold, design: .rounded)).monospacedDigit().lineLimit(1).minimumScaleFactor(0.5).accessibilityLabel("Kontostand " + store.money(store.state["cash"].number)).accessibilityIdentifier("wallet.balance")
            }
        }.padding(.horizontal, 21).padding(.vertical, 13).background(.regularMaterial).overlay(alignment: .bottom) { Divider().opacity(0.4) }
    }
}
struct EarnScreen: View {
    @EnvironmentObject var store: NativeGameStore
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var pressing = false
    @State private var bankSheet = false
    var body: some View {
        GamePage {
            PageHeading(title: "Dein nächster Euro.", subtitle: "Deine Karte. Dein Tempo. Dein Finanz Game.")
            Picker("Verdienst-Modus", selection: $store.preferences.earningMode) { Text("Tippen · 1 €").tag("tap"); Text("Halten · 1 €/s").tag("hold") }.pickerStyle(.segmented)
            NativeBankCard(bank: store.state["bank"].string, pressed: pressing)
                .scaleEffect(pressing && !reduceMotion && store.preferences.motion ? 0.985 : 1)
                .animation(reduceMotion || !store.preferences.motion ? nil : .spring(response: 0.25), value: pressing)
                .gesture(DragGesture(minimumDistance: 0).onChanged { _ in pressing = true; if store.preferences.earningMode == "hold" { store.hold(true) } }.onEnded { value in
                    pressing = false; store.hold(false)
                    if store.preferences.earningMode == "tap" && abs(value.translation.width) < 25 && abs(value.translation.height) < 25 { store.tap() }
                })
                .accessibilityIdentifier("earn.card").accessibilityElement(children: .ignore).accessibilityLabel("Virtuelle \(store.state["bank"].string)-Karte").accessibilityHint("Tippen verdient einen Spiel-Euro. Im Halte-Modus Finger gedrückt halten.").accessibilityAddTraits(.isButton).accessibilityAction { store.tap() }
            HStack { Label(store.preferences.earningMode == "tap" ? "1 Spiel-Euro pro Tipp" : "1 Spiel-Euro pro Sekunde", systemImage: "hand.tap").font(.caption).foregroundStyle(.secondary); Spacer(); Button("Bank wechseln") { bankSheet = true }.font(.caption.weight(.semibold)) }
            PayDayPanel()
            HStack(spacing: 12) { MetricTile(title: "Nettovermögen", value: store.money(store.derived("net").number, compact: true), symbol: "chart.pie"); MetricTile(title: "Aktueller Job", value: store.currentJob.isNull ? "Noch offen" : store.currentJob["name"].string, symbol: "briefcase") }
            GamePanel {
                SectionHeading(title: "Deine nächsten Schritte", symbol: "arrow.up.right")
                Button { store.tab = .career } label: { Label("Karriere & Monatsaufgabe", systemImage: "briefcase.fill").frame(maxWidth: .infinity, alignment: .leading) }
                Divider()
                Button { store.tab = .wealth } label: { Label("Investieren & Firma gründen", systemImage: "building.2.fill").frame(maxWidth: .infinity, alignment: .leading) }
            }
        }
        .navigationBarHidden(true)
        .onDisappear { pressing = false; store.hold(false) }
        .onChange(of: store.preferences.earningMode) { _, _ in pressing = false; store.hold(false) }
        .sheet(isPresented: $bankSheet) {
            NavigationStack { List(store.banks, id: \.self) { bank in Button { if store.perform("changeBank", [bank]) { bankSheet = false } } label: { HStack { Text(bank); Spacer(); if store.state["bank"].string == bank { Image(systemName: "checkmark.circle.fill") } } } }.navigationTitle("Deine virtuelle Bank").toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Fertig") { bankSheet = false } } }.safeAreaInset(edge: .bottom) { Text("Eigene Spielkarten. Keine echten Bankkonten oder Zahlungen.").font(.caption).foregroundStyle(.secondary).padding() } }
        }
    }
}
struct NativeBankCard: View {
    let bank: String; let pressed: Bool
    var colors: [Color] {
        switch bank {
        case "Raiffeisen": [Color(red:0.88,green:0.68,blue:0.17),Color(red:1,green:0.88,blue:0.49),Color(red:0.73,green:0.53,blue:0.12)]
        case "Sparkasse": [Color(red:0.53,green:0.06,blue:0.15),Color(red:0.9,green:0.19,blue:0.3),Color(red:0.58,green:0.07,blue:0.18)]
        case "Volksbank": [.gameNavy,Color(red:0.2,green:0.4,blue:0.7),Color(red:0.09,green:0.17,blue:0.35)]
        case "N26": [Color(red:0.65,green:0.8,blue:0.76),Color(red:0.9,green:0.97,blue:0.93),Color(red:0.59,green:0.73,blue:0.69)]
        case "Revolut": [.gray,Color(red:0.9,green:0.88,blue:0.96),Color(red:0.48,green:0.46,blue:0.55)]
        default: [.gameNavy,Color(red:0.3,green:0.32,blue:0.4),Color(red:0.53,green:0.1,blue:0.23)]
        }
    }
    var darkInk: Bool { ["Raiffeisen","N26","Revolut"].contains(bank) }
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 25).fill(LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing))
            GeometryReader { g in Path { p in p.move(to: CGPoint(x:g.size.width*0.6,y:-40)); p.addCurve(to:CGPoint(x:g.size.width+80,y:g.size.height+40),control1:CGPoint(x:g.size.width*0.2,y:g.size.height*0.5),control2:CGPoint(x:g.size.width*1.2,y:20)) }.stroke(.white.opacity(0.2),lineWidth:70) }.clipShape(RoundedRectangle(cornerRadius:25))
            VStack(alignment: .leading, spacing: 0) {
                HStack { Text(bank).font(.title3.weight(.bold)); Spacer(); Text("SIMULATION").font(.system(size: 8,weight:.bold)).tracking(1).padding(7).overlay(RoundedRectangle(cornerRadius:6).stroke(.primary.opacity(0.2))) }
                Spacer(minLength: 18)
                HStack(spacing: 13) { Image(systemName: "simcard").font(.system(size: 31)).foregroundStyle(Color(red:0.78,green:0.65,blue:0.33)); Image(systemName: "wave.3.right").font(.title3).opacity(0.6) }
                Spacer(minLength: 15)
                Text("••••  ••••  ••••  2048").font(.system(size: 17,weight:.medium,design:.monospaced)).tracking(1.6)
                HStack { Text("FINANZ GAME"); Spacer(); Text("VIRTUELLE DEBITKARTE") }.font(.system(size:8,weight:.semibold)).tracking(1).padding(.top,15)
            }.padding(25)
        }.foregroundStyle(darkInk ? Color.gameNavy : .white).aspectRatio(1.586,contentMode:.fit).shadow(color:colors[0].opacity(0.2),radius:18,y:10).brightness(pressed ? 0.04 : 0)
    }
}
