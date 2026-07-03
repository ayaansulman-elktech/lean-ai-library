# vision-camera (code snippet)

Reusable on-device capture + privacy helpers, seeded by Sprint 1 (Color Matching).
Any app that takes a photo and analyzes it on-device should reuse these.

## Contents (to add)
- `CameraView.swift` - SwiftUI `UIViewControllerRepresentable` wrapping `AVCaptureSession` for a still capture.
- `ImageCrypto.swift` - encrypt a captured image at rest (CryptoKit) before any persistence.

## Why it's a library
Every "scan something" niche (color, skin, plant, food) repeats capture + encryption.
Write once here; apps import it. See `../README.md` for the rule.
