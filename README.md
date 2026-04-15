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
- [app.js](app.js): Seeded operational data and UI rendering logic
- [server.js](server.js): Local Node server for static hosting and mission command API routing

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

The current UI uses seeded JavaScript objects in [app.js](app.js). For production, map the data to relational entities such as:

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