# TaskFlow – Playwright automation project (JavaScript)

![Playwright Tests](https://github.com/varbs/TaskFlow/actions/workflows/playwright.yml/badge.svg)

**Live demo:** https://taskflow-demo-project.netlify.app  
Demo account: `user@test.com` / `Password123`

A self-contained project: the **TaskFlow app under test** (Login, Tasks, Profile), its
**specification** and a **Playwright test suite** with the Page Object Model.

**Test counts:** the spec's catalogue (`docs/SPECIFICATION.md` section 10) defines **69 test cases**;
the suite runs **76 automated tests** (`npx playwright test --list`). The numbers differ because
data-driven cases run once per input (4 invalid emails, 4 invalid phones, 3 priorities) and a few
extra checks, such as persistence after reload, have no catalogue ID.

## Quick start
```bash
npm install
npx playwright install chromium   # first time only
npm test                          # starts the app automatically, runs all tests
npm run report                    # open the HTML report
```
Run the app on its own: `npm start` → http://localhost:3000
Demo account: `user@test.com` / `Password123`

Tests run locally and against the deployed site. To test the live deployment (the local server is not started):
```bash
BASE_URL=https://taskflow-demo-project.netlify.app npm test
```
(Windows PowerShell: `$env:BASE_URL="https://taskflow-demo-project.netlify.app"; npm test`)

## Structure
```
app/            App under test (index.html, app.js, styles.css) – vanilla JS, localStorage
server.js       Tiny static server (serves index.html for /login, /tasks, /profile)
docs/           SPECIFICATION.md – requirements, selector contract, test case catalogue
pages/          Page objects: LoginPage, TasksPage, ProfilePage, NavBar
fixtures/       Custom fixtures: loginPage, tasksPage, profilePage, loggedIn
test-data/      users, messages (exact UI texts), seed tasks
utils/dates.js  Relative dates (today, tomorrow, yesterday) so tests never go stale
tests/          auth/ tasks/ profile/ specs, each test tagged with requirement ids
```

## Conventions
- Selectors use `data-testid` only (`testIdAttribute` is set in `playwright.config.js`).
- Web-first assertions, no fixed waits. Each test starts with fresh localStorage (seed data).
- Test titles carry requirement ids, e.g. `(TASK-06)`; `@p1` marks must-pass tests: `npm run test:p1`.
- UI messages live in `test-data/messages.js`; dates come from `utils/dates.js`.

## Notes
- Seed tasks use fixed dates (Nov 2026) for display only; add/edit date rules use today's real date.
- Assumptions marked `[Assumed]` in the spec (for example the Profile error texts and the
  edit-row error `edit-error`) are implemented as written; change `app/app.js` and
  `test-data/messages.js` together if the real rules differ.

## CI
GitHub Actions (`.github/workflows/playwright.yml`) runs the suite on every push and pull request to `main`
and uploads the HTML report as an artifact (Actions tab → run → Artifacts → `playwright-report`).

## Free hosting
The app is static, so it deploys as-is. Publish the `app/` folder; `app/_redirects`, `netlify.toml` and
`vercel.json` make `/login`, `/tasks` and `/profile` work on Netlify, Cloudflare Pages and Vercel.
Run the tests against the live site: `BASE_URL=https://taskflow-demo-project.netlify.app npm test`
