# Development Workflow

## Rule Of Thumb
- Target area: React + Vite frontend application.
- Treat `AGENTS.md` as the rule entry point and `docs/` as the operational
  manual.
- Use `npm.cmd` in PowerShell.

## Frontend Workflow
1. Install or verify dependencies.
2. Run TypeScript and production build checks.
3. Start the Vite dev server for browser verification.
4. Verify file open, edit, save/download, and sample deck behavior.

## Standard Commands
```powershell
npm.cmd install
npm.cmd run build
npm.cmd run dev
```

## Documentation Rule
- Keep operational details under `docs/`.
- Keep `AGENTS.md` focused on behavior rules and pointers into `docs/`.
- Do not rely on `README.md` for build, test, or environment instructions.
