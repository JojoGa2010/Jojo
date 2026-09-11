import Foundation

enum WritingMode: String, CaseIterable, Codable, Identifiable {
    case improve = "Verbessern", spelling = "Rechtschreibung", professional = "Professionell"
    case shorten = "Kürzen", expand = "Ausführlicher", rephrase = "Anders formulieren", translate = "Übersetzen"
    var id: String { rawValue }
    var instruction: String {
        switch self {
        case .improve: "Verbessere Klarheit, Lesefluss und Grammatik."
        case .spelling: "Korrigiere ausschließlich Rechtschreibung, Grammatik und Zeichensetzung."
        case .professional: "Formuliere sachlich, höflich und professionell."
        case .shorten: "Kürze deutlich und behalte die wesentlichen Aussagen."
        case .expand: "Formuliere ausführlicher, ohne neue Fakten oder Behauptungen zu erfinden."
        case .rephrase: "Formuliere mit anderen Worten und anderem Satzbau bei gleicher Bedeutung."
        case .translate: "Übersetze den Text."
        }
    }
}
struct HistoryEntry: Identifiable, Codable {
    var id = UUID()
    var date = Date()
    let input: String
    let output: String
    let mode: WritingMode
    let target: String
    // Retained for compatibility with existing saved history. New entries are always false.
    let demo: Bool
}
