# TaskFlow: Test Plan

| | |
|---|---|
| **Author** | Varbie M. Sumido |
| **Version** | 1.0 (draft) |
| **Date** | 2026-11-04 |
| **Application under test** | TaskFlow demo task manager |
| **Source documents** | `docs/SPECIFICATION.md` (requirements, selector contract, test case catalogue) |

## 1. Purpose

This plan describes how TaskFlow is tested: what is covered, how, with which tools, and when testing is considered done. TaskFlow is a small single-user demo app built to serve as the application under test for a Playwright (JavaScript) end-to-end automation project.

## 2. Scope

### In scope
| Area | Coverage |
|---|---|
| Authentication | Login, logout, input validation, protected-page redirects |
| Task management | Add, edit (inline), delete, change priority and status, "items left" counter, clear completed, empty state |
| Search and filters | Search by title; All / Active / Completed filters; combined search and filter |
| Profile | View and update full name, email and phone, with validation |
| Navigation | Header links, current-page indicator, log out |

The specification defines **58 requirements** across these areas and a catalogue of **69 test cases**, each traced to one or more requirements. The automated suite implements them as **76 Playwright tests** (data-driven cases run once per input, and a few extra persistence checks have no catalogue ID), run on three browsers for **228 test runs** per CI build.

### Out of scope
Registration, duplicate-email validation, password hashing, password update, task details page, delete confirmation dialog, dashboard widgets and charts, sorting, priority filter, notifications, avatar, sidebar navigation, performance and load testing, security testing.

## 3. Test approach

| Test type | How |
|---|---|
| Functional | Each requirement is verified by one or more test cases from the catalogue |
| Validation (negative and boundary) | Empty and whitespace titles, 50-character title limit, past and current due dates, invalid email, phone with fewer than 7 digits or non-digits |
| Regression | Full automated suite (`@regression`, 76 tests) run on every push and pull request through GitHub Actions |
| Smoke | All P1 tests (`@smoke`, 46 tests) run first on Chromium as a fast gate; the regression jobs start only if it passes |
| Accessibility checks | Targeted checks (`@a11y`, 7 tests): roles, `aria-invalid`, `aria-pressed`, `aria-current` |
| Cross-browser | Chromium, Firefox and WebKit, as parallel CI jobs |
| Exploratory (manual) | Time-boxed sessions on areas the spec marks `[Assumed]`; findings are logged as bug reports |

### Prioritisation
- **P1:** must pass; forms the smoke and core regression set.
- **P2:** should pass; run in the full regression suite.

### Automation approach
- Playwright with JavaScript, using the Page Object Model (`LoginPage`, `TasksPage`, `ProfilePage`) and custom fixtures for page objects and logged-in state.
- Selectors: `getByTestId` first (the selector contract is defined in the specification), then `getByRole` / `getByLabel`. No CSS or XPath selectors.
- Web-first assertions only; no fixed waits.
- Each test is independent: it runs in a fresh browser context with empty localStorage, so the app loads its seed data again; no test depends on another.
- Dates are computed at runtime from a date utility (`utils/dates.js`); none are hard-coded. The app's seed due dates are also relative to today.

## 4. Test environment and data

| Item | Value |
|---|---|
| Base URL | `BASE_URL` environment variable (local server or the Netlify deployment) |
| Browsers | Chromium, Firefox, WebKit (latest) |
| Demo account | `user@test.com` (credentials in the specification) |
| Seed data | Four seed tasks defined in the specification (3 unchecked, 1 completed) |
| CI | GitHub Actions; HTML report uploaded as a build artifact |
| Network | Local runs make no external network calls; runs against the Netlify deployment need network access to that site only |

## 5. Entry and exit criteria

**Entry criteria**
- Requirements in the specification are baselined, and open questions that block a test are resolved or have a documented assumption.
- The application is deployed or runnable locally and exposes the selectors in the selector contract.
- Test data and the demo account are available.

**Exit criteria**
- All P1 test cases executed and passing.
- All P2 test cases executed; any failures triaged and either fixed or logged as known issues.
- No open defects of high severity.
- Latest CI run on `main` is green on all three browsers.

## 6. Assumptions and risks

Items marked `[Assumed]` in the specification are treated as expected behaviour until confirmed. The main open questions:

| Ref | Item | Current assumption | Risk if wrong |
|---|---|---|---|
| OQ-1 | Where data persists | Browser localStorage | Persistence and reload tests need rework |
| OQ-2 | Where a new task appears | Bottom of the list | Add-task assertions need rework |
| OQ-4 | Error display when saving an inline edit | Not designed; error line inside the row | Edit validation tests may change selectors |
| OQ-5, OQ-6 | Exact error texts for past due date and profile fields | As listed in the specification | Message assertions need updating |
| OQ-7 | Whether "items left" counts all or only visible tasks | All tasks | Counter and filter tests need rework |
| OQ-9 | Whether profile email changes the login email | It does not | Login tests after a profile update |

Other risks:
- Date tests can fail if a run crosses midnight, because the test and the browser each work out "today" separately. Runtime dates keep tests from going stale but do not remove this; a failure at midnight should be rerun before it is logged as a defect.
- All state lives in browser storage, so isolation depends on each test getting a fresh browser context (Playwright's default).

## 7. Deliverables

- This test plan
- Specification and test case catalogue (`docs/SPECIFICATION.md`)
- Automated Playwright suite and page objects
- CI workflow and HTML test report per run
- Bug reports for defects found, logged as GitHub issues: https://github.com/varbs/TaskFlow/issues

## 8. Schedule and roles

| Activity | Owner | Date |
|---|---|---|
| Requirements and test case design | Varbie M. Sumido | 2026-11-04 |
| Automation development | Varbie M. Sumido | 2026-11-04 |
| Test execution and reporting | Varbie M. Sumido | 2026-11-04 |
