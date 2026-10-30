import SwiftUI
import UIKit

extension Color {
    static let gameGold = Color(red: 0.66, green: 0.47, blue: 0.18)
    static let gameNavy = Color(red: 0.07, green: 0.12, blue: 0.21)
}

struct GamePanel<Content: View>: View {
    @EnvironmentObject private var store: NativeGameStore
    @ViewBuilder let content: () -> Content
    var body: some View { VStack(alignment: .leading, spacing: 16, content: content).padding(20).frame(maxWidth: .infinity, alignment: .leading).background { if store.preferences.glass { RoundedRectangle(cornerRadius: 23).fill(.regularMaterial) } else { RoundedRectangle(cornerRadius: 23).fill(Color(uiColor: .secondarySystemGroupedBackground)) } } }
}
struct GamePage<Content: View>: View {
    @ViewBuilder let content: () -> Content
    var body: some View { ScrollView { VStack(alignment: .leading, spacing: 18, content: content).padding(.horizontal, 18).padding(.vertical, 20) }.background(Color(uiColor: .systemGroupedBackground)) }
}
struct PageHeading: View {
    let title: String; let subtitle: String
    var body: some View { VStack(alignment: .leading, spacing: 8) { Text(title).font(.system(size: 29, weight: .bold, design: .rounded)); Text(subtitle).font(.subheadline).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true) } }
}
struct SectionHeading: View {
    let title: String; let symbol: String
    var body: some View { Label(title, systemImage: symbol).font(.headline).foregroundStyle(Color.primary) }
}
struct TagPill: View {
    let text: String
    var body: some View { Text(text).font(.caption2.weight(.semibold)).padding(.horizontal, 10).padding(.vertical, 6).background(Color.gameGold.opacity(0.12), in: Capsule()).foregroundStyle(Color.gameGold) }
}
struct MetricTile: View {
    let title: String; let value: String; var symbol = "chart.line.uptrend.xyaxis"
    var body: some View { GamePanel { Image(systemName: symbol).foregroundStyle(Color.gameGold); Text(title).font(.caption).foregroundStyle(.secondary); Text(value).font(.system(size: 23, weight: .bold, design: .rounded)).minimumScaleFactor(0.55).lineLimit(1) } }
}
struct DetailLine: View {
    let label: String; let value: String
    var body: some View { HStack(alignment: .firstTextBaseline) { Text(label).foregroundStyle(.secondary); Spacer(minLength: 12); Text(value).fontWeight(.semibold).multilineTextAlignment(.trailing) }.font(.subheadline) }
}
struct EmptyPanel: View {
    let title: String; let description: String; var symbol = "tray"
    var body: some View { GamePanel { Image(systemName: symbol).font(.largeTitle).foregroundStyle(Color.gameGold); Text(title).font(.headline); Text(description).font(.subheadline).foregroundStyle(.secondary) } }
}
struct PayDayPanel: View {
    @EnvironmentObject var store: NativeGameStore
    var body: some View { GamePanel { HStack { Label("Nächster Monatsabschluss", systemImage: "clock").font(.subheadline.weight(.semibold)); Spacer(); Text(store.payCountdown).monospacedDigit().font(.title3.bold()).foregroundStyle(Color.gameGold) }; Text("Ein Spielmonat dauert 10 Minuten. Gehalt, Firmen, Mieten und Rechnungen werden gemeinsam abgerechnet.").font(.caption).foregroundStyle(.secondary) } }
}
struct ChoiceChips: View {
    let options: [String]; @Binding var selection: String
    var body: some View { ScrollView(.horizontal, showsIndicators: false) { HStack(spacing: 8) { ForEach(options, id: \.self) { option in Button { selection = option } label: { Text(option).font(.subheadline.weight(.semibold)).padding(.horizontal, 15).padding(.vertical, 11).foregroundStyle(selection == option ? Color.white : Color.primary).background(selection == option ? Color.gameNavy : Color(uiColor: .secondarySystemGroupedBackground), in: Capsule()) }.buttonStyle(.plain) } } } }
}

struct CategoryArtwork: View {
    let category: String
    static let cells: [String: Int] = ["Immobilien":0,"Unternehmen":1,"Sammlerstücke":2,"Autos":3,"Schiffe":4,"Flughäfen":5,"Inseln":6,"Stadt":7]
    static let atlas: UIImage? = { guard let root = Bundle.main.url(forResource: "Web", withExtension: nil) else { return nil }; return UIImage(contentsOfFile: root.appendingPathComponent("assets/scenes.jpg").path) }()
    var image: UIImage? {
        guard let source = Self.atlas?.cgImage else { return nil }
        let index = Self.cells[category] ?? 7, w = source.width / 4, h = source.height / 2
        guard let crop = source.cropping(to: CGRect(x: (index % 4) * w, y: (index / 4) * h, width: w, height: h)) else { return nil }
        return UIImage(cgImage: crop)
    }
    var body: some View { Group { if let image { Image(uiImage: image).resizable().scaledToFill() } else { Rectangle().fill(Color.gameNavy.gradient).overlay(Image(systemName: "building.2").font(.largeTitle).foregroundStyle(.white)) } }.frame(height: 160).clipped().clipShape(RoundedRectangle(cornerRadius: 18)).accessibilityHidden(true) }
}
struct CompanyLogo: View {
    let id: String; let title: String
    var body: some View {
        Group {
            if let root = Bundle.main.url(forResource: "Web", withExtension: nil), let image = UIImage(contentsOfFile: root.appendingPathComponent("assets/logos/native/\(id).png").path) { Image(uiImage: image).resizable().scaledToFit().padding(10) }
            else { Text(String(title.prefix(2)).uppercased()).font(.headline).foregroundStyle(Color.gameNavy) }
        }.frame(width: 50, height: 50).background(.white, in: RoundedRectangle(cornerRadius: 14)).overlay(RoundedRectangle(cornerRadius: 14).stroke(.black.opacity(0.06)))
    }
}
struct SignaturePad: View {
    @Binding var strokes: [[CGPoint]]
    @State private var current: [CGPoint] = []
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ZStack {
                Color(red: 0.98, green: 0.98, blue: 0.95)
                if strokes.isEmpty && current.isEmpty { Text("Hier mit dem Finger unterschreiben").font(.subheadline.italic()).foregroundStyle(.gray) }
                GeometryReader { geometry in
                    Canvas { context, size in
                        for stroke in strokes + [current] {
                            var path = Path()
                            for (i, p) in stroke.enumerated() { let point = CGPoint(x: p.x * size.width, y: p.y * size.height); if i == 0 { path.move(to: point) } else { path.addLine(to: point) } }
                            context.stroke(path, with: .color(.gameNavy), style: StrokeStyle(lineWidth: 2.8, lineCap: .round, lineJoin: .round))
                        }
                    }.gesture(DragGesture(minimumDistance: 0).onChanged { value in
                        guard strokes.count < 12 else { return }
                        let p = CGPoint(x: max(0, min(1, value.location.x / max(1, geometry.size.width))), y: max(0, min(1, value.location.y / max(1, geometry.size.height))))
                        current.append(p); if current.count > 64 { current.remove(at: 1) }
                    }.onEnded { _ in if !current.isEmpty { strokes.append(current) }; current = [] })
                }
            }.accessibilityElement(children: .ignore).accessibilityLabel("Unterschrift zeichnen").accessibilityIdentifier("application.signature").frame(height: 145).clipShape(RoundedRectangle(cornerRadius: 15)).overlay(alignment: .bottom) { Rectangle().fill(.gray.opacity(0.25)).frame(height: 1).padding(.horizontal, 20).padding(.bottom, 23) }
            Button("Neu zeichnen", role: .destructive) { strokes = []; current = [] }.font(.caption)
            Text("Nur deine fiktive Spielbewerbung, kein echter Vertrag.").font(.caption2).foregroundStyle(.secondary)
        }
    }
}
