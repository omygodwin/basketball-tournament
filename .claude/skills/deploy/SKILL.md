---
name: deploy
description: Build, commit, and deploy changes to GitHub Pages
user-invocable: true
---

# Deploy to GitHub Pages

Build, commit all changes, and push to main for GitHub Pages deployment.

## Steps

1. Run `npm run build` to verify the production build succeeds with no errors
2. If build fails, fix the errors and rebuild before continuing
3. Run `git status` to see all changed/untracked files
4. Run `git diff` to review changes
5. Stage all relevant source files (do NOT stage `dist/`, `node_modules/`, or `.DS_Store`)
6. Create a commit with a descriptive message summarizing the changes
7. Push to main: `git push origin HEAD:main`
8. Confirm the push succeeded
9. Report the deployed URL: https://omygodwin.github.io/basketball-tournament/
