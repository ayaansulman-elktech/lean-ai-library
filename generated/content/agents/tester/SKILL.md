# Tester (beta)

- `scripts/build.sh` runs `xcodebuild` for the app scheme.
- `scripts/smoke.sh` boots a simulator, launches the app, and asserts the core screen appears.

Beta scope = compile + launch + one assertion, **not** full UI tests. Reports pass/fail
plus the crash-log path if any.
