# Platforms

The design system covers **every Apple surface**, not just the phone screen. Each
subfolder holds the platform-specific component variants + Figma coverage notes:

| Folder | Surface |
|---|---|
| `iphone/` | primary app UI |
| `ipad/` | adaptive / multi-column layouts |
| `watch/` | complications, short glances |
| `vision/` | spatial UI (visionOS) |
| `widgets/` | Home / Lock Screen widgets |
| `dynamic-island/` | Live Activities presentations |
| `notifications/` | rich notification layouts |

Components stay **token-driven**; these folders capture how an organism/template
*adapts* per surface. Most niches use a subset — populate per app, don't pre-build all.
