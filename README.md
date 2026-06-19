# Ghost Mission Control

Ghost Mission Control is a dark-themed operations dashboard for managing the backend systems that power websites and digital growth workflows.

This MVP provides one control center for:

- content scraping
- lead funnels
- SEO operations
- social posting
- marketing campaigns
- AI agents and automations
- alerts and activity timelines
- future build queue planning

## One-Sentence Definition

Ghost Mission Control is the command center that monitors, manages, and scales the backend systems powering websites, content, SEO, funnels, marketing, posting, and AI automations.

## What Is Included In This Repo

- [index.html](index.html): App shell and dashboard layout
- [styles.css](styles.css): Mission-control visual system and responsive styling
- [app.js](app.js): Live API-driven UI rendering logic
- [server.js](server.js): Local Node server for static hosting, mission command API routing, and monitored page checks

## MVP Features Implemented

- Executive KPI header cards
- Mission Status Strip with health signals
- Website or Brand selector with per-site profiles
- Operations Board module cards for:
	- Content Scraping Command
	- Lead Funnel Command
	- SEO Command
	- Social Posting Command
	- Marketing Command
	- AI Agents and Automations Command
- Failures and Alerts panel
- Mission Timeline activity feed
- Agent snapshot panel
- Build Queue with phased columns
- Mission Command backend endpoint at `/mission/command`
- Command Action Plan panel driven by live API responses

## Run Locally

No build step is required.

The default startup path now uses the local Node server so the Mission Command API works.

Fastest option:

```bash
npm start
```

Then open `http://localhost:4173`.

## Deploy Backend On Railway

This app runs as a persistent Node service and is a good fit for Railway.

1. Push this repo to GitHub.
2. In Railway, create a new project from the GitHub repo.
3. Railway will detect Node automatically and use `npm start`.
4. Set environment variables:
	- `PORT` is set automatically by Railway.
	- Optional: `ALLOWED_ORIGINS` for frontend domains (comma-separated).
5. After deploy, confirm health:

```bash
curl https://<your-railway-domain>/health
```

If your frontend is hosted separately (for example on Vercel), set:

```bash
ALLOWED_ORIGINS=https://<your-frontend-domain>
```

Then point frontend API calls to your Railway backend domain.

### Railway Postgres Client Store

Mission Control persists editable client cards to Postgres when `DATABASE_URL` is available. On the first `/mission/clients` read or write, the backend creates or updates the `mission_clients` table automatically and seeds it from the current repo/local client store if the table is empty.

Client services are stored as JSON arrays:

- `services`: active/currently included services
- `planned_services`: wanted or queued services that are not implemented yet

Recommended backend variables:

```bash
DATABASE_URL=<railway-postgres-url>
CLIENT_STORE_POSTGRES_ENABLED=true
DATABASE_SSL=auto
```

If your Postgres provider requires SSL, set `DATABASE_SSL=true`. If Postgres is unavailable, Mission Control keeps the local runtime cache and falls back to the GitHub client store when configured.

## Deploy Frontend On Vercel (Static)

This repo now includes a static Vercel build path so Vercel does not try to run the Node backend.

1. In Vercel project settings, set:

```bash
GHOST_API_BASE_URL=https://<your-railway-domain>
```

2. Keep Railway `ALLOWED_ORIGINS` aligned with your Vercel domain:

```bash
ALLOWED_ORIGINS=https://ghost-mission-control-three.vercel.app
```

3. Redeploy Vercel and Railway.

The Vercel build runs `npm run build:vercel`, outputs static files into `dist`, and injects `GHOST_API_BASE_URL` into `index.html`.

If your terminal session may terminate foreground processes, use background mode:

```bash
npm run start:bg
```

Useful lifecycle commands:

```bash
npm run status:bg
npm run stop:bg
```

If you specifically need port 8080:

```bash
npm run start:8080
```

Open the dashboard directly:

1. Open [index.html](index.html) in a browser.

Or run the server on port 8080:

```bash
npm run start:8080
```

Then open `http://localhost:8080`.

## Live Monitoring Configuration

Mission Control now loads websites/pages from backend environment configuration (no in-frontend seeded site mock data).

Set one of these on the backend host (Railway recommended):

1. `MONITORED_SITES` (JSON array, recommended)
2. `MONITORED_SITE_URLS` (comma-separated URLs, quick start)

Example:

```bash
MONITORED_SITES=[{"id":"ghost-ai-solutions","name":"Ghost AI Solutions","domain":"ghostai.solutions","rootUrl":"https://ghostai.solutions","autoDiscoverPages":true,"pages":[{"label":"Homepage","url":"https://ghostai.solutions/"}]}]
```

When `autoDiscoverPages` is enabled, Mission Control automatically ingests page URLs from:

- `https://<site>/sitemap.xml`
- `robots.txt` sitemap entries
- nested sitemap indexes (depth-limited)

This is the recommended path for Vercel-hosted properties so you do not have to list every page manually.

### Auto-Import All Vercel Projects

If your properties are hosted on Vercel, Mission Control can auto-import project production URLs from your Vercel account and include them in monitoring automatically.

Set on backend (Railway):

```bash
VERCEL_AUTO_IMPORT_PROJECTS=true
VERCEL_TOKEN=<your-vercel-api-token>
VERCEL_TEAM_ID=<optional-team-id>
VERCEL_SYNC_CACHE_TTL_MS=300000
VERCEL_MAX_PROJECTS=100
```

Notes:

- `VERCEL_TOKEN` is required for API access.
- `VERCEL_TEAM_ID` is optional and only needed for team-scoped projects.
- Vercel-imported sites are merged with `MONITORED_SITES` and deduplicated by domain/root URL.
- Use `GET /mission/snapshot?refresh=true` to force an immediate re-sync.

Optional tuning:

```bash
PAGE_TIMEOUT_MS=8000
MONITOR_CACHE_TTL_MS=60000
AUTO_DISCOVER_PAGES=true
DISCOVERY_CACHE_TTL_MS=300000
MAX_DISCOVERED_PAGES=250
DISCOVERY_MAX_DEPTH=2
```

New live monitoring endpoints:

```bash
GET /mission/sites
GET /mission/snapshot
```

## Client Admin Dashboard Web Helper Requests

Client admin dashboards can send website update or upgrade requests into Mission Control so the correct Web Helper agent can triage the work.

Recommended Mission Control backend variables:

```bash
GHOST_WEB_HELPER_WEBHOOK_SECRET=<shared-secret>
GHOST_WEB_HELPER_ALLOWED_SOURCES=client_admin_dashboard
GHOST_WEB_HELPER_DEFAULT_BRANCH_POLICY=testing_branch_only
GHOST_WEB_HELPER_DEFAULT_APPROVAL_REQUIRED=true
WEB_HELPER_AUTOMATION_START_DELAY_MS=8000
WEB_HELPER_TRIAGE_TO_CODEX_DELAY_MS=8000
```

Recommended variables on each client website/admin dashboard:

```bash
GHOST_MISSION_CONTROL_WEBHOOK_URL=https://<railway-domain>/mission/web-helper-requests
GHOST_MISSION_CONTROL_WEBHOOK_SECRET=<same-shared-secret>
GHOST_CLIENT_ID=<mission-control-client-id>
GHOST_CLIENT_NAME="Gray Matters Technology Services"
GHOST_SITE_URL=https://www.graymatterstech.com
GHOST_REPO=burchdad/barbara_consulting
GHOST_WEB_HELPER_ID=<mission-control-client-id>-web-helper
GHOST_WEB_HELPER_BRANCH_POLICY=testing_branch_only
GHOST_WEB_HELPER_APPROVAL_REQUIRED=true
```

The client dashboard should include enough identity for Mission Control to match the request by client, site, or repo:

```json
{
  "client": "Gray Matters Technology Services",
  "site": "www.graymatterstech.com",
  "repo": "burchdad/barbara_consulting",
  "source": "client_admin_dashboard",
  "request_type": "layout_change",
  "page_url": "/services",
  "summary": "...",
  "details": "...",
  "priority": "normal",
  "attachments": [],
  "branch_policy": "testing_branch_only",
  "approval_required": true
}
```

Send requests to `POST /mission/web-helper-requests` with the shared secret in `X-Ghost-Webhook-Secret`. Mission Control matches by client, site, or repo, stores the request, and shows it in the matching Web Helper queue. The intake endpoint acknowledges the saved ticket immediately, then starts automation after `WEB_HELPER_AUTOMATION_START_DELAY_MS`. After triage, it waits `WEB_HELPER_TRIAGE_TO_CODEX_DELAY_MS` before creating the Codex build task so the board visibly moves through New Intake -> Needs Triage -> Codex Building.

## Web Helper Codex Build Handoff

Mission Control creates Codex build tasks from Web Helper tickets and relays them to a runner intake webhook.

For the built-in Mission Control runner intake shim, set:

```bash
CODEX_BUILD_WEBHOOK_URL=https://<railway-domain>/mission/codex-runner/intake
CODEX_BUILD_WEBHOOK_SECRET=<shared-secret>
GHOST_MISSION_CONTROL_PUBLIC_URL=https://<railway-domain>
CODEX_WORKER_COMMAND=<codex-or-wrapper-command>
CODEX_WORKER_ARGS=["exec","--dangerously-bypass-approvals-and-sandbox"]
CODEX_WORKER_VERIFICATION_MODE=external
CODEX_EXTERNAL_VERIFICATION_POLL_INTERVAL_MS=30000
CODEX_EXTERNAL_VERIFICATION_MAX_ATTEMPTS=20
```

The intake webhook accepts `POST /mission/codex-runner/intake` with `X-Codex-Build-Secret`, marks the linked ticket as active, and returns the callback URL the runner should use after building. A dedicated external Codex runner can use the same payload contract and report results to `POST /mission/codex-build-tasks/result`.

The built-in runner intake creates the configured testing branch in the target GitHub repo and commits a structured work-order file under `.ghost/web-helper-requests/`. This makes every ticket branch visible in GitHub immediately and gives the downstream Codex/build worker a durable prompt and audit trail.

Mission Control also exposes `POST /mission/codex-runner/work` for the next worker layer. The worker clones the target branch, writes a prompt file, runs `CODEX_WORKER_COMMAND` with `CODEX_WORKER_ARGS`, commits and pushes any source changes, then reports back to `/mission/codex-build-tasks/result`. Codex receives the ticket prompt as the `codex exec` positional prompt argument; the legacy `["exec","--prompt-file","{PROMPT_PATH}"]` form is auto-normalized for the Codex CLI. Railway does not allow Codex's nested bubblewrap sandbox, so the Docker worker should use `--dangerously-bypass-approvals-and-sandbox` inside the already-isolated Railway container. Use `{PROMPT_PATH}`, `{REPO_DIR}`, `{TICKET_ID}`, `{TASK_ID}`, and `{BRANCH}` placeholders inside custom `CODEX_WORKER_ARGS`. Set `CODEX_WORKER_AUTORUN=true` only when the deployed environment can safely run the configured worker command during intake. Set `GITHUB_TOKEN` with contents write access to the client repos.

By default, `CODEX_WORKER_VERIFICATION_MODE=external` keeps heavy verification out of Railway. In this mode the worker pushes the testing branch, stores the commit SHA, and leaves the ticket in active build while GitHub/Vercel checks run. Mission Control automatically watches the commit checks at `CODEX_EXTERNAL_VERIFICATION_POLL_INTERVAL_MS` until `CODEX_EXTERNAL_VERIFICATION_MAX_ATTEMPTS`; passing checks move the ticket to owner review, failing checks block the ticket, and pending checks keep it in progress. You can also manually poll `POST /mission/codex-build-tasks/checks` with `X-Codex-Build-Secret` and `{ "ticketId": "...", "taskId": "..." }`. Use `local` only for lightweight repos where the Railway worker can safely run `CODEX_BUILD_DEFAULT_TEST_COMMAND`; use `none` only for temporary manual testing.

When `CODEX_WORKER_COMMAND=codex`, the worker performs a non-interactive `codex login --with-api-key` using `OPENAI_API_KEY` before running `codex exec`.

## Client Update Email Delivery

Mission Control can email clients after a Web Helper update is merged and ready for review. Resend is the preferred direct sender; the older `CLIENT_UPDATE_EMAIL_WEBHOOK_URL` remains available as a fallback for a separate email agent.

Recommended Resend variables:

```bash
RESEND_API_KEY=<resend-api-key>
RESEND_FROM_EMAIL="Ghost AI Solutions <updates@your-verified-domain.com>"
RESEND_REPLY_TO_EMAIL=support@your-domain.com
```

For early testing before a sending domain is verified, Resend allows `Ghost Mission Control <onboarding@resend.dev>` as the from address. Production client emails should use a verified domain.

## AI Provider Integration (OpenAI + Anthropic + OpenRouter)

Mission Command now supports optional AI copilot guidance from OpenAI, Anthropic, and OpenRouter with automatic fallback.

Set any provider keys on the backend:

```bash
AI_PROVIDER=auto
OPENAI_API_KEY=<your-openai-key>
OPENAI_MODEL=gpt-4.1-mini
ANTHROPIC_API_KEY=<your-anthropic-key>
ANTHROPIC_MODEL=claude-3-5-haiku-latest
OPENROUTER_API_KEY=<your-openrouter-key>
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_HTTP_REFERER=https://your-frontend-domain.vercel.app
OPENROUTER_APP_NAME=Ghost Mission Control
AI_REQUEST_TIMEOUT_MS=12000
```

When enabled, `/mission/command` responses include `aiCopilot` guidance and enrich rationale/auto-actions.

Provider status endpoint:

```bash
GET /mission/ai/status
```

## Mission Command API

The dashboard now supports backend command routing.

Example request:

```bash
curl -X POST http://localhost:4173/mission/command \
	-H "Content-Type: application/json" \
	-d '{"command":"increase lead flow","siteId":"ghost-ai-solutions"}'
```

The API returns a structured command plan with:

- summary
- priority
- objective
- owners
- systemActions
- autoActions
- expectedImpact

It also returns an `execution` object with a live run id and per-action status.

Check a run:

```bash
curl http://localhost:4173/mission/execution/<run-id>
```

Execution statuses include:

- queued
- running
- retrying
- attention
- completed

Agent learning and confidence evolution endpoint:

```bash
curl "http://localhost:4173/mission/agents?siteId=ghost-ai-solutions"
```

Returned agent intelligence includes rank, confidence, trend, action outcomes, and site-specific completion counts.

## Confidence-Weighted Dispatch

Execution dispatch is now confidence-aware:

- `primary`: high-confidence autonomous routing
- `monitored`: guarded routing with fallback prepared
- `fallback`: low-confidence supervised delegation to fallback agent

Each execution action now includes dispatch metadata (`dispatchMode`, `supervision`, `plannedAgent`, `weightedConfidence`, and `fallbackAgent`) for risk-aware tracing.

## Data Model Direction (Next Step)

The current UI now consumes live backend snapshot data. For deeper production persistence, map telemetry and command history to relational entities such as:

- Websites
- Agents
- Automations
- Funnels
- Content Jobs
- SEO Tasks
- Social Posts
- Campaigns
- Alerts
- Build Queue
- Integrations
- Performance Logs

Recommended relationship examples:

- Website has many Funnels
- Website has many SEO Tasks
- Website has many Social Posts
- Agent owns many Automations
- Automation can generate Alerts
- Content Jobs can generate Social Posts

## Priority Labels

Use consistent labels across cards and tasks:

- P1 Critical
- P2 High Value
- P3 Important
- P4 Nice to Improve
- P5 Future Idea

## Phase Plan

### Phase 1: MVP (Current)

- visual command center with modular panels
- seeded operational data by website
- status and priority visibility

### Phase 2: Live Integrations

- webhook health ingestion
- scraper logs ingestion
- posting queue sync
- CRM lead counts
- SEO issue synchronization
- notifications and escalation rules

### Phase 3: Autonomous Operations

- AI recommendations
- anomaly detection
- auto-prioritization
- self-healing retries
- predictive alerts and agent handoffs

## Recommended Build Order

1. Executive Overview
2. Website Selector
3. Automations and Agents
4. Content Scraping
5. Social Posting
6. Lead Funnels
7. SEO Command
8. Build Queue
9. Alerts and Logs
