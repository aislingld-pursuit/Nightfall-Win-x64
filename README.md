# Nuclear Force — Electron Desktop Build

A standalone Windows desktop application for nuclear blast escape routing, built with Electron. No browser or terminal required — just double-click and run.

---

## What This Is

Nuclear Force is an educational simulation tool that helps visualize nuclear blast zones and generate escape routes away from a blast site. This branch packages the full web application into a native Windows `.exe` using Electron.

**Features:**
- Interactive map with nuclear blast radius visualization (dirty bomb, 10kt, 100kt, 1MT yields)
- Nearest shelter finder with real NYC shelter data
- Address geocoding via OpenStreetMap Nominatim
- Live weather data (wind speed/direction for fallout estimation)
- Turn-by-turn escape route generation via Google Maps Directions API

---

## Quick Start

Download `Nuclear Force 0.0.0.exe` from the `artifacts/desktop/release/` folder and double-click it.

> **Note:** Windows SmartScreen may warn on first launch because the binary is unsigned. Click **More info → Run anyway** to proceed.

---

## Build From Source

### Prerequisites
- Node.js 20+
- pnpm 10+

### Steps

```bash
# Install dependencies
pnpm install

# Build the React frontend
cd artifacts/nuclear-escape
pnpm run build

# Build and package the Electron app
cd ../desktop
pnpm run package
```

The packaged `.exe` will appear in `artifacts/desktop/release/`.

---

## Environment Variables

Some features require API keys set as environment variables before launching:

| Variable | Feature |
|----------|---------|
| `OPENWEATHER_API_KEY` | Live weather data (wind for fallout direction) |
| `GOOGLE_MAPS_KEY` | Turn-by-turn escape route directions |

The app runs without these keys but those features will be unavailable.

---

## Project Structure

```
artifacts/
  nuclear-escape/     # React + Vite frontend (map UI)
  api-server/         # Express API server (standalone web use)
  desktop/            # Electron wrapper (this branch)
    src/
      main.ts         # Electron main process
      server.ts       # Bundled Express server + API routes
      preload.ts      # Renderer preload script
    build.mjs         # esbuild bundler config
    electron-builder.yml  # Packaging config (.exe output)
```

---

## Alpha Release Notes

See [CHANGELOG.md](./CHANGELOG.md) for full release notes.

**Alpha 0.1.0 — 2026-03-26**
- First packaged Windows desktop build
- Portable single-file `.exe` (~76MB, Windows x64)
- Self-contained — no install, no browser, no terminal needed
