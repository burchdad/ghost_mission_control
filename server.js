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
const commandHistory = [];
const agentIntelligence = new Map();
const predictiveSignals = [];
const MAX_COMMAND_HISTORY = 25;
const EXECUTION_TTL_MS = 60 * 60 * 1000;

const collabGraph = {
  patch_schema_and_metadata: {
    to: "Content Scraper Agent",
    message: "Schema patches applied. Generate supporting content for the recovered keyword cluster."
  },
  generate_new_content_batch: {
    to: "Social Publisher Agent",
    message: "Content batch ready. Distribute across authority channels for maximum reach."
  },
  run_dropoff_diagnostics: {
    to: "Funnel Monitor Agent",
    message: "Drop-off analysis complete. Apply uplift recommendations to the weakest conversion step."
  },
  expand_campaign_reach: {
    to: "Social Publisher Agent",
    message: "Campaign expansion active. Align social content with new audience targeting signals."
  },
  launch_cta_experiment: {
    to: "Lead Router Agent",
    message: "CTA experiment is live. Pre-stage lead routing for incoming conversion events."
  },
  route_followup_automation: {
    to: "Funnel Monitor Agent",
    message: "Follow-up sequences dispatched. Monitor lead progression through the next funnel stage."
  },
  boost_top_campaign: {
    to: "Analytics Agent",
    message: "Budget shift executed. Track conversion lift across the priority audience cohort."
  },
  trigger_social_distribution: {
    to: "Analytics Agent",
    message: "Distribution activated. Monitor engagement and click-through quality signals."
  },
  monitor_rank_recovery: {
    to: "SEO Optimizer Agent",
    message: "Rank monitoring running. Flag any page that fails to recover within the 48-hour window."
  },
  stage_rollout_validation: {
    to: "Automation Supervisor",
    message: "Validation window active. Confirm baseline metrics before full deployment."
  },
  identify_seo_breakpoints: {
    to: "Analytics Agent",
    message: "SEO breakpoints identified. Begin ranking trend analysis for flagged pages."
  },
  guardrail_cost_efficiency: {
    to: "Campaign Orchestrator",
    message: "Efficiency guardrails set. Reallocate suppressed spend to top-performing segments."
  }
};

const chainTemplates = {
  identify_seo_breakpoints: [
    {
      agent: "Analytics Agent",
      message: "SEO breakpoints identified. Analyze keyword ranking trends and priority pages.",
      sequence: 1,
      label: "Trend Analysis"
    },
    {
      agent: "Content Scraper Agent",
      message: "Ranking analysis complete. Generate recovery content for top-priority keywords.",
      sequence: 2,
      label: "Content Generation"
    },
    {
      agent: "Social Publisher Agent",
      message: "Recovery content ready. Distribute to authority channels to reinforce ranking signals.",
      sequence: 3,
      label: "Distribution"
    }
  ],
  patch_schema_and_metadata: [
    {
      agent: "Analytics Agent",
      message: "Schema patches applied. Validate impact on crawlability and indexation signals.",
      sequence: 1,
      label: "Validation"
    },
    {
      agent: "Funnel Monitor Agent",
      message: "Validation complete. Monitor funnel entry impact from recovered pages.",
      sequence: 2,
      label: "Funnel Monitoring"
    }
  ],
  launch_cta_experiment: [
    {
      agent: "Analytics Agent",
      message: "CTA experiment active. Monitor conversion rate and statistical significance.",
      sequence: 1,
      label: "Statistical Monitoring"
    },
    {
      agent: "Lead Router Agent",
      message: "Conversion data collected. Route winning variations to high-intent segments.",
      sequence: 2,
      label: "Lead Routing"
    }
  ],
  expand_campaign_reach: [
    {
      agent: "Analytics Agent",
      message: "Campaign reach expanded. Monitor cost per lead and audience quality.",
      sequence: 1,
      label: "Quality Monitoring"
    },
    {
      agent: "Funnel Monitor Agent",
      message: "Quality confirmed. Optimize funnel for expanded traffic volume.",
      sequence: 2,
      label: "Funnel Optimization"
    }
  ]
};

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

function getDecisionRationale(category) {
  const reasons = {
    lead: [
      "Lead-flow command detected with conversion intent keywords.",
      "Funnel and campaign modules are most directly tied to near-term pipeline output.",
      "Follow-up latency controls are included to protect lead quality conversion."
    ],
    seo: [
      "SEO recovery command matched ranking and metadata risk patterns.",
      "Technical repair actions prioritized before new content expansion.",
      "Recovery monitoring is required to validate reindex effectiveness."
    ],
    funnel: [
      "Conversion drop-off command indicates mid-funnel friction.",
      "Experiment-first path selected to avoid broad unvalidated changes.",
      "Diagnostics and uplift validation are chained for fast learning loops."
    ],
    traffic: [
      "Scale command maps to acquisition and distribution systems.",
      "Traffic expansion uses quality guardrails to protect efficiency.",
      "Channel reweighting included to reduce low-intent spend leakage."
    ],
    agent: [
      "Deployment command maps to build queue and automation supervisor layer.",
      "Observability is required before release to avoid blind automation.",
      "Staged rollout chosen to reduce operational risk."
    ],
    general: [
      "Command did not strongly match a single domain.",
      "Dependency mapping executed before action dispatch.",
      "Priority policy applied to avoid unsafe escalation."
    ]
  };

  return reasons[category] || reasons.general;
}

function pushCommandHistory(entry) {
  commandHistory.unshift(entry);
  if (commandHistory.length > MAX_COMMAND_HISTORY) {
    commandHistory.length = MAX_COMMAND_HISTORY;
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function ensureAgentProfile(agentName) {
  const existing = agentIntelligence.get(agentName);
  if (existing) {
    return existing;
  }

  const created = {
    name: agentName,
    confidence: 82,
    trend: "Steady",
    successfulActions: 0,
    failedActions: 0,
    retriedActions: 0,
    dispatches: 0,
    lastDecision: "Awaiting command dispatch.",
    lastOutcome: "No outcomes recorded.",
    updatedAt: new Date().toISOString(),
    siteCompletions: {}
  };

  agentIntelligence.set(agentName, created);
  return created;
}

function setTrend(profile, previousConfidence) {
  const delta = profile.confidence - previousConfidence;
  if (delta > 0.2) {
    profile.trend = "Up";
    return;
  }

  if (delta < -0.2) {
    profile.trend = "Down";
    return;
  }

  profile.trend = "Steady";
}

function adjustConfidence(profile, delta) {
  const previous = profile.confidence;
  profile.confidence = clamp(Math.round((profile.confidence + delta) * 10) / 10, 45, 99);
  setTrend(profile, previous);
}

function recordAgentEvent(action, eventType, run) {
  const profile = ensureAgentProfile(action.agent);
  const now = new Date().toISOString();

  if (eventType === "running") {
    profile.dispatches += 1;
    profile.lastDecision = `${action.action} started on ${action.target}.`;
  }

  if (eventType === "failed") {
    profile.failedActions += 1;
    adjustConfidence(profile, -2.6);
    profile.lastOutcome = `${action.action} hit a transient failure.`;
  }

  if (eventType === "retrying") {
    profile.retriedActions += 1;
    profile.lastDecision = `Retrying ${action.action} after transient failure.`;
  }

  if (eventType === "completed") {
    profile.successfulActions += 1;
    adjustConfidence(profile, action.attempts > 1 ? 0.8 : 1.4);
    profile.lastOutcome = `${action.action} completed successfully.`;
    profile.siteCompletions[run.siteId] = (profile.siteCompletions[run.siteId] || 0) + 1;
  }

  profile.updatedAt = now;
}

function createChainCollaborations(action, actionProfile, now) {
  const chain = chainTemplates[action.action];
  if (!chain || chain.length === 0) {
    return [];
  }

  const chainId = `chain_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
  return chain.map((step) => ({
    from: step.sequence === 1 ? action.agent : chain[step.sequence - 2]?.agent || action.agent,
    to: step.agent,
    triggerAction: action.action,
    message: step.message,
    reason: "Multi-step chain routing",
    decision: `chained_step_${step.sequence}`,
    chainId,
    sequence: step.sequence,
    label: step.label,
    timestamp: now,
    status: "pending"
  }));
}

function getCollaborationDecisions(action, run) {
  const decisions = [];
  const now = new Date().toISOString();

  const actionProfile = ensureAgentProfile(action.agent);
  const staticCollab = collabGraph[action.action];

  const failureCount = run.actions.filter((a) => a.status === "failed" || a.status === "retrying").length;
  const isHighConfidence = actionProfile.confidence >= 85;
  const isLowConfidence = actionProfile.confidence < 70;

  if (action.status === "completed") {
    if (staticCollab) {
      const recipientProfile = ensureAgentProfile(staticCollab.to);

      if (isLowConfidence) {
        decisions.push({
          from: action.agent,
          to: "Automation Supervisor",
          triggerAction: action.action,
          message: `Action completed but sender confidence is ${Math.round(
            actionProfile.confidence
          )}%. Review before downstream routing: ${staticCollab.message.slice(0, 60)}`,
          reason: "Low confidence escalation",
          decision: "routed_to_supervisor",
          timestamp: now,
          status: "delivered"
        });
      } else if (recipientProfile.confidence < 60) {
        decisions.push({
          from: action.agent,
          to: "Analytics Agent",
          triggerAction: action.action,
          message: `Primary recipient (${staticCollab.to}) has low confidence. Routing to Analytics for validation: ${staticCollab.message.slice(
            0,
            60
          )}`,
          reason: "Recipient low confidence",
          decision: "rerouted_via_analytics",
          timestamp: now,
          status: "delivered"
        });
      } else {
        decisions.push({
          from: action.agent,
          to: staticCollab.to,
          triggerAction: action.action,
          message: staticCollab.message,
          reason: "Standard handoff",
          decision: "primary_routing",
          timestamp: now,
          status: "delivered"
        });

        if (isHighConfidence && action.attempts === 1) {
          const chainCollabs = createChainCollaborations(action, actionProfile, now);
          if (chainCollabs.length > 0) {
            decisions.push(...chainCollabs);
          } else {
            const followUp = getFollowUpCollab(action);
            if (followUp) {
              decisions.push({
                from: action.agent,
                to: followUp.agent,
                triggerAction: action.action,
                message: followUp.message,
                reason: "High-confidence secondary chain",
                decision: "chained_secondary",
                timestamp: now,
                status: "queued"
              });
            }
          }
        }
      }
    }
  } else if (action.status === "failed" || action.status === "retrying") {
    if (failureCount > 1) {
      decisions.push({
        from: action.agent,
        to: "Automation Supervisor",
        triggerAction: action.action,
        message: `Multiple action failures detected (${failureCount} failures). Action "${action.action}" may need circuit-breaking or fallback delegation.`,
        reason: "Cascade failure detected",
        decision: "escalated_supervisor",
        timestamp: now,
        status: "delivered"
      });
    }

    decisions.push({
      from: action.agent,
      to: "Analytics Agent",
      triggerAction: action.action,
      message: `Action "${action.action}" encountered ${action.status}. Investigate root cause and surface trend.`,
      reason: "Failure investigation",
      decision: "routed_to_analytics",
      timestamp: now,
      status: "delivered"
    });
  }

  decisions.forEach((decision) => {
    run.collaborations.push(decision);
    const toProfile = ensureAgentProfile(decision.to);
    toProfile.lastDecision = `Task from ${decision.from}: ${decision.message.slice(0, 60)}`;
    toProfile.updatedAt = now;
  });

  if (decisions.length > 0) {
    run.history.push(
      `${now}: [DYNAMICS] Collaboration decided: ${decisions.map((d) => `${d.decision}`).join(", ")}`
    );
  }

  return decisions;
}

function getFollowUpCollab(action) {
  const followUpMap = {
    patch_schema_and_metadata: {
      agent: "Funnel Monitor Agent",
      message: "Schema patches applied with high confidence. Validate impact on funnel entry page conversions."
    },
    launch_cta_experiment: {
      agent: "Analytics Agent",
      message: "CTA experiment deployed with high confidence. Monitor statistical significance threshold."
    },
    boost_top_campaign: {
      agent: "Analytics Agent",
      message: "Campaign boost executed with high confidence. Track ROI lift vs. historical baseline."
    },
    expand_campaign_reach: {
      agent: "Funnel Monitor Agent",
      message: "Campaign reach expansion completed with high confidence. Monitor funnel conversion stability."
    }
  };

  return followUpMap[action.action] || null;
}

function analyzePredictiveSignals(siteId) {
  const signals = [];
  const now = new Date().toISOString();

  for (const [agentName, profile] of agentIntelligence.entries()) {
    const siteSpecific = profile.siteCompletions[siteId] || 0;
    if (siteSpecific === 0) {
      continue;
    }

    if (profile.trend === "Down" && profile.confidence < 75) {
      const failureRate = profile.failedActions / Math.max(profile.successfulActions + profile.failedActions, 1);
      signals.push({
        id: `signal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: "confidence_decline",
        severity: failureRate > 0.3 ? "critical" : "warning",
        agent: agentName,
        message: `${agentName} confidence declining (${Math.round(profile.confidence)}%) with ${Math.round(failureRate * 100)}% failure rate.`,
        predictedOutcome: "Task failure risk increasing. Consider delegation or supervision.",
        confidence: 85,
        suggestedAction: failureRate > 0.3 ? "escalate_supervisor" : "add_monitoring",
        timestamp: now,
        siteId
      });
    }

    if (profile.failedActions >= 3 && profile.trend !== "Up") {
      const recentFailureRatio = profile.failedActions / Math.max(profile.dispatches, 1);
      signals.push({
        id: `signal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: "failure_pattern",
        severity: recentFailureRatio > 0.4 ? "critical" : "warning",
        agent: agentName,
        message: `${agentName} showing failure pattern: ${profile.failedActions} failures / ${profile.dispatches} dispatches.`,
        predictedOutcome: "High probability of continued failures on similar tasks.",
        confidence: 80,
        suggestedAction: recentFailureRatio > 0.4 ? "circuit_break" : "add_fallback",
        timestamp: now,
        siteId
      });
    }

    if (profile.retriedActions >= 2 && profile.successfulActions < 3) {
      signals.push({
        id: `signal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: "retry_dependent",
        severity: "warning",
        agent: agentName,
        message: `${agentName} heavily dependent on retries (${profile.retriedActions} retries, ${profile.successfulActions} clean successes).`,
        predictedOutcome: "System resilience may be fragile on this agent. Plan for fallback.",
        confidence: 75,
        suggestedAction: "prepare_fallback_chain",
        timestamp: now,
        siteId
      });
    }
  }

  const recentExecutions = [...executionRuns.values()].slice(-10);
  const failedChains = recentExecutions.filter((run) => run.status === "attention" || run.status === "failed").length;

  if (failedChains >= 2) {
    signals.push({
      id: `signal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: "chain_fragility",
      severity: "warning",
      agent: "System",
      message: `Recent executions showing ${failedChains} failures in last 10 runs. Coordination breakdowns detected.`,
      predictedOutcome: "Multi-agent chains may be cascading into failures. Review decision logic.",
      confidence: 78,
      suggestedAction: "review_collaboration_rules",
      timestamp: now,
      siteId
    });
  }

  return signals;
}

function getOrCreatePredictiveSignals(siteId) {
  const existing = predictiveSignals.filter((s) => s.siteId === siteId);
  if (existing.length > 0) {
    return existing;
  }

  const fresh = analyzePredictiveSignals(siteId);
  predictiveSignals.push(...fresh);

  if (predictiveSignals.length > 100) {
    predictiveSignals.splice(0, predictiveSignals.length - 100);
  }

  return fresh;
}

function getRankedAgents(siteId) {
  const ranked = [...agentIntelligence.values()]
    .map((profile) => ({
      name: profile.name,
      confidence: profile.confidence,
      trend: profile.trend,
      successfulActions: profile.successfulActions,
      failedActions: profile.failedActions,
      retriedActions: profile.retriedActions,
      dispatches: profile.dispatches,
      lastDecision: profile.lastDecision,
      lastOutcome: profile.lastOutcome,
      siteCompletions: profile.siteCompletions[siteId] || 0,
      updatedAt: profile.updatedAt
    }))
    .sort((a, b) => {
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }

      return b.successfulActions - a.successfulActions;
    });

  return ranked.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
}

function getFallbackAgent(agentName) {
  const fallbackMap = {
    "SEO Optimizer Agent": "Analytics Agent",
    "Lead Router Agent": "Automation Supervisor",
    "Social Publisher Agent": "Campaign Orchestrator",
    "Content Scraper Agent": "Analytics Agent",
    "Campaign Orchestrator": "Automation Supervisor",
    "Funnel Monitor Agent": "Analytics Agent"
  };

  return fallbackMap[agentName] || "Automation Supervisor";
}

function getDispatchWeight(agentName, siteId) {
  const profile = ensureAgentProfile(agentName);
  const siteCompletions = profile.siteCompletions[siteId] || 0;
  const siteBonus = Math.min(siteCompletions * 0.35, 4);
  const weightedConfidence = clamp(profile.confidence + siteBonus, 45, 99);

  if (weightedConfidence >= 90) {
    return {
      mode: "primary",
      supervision: "Autonomous",
      weightedConfidence,
      fallbackAgent: null
    };
  }

  if (weightedConfidence >= 76) {
    return {
      mode: "monitored",
      supervision: "Guarded Monitoring",
      weightedConfidence,
      fallbackAgent: getFallbackAgent(agentName)
    };
  }

  return {
    mode: "fallback",
    supervision: "Supervised Fallback",
    weightedConfidence,
    fallbackAgent: getFallbackAgent(agentName)
  };
}

function buildDispatchActions(command, category, priority, siteId) {
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

  return selected.map((entry, index) => {
    const weight = getDispatchWeight(entry.agent, siteId);
    const routedAgent = weight.mode === "fallback" ? weight.fallbackAgent : entry.agent;

    return {
      id: `a${index + 1}`,
      priority: normalizedPriority,
      status: "pending",
      attempts: 0,
      lastUpdate: new Date().toISOString(),
      ...entry,
      agent: routedAgent,
      plannedAgent: entry.agent,
      dispatchMode: weight.mode,
      supervision: weight.supervision,
      weightedConfidence: weight.weightedConfidence,
      fallbackAgent: weight.fallbackAgent,
      detail: `${entry.detail} Dispatch: ${weight.mode} (${Math.round(weight.weightedConfidence)}% confidence).`
    };
  });
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
    recordAgentEvent(current, "running", run);
    run.history.push(`${now}: ${current.action} started (attempt ${current.attempts}).`);
    updateRunStatus(run);
    updateCommandHistoryFromRun(run);
    run.updatedAt = now;
    return;
  }

  if (current.status === "running") {
    if (shouldRetry(current, run.command) && current.attempts === 1 && !current.retrySimulated) {
      current.status = "failed";
      current.retrySimulated = true;
      current.lastUpdate = now;
      recordAgentEvent(current, "failed", run);
      run.history.push(`${now}: ${current.action} failed transiently. Preparing retry.`);
      updateRunStatus(run);
      updateCommandHistoryFromRun(run);
      run.updatedAt = now;
      return;
    }

    current.status = "completed";
    current.lastUpdate = now;
    recordAgentEvent(current, "completed", run);
    getCollaborationDecisions(current, run);
    run.history.push(`${now}: ${current.action} completed.`);
    updateRunStatus(run);
    updateCommandHistoryFromRun(run);
    run.updatedAt = now;
    return;
  }

  if (current.status === "failed") {
    current.status = "retrying";
    current.lastUpdate = now;
    recordAgentEvent(current, "retrying", run);
    getCollaborationDecisions(current, run);
    run.history.push(`${now}: ${current.action} retrying.`);
    updateRunStatus(run);
    updateCommandHistoryFromRun(run);
    run.updatedAt = now;
    return;
  }

  if (current.status === "retrying") {
    current.status = "running";
    current.attempts += 1;
    current.lastUpdate = now;
    run.history.push(`${now}: ${current.action} resumed (attempt ${current.attempts}).`);
    updateRunStatus(run);
    updateCommandHistoryFromRun(run);
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
  const historyEntry = {
    id: `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    command,
    siteId,
    category: plan.category || "general",
    priority: plan.priority,
    summary: plan.summary,
    createdAt: new Date().toISOString(),
    status: "queued",
    impact: "Execution in progress"
  };

  pushCommandHistory(historyEntry);

  const run = {
    id: createRunId(),
    command,
    siteId,
    status: "queued",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    actions: buildDispatchActions(command, plan.category || "general", plan.priority, siteId),
    history: [],
    collaborations: [],
    historyEntryId: historyEntry.id
  };

  run.actions.forEach((action) => {
    ensureAgentProfile(action.agent);
    if (action.plannedAgent && action.plannedAgent !== action.agent) {
      ensureAgentProfile(action.plannedAgent);
      run.history.push(
        `${new Date().toISOString()}: ${action.action} delegated from ${action.plannedAgent} to ${action.agent} due to confidence weighting.`
      );
    }
  });

  executionRuns.set(run.id, run);
  startExecutionLoop(run);
  return run;
}

function updateCommandHistoryFromRun(run) {
  const entry = commandHistory.find((item) => item.id === run.historyEntryId);
  if (!entry) {
    return;
  }

  entry.status = run.status;
  if (run.status === "completed") {
    entry.impact = "Execution completed with dispatched actions resolved.";
  } else if (run.status === "attention") {
    entry.impact = "Execution required retry handling before progression.";
  } else if (run.status === "running") {
    entry.impact = "Execution actively dispatching action chain.";
  }
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
        const rationale = getDecisionRationale(plan.category || "general");

        sendJson(response, 200, {
          command,
          siteId,
          receivedAt: new Date().toISOString(),
          ...plan,
          rationale,
          execution: {
            id: execution.id,
            status: execution.status,
            actions: execution.actions,
            createdAt: execution.createdAt,
            updatedAt: execution.updatedAt,
            completedAt: execution.completedAt
          },
          memory: commandHistory.slice(0, 6)
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
      history: run.history.slice(-10),
      collaborations: run.collaborations,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
      completedAt: run.completedAt
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/commands") {
    sendJson(response, 200, {
      commands: commandHistory.slice(0, 12)
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/agents") {
    const siteId = url.searchParams.get("siteId") || "unknown-site";
    sendJson(response, 200, {
      agents: getRankedAgents(siteId)
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/predict") {
    const siteId = url.searchParams.get("siteId") || "unknown-site";
    const signals = getOrCreatePredictiveSignals(siteId);
    sendJson(response, 200, {
      siteId,
      signals,
      generatedAt: new Date().toISOString(),
      signalCount: signals.length
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
