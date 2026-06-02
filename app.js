let missionData = { websites: [] };
const toneClass = {
  green: "tone-green",
  yellow: "tone-yellow",
  red: "tone-red",
  blue: "tone-blue",
  violet: "tone-violet",
  gray: "tone-gray"
};

const elements = {
  body: document.body,
  topbarPanel: document.getElementById("topbarPanel"),
  missionStrip: document.getElementById("missionStrip"),
  siteSelect: document.getElementById("siteSelect"),
  globalStatusBadge: document.getElementById("globalStatusBadge"),
  commandInput: document.getElementById("commandInput"),
  commandSend: document.getElementById("commandSend"),
  commandResponse: document.getElementById("commandResponse"),
  commandPlan: document.getElementById("commandPlan"),
  commandMemory: document.getElementById("commandMemory"),
  kpiSection: document.getElementById("kpiSection"),
  missionSummary: document.getElementById("missionSummary"),
  missionStatuses: document.getElementById("missionStatuses"),
  moduleCards: document.getElementById("moduleCards"),
  alertList: document.getElementById("alertList"),
  perceptionPanel: document.getElementById("perceptionPanel"),
  nextBestAction: document.getElementById("nextBestAction"),
  trustExplanation: document.getElementById("trustExplanation"),
  activityFeed: document.getElementById("activityFeed"),
  crossSystemInsights: document.getElementById("crossSystemInsights"),
  agentSnapshot: document.getElementById("agentSnapshot"),
  agentCollabFeed: document.getElementById("agentCollabFeed"),
  predictiveAlerts: document.getElementById("predictiveAlerts"),
  strategicGoals: document.getElementById("strategicGoals"),
  autonomousGoals: document.getElementById("autonomousGoals"),
  scenarioForecasts: document.getElementById("scenarioForecasts"),
  executionTabs: document.getElementById("executionTabs"),
  agentsTabs: document.getElementById("agentsTabs"),
  navBadgeExecution: document.getElementById("navBadgeExecution"),
  navBadgeClients: document.getElementById("navBadgeClients"),
  navBadgeOnboarding: document.getElementById("navBadgeOnboarding"),
  navBadgeServices: document.getElementById("navBadgeServices"),
  navBadgeAgents: document.getElementById("navBadgeAgents"),
  navBadgeWebHelpers: document.getElementById("navBadgeWebHelpers"),
  navBadgeTools: document.getElementById("navBadgeTools"),
  navBadgeIntelligence: document.getElementById("navBadgeIntelligence"),
  navBadgeAutonomy: document.getElementById("navBadgeAutonomy"),
  navCorrelationHint: document.getElementById("navCorrelationHint"),
  openPaletteButton: document.getElementById("openPaletteButton"),
  commandPalette: document.getElementById("commandPalette"),
  paletteInput: document.getElementById("paletteInput"),
  paletteList: document.getElementById("paletteList"),
  focusBanner: document.getElementById("focusBanner"),
  focusTitle: document.getElementById("focusTitle"),
  exitFocusButton: document.getElementById("exitFocusButton"),
  buildQueueColumns: document.getElementById("buildQueueColumns"),
  clientSummary: document.getElementById("clientSummary"),
  clientSearchInput: document.getElementById("clientSearchInput"),
  clientStageFilter: document.getElementById("clientStageFilter"),
  clientIssueFilter: document.getElementById("clientIssueFilter"),
  clientPipeline: document.getElementById("clientPipeline"),
  clientCards: document.getElementById("clientCards"),
  clientActions: document.getElementById("clientActions"),
  clientDetailDrawer: document.getElementById("clientDetailDrawer"),
  closeClientDetailButton: document.getElementById("closeClientDetailButton"),
  clientDetailTitle: document.getElementById("clientDetailTitle"),
  clientDetailSubtitle: document.getElementById("clientDetailSubtitle"),
  clientDetailContent: document.getElementById("clientDetailContent"),
  openClientModalButton: document.getElementById("openClientModalButton"),
  closeClientModalButton: document.getElementById("closeClientModalButton"),
  clientOnboardModal: document.getElementById("clientOnboardModal"),
  clientOnboardForm: document.getElementById("clientOnboardForm"),
  clientNameInput: document.getElementById("clientNameInput"),
  clientStageInput: document.getElementById("clientStageInput"),
  clientWebsiteInput: document.getElementById("clientWebsiteInput"),
  clientRepoInput: document.getElementById("clientRepoInput"),
  clientRailwayInput: document.getElementById("clientRailwayInput"),
  clientVercelInput: document.getElementById("clientVercelInput"),
  clientMobileAppInput: document.getElementById("clientMobileAppInput"),
  clientGoogleBusinessInput: document.getElementById("clientGoogleBusinessInput"),
  clientSocialsInput: document.getElementById("clientSocialsInput"),
  clientPlanInput: document.getElementById("clientPlanInput"),
  clientServicesInput: document.getElementById("clientServicesInput"),
  clientContactInput: document.getElementById("clientContactInput"),
  clientNotesInput: document.getElementById("clientNotesInput"),
  clientFormResponse: document.getElementById("clientFormResponse"),
  onboardingSummary: document.getElementById("onboardingSummary"),
  onboardingQueue: document.getElementById("onboardingQueue"),
  onboardingConnections: document.getElementById("onboardingConnections"),
  onboardingStages: document.getElementById("onboardingStages"),
  onboardingActions: document.getElementById("onboardingActions"),
  serviceSummary: document.getElementById("serviceSummary"),
  serviceCards: document.getElementById("serviceCards"),
  serviceActions: document.getElementById("serviceActions"),
  toolSummary: document.getElementById("toolSummary"),
  toolCards: document.getElementById("toolCards"),
  toolActions: document.getElementById("toolActions"),
  webHelperSummary: document.getElementById("webHelperSummary"),
  webHelperCards: document.getElementById("webHelperCards"),
  webHelperRequests: document.getElementById("webHelperRequests"),
  operationsPanel: document.getElementById("operationsPanel"),
  clientsPanel: document.getElementById("clientsPanel"),
  clientActionsPanel: document.getElementById("clientActionsPanel"),
  onboardingPanel: document.getElementById("onboardingPanel"),
  onboardingActionsPanel: document.getElementById("onboardingActionsPanel"),
  servicesPanel: document.getElementById("servicesPanel"),
  serviceActionsPanel: document.getElementById("serviceActionsPanel"),
  toolsPanel: document.getElementById("toolsPanel"),
  toolActionsPanel: document.getElementById("toolActionsPanel"),
  buildQueuePanel: document.getElementById("buildQueuePanel"),
  webHelpersPanel: document.getElementById("webHelpersPanel"),
  webHelperRequestsPanel: document.getElementById("webHelperRequestsPanel"),
  alertsPanel: document.getElementById("alertsPanel"),
  activityPanel: document.getElementById("activityPanel"),
  commandPlanPanel: document.getElementById("commandPlanPanel"),
  commandMemoryPanel: document.getElementById("commandMemoryPanel"),
  agentCollabPanel: document.getElementById("agentCollabPanel"),
  strategicPanel: document.getElementById("strategicPanel"),
  autonomyPanel: document.getElementById("autonomyPanel"),
  scenarioPanel: document.getElementById("scenarioPanel"),
  predictivePanel: document.getElementById("predictivePanel"),
  crossSystemPanel: document.getElementById("crossSystemPanel"),
  agentsPanel: document.getElementById("agentsPanel"),
  navItems: [...document.querySelectorAll(".nav-item")],
  executionTabItems: [...document.querySelectorAll("[data-exec-tab]")],
  agentsTabItems: [...document.querySelectorAll("[data-agents-tab]")]
};

const priorityHeatOrder = {
  critical: 1,
  high: 2,
  growth: 3,
  monitor: 4
};

const priorityHeatLabel = {
  critical: "Critical - Fix Now",
  high: "High Impact",
  growth: "Growth Opportunity",
  monitor: "Monitor"
};

let activeCommandPlan = {
  summary: "Mission command is online and waiting for a directive.",
  priority: "P2 High Value",
  category: "general",
  objective: "Dispatch a command to generate coordinated system actions.",
  owners: ["Automation Supervisor"],
  rationale: [
    "No directive has been evaluated yet.",
    "Dispatch a mission command to generate explanation-aware actions."
  ],
  systemActions: [
    "Analyze command intent.",
    "Map affected systems.",
    "Generate ranked actions.",
    "Prepare automation or escalation path."
  ],
  autoActions: ["No command dispatched yet."],
  expectedImpact: "A live execution plan will appear here after command dispatch.",
  execution: null
};

let commandMemory = [];
let liveClients = null;
let selectedClientId = "";
let liveAgentIntelligence = [];
let liveWebHelpers = [];
let liveOnboarding = null;
let liveServiceCatalog = null;
let liveToolRegistry = null;
let livePredictiveSignals = [];
let liveAutonomousGoals = [];
let activeSiteId = "";

const clientPipelineStages = [
  { id: "lead", label: "Lead" },
  { id: "deposit-paid", label: "Deposit Paid" },
  { id: "website-build", label: "Website Build" },
  { id: "client-review", label: "Client Review" },
  { id: "final-payment", label: "Final Payment" },
  { id: "launch-handoff", label: "Launch / Handoff" },
  { id: "web-helper-care", label: "Web Helper Care" },
  { id: "growth-services", label: "Growth Services" },
  { id: "paused-archived", label: "Paused / Archived" }
];

function getActiveSite() {
  return missionData.websites.find((entry) => entry.id === activeSiteId) ?? missionData.websites[0] ?? null;
}

function getEmptySiteState() {
  return {
    id: "no-site",
    name: "No monitored sites configured",
    domain: "n/a",
    status: "Action Needed",
    kpis: [
      { label: "Websites Monitored", value: 0, delta: "Set MONITORED_SITES" },
      { label: "Pages Monitored", value: 0, delta: "No targets loaded" }
    ],
    missionStrip: {
      summary: "No monitored websites/pages configured. Add MONITORED_SITES in backend environment variables.",
      statuses: [
        { label: "Action Needed", tone: "red" }
      ]
    },
    modules: [],
    crossInsights: [
      {
        title: "Configuration required",
        detail: "Set MONITORED_SITES or MONITORED_SITE_URLS so Mission Control can load live website/page checks."
      }
    ],
    alerts: [
      {
        title: "No monitored targets",
        detail: "Backend has no website/page configuration for monitoring.",
        tone: "red"
      }
    ],
    activityFeed: [
      {
        title: "Waiting for monitored site configuration",
        detail: "Set MONITORED_SITES and redeploy backend.",
        time: new Date().toISOString()
      }
    ],
    agents: [],
    buildQueue: {
      "Idea Backlog": ["Configure monitored sites/pages"],
      Researching: [],
      "Ready to Build": [],
      Building: [],
      Testing: [],
      "Ready to Deploy": [],
      Live: [],
      Archived: []
    }
  };
}

async function loadMissionSnapshot(forceRefresh = false) {
  try {
    const refreshParam = forceRefresh ? "?refresh=true" : "";
    const response = await fetch(apiUrl(`/mission/snapshot${refreshParam}`));
    if (!response.ok) {
      throw new Error(`Snapshot request failed with status ${response.status}`);
    }

    const payload = await response.json();
    missionData = {
      websites: payload.websites || []
    };
  } catch {
    missionData = { websites: [] };
  }
}

let executionPollTimer = null;
let activeView = "mission-control";
let activeExecutionSubview = "overview";
let activeAgentsSubview = "rankings";
let isFocusMode = false;
let paletteSelectionIndex = 0;
let currentPaletteActions = [];
let deferredRecommendationId = null;
const badgeCounts = {
  clients: null,
  onboarding: null,
  services: null,
  execution: null,
  agents: null,
  webHelpers: null,
  tools: null,
  intelligence: null,
  autonomy: null
};

const storageKeys = {
  executionSubview: "ghostMissionControl.executionSubview",
  agentsSubview: "ghostMissionControl.agentsSubview",
  focusMode: "ghostMissionControl.focusMode",
  deferredRecommendation: "ghostMissionControl.deferredRecommendation",
  skippedOnboarding: "ghostMissionControl.skippedOnboarding"
};

const executionSubviewVisibility = {
  overview: ["commandPlanPanel", "commandMemoryPanel", "activityPanel", "agentCollabPanel"],
  active: ["commandPlanPanel", "agentCollabPanel"],
  history: ["commandMemoryPanel", "activityPanel"],
  failures: ["alertsPanel", "activityPanel", "commandPlanPanel"]
};

const agentsSubviewVisibility = {
  rankings: ["agentsPanel"],
  logs: ["activityPanel", "commandMemoryPanel"],
  collaboration: ["agentsPanel", "agentCollabPanel"]
};

const viewVisibility = {
  "mission-control": [
    "operationsPanel",
    "alertsPanel",
    "perceptionPanel",
    "predictivePanel",
    "crossSystemPanel",
    "activityPanel"
  ],
  clients: ["clientsPanel", "clientActionsPanel"],
  onboarding: ["onboardingPanel", "onboardingActionsPanel", "commandPlanPanel"],
  services: ["servicesPanel", "serviceActionsPanel", "commandPlanPanel"],
  execution: [
    "commandPlanPanel",
    "perceptionPanel",
    "commandMemoryPanel",
    "activityPanel",
    "agentCollabPanel"
  ],
  agents: ["agentsPanel", "agentCollabPanel", "perceptionPanel", "activityPanel"],
  "web-helpers": ["webHelpersPanel", "webHelperRequestsPanel", "commandPlanPanel", "commandMemoryPanel"],
  tools: ["toolsPanel", "toolActionsPanel", "commandPlanPanel"],
  intelligence: ["predictivePanel", "crossSystemPanel", "perceptionPanel", "alertsPanel", "activityPanel"],
  strategy: ["strategicPanel", "perceptionPanel", "commandPlanPanel", "commandMemoryPanel"],
  simulation: ["scenarioPanel", "strategicPanel", "predictivePanel"],
  autonomy: ["autonomyPanel", "scenarioPanel", "strategicPanel", "perceptionPanel"],
  "build-queue": ["buildQueuePanel", "operationsPanel"]
};

function setActiveView(view) {
  activeView = view;
  let visiblePanels = new Set(viewVisibility[view] || []);

  if (view === "execution") {
    visiblePanels = new Set(executionSubviewVisibility[activeExecutionSubview] || executionSubviewVisibility.overview);
  }

  if (view === "agents") {
    visiblePanels = new Set(agentsSubviewVisibility[activeAgentsSubview] || agentsSubviewVisibility.rankings);
  }

  const shellPanels = [
    "operationsPanel",
    "clientsPanel",
    "clientActionsPanel",
    "onboardingPanel",
    "onboardingActionsPanel",
    "servicesPanel",
    "serviceActionsPanel",
    "toolsPanel",
    "toolActionsPanel",
    "buildQueuePanel",
    "webHelpersPanel",
    "webHelperRequestsPanel",
    "alertsPanel",
    "perceptionPanel",
    "activityPanel",
    "commandPlanPanel",
    "commandMemoryPanel",
    "agentCollabPanel",
    "strategicPanel",
    "autonomyPanel",
    "scenarioPanel",
    "predictivePanel",
    "crossSystemPanel",
    "agentsPanel"
  ];

  shellPanels.forEach((key) => {
    const panel = elements[key];
    if (!panel) {
      return;
    }

    panel.classList.toggle("view-hidden", !visiblePanels.has(key));
  });

  const showMissionHeader = view === "mission-control";
  if (elements.topbarPanel) {
    elements.topbarPanel.classList.toggle("view-hidden", !showMissionHeader);
  }

  if (elements.kpiSection) {
    elements.kpiSection.classList.toggle("view-hidden", !showMissionHeader);
  }

  if (elements.missionStrip) {
    elements.missionStrip.classList.toggle("view-hidden", !showMissionHeader);
  }

  elements.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });

  if (elements.executionTabs) {
    elements.executionTabs.classList.toggle("view-hidden", view !== "execution");
  }

  if (elements.agentsTabs) {
    elements.agentsTabs.classList.toggle("view-hidden", view !== "agents");
  }

  elements.executionTabItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.execTab === activeExecutionSubview);
  });

  elements.agentsTabItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.agentsTab === activeAgentsSubview);
  });

  const mainColumnPanels = ["operationsPanel", "clientsPanel", "onboardingPanel", "servicesPanel", "toolsPanel", "buildQueuePanel", "webHelpersPanel"];
  const sideColumnPanels = [
    "clientActionsPanel",
    "onboardingActionsPanel",
    "serviceActionsPanel",
    "toolActionsPanel",
    "webHelperRequestsPanel",
    "alertsPanel",
    "activityPanel",
    "commandPlanPanel",
    "commandMemoryPanel",
    "agentCollabPanel",
    "strategicPanel",
    "autonomyPanel",
    "scenarioPanel",
    "predictivePanel",
    "crossSystemPanel",
    "agentsPanel"
  ];
  const hasMainPanels = mainColumnPanels.some((key) => visiblePanels.has(key));
  const hasSidePanels = sideColumnPanels.some((key) => visiblePanels.has(key));
  elements.body.classList.toggle("focus-side-only", isFocusMode && !hasMainPanels && hasSidePanels);
  elements.body.classList.toggle("focus-main-only", isFocusMode && hasMainPanels && !hasSidePanels);

  renderFocusBanner();
}

function setupNavigation() {
  restoreSubviewPreferences();

  const storedFocusMode = loadStoredValue(storageKeys.focusMode);
  isFocusMode = storedFocusMode === "1";
  deferredRecommendationId = loadStoredValue(storageKeys.deferredRecommendation);

  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const selectedView = item.dataset.view;
      setActiveView(selectedView);
      setFocusMode(false);
    });
  });

  elements.executionTabItems.forEach((item) => {
    item.addEventListener("click", () => {
      activeExecutionSubview = item.dataset.execTab;
      saveStoredValue(storageKeys.executionSubview, activeExecutionSubview);
      setActiveView("execution");
    });
  });

  elements.agentsTabItems.forEach((item) => {
    item.addEventListener("click", () => {
      activeAgentsSubview = item.dataset.agentsTab;
      saveStoredValue(storageKeys.agentsSubview, activeAgentsSubview);
      setActiveView("agents");
    });
  });

  if (elements.openPaletteButton) {
    elements.openPaletteButton.addEventListener("click", () => {
      openCommandPalette();
    });
  }

  if (elements.exitFocusButton) {
    elements.exitFocusButton.addEventListener("click", () => {
      setFocusMode(false);
    });
  }

  setupCommandPalette();

  setActiveView(activeView);

  if (isFocusMode && activeView !== "mission-control") {
    setFocusMode(true, activeView);
  } else {
    setFocusMode(false);
  }
}

function getPersonalityLine(stance) {
  if (stance === "escalate") {
    return "Escalation mode: high-risk conditions detected, immediate intervention recommended.";
  }

  if (stance === "caution") {
    return "Caution mode: system sees rising risk and recommends a guided correction.";
  }

  return "Recommend mode: stable conditions detected with a high-confidence optimization move.";
}

function getConfidenceBand(score) {
  if (score >= 88) {
    return "High";
  }

  if (score >= 78) {
    return "Medium";
  }

  return "Low";
}

function buildPerceptionRecommendation(execution, agents, intelligence, autonomy) {
  if (execution.urgentCount > 0 && agents.degradedCount > 0) {
    return {
      id: "execution-agent-recovery",
      stance: "escalate",
      title: "Stabilize execution by rerouting degraded agents",
      command: "reroute execution workload from degraded agents and prioritize recovery actions",
      urgency: "Immediate",
      confidence: 91,
      confidenceWhy: [
        "Execution urgency and degraded-agent correlation is strong across current signals.",
        "Recent failure patterns match known recovery playbooks with high success rates."
      ],
      confidenceLift: [
        "Capture one successful rerouted run outcome in this session.",
        "Confirm degraded agents recover above 75% confidence after remediation."
      ],
      impact: "Reduce run failures and recover command completion speed.",
      whyGoal: "Protect execution reliability before downstream systems degrade.",
      whyAgent: "Degraded agents are the most likely failure source right now.",
      whyAction: "Rerouting and recovery contain blast radius while preserving throughput."
    };
  }

  if (intelligence.criticalCount > 0) {
    return {
      id: "critical-intelligence-mitigation",
      stance: "escalate",
      title: "Mitigate critical predictive risks",
      command: "prioritize mitigation for critical predictive alerts and execute fastest safe fixes",
      urgency: "High",
      confidence: 88,
      confidenceWhy: [
        "Multiple critical predictive alerts agree on near-term risk escalation.",
        "Mitigation actions are low-latency and historically reduce incident rate."
      ],
      confidenceLift: [
        "Increase confidence by validating one high-risk signal with real-time telemetry.",
        "Confirm mitigation reduces active critical alerts within one polling cycle."
      ],
      impact: "Prevent forecasted failures before they hit mission execution.",
      whyGoal: "Critical predictive alerts represent the highest near-term operational risk.",
      whyAgent: "Alerting and SEO agents have strongest context for fast mitigation.",
      whyAction: "Preemptive intervention is cheaper than post-failure recovery."
    };
  }

  if (autonomy.p1Count > 0) {
    return {
      id: "autonomy-p1-activation",
      stance: "caution",
      title: "Validate and activate P1 autonomous goals",
      command: "review and activate top-priority autonomous goals with guided oversight",
      urgency: "High",
      confidence: 84,
      confidenceWhy: [
        "P1 autonomous goals are pre-scored for urgency and expected impact.",
        "Guided oversight lowers execution risk while preserving response speed."
      ],
      confidenceLift: [
        "Raise confidence by validating top goal assumptions against latest site metrics.",
        "Track one completed P1 goal with expected impact met."
      ],
      impact: "Accelerate corrective action while preserving control.",
      whyGoal: "P1 goals are already prioritized by impact and urgency scoring.",
      whyAgent: "Autonomy supervisor has strongest coordination context across systems.",
      whyAction: "Guided activation balances speed with human oversight."
    };
  }

  if (agents.degradedCount > 0) {
    return {
      id: "agent-reliability-tune",
      stance: "caution",
      title: "Tune reliability for degraded agents",
      command: "run reliability diagnostics for degraded agents and apply recovery playbook",
      urgency: "Medium",
      confidence: 81,
      confidenceWhy: [
        "Degraded agent trend is measurable and linked to execution instability.",
        "Recovery diagnostics are targeted rather than system-wide, limiting side effects."
      ],
      confidenceLift: [
        "Increase confidence after diagnostic output confirms root-cause category.",
        "Verify confidence rebound in at least one degraded agent after fix."
      ],
      impact: "Improve confidence levels and prevent future escalations.",
      whyGoal: "Agent drift lowers system confidence and can cascade into failures.",
      whyAgent: "Low-confidence agents are measurable bottlenecks in current state.",
      whyAction: "Targeted diagnostics restores performance without broad disruption."
    };
  }

  return {
    id: "stable-optimization",
    stance: "recommend",
    title: "Scale a low-risk growth optimization",
    command: "identify highest-converting campaign path and scale allocation by 10 percent",
    urgency: "Low",
    confidence: 78,
    confidenceWhy: [
      "System is stable, but optimization payoff depends on external traffic response.",
      "Growth move is incremental, so downside risk is controlled but outcome variance remains."
    ],
    confidenceLift: [
      "Increase confidence by validating uplift in CTR or conversion within first test window.",
      "Confirm campaign path continues to outperform baseline after budget shift."
    ],
    impact: "Increase performance while the system is stable.",
    whyGoal: "Stable windows are best used for compounding gains.",
    whyAgent: "Campaign orchestrator has strongest signal-to-outcome fit for growth moves.",
    whyAction: "Incremental scaling protects downside while testing upside."
  };
}

function renderPerceptionLayer(execution, agents, intelligence, autonomy) {
  if (!elements.nextBestAction || !elements.trustExplanation) {
    return;
  }

  const recommendation = buildPerceptionRecommendation(execution, agents, intelligence, autonomy);
  const isDeferred = deferredRecommendationId === recommendation.id;
  const stanceLabel = recommendation.stance.toUpperCase();
  const confidenceBand = getConfidenceBand(recommendation.confidence);

  if (isDeferred) {
    elements.nextBestAction.innerHTML = `
      <article class="perception-card ${recommendation.stance}">
        <div class="perception-header">
          <h3>Recommendation Deferred</h3>
          <span class="pill tone-gray">Deferred</span>
        </div>
        <p>${recommendation.title}</p>
        <p class="perception-support">${getPersonalityLine(recommendation.stance)}</p>
        <div class="perception-actions-row">
          <button type="button" id="restoreRecommendationBtn">Restore Recommendation</button>
        </div>
      </article>
    `;

    const restoreButton = document.getElementById("restoreRecommendationBtn");
    if (restoreButton) {
      restoreButton.addEventListener("click", () => {
        deferredRecommendationId = null;
        saveStoredValue(storageKeys.deferredRecommendation, "");
        renderPerceptionLayer(execution, agents, intelligence, autonomy);
      });
    }
  } else {
    elements.nextBestAction.innerHTML = `
      <article class="perception-card ${recommendation.stance}">
        <div class="perception-header">
          <h3>Next Best Action</h3>
          <span class="pill tone-blue">${stanceLabel}</span>
        </div>
        <p class="perception-title">${recommendation.title}</p>
        <div class="perception-metrics">
          <span>Urgency: ${recommendation.urgency}</span>
          <span>Confidence: ${recommendation.confidence}%</span>
          <span>Band: ${confidenceBand}</span>
        </div>
        <p class="perception-impact">${recommendation.impact}</p>
        <div class="confidence-calibration">
          <p class="confidence-title">Confidence Calibration</p>
          <div class="confidence-columns">
            <div>
              <span class="confidence-label">Why confidence is ${confidenceBand.toLowerCase()}</span>
              <ul>
                ${recommendation.confidenceWhy.map((item) => `<li>${item}</li>`).join("")}
              </ul>
            </div>
            <div>
              <span class="confidence-label">What increases confidence</span>
              <ul>
                ${recommendation.confidenceLift.map((item) => `<li>${item}</li>`).join("")}
              </ul>
            </div>
          </div>
        </div>
        <p class="perception-support">${getPersonalityLine(recommendation.stance)}</p>
        <div class="perception-actions-row">
          <button type="button" id="applyRecommendationBtn">Apply Now</button>
          <button type="button" id="deferRecommendationBtn" class="secondary">Defer</button>
        </div>
      </article>
    `;

    const applyButton = document.getElementById("applyRecommendationBtn");
    if (applyButton) {
      applyButton.addEventListener("click", () => {
        elements.commandInput.value = recommendation.command;
        elements.commandResponse.textContent = `${getPersonalityLine(recommendation.stance)} Applying: ${recommendation.title}`;
        setActiveView("execution");
        setFocusMode(true, "execution");
        runMissionCommand();
      });
    }

    const deferButton = document.getElementById("deferRecommendationBtn");
    if (deferButton) {
      deferButton.addEventListener("click", () => {
        deferredRecommendationId = recommendation.id;
        saveStoredValue(storageKeys.deferredRecommendation, recommendation.id);
        renderPerceptionLayer(execution, agents, intelligence, autonomy);
      });
    }
  }

  elements.trustExplanation.innerHTML = `
    <article class="trust-card">
      <h3>Trust Layer</h3>
      <div class="trust-row">
        <span>Why this goal</span>
        <p>${recommendation.whyGoal}</p>
      </div>
      <div class="trust-row">
        <span>Why this agent</span>
        <p>${recommendation.whyAgent}</p>
      </div>
      <div class="trust-row">
        <span>Why this action</span>
        <p>${recommendation.whyAction}</p>
      </div>
    </article>
  `;
}

function getViewLabel(view) {
  const labels = {
    "mission-control": "Overview",
    clients: "Clients",
    onboarding: "Onboarding",
    services: "Services",
    "web-helpers": "Web Helpers",
    tools: "Tool Registry",
    "build-queue": "Build Queue"
  };

  if (labels[view]) {
    return labels[view];
  }

  return String(view || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function renderFocusBanner() {
  if (!elements.focusBanner || !elements.focusTitle) {
    return;
  }

  const shouldShow = isFocusMode && activeView !== "mission-control";
  elements.focusBanner.classList.toggle("view-hidden", !shouldShow);
  elements.focusTitle.textContent = shouldShow ? `${getViewLabel(activeView)} Focus Mode` : "Focus Mode";
}

function setFocusMode(enabled, targetView = activeView) {
  isFocusMode = Boolean(enabled) && targetView !== "mission-control";
  elements.body.classList.toggle("focus-mode", isFocusMode);
  renderFocusBanner();
  saveStoredValue(storageKeys.focusMode, isFocusMode ? "1" : "0");
}

function getPaletteActions() {
  const viewLabels = {
    "mission-control": "Overview",
    clients: "Clients",
    onboarding: "Onboarding",
    services: "Services",
    "web-helpers": "Web Helpers",
    tools: "Tool Registry",
    "build-queue": "Build Queue"
  };
  const setView = (view, focus = false) => ({
    id: `view-${view}`,
    label: `Open ${viewLabels[view] || getViewLabel(view)} view`,
    hint: focus ? "workspace takeover" : "view switch",
    keywords: `${view} switch open`,
    run: () => {
      setActiveView(view);
      setFocusMode(focus, view);
    }
  });

  return [
    setView("web-helpers", true),
    setView("clients", true),
    setView("onboarding", true),
    setView("services", true),
    setView("tools", true),
    setView("mission-control", false),
    setView("execution", true),
    setView("agents", true),
    setView("intelligence", true),
    setView("strategy", true),
    setView("simulation", true),
    setView("autonomy", true),
    setView("build-queue", true),
    {
      id: "focus-toggle",
      label: isFocusMode ? "Exit Focus Mode" : `Enter Focus Mode (${getViewLabel(activeView)})`,
      hint: "layout",
      keywords: "focus mode toggle",
      run: () => {
        setFocusMode(!isFocusMode, activeView);
      }
    },
    {
      id: "focus-execution",
      label: "Take Over Execution Workspace",
      hint: "fast path",
      keywords: "execution focus critical",
      run: () => {
        setActiveView("execution");
        setFocusMode(true, "execution");
      }
    }
  ];
}

function renderPaletteActions(query = "") {
  if (!elements.paletteList) {
    return;
  }

  const normalized = query.trim().toLowerCase();
  const allActions = getPaletteActions();
  currentPaletteActions = allActions.filter((action) => {
    if (!normalized) {
      return true;
    }

    const haystack = `${action.label} ${action.keywords} ${action.hint}`.toLowerCase();
    return haystack.includes(normalized);
  });

  paletteSelectionIndex = Math.min(paletteSelectionIndex, Math.max(currentPaletteActions.length - 1, 0));

  elements.paletteList.innerHTML = currentPaletteActions
    .map(
      (action, index) => `<button class="palette-item ${index === paletteSelectionIndex ? "selected" : ""}" data-palette-index="${index}" type="button">
        <span>${action.label}</span>
        <span class="palette-item-hint">${action.hint}</span>
      </button>`
    )
    .join("");

  elements.paletteList.querySelectorAll("[data-palette-index]").forEach((item) => {
    item.addEventListener("click", () => {
      const index = Number(item.dataset.paletteIndex);
      runPaletteAction(index);
    });
  });
}

function runPaletteAction(index) {
  const action = currentPaletteActions[index];
  if (!action) {
    return;
  }

  action.run();
  closeCommandPalette();
}

function openCommandPalette() {
  if (!elements.commandPalette || !elements.paletteInput) {
    return;
  }

  elements.commandPalette.classList.remove("view-hidden");
  paletteSelectionIndex = 0;
  renderPaletteActions("");
  elements.paletteInput.value = "";
  elements.paletteInput.focus();
}

function closeCommandPalette() {
  if (!elements.commandPalette) {
    return;
  }

  elements.commandPalette.classList.add("view-hidden");
}

function openClientModal() {
  if (!elements.clientOnboardModal) {
    return;
  }

  elements.clientOnboardModal.classList.remove("view-hidden");
  if (elements.clientFormResponse) {
    elements.clientFormResponse.textContent = "";
  }
  elements.clientNameInput?.focus();
}

function closeClientModal() {
  if (!elements.clientOnboardModal) {
    return;
  }

  elements.clientOnboardModal.classList.add("view-hidden");
}

function setupCommandPalette() {
  if (!elements.commandPalette || !elements.paletteInput) {
    return;
  }

  elements.paletteInput.addEventListener("input", (event) => {
    paletteSelectionIndex = 0;
    renderPaletteActions(event.target.value);
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if ((event.metaKey || event.ctrlKey) && key === "k") {
      event.preventDefault();
      openCommandPalette();
      return;
    }

    const paletteOpen = !elements.commandPalette.classList.contains("view-hidden");
    const clientModalOpen = elements.clientOnboardModal && !elements.clientOnboardModal.classList.contains("view-hidden");
    if (!paletteOpen) {
      if (key === "escape" && clientModalOpen) {
        closeClientModal();
        return;
      }
      if (key === "escape" && elements.clientDetailDrawer && !elements.clientDetailDrawer.classList.contains("view-hidden")) {
        closeClientDetail();
        return;
      }
      if (key === "escape" && isFocusMode) {
        setFocusMode(false);
      }
      return;
    }

    if (key === "escape") {
      closeCommandPalette();
      return;
    }

    if (key === "arrowdown") {
      event.preventDefault();
      if (currentPaletteActions.length > 0) {
        paletteSelectionIndex = (paletteSelectionIndex + 1) % currentPaletteActions.length;
        renderPaletteActions(elements.paletteInput.value);
      }
      return;
    }

    if (key === "arrowup") {
      event.preventDefault();
      if (currentPaletteActions.length > 0) {
        paletteSelectionIndex = (paletteSelectionIndex - 1 + currentPaletteActions.length) % currentPaletteActions.length;
        renderPaletteActions(elements.paletteInput.value);
      }
      return;
    }

    if (key === "enter") {
      event.preventDefault();
      runPaletteAction(paletteSelectionIndex);
    }
  });
}

function loadStoredValue(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveStoredValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures (private mode or blocked storage).
  }
}

function getSkippedOnboarding() {
  try {
    return JSON.parse(loadStoredValue(storageKeys.skippedOnboarding) || "{}");
  } catch {
    return {};
  }
}

function saveSkippedOnboarding(skipped) {
  saveStoredValue(storageKeys.skippedOnboarding, JSON.stringify(skipped));
}

function getSkipKey(clientId, itemId) {
  return `${clientId}:${itemId}`;
}

function isOnboardingSkipped(clientId, itemId) {
  return Boolean(getSkippedOnboarding()[getSkipKey(clientId, itemId)]);
}

function toggleOnboardingSkip(clientId, itemId) {
  const skipped = getSkippedOnboarding();
  const key = getSkipKey(clientId, itemId);
  if (skipped[key]) {
    delete skipped[key];
  } else {
    skipped[key] = true;
  }
  saveSkippedOnboarding(skipped);
  renderOnboarding(liveOnboarding);
}

function restoreSubviewPreferences() {
  const storedExecutionSubview = loadStoredValue(storageKeys.executionSubview);
  if (storedExecutionSubview && executionSubviewVisibility[storedExecutionSubview]) {
    activeExecutionSubview = storedExecutionSubview;
  }

  const storedAgentsSubview = loadStoredValue(storageKeys.agentsSubview);
  if (storedAgentsSubview && agentsSubviewVisibility[storedAgentsSubview]) {
    activeAgentsSubview = storedAgentsSubview;
  }
}

function setBadge(element, key, meta) {
  if (!element) {
    return;
  }

  const previousCount = badgeCounts[key];
  const count = meta?.count || 0;

  if (!count) {
    element.textContent = "";
    element.classList.remove("visible");
    element.classList.remove("pulse");
    element.classList.remove("critical", "warning", "active", "signal", "growth");
    element.removeAttribute("title");
    element.removeAttribute("aria-label");
    badgeCounts[key] = 0;
    return;
  }

  element.textContent = meta.text || String(count);
  element.classList.add("visible");
  element.classList.toggle("critical", meta.severity === "critical");
  element.classList.toggle("warning", meta.severity === "warning");
  element.classList.toggle("active", meta.severity === "active");
  element.classList.toggle("signal", meta.severity === "signal");
  element.classList.toggle("growth", meta.severity === "growth");
  element.title = meta.tooltip;
  element.setAttribute("aria-label", meta.tooltip);

  if (previousCount !== null && previousCount !== count) {
    element.classList.remove("pulse");
    requestAnimationFrame(() => {
      element.classList.add("pulse");
    });
  }

  badgeCounts[key] = count;
}

function getExecutionBadgeMeta(actions) {
  const activeActions = (actions || []).filter((action) =>
    ["queued", "running", "retrying", "attention"].includes(action.status)
  );

  const count = activeActions.length;
  if (!count) {
    return {
      count: 0,
      text: "",
      severity: "none",
      urgentCount: 0,
      tooltip: "No active execution tasks."
    };
  }

  const urgentCount = activeActions.filter((action) => ["attention", "retrying", "failed"].includes(action.status)).length;
  const hasUrgent = urgentCount > 0;
  const hasRunning = activeActions.some((action) => action.status === "running");

  const text = hasUrgent ? `${count} !` : hasRunning ? `${count} >` : String(count);
  const tooltip = hasUrgent
    ? `${count} active execution tasks, ${urgentCount} require immediate attention.`
    : hasRunning
      ? `${count} execution tasks are currently running.`
      : `${count} execution tasks are queued.`;

  const severity = hasUrgent ? "critical" : hasRunning ? "active" : "warning";
  return { count, text, severity, urgentCount, tooltip };
}

function getAgentsBadgeMeta(agents) {
  const degradedAgents = (agents || []).filter((agent) => agent.trend === "Down" || agent.confidence < 75);
  const count = degradedAgents.length;
  if (!count) {
    return {
      count: 0,
      text: "",
      severity: "none",
      degradedCount: 0,
      tooltip: "All agents are stable."
    };
  }

  const text = `${count} v`;
  const severity = count >= 2 ? "critical" : "warning";
  const tooltip = `${count} agents are degraded and need supervision.`;
  return { count, text, severity, degradedCount: count, tooltip };
}

function getWebHelpersBadgeMeta(helpers) {
  const pendingApprovals = (helpers || []).reduce((sum, helper) => sum + Number(helper.pendingApprovals || 0), 0);
  const openRequests = (helpers || []).reduce((sum, helper) => sum + Number(helper.openRequests || 0), 0);
  const pausedCount = (helpers || []).filter((helper) => helper.status === "paused").length;

  if (pendingApprovals > 0) {
    return {
      count: pendingApprovals,
      text: `${pendingApprovals} !`,
      severity: "critical",
      pendingApprovals,
      tooltip: `${pendingApprovals} web helper changes are waiting for approval.`
    };
  }

  if (openRequests > 0) {
    return {
      count: openRequests,
      text: String(openRequests),
      severity: "active",
      pendingApprovals: 0,
      tooltip: `${openRequests} client website requests are open.`
    };
  }

  if (pausedCount > 0) {
    return {
      count: pausedCount,
      text: `${pausedCount} p`,
      severity: "warning",
      pendingApprovals: 0,
      tooltip: `${pausedCount} web helper agents are paused.`
    };
  }

  return {
    count: 0,
    text: "",
    severity: "none",
    pendingApprovals: 0,
    tooltip: "All web helper agents are clear."
  };
}

function getClientsBadgeMeta(clientsPayload) {
  const onboardingCount = clientsPayload?.summary?.onboardingCount || 0;
  if (!onboardingCount) {
    return { count: 0, text: "", severity: "none", tooltip: "No clients are waiting in onboarding." };
  }

  return {
    count: onboardingCount,
    text: String(onboardingCount),
    severity: "active",
    tooltip: `${onboardingCount} clients are in onboarding.`
  };
}

function getOnboardingBadgeMeta(onboarding) {
  const needsIntegration = onboarding?.summary?.needsIntegration || 0;
  if (!needsIntegration) {
    return { count: 0, text: "", severity: "none", tooltip: "Client onboarding blueprint is ready." };
  }

  return {
    count: needsIntegration,
    text: `${needsIntegration} !`,
    severity: "warning",
    tooltip: `${needsIntegration} onboarding stages need integration.`
  };
}

function getServicesBadgeMeta(catalog) {
  const integrationNeeded = catalog?.summary?.integrationNeeded || 0;
  const plannedCount = catalog?.summary?.plannedCount || 0;
  const count = integrationNeeded + plannedCount;

  if (!count) {
    return { count: 0, text: "", severity: "none", tooltip: "All services are active." };
  }

  return {
    count,
    text: integrationNeeded ? `${integrationNeeded} !` : String(plannedCount),
    severity: integrationNeeded ? "warning" : "growth",
    tooltip: `${integrationNeeded} services need integration and ${plannedCount} are planned.`
  };
}

function getToolsBadgeMeta(registry) {
  const needsClassification = registry?.summary?.needsClassification || 0;
  if (!needsClassification) {
    return { count: 0, text: "", severity: "none", tooltip: "Tool registry is classified." };
  }

  return {
    count: needsClassification,
    text: `${needsClassification}`,
    severity: "warning",
    tooltip: `${needsClassification} repos need classification.`
  };
}

function getIntelligenceBadgeMeta(signals) {
  const activeSignals = signals || [];
  const count = activeSignals.length;
  if (!count) {
    return {
      count: 0,
      text: "",
      severity: "none",
      criticalCount: 0,
      tooltip: "No predictive intelligence alerts."
    };
  }

  const criticalCount = activeSignals.filter((signal) => signal.severity === "critical").length;
  const text = criticalCount > 0 ? `${criticalCount} !` : `${count} *`;
  const severity = criticalCount > 0 ? "critical" : "signal";
  const tooltip = criticalCount > 0
    ? `${criticalCount} critical intelligence alerts need review.`
    : `${count} intelligence signals detected.`;
  return { count, text, severity, criticalCount, tooltip };
}

function getAutonomyBadgeMeta(goals) {
  const count = (goals || []).length;
  if (!count) {
    return {
      count: 0,
      text: "",
      severity: "none",
      p1Count: 0,
      tooltip: "No autonomous interventions are pending."
    };
  }

  const p1Count = goals.filter((goal) => goal.priority === "P1").length;
  const text = p1Count > 0 ? `${p1Count} !` : `${count} +`;
  const severity = p1Count > 0 ? "critical" : "growth";
  const tooltip = p1Count > 0
    ? `${p1Count} P1 autonomous goals are ready to execute.`
    : `${count} autonomous goals are proposed.`;
  return { count, text, severity, p1Count, tooltip };
}

function updateCorrelationHint(execution, agents, intelligence, autonomy) {
  if (!elements.navCorrelationHint) {
    return;
  }

  let message = "";

  if (execution.urgentCount > 0 && agents.degradedCount > 0) {
    message = "Execution risk is likely linked to degraded agents.";
  } else if (intelligence.criticalCount > 0 && autonomy.p1Count > 0) {
    message = "Critical intelligence alerts are driving P1 autonomous goals.";
  } else if (execution.count > 0 && intelligence.count > 0) {
    message = "Execution and intelligence activity are rising together.";
  }

  if (!message) {
    elements.navCorrelationHint.textContent = "";
    elements.navCorrelationHint.classList.add("view-hidden");
    return;
  }

  elements.navCorrelationHint.textContent = message;
  elements.navCorrelationHint.classList.remove("view-hidden");
}

function updateContextualAwareness(execution, agents, intelligence, autonomy) {
  const executionNav = elements.navItems.find((item) => item.dataset.view === "execution");
  const systemCritical = execution.severity === "critical" || intelligence.severity === "critical";
  const systemStable = execution.count === 0 && agents.count === 0 && intelligence.count === 0 && autonomy.count === 0;

  if (executionNav) {
    executionNav.classList.toggle("attention", systemCritical);
  }

  elements.body.classList.toggle("system-critical", systemCritical);
  elements.body.classList.toggle("system-stable", systemStable);
}

function updateNavBadges() {
  const clients = getClientsBadgeMeta(liveClients);
  const onboarding = getOnboardingBadgeMeta(liveOnboarding);
  const services = getServicesBadgeMeta(liveServiceCatalog);
  const execution = getExecutionBadgeMeta(activeCommandPlan.execution?.actions || []);
  const agents = getAgentsBadgeMeta(liveAgentIntelligence);
  const webHelpers = getWebHelpersBadgeMeta(liveWebHelpers);
  const tools = getToolsBadgeMeta(liveToolRegistry);
  const intelligence = getIntelligenceBadgeMeta(livePredictiveSignals);
  const autonomy = getAutonomyBadgeMeta(liveAutonomousGoals);

  setBadge(elements.navBadgeClients, "clients", clients);
  setBadge(elements.navBadgeOnboarding, "onboarding", onboarding);
  setBadge(elements.navBadgeServices, "services", services);
  setBadge(elements.navBadgeExecution, "execution", execution);
  setBadge(elements.navBadgeAgents, "agents", agents);
  setBadge(elements.navBadgeWebHelpers, "webHelpers", webHelpers);
  setBadge(elements.navBadgeTools, "tools", tools);
  setBadge(elements.navBadgeIntelligence, "intelligence", intelligence);
  setBadge(elements.navBadgeAutonomy, "autonomy", autonomy);
  updateCorrelationHint(execution, agents, intelligence, autonomy);
  updateContextualAwareness(execution, agents, intelligence, autonomy);
  renderPerceptionLayer(execution, agents, intelligence, autonomy);
}

function getExecutionStatusClass(status) {
  if (status === "completed") {
    return "exec-ok";
  }

  if (status === "running" || status === "queued") {
    return "exec-running";
  }

  if (status === "retrying" || status === "attention") {
    return "exec-retrying";
  }

  if (status === "failed") {
    return "exec-failed";
  }

  return "exec-pending";
}

function stopExecutionPolling() {
  if (executionPollTimer) {
    clearInterval(executionPollTimer);
    executionPollTimer = null;
  }
}

function renderExecutionPanel() {
  const execution = activeCommandPlan.execution;
  if (!execution) {
    return `
      <article class="command-plan-item">
        <h3>Execution Status</h3>
        <p>No active execution run yet. Dispatch a command to start action routing.</p>
      </article>
    `;
  }

  const actionRows = execution.actions
    .map(
      (action) => `<li>
        <span class="exec-status ${getExecutionStatusClass(action.status)}">${action.status}</span>
        ${action.action} -> ${action.target} | ${action.agent}
        <div class="exec-detail">${action.detail || "No drilldown detail available."}</div>
        <div class="exec-detail">Dispatch: ${action.dispatchMode || "primary"} | Supervision: ${action.supervision || "Autonomous"}</div>
        ${action.plannedAgent && action.plannedAgent !== action.agent
          ? `<div class="exec-detail">Delegated From: ${action.plannedAgent}</div>`
          : ""}
        <div class="exec-detail exec-outcome">Attempts: ${action.attempts}</div>
      </li>`
    )
    .join("");

  const historyRows = (execution.history || [])
    .map((item) => `<li>${item}</li>`)
    .join("");

  return `
    <article class="command-plan-item">
      <h3>Execution Status</h3>
      <p>
        Run ${execution.id} | Overall:
        <span class="exec-status ${getExecutionStatusClass(execution.status)}">${execution.status}</span>
      </p>
      <ul>
        ${actionRows}
      </ul>
    </article>
    <article class="command-plan-item">
      <h3>Execution Timeline</h3>
      <ul>
        ${historyRows || "<li>No events yet.</li>"}
      </ul>
    </article>
  `;
}

function renderCollaborationFeed(collaborations) {
  if (!elements.agentCollabFeed) {
    return;
  }

  if (!collaborations || collaborations.length === 0) {
    elements.agentCollabFeed.innerHTML = `
      <article class="collab-item">
        <p>No inter-agent messages yet. Collaboration events will appear here as agents hand off work during execution.</p>
      </article>
    `;
    return;
  }

  elements.agentCollabFeed.innerHTML = [...collaborations]
    .reverse()
    .map((collab) => {
      const isChained = collab.chainId && collab.sequence;
      const chainBadge = isChained ? `<span class="collab-chain-badge">Chain Step ${collab.sequence}</span>` : "";
      const sequenceLabel = collab.label ? `<span class="collab-sequence-label">${collab.label}</span>` : "";
      return `<article class="collab-item ${isChained ? "collab-chained" : ""}">
        <div class="collab-header">
          <span class="collab-from">${collab.from}</span>
          <span class="collab-arrow">→</span>
          <span class="collab-to">${collab.to}</span>
          <span class="exec-status ${collab.status === "queued" ? "exec-pending" : "exec-ok"}">${collab.status}</span>
          ${chainBadge}
        </div>
        <p class="collab-message">${collab.message}</p>
        <div class="collab-meta-row">
          <span class="collab-decision">${collab.decision || "standard"}</span>
          <span class="collab-reason">${collab.reason || "No reason logged"}</span>
          ${sequenceLabel}
        </div>
      </article>`;
    })
    .join("");
}

function renderCommandMemory() {
  if (!commandMemory.length) {
    elements.commandMemory.innerHTML = `
      <article class="command-memory-item">
        <h3>No Commands Yet</h3>
        <p>Dispatched commands and outcomes will appear here.</p>
      </article>
    `;
    return;
  }

  elements.commandMemory.innerHTML = commandMemory
    .map(
      (entry) => `<article class="command-memory-item">
        <h3>${entry.command}</h3>
        <p>${entry.summary}</p>
        <p>Status: ${entry.status} | Priority: ${entry.priority}</p>
        <p>${entry.impact}</p>
      </article>`
    )
    .join("");
}

function setStatusBadge(status) {
  const statusTone =
    status === "All Systems Green"
      ? "green"
      : status === "Minor Warnings"
        ? "yellow"
        : status === "Action Needed"
          ? "red"
          : "blue";

  elements.globalStatusBadge.className = `status-badge ${toneClass[statusTone]}`;
  elements.globalStatusBadge.textContent = status;
}

function renderWebsiteOptions() {
  if (!missionData.websites.length) {
    elements.siteSelect.innerHTML = `<option value="">No monitored sites configured</option>`;
    elements.siteSelect.disabled = true;
    return;
  }

  elements.siteSelect.disabled = false;
  elements.siteSelect.innerHTML = missionData.websites
    .map((site) => `<option value="${site.id}">${site.name} (${site.domain})</option>`)
    .join("");
}

function renderKpis(site) {
  elements.kpiSection.innerHTML = site.kpis
    .map(
      (kpi, index) =>
        `<article class="kpi-card" style="animation-delay: ${Math.min(index * 45, 300)}ms">
          <div class="label">${kpi.label}</div>
          <div class="value">${kpi.value}</div>
          <div class="delta">${kpi.delta}</div>
        </article>`
    )
    .join("");
}

function renderMissionStrip(site) {
  elements.missionSummary.textContent = site.missionStrip.summary;
  elements.missionStatuses.innerHTML = site.missionStrip.statuses
    .map(
      (item) => `<span class="pill ${toneClass[item.tone] ?? "tone-gray"}">${item.label}</span>`
    )
    .join("");
}

function renderModules(site) {
  if (!site.modules || site.modules.length === 0) {
    elements.moduleCards.innerHTML = `
      <article class="module-card">
        <div class="module-head">
          <h3>No live modules yet</h3>
          <span class="pill tone-gray">Waiting</span>
        </div>
        <p>Configure monitored websites/pages to populate live module telemetry.</p>
      </article>
    `;
    return;
  }

  const sortedModules = [...site.modules].sort(
    (a, b) => (priorityHeatOrder[a.priorityHeat] ?? 99) - (priorityHeatOrder[b.priorityHeat] ?? 99)
  );

  elements.moduleCards.innerHTML = sortedModules
    .map((module) => {
      const metrics = Object.entries(module.metrics)
        .map(
          ([key, value]) =>
            `<div class="meta-row"><span>${key}</span>${value}</div>`
        )
        .join("");

      return `<article class="module-card">
        <div class="module-head">
          <h3>${module.name}</h3>
          <span class="pill ${toneClass[module.tone] ?? "tone-gray"}">${module.status}</span>
        </div>
        <div class="module-topline">
          <span class="priority-badge heat-${module.priorityHeat}">${priorityHeatLabel[module.priorityHeat]}</span>
          <span class="pill tone-gray">${module.priority}</span>
        </div>
        <div class="module-meta">
          ${metrics}
          <div class="meta-row"><span>Owner</span>${module.owner}</div>
          <div class="meta-row"><span>Revenue Influenced</span>${module.revenue.influenced}</div>
          <div class="meta-row"><span>Revenue Generated</span>${module.revenue.generated}</div>
          <div class="meta-row"><span>Pipeline Value</span>${module.revenue.pipeline}</div>
        </div>
        <div class="module-subblock">
          <div class="module-subline"><span>Confidence:</span> ${module.ownership.confidence}</div>
          <div class="module-subline"><span>Autonomy:</span> ${module.ownership.autonomy}</div>
          <div class="module-subline"><span>Last Decision:</span> ${module.ownership.lastDecision}</div>
          <div class="module-subline"><span>Needs Human:</span> ${module.ownership.needsHuman}</div>
        </div>
        <div class="module-subblock">
          <div class="module-subline"><span>Auto Action Enabled:</span> ${module.autoAction.enabled ? "Yes" : "No"}</div>
          <div class="module-subline"><span>Last Auto Fix:</span> ${module.autoAction.lastFix}</div>
          <div class="module-subline"><span>Escalation:</span> ${module.autoAction.escalation}</div>
        </div>
      </article>`;
    })
    .join("");
}

function renderAlerts(site) {
  if (!site.alerts || site.alerts.length === 0) {
    elements.alertList.innerHTML = `
      <article class="alert-item tone-green">
        <h3>No active alerts</h3>
        <p>All monitored pages are currently healthy.</p>
      </article>
    `;
    return;
  }

  elements.alertList.innerHTML = site.alerts
    .map(
      (alert) => `<article class="alert-item ${toneClass[alert.tone] ?? "tone-gray"}">
        <h3>${alert.title}</h3>
        <p>${alert.detail}</p>
      </article>`
    )
    .join("");
}

function renderActivity(site) {
  if (!site.activityFeed || site.activityFeed.length === 0) {
    elements.activityFeed.innerHTML = `
      <article class="feed-item">
        <h3>No activity yet</h3>
        <p>Monitoring events will appear here after the first check cycle.</p>
      </article>
    `;
    return;
  }

  elements.activityFeed.innerHTML = site.activityFeed
    .map(
      (item) => `<article class="feed-item">
        <h3>${item.title}</h3>
        <p>${item.detail}</p>
        <p class="statline">${item.time}</p>
      </article>`
    )
    .join("");
}

function renderAgents(site) {
  const baseAgents = site.agents || [];
  const byName = new Map(liveAgentIntelligence.map((entry) => [entry.name, entry]));
  const mergedAgents = baseAgents.map((agent) => {
    const live = byName.get(agent.name);
    if (!live) {
      return {
        ...agent,
        dynamicConfidence: null,
        dynamicOutcome: null,
        rank: agent.rank,
        trend: agent.trend,
        efficiency: agent.efficiency
      };
    }

    return {
      ...agent,
      rank: live.rank,
      trend: live.trend,
      efficiency: `${Math.round(live.confidence)}%`,
      dynamicConfidence: `${Math.round(live.confidence)}%`,
      dynamicOutcome: live.lastOutcome,
      statline: `${live.successfulActions} success | ${live.failedActions} fail | ${live.retriedActions} retries`
    };
  });

  const extraAgents = liveAgentIntelligence
    .filter((entry) => !mergedAgents.some((agent) => agent.name === entry.name))
    .filter((entry) => entry.siteCompletions > 0)
    .map((entry) => ({
      name: entry.name,
      status: "Active",
      tone: entry.trend === "Down" ? "yellow" : "blue",
      statline: `${entry.successfulActions} success | ${entry.failedActions} fail | ${entry.retriedActions} retries`,
      rank: entry.rank,
      trend: entry.trend,
      efficiency: `${Math.round(entry.confidence)}%`,
      dynamicConfidence: `${Math.round(entry.confidence)}%`,
      dynamicOutcome: entry.lastOutcome
    }));

  const rankedAgents = [...mergedAgents, ...extraAgents]
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
    .slice(0, 6);

  if (!rankedAgents.length) {
    elements.agentSnapshot.innerHTML = `
      <article class="agent-item">
        <h3>No active agent telemetry</h3>
        <p class="statline">Agents will populate after live command execution and monitoring cycles.</p>
      </article>
    `;
    updateNavBadges();
    return;
  }

  elements.agentSnapshot.innerHTML = rankedAgents
    .map(
      (agent) => `<article class="agent-item">
        <h3>${agent.name}</h3>
        <p class="pill ${toneClass[agent.tone] ?? "tone-gray"}">${agent.status}</p>
        <p class="statline">${agent.statline}</p>
        ${agent.dynamicConfidence ? `<p class="statline">Confidence: ${agent.dynamicConfidence}</p>` : ""}
        ${agent.dynamicOutcome ? `<p class="statline">Last Outcome: ${agent.dynamicOutcome}</p>` : ""}
        <div class="agent-rankline">
          <span>#${agent.rank} | Trend: ${agent.trend}</span>
          <span>Efficiency: ${agent.efficiency}</span>
        </div>
      </article>`
    )
    .join("");

  updateNavBadges();
}

async function loadAgentIntelligence(siteId = activeSiteId) {
  try {
    const response = await fetch(apiUrl(`/mission/agents?siteId=${encodeURIComponent(siteId)}`));
    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    liveAgentIntelligence = payload.agents || [];
    renderAgents(getActiveSite());
  } catch {
    liveAgentIntelligence = [];
    renderAgents(getActiveSite());
  }
}

async function loadPredictiveSignals(siteId = activeSiteId) {
  try {
    const response = await fetch(apiUrl(`/mission/predict?siteId=${encodeURIComponent(siteId)}`));
    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    renderPredictiveAlerts(payload.signals || []);
  } catch {
    renderPredictiveAlerts([]);
  }
}

function renderPredictiveAlerts(signals) {
  if (!elements.predictiveAlerts) {
    return;
  }

  if (!signals || signals.length === 0) {
    livePredictiveSignals = [];
    elements.predictiveAlerts.innerHTML = `
      <article class="pred-item pred-clear">
        <h3>No Signals Detected</h3>
        <p>System operating normally. No predictive risks identified.</p>
      </article>
    `;
    updateNavBadges();
    return;
  }

  livePredictiveSignals = [...signals];

  elements.predictiveAlerts.innerHTML = signals
    .sort((a, b) => (b.severity === "critical" ? 1 : 0) - (a.severity === "critical" ? 1 : 0))
    .map((signal) => {
      const severityClass = signal.severity === "critical" ? "pred-critical" : "pred-warning";
      return `<article class="pred-item ${severityClass}">
        <div class="pred-header">
          <span class="pred-type">${signal.type.replace(/_/g, " ")}</span>
          <span class="pred-severity">${signal.severity.toUpperCase()}</span>
          <span class="pred-confidence">${Math.round(signal.confidence)}% confidence</span>
        </div>
        <h3>${signal.message}</h3>
        <p class="pred-outcome">${signal.predictedOutcome}</p>
        <p class="pred-action">Suggested: ${signal.suggestedAction.replace(/_/g, " ")}</p>
      </article>`;
    })
    .join("");

  updateNavBadges();
}

async function loadStrategicGoals(siteId = activeSiteId) {
  try {
    const response = await fetch(apiUrl(`/mission/strategy?siteId=${encodeURIComponent(siteId)}`));
    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    renderStrategicGoals(payload);
  } catch {
    renderStrategicGoals(null);
  }
}

function renderStrategicGoals(strategy) {
  if (!elements.strategicGoals) {
    return;
  }

  if (!strategy) {
    elements.strategicGoals.innerHTML = `<article class="strategy-item strategy-empty"><h3>Unable to load strategy</h3></article>`;
    return;
  }

  const primaryGoal = strategy.allGoals[0];
  const allocation = strategy.recommendedAllocation;

  elements.strategicGoals.innerHTML = `
    <article class="strategy-primary">
      <div class="strategy-header">
        <h3>Primary Goal</h3>
        <span class="strategy-score">${primaryGoal.score}</span>
      </div>
      <p class="strategy-goal-name">${primaryGoal.goal.replace(/_/g, " ").toUpperCase()}</p>
      <p class="strategy-reasoning">${strategy.primaryReasoning}</p>
      <div class="strategy-metrics">
        <div class="metric">
          <span class="metric-label">Urgency</span>
          <span class="metric-value">${primaryGoal.urgency}/10</span>
        </div>
        <div class="metric">
          <span class="metric-label">Duration</span>
          <span class="metric-value">${primaryGoal.duration}h</span>
        </div>
        <div class="metric">
          <span class="metric-label">Success</span>
          <span class="metric-value">${Math.round(primaryGoal.successProbability * 100)}%</span>
        </div>
        <div class="metric">
          <span class="metric-label">Risk if ignored</span>
          <span class="metric-value">${primaryGoal.riskIfIgnored}</span>
        </div>
      </div>
      <div class="strategy-steps">
        <p class="steps-label">Next Steps:</p>
        ${primaryGoal.nextSteps.map((step) => `<div class="step">${step}</div>`).join("")}
      </div>
    </article>

    <article class="strategy-secondary">
      <h3>Secondary Goals</h3>
      <div class="secondary-goals-list">
        ${strategy.secondaryGoals
          .map(
            (goal) => `
          <div class="secondary-goal">
            <span class="goal-name">${goal.goal.replace(/_/g, " ")}</span>
            <span class="goal-score">${goal.score}</span>
          </div>
        `
          )
          .join("")}
      </div>
    </article>

    <article class="strategy-allocation">
      <h3>Resource Allocation</h3>
      <div class="allocation-bars">
        <div class="allocation-item">
          <label>Primary Goal</label>
          <div class="allocation-bar">
            <div class="allocation-fill" style="width: ${allocation.primary}%"></div>
          </div>
          <span>${allocation.primary}%</span>
        </div>
        <div class="allocation-item">
          <label>Secondary Goals</label>
          <div class="allocation-bar">
            <div class="allocation-fill" style="width: ${allocation.secondary}%"></div>
          </div>
          <span>${allocation.secondary}%</span>
        </div>
        <div class="allocation-item">
          <label>Contingency</label>
          <div class="allocation-bar">
            <div class="allocation-fill" style="width: ${allocation.contingency}%"></div>
          </div>
          <span>${allocation.contingency}%</span>
        </div>
      </div>
    </article>

    <article class="strategy-rationale">
      <h3>Strategic Rationale</h3>
      ${strategy.rationale.map((reason) => `<p class="rationale-item">• ${reason}</p>`).join("")}
    </article>
  `;
}

async function loadAutonomousGoals(siteId = activeSiteId) {
  try {
    const response = await fetch(apiUrl(`/mission/autonomy?siteId=${encodeURIComponent(siteId)}`));
    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    renderAutonomousGoals(payload.goals || []);
  } catch {
    renderAutonomousGoals([]);
  }
}

function renderAutonomousGoals(goals) {
  if (!elements.autonomousGoals) {
    return;
  }

  if (!goals || goals.length === 0) {
    liveAutonomousGoals = [];
    elements.autonomousGoals.innerHTML = `
      <article class="autonomy-item autonomy-empty">
        <h3>No Autonomous Goals</h3>
        <p>System is stable. No self-directed intervention needed.</p>
      </article>
    `;
    updateNavBadges();
    return;
  }

  liveAutonomousGoals = [...goals];

  elements.autonomousGoals.innerHTML = goals
    .map((goal) => {
      const priorityTone = goal.priority === "P1" ? "tone-red" : goal.priority === "P2" ? "tone-yellow" : "tone-blue";
      return `
      <article class="autonomy-item">
        <div class="autonomy-header">
          <h3>${goal.title}</h3>
          <span class="pill ${priorityTone}">${goal.priority}</span>
        </div>
        <p class="autonomy-trigger">Trigger: ${goal.trigger}</p>
        <p class="autonomy-impact">Expected: ${goal.expectedImpact}</p>
        <div class="autonomy-meta">
          <span>Confidence: ${Math.round(goal.confidence)}%</span>
          <span>Horizon: ${goal.horizonHours}h</span>
        </div>
        <div class="autonomy-command">Suggested command: ${goal.proposedCommand}</div>
      </article>`;
    })
    .join("");

  updateNavBadges();
}

async function loadScenarioForecasts(siteId = activeSiteId) {
  try {
    const response = await fetch(apiUrl(`/mission/simulate?siteId=${encodeURIComponent(siteId)}`));
    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    renderScenarioForecasts(payload);
  } catch {
    renderScenarioForecasts(null);
  }
}

function renderScenarioForecasts(forecast) {
  if (!elements.scenarioForecasts) {
    return;
  }

  if (!forecast || !forecast.scenarios || forecast.scenarios.length === 0) {
    elements.scenarioForecasts.innerHTML = `
      <article class="scenario-item scenario-empty">
        <h3>No Scenario Forecast</h3>
        <p>Simulation engine is waiting for execution context.</p>
      </article>
    `;
    return;
  }

  elements.scenarioForecasts.innerHTML = forecast.scenarios
    .map((scenario, index) => {
      const rankTone = index === 0 ? "tone-green" : "tone-gray";
      return `
      <article class="scenario-item ${index === 0 ? "scenario-recommended" : ""}">
        <div class="scenario-header">
          <h3>${scenario.name}</h3>
          <span class="pill ${rankTone}">${index === 0 ? "RECOMMENDED" : `#${index + 1}`}</span>
        </div>
        <p class="scenario-assumption">${scenario.assumptions}</p>
        <div class="scenario-metrics">
          <span>Traffic: +${Math.round(scenario.projectedTrafficLiftPct)}%</span>
          <span>Revenue: +${Math.round(scenario.projectedRevenueLiftPct)}%</span>
          <span>Risk: ${Math.round(scenario.riskScore)}</span>
          <span>Payback: ${Math.round(scenario.paybackDays)}d</span>
          <span>Confidence: ${Math.round(scenario.confidence)}%</span>
          <span>Outcome Score: ${scenario.outcomeScore}</span>
        </div>
        <p class="scenario-rationale">${scenario.rationale}</p>
      </article>`;
    })
    .join("");
}

function renderCommandPlan() {
  elements.commandPlan.innerHTML = `
    <article class="command-plan-item">
      <h3>${activeCommandPlan.summary}</h3>
      <p>${activeCommandPlan.objective}</p>
      <div class="command-plan-meta">
        <span class="pill tone-blue">${activeCommandPlan.priority}</span>
        ${activeCommandPlan.owners
          .map((owner) => `<span class="pill tone-gray">${owner}</span>`)
          .join("")}
      </div>
    </article>
    <article class="command-plan-item">
      <h3>System Actions</h3>
      <ul>
        ${activeCommandPlan.systemActions.map((action) => `<li>${action}</li>`).join("")}
      </ul>
    </article>
    <article class="command-plan-item">
      <h3>Auto Actions</h3>
      <ul>
        ${activeCommandPlan.autoActions.map((action) => `<li>${action}</li>`).join("")}
      </ul>
      <p>${activeCommandPlan.expectedImpact}</p>
    </article>
    <article class="command-plan-item">
      <h3>Why This Action</h3>
      <ul>
        ${(activeCommandPlan.rationale || []).map((reason) => `<li>${reason}</li>`).join("")}
      </ul>
    </article>
    ${renderExecutionPanel()}
  `;

  updateNavBadges();
}

async function loadCommandMemory() {
  try {
    const response = await fetch(apiUrl("/mission/commands"));
    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    commandMemory = payload.commands || [];
    renderCommandMemory();
  } catch {
    commandMemory = [];
    renderCommandMemory();
  }
}

async function pollExecutionStatus() {
  const executionId = activeCommandPlan.execution?.id;
  if (!executionId) {
    stopExecutionPolling();
    return;
  }

  try {
    const response = await fetch(apiUrl(`/mission/execution/${encodeURIComponent(executionId)}`));
    if (!response.ok) {
      throw new Error(`Execution poll failed with status ${response.status}`);
    }

    const execution = await response.json();
    activeCommandPlan.execution = execution;
    await loadCommandMemory();
    await loadAgentIntelligence(activeSiteId);
    await loadPredictiveSignals(activeSiteId);
    await loadStrategicGoals(activeSiteId);
    await loadAutonomousGoals(activeSiteId);
    await loadScenarioForecasts(activeSiteId);
    renderCollaborationFeed(execution.collaborations || []);

    if (execution.status === "running" || execution.status === "queued" || execution.status === "attention") {
      elements.commandResponse.textContent = `Execution ${execution.status}: ${activeCommandPlan.summary}`;
    } else {
      elements.commandResponse.textContent = `Execution ${execution.status}: ${activeCommandPlan.expectedImpact}`;
      stopExecutionPolling();
    }

    renderCommandPlan();
  } catch {
    elements.commandResponse.textContent = "Execution status polling interrupted. Retrying command is recommended.";
    stopExecutionPolling();
  }
}

function startExecutionPolling() {
  stopExecutionPolling();
  executionPollTimer = setInterval(pollExecutionStatus, 1800);
}

function renderCrossSystemInsights(site) {
  if (!site.crossInsights || site.crossInsights.length === 0) {
    elements.crossSystemInsights.innerHTML = `
      <article class="insight-item">
        <h3>No cross-system insights yet</h3>
        <p>Insights will appear as more live monitoring data is collected.</p>
      </article>
    `;
    return;
  }

  elements.crossSystemInsights.innerHTML = site.crossInsights
    .map(
      (insight) => `<article class="insight-item">
        <h3>${insight.title}</h3>
        <p>${insight.detail}</p>
      </article>`
    )
    .join("");
}

function renderBuildQueue(site) {
  const preferredOrder = [
    "Idea Backlog",
    "Researching",
    "Ready to Build",
    "Building",
    "Testing",
    "Ready to Deploy",
    "Live",
    "Archived"
  ];

  const buildQueue = site.buildQueue || {};
  const columns = preferredOrder.filter((name) =>
    Object.prototype.hasOwnProperty.call(buildQueue, name)
  );

  if (!columns.length) {
    elements.buildQueueColumns.innerHTML = `
      <section class="queue-column">
        <h3>No Build Queue Data</h3>
        <div class="queue-item tone-gray">Live queue data unavailable.</div>
      </section>
    `;
    return;
  }

  elements.buildQueueColumns.innerHTML = columns
    .map((name) => {
      const items = buildQueue[name];
      const content =
        items.length > 0
          ? items.map((item) => `<div class="queue-item">${item}</div>`).join("")
          : '<div class="queue-item tone-gray">No items</div>';

      return `<section class="queue-column">
        <h3>${name}</h3>
        ${content}
      </section>`;
    })
    .join("");
}

function renderOpsSummary(element, items) {
  if (!element) {
    return;
  }

  element.innerHTML = items
    .map((item) => `<article class="ops-stat">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
    </article>`)
    .join("");
}

function renderOpsActions(element, actions, emptyText) {
  if (!element) {
    return;
  }

  if (!actions || actions.length === 0) {
    element.innerHTML = `<article class="ops-side-item"><h3>No actions</h3><p>${emptyText}</p></article>`;
    return;
  }

  element.innerHTML = actions
    .map((action) => `<article class="ops-side-item"><p>${action}</p></article>`)
    .join("");
}

async function loadClients() {
  if (!elements.clientSummary || !elements.clientPipeline || !elements.clientCards || !elements.clientActions) {
    return;
  }

  try {
    const response = await fetch(apiUrl("/mission/clients"));
    if (!response.ok) {
      throw new Error(`Clients request failed with status ${response.status}`);
    }

    liveClients = await response.json();
    renderClients(liveClients);
  } catch {
    liveClients = null;
    renderClients(null);
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugForUi(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function getClientStage(client) {
  return client?.stage || client?.status || "website-build";
}

function getClientStageLabel(stageId) {
  return clientPipelineStages.find((stage) => stage.id === stageId)?.label || stageId || "Website Build";
}

function getClientIssueTags(client) {
  const issues = [];
  if (!client.websiteUrl) {
    issues.push({ id: "missing-website", label: "Missing website" });
  }
  if (!client.repo) {
    issues.push({ id: "missing-repo", label: "Missing repo" });
  }
  if (!client.vercelUrl) {
    issues.push({ id: "missing-vercel", label: "Missing Vercel" });
  }
  if (!client.googleBusinessUrl) {
    issues.push({ id: "missing-gbp", label: "Missing GBP" });
  }
  if (!client.socialUrls?.length) {
    issues.push({ id: "missing-socials", label: "Missing socials" });
  }
  if (client.services?.includes("search-intelligence")) {
    issues.push({ id: "needs-geo", label: "Needs GEO setup" });
  }
  return issues;
}

function getClientFilterState() {
  return {
    query: String(elements.clientSearchInput?.value || "").trim().toLowerCase(),
    stage: elements.clientStageFilter?.value || "all",
    issue: elements.clientIssueFilter?.value || "all"
  };
}

function getFilteredClients(clients) {
  const filters = getClientFilterState();
  return clients.filter((client) => {
    const issueTags = getClientIssueTags(client);
    const haystack = [
      client.clientName,
      client.websiteUrl,
      client.repo,
      client.githubUrl,
      client.railwayUrl,
      client.vercelUrl,
      client.mobileAppUrl,
      client.googleBusinessUrl,
      client.plan,
      client.contact,
      client.notes,
      ...(client.socialUrls || []),
      ...(client.services || []),
      ...issueTags.map((issue) => issue.label)
    ]
      .join(" ")
      .toLowerCase();

    if (filters.query && !haystack.includes(filters.query)) {
      return false;
    }

    if (filters.stage !== "all" && getClientStage(client) !== filters.stage) {
      return false;
    }

    if (filters.issue !== "all" && !issueTags.some((issue) => issue.id === filters.issue)) {
      return false;
    }

    return true;
  });
}

function getClientQuickActions(client) {
  return [
    { label: "Site", url: client.websiteUrl },
    { label: "Repo", url: client.githubUrl || client.repo },
    { label: "Vercel", url: client.vercelUrl },
    { label: "Railway", url: client.railwayUrl },
    { label: "GEO", url: client.geoUrl || client.googleBusinessUrl },
    { label: "Web Helper", url: client.webHelperUrl }
  ].filter((action) => action.url);
}

function renderClientLink(label, value, options = {}) {
  const href = String(value || "").trim();
  if (!href) {
    return `<div class="connection-link is-empty"><span>${escapeHtml(label)}</span><strong>Not linked</strong></div>`;
  }

  const safeHref = escapeHtml(href);
  return `<a class="connection-link${options.sensitive ? " is-sensitive" : ""}" href="${safeHref}" target="_blank" rel="noreferrer">
    <span>${escapeHtml(label)}</span>
    <strong>${escapeHtml(href)}</strong>
  </a>`;
}

function renderSocialLinks(urls) {
  const links = Array.isArray(urls) ? urls.filter(Boolean) : [];
  if (!links.length) {
    return `<div class="connection-link is-empty"><span>Socials</span><strong>Not linked</strong></div>`;
  }

  return `<div class="connection-link social-stack">
    <span>Socials</span>
    <strong>${links.map((url) => `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a>`).join("")}</strong>
  </div>`;
}

function renderClientIssueBadges(client) {
  const issues = getClientIssueTags(client);
  if (!issues.length) {
    return `<div class="client-warning-row"><span class="client-ok-badge">Connections ready</span></div>`;
  }

  return `<div class="client-warning-row">
    ${issues.slice(0, 4).map((issue) => `<span class="client-warning-badge">${escapeHtml(issue.label)}</span>`).join("")}
  </div>`;
}

function renderClientQuickActions(client) {
  const actions = getClientQuickActions(client);
  const links = actions
    .slice(0, 6)
    .map((action) => `<a href="${escapeHtml(action.url)}" target="_blank" rel="noreferrer">${escapeHtml(action.label)}</a>`)
    .join("");

  return `<div class="client-quick-actions">
    ${links || `<span>No links yet</span>`}
    <button type="button" data-client-detail="${escapeHtml(client.id)}">Details</button>
  </div>`;
}

function renderClientPipeline(clients) {
  if (!elements.clientPipeline) {
    return;
  }

  elements.clientPipeline.innerHTML = clientPipelineStages
    .map((stage) => {
      const stageClients = clients.filter((client) => getClientStage(client) === stage.id);
      const cards = stageClients.length
        ? stageClients.map((client) => `<article class="pipeline-card" data-client-detail="${escapeHtml(client.id)}">
            <div class="pipeline-card-head">
              <h3>${escapeHtml(client.clientName)}</h3>
              <span>${getClientIssueTags(client).length}</span>
            </div>
            <p>${escapeHtml(client.plan || "Launch + Care")}</p>
            <span>${escapeHtml(client.websiteUrl || client.repo || "Connections needed")}</span>
            ${renderClientIssueBadges(client)}
            <div class="ops-chip-row">
              ${(client.services || []).slice(0, 3).map((service) => `<span>${escapeHtml(service)}</span>`).join("")}
            </div>
          </article>`).join("")
        : `<div class="pipeline-empty">No clients</div>`;

      return `<section class="pipeline-column">
        <div class="pipeline-column-head">
          <h3>${escapeHtml(stage.label)}</h3>
          <span>${stageClients.length}</span>
        </div>
        ${cards}
      </section>`;
    })
    .join("");
}

function openClientDetail(clientId) {
  const clients = liveClients?.clients || [];
  const client = clients.find((entry) => entry.id === clientId);
  if (!client || !elements.clientDetailDrawer || !elements.clientDetailContent) {
    return;
  }

  selectedClientId = client.id;
  elements.clientDetailTitle.textContent = client.clientName;
  elements.clientDetailSubtitle.textContent = `${getClientStageLabel(getClientStage(client))} - ${client.plan || "Launch + Care"}`;
  elements.clientDetailContent.innerHTML = `
    ${renderClientIssueBadges(client)}
    <div class="client-detail-section">
      <h3>Quick Actions</h3>
      ${renderClientQuickActions(client)}
    </div>
    <div class="client-detail-section">
      <h3>Connections</h3>
      <div class="connection-list">
        ${renderClientLink("Website", client.websiteUrl)}
        ${renderClientLink("GitHub", client.githubUrl || client.repo)}
        ${renderClientLink("Railway Backend", client.railwayUrl, { sensitive: true })}
        ${renderClientLink("Vercel", client.vercelUrl)}
        ${renderClientLink("Mobile App", client.mobileAppUrl)}
        ${renderClientLink("Google Business", client.googleBusinessUrl)}
        ${renderSocialLinks(client.socialUrls)}
      </div>
    </div>
    <div class="client-detail-section">
      <h3>Services</h3>
      <div class="ops-chip-row">${(client.services || []).map((service) => `<span>${escapeHtml(service)}</span>`).join("") || "<span>Not set</span>"}</div>
    </div>
    <div class="client-detail-section">
      <h3>Contact</h3>
      <p>${escapeHtml(client.contact || "Not set")}</p>
    </div>
    <div class="client-detail-section">
      <h3>Notes</h3>
      <p>${escapeHtml(client.notes || "No notes yet.")}</p>
    </div>
    <div class="client-detail-section">
      <h3>Update History</h3>
      <p>Created ${escapeHtml(client.createdAt || "unknown")} · Updated ${escapeHtml(client.updatedAt || "unknown")}</p>
    </div>
  `;
  elements.clientDetailDrawer.classList.remove("view-hidden");
}

function closeClientDetail() {
  selectedClientId = "";
  elements.clientDetailDrawer?.classList.add("view-hidden");
}

function renderClients(payload) {
  const summary = payload?.summary || {
    clientCount: 0,
    onboardingCount: 0,
    liveCount: 0,
    searchClients: 0,
    repoLinked: 0,
    websiteBuildCount: 0,
    connectionGaps: 0
  };

  renderOpsSummary(elements.clientSummary, [
    { label: "Clients", value: summary.clientCount },
    { label: "Website Build", value: summary.websiteBuildCount },
    { label: "Care / Growth", value: summary.liveCount },
    { label: "SEO/AEO/GEO", value: summary.searchClients },
    { label: "Connection Gaps", value: summary.connectionGaps }
  ]);

  const clients = payload?.clients || [];
  const filteredClients = getFilteredClients(clients);
  renderClientPipeline(filteredClients);

  elements.clientCards.innerHTML = clients.length
    ? filteredClients.length
      ? filteredClients.map((client) => `<article class="ops-card client-detail-card">
        <div class="ops-card-head">
          <h3>${escapeHtml(client.clientName)}</h3>
          <span class="pill ${["web-helper-care", "growth-services"].includes(getClientStage(client)) ? "tone-green" : "tone-blue"}">${escapeHtml(getClientStageLabel(getClientStage(client)))}</span>
        </div>
        <p>${escapeHtml(client.websiteUrl || "No website linked yet")}</p>
        ${renderClientIssueBadges(client)}
        ${renderClientQuickActions(client)}
        <div class="ops-meta-grid">
          <div><span>Plan</span>${escapeHtml(client.plan)}</div>
          <div><span>Repo</span>${escapeHtml(client.repo || "Not linked")}</div>
          <div><span>Contact</span>${escapeHtml(client.contact || "Not set")}</div>
          <div><span>Source</span>${escapeHtml(client.source)}</div>
        </div>
        <div class="connection-list">
          ${renderClientLink("Website", client.websiteUrl)}
          ${renderClientLink("GitHub", client.githubUrl || client.repo)}
          ${renderClientLink("Railway Backend", client.railwayUrl, { sensitive: true })}
          ${renderClientLink("Vercel", client.vercelUrl)}
          ${renderClientLink("Mobile App", client.mobileAppUrl)}
          ${renderClientLink("Google Business", client.googleBusinessUrl)}
          ${renderSocialLinks(client.socialUrls)}
        </div>
        ${client.railwayUrl ? `<p class="sensitive-link-note">Backend links should stay internal until auth, role masking, and audit logging are in place.</p>` : ""}
        <div class="ops-chip-row">
          ${(client.services || []).map((service) => `<span>${escapeHtml(service)}</span>`).join("")}
        </div>
        ${client.notes ? `<p>${escapeHtml(client.notes)}</p>` : ""}
      </article>`).join("")
      : `<article class="ops-card">
        <h3>No clients match the filters</h3>
        <p>Adjust search, stage, or issue filters to bring clients back into view.</p>
      </article>`
    : `<article class="ops-card">
        <h3>No clients onboarded yet</h3>
        <p>Create the first client record to connect services, tools, agents, approvals, and maintenance scope.</p>
      </article>`;

  const clientActions = clients.flatMap((client) =>
    (client.actions || []).slice(0, 3).map((action) => `${client.clientName}: ${action}`)
  );
  renderOpsActions(elements.clientActions, clientActions.length ? clientActions : payload?.actions || [], "Client actions will appear here.");
  updateNavBadges();
}

function getSelectedClientServices() {
  if (!elements.clientServicesInput) {
    return [];
  }

  return [...elements.clientServicesInput.selectedOptions].map((option) => option.value);
}

async function submitClientOnboarding(event) {
  event.preventDefault();
  if (!elements.clientOnboardForm) {
    return;
  }

  const payload = {
    clientName: elements.clientNameInput?.value || "",
    stage: elements.clientStageInput?.value || "website-build",
    websiteUrl: elements.clientWebsiteInput?.value || "",
    repo: elements.clientRepoInput?.value || "",
    railwayUrl: elements.clientRailwayInput?.value || "",
    vercelUrl: elements.clientVercelInput?.value || "",
    mobileAppUrl: elements.clientMobileAppInput?.value || "",
    googleBusinessUrl: elements.clientGoogleBusinessInput?.value || "",
    socialUrls: String(elements.clientSocialsInput?.value || "")
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean),
    plan: elements.clientPlanInput?.value || "",
    services: getSelectedClientServices(),
    contact: elements.clientContactInput?.value || "",
    notes: elements.clientNotesInput?.value || ""
  };

  if (!payload.clientName.trim()) {
    elements.clientFormResponse.textContent = "Client name is required.";
    return;
  }

  elements.clientFormResponse.textContent = "Creating client record...";

  try {
    const response = await fetch(apiUrl("/mission/clients"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || `Client create failed with status ${response.status}`);
    }

    liveClients = result;
    renderClients(result);
    elements.clientOnboardForm.reset();
    if (elements.clientStageInput) {
      elements.clientStageInput.value = "website-build";
    }
    elements.clientFormResponse.textContent = `Created ${result.created.clientName}.`;
    closeClientModal();
  } catch (error) {
    elements.clientFormResponse.textContent = String(error.message || error);
  }
}

async function loadOnboarding() {
  if (!elements.onboardingSummary || !elements.onboardingQueue || !elements.onboardingConnections || !elements.onboardingStages || !elements.onboardingActions) {
    return;
  }

  try {
    const response = await fetch(apiUrl("/mission/onboarding"));
    if (!response.ok) {
      throw new Error(`Onboarding request failed with status ${response.status}`);
    }

    liveOnboarding = await response.json();
    renderOnboarding(liveOnboarding);
  } catch {
    liveOnboarding = null;
    renderOnboarding(null);
  }
}

function getStatusTone(status) {
  if (["connected", "active", "complete", "ready"].includes(status)) {
    return "tone-green";
  }
  if (["planned", "in-progress"].includes(status)) {
    return "tone-blue";
  }
  if (["missing", "access-needed", "blocked"].includes(status)) {
    return "tone-yellow";
  }
  return "tone-gray";
}

function applyOnboardingSkips(client) {
  const connections = (client.connections || []).map((connection) => {
    const skipped = isOnboardingSkipped(client.id, connection.id);
    return skipped ? { ...connection, status: "skipped", skipped: true, required: false } : connection;
  });
  const blockers = connections.filter((connection) =>
    connection.required && ["missing", "access-needed"].includes(connection.status)
  );
  const requiredConnections = connections.filter((connection) => connection.required);
  const readyRequired = requiredConnections.filter((connection) =>
    ["connected", "active", "planned"].includes(connection.status)
  );
  const progress = requiredConnections.length ? Math.round((readyRequired.length / requiredConnections.length) * 100) : 100;

  return {
    ...client,
    progress,
    blockerCount: blockers.length,
    blockers,
    nextAction: blockers[0] ? `Connect ${blockers[0].label}.` : "No required blockers.",
    connections
  };
}

function renderConnectionStatus(connection, clientId) {
  const skipped = connection.skipped || isOnboardingSkipped(clientId, connection.id);
  const status = skipped ? "skipped" : connection.status;
  return `<div class="connection-status ${getStatusTone(status)}">
    <span>${escapeHtml(connection.label)}</span>
    <strong>${escapeHtml(status)}</strong>
    <button type="button" data-onboarding-skip-client="${escapeHtml(clientId)}" data-onboarding-skip-item="${escapeHtml(connection.id)}">${skipped ? "Unskip" : "Skip"}</button>
  </div>`;
}

function renderOnboardingCard(client) {
  return `<article class="onboarding-client-card">
    <div class="onboarding-client-head">
      <div>
        <h3>${escapeHtml(client.clientName)}</h3>
        <p>${escapeHtml(client.plan || "Launch + Care")}</p>
      </div>
      <span class="onboarding-progress">${client.progress}%</span>
    </div>
    <div class="progress-track"><span style="width: ${Math.max(0, Math.min(100, Number(client.progress || 0)))}%"></span></div>
    <div class="client-warning-row">
      ${client.blockers?.length ? client.blockers.slice(0, 4).map((blocker) => `<span class="client-warning-badge">${escapeHtml(blocker.label)}</span>`).join("") : `<span class="client-ok-badge">No required blockers</span>`}
    </div>
    <p>${escapeHtml(client.nextAction)}</p>
    <div class="onboarding-checklist">
      ${(client.checklist || []).map((item) => {
        const itemId = slugForUi(item.label);
        const skipped = isOnboardingSkipped(client.id, itemId);
        const status = skipped ? "skipped" : item.status;
        return `<div>
          <span>${escapeHtml(item.label)}</span>
          <strong class="${getStatusTone(status)}">${escapeHtml(status)}</strong>
          <button type="button" data-onboarding-skip-client="${escapeHtml(client.id)}" data-onboarding-skip-item="${escapeHtml(itemId)}">${skipped ? "Unskip" : "Skip"}</button>
        </div>`;
      }).join("")}
    </div>
  </article>`;
}

function renderOnboarding(payload) {
  const summary = payload?.summary || {
    activeClients: 0,
    blockedClients: 0,
    readyForHandoff: 0,
    missingConnections: 0
  };
  renderOpsSummary(elements.onboardingSummary, [
    { label: "Active Onboarding", value: summary.activeClients || 0 },
    { label: "Blocked Clients", value: summary.blockedClients || 0 },
    { label: "Ready Handoff", value: summary.readyForHandoff || 0 },
    { label: "Missing Connections", value: summary.missingConnections || 0 }
  ]);

  const queue = (payload?.activation?.queue || []).map(applyOnboardingSkips);
  const kanbanStages = clientPipelineStages.filter((stage) =>
    ["lead", "deposit-paid", "website-build", "client-review", "final-payment", "launch-handoff"].includes(stage.id)
  );
  elements.onboardingQueue.innerHTML = `<div class="onboarding-section-title">
      <h3>Onboarding Board</h3>
      <p>Each stage shows client activation progress, blockers, and skippable services.</p>
    </div>
    <div class="onboarding-kanban">
      ${kanbanStages.map((stage) => {
        const stageClients = queue.filter((client) => client.stage === stage.id);
        return `<section class="onboarding-column">
          <div class="onboarding-column-head">
            <h3>${escapeHtml(stage.label)}</h3>
            <span>${stageClients.length}</span>
          </div>
          ${stageClients.length ? stageClients.map(renderOnboardingCard).join("") : `<div class="pipeline-empty">No clients</div>`}
        </section>`;
      }).join("")}
    </div>`;

  const connectionClients = queue.slice(0, 8);
  elements.onboardingConnections.innerHTML = connectionClients.length
    ? `<div class="onboarding-section-title"><h3>Connection Status</h3><p>Website, dev, search, socials, ads, analytics, reporting, and Web Helper readiness.</p></div>
      <div class="connection-matrix">
        ${connectionClients.map((client) => `<article class="connection-client">
          <h3>${escapeHtml(client.clientName)}</h3>
          <div>${(client.connections || []).map((connection) => renderConnectionStatus(connection, client.id)).join("")}</div>
        </article>`).join("")}
      </div>`
    : "";

  const stages = payload?.stages || [];
  elements.onboardingStages.innerHTML = stages.length
    ? `<div class="onboarding-section-title"><h3>Activation Blueprint</h3><p>The standard path every client should pass before ongoing operations.</p></div>
      ${stages.map((stage) => `<article class="ops-card">
        <div class="ops-card-head">
          <h3>${escapeHtml(stage.name)}</h3>
          <span class="pill ${stage.status === "needs-integration" ? "tone-yellow" : "tone-green"}">${escapeHtml(stage.status)}</span>
        </div>
        <p>${escapeHtml(stage.description)}</p>
        <div class="ops-chip-row">${stage.requiredArtifacts.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
        <div class="ops-mini-list">${stage.automations.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}</div>
      </article>`).join("")}`
    : `<article class="ops-card"><h3>No onboarding blueprint</h3><p>Onboarding stages will appear when the backend is available.</p></article>`;

  renderOpsActions(elements.onboardingActions, payload?.activation?.actions || payload?.actions || [], "Onboarding actions will appear here.");
  updateNavBadges();
}

async function loadServices() {
  if (!elements.serviceSummary || !elements.serviceCards || !elements.serviceActions) {
    return;
  }

  try {
    const response = await fetch(apiUrl("/mission/services"));
    if (!response.ok) {
      throw new Error(`Services request failed with status ${response.status}`);
    }

    liveServiceCatalog = await response.json();
    renderServices(liveServiceCatalog);
  } catch {
    liveServiceCatalog = null;
    renderServices(null);
  }
}

function renderServices(payload) {
  const summary = payload?.summary || { serviceCount: 0, activeCount: 0, integrationNeeded: 0, plannedCount: 0 };
  renderOpsSummary(elements.serviceSummary, [
    { label: "Services", value: summary.serviceCount },
    { label: "Active", value: summary.activeCount },
    { label: "Integrations", value: summary.integrationNeeded },
    { label: "Planned", value: summary.plannedCount }
  ]);

  const services = payload?.services || [];
  elements.serviceCards.innerHTML = services.length
    ? services.map((service) => `<article class="ops-card">
        <div class="ops-card-head">
          <h3>${service.name}</h3>
          <span class="pill ${service.status === "active" ? "tone-green" : service.status === "integration-needed" ? "tone-yellow" : "tone-blue"}">${service.status}</span>
        </div>
        <p>${service.description}</p>
        <div class="ops-meta-grid">
          <div><span>Category</span>${service.category}</div>
          <div><span>Owner</span>${service.owner}</div>
        </div>
        <div class="ops-chip-row">${service.connectedSystems.map((item) => `<span>${item}</span>`).join("")}</div>
      </article>`).join("")
    : `<article class="ops-card"><h3>No services loaded</h3><p>Service catalog will appear when the backend is available.</p></article>`;

  renderOpsActions(elements.serviceActions, payload?.actions || [], "Service actions will appear here.");
  updateNavBadges();
}

async function loadTools(forceRefresh = false) {
  if (!elements.toolSummary || !elements.toolCards || !elements.toolActions) {
    return;
  }

  try {
    const refreshParam = forceRefresh ? "?refresh=true" : "";
    const response = await fetch(apiUrl(`/mission/tools${refreshParam}`));
    if (!response.ok) {
      throw new Error(`Tools request failed with status ${response.status}`);
    }

    liveToolRegistry = await response.json();
    renderTools(liveToolRegistry);
  } catch {
    liveToolRegistry = null;
    renderTools(null);
  }
}

function renderTools(payload) {
  const summary = payload?.summary || { totalTools: 0, activeTools: 0, needsClassification: 0, revenueProducts: 0 };
  renderOpsSummary(elements.toolSummary, [
    { label: "Repos", value: summary.totalTools },
    { label: "Active", value: summary.activeTools },
    { label: "Unclassified", value: summary.needsClassification },
    { label: "Revenue Tools", value: summary.revenueProducts }
  ]);

  const tools = (payload?.tools || []).slice(0, 12);
  elements.toolCards.innerHTML = tools.length
    ? tools.map((tool) => `<article class="ops-card">
        <div class="ops-card-head">
          <h3>${tool.name}</h3>
          <span class="pill ${tool.category === "Unclassified" ? "tone-yellow" : "tone-green"}">${tool.category}</span>
        </div>
        <p>${tool.description}</p>
        <div class="ops-meta-grid">
          <div><span>Status</span>${tool.productStatus}</div>
          <div><span>Service</span>${tool.serviceId}</div>
          <div><span>Language</span>${tool.language}</div>
          <div><span>Health</span>${tool.health}</div>
        </div>
      </article>`).join("")
    : `<article class="ops-card"><h3>No GitHub tools loaded</h3><p>Add public repos or configure GITHUB_TOKEN to inventory private burchdad tools.</p></article>`;

  const actions = payload?.actions || [
    "Configure GITHUB_TOKEN for private repo inventory.",
    "Classify repos once imported.",
    "Connect tools to client services."
  ];
  renderOpsActions(elements.toolActions, actions, "Tool actions will appear here.");
  updateNavBadges();
}

async function loadWebHelpers(siteId = activeSiteId) {
  if (!elements.webHelperCards || !elements.webHelperRequests || !elements.webHelperSummary) {
    return;
  }

  try {
    const response = await fetch(apiUrl(`/mission/web-helpers?siteId=${encodeURIComponent(siteId || "")}`));
    if (!response.ok) {
      throw new Error(`Web helper request failed with status ${response.status}`);
    }

    const payload = await response.json();
    liveWebHelpers = payload.helpers || [];
    renderWebHelpers(payload);
  } catch {
    liveWebHelpers = [];
    renderWebHelpers(null);
  }
}

function renderWebHelpers(payload) {
  if (!elements.webHelperCards || !elements.webHelperRequests || !elements.webHelperSummary) {
    return;
  }

  const helpers = payload?.helpers || [];
  const summary = payload?.summary || {
    helperCount: 0,
    activeCount: 0,
    openRequests: 0,
    pendingApprovals: 0,
    templateReadyCount: 0
  };

  elements.webHelperSummary.innerHTML = `
    <article class="web-helper-stat">
      <span>Helpers</span>
      <strong>${summary.helperCount}</strong>
    </article>
    <article class="web-helper-stat">
      <span>Active</span>
      <strong>${summary.activeCount}</strong>
    </article>
    <article class="web-helper-stat">
      <span>Open Requests</span>
      <strong>${summary.openRequests}</strong>
    </article>
    <article class="web-helper-stat">
      <span>Approvals</span>
      <strong>${summary.pendingApprovals}</strong>
    </article>
    <article class="web-helper-stat">
      <span>Template Ready</span>
      <strong>${summary.templateReadyCount}</strong>
    </article>
  `;

  if (!helpers.length) {
    elements.webHelperCards.innerHTML = `
      <article class="web-helper-card">
        <div class="web-helper-card-head">
          <h3>No Web Helpers Configured</h3>
          <span class="pill tone-gray">Waiting</span>
        </div>
        <p>Add monitored sites or import Vercel projects to generate one web helper template per client site.</p>
      </article>
    `;
    elements.webHelperRequests.innerHTML = `
      <article class="web-helper-request">
        <h3>No requests yet</h3>
        <p>Client update requests will appear here after helper agents are created.</p>
      </article>
    `;
    updateNavBadges();
    return;
  }

  elements.webHelperCards.innerHTML = helpers
    .map((helper) => {
      const tone = helper.status === "active" ? "green" : helper.status === "needs-approval" ? "yellow" : "gray";
      return `<article class="web-helper-card">
        <div class="web-helper-card-head">
          <h3>${helper.clientName}</h3>
          <span class="pill ${toneClass[tone] ?? "tone-gray"}">${helper.statusLabel}</span>
        </div>
        <p class="web-helper-domain">${helper.websiteUrl}</p>
        <div class="web-helper-meta">
          <div><span>Agent</span>${helper.name}</div>
          <div><span>Autonomy</span>${helper.autonomyLevel}</div>
          <div><span>Plan</span>${helper.plan}</div>
          <div><span>Repo</span>${helper.repo || "Not connected"}</div>
          <div><span>Deployment</span>${helper.deployment}</div>
          <div><span>Last Deploy</span>${helper.lastDeploymentLabel}</div>
        </div>
        <div class="web-helper-scope">
          ${helper.scope.map((item) => `<span>${item}</span>`).join("")}
        </div>
      </article>`;
    })
    .join("");

  const requests = helpers.flatMap((helper) =>
    (helper.requests || []).map((request) => ({
      ...request,
      helperName: helper.name,
      clientName: helper.clientName
    }))
  );

  elements.webHelperRequests.innerHTML = requests.length
    ? requests
        .map((request) => `<article class="web-helper-request">
          <div class="web-helper-request-head">
            <h3>${request.title}</h3>
            <span class="exec-status ${request.approvalRequired ? "exec-retrying" : "exec-running"}">
              ${request.approvalRequired ? "approval" : "safe"}
            </span>
          </div>
          <p>${request.clientName} | ${request.helperName}</p>
          <p>${request.summary}</p>
          <p class="statline">Type: ${request.type} | Status: ${request.status} | SLA: ${request.sla}</p>
        </article>`)
        .join("")
    : `<article class="web-helper-request">
        <h3>Request Queue Clear</h3>
        <p>All client web helper queues are clear.</p>
      </article>`;

  updateNavBadges();
}

function renderSite(siteId) {
  const site = missionData.websites.find((entry) => entry.id === siteId) ?? missionData.websites[0] ?? getEmptySiteState();
  activeSiteId = site.id;
  setStatusBadge(site.status);
  renderKpis(site);
  renderMissionStrip(site);
  renderModules(site);
  renderAlerts(site);
  renderActivity(site);
  renderCrossSystemInsights(site);
  renderAgents(site);
  renderBuildQueue(site);
  loadWebHelpers(site.id);
}

async function runMissionCommand() {
  const input = elements.commandInput.value.trim();
  if (!input) {
    elements.commandResponse.textContent = "Enter a command to dispatch next-action intelligence.";
    return;
  }

  elements.commandSend.disabled = true;
  elements.commandResponse.textContent = "Dispatching command to mission backend...";

  try {
    const response = await fetch(apiUrl("/mission/command"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        command: input,
        siteId: elements.siteSelect.value
      })
    });

    if (!response.ok) {
      throw new Error(`Command failed with status ${response.status}`);
    }

    const plan = await response.json();
    activeCommandPlan = plan;
    commandMemory = plan.memory || commandMemory;
    const aiNote = plan.aiCopilot?.confidenceNote ? ` ${plan.aiCopilot.confidenceNote}` : "";
    elements.commandResponse.textContent = `${plan.summary}${aiNote}`;
    renderCommandPlan();
    renderCommandMemory();
    renderCollaborationFeed([]);
    startExecutionPolling();
    pollExecutionStatus();
  } catch (error) {
    stopExecutionPolling();
    elements.commandResponse.textContent =
      "Mission backend unavailable. Start the app with npm start to enable live command routing.";
    activeCommandPlan = {
      summary: "Command dispatch failed.",
      priority: "P1 Critical",
      category: "general",
      objective: "Restore backend command routing and retry the directive.",
      owners: ["Automation Supervisor"],
      rationale: [
        "Backend command route is currently unreachable.",
        "Execution cannot be started until service connectivity is restored."
      ],
      systemActions: [
        "Start the local mission server with npm start.",
        "Reload the dashboard from localhost:4173.",
        "Retry the command once the API is reachable."
      ],
      autoActions: [String(error.message || error)],
      expectedImpact: "Live command orchestration will resume after the backend is reachable.",
      execution: null
    };
    renderCommandPlan();
  } finally {
    elements.commandSend.disabled = false;
  }
}

async function init() {
  setupNavigation();
  await loadMissionSnapshot();
  renderWebsiteOptions();

  const initialSite = missionData.websites[0] || getEmptySiteState();
  elements.siteSelect.value = initialSite.id || "";
  renderSite(initialSite.id);
  renderCommandPlan();
  loadCommandMemory();
  loadClients();
  loadOnboarding();
  loadServices();
  loadTools();
  if (initialSite.id && initialSite.id !== "no-site") {
    loadAgentIntelligence(initialSite.id);
    loadPredictiveSignals(initialSite.id);
    loadStrategicGoals(initialSite.id);
    loadAutonomousGoals(initialSite.id);
    loadScenarioForecasts(initialSite.id);
  }
  renderCollaborationFeed([]);

  elements.siteSelect.addEventListener("change", (event) => {
    renderSite(event.target.value);
    loadAgentIntelligence(event.target.value);
    loadStrategicGoals(event.target.value);
    loadPredictiveSignals(event.target.value);
    loadAutonomousGoals(event.target.value);
    loadScenarioForecasts(event.target.value);
  });

  elements.commandSend.addEventListener("click", runMissionCommand);
  elements.commandInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      runMissionCommand();
    }
  });

  if (elements.clientOnboardForm) {
    elements.clientOnboardForm.addEventListener("submit", submitClientOnboarding);
  }

  elements.openClientModalButton?.addEventListener("click", openClientModal);
  elements.closeClientModalButton?.addEventListener("click", closeClientModal);
  elements.closeClientDetailButton?.addEventListener("click", closeClientDetail);
  elements.clientSearchInput?.addEventListener("input", () => renderClients(liveClients));
  elements.clientStageFilter?.addEventListener("change", () => renderClients(liveClients));
  elements.clientIssueFilter?.addEventListener("change", () => renderClients(liveClients));
  elements.clientsPanel?.addEventListener("click", (event) => {
    const detailTarget = event.target.closest("[data-client-detail]");
    if (!detailTarget) {
      return;
    }

    if (event.target.closest("a")) {
      return;
    }

    openClientDetail(detailTarget.dataset.clientDetail);
  });
  elements.clientOnboardModal?.addEventListener("click", (event) => {
    if (event.target === elements.clientOnboardModal) {
      closeClientModal();
    }
  });
  elements.onboardingPanel?.addEventListener("click", (event) => {
    const skipButton = event.target.closest("[data-onboarding-skip-client][data-onboarding-skip-item]");
    if (!skipButton) {
      return;
    }

    toggleOnboardingSkip(skipButton.dataset.onboardingSkipClient, skipButton.dataset.onboardingSkipItem);
  });

  setInterval(async () => {
    const previousSiteId = activeSiteId;
    await loadMissionSnapshot();
    renderWebsiteOptions();

    const nextSite = missionData.websites.find((site) => site.id === previousSiteId) || missionData.websites[0] || getEmptySiteState();
    elements.siteSelect.value = nextSite.id || "";
    renderSite(nextSite.id);
  }, 60_000);
}

init();
