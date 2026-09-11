import AppKit
@main struct KeyboardChecks {
    @MainActor static func main() {
        let editor = SubmitTextView(frame: NSRect(x: 0, y: 0, width: 400, height: 230))
        editor.isEditable = true
        var submissions = 0
        editor.submit = { submissions += 1 }
        func press(_ flags: NSEvent.ModifierFlags = [], repeatKey: Bool = false) {
            let event = NSEvent.keyEvent(with: .keyDown, location: .zero, modifierFlags: flags, timestamp: 0, windowNumber: 0, context: nil, characters: "\r", charactersIgnoringModifiers: "\r", isARepeat: repeatKey, keyCode: 36)!
            editor.keyDown(with: event)
        }
        editor.string = "Hallo"
        editor.setSelectedRange(NSRange(location: 5, length: 0))
        press()
        assert(submissions == 1 && editor.string == "Hallo")
        press(.shift)
        assert(submissions == 1 && editor.string == "Hallo\n")
        press(repeatKey: true)
        assert(submissions == 1)
        editor.isEditable = false
        press()
        assert(submissions == 1)
        print("PASS: Enter submits, Shift-Enter inserts newline, held Enter and disabled input do not submit")
    }
}
