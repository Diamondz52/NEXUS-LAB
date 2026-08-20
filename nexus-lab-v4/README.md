# NEXUS LAB v4

NEXUS LAB is a local-first creative operating system for visual experimentation and frontend development. Version 4 adds a genuinely adaptive Home preview, reliable Code Lab device sizing, bilingual fuzzy search, stable Explore workflows and a complete persistent Library.

No account, API key, backend or paid service is required. Projects and preferences stay in browser storage unless you export or back them up.

## Requirements

- Node.js 22.13 or newer
- npm

## How to run

```bash
npm install
npm run dev
```

Open the local address shown in the terminal, normally `http://localhost:3000`.

## Verify and build

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Product areas

- `/` — intent-driven start, Quick Start and Continue Building
- `/code` — Monaco workspace, files, tabs, live preview, console and responsive controls
- `/lab` — hub connecting every creative workspace
- `/lab/chaos` — deterministic Design DNA generation
- `/tools` — Prompt, Gradient, Neon, Glass, Color and Motion laboratories
- `/explore` — curated visual systems
- `/library` — saved creative experiments
- `/about`, `/contact`, `/changelog` — creator, connections and release history

## Code Lab

- HTML, CSS, JavaScript, TypeScript and JSON files
- Project wizard with nine formats and eight visual directions
- Autosave, project CRUD, notes, todos and reversible snapshots
- Live or manual sandboxed preview with device presets, custom sizes, rotation, zoom and frame
- Captured console output, local document checks and responsive metrics
- Component presets, snippets and CSS design tokens
- Import files or a NEXUS backup; export the current file, all data, or a complete project ZIP
- Shortcuts: `Ctrl/⌘ + K` commands, `Ctrl/⌘ + S` snapshot, `Ctrl/⌘ + Enter` run, `Ctrl/⌘ + B` files, `Ctrl/⌘ + J` console

## Local data

Code projects use the versioned `nexus-code-projects-v3` key. Creative experiments continue to use `nexus-library-v2`. Clearing site data removes local projects, so use **Backup all data** when moving between browsers or devices.
