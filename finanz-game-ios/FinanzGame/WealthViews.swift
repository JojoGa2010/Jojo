import SwiftUI
import Charts

struct WealthScreen: View {
    @EnvironmentObject var store: NativeGameStore
    @State private var section = GameTestLaunch.option("-finanz-ui-test-section") ?? "Übersicht"
    var body: some View {
        GamePage {
            PageHeading(title:"Dein Vermögen wächst.",subtitle:"Investieren, besitzen und selbst etwas aufbauen.")
            ChoiceChips(options:["Übersicht","Aktien","Besitz","Firmen","Kredite"],selection:$section)
            switch section {
            case "Aktien": StocksSection()
            case "Besitz": AssetsSection()
            case "Firmen": CompaniesSection()
            case "Kredite": CreditSection()
            default: overview
            }
        }.navigationTitle("Vermögen").navigationBarTitleDisplayMode(.inline)
    }
    var overview: some View {
        VStack(spacing:18) {
            HStack(spacing:12) { MetricTile(title:"Nettovermögen",value:store.money(store.derived("net").number,compact:true),symbol:"chart.pie.fill");MetricTile(title:"Schulden",value:store.money(store.derived("debt").number+store.state["arrears"].number,compact:true),symbol:"creditcard") }
            GamePanel {
                SectionHeading(title:"Vermögensverlauf",symbol:"chart.xyaxis.line")
                Chart(Array(store.state["history"].array.enumerated()),id:\.offset) { i,value in LineMark(x:.value("Zeit",i),y:.value("Vermögen",value.number)).foregroundStyle(Color.gameGold).interpolationMethod(.monotone) }.frame(height:160).chartXAxis(.hidden)
                Text("Gespeicherter Verlauf deines Nettovermögens. Besitz ist zum Verkaufswert bewertet.").font(.caption).foregroundStyle(.secondary)
            }
            PayDayPanel()
            GamePanel {
                SectionHeading(title:"Monatsplan",symbol:"calendar")
                DetailLine(label:"Maximales Jobgehalt",value:store.money(store.derived("salary").number))
                DetailLine(label:"Firmen & Besitzerträge",value:store.money(store.derived("passive").number))
                DetailLine(label:"Haushalt",value:store.money(store.derived("householdRate").number))
                Text("Firmengewinne schwanken. Dein Gehalt benötigt eine richtig erledigte Monatsaufgabe. Kreditraten werden zusätzlich abgezogen.").font(.caption).foregroundStyle(.secondary)
            }
            GamePanel {
                SectionHeading(title:"Letzte Bewegungen",symbol:"list.bullet.rectangle")
                ForEach(Array(store.state["events"].array.prefix(8).enumerated()),id:\.offset) { _,event in HStack(alignment:.top) { Text(event["text"].string).font(.caption);Spacer(minLength:10);Text(store.money(event["amount"].number)).font(.caption.monospacedDigit()).foregroundStyle(event["amount"].number<0 ? Color.secondary:Color.gameGold) };Divider() }
            }
        }
    }
}
struct StocksSection: View {
    @EnvironmentObject var store: NativeGameStore
    @State private var query=""
    var body: some View {
        VStack(alignment:.leading,spacing:15) {
            TextField("Unternehmen oder Kürzel suchen",text:$query).textFieldStyle(.roundedBorder)
            Text("27 reale Unternehmensnamen und vier bisherige Spielanlagen. Alle Kurse sind simuliert, keine Live-Daten.").font(.caption).foregroundStyle(.secondary)
            LazyVStack(spacing:12) { ForEach(store.stocks.filter { query.isEmpty || ($0["name"].string+" "+$0["symbol"].string).localizedCaseInsensitiveContains(query) }) { stock in NavigationLink { StockDetailScreen(stock:stock) } label: { GamePanel { HStack(spacing:13) { CompanyLogo(id:stock.id,title:stock["name"].string);VStack(alignment:.leading,spacing:6) { Text(stock["name"].string).font(.headline);Text(stock["symbol"].string+" · "+stock["sector"].string).font(.caption).foregroundStyle(.secondary) };Spacer();Image(systemName:"chevron.right").font(.caption).foregroundStyle(.tertiary) }; HStack { Text(store.money(store.state["prices"][stock.id].number)).font(.title3.bold().monospacedDigit());Spacer();Text("\(store.state["shares"][stock.id].int) Anteile").font(.caption).foregroundStyle(.secondary) } } }.buttonStyle(.plain) } }
        }
    }
}
struct StockDetailScreen: View {
    @EnvironmentObject var store: NativeGameStore
    let stock:J
    @State private var quantity="1"
    var amount:Int { Int(quantity) ?? 0 }
    var total:Double { store.state["prices"][stock.id].number*Double(max(0,amount)) }
    var body: some View {
        GamePage {
            GamePanel {
                HStack { CompanyLogo(id:stock.id,title:stock["name"].string);VStack(alignment:.leading,spacing:6) { Text(stock["name"].string).font(.title3.bold());TagPill(text:stock["symbol"].string) } }
                Text(store.money(store.state["prices"][stock.id].number)).font(.system(size:36,weight:.bold,design:.rounded)).monospacedDigit()
                TagPill(text:"SIMULIERTER SPIELKURS")
                DetailLine(label:"Dein Depot",value:"\(store.state["shares"][stock.id].int) Anteile")
                TextField("Anzahl der Anteile",text:$quantity).keyboardType(.numberPad).textFieldStyle(.roundedBorder)
                DetailLine(label:"Kauf inkl. 0,5 % Gebühr",value:store.money(total*1.005))
                DetailLine(label:"Verkauf nach 0,5 % Gebühr",value:store.money(total*0.995))
                HStack { Button("Kaufen") { store.perform("trade",[stock.id,amount],success:"Anteile gekauft.") }.buttonStyle(.borderedProminent);Button("Verkaufen") { store.perform("trade",[stock.id,-amount],success:"Anteile verkauft.") }.buttonStyle(.bordered) }.disabled(amount<=0)
                Text("Der Ausführungskurs gilt beim Bestätigen. Spielkurse können steigen oder fallen. Keine echten Wertpapiere oder Zahlungen.").font(.caption).foregroundStyle(.secondary)
            }
        }.navigationTitle("Aktie").navigationBarTitleDisplayMode(.inline)
    }
}
struct AssetsSection: View {
    @EnvironmentObject var store: NativeGameStore
    @State private var category="Immobilien"
    @State private var query=""
    var categories:[String] { var a:[String]=[];for asset in store.assets { let c=asset["category"].string;if !a.contains(c){a.append(c)} };return a }
    var body: some View {
        VStack(alignment:.leading,spacing:15) {
            Picker("Kategorie",selection:$category) { ForEach(categories,id:\.self){Text($0).tag($0)} }.pickerStyle(.menu)
            TextField("Objekt oder Ort suchen",text:$query).textFieldStyle(.roundedBorder)
            LazyVStack(spacing:16) { ForEach(store.assets.filter { $0["category"].string==category && (query.isEmpty || ($0["name"].string+" "+$0["description"].string).localizedCaseInsensitiveContains(query)) }) { asset in NavigationLink { AssetDetailScreen(asset:asset) } label: { GamePanel { CategoryArtwork(category:asset["category"].string);HStack { Text(asset["name"].string).font(.headline);Spacer();Image(systemName:"chevron.right").font(.caption) };DetailLine(label:"Kaufpreis",value:store.money(asset["price"].number,compact:true));DetailLine(label:"Netto / Monat",value:store.money(asset["income"].number,compact:true));TagPill(text:"\(store.state["owned"][asset.id].int) im Besitz") } }.buttonStyle(.plain) } }
        }
    }
}
struct AssetDetailScreen: View {
    @EnvironmentObject var store: NativeGameStore
    let asset:J
    @State private var finance=false
    var price:Double { asset["price"].number }
    var rate:Double { let r=0.065/12;return price*0.7*r/(1-pow(1+r,-60)) }
    var body: some View {
        GamePage {
            CategoryArtwork(category:asset["category"].string)
            PageHeading(title:asset["name"].string,subtitle:asset["description"].string)
            GamePanel {
                DetailLine(label:"Kaufpreis",value:store.money(price))
                DetailLine(label:"Nettoertrag / Monat",value:store.money(asset["income"].number))
                DetailLine(label:"In deinem Besitz",value:"\(store.state["owned"][asset.id].int)")
                Toggle("Mit Finanzierung kaufen",isOn:$finance)
                if finance { DetailLine(label:"30 % Eigenkapital",value:store.money(price*0.3));DetailLine(label:"Kredit",value:store.money(price*0.7));DetailLine(label:"Rate / Spielmonat",value:store.money(rate));Text("60 Spielmonate · 6,5 % nominaler Spieljahreszins. Kreditrahmen und Leistbarkeit werden geprüft.").font(.caption).foregroundStyle(.secondary) }
                Button(finance ? "Finanzieren & kaufen":"Mit Guthaben kaufen") { store.perform("buy",[asset.id,finance],success:"Besitz gekauft.") }.buttonStyle(.borderedProminent)
                if store.state["owned"][asset.id].int>0 { Button("Ein Objekt für "+store.money(price*0.9)+" verkaufen") { store.perform("sell",[asset.id],success:"Besitz verkauft.") }.buttonStyle(.bordered);Text("Verkauf mit 10 % Abschlag. Bestehende Kredite laufen weiter.").font(.caption).foregroundStyle(.secondary) }
            }
        }.navigationTitle("Besitz").navigationBarTitleDisplayMode(.inline)
    }
}
struct CompaniesSection: View {
    @EnvironmentObject var store: NativeGameStore
    @State private var showFounder=false
    var body: some View {
        VStack(alignment:.leading,spacing:18) {
            Button { showFounder=true } label: { Label("Eigene Firma gründen",systemImage:"plus.circle.fill").frame(maxWidth:.infinity).padding(8) }.buttonStyle(.borderedProminent)
            Text("Eigener Name, fünf Geschäftsmodelle und fünf Ausbaustufen. Gewinn kommt am Monatsende, nach Kosten und mit schwankendem Umsatz.").font(.caption).foregroundStyle(.secondary)
            if store.state["companies"].array.isEmpty { EmptyPanel(title:"Deine erste Firma wartet.",description:"Ein Digital-Service startet bereits mit 750 Spielgeldeinheiten.",symbol:"building.2") }
            ForEach(Array(store.state["companies"].array.enumerated()),id:\.offset) { i,company in CompanyPanel(company:company,index:i) }
        }.sheet(isPresented:$showFounder) { FounderSheet() }
    }
}
struct CompanyPanel:View {
    @EnvironmentObject var store:NativeGameStore
    let company:J;let index:Int
    var type:J { store.companyTypes.first{$0.id==company["type"].string} ?? J() }
    var stats:J { store.rawDerived("companyStats",[company.raw]) }
    var body:some View {
        GamePanel {
            HStack { Text(company["name"].string).font(.title3.bold());Spacer();TagPill(text:"Stufe \(company["level"].int)/5") }
            Text(type["name"].string).font(.caption).foregroundStyle(.secondary)
            DetailLine(label:"Planumsatz",value:store.money(stats["revenue"].number))
            DetailLine(label:"Kosten",value:store.money(stats["expenses"].number))
            DetailLine(label:"Erwarteter Gewinn",value:store.money(stats["profit"].number))
            if company["level"].int<5 { Button("Ausbauen · "+store.money((type["cost"].number*0.75*company["level"].number).rounded())) { store.perform("upgradeCompany",[index],success:"Firma ausgebaut.") }.buttonStyle(.bordered) }
        }
    }
}
struct FounderSheet: View {
    @EnvironmentObject var store:NativeGameStore
    @Environment(\.dismiss) private var dismiss
    @State private var name=""
    @State private var type="freelance"
    var selected:J { store.companyTypes.first{$0.id==type} ?? J() }
    var body:some View {
        NavigationStack { Form {
            Section("Dein Unternehmen") { TextField("Firmenname",text:$name).accessibilityIdentifier("company.name");Picker("Geschäftsmodell",selection:$type) { ForEach(store.companyTypes){Text($0["name"].string).tag($0.id)} } }
            Section("Planung") { Text(selected["description"].string);DetailLine(label:"Gründungskapital",value:store.money(selected["cost"].number));DetailLine(label:"Monatsumsatz",value:store.money(selected["revenue"].number));DetailLine(label:"Monatskosten",value:store.money(selected["expenses"].number));Text("Umsatz schwankt um bis zu 15 %. Auch Verluste sind möglich. Maximal zehn Firmen.").font(.caption).foregroundStyle(.secondary) }
            Button("Firma gründen") { if store.perform("foundCompany",[type,name],success:"Deine Firma ist gegründet."){dismiss()} }.disabled(name.trimmingCharacters(in:.whitespacesAndNewlines).count<2)
        }.navigationTitle("Firma gründen").toolbar { ToolbarItem(placement:.cancellationAction){Button("Abbrechen"){dismiss()}} } }
}
}
struct CreditSection: View {
    @EnvironmentObject var store:NativeGameStore
    @State private var amount="1000"
    var body:some View {
        VStack(spacing:18) {
            GamePanel {
                SectionHeading(title:"Dein Kreditrahmen",symbol:"creditcard")
                Text(store.money(max(0,store.derived("limit").number-store.derived("debt").number))).font(.title.bold())
                TextField("Betrag in Spielgeld",text:$amount).keyboardType(.decimalPad).textFieldStyle(.roundedBorder)
                Text("36 Spielmonate · 6,5 % nominaler Jahreszins. Alle Raten dürfen maximal 40 % des monatlichen Job- und positiven Besitzeinkommens ausmachen.").font(.caption).foregroundStyle(.secondary)
                Button("Virtuellen Kredit aufnehmen") { guard let value=Double(amount.replacingOccurrences(of:",",with:".")) else {store.inform("Bitte einen gültigen Betrag eingeben.");return};store.perform("loan",[value],success:"Kredit ausgezahlt.") }.buttonStyle(.borderedProminent)
            }
            ForEach(Array(store.state["loans"].array.enumerated()),id:\.offset) { i,loan in GamePanel { Text(loan["purpose"].string).font(.headline);DetailLine(label:"Restschuld",value:store.money(loan["balance"].number));DetailLine(label:"Rate pro Monat",value:store.money(loan["payment"].number));Button("Vollständig tilgen"){store.perform("repayLoan",[i],success:"Kredit getilgt.")}.buttonStyle(.bordered) } }
            if store.state["loans"].array.isEmpty { EmptyPanel(title:"Keine laufenden Kredite",description:"Finanzierungen für Besitz findest du auch direkt beim jeweiligen Objekt.",symbol:"checkmark.shield") }
        }
    }
}
