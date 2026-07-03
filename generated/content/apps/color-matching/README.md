# Color Matching (Sprint 1)

SwiftUI starter. Consumes the shared layer (`design-system`, `agents`, `libraries`).

## Run it
The `.xcodeproj` is not committed (it's generated/local). To build:
1. Open Xcode → **File ▸ New ▸ Project ▸ iOS App**, name `ColorMatching`, bundle id `co.elktech.colormatching`.
2. Add the files under `Sources/` to the target (or use XcodeGen / Swift Package).
3. Run on a simulator. The flow follows `wireframe/` and the design-system templates.

## Files
- `Sources/ColorMatchingApp.swift` — entry point.
- `Sources/ContentView.swift` — root flow.
- `Sources/Onboarding/`, `ColorAnalysis/`, `OutfitScan/`, `Paywall/` — feature views.
- `charter.md` — the spec. `universe/` — this app's tokens/moodboard.
- `wireframe/`, `audit/` — agent outputs.

## TODO (real implementation)
- Replace `analyze()` with the `skin-tone-cv` CoreML model + `seasons.md` mapping.
- Camera capture + encryption from `libraries/code/vision-camera`.
- StoreKit 2 in the paywall.
