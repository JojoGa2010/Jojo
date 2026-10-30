import XCTest

final class FinanzGameUITests: XCTestCase {
    @MainActor func testNativeScreensAndSavedProgress() throws {
        continueAfterFailure = false
        let app = XCUIApplication()
        app.launchArguments = ["-finanz-ui-test", "-finanz-ui-test-clean"]
        app.launch()
        let card = app.descendants(matching: .any)["earn.card"].firstMatch
        XCTAssertTrue(card.waitForExistence(timeout: 15))
        let balance = app.staticTexts["wallet.balance"]
        XCTAssertTrue(balance.label.contains("2.500,00"))
        card.tap()
        XCTAssertTrue(balance.label.contains("2.501,00"), balance.label)
        XCTAssertFalse(app.staticTexts["Sättigung"].exists)
        app.buttons["Bank wechseln"].tap()
        app.buttons["N26"].tap()
        XCTAssertTrue(card.label.contains("N26"))
        capture("01-Karte", app)

        app.tabBars.buttons["Karriere"].tap()
        let firstJob = app.buttons["job.0"]
        reveal(firstJob, in: app)
        firstJob.tap()
        app.buttons["Bewerbung vorbereiten"].tap()
        let signature = app.descendants(matching: .any)["application.signature"].firstMatch
        reveal(signature, in: app)
        signature.coordinate(withNormalizedOffset: CGVector(dx: 0.12, dy: 0.65)).press(forDuration: 0.1, thenDragTo: signature.coordinate(withNormalizedOffset: CGVector(dx: 0.85, dy: 0.25)), withVelocity: .slow, thenHoldForDuration: 0.1)
        let submit = app.buttons["Unterschreiben & absenden"]
        reveal(submit, in: app)
        XCTAssertTrue(submit.isEnabled)
        submit.tap()
        XCTAssertTrue(app.staticTexts["Deine Unterlagen werden geprüft."].waitForExistence(timeout: 5))
        capture("02-Karriere", app)

        app.tabBars.buttons["Essen"].tap()
        XCTAssertTrue(app.staticTexts["Sättigung"].exists)
        app.buttons["Vorräte ansehen"].tap()
        let bread = app.buttons["product.buy.bread"]
        reveal(bread, in: app)
        bread.tap()
        XCTAssertTrue(balance.label.contains("2.498,00"), balance.label)
        capture("03-Versorgung", app)

        app.tabBars.buttons["Vermögen"].tap()
        XCTAssertFalse(app.staticTexts["Sättigung"].exists)
        app.buttons["Firmen"].tap()
        app.buttons["Eigene Firma gründen"].tap()
        app.textFields["company.name"].tap()
        app.textFields["company.name"].typeText("Meine neue Firma")
        let create = app.buttons["Firma gründen"]
        reveal(create, in: app)
        create.tap()
        XCTAssertTrue(app.staticTexts["Meine neue Firma"].waitForExistence(timeout: 5))
        XCTAssertTrue(balance.label.contains("1.748,00"), balance.label)
        capture("04-Firmen", app)

        app.tabBars.buttons["Einstellungen"].tap()
        XCTAssertTrue(app.buttons["Spielstand exportieren"].exists)
        XCTAssertTrue(app.buttons["Spielstand importieren"].exists)
        capture("05-Einstellungen", app)
        app.terminate()
        app.launchArguments = ["-finanz-ui-test"]
        app.launch()
        XCTAssertTrue(card.waitForExistence(timeout: 15))
        XCTAssertTrue(card.label.contains("N26"))
        XCTAssertTrue(app.staticTexts["wallet.balance"].label.contains("1.748,00"))
        app.tabBars.buttons["Vermögen"].tap()
        app.buttons["Firmen"].tap()
        XCTAssertTrue(app.staticTexts["Meine neue Firma"].exists)
    }

    @MainActor private func reveal(_ element: XCUIElement, in app: XCUIApplication) {
        for _ in 0..<7 { if element.exists && element.isHittable { return }; app.swipeUp() }
        XCTAssertTrue(element.exists && element.isHittable, "Element nicht erreichbar: \(element)")
    }
    @MainActor private func capture(_ name: String, _ app: XCUIApplication) {
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
