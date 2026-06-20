# TaskFlow Mini

A lightweight task management app with a full automated test suite covering both the API and UI layers, professional QA documentation, and a CI pipeline.

**Live demo:** [https://task-mini-app-aayush.onrender.com/](https://task-mini-app-aayush.onrender.com/)

> Hosted on Render's free tier — the instance sleeps after periods of inactivity, so the first load after a while may take 30–50 seconds to spin back up.

---

## Overview

TaskFlow Mini is a simple to-do list application — add tasks, mark them complete, delete them, filter by priority. The project pairs the app itself with a complete QA process around it: a formal test plan, written test cases, a requirements traceability matrix, automated tests at two layers (API and UI), and a CI pipeline that runs on every push.

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** HTML, CSS, vanilla JavaScript
- **API Testing:** Jest + Supertest
- **UI Testing:** Playwright
- **CI/CD:** GitHub Actions
- **Hosting:** Render

## Project Structure

```
QA-Showcase-Project/
├── app/                          The application
│   ├── server.js                 Express API
│   ├── package.json
│   └── public/                   Frontend (HTML/CSS/JS)
├── tests/
│   ├── api/tasks.api.test.js     Jest + Supertest API tests
│   └── ui/tasks.ui.spec.js       Playwright UI tests
├── docs/
│   ├── Test_Plan.docx            Formal test plan (IEEE 829-inspired)
│   └── Test_Cases_Bugs_RTM.xlsx  Test cases, bug reports, and RTM
├── postman/
│   └── TaskFlow.postman_collection.json   Manual/exploratory test collection
├── .github/workflows/ci.yml      GitHub Actions pipeline
├── playwright.config.js
└── package.json                  Test-runner dependencies
```

## Features

- Create, complete, and delete tasks
- Assign a priority (low / medium / high) to each task
- Filter the task list by priority
- Stateless reset endpoint for clean test runs (`POST /api/reset`)

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | List all tasks, optionally filtered by `?priority=` |
| `GET` | `/api/tasks/:id` | Get a single task |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update a task's title or priority |
| `PATCH` | `/api/tasks/:id/complete` | Mark a task complete |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `POST` | `/api/reset` | Reset to the seeded task list (used by tests) |

## Getting Started

You'll need **Node.js 18+** installed. Check with `node -v`.

### 1. Install dependencies

```bash
cd QA-Showcase-Project/app
npm install

cd ..
npm install
```

### 2. Run the app

```bash
cd app
npm start
```

Open **http://localhost:3000** — you'll see the app with 3 seeded tasks.

### 3. Run the API tests

```bash
cd QA-Showcase-Project
npm run test:api
```

Result: **11 passing, 4 failing.** The failures map directly to 3 known issues documented below — they're regression tests proving the bugs exist, not flaky tests.

### 4. Run the UI tests

```bash
npx playwright install --with-deps chromium
npm run test:ui
```

Playwright auto-launches the app via `webServer` in `playwright.config.js`, so no need to start it manually first. Result: **4 passing, 1 failing** (the same defect surfacing again from the UI layer).

## Known Issues

| ID | Issue | Severity | Priority |
|---|---|---|---|
| **BUG-001** | Empty/whitespace task titles are silently accepted instead of rejected, on both the API and the UI | High | High |
| **BUG-002** | `DELETE` on a non-existent task id returns `200 OK` instead of `404` | Low | Low |
| **BUG-003** | The `?priority=` filter on `GET /api/tasks` is parsed but never applied — every task is returned regardless | Medium | Medium |

Full reproduction steps, expected vs. actual behavior, and severity/priority justification for each are documented in `docs/Test_Cases_Bugs_RTM.xlsx` (*Bug Reports* tab). The *RTM* tab traces each bug back to the specific requirement and test case it violates.

These are left unfixed intentionally — the regression suite in `tests/` exists specifically to keep them visible rather than silently patched.

## Testing & QA Documentation

- **`docs/Test_Plan.docx`** — formal test plan covering scope, approach, and risk
- **`docs/Test_Cases_Bugs_RTM.xlsx`** — 20 written test cases, 3 bug reports, and a requirements traceability matrix (3 tabs)
- **`postman/TaskFlow.postman_collection.json`** — manual/exploratory testing collection for the API

## CI/CD

`.github/workflows/ci.yml` runs both the API and UI test suites on every push and pull request to `main`, with results uploaded as build artifacts so failures stay visible.

## Deployment

Deployed on Render (free tier):

| Setting | Value |
|---|---|
| Root directory | `app` |
| Build command | `npm install` |
| Start command | `npm start` |

Note: data is stored in memory only (no database), so it resets on every server restart or redeploy back to the 3 seeded tasks.

## License

MIT