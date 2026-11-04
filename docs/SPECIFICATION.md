# TaskFlow: Specification and Requirements

**Purpose:** Defines the behavior, validation rules, selectors and test coverage of the TaskFlow demo app, so it can serve as the application under test (AUT) for a Playwright (JavaScript) automation project.
**UI source:** Canvas page "TaskFlow Test Spec" (10 artboards). Earlier design pages remain as reference only.
**Status:** Draft v1.0, 2026-11-04. Items marked **[Assumed]** are not visible in the UI designs and need confirmation (see section 12).

---

## 1. Scope

### 1.1 In scope
Three screens, with the states shown in the design:

| Screen | States designed |
|---|---|
| Login | Default, Required-fields error, Invalid-credentials error |
| Tasks | Default, Add-task error, Inline edit, Empty |
| Profile | Default, Validation errors, Saved |

### 1.2 Out of scope (removed from the original five-module design)
Registration, duplicate-email validation, password hashing, password update, task details page, delete confirmation dialog, dashboard widgets and charts, sort by creation or due date, notifications, avatar, sidebar navigation.

### 1.3 Mapping from the original modules

| Original module | Kept as | Dropped |
|---|---|---|
| 1. Authentication | Login, logout, input validation (Login screen) | Registration, duplicate email, password hashing |
| 2. Dashboard | "N items left" counter on Tasks | Summary cards, charts, high-priority summary, recent tasks |
| 3. Task Management (CRUD) | Create, edit (inline), delete, change priority (edit and add forms), change status (checkbox) | Task details page, delete confirmation |
| 4. Search and Filters | Search by title, filter All / Active / Completed | Priority filter, sort |
| 5. User Profile | View profile, update full name, email, phone | Update password |

---

## 2. Application overview

- Single-user demo app. One built-in account (section 3).
- Three pages: Login, Tasks (landing page after login), Profile.
- Header on Tasks and Profile: brand "TaskFlow", nav links **Tasks** and **Profile**, **Log out** button.
- Plain styling, no animations (keeps tests free of timing waits).
- **[Assumed]** Tasks and profile data persist in browser `localStorage`, so a page reload keeps state, and the app needs no backend. Test data is reset by clearing storage before each test.

---

## 3. Test environment and data

| Item | Value |
|---|---|
| Base URL | `BASE_URL` environment variable, for example `http://localhost:3000` |
| Demo account | Email `user@test.com`, password `Password123` |
| Default profile | Full name `Test User`, email `user@test.com`, phone `5551234567` |
| Date format | `YYYY-MM-DD` (display and input) |
| "Today" | Always computed at runtime. Never hard-code dates in tests. |

### 3.1 Seed tasks (Tasks default state)

| Title | Priority | Due | Completed |
|---|---|---|---|
| Write test plan | Medium | 2026-11-06 | No |
| Review pull request | High | 2026-11-05 | No |
| Update README | Low | 2026-11-10 | Yes |
| Book team retro | Medium | 2026-11-12 | No |

Seed dates are samples. For tests, seed tasks with dates relative to today. The seed gives "3 items left".

---

## 4. Screens and states (design reference)

| ID | Canvas artboard | What it shows |
|---|---|---|
| S-LOGIN-1 | Login: Default | Empty email and password, Log in button, demo-account hint |
| S-LOGIN-2 | Login: Required fields error | Banner "Email and password are required."; both inputs red |
| S-LOGIN-3 | Login: Invalid credentials | Banner "Invalid email or password."; inputs filled |
| S-TASKS-1 | Tasks: Default | Add form, search, filters, 4 tasks, "3 items left" |
| S-TASKS-2 | Tasks: Add task error | Title red, error area "Title is required." |
| S-TASKS-3 | Tasks: Inline edit | First row replaced by title input, priority select, date input, Save, Cancel |
| S-TASKS-4 | Tasks: Empty state | "No tasks to show.", "0 items left", Clear completed disabled |
| S-PROF-1 | Profile: Default | Prefilled name, email, phone |
| S-PROF-2 | Profile: Validation errors | Per-field error messages |
| S-PROF-3 | Profile: Saved | Banner "Profile saved." |

---

## 5. Functional requirements

Priority: **P1** = must have in the smoke or regression suite; **P2** = should have.

### 5.1 Authentication (Login screen)

| ID | Requirement | Priority |
|---|---|---|
| AUTH-01 | The Login page shows Email and Password fields, a **Log in** button, and the hint "Demo account: user@test.com / Password123". | P1 |
| AUTH-02 | The password field masks its input. | P2 |
| AUTH-03 | Valid credentials log the user in and open the Tasks page. **[Assumed]** | P1 |
| AUTH-04 | If email or password is empty, show "Email and password are required." in the error banner and do not log in. | P1 |
| AUTH-05 | If both are filled but do not match the account, show "Invalid email or password." and stay on Login. | P1 |
| AUTH-06 | The same message is shown for wrong email and wrong password (no hint about which was wrong). **[Assumed]** | P2 |
| AUTH-07 | Error banner has `role="alert"`; both inputs are marked `aria-invalid` in the required-fields state. | P2 |
| AUTH-08 | Clicking **Log out** ends the session and shows the Login page. **[Assumed]** | P1 |
| AUTH-09 | After logout, opening a protected page directly (`/tasks`, `/profile`) redirects to Login. **[Assumed]** | P1 |
| AUTH-10 | A logged-in user who opens Login is sent to Tasks. **[Assumed]** | P2 |
| AUTH-11 | Email matching is case-insensitive and ignores surrounding spaces. **[Assumed]** | P2 |

### 5.2 Task management (Tasks screen)

**Add task**

| ID | Requirement | Priority |
|---|---|---|
| TASK-01 | The Add task form has Title (hint "Required, max 50 characters"), Priority (Low, Medium, High; default Medium), Due date (hint "Must be today or later") and an **Add task** button. | P1 |
| TASK-02 | Adding a valid task appends it to the list with its title, priority badge and due date, all unchecked. **[Assumed: appended at the bottom]** | P1 |
| TASK-03 | After a successful add, the form resets (title empty, priority Medium, date empty) and the error area is cleared. | P1 |
| TASK-04 | An empty or whitespace-only title is rejected with "Title is required."; no task is added. | P1 |
| TASK-05 | Title input limits entry to 50 characters (`maxlength=50`). A title of exactly 50 characters is accepted. | P1 |
| TASK-06 | A due date earlier than today is rejected with "Due date must be today or later."; no task is added. **[Assumed text]** | P1 |
| TASK-07 | A due date of today is accepted. | P1 |
| TASK-08 | Due date is optional; a task without a date is added and shows an empty due-date cell. **[Assumed]** | P2 |
| TASK-09 | Validation errors appear in the inline error area under the form (`add-task-error`, `role="alert"`), and the invalid title input is marked `aria-invalid`. | P2 |
| TASK-10 | Titles are trimmed before saving. **[Assumed]** | P2 |

**View, status and counter**

| ID | Requirement | Priority |
|---|---|---|
| TASK-11 | Each row shows: checkbox, title, priority badge (Low, Medium or High), due date, **Edit** and **Delete** buttons. | P1 |
| TASK-12 | Checking the checkbox marks the task completed: title is struck through and the counter decreases. Unchecking reverses it. | P1 |
| TASK-13 | The footer shows "N items left", where N is the number of unchecked tasks across all tasks, regardless of search or filter. **[Assumed: all tasks]** | P1 |
| TASK-14 | With exactly one unchecked task the footer reads "1 item left". **[Assumed]** | P2 |
| TASK-15 | Completed state survives a page reload. **[Assumed: localStorage]** | P2 |

**Edit task (inline)**

| ID | Requirement | Priority |
|---|---|---|
| TASK-16 | **Edit** replaces that row with a title input, priority select and date input, prefilled with current values, plus **Save** and **Cancel**. | P1 |
| TASK-17 | **Save** applies the changes (title, priority, due date) and returns the row to read-only mode. | P1 |
| TASK-18 | **Cancel** discards changes and restores the original values. | P1 |
| TASK-19 | **Save** applies the same validation as Add (title required and max 50, due date today or later). Where the error is shown is an open question (OQ-4). | P1 |
| TASK-20 | Changing priority in edit mode updates the badge text and colour. | P1 |
| TASK-21 | Only one row is in edit mode at a time. Opening edit on another row cancels the first. **[Assumed]** | P2 |

**Delete and clear**

| ID | Requirement | Priority |
|---|---|---|
| TASK-22 | **Delete** removes the task immediately, with no confirmation dialog. | P1 |
| TASK-23 | Deleting an unchecked task decreases "items left"; deleting a checked task does not change it. | P1 |
| TASK-24 | **Clear completed** removes all checked tasks and keeps unchecked ones. | P1 |
| TASK-25 | **Clear completed** is disabled when no task is checked. | P2 |

**Empty state**

| ID | Requirement | Priority |
|---|---|---|
| TASK-26 | Whenever no rows are visible, the list area shows "No tasks to show." (`empty-state`). This applies to no tasks at all, and to a search or filter with no matches. | P1 |
| TASK-27 | In the empty state the footer reads "0 items left". | P2 |

### 5.3 Search and filters (Tasks screen)

| ID | Requirement | Priority |
|---|---|---|
| FILT-01 | Typing in the search box filters rows by title. Matching is case-insensitive and by substring. | P1 |
| FILT-02 | Search updates as the user types (no submit button). **[Assumed]** | P2 |
| FILT-03 | Filter buttons **All**, **Active** and **Completed** are shown; **All** is selected by default. The selected button has `aria-pressed="true"`. | P1 |
| FILT-04 | **Active** shows only unchecked tasks. **Completed** shows only checked tasks. | P1 |
| FILT-05 | Search and filter combine (both must match). | P1 |
| FILT-06 | Clearing the search box restores rows according to the current filter. | P2 |
| FILT-07 | Search and filter do not change "N items left" (see TASK-13). **[Assumed]** | P2 |
| FILT-08 | Changing a task's status while a filter is active updates the visible list immediately (for example, checking a task under **Active** removes it from view). **[Assumed]** | P2 |

### 5.4 Profile

| ID | Requirement | Priority |
|---|---|---|
| PROF-01 | The Profile page shows Full name, Email and Phone, prefilled with the saved profile, and a **Save profile** button. Phone hint: "Digits only, at least 7". | P1 |
| PROF-02 | Valid input and **Save profile** shows "Profile saved." and persists the values across reload. | P1 |
| PROF-03 | Empty full name shows "Full name is required." **[Assumed text]** | P1 |
| PROF-04 | Invalid email format shows "Enter a valid email address." **[Assumed text]** | P1 |
| PROF-05 | A phone with non-digit characters, or fewer than 7 digits, shows "Phone must be digits only, at least 7." **[Assumed text]** | P1 |
| PROF-06 | A phone of exactly 7 digits is accepted. | P1 |
| PROF-07 | Phone is optional: an empty phone is accepted. **[Assumed]** | P2 |
| PROF-08 | When any field is invalid, nothing is saved and no success banner appears. | P1 |
| PROF-09 | The success banner disappears when the user edits a field again. **[Assumed]** | P2 |
| PROF-10 | Field errors are shown under their field with `role="alert"`, and the field is marked `aria-invalid`. | P2 |

### 5.5 Navigation (Tasks and Profile)

| ID | Requirement | Priority |
|---|---|---|
| NAV-01 | **Tasks** and **Profile** links in the header switch pages; the current page link has `aria-current="page"`. | P1 |
| NAV-02 | **Log out** is available on both pages (see AUTH-08). | P1 |

---

## 6. Validation rules and messages

| Field | Rule | Message | Source |
|---|---|---|---|
| Login: email or password | Both required | Email and password are required. | Design |
| Login: credentials | Must match the account | Invalid email or password. | Design |
| Add or edit task: title | Required, trimmed, max 50 | Title is required. | Design (required only) |
| Add or edit task: title | Over 50 characters | Blocked by `maxlength`; no message needed | **[Assumed]** |
| Add or edit task: due date | Today or later | Due date must be today or later. | **[Assumed text]** |
| Profile: full name | Required | Full name is required. | **[Assumed text]** |
| Profile: email | Valid format | Enter a valid email address. | **[Assumed text]** |
| Profile: phone | Digits only, at least 7 | Phone must be digits only, at least 7. | **[Assumed text]** |
| Profile: save | Success | Profile saved. | Design |
| Tasks: no rows | Empty state | No tasks to show. | Design |

---

## 7. Selector contract (`data-testid`)

The AUT must expose these attributes. Tests use `getByTestId()` first; `getByRole` and `getByLabel` are used where noted for accessibility checks.

### 7.1 Login

| Element | `data-testid` | Also reachable by |
|---|---|---|
| Email input | `email-input` | label "Email" |
| Password input | `password-input` | label "Password" |
| Log in button | `login-button` | role button, name "Log in" |
| Error banner | `login-error` | role alert |
| Demo hint | `demo-hint` | |

### 7.2 Shared header (Tasks and Profile)

| Element | `data-testid` |
|---|---|
| Tasks link | `nav-tasks` |
| Profile link | `nav-profile` |
| Log out button | `logout-button` |

### 7.3 Tasks

| Element | `data-testid` | Notes |
|---|---|---|
| Add: title input | `task-title-input` | label "Title", `maxlength=50` |
| Add: priority select | `task-priority-select` | label "Priority" |
| Add: due date input | `task-due-input` | `type=date`, label "Due date" |
| Add task button | `add-task-button` | |
| Add error area | `add-task-error` | `role=alert`, empty when no error |
| Search input | `search-input` | aria-label "Search tasks" |
| Filter buttons | `filter-all`, `filter-active`, `filter-completed` | `aria-pressed` |
| Task list | `task-list` | `ul` |
| Task row | `task-item` | `li`, repeated |
| Row checkbox | `task-checkbox` | aria-label "Mark {title} as completed" |
| Row title | `task-title` | |
| Row priority badge | `task-priority` | text Low, Medium or High |
| Row due date | `task-due` | |
| Row Edit button | `edit-button` | |
| Row Delete button | `delete-button` | |
| Edit: title input | `edit-title-input` | |
| Edit: priority select | `edit-priority-select` | |
| Edit: due date input | `edit-due-input` | |
| Edit: Save button | `save-button` | |
| Edit: Cancel button | `cancel-button` | |
| Items left | `items-left` | text "N items left" |
| Clear completed button | `clear-completed` | |
| Empty state | `empty-state` | |

Scope row actions inside a row: `page.getByTestId('task-item').filter({ hasText: 'Write test plan' }).getByTestId('edit-button')`.

### 7.4 Profile

| Element | `data-testid` |
|---|---|
| Full name input | `full-name-input` |
| Email input | `email-input` |
| Phone input | `phone-input` |
| Save profile button | `save-profile-button` |
| Field errors | `full-name-error`, `email-error`, `phone-error` |
| Success banner | `profile-success` |

---

## 8. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 | Every input has a visible `<label>` or an `aria-label`. |
| NFR-02 | Errors use `role="alert"`; success uses `role="status"`. |
| NFR-03 | All controls are reachable and operable by keyboard; focus ring is visible. |
| NFR-04 | Text colour contrast meets WCAG 2.1 AA (4.5:1). |
| NFR-05 | No animations or transitions, so tests do not depend on timing. |
| NFR-06 | Desktop layout is designed for 1280 px wide; Login and Profile work at 800 px. |
| NFR-07 | Supported browsers for tests: Chromium, Firefox, WebKit (latest). |
| NFR-08 | No external network calls during tests. |

---

## 9. Automation approach (Playwright, JavaScript)

### 9.1 Project structure

```
taskflow-e2e/
  playwright.config.js
  package.json
  .env.example              # BASE_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD
  pages/
    LoginPage.js
    TasksPage.js
    ProfilePage.js
  fixtures/
    test-fixtures.js        # loggedInPage, seededTasks
  test-data/
    users.js                # valid, wrong password, malformed
  utils/
    dates.js                # todayISO(), addDaysISO(n)
  tests/
    auth/
      login.spec.js
      logout-and-guard.spec.js
    tasks/
      add-task.spec.js
      edit-task.spec.js
      status-and-counter.spec.js
      delete-and-clear.spec.js
      search-and-filter.spec.js
      empty-state.spec.js
    profile/
      profile-validation.spec.js
      profile-save.spec.js
```

### 9.2 Page objects (methods)

| Page object | Methods |
|---|---|
| `LoginPage` | `goto()`, `login(email, password)`, `expectError(text)` |
| `TasksPage` | `addTask({title, priority, due})`, `row(title)`, `toggle(title)`, `startEdit(title)`, `saveEdit({title, priority, due})`, `cancelEdit()`, `deleteTask(title)`, `search(text)`, `filter('All'\|'Active'\|'Completed')`, `clearCompleted()`, `expectItemsLeft(n)`, `expectTitles([...])`, `expectEmpty()` |
| `ProfilePage` | `goto()`, `fill({name, email, phone})`, `save()`, `expectErrors({name, email, phone})`, `expectSaved()` |

### 9.3 Conventions

- Prefer `getByTestId`, then `getByRole`/`getByLabel`. No CSS or XPath selectors.
- Use web-first assertions (`expect(locator).toHaveText(...)`). No fixed `waitForTimeout`.
- Each test is independent: clear `localStorage`, seed state through a fixture, not through other tests.
- Reuse login with a saved `storageState` for Tasks and Profile suites. Login tests start unauthenticated.
- Dates come from `utils/dates.js`.
- Tags: `@smoke` (P1 happy paths), `@regression` (all), `@a11y` (NFR checks).

### 9.4 Config

| Setting | Value |
|---|---|
| `baseURL` | `process.env.BASE_URL` |
| Projects | chromium, firefox, webkit |
| `retries` | 0 locally, 1 in CI |
| `trace` | `on-first-retry` |
| `screenshot` | `only-on-failure` |
| `fullyParallel` | true |
| Reporter | `html` plus `list` |

---

## 10. Test case catalogue

Priority P1 cases form the `@smoke` / core regression set.

### 10.1 Login

| ID | Requirement | Scenario | Expected | P |
|---|---|---|---|---|
| TC-AUTH-01 | AUTH-01 | Open Login | Fields, button and demo hint visible | P1 |
| TC-AUTH-02 | AUTH-03 | Log in with `user@test.com` / `Password123` | Tasks page opens | P1 |
| TC-AUTH-03 | AUTH-04 | Submit with both fields empty | "Email and password are required." | P1 |
| TC-AUTH-04 | AUTH-04 | Email only, empty password | Required error | P1 |
| TC-AUTH-05 | AUTH-04 | Password only, empty email | Required error | P1 |
| TC-AUTH-06 | AUTH-05 | Correct email, wrong password | "Invalid email or password." | P1 |
| TC-AUTH-07 | AUTH-05, 06 | Unknown email, any password | Same invalid message | P2 |
| TC-AUTH-08 | AUTH-02 | Type into password | Input type is `password` | P2 |
| TC-AUTH-09 | AUTH-08 | Click Log out on Tasks | Login page shown | P1 |
| TC-AUTH-10 | AUTH-09 | After logout, open `/tasks` | Redirected to Login | P1 |
| TC-AUTH-11 | AUTH-10 | Logged in, open Login URL | Redirected to Tasks | P2 |
| TC-AUTH-12 | AUTH-11 | Email in upper case with spaces | Login succeeds | P2 |
| TC-AUTH-13 | AUTH-07 | Required error state | Banner has role alert; inputs `aria-invalid` | P2 |

### 10.2 Add task

| ID | Requirement | Scenario | Expected | P |
|---|---|---|---|---|
| TC-ADD-01 | TASK-01 | Open Tasks | Form fields, hints, Medium default visible | P1 |
| TC-ADD-02 | TASK-02, 03 | Add valid task (title, High, tomorrow) | Row appears with correct title, badge, date; form reset | P1 |
| TC-ADD-03 | TASK-04 | Add with empty title | "Title is required."; list unchanged | P1 |
| TC-ADD-04 | TASK-04, 10 | Add with spaces only | "Title is required." | P2 |
| TC-ADD-05 | TASK-05 | Type 51 characters | Only 50 kept | P1 |
| TC-ADD-06 | TASK-05 | Add 50-character title | Accepted | P1 |
| TC-ADD-07 | TASK-06 | Due date yesterday | Past-date error; not added | P1 |
| TC-ADD-08 | TASK-07 | Due date today | Accepted | P1 |
| TC-ADD-09 | TASK-08 | No due date | Added with empty date | P2 |
| TC-ADD-10 | TASK-01 | Add one task per priority (Low, Medium, High) | Badge text matches each | P1 |
| TC-ADD-11 | TASK-13 | Add task | "items left" +1 | P1 |
| TC-ADD-12 | TASK-03 | Fix error and resubmit | Error area cleared; task added | P2 |
| TC-ADD-13 | TASK-15 | Reload after add | Task still listed | P2 |

### 10.3 Status, counter, edit

| ID | Requirement | Scenario | Expected | P |
|---|---|---|---|---|
| TC-STAT-01 | TASK-12, 13 | Check an active task | Struck through; items left -1 | P1 |
| TC-STAT-02 | TASK-12, 13 | Uncheck a completed task | Normal text; items left +1 | P1 |
| TC-STAT-03 | TASK-14 | One unchecked task left | "1 item left" | P2 |
| TC-EDIT-01 | TASK-16 | Click Edit | Row shows inputs prefilled, Save and Cancel | P1 |
| TC-EDIT-02 | TASK-17 | Change title and Save | Row shows new title | P1 |
| TC-EDIT-03 | TASK-17, 20 | Change priority Low to High and Save | Badge shows High | P1 |
| TC-EDIT-04 | TASK-17 | Change due date and Save | New date shown | P1 |
| TC-EDIT-05 | TASK-18 | Change fields then Cancel | Original values kept | P1 |
| TC-EDIT-06 | TASK-19 | Clear title and Save | Title-required error; row stays in edit | P1 |
| TC-EDIT-07 | TASK-19 | Past date and Save | Past-date error | P1 |
| TC-EDIT-08 | TASK-21 | Edit row A, then Edit row B | Only B in edit mode | P2 |
| TC-EDIT-09 | TASK-17 | Edit a completed task | Stays completed after Save | P2 |

### 10.4 Delete and clear

| ID | Requirement | Scenario | Expected | P |
|---|---|---|---|---|
| TC-DEL-01 | TASK-22 | Delete a task | Row removed, no dialog | P1 |
| TC-DEL-02 | TASK-23 | Delete an unchecked task | Items left -1 | P1 |
| TC-DEL-03 | TASK-23 | Delete a checked task | Items left unchanged | P1 |
| TC-DEL-04 | TASK-24 | Clear completed with 1 or more checked | Only unchecked remain | P1 |
| TC-DEL-05 | TASK-25 | No checked tasks | Clear completed disabled | P2 |
| TC-DEL-06 | TASK-26, 27 | Delete all tasks | "No tasks to show."; "0 items left" | P1 |

### 10.5 Search and filter

| ID | Requirement | Scenario | Expected | P |
|---|---|---|---|---|
| TC-FILT-01 | FILT-01 | Search "review" | Only "Review pull request" | P1 |
| TC-FILT-02 | FILT-01 | Search "REVIEW" | Same result (case-insensitive) | P1 |
| TC-FILT-03 | FILT-01 | Search partial "read" | "Update README" | P2 |
| TC-FILT-04 | TASK-26 | Search with no match | "No tasks to show." | P1 |
| TC-FILT-05 | FILT-06 | Clear the search | All rows return | P2 |
| TC-FILT-06 | FILT-03 | Open Tasks | All selected, `aria-pressed="true"` | P1 |
| TC-FILT-07 | FILT-04 | Click Active | Unchecked tasks only | P1 |
| TC-FILT-08 | FILT-04 | Click Completed | Checked tasks only | P1 |
| TC-FILT-09 | FILT-05 | Completed + search that matches only an active task | Empty state | P1 |
| TC-FILT-10 | FILT-07 | Switch filters | Items left unchanged | P2 |
| TC-FILT-11 | FILT-08 | Check a task while on Active | Row leaves the view | P2 |
| TC-FILT-12 | TASK-26 | Completed filter with no completed tasks | Empty state | P1 |

### 10.6 Profile

| ID | Requirement | Scenario | Expected | P |
|---|---|---|---|---|
| TC-PROF-01 | PROF-01 | Open Profile | Prefilled values; phone hint visible | P1 |
| TC-PROF-02 | PROF-02 | Change name, Save | "Profile saved." | P1 |
| TC-PROF-03 | PROF-02 | Save, then reload | New values persist | P1 |
| TC-PROF-04 | PROF-03 | Clear name, Save | Name error; no success | P1 |
| TC-PROF-05 | PROF-04 | Email `user@test` | Email error | P1 |
| TC-PROF-06 | PROF-04 | Email without `@` | Email error | P2 |
| TC-PROF-07 | PROF-05 | Phone `12ab` | Phone error | P1 |
| TC-PROF-08 | PROF-05 | Phone `123456` (6 digits) | Phone error | P1 |
| TC-PROF-09 | PROF-06 | Phone `1234567` (7 digits) | Saved | P1 |
| TC-PROF-10 | PROF-07 | Empty phone | Saved | P2 |
| TC-PROF-11 | PROF-08 | All three fields invalid | Three errors; nothing saved | P1 |
| TC-PROF-12 | PROF-09 | Edit a field after success | Success banner gone | P2 |
| TC-PROF-13 | NAV-01 | Switch Tasks and Profile | Correct page; `aria-current` follows | P1 |

---

## 11. Traceability matrix

| Original module | Requirement IDs | Test case prefixes |
|---|---|---|
| 1. Authentication | AUTH-01 to AUTH-11 | TC-AUTH |
| 2. Dashboard (counter only) | TASK-13, TASK-14, TASK-27 | TC-STAT, TC-DEL |
| 3. Task Management | TASK-01 to TASK-27 | TC-ADD, TC-STAT, TC-EDIT, TC-DEL |
| 4. Search and Filters | FILT-01 to FILT-08 | TC-FILT |
| 5. User Profile | PROF-01 to PROF-10, NAV-01, NAV-02 | TC-PROF |

---

## 12. Assumptions and open questions

Every item marked **[Assumed]** above needs a decision before tests are finalised.

| # | Question | Current assumption |
|---|---|---|
| OQ-1 | Where does data persist (localStorage, backend)? | `localStorage` |
| OQ-2 | Where does a new task appear (top or bottom)? | Bottom |
| OQ-3 | Is due date required on Add? | Optional |
| OQ-4 | Where are errors shown when saving an inline edit? | Not designed; needs a design (for example, an error line inside the row, `data-testid="edit-error"`) |
| OQ-5 | Exact error text for a past due date | "Due date must be today or later." |
| OQ-6 | Exact Profile error texts; is phone optional? | As in section 6; phone optional |
| OQ-7 | Does "N items left" count all tasks or only visible ones? | All tasks |
| OQ-8 | Singular wording for one item | "1 item left" |
| OQ-9 | Is email on Profile editable, and does it change the login email? | Editable; does not change the login email |
| OQ-10 | Where does the app land after login and after logout? | Tasks and Login |
| OQ-11 | The application under test is not built yet. Who builds it, and in what stack? | Out of scope for this document; the selector contract in section 7 is the interface |

---

## Appendix A. Canvas reference

Artifact: "TaskFlow App Design", page "TaskFlow Test Spec". Test ids and rules are also noted on sticky notes beside each screen. Earlier pages (Modules 1 to 5, at 1440 px) are reference only and are not part of the automated scope.
