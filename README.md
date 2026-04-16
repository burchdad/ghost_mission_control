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