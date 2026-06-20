# TaskFlow Mini — QA Automation Showcase Project

A small, complete project built to demonstrate end-to-end QA thinking for a
**Software Quality Analyst** interview: a real (deliberately imperfect)
application, a full automated test suite at two layers, professional test
documentation, and a CI pipeline that doesn't hide known defects.

> **Honesty note:** this app ships with 3 real, intentional bugs. Don't fix
> them before your interview — finding, documenting, and automating coverage
> for them is the entire point of this project. They're listed in section
> *"The 3 Bugs"* below so you can speak to them confidently.

---

## 1. What's in this folder

```
QA-Showcase-Project/
├── app/                          The application under test
│   ├── server.js                 Express API (3 intentional bugs live here)
│   ├── package.json
│   └── public/                   Frontend (HTML/CSS/JS)
├── tests/
│   ├── api/tasks.api.test.js     15 Jest + Supertest API tests
│   └── ui/tasks.ui.spec.js       5 Playwright UI tests
├── docs/
│   ├── Test_Plan.docx            Formal test plan (IEEE 829-inspired)
│   └── Test_Cases_Bugs_RTM.xlsx  20 test cases, 3 bug reports, RTM — 3 tabs
├── postman/
│   └── TaskFlow.postman_collection.json   Manual/exploratory test collection
├── .github/workflows/ci.yml      GitHub Actions pipeline (runs both suites)
├── playwright.config.js
└── package.json                  Test-runner dependencies (Jest, Supertest, Playwright)
```

---

## 2. Quick Start (do this tonight, takes ~5 minutes)

You'll need **Node.js 18+** installed. Check with `node -v`.

### Step 1 — Install dependencies (two installs: app, then test runner)
```bash
cd QA-Showcase-Project/app
npm install

cd ..
npm install
```

### Step 2 — Run the app
```bash
cd app
npm start
```
Open **http://localhost:3000** in your browser. You'll see the TaskFlow Mini
UI with 3 seeded tasks. Leave this running in one terminal tab.

### Step 3 — Run the API test suite (in a second terminal tab)
```bash
cd QA-Showcase-Project
npm run test:api
```
Expected result: **11 passing, 4 failing.** That's correct — the 4 failures
map directly to the 3 documented bugs (BUG-001 has two related test cases).
This is the single most important thing to show an interviewer: a test
suite that tells the truth about the build, instead of being quietly edited
to pass.

### Step 4 — Run the UI test suite (optional, needs a one-time browser install)
```bash
npx playwright install --with-deps chromium
npm run test:ui
```
Playwright will auto-launch the app itself for this run (see
`playwright.config.js` → `webServer`), so you don't need Step 2 running
separately for this step. Expect 4 passing, 1 failing (BUG-001 surfaced
again, this time from the UI layer — good talking point about defects being
catchable at multiple layers).

> If you're demoing on a machine without internet access for the Chromium
> download, that's fine — walk the interviewer through the test **code**
> in `tests/ui/tasks.ui.spec.js` instead; it reads clearly even unexecuted.

---

## 3. The 3 Bugs (know these cold)

| ID | Title | Severity | Priority | Where it's proven |
|---|---|---|---|---|
| **BUG-001** | Empty/whitespace task titles are silently accepted, on both the API and the UI | High | High | `tests/api/...` (2 tests) + `tests/ui/...` (1 test) |
| **BUG-002** | `DELETE` on a non-existent task id returns `200 OK` instead of `404` | Low | Low | `tests/api/...` |
| **BUG-003** | The `?priority=` filter on `GET /api/tasks` is parsed but never applied — every task is returned regardless | Medium | Medium | `tests/api/...` |

Full reproduction steps, expected vs. actual results, and severity/priority
justification for each are in **`docs/Test_Cases_Bugs_RTM.xlsx`** → *Bug
Reports* tab. The *RTM* tab shows how each bug traces back to a specific
requirement and test case — that traceability is worth pointing to directly,
it's something a lot of candidates skip.

---

## 4. Deploying it live (optional, but a nice "look, it's live" moment)

If you want a live link to drop in chat or open during the interview instead
of running locally:

**Render.com (free tier, ~3 minutes):**
1. Push this folder to a new GitHub repo.
2. On Render: New → Web Service → connect the repo.
3. Root directory: `app`
4. Build command: `npm install`
5. Start command: `npm start`
6. Deploy. Render gives you a public URL once the build finishes.

**Railway.app** and **Vercel** (with a serverless adapter) work similarly if
you prefer those — the app has no database and no environment variables
required, which keeps deployment friction close to zero.

> Don't deploy the bugs as "fixed" — deploy it as-is. The live bugs are a
> feature of this demo, not an embarrassment.

---

## 5. How to talk about this project in the interview

A strong way to walk an interviewer through this in under 3 minutes:

1. **Frame it (15 sec):** "I built a small task-management app specifically
   to show my QA process end-to-end — not just a checklist, but how I'd
   actually approach a sprint: requirements → test design → automation →
   defect tracking → CI."
2. **Show the app (20 sec):** Open the live UI or localhost, add a task,
   complete it, delete it. Then add a *blank* task — point out it shouldn't
   work, and that it does. "That's BUG-001, and I have it traced through
   manual test cases, automated coverage, and a formal bug report."
3. **Show the failing test run (30 sec):** Run `npm run test:api` live.
   "11 pass, 4 fail — and the 4 failures aren't flaky tests, they're 3 real
   defects I found, documented, and wrote regression coverage for so they
   can never silently regress further."
4. **Show the documentation (30 sec):** Open `Test_Cases_Bugs_RTM.xlsx` —
   point at the RTM tab specifically. "Every requirement maps to at least
   one test case, and every open bug traces back to the requirement it
   violates. That traceability is what I'd bring into a real sprint."
5. **Show CI (15 sec):** Open `.github/workflows/ci.yml`. "Both suites run
   on every push automatically, so a regression gets caught before it ever
   reaches a PR review."
6. **Close with judgment, not just tooling (15 sec):** "The interesting
   decision here was severity vs. priority — BUG-001 is High/High because
   bad data corrupts the dataset silently, but BUG-002 is Low/Low because
   it's a wrong status code with zero functional impact. I didn't just find
   bugs, I triaged them like I'd have to on a real team."

If asked "why didn't you just fix them?" — be ready with: *"I wanted you to
see the actual artifacts of the QA process — a failing CI run, a bug report,
a traceability matrix — rather than a clean repo where you have to take my
word for it that I tested anything."* That answer alone tends to land well
with senior interviewers, because it shows you understand QA is about
**visibility and evidence**, not just "did it work."

---

## 6. If you have a little extra time before the interview

Pick **one** of these, don't try all of them:
- Fix BUG-002 (the easiest one) live during the interview if asked to
  demonstrate dev collaboration — it's a 2-line change in `server.js`.
- Add one more Playwright test for a flow not yet covered (e.g. editing a
  task's priority via the UI, if you add that control).
- Open the GitHub repo settings and actually let the Actions workflow run
  once on a push, so you can show a real (not just local) CI history.

Good luck. You've got real, runnable evidence of how you think — that's a
stronger position than almost anyone else walking into that interview will
have.
