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

const ALLOWED_ORIGINS = String(process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function getCorsOrigin(request) {
  const requestOrigin = request.headers.origin;
  if (!requestOrigin) {
    return "*";
  }

  if (ALLOWED_ORIGINS.length === 0) {
    return "*";
  }

  return ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : "";
}

function getDefaultHeaders(request, extra = {}) {
  const corsOrigin = getCorsOrigin(request);
  const headers = {
    "Access-Control-Allow-Methods": "GET,POST,HEAD,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    ...extra
  };

  if (corsOrigin) {
    headers["Access-Control-Allow-Origin"] = corsOrigin;
  }

  return headers;
}

function sendJson(request, response, statusCode, data) {
  response.writeHead(
    statusCode,
    getDefaultHeaders(request, {
      "Content-Type": "application/json; charset=utf-8"
    })
  );
  response.end(JSON.stringify(data));
}

function sendHead(request, response, statusCode, headers = {}) {
  response.writeHead(statusCode, getDefaultHeaders(request, headers));
  response.end();
}

const executionRuns = new Map();
const commandHistory = [];
const agentIntelligence = new Map();
const predictiveSignals = [];
const autonomousGoals = [];
const scenarioForecasts = [];
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

// ============================================================================
// LAYER 6: STRATEGIC REASONING
// ============================================================================
// System analyzes multiple competing goals and recommends priority allocation
// Factors: predicted risks, agent availability, resource constraints, goal urgency

function analyzeStrategicGoals(siteId) {
  // Collect current system state
  const signals = predictiveSignals.filter((s) => s.siteId === siteId);
  const agents = [...agentIntelligence.values()];
  
  // Define competing goals with metrics
  const goalMetrics = {
    seo_recovery: {
      urgency: 8,  // Out of 10
      estimatedDuration: 72, // hours
      resourcesRequired: ["SEO Optimizer Agent", "Analytics Agent", "Content Scraper Agent"],
      impactOnRevenue: "medium",  // leads → conversion → revenue
      riskIfIgnored: "ranking erosion accelerates",
      successProbability: 0.75
    },
    lead_funnel_optimization: {
      urgency: 9,  // Higher - immediate ROI
      estimatedDuration: 24, // hours
      resourcesRequired: ["Funnel Monitor Agent", "Analytics Agent", "Lead Router Agent"],
      impactOnRevenue: "high",  // direct leads
      riskIfIgnored: "conversion rate decline continues",
      successProbability: 0.85
    },
    content_expansion: {
      urgency: 6,
      estimatedDuration: 48, // hours
      resourcesRequired: ["Content Scraper Agent", "Social Publisher Agent"],
      impactOnRevenue: "low",  // indirect
      riskIfIgnored: "content gap widens",
      successProbability: 0.80
    },
    social_recovery: {
      urgency: 5,
      estimatedDuration: 12, // hours
      resourcesRequired: ["Social Publisher Agent"],
      impactOnRevenue: "low",  // brand awareness, not direct
      riskIfIgnored: "engagement declines gradually",
      successProbability: 0.90
    }
  };

  // Score each goal considering: urgency, agent availability, risk signals, ROI
  const scoredGoals = Object.entries(goalMetrics).map(([goalName, metrics]) => {
    // Agent availability score (how many required agents are highly confident)
    const availableAgents = metrics.resourcesRequired.filter((agentName) => {
      const profile = [...agentIntelligence.values()].find((a) => a.name === agentName);
      return profile && profile.confidence >= 80;
    });
    const agencyScore = (availableAgents.length / metrics.resourcesRequired.length) * 100;

    // Risk mitigation score (how many predictive signals relate to this goal)
    const relatedSignals = signals.filter((s) => {
      const signalText = s.message.toLowerCase();
      return signalText.includes(goalName.replace(/_/g, " ")) ||
             (goalName.includes("seo") && (signalText.includes("seo") || signalText.includes("ranking"))) ||
             (goalName.includes("funnel") && (signalText.includes("funnel") || signalText.includes("conversion"))) ||
             (goalName.includes("content") && (signalText.includes("content") || signalText.includes("scraper"))) ||
             (goalName.includes("social") && signalText.includes("social"));
    });
    const riskMitigationScore = relatedSignals.length * 15; // 15 points per signal

    // ROI score (revenue impact + probability)
    const revenueMultiplier = metrics.impactOnRevenue === "high" ? 1.5 : metrics.impactOnRevenue === "medium" ? 1.0 : 0.6;
    const roiScore = (metrics.successProbability * 100) * revenueMultiplier;

    // Time efficiency score (urgency vs duration - prefer quick wins)
    const efficiencyScore = (metrics.urgency * 10) / (metrics.estimatedDuration / 24);

    // Total score (weighted combination)
    const totalScore = 
      (agencyScore * 0.2) +
      (riskMitigationScore * 0.3) +
      (roiScore * 0.3) +
      (efficiencyScore * 0.2);

    return {
      goal: goalName,
      score: Math.round(totalScore),
      urgency: metrics.urgency,
      duration: metrics.estimatedDuration,
      resources: metrics.resourcesRequired,
      agencyScore: Math.round(agencyScore),
      riskMitigationScore: Math.round(Math.min(riskMitigationScore, 100)),
      roiScore: Math.round(roiScore),
      efficiencyScore: Math.round(efficiencyScore),
      successProbability: metrics.successProbability,
      riskIfIgnored: metrics.riskIfIgnored,
      nextSteps: generateNextSteps(goalName)
    };
  });

  // Sort by score (highest priority first)
  const sortedGoals = scoredGoals.sort((a, b) => b.score - a.score);

  // Create strategic recommendation
  const topGoal = sortedGoals[0];
  const secondaryGoals = sortedGoals.slice(1);

  return {
    primaryGoal: topGoal.goal,
    primaryReasoning: `Goal prioritized due to: ${topGoal.agencyScore}% agent availability, ${topGoal.riskMitigationScore}% risk coverage, ${topGoal.roiScore}% ROI potential`,
    primaryScore: topGoal.score,
    secondaryGoals: secondaryGoals.map((g) => ({ goal: g.goal, score: g.score })),
    allGoals: sortedGoals,
    recommendedAllocation: {
      primary: 50,  // 50% resources to top goal
      secondary: 30,  // 30% to second goal
      contingency: 20  // 20% for emergencies
    },
    rationale: generateStrategicRationale(sortedGoals, signals),
    generatedAt: new Date().toISOString(),
    siteId
  };
}

function generateNextSteps(goal) {
  const stepMap = {
    seo_recovery: [
      "1. Run SEO breakpoint analysis (2h)",
      "2. Apply critical schema patches (1h)",
      "3. Generate recovery content for top 10 keywords (4h)",
      "4. Monitor reindex signals (24h)",
      "5. Track ranking recovery trend (48h)"
    ],
    lead_funnel_optimization: [
      "1. Identify drop-off point in funnel (30m)",
      "2. A/B test CTA variant on step 2 (4h)",
      "3. Route high-intent leads through winning variant (1h)",
      "4. Monitor conversion lift (24h)"
    ],
    content_expansion: [
      "1. Identify content gaps by keyword cluster (1h)",
      "2. Scrape competitor content for reference (2h)",
      "3. Generate 5 target articles (8h)",
      "4. Publish and distribute to social channels (2h)"
    ],
    social_recovery: [
      "1. Audit posting schedule and engagement (1h)",
      "2. Re-auth social API tokens (30m)",
      "3. Resume posting on primary channels (ongoing)",
      "4. Monitor engagement recovery (24h)"
    ]
  };
  return stepMap[goal] || [];
}

function generateStrategicRationale(sortedGoals, signals) {
  const top = sortedGoals[0];
  const rationale = [];

  if (signals.length > 0) {
    rationale.push(`${signals.length} predictive risks detected. Prioritizing goals that mitigate most critical signals.`);
  }

  rationale.push(`"${top.goal}" chosen: ${top.urgency}/10 urgency, ${top.successProbability * 100}% success probability, ${top.riskIfIgnored}`);

  if (top.agencyScore < 70) {
    rationale.push(`⚠️  Only ${top.agencyScore}% agent availability for primary goal. May require escalation.`);
  }

  if (sortedGoals.length > 1) {
    const secondary = sortedGoals[1];
    rationale.push(`Secondary goal: "${secondary.goal}" (score: ${secondary.score}). Can execute in parallel if resources allow.`);
  }

  return rationale;
}

// ============================================================================
// LAYER 7: GOAL-BASED AUTONOMY + SCENARIO SIMULATION
// ============================================================================

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getSiteRecentRuns(siteId, limit = 12) {
  return [...executionRuns.values()]
    .filter((run) => run.siteId === siteId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

function analyzeAutonomousGoals(siteId) {
  const now = new Date().toISOString();
  const signals = getOrCreatePredictiveSignals(siteId);
  const recentRuns = getSiteRecentRuns(siteId, 12);
  const strategy = analyzeStrategicGoals(siteId);

  const criticalSignals = signals.filter((signal) => signal.severity === "critical").length;
  const warningSignals = signals.filter((signal) => signal.severity === "warning").length;
  const failedRuns = recentRuns.filter((run) => run.status === "failed" || run.status === "attention").length;
  const unstableRuns = recentRuns.filter((run) =>
    (run.actions || []).some((action) => action.status === "retrying" || toNumber(action.attempts) > 1)
  ).length;

  const siteCommands = commandHistory.filter((entry) => entry.siteId === siteId).slice(0, 10);
  const seoPressure = siteCommands.filter((entry) => entry.category === "seo").length;
  const funnelPressure = siteCommands.filter((entry) => entry.category === "funnel").length;
  const campaignPressure = siteCommands.filter((entry) => entry.category === "campaign").length;

  const generated = [];

  if (criticalSignals > 0 || failedRuns >= 2 || unstableRuns >= 3) {
    generated.push({
      id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: "stabilize_operations",
      priority: "P1",
      title: "Stabilize execution reliability",
      trigger: `${criticalSignals} critical signals, ${failedRuns} failed runs, ${unstableRuns} unstable runs detected.`,
      proposedCommand: "stabilize system reliability and fallback routing",
      expectedImpact: "Lower execution volatility and prevent cascading failures.",
      confidence: clamp(70 + criticalSignals * 6 + failedRuns * 4, 72, 95),
      horizonHours: 24,
      source: "autonomous_reasoner",
      siteId,
      createdAt: now
    });
  }

  if (funnelPressure <= 1 && strategy.primaryGoal !== "lead_funnel_optimization") {
    generated.push({
      id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: "improve_conversion_yield",
      priority: "P1",
      title: "Increase lead conversion throughput",
      trigger: "Funnel focus is underrepresented relative to system priorities.",
      proposedCommand: "optimize funnel conversion and reduce step two drop-off",
      expectedImpact: "Higher lead yield from existing traffic before acquisition expansion.",
      confidence: clamp(76 + warningSignals * 2, 74, 92),
      horizonHours: 36,
      source: "autonomous_reasoner",
      siteId,
      createdAt: now
    });
  }

  if (seoPressure >= 2 && campaignPressure <= 1) {
    generated.push({
      id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: "expand_demand_capture",
      priority: "P2",
      title: "Create demand-side offset while SEO recovers",
      trigger: "SEO load is high while campaign expansion remains low.",
      proposedCommand: "expand campaign reach with conversion-quality guardrails",
      expectedImpact: "Offsets organic volatility with paid and social demand capture.",
      confidence: clamp(68 + seoPressure * 3, 70, 90),
      horizonHours: 48,
      source: "autonomous_reasoner",
      siteId,
      createdAt: now
    });
  }

  if (generated.length === 0) {
    generated.push({
      id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: "compound_growth_experiment",
      priority: "P2",
      title: "Run compound growth experiment",
      trigger: "System health stable. No urgent corrective goals detected.",
      proposedCommand: "launch coordinated seo and funnel uplift experiment",
      expectedImpact: "Discovers next best growth lever under stable operations.",
      confidence: 78,
      horizonHours: 72,
      source: "autonomous_reasoner",
      siteId,
      createdAt: now
    });
  }

  return generated;
}

function getOrCreateAutonomousGoals(siteId) {
  const freshGoals = analyzeAutonomousGoals(siteId);
  for (const goal of freshGoals) {
    const duplicate = autonomousGoals.find(
      (existing) => existing.siteId === siteId && existing.type === goal.type
    );
    if (!duplicate) {
      autonomousGoals.push(goal);
    }
  }

  if (autonomousGoals.length > 80) {
    autonomousGoals.splice(0, autonomousGoals.length - 80);
  }

  return autonomousGoals
    .filter((goal) => goal.siteId === siteId)
    .sort((a, b) => {
      const weight = { P1: 1, P2: 2, P3: 3 };
      const delta = (weight[a.priority] || 4) - (weight[b.priority] || 4);
      if (delta !== 0) {
        return delta;
      }
      return toNumber(b.confidence) - toNumber(a.confidence);
    })
    .slice(0, 6);
}

function simulateScenarios(siteId) {
  const now = new Date().toISOString();
  const strategy = analyzeStrategicGoals(siteId);
  const goals = getOrCreateAutonomousGoals(siteId);
  const signals = getOrCreatePredictiveSignals(siteId);

  const criticalCount = signals.filter((signal) => signal.severity === "critical").length;
  const warningCount = signals.filter((signal) => signal.severity === "warning").length;
  const topGoal = strategy.allGoals[0];

  const scenarios = [
    {
      id: `scenario_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "SEO-First Recovery",
      focus: "seo_recovery",
      assumptions: "Prioritize SEO repairs and content reinforcement over funnel work for 48h.",
      projectedTrafficLiftPct: clamp(6 + topGoal.agencyScore * 0.08 - criticalCount * 2.2, 1, 18),
      projectedRevenueLiftPct: clamp(3 + topGoal.roiScore * 0.04 - warningCount * 0.6, 1, 15),
      riskScore: clamp(45 + criticalCount * 12, 20, 95),
      paybackDays: clamp(12 - topGoal.efficiencyScore * 0.08 + criticalCount * 0.7, 3, 21),
      confidence: clamp(68 + topGoal.successProbability * 22 - criticalCount * 5, 55, 91),
      rationale: "Best when organic ranking volatility is the primary failure source.",
      siteId,
      generatedAt: now
    },
    {
      id: `scenario_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "Funnel-First Monetization",
      focus: "lead_funnel_optimization",
      assumptions: "Shift resources to conversion uplift and routing quality before traffic expansion.",
      projectedTrafficLiftPct: clamp(2 + warningCount * 0.6, 0, 10),
      projectedRevenueLiftPct: clamp(8 + topGoal.roiScore * 0.05 - criticalCount * 1.4, 2, 22),
      riskScore: clamp(30 + warningCount * 6 + criticalCount * 4, 15, 85),
      paybackDays: clamp(8 - topGoal.efficiencyScore * 0.05 + criticalCount * 0.5, 2, 16),
      confidence: clamp(74 + topGoal.successProbability * 18 - criticalCount * 3, 60, 93),
      rationale: "Best when lead quality and conversion friction are the immediate growth bottlenecks.",
      siteId,
      generatedAt: now
    },
    {
      id: `scenario_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "Balanced Portfolio",
      focus: "balanced",
      assumptions: "Split resources across SEO, funnel, and campaign work to reduce single-channel risk.",
      projectedTrafficLiftPct: clamp(5 + warningCount * 0.4, 1, 14),
      projectedRevenueLiftPct: clamp(6 + topGoal.roiScore * 0.03, 2, 16),
      riskScore: clamp(24 + criticalCount * 5 + warningCount * 2, 12, 70),
      paybackDays: clamp(10 + criticalCount * 0.3, 4, 18),
      confidence: clamp(79 - criticalCount * 2 + goals.length, 62, 90),
      rationale: "Best for steady compounding when no single domain requires full concentration.",
      siteId,
      generatedAt: now
    },
    {
      id: `scenario_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "Reliability-First Guardrail",
      focus: "stability",
      assumptions: "Prioritize resilience fixes, fallback hardening, and failure containment before growth pushes.",
      projectedTrafficLiftPct: clamp(2 + goals.length * 0.4, 0, 8),
      projectedRevenueLiftPct: clamp(4 + goals.length * 0.8, 1, 12),
      riskScore: clamp(18 + warningCount * 1.5, 8, 55),
      paybackDays: clamp(11 - goals.length * 0.6, 3, 20),
      confidence: clamp(73 + goals.length * 2.2 - criticalCount * 2, 58, 92),
      rationale: "Best when protecting uptime and execution integrity has higher near-term value than expansion.",
      siteId,
      generatedAt: now
    }
  ]
    .map((scenario) => ({
      ...scenario,
      outcomeScore: Math.round(
        scenario.projectedRevenueLiftPct * 0.45 +
          scenario.projectedTrafficLiftPct * 0.25 +
          (100 - scenario.riskScore) * 0.2 +
          scenario.confidence * 0.1
      )
    }))
    .sort((a, b) => b.outcomeScore - a.outcomeScore);

  return {
    siteId,
    recommendedScenario: scenarios[0].name,
    scenarios,
    generatedAt: now
  };
}

function getOrCreateScenarioForecast(siteId) {
  const fresh = simulateScenarios(siteId);
  scenarioForecasts.push(fresh);

  if (scenarioForecasts.length > 50) {
    scenarioForecasts.splice(0, scenarioForecasts.length - 50);
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

function serveStatic(request, requestPath, response, headOnly = false) {
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const safePath = path.normalize(normalizedPath).replace(/^([.][.][/\\])+/, "");
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    sendJson(request, response, 403, { error: "Forbidden" });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        sendJson(request, response, 404, { error: "Not Found" });
        return;
      }

      sendJson(request, response, 500, { error: "Unable to read requested file" });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const headers = getDefaultHeaders(request, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream"
    });

    if (headOnly) {
      sendHead(request, response, 200, headers);
      return;
    }

    response.writeHead(200, headers);
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    sendHead(request, response, 204);
    return;
  }

  if ((request.method === "GET" || request.method === "HEAD") && url.pathname === "/health") {
    if (request.method === "HEAD") {
      sendHead(request, response, 200, {
        "Content-Type": "application/json; charset=utf-8"
      });
      return;
    }

    sendJson(request, response, 200, { ok: true, service: "ghost-mission-control" });
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
          sendJson(request, response, 400, { error: "Command is required" });
          return;
        }

        const plan = getCommandPlan(command, siteId);
        const execution = createExecutionRun(command, siteId, plan);
        const rationale = getDecisionRationale(plan.category || "general");

        sendJson(request, response, 200, {
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
        sendJson(request, response, 400, { error: "Invalid JSON payload" });
      }
    });

    return;
  }

  if (request.method === "GET" && url.pathname.startsWith("/mission/execution/")) {
    const executionId = decodeURIComponent(url.pathname.replace("/mission/execution/", ""));
    const run = executionRuns.get(executionId);

    if (!run) {
      sendJson(request, response, 404, { error: "Execution run not found" });
      return;
    }

    sendJson(request, response, 200, {
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
    sendJson(request, response, 200, {
      commands: commandHistory.slice(0, 12)
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/agents") {
    const siteId = url.searchParams.get("siteId") || "unknown-site";
    sendJson(request, response, 200, {
      agents: getRankedAgents(siteId)
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/predict") {
    const siteId = url.searchParams.get("siteId") || "unknown-site";
    const signals = getOrCreatePredictiveSignals(siteId);
    sendJson(request, response, 200, {
      siteId,
      signals,
      generatedAt: new Date().toISOString(),
      signalCount: signals.length
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/strategy") {
    const siteId = url.searchParams.get("siteId") || "unknown-site";
    const strategy = analyzeStrategicGoals(siteId);
    sendJson(request, response, 200, strategy);
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/autonomy") {
    const siteId = url.searchParams.get("siteId") || "unknown-site";
    const goals = getOrCreateAutonomousGoals(siteId);
    sendJson(request, response, 200, {
      siteId,
      mode: "self-directed",
      goals,
      goalCount: goals.length,
      generatedAt: new Date().toISOString()
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/simulate") {
    const siteId = url.searchParams.get("siteId") || "unknown-site";
    const forecast = getOrCreateScenarioForecast(siteId);
    sendJson(request, response, 200, forecast);
    return;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    serveStatic(request, url.pathname, response, request.method === "HEAD");
    return;
  }

  sendJson(request, response, 405, { error: "Method Not Allowed" });
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
