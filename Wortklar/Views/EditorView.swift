import SwiftUI
import Translation
#if os(macOS)
import AppKit
#else
import UIKit
#endif

struct EditorView: View {
    @StateObject private var model = EditorModel()
    @State private var showHistory = false
    @State private var copied = false
    private let accent = Color(red: 0.22, green: 0.36, blue: 0.86)
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 8) {
                            Label("WORTKLAR", systemImage: "text.badge.star").font(.headline).foregroundStyle(accent)
                            Text("Deine Worte. Klarer.").font(.largeTitle.bold())
                            Text("Aus Gedanken werden gute Texte.").foregroundStyle(.secondary)
                        }
                        Spacer()
                        Button { showHistory = true } label: { Label("Verlauf", systemImage: "clock") }
                    }
                    VStack(alignment: .leading, spacing: 14) {
                        Text("Was möchtest du verändern?").font(.headline)
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 150))], spacing: 8) {
                            ForEach(WritingMode.allCases) { mode in
                                Button { model.mode = mode } label: {
                                    Text(mode.rawValue).font(.subheadline.weight(.medium)).frame(maxWidth: .infinity).padding(.vertical, 10)
                                        .background(model.mode == mode ? accent : Color.secondary.opacity(0.08), in: RoundedRectangle(cornerRadius: 12))
                                        .foregroundStyle(model.mode == mode ? Color.white : Color.primary)
                                }.buttonStyle(.plain).accessibilityAddTraits(model.mode == mode ? .isSelected : [])
                            }
                        }
                        if model.mode == .translate {
                            Picker("Ausgangssprache", selection: $model.source) {
                                Text("Deutsch").tag("de")
                                Text("Englisch").tag("en")
                                Text("Französisch").tag("fr")
                            }
                            Picker("Zielsprache", selection: $model.target) {
                                Text("Englisch").tag("en")
                                Text("Französisch").tag("fr")
                            }
                            Text("Wähle die Sprache deines Textes. Beim ersten Mal kann Apple einen Sprachdownload anfordern.").font(.caption).foregroundStyle(.secondary)
                        }
                    }.padding(20).background(.background, in: RoundedRectangle(cornerRadius: 20))
                    ViewThatFits(in: .horizontal) {
                        HStack(alignment: .top, spacing: 18) { inputCard.frame(minWidth: 340); outputCard.frame(minWidth: 340) }
                        VStack(spacing: 18) { inputCard; outputCard }
                    }
                    if let message = model.message {
                        Label(message, systemImage: "info.circle").font(.callout).foregroundStyle(.orange).textSelection(.enabled)
                    }
                    HStack {
                        if model.busy { ProgressView(); Text("Dein Text wird bearbeitet …").font(.callout) }
                        Spacer()
                        Button { Task { await model.process() } } label: {
                            Label("Text bearbeiten", systemImage: "sparkles").padding(.horizontal, 16).padding(.vertical, 8)
                        }.buttonStyle(.borderedProminent).disabled(!model.valid)
                    }
                    Text("Lokal auf deinem Gerät · Verlauf mit bis zu 50 Ergebnissen · Ergebnisse bitte prüfen")
                        .font(.caption).foregroundStyle(.secondary)
                }.padding(24).frame(maxWidth: 1100)
                    .disabled(model.busy)
            }.background(accent.opacity(0.045)).tint(accent)
                .navigationTitle("")
                .background {
                    if let request = model.translationRequest {
                        TranslationTaskHost(model: model, request: request).id(request.id)
                    }
                }
                .sheet(isPresented: $showHistory) { HistoryView(model: model) }
                .onChange(of: model.output) { copied = false }
        }
        #if os(macOS)
        .frame(minWidth: 620, minHeight: 720)
        #endif
    }
    private var inputCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Dein Text").font(.headline)
                Spacer()
            }
            inputEditor
                .frame(height: 230)
                .background(Color.primary.opacity(0.025), in: RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(Color.primary.opacity(0.12)))
            Text("Text hier eingeben oder einfügen. Enter: bearbeiten · ⇧ Enter: neue Zeile")
                .font(.caption).foregroundStyle(.secondary)
            Text("\(model.input.count) / 3.000 Zeichen").font(.caption).foregroundStyle(model.input.count > 3000 ? Color.red : Color.secondary)
        }.padding(20).background(.background, in: RoundedRectangle(cornerRadius: 20))
    }
    private var outputCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Dein Ergebnis").font(.headline)
                Spacer()
                Button { copyOutput() } label: { Label(copied ? "Kopiert" : "Kopieren", systemImage: copied ? "checkmark" : "doc.on.doc") }.disabled(model.output.isEmpty)
            }
            ScrollView {
                Text(model.output.isEmpty ? "Hier erscheint deine neue Formulierung." : model.output)
                    .font(.system(size: 17)).lineSpacing(5)
                    .foregroundStyle(model.output.isEmpty ? Color.secondary : Color.primary)
                    .frame(maxWidth: .infinity, alignment: .topLeading).textSelection(.enabled).padding(8)
            }.frame(height: 230).accessibilityLabel("Ausgabetext")
            Text(model.output.isEmpty ? "Bereit für deine Ideen" : "\(model.output.split(whereSeparator: { $0.isWhitespace }).count) Wörter")
                .font(.caption).foregroundStyle(.secondary)
        }.padding(20).background(.background, in: RoundedRectangle(cornerRadius: 20))
    }
    @ViewBuilder
    private var inputEditor: some View {
        #if os(macOS)
        MacTextInput(text: $model.input, enabled: !model.busy) {
            Task { await model.process() }
        }
        #else
        TextEditor(text: $model.input)
            .font(.system(size: 17)).lineSpacing(5)
            .scrollContentBackground(.hidden).padding(8)
            .accessibilityLabel("Eingabetext")
            .onKeyPress(.return) { press in
                guard !press.modifiers.contains(.shift) else { return .ignored }
                Task { await model.process() }
                return .handled
            }
        #endif
    }
    private func copyOutput() {
        #if os(macOS)
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(model.output, forType: .string)
        #else
        UIPasteboard.general.string = model.output
        #endif
        copied = true
    }
}

#if os(macOS)
/// Native text editing retains selection, undo and input-method composition.
struct MacTextInput: NSViewRepresentable {
    @Binding var text: String
    var enabled: Bool
    var submit: () -> Void

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeNSView(context: Context) -> NSScrollView {
        let scroll = NSScrollView()
        scroll.drawsBackground = false
        scroll.hasVerticalScroller = true
        scroll.autohidesScrollers = true
        let editor = SubmitTextView()
        editor.isRichText = false
        editor.importsGraphics = false
        editor.allowsUndo = true
        editor.drawsBackground = false
        editor.font = .systemFont(ofSize: 17)
        editor.textColor = .labelColor
        editor.insertionPointColor = .labelColor
        editor.textContainerInset = NSSize(width: 12, height: 12)
        let paragraph = NSMutableParagraphStyle()
        paragraph.lineSpacing = 5
        editor.defaultParagraphStyle = paragraph
        editor.isVerticallyResizable = true
        editor.isHorizontallyResizable = false
        editor.autoresizingMask = [.width]
        editor.textContainer?.widthTracksTextView = true
        editor.textContainer?.containerSize = NSSize(width: 0, height: CGFloat.greatestFiniteMagnitude)
        editor.setAccessibilityLabel("Eingabetext")
        editor.delegate = context.coordinator
        scroll.documentView = editor
        return scroll
    }

    func updateNSView(_ scroll: NSScrollView, context: Context) {
        context.coordinator.parent = self
        guard let editor = scroll.documentView as? SubmitTextView else { return }
        if editor.string != text {
            editor.string = text
            editor.setSelectedRange(NSRange(location: (text as NSString).length, length: 0))
        }
        editor.isEditable = enabled
        editor.submit = submit
    }

    final class Coordinator: NSObject, NSTextViewDelegate {
        var parent: MacTextInput
        init(_ parent: MacTextInput) { self.parent = parent }
        func textDidChange(_ notification: Notification) {
            guard let editor = notification.object as? NSTextView else { return }
            parent.text = editor.string
        }
    }
}

final class SubmitTextView: NSTextView {
    var submit: (() -> Void)?
    override func keyDown(with event: NSEvent) {
        let isReturn = event.keyCode == 36 || event.keyCode == 76
        if isReturn && !hasMarkedText() {
            guard isEditable else { return }
            if event.modifierFlags.contains(.shift) {
                insertNewlineIgnoringFieldEditor(nil)
            } else if !event.isARepeat {
                submit?()
            }
            return
        }
        super.keyDown(with: event)
    }
}
#endif

private struct TranslationTaskHost: View {
    let model: EditorModel
    let request: EditorModel.TranslationRequest
    var body: some View {
        Color.clear.frame(width: 1, height: 1)
            .translationTask(request.configuration) { session in
                await model.translate(using: session, request: request)
            }
            .accessibilityHidden(true)
    }
}
