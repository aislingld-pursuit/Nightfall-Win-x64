# Changelog

## [Alpha 0.1.0] - 2026-03-26

### Alpha Release — First Packaged Desktop Build

This is the first alpha release of Nuclear Force as a standalone Windows desktop application.

### Added

#### Electron Desktop App (`artifacts/desktop`)
- New `@workspace/desktop` package wrapping the full app in an Electron window
- Self-contained Express server (`src/server.ts`) runs inside the Electron main process — no terminal or browser required
- Dynamic port selection at startup to avoid conflicts with other running services
- All API routes bundled inline: `/api/healthz`, `/api/weather`, `/api/geocode`, `/api/escape-route`
- Built React frontend served as static files from `resources/public/` inside the packaged app
- esbuild bundles the main process and preload script to CJS for Electron compatibility
- `electron-builder` config produces a portable single-file `.exe` (~76MB, Windows x64)
- Build scripts: `pnpm run build` (compile), `pnpm run package` (produce `.exe`)

#### Workspace Changes
- Added `electron` to `onlyBuiltDependencies` in `pnpm-workspace.yaml` to allow Electron's binary download script
- Updated `pnpm-lock.yaml` with new desktop package dependencies (Electron 36, electron-builder 25, esbuild, express, cors)

### Known Limitations (Alpha)
- App icon uses the default Electron icon — custom icon not yet set
- Unsigned binary: Windows SmartScreen will warn on first launch (click "More info → Run anyway")
- `OPENWEATHER_API_KEY` and `GOOGLE_MAPS_KEY` environment variables must be set for weather and turn-by-turn routing features; the app degrades gracefully without them
- No auto-updater yet
