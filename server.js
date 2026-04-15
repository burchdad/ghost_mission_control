const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE_PORT = Number(process.env.PORT || 4173);
const MAX_PORT_ATTEMPTS = 10;
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(data));
}

function sendHead(response, statusCode, headers = {}) {
  response.writeHead(statusCode, headers);
  response.end();
}

const executionRuns = new Map();
const EXECUTION_TTL_MS = 60 * 60 * 1000;

function createRunId() {
  return `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizePriority(priority) {
  if (String(priority).startsWith("P1")) {
    return "high";
  }

  if (String(priority).startsWith("P2")) {
    return "medium";
  }

  return "normal";
}

function buildDispatchActions(command, category, priority) {
  const normalizedPriority = normalizePriority(priority);

  const templates = {
    lead: [
      {
        action: "run_funnel_optimization",
        target: "primary-acquisition-funnel",
        agent: "Funnel Monitor Agent",
        detail: "Analyze and patch top drop-off stage for lead velocity uplift."
      },
      {
        action: "boost_top_campaign",
        target: "highest-intent-audience",
        agent: "Campaign Orchestrator",
        detail: "Shift budget into the strongest converting traffic cohort."
      },
      {
        action: "generate_new_content_batch",
        target: "lead-magnet-topic-cluster",
        agent: "Content Scraper Agent",
        detail: "Produce conversion-aligned content briefs for near-term demand."
      },
      {
        action: "trigger_social_distribution",
        target: "linkedin-and-x-authority-stream",
        agent: "Social Publisher Agent",
        detail: "Distribute optimized content and track click-through response."
      }
    ],
    seo: [
      {
        action: "identify_seo_breakpoints",
        target: "declining-commercial-pages",
        agent: "SEO Optimizer Agent",
        detail: "Scan index and ranking drift on high-intent URLs."
      },
      {
        action: "patch_schema_and_metadata",
        target: "critical-page-cluster",
        agent: "SEO Optimizer Agent",
        detail: "Apply metadata and schema fixes from automated recommendations."
      },
      {
        action: "trigger_reindex_submission",
        target: "patched-page-list",
        agent: "SEO Optimizer Agent",
        detail: "Submit updated pages for re-crawl and indexing refresh."
      },
      {
        action: "monitor_rank_recovery",
        target: "keyword-recovery-watchlist",
        agent: "Analytics Agent",
        detail: "Track post-fix ranking and organic traffic recovery."
      }
    ],
    funnel: [
      {
        action: "run_dropoff_diagnostics",
        target: "step-level-conversion-map",
        agent: "Analytics Agent",
        detail: "Locate the highest loss point by source and device."
      },
      {
        action: "launch_cta_experiment",
        target: "weakest-conversion-step",
        agent: "Funnel Monitor Agent",
        detail: "Activate a prioritized experiment against current baseline."
      },
      {
        action: "route_followup_automation",
        target: "uncontacted-lead-batch",
        agent: "Lead Router Agent",
        detail: "Accelerate follow-up for at-risk leads."
      },
      {
        action: "evaluate_uplift_confidence",
        target: "experiment-observation-window",
        agent: "Analytics Agent",
        detail: "Estimate confidence and decide keep or rollback."
      }
    ],
    traffic: [
      {
        action: "expand_campaign_reach",
        target: "qualified-audience-pool",
        agent: "Campaign Orchestrator",
        detail: "Scale reach while preserving cost control."
      },
      {
        action: "sync_content_distribution",
        target: "top-performing-content-stream",
        agent: "Social Publisher Agent",
        detail: "Increase publishing cadence around winning themes."
      },
      {
        action: "refresh_intent_signals",
        target: "traffic-quality-model",
        agent: "Analytics Agent",
        detail: "Re-score channels for lead quality confidence."
      },
      {
        action: "guardrail_cost_efficiency",
        target: "underperforming-segments",
        agent: "Campaign Orchestrator",
        detail: "Throttle spend where ROI drops below target."
      }
    ],
    agent: [
      {
        action: "select_build_candidate",
        target: "build-queue-priority-1",
        agent: "Automation Supervisor",
        detail: "Pick the next high-impact automation candidate."
      },
      {
        action: "instantiate_agent_template",
        target: "new-agent-runtime",
        agent: "Automation Supervisor",
        detail: "Create role, triggers, and safety constraints."
      },
      {
        action: "attach_observability",
        target: "alerting-and-health-stream",
        agent: "Alerting Agent",
        detail: "Bind health checks, retries, and escalation hooks."
      },
      {
        action: "stage_rollout_validation",
        target: "controlled-release-window",
        agent: "Analytics Agent",
        detail: "Validate baseline before full deployment."
      }
    ],
    general: [
      {
        action: "classify_directive",
        target: "command-intelligence-layer",
        agent: "Automation Supervisor",
        detail: "Infer domain and execution dependencies from command text."
      },
      {
        action: "map_system_dependencies",
        target: "ops-module-graph",
        agent: "Analytics Agent",
        detail: "Build a dependency-aware action order."
      },
      {
        action: "create_execution_bundle",
        target: "coordinated-action-plan",
        agent: "Automation Supervisor",
        detail: "Package actions for dispatch and monitoring."
      },
      {
        action: "apply_priority_policy",
        target: "mission-priority-engine",
        agent: "Alerting Agent",
        detail: "Set escalation and confidence checks."
      }
    ]
  };

  const selected = templates[category] || templates.general;

  return selected.map((entry, index) => ({
    id: `a${index + 1}`,
    priority: normalizedPriority,
    status: "pending",
    attempts: 0,
    lastUpdate: new Date().toISOString(),
    ...entry
  }));
}

function shouldRetry(action, command) {
  const normalized = String(command || "").toLowerCase();
  if (action.action === "trigger_social_distribution" && normalized.includes("lead")) {
    return true;
  }

  if (action.action === "trigger_reindex_submission" && normalized.includes("seo")) {
    return true;
  }

  return false;
}

function updateRunStatus(run) {
  const allDone = run.actions.every((action) => action.status === "completed");
  const hasRetry = run.actions.some((action) => action.status === "retrying");
  const hasFailure = run.actions.some((action) => action.status === "failed");
  const hasRunning = run.actions.some((action) => action.status === "running");

  if (allDone) {
    run.status = "completed";
    run.completedAt = new Date().toISOString();
    return;
  }

  if (hasFailure || hasRetry) {
    run.status = "attention";
    return;
  }

  if (hasRunning) {
    run.status = "running";
    return;
  }

  run.status = "queued";
}

function stepExecution(run) {
  if (!run || run.status === "completed") {
    return;
  }

  const current = run.actions.find((action) => action.status === "running" || action.status === "failed" || action.status === "retrying")
    || run.actions.find((action) => action.status === "pending");

  if (!current) {
    updateRunStatus(run);
    return;
  }

  const now = new Date().toISOString();

  if (current.status === "pending") {
    current.status = "running";
    current.attempts += 1;
    current.lastUpdate = now;
    run.history.push(`${now}: ${current.action} started (attempt ${current.attempts}).`);
    updateRunStatus(run);
    run.updatedAt = now;
    return;
  }

  if (current.status === "running") {
    if (shouldRetry(current, run.command) && current.attempts === 1 && !current.retrySimulated) {
      current.status = "failed";
      current.retrySimulated = true;
      current.lastUpdate = now;
      run.history.push(`${now}: ${current.action} failed transiently. Preparing retry.`);
      updateRunStatus(run);
      run.updatedAt = now;
      return;
    }

    current.status = "completed";
    current.lastUpdate = now;
    run.history.push(`${now}: ${current.action} completed.`);
    updateRunStatus(run);
    run.updatedAt = now;
    return;
  }

  if (current.status === "failed") {
    current.status = "retrying";
    current.lastUpdate = now;
    run.history.push(`${now}: ${current.action} retrying.`);
    updateRunStatus(run);
    run.updatedAt = now;
    return;
  }

  if (current.status === "retrying") {
    current.status = "running";
    current.attempts += 1;
    current.lastUpdate = now;
    run.history.push(`${now}: ${current.action} resumed (attempt ${current.attempts}).`);
    updateRunStatus(run);
    run.updatedAt = now;
  }
}

function startExecutionLoop(run) {
  run.timer = setInterval(() => {
    stepExecution(run);

    if (run.status === "completed") {
      clearInterval(run.timer);
      run.timer = null;

      setTimeout(() => {
        executionRuns.delete(run.id);
      }, EXECUTION_TTL_MS).unref?.();
    }
  }, 1300);
}

function createExecutionRun(command, siteId, plan) {
  const run = {
    id: createRunId(),
    command,
    siteId,
    status: "queued",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    actions: buildDispatchActions(command, plan.category || "general", plan.priority),
    history: []
  };

  executionRuns.set(run.id, run);
  startExecutionLoop(run);
  return run;
}

function getCommandPlan(command, siteId) {
  const normalized = String(command || "").trim().toLowerCase();
  const siteLabel = siteId || "active-site";

  const plans = [
    {
      match: ["lead", "pipeline", "booking", "conversion"],
      payload: {
        category: "lead",
        summary: "Lead flow directive accepted. Funnel, campaign, and follow-up systems are being tuned together.",
        priority: "P1 Critical",
        objective: "Increase qualified lead flow within the next operating cycle.",
        owners: ["Funnel Monitor Agent", "Campaign Orchestrator", "Lead Router Agent"],
        systemActions: [
          "Audit step-level funnel drop-off for the primary acquisition path.",
          "Increase spend toward the highest intent traffic cohort.",
          "Tighten follow-up timing for uncontacted leads within 15 minutes.",
          "Escalate broken CRM routing if failure rate remains above baseline."
        ],
        autoActions: [
          "Activated CTA experiment on highest traffic funnel.",
          "Queued lead quality scoring refresh for " + siteLabel + "."
        ],
        expectedImpact: "Higher lead velocity, faster follow-up, and improved pipeline conversion quality."
      }
    },
    {
      match: ["seo", "rank", "metadata", "index"],
      payload: {
        category: "seo",
        summary: "SEO directive accepted. Recovery tasks and ranking stabilization actions are queued.",
        priority: "P1 Critical",
        objective: "Recover search visibility and protect top-intent pages.",
        owners: ["SEO Optimizer Agent", "Content Scraper Agent"],
        systemActions: [
          "Generate fix queue for critical metadata and schema gaps.",
          "Prioritize re-optimization of pages with ranking decline.",
          "Assign content support tasks for keywords with declining intent coverage.",
          "Prepare reindex submission list for patched URLs."
        ],
        autoActions: [
          "Created same-day technical SEO patch batch.",
          "Mapped content support requests to keyword recovery targets."
        ],
        expectedImpact: "Reduced ranking volatility and faster recovery for commercial pages."
      }
    },
    {
      match: ["drop-off", "funnel", "cta", "diagnose"],
      payload: {
        category: "funnel",
        summary: "Drop-off analysis directive accepted. Conversion diagnostics are running.",
        priority: "P2 High Value",
        objective: "Reduce abandonment at the biggest funnel loss point.",
        owners: ["Funnel Monitor Agent", "Analytics Agent"],
        systemActions: [
          "Locate the largest abandonment step by source and device.",
          "Compare CTA variants against historical baseline.",
          "Flag low-intent traffic sources for suppression.",
          "Recommend next test with strongest projected uplift."
        ],
        autoActions: [
          "Triggered variant test on weakest step.",
          "Queued session replay review summary."
        ],
        expectedImpact: "Clear next experiment and tighter conversion path performance."
      }
    },
    {
      match: ["traffic", "scale", "campaign", "reach"],
      payload: {
        category: "traffic",
        summary: "Traffic scale directive accepted. Distribution and paid acquisition systems are aligning.",
        priority: "P2 High Value",
        objective: "Expand qualified reach without degrading lead quality.",
        owners: ["Campaign Orchestrator", "Social Publisher Agent", "Marketing Command"],
        systemActions: [
          "Shift budget into best-performing campaigns.",
          "Increase social output around top-converting content themes.",
          "Match fresh scraped content to current audience demand.",
          "Monitor cost per lead and throttle weak segments."
        ],
        autoActions: [
          "Prepared content distribution boost plan.",
          "Queued campaign budget rebalance review."
        ],
        expectedImpact: "Broader top-of-funnel reach with controlled acquisition efficiency."
      }
    },
    {
      match: ["agent", "deploy", "build", "automation"],
      payload: {
        category: "agent",
        summary: "Agent deployment directive accepted. Automation template and dependency review started.",
        priority: "P2 High Value",
        objective: "Promote a new system from build queue into active operations.",
        owners: ["Automation Supervisor", "Alerting Agent"],
        systemActions: [
          "Select build queue candidate with highest operational leverage.",
          "Generate agent role definition and trigger map.",
          "Attach monitoring, alerting, and fallback escalation.",
          "Stage rollout plan before live activation."
        ],
        autoActions: [
          "Drafted deployment checklist for next agent candidate.",
          "Reserved monitoring hooks for rollout validation."
        ],
        expectedImpact: "Faster system expansion with less manual setup overhead."
      }
    }
  ];

  const matchedPlan = plans.find((plan) => plan.match.some((term) => normalized.includes(term)));

  if (matchedPlan) {
    return matchedPlan.payload;
  }

  return {
    category: "general",
    summary: "General directive accepted. Mission Control created an execution outline for operator review.",
    priority: "P3 Important",
    objective: "Translate the command into a coordinated multi-system action plan.",
    owners: ["Automation Supervisor"],
    systemActions: [
      "Classify the directive by growth, recovery, or build category.",
      "Map affected systems and dependencies.",
      "Generate priority-ranked next actions.",
      "Escalate only if autonomy confidence falls below threshold."
    ],
    autoActions: ["Created a review-ready action draft for the current site."],
    expectedImpact: "A structured next-action plan without manual triage overhead."
  };
}

function serveStatic(requestPath, response, headOnly = false) {
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const safePath = path.normalize(normalizedPath).replace(/^([.][.][/\\])+/, "");
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        sendJson(response, 404, { error: "Not Found" });
        return;
      }

      sendJson(response, 500, { error: "Unable to read requested file" });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const headers = {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream"
    };

    if (headOnly) {
      sendHead(response, 200, headers);
      return;
    }

    response.writeHead(200, headers);
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if ((request.method === "GET" || request.method === "HEAD") && url.pathname === "/health") {
    if (request.method === "HEAD") {
      sendHead(response, 200, {
        "Content-Type": "application/json; charset=utf-8"
      });
      return;
    }

    sendJson(response, 200, { ok: true, service: "ghost-mission-control" });
    return;
  }

  if (request.method === "POST" && url.pathname === "/mission/command") {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const command = parsed.command || "";
        const siteId = parsed.siteId || "unknown-site";

        if (!String(command).trim()) {
          sendJson(response, 400, { error: "Command is required" });
          return;
        }

        const plan = getCommandPlan(command, siteId);
        const execution = createExecutionRun(command, siteId, plan);

        sendJson(response, 200, {
          command,
          siteId,
          receivedAt: new Date().toISOString(),
          ...plan,
          execution: {
            id: execution.id,
            status: execution.status,
            actions: execution.actions,
            createdAt: execution.createdAt,
            updatedAt: execution.updatedAt,
            completedAt: execution.completedAt
          }
        });
      } catch {
        sendJson(response, 400, { error: "Invalid JSON payload" });
      }
    });

    return;
  }

  if (request.method === "GET" && url.pathname.startsWith("/mission/execution/")) {
    const executionId = decodeURIComponent(url.pathname.replace("/mission/execution/", ""));
    const run = executionRuns.get(executionId);

    if (!run) {
      sendJson(response, 404, { error: "Execution run not found" });
      return;
    }

    sendJson(response, 200, {
      id: run.id,
      command: run.command,
      siteId: run.siteId,
      status: run.status,
      actions: run.actions,
      history: run.history.slice(-8),
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
      completedAt: run.completedAt
    });
    return;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    serveStatic(url.pathname, response, request.method === "HEAD");
    return;
  }

  sendJson(response, 405, { error: "Method Not Allowed" });
});

function startServer(port, attemptsRemaining) {
  server.listen(port, () => {
    console.log(`Ghost Mission Control server running at http://localhost:${port}`);
  });

  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && attemptsRemaining > 0) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is already in use. Retrying on ${nextPort}...`);
      server.close(() => {
        startServer(nextPort, attemptsRemaining - 1);
      });
      return;
    }

    throw error;
  });
}

startServer(BASE_PORT, MAX_PORT_ATTEMPTS);
