---
name: check-build
description: Run a production build and report any errors or warnings
user-invocable: true
---

# Check Build

Run `npm run build` and analyze the output. Report:
- Whether the build succeeded or failed
- Any warnings (unused imports, etc.)
- Bundle size summary
- If errors exist, read the relevant source files and fix them, then rebuild to confirm
