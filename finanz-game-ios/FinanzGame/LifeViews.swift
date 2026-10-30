import SwiftUI

struct LifeScreen: View {
    @EnvironmentObject var store:NativeGameStore
    @State private var section = GameTestLaunch.option("-finanz-ui-test-section") ?? "Übersicht"
    var body:some View {
        GamePage {
            PageHeading(title:"Essen & Gesundheit",subtitle:"Deine Versorgung. An einem eigenen Ort.")
            HStack(spacing:12) { NeedTile(title:"Sättigung",value:store.state["life"]["hunger"].number,symbol:"fork.knife");NeedTile(title:"Lebensenergie",value:store.state["life"]["health"].number,symbol:"heart.fill") }
            ChoiceChips(options:["Übersicht","Essen","Gesundheit","Haushalt"],selection:$section)
            switch section {
            case "Essen": FoodStoreSection()
            case "Gesundheit": HealthCareSection()
            case "Haushalt": HouseholdSection()
            default: overview
            }
        }.navigationTitle("Essen & Gesundheit").navigationBarTitleDisplayMode(.inline)
    }
    var overview:some View {
        let food=store.derived("foodStatus")
        return VStack(spacing:18) {
            GamePanel {
                HStack { SectionHeading(title:"Automatisch versorgt",symbol:"fork.knife.circle.fill");Spacer();TagPill(text:food["points"].number>0 ? "Vorrat da":"Vorrat leer") }
                DetailLine(label:"Ungeöffnete Portionen",value:"\(food["portions"].int)")
                if !food["active"].isNull { DetailLine(label:"Angebrochen",value:food["active"].string) }
                DetailLine(label:"Vorrat + Sättigung reichen für",value:"ca. \(Int(food["coverageSeconds"].number/60)) echte Minuten")
                Text("Du kaufst Lebensmittel. Die benötigte Menge wird automatisch verbraucht und hält dich bei 100 % Sättigung, solange Vorrat reicht. Restportionen bleiben erhalten.").font(.caption).foregroundStyle(.secondary)
                Button("Vorräte ansehen"){section="Essen"}.buttonStyle(.borderedProminent)
            }
            GamePanel {
                SectionHeading(title:"Deine Gesundheit",symbol:"heart.text.square")
                Text(store.state["life"]["medical"]["condition"].string=="gamebug" ? "Fiktiver Spiel-Infekt":store.state["life"]["medical"]["condition"].string=="fatigue" ? "Erschöpfung im Spiel":"Behalte deine Lebensenergie im Blick.").font(.subheadline)
                Button("Spielarzt & Rezepte"){section="Gesundheit"}.buttonStyle(.bordered)
            }
            if store.state["life"]["health"].number<=0 { EmptyPanel(title:"Du bist erschöpft.",description:"Kaufe Essen oder besuche den Spielarzt. Dein Vermögen bleibt erhalten.",symbol:"heart.slash") }
            Button("Handys, Geräte & Rechnungen"){section="Haushalt"}.buttonStyle(.bordered)
            EmergencyFoodPanel()
        }
    }
}
struct NeedTile:View {
    let title:String;let value:Double;let symbol:String
    var body:some View { GamePanel { Label(title,systemImage:symbol).font(.caption.weight(.semibold)).foregroundStyle(Color.gameGold);Text("\(Int(value.rounded())) %").font(.system(size:31,weight:.bold,design:.rounded)).monospacedDigit();ProgressView(value:value,total:100).tint(value<20 ? .orange:.gameGold) } }
}
struct FoodStoreSection:View {
    @EnvironmentObject var store:NativeGameStore
    var body:some View {
        VStack(spacing:18) {
            GamePanel { SectionHeading(title:"Dein Vorrat",symbol:"basket");Text("Automatisch essen ist immer aktiv. Es wird nur die benötigte Menge verbraucht.").font(.subheadline).foregroundStyle(.secondary);if !store.state["life"]["activeMeal"].isNull { let meal=store.state["life"]["activeMeal"];Text("Angebrochene Portion: \(Int((meal["remaining"].number/max(1,meal["capacity"].number)*100).rounded())) % übrig").font(.caption) } }
            ProductGrid(category:"Essen")
            EmergencyFoodPanel()
        }
    }
}
struct ProductGrid:View {
    @EnvironmentObject var store:NativeGameStore
    let category:String
    let columns=[GridItem(.flexible(),spacing:12),GridItem(.flexible(),spacing:12)]
    func symbol(_ item:J)->String { switch item["icon"].string { case "phone":"iphone";case "food":"fork.knife";case "laptop":"laptopcomputer";case "coffee":"cup.and.saucer.fill";default:"refrigerator" } }
    var body:some View {
        LazyVGrid(columns:columns,spacing:14) {
            ForEach(store.products.filter{$0["category"].string==category}) { item in
                let food=item["food"].number>0
                let count=food ? store.state["life"]["pantry"][item.id].int:store.state["life"]["goods"][item.id].int
                GamePanel {
                    Image(systemName:symbol(item)).font(.system(size:34)).foregroundStyle(Color.gameGold).frame(maxWidth:.infinity).frame(height:63).background(Color.gameGold.opacity(0.08),in:RoundedRectangle(cornerRadius:15))
                    Text(item["name"].string).font(.subheadline.weight(.semibold)).fixedSize(horizontal:false,vertical:true)
                    Text(food ? "\(count) ungeöffnet":count>0 ? "Gekauft":"Noch nicht gekauft").font(.caption2).foregroundStyle(.secondary)
                    Text(store.money(item["price"].number)).font(.headline)
                    if food { Text("+\(item["food"].int) Sättigung · +\(item["heal"].int) Energie").font(.caption2).foregroundStyle(.secondary) }
                    else { Text(item["description"].string.isEmpty ? "Zusätzlicher Strom: \(store.money(item["energy"].number,compact:true))/Monat":item["description"].string).font(.caption2).foregroundStyle(.secondary) }
                    Button(food ? "1 kaufen":"Kaufen") { store.perform("buyProduct",[item.id],success:"Gekauft.") }.buttonStyle(.borderedProminent).disabled(!food && count>0).accessibilityIdentifier("product.buy."+item.id)
                    if food { Button("5 kaufen") { store.perform("buyProduct",[item.id,5],success:"Vorrat gekauft.") }.buttonStyle(.bordered) }
                }
            }
        }
    }
}
struct EmergencyFoodPanel:View {
    @EnvironmentObject var store:NativeGameStore
    var body:some View { if store.derived("foodStatus")["points"].number<=0 && store.state["life"]["hunger"].number<=20 { GamePanel { SectionHeading(title:"Hilfe bei leerem Vorrat",symbol:"hands.sparkles");Text("Kein Essen, weniger als 1,50 Spielgeld und höchstens 15 % Sättigung? Einmal pro Monat gibt es eine kostenlose Notmahlzeit.").font(.caption).foregroundStyle(.secondary);Button("Notmahlzeit holen"){store.perform("emergencyMeal",success:"Du hast eine Notmahlzeit erhalten.")}.buttonStyle(.bordered) } } }
}
struct HealthCareSection:View {
    @EnvironmentObject var store:NativeGameStore
    var medical:J { store.state["life"]["medical"] }
    var prescription:J { medical["prescription"] }
    func redeemable(_ id:String)->Bool { !prescription.isNull && prescription["medicine"].string==id && !prescription["redeemed"].bool && store.state["elapsed"].number<prescription["expiresAt"].number }
    var body:some View {
        VStack(spacing:18) {
            GamePanel {
                SectionHeading(title:"Dein Spielarzt",symbol:"cross.case")
                Text("Frei erfundene Spielmechanik. Keine echten Wirkstoffe, Dosierungen oder Behandlungsempfehlungen.").font(.caption).foregroundStyle(.secondary)
                if !medical["appointment"].isNull { HStack { ProgressView();Text("Untersuchung: "+store.remaining(medical["appointment"]["readyAt"].number)).font(.subheadline.monospacedDigit()) } }
                else { Button("Untersuchung · "+store.money(25)) { store.perform("visitDoctor",success:"Die Untersuchung dauert 30 Sekunden.") }.buttonStyle(.borderedProminent);Text("Auch ohne Rezept kostet der Besuch Spielgeld.").font(.caption2).foregroundStyle(.secondary) }
                if !medical["lastResult"].isNull { Text(medical["lastResult"]["text"].string).font(.subheadline).padding(12).background(Color.gameGold.opacity(0.08),in:RoundedRectangle(cornerRadius:12)) }
            }
            GamePanel {
                SectionHeading(title:"Spielapotheke",symbol:"pills")
                if prescription.isNull { Text("Noch kein Spielrezept vorhanden.").font(.subheadline).foregroundStyle(.secondary) }
                else { Text(prescription["redeemed"].bool ? "Dein Rezept ist bereits eingelöst.":store.state["elapsed"].number>=prescription["expiresAt"].number ? "Dein Rezept ist abgelaufen.":"Rezept gültig: "+store.remaining(prescription["expiresAt"].number)).font(.caption).foregroundStyle(.secondary) }
                ForEach(store.medicines) { medicine in
                    VStack(alignment:.leading,spacing:10) { Text(medicine["name"].string).font(.headline);DetailLine(label:"Spielwirkung",value:"+\(medicine["healing"].int) Lebensenergie");Button("Rezept einlösen · "+store.money(medicine["price"].number)){store.perform("buyMedicine",[medicine.id],success:"Spielmittel automatisch angewendet.")}.buttonStyle(.bordered).disabled(!redeemable(medicine.id));Divider() }
                }
                Text("Nur mit passendem, gültigem Spielrezept. Einlösung und Anwendung erfolgen gemeinsam, jedes Rezept gilt einmal.").font(.caption).foregroundStyle(.secondary)
            }
        }
    }
}
struct HouseholdSection:View {
    @EnvironmentObject var store:NativeGameStore
    @State private var category="Rechnungen"
    var body:some View {
        VStack(spacing:18) {
            ChoiceChips(options:["Rechnungen","Handys","Haushalt"],selection:$category)
            if category=="Rechnungen" { bills } else { ProductGrid(category:category) }
        }
    }
    var bills:some View {
        GamePanel {
            SectionHeading(title:"Monatliche Rechnungen",symbol:"bolt.circle")
            ForEach(store.services) { service in Toggle(isOn:Binding(get:{store.state["life"]["services"][service.id].bool},set:{store.perform("setService",[service.id,$0])})) { VStack(alignment:.leading,spacing:5){Text(service["name"].string);Text(store.money(service["monthly"].number)+" / Monat").font(.caption).foregroundStyle(.secondary)} } }
            DetailLine(label:"Planbetrag inkl. Geräte",value:store.money(store.derived("householdRate").number))
            DetailLine(label:"Vorgemerkt",value:store.money(store.state["accrued"]["household"].number))
            DetailLine(label:"Offene Rechnungen",value:store.money(store.state["arrears"].number))
            if store.state["arrears"].number>0 { Button("Offene Rechnungen bezahlen"){store.perform("payBills",success:"Zahlung angerechnet.")}.buttonStyle(.borderedProminent) }
            Text("Abrechnung am Monatsende. Abschalten stoppt nur künftige Kosten. Der Kühlschrank-Bonus benötigt aktiven, bezahlten Strom.").font(.caption).foregroundStyle(.secondary)
        }
    }
}
