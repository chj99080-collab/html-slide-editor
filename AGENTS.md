# html-slide-editor

## Overview
html-slide-editor is a React + Vite + TypeScript application for viewing and
editing constrained, Codex-generated HTML slide decks.

## Primary Rule
- Treat this file as the rule entry point.
- Treat `docs/` as the operational manual.
- Do not rely on `README.md` for build, test, or environment instructions.

## Source Layout
- Main source root: `src/`
- Static sample root: `public/`
- Operational docs:
  - `docs/dev_workflow.md`
  - `docs/frontend.md`

## Standard Workflow
- Use `npm.cmd` on Windows PowerShell because `npm.ps1` may be blocked by
  execution policy.
- Reuse the standard commands documented under `docs/`.
- Avoid command spelling drift so saved approval prefix rules can be reused.

## Stack
- Node.js 24
- npm 11
- React
- Vite
- TypeScript

## Project Expectations
- Supported input: constrained HTML slide decks using `section.slide` and
  editable metadata attributes.
- Supported editable element types: `text`, `image`, `rect`, `ellipse`, `line`,
  and `svg-group`.
- File operations include: browser file open, Chromium File System Access API
  save, and download fallback.

## Coding Rules
- Keep DOM parsing and serialization logic isolated from React presentation
  components.
- Preserve unsupported HTML content when saving.
- Add or update tests when behavior changes and a test harness exists.

## Documentation Rules
- Keep long setup and build instructions under `docs/`.
- Keep this file short, stable, and reusable across project work.
- If operational commands change, update the relevant file under `docs/` first.
