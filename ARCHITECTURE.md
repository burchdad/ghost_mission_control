# Ghost Mission Control - Complete Architecture

## System Overview

Ghost Mission Control is a fully autonomous multi-agent orchestration system that manages web operations, SEO, content, funnels, social, and marketing automations. The system has evolved through 5 layers of sophistication, each building on the previous.

## Layer 1: Execution Engine (Commit `9666f1c`)

**Purpose**: Core runtime that dispatches commands, manages agent lifecycle, and tracks execution state.

**Components**:
- `stepExecution()` - 1300ms loop managing action lifecycle (pending → running → failed/retrying → completed)
- `agentIntelligence` Map - Per-agent profiles tracking:
  - `confidence` (starts 82, evolves +1.4 for success, -2.6 for failure)
  - `trend` (Up/Down/Steady)
  - Success/fail/retry counts
  - Site-specific completion bonus
- `executionRuns` Map - Active runs with TTL of 1 hour
- `commandHistory` array - Last 25 commands with rationale

**API Endpoints**:
- `POST /mission/command` - Accept command, return plan + rationale
- `GET /mission/execution/:id` - Poll run status and history
- `GET /mission/commands` - Recent command memory

---

## Layer 2: Agent Collaboration (Commit `a823c38`)

**Purpose**: Enable agents to hand off work to each other based on static rules.

**Components**:
- `collabGraph` - 12 pre-defined handoff rules mapping action → recipient agent
- `triggerCollaboration()` - Fired on action completion, creates collaboration message
- `collaborations` array on execution run - Stores all inter-agent handoffs

**Example Handoffs**:
- `identify_seo_breakpoints` → SEO Optimizer → Analytics Agent
- `patch_schema_and_metadata` → SEO Optimizer → Content Scraper Agent
- `monitor_rank_recovery` → Analytics Agent → Lead Router Agent

**UI Panel**: "Agent Collaboration" shows inter-agent messages with handoff reason.

---

## Layer 3: Dynamic Collaboration Decisions (Commit `b6b185a`)

**Purpose**: Replace static rules with intelligent decision logic analyzing runtime state.

**Components**:
- `getCollaborationDecisions()` - Analyzes 5 conditions:
  1. **Sender Confidence** - If <70%, escalate to Supervisor (not primary routing)
  2. **Recipient Confidence** - If <60%, reroute via Analytics Agent for investigation
  3. **Primary Routing** - Standard handoff if both agents confident
  4. **High-Confidence Secondary Chains** - If sender ≥85% AND first-attempt success, trigger chain
  5. **Cascade Failure Detection** - If 2+ failures, escalate + route to Analytics

**Collaboration Reasoning**: Each handoff carries `reason` and `decision` type explaining why that path was chosen.

**Autonomy Impact**: System now adapts routing based on agent performance, not just static rules.

---

## Layer 4: Multi-Step Execution Chains (Commit `5077b3a`)

**Purpose**: Automatically orchestrate related actions into multi-step pipelines.

**Components**:
- `chainTemplates` - 4 pre-defined chains:
  1. `identify_seo_breakpoints` → Analytics → Content Scraper → Social Publisher
  2. `patch_schema_and_metadata` → Analytics → Funnel Monitor
  3. `launch_cta_experiment` → Analytics → Lead Router
  4. `expand_campaign_reach` → Analytics → Funnel Monitor

- `createChainCollaborations()` - Detects high-confidence actions and generates pending chain steps
- Each chain step has `chainId`, `sequence` number, and `label` (e.g., "Step 2: Content Support")

**UI Panel**: Collaborations now show chain badges with sequence numbers.

**Autonomy Impact**: System orchestrates 2-3 step workflows without user intervention.

---

## Layer 5: Predictive Intelligence (Commit `b0f7e35`) ← NEW

**Purpose**: Predict risks 24+ hours ahead and surface suggested actions.

**Components**:
- `predictiveSignals` array - Max 100 signals (FIFO cleanup)
- `analyzePredictiveSignals(siteId)` - Detects 4 risk types:
  1. **Confidence Decline**: Agent `trend="Down"` + `confidence<75%` → **failure risk**
     - Signal: "SEO Optimizer Agent trending down with 72% confidence. Risk of continued failures on recovery tasks."
  2. **Failure Patterns**: `failedActions ≥3` + `trend!="Up"` → **cascade risk**
     - Signal: "3 failures in 11 dispatches. Pattern indicates systematic issue."
  3. **Retry Dependency**: `retries ≥2` + `successCount<3` → **fragility**
     - Signal: "Agent relies on retries. Only 1 clean success in last 5 attempts."
  4. **Chain Fragility**: `failedRuns ≥2` in last 10 → **coordination breakdown**
     - Signal: "2 failed chain runs detected. Multi-step orchestration may be unreliable."

- `getOrCreatePredictiveSignals(siteId)` - Lazy evaluator with deduplication
- Each signal carries:
  - `type` (confidence_decline, failure_pattern, retry_dependency, chain_fragility)
  - `severity` (critical/warning)
  - `message` (human-readable explanation)
  - `predictedOutcome` (what will likely happen if not addressed)
  - `confidence` score (80-95%)
  - `suggestedAction` (add_fallback, escalate, review_config, etc.)

**API Endpoint**:
- `GET /mission/predict?siteId=` - Returns array of predictive signals

**Frontend**:
- `loadPredictiveSignals(siteId)` - Fetches signals from API (called every 1800ms)
- `renderPredictiveAlerts(signals)` - Renders cards sorted by severity (critical first)
- CSS styling with severity badges (red for critical, yellow for warning)

**UI Panel**: "Predictive Intelligence" shows:
- Signal type tag
- Severity badge with color
- Message explaining the risk
- Predicted outcome
- Suggested action
- Confidence percentage

**Autonomy Impact**: System acts BEFORE problems happen, not just reacting to failures.

---

## Complete Architecture Stack

```
┌─────────────────────────────────────────────────────┐
│         PREDICTIVE INTELLIGENCE (Layer 5)           │
│   Forward-looking risk signals with suggestions     │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│     MULTI-STEP CHAINS (Layer 4)                     │
│   2-3 step workflows with coordination              │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  DYNAMIC COLLABORATION (Layer 3)                    │
│   Intelligent routing based on agent state          │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│   AGENT COLLABORATION (Layer 2)                     │
│    Static rules enabling inter-agent handoffs       │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│      EXECUTION ENGINE (Layer 1)                     │
│   Core runtime, agent profiles, confidence          │
└─────────────────────────────────────────────────────┘
```

---

## Key Design Principles

1. **Confidence-Driven Dispatch**: Agents with ≥90% confidence handle tasks alone (primary). 76-89% get monitoring (monitored). <76% get fallback routing.

2. **Failure-Aware Adaptation**: Confidence changes dynamically:
   - +1.4 per success (with per-site bonus)
   - -2.6 per failure
   - Trend tracks direction (Up/Down/Steady)

3. **Autonomous Decision Making**: 
   - Collaboration decisions made automatically based on runtime conditions
   - No human in the loop during execution
   - Escalation to Supervisor only when confidence insufficient

4. **Predictive Prevention**: 
   - System identifies risks before they cascade
   - Suggests corrective actions (add fallback, escalate, review config)
   - Surfaces confidence score so humans can prioritize

5. **In-Memory State**: 
   - Executions TTL'd at 1 hour
   - Command history max 25 entries
   - Predictive signals max 100 (FIFO cleanup)
   - Agent intelligence persists per process lifetime

---

## Running the System

```bash
# Start the server
npm start

# Server runs on http://localhost:4173 (with fallback to 4174-4180)

# Dispatch a command
curl -X POST http://localhost:4173/mission/command \
  -H "Content-Type: application/json" \
  -d '{"command":"recover seo rankings","siteId":"ghost-ai-solutions"}'

# Poll execution status
curl http://localhost:4173/mission/execution/{run_id}

# Check predictive signals
curl 'http://localhost:4173/mission/predict?siteId=ghost-ai-solutions'

# List agents ranked by confidence
curl 'http://localhost:4173/mission/agents?siteId=ghost-ai-solutions'
```

---

## Frontend Features

- **Live Polling**: Updates every 1800ms
- **Site Selection**: Switch between monitored sites
- **Mission Timeline**: Live action progression
- **Execution Details**: Dispatch mode, attempts, supervision level
- **Collaboration Feed**: Inter-agent handoffs with reasoning
- **Agent Snapshot**: Ranked by confidence with trend indicators
- **Predictive Alerts**: Forward-looking risk signals
- **Cross-System Intelligence**: System-wide insights

---

## Evolution Path

This system was built incrementally:

1. **MVP** (Layer 1) - Can execute commands with agent lifecycle management
2. **Collaboration** (Layer 2) - Agents can hand off work to each other
3. **Intelligence** (Layer 3) - Handoffs decided dynamically based on state
4. **Orchestration** (Layer 4) - Multi-step workflows executed automatically
5. **Prediction** (Layer 5) - System predicts and prevents problems

Each layer maintains backward compatibility while adding new autonomy.

---

## Future Enhancements

- Persistence layer (database instead of in-memory)
- Webhooks for external system integration
- Real-time WebSocket updates (instead of polling)
- ML-based signal analysis
- SaaS deployment with multi-tenant support
- Audit logging for compliance
- API rate limiting and authentication

---

**Status**: All 5 layers complete, tested, and deployed. System is fully autonomous.
