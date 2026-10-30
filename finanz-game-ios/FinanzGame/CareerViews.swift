import SwiftUI

struct CareerScreen: View {
    @EnvironmentObject var store: NativeGameStore
    @State private var query = ""
    @State private var sector = "Alle"
    var sectors: [String] { ["Alle"] + Set(store.jobs.map { $0["sector"].string }).sorted() }
    var body: some View {
        GamePage {
            PageHeading(title: "Dein Weg nach oben.", subtitle: "55 Berufe. Eine Bewerbung. Eine Aufgabe pro Monat.")
            PayDayPanel()
            if !store.state["application"].isNull { NavigationLink { JobDetailScreen(index:store.state["application"]["job"].int) } label: { GamePanel { Label("Deine laufende Bewerbung",systemImage:"doc.text"); Text("Unterschrift, Fragen & Chefentscheidung").font(.caption).foregroundStyle(.secondary) } }.buttonStyle(.plain) }
            if store.state["job"].int >= 0 { NavigationLink { JobDetailScreen(index:store.state["job"].int) } label: { GamePanel { HStack { SectionHeading(title:store.currentJob["name"].string,symbol:"briefcase.fill"); Spacer(); Image(systemName:"chevron.right") }; DetailLine(label:"Maximal pro Monat",value:store.money(store.derived("salary").number)); Text(store.state["work"]["attempts"].int == 0 ? "Deine Monatsaufgabe ist noch offen." : store.workDone ? "Monatsaufgabe richtig erledigt." : "Monatsaufgabe beantwortet. Nächste Chance im nächsten Monat.").font(.caption).foregroundStyle(.secondary) } }.buttonStyle(.plain) }
            TextField("Beruf suchen",text:$query).textFieldStyle(.roundedBorder)
            Picker("Branche",selection:$sector) { ForEach(sectors,id:\.self) { Text($0).tag($0) } }.pickerStyle(.menu)
            LazyVStack(spacing:12) {
                ForEach(Array(store.jobs.enumerated()),id:\.offset) { index, job in
                    if (sector == "Alle" || job["sector"].string == sector) && (query.isEmpty || job["name"].string.localizedCaseInsensitiveContains(query)) {
                        NavigationLink { JobDetailScreen(index:index) } label: { GamePanel { HStack(spacing:14) { Image(systemName:"briefcase").font(.title2).foregroundStyle(Color.gameGold).frame(width:36); VStack(alignment:.leading,spacing:6) { Text(job["name"].string).font(.headline); Text(job["sector"].string).font(.caption).foregroundStyle(.secondary) }; Spacer(); Image(systemName:"chevron.right").font(.caption).foregroundStyle(.tertiary) }; HStack { Text(store.money(job["pay"].number,compact:true)+" / Monat").font(.subheadline.weight(.semibold)); Spacer(); Text("\(job["xp"].int) XP").font(.caption).foregroundStyle(.secondary) } } }.buttonStyle(.plain).accessibilityIdentifier("job.\(index)")
                    }
                }
            }
        }.navigationTitle("Karriere").navigationBarTitleDisplayMode(.inline)
    }
}

struct JobDetailScreen: View {
    @EnvironmentObject var store: NativeGameStore
    let index: Int
    @State private var signature: [[CGPoint]] = []
    var job: J { store.jobs.indices.contains(index) ? store.jobs[index] : J() }
    var active: Bool { store.state["job"].int == index }
    var application: J { let a=store.state["application"];return a["job"].int == index && !a.isNull ? a:J() }
    var body: some View {
        GamePage {
            PageHeading(title:job["name"].string,subtitle:job["sector"].string)
            if !application.isNull { applicationView }
            if let last=store.state["applicationHistory"].array.first, last["job"].int==index, application.isNull { GamePanel { Label(last["accepted"].bool ? "Zusage erhalten" : "Bewerbung abgelehnt",systemImage:last["accepted"].bool ? "checkmark.seal.fill":"xmark.seal").font(.headline).foregroundStyle(last["accepted"].bool ? .green:.orange); Text("\(last["score"].int)/3 richtig · \(last["rating"].int)/100 Punkte").font(.subheadline) } }
            GamePanel {
                SectionHeading(title:"Gehalt & Anforderungen",symbol:"eurosign.circle")
                Text(store.money(active ? store.derived("salary").number : job["pay"].number)).font(.system(size:32,weight:.bold,design:.rounded))
                Text("Pro Spielmonat bei richtig erledigter Monatsaufgabe, anteilig für deine Beschäftigungszeit.").font(.caption).foregroundStyle(.secondary)
                DetailLine(label:"Erfahrung",value:"\(job["xp"].int) XP benötigt · \(store.state["xp"].int) vorhanden")
                DetailLine(label:"Weiterbildung",value:store.money(job["cost"].number))
                if !active && application.isNull { Button("Bewerbung vorbereiten") { store.perform("apply",[index],success:"Bitte unterschreibe deine Spielbewerbung.") }.buttonStyle(.borderedProminent).disabled(!store.state["application"].isNull) }
            }
            if active { workView; promotionView }
            if !store.state["task"].isNull && ((active && store.state["task"]["kind"].string=="work") || (!application.isNull && store.state["task"]["kind"].string=="trial")) { TaskQuestionView() }
            PayDayPanel()
        }.navigationTitle("Jobdetails").navigationBarTitleDisplayMode(.inline)
        .onChange(of: application["createdAt"].number) { _, _ in signature=[] }
    }
    @ViewBuilder var applicationView: some View {
        let stage=application["stage"].string
        GamePanel {
            HStack { SectionHeading(title:"Deine Bewerbung",symbol:"doc.text"); Spacer(); TagPill(text: stage == "signing" ? "Unterschrift":stage == "reviewing" ? "Prüfung":stage == "trial" ? "3 Fragen":"Entscheidung") }
            if stage == "signing" {
                Text("Unterschreibe deine fiktive Bewerbung. Erst beim Absenden wird die Weiterbildung bezahlt.").font(.subheadline).foregroundStyle(.secondary)
                SignaturePad(strokes:$signature)
                Button("Unterschreiben & absenden") { let points=signature.map { $0.map { [Double($0.x),Double($0.y)] } };store.perform("signApplication",[points],success:"Bewerbung eingereicht.") }.buttonStyle(.borderedProminent).disabled(signature.flatMap{$0}.count<6)
                Button("Entwurf verwerfen",role:.destructive) { store.perform("cancelDraft") }
            } else if stage == "reviewing" || stage == "decision" {
                HStack(spacing:15) { ProgressView(); VStack(alignment:.leading,spacing:6) { Text(stage=="reviewing" ? "Deine Unterlagen werden geprüft.":"Der Chef bewertet deine Antworten.").font(.subheadline.weight(.medium));Text(store.remaining(application["due"].number)).font(.title2.monospacedDigit()) } }
            } else {
                Text("\(application["attempts"].int)/3 Fragen beantwortet · \(application["score"].int) richtig").font(.subheadline)
                Text("Lies in Ruhe. Erst Start aktiviert die Zeitmessung. Richtige Antworten geben 80 Punkte plus bis zu 20 Tempopunkte. Für eine Zusage: mindestens zwei richtige und 60/100 Punkte.").font(.caption).foregroundStyle(.secondary)
                if store.state["task"].isNull { Button("Nächste Frage lesen") { store.perform("startTask",["trial"]) }.buttonStyle(.borderedProminent) }
            }
            if !application["results"].array.isEmpty { ForEach(Array(application["results"].array.enumerated()),id:\.offset) { i,result in HStack { Image(systemName:result["correct"].bool ? "checkmark.circle.fill":"xmark.circle.fill").foregroundStyle(result["correct"].bool ? .green:.orange);Text("Frage \(i+1)");Spacer();Text("\(Int(result["points"].number.rounded())) Punkte").monospacedDigit() }.font(.caption) } }
        }
    }
    var workView: some View {
        GamePanel {
            SectionHeading(title:"Eine Aufgabe pro Monat",symbol:"checklist")
            Label(store.workDone ? "Richtig erledigt · Gehalt freigeschaltet":store.state["work"]["attempts"].int>0 ? "Beantwortet · nächste Aufgabe im nächsten Monat":"Deine Monatsaufgabe ist offen",systemImage:store.workDone ? "checkmark.circle.fill":"circle").font(.subheadline)
            if store.state["work"]["attempts"].int==0 && store.state["task"].isNull { Button("Monatsaufgabe öffnen") { store.perform("startTask",["work"]) }.buttonStyle(.borderedProminent) }
            Text("Eine falsche oder fehlende Antwort ergibt kein Jobgehalt für diesen Monat. Du musst dich nicht monatlich neu bewerben.").font(.caption).foregroundStyle(.secondary)
        }
    }
    var promotionView: some View {
        let p=store.derived("promotion")
        return GamePanel {
            SectionHeading(title:"Aufsteigen",symbol:"arrow.up.right.circle")
            DetailLine(label:"Gehaltsstufe",value:"\(p["level"].int+1) / 6")
            if p["max"].bool { Text("Höchste Stufe erreicht.").foregroundStyle(.green) }
            else { DetailLine(label:"Gute Monate",value:"\(p["successfulMonths"].int) / 2");DetailLine(label:"Erfahrung nötig",value:"\(p["xp"].int) XP");Button("Beförderung · "+store.money(p["cost"].number)) { store.perform("promote",success:"Beförderung genehmigt.") }.buttonStyle(.bordered) }
        }
    }
}
struct TaskQuestionView: View {
    @EnvironmentObject var store: NativeGameStore
    var body: some View {
        let task=store.state["task"], index=task["index"].int
        if !task.isNull && store.questions.indices.contains(index) {
            let q=store.questions[index]
            GamePanel {
                TagPill(text:task["kind"].string=="trial" ? "Bewerbungsfrage":"Monatsaufgabe")
                Text(q["q"].string).font(.title3.weight(.semibold)).fixedSize(horizontal:false,vertical:true)
                if task["startedAt"].isNull {
                    Text("Lies erst in Ruhe. Es läuft noch keine Zeit.").font(.subheadline).foregroundStyle(.secondary)
                    Button("Start · Jetzt antworten") { store.perform("beginTask") }.buttonStyle(.borderedProminent)
                } else {
                    Text(String(format:"Zeit seit Start: %.1f s",max(0,store.state["elapsed"].number-task["startedAt"].number))).font(.caption.monospacedDigit()).foregroundStyle(.secondary)
                    ForEach(Array(q["answers"].array.enumerated()),id:\.offset) { i,answer in Button { store.perform("answerTask",[i],success:"Antwort erfasst.") } label: { Text(answer.string).font(.subheadline).frame(maxWidth:.infinity,alignment:.leading).padding(13).background(Color.gameGold.opacity(0.09),in:RoundedRectangle(cornerRadius:12)) }.buttonStyle(.plain) }
                }
            }
        }
    }
}
