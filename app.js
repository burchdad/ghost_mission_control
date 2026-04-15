const missionData = {
  websites: [
    {
      id: "ghost-ai-solutions",
      name: "Ghost AI Solutions",
      domain: "ghostai.solutions",
      status: "Action Needed",
      kpis: [
        { label: "Websites Monitored", value: 12, delta: "+2 this month" },
        { label: "Active Funnels", value: 9, delta: "2 under optimization" },
        { label: "Scrapers Running", value: 7, delta: "1 source degraded" },
        { label: "Posts Published Today", value: 18, delta: "+12% vs baseline" },
        { label: "Leads Captured Today", value: 23, delta: "4 high-intent" },
        { label: "SEO Issues Open", value: 14, delta: "3 critical" },
        { label: "Failed Jobs", value: 5, delta: "2 retries pending" },
        { label: "AI Agents Active", value: 11, delta: "2 idle unexpectedly" }
      ],
      missionStrip: {
        summary: "Minor warning trend detected in social API health and lead routing.",
        statuses: [
          { label: "All Systems Green", tone: "green" },
          { label: "Minor Warnings", tone: "yellow" },
          { label: "Action Needed", tone: "red" },
          { label: "Growth Opportunity Detected", tone: "blue" }
        ]
      },
      modules: [
        {
          name: "SEO Command",
          status: "At Risk",
          tone: "red",
          priority: "P1 Critical",
          priorityHeat: "critical",
          owner: "SEO Optimizer Agent",
          metrics: {
            "Pages Indexed": "314",
            "Issues Open": "14",
            "Keywords Dropping": "9",
            "Missing Metadata": "22"
          },
          revenue: {
            influenced: "$2,920",
            generated: "$980",
            pipeline: "$4,600"
          },
          ownership: {
            confidence: "88%",
            autonomy: "Guided",
            lastDecision: "Escalated missing schema pages for same-day patch",
            needsHuman: "Yes"
          },
          autoAction: {
            enabled: true,
            lastFix: "Generated fix task batch for 6 pages",
            escalation: "Required"
          }
        },
        {
          name: "AI Agents & Automations",
          status: "Active",
          tone: "violet",
          priority: "P1 Critical",
          priorityHeat: "critical",
          owner: "Automation Supervisor",
          metrics: {
            "Agents Active": "11",
            "Jobs Today": "142",
            "Success Rate": "96.2%",
            "Escalations": "4"
          },
          revenue: {
            influenced: "$7,800",
            generated: "$2,100",
            pipeline: "$12,400"
          },
          ownership: {
            confidence: "93%",
            autonomy: "Full",
            lastDecision: "Rerouted failed lead sync through backup webhook",
            needsHuman: "No"
          },
          autoAction: {
            enabled: true,
            lastFix: "Recovered CRM handoff via fallback queue",
            escalation: "Not Required"
          }
        },
        {
          name: "Lead Funnel Command",
          status: "Optimizing",
          tone: "yellow",
          priority: "P2 High Value",
          priorityHeat: "high",
          owner: "Funnel Monitor Agent",
          metrics: {
            "Live Funnels": "9",
            "Leads Today": "23",
            "Conversion Rate": "4.8%",
            "Drop-Off": "Step 2 CTA"
          },
          revenue: {
            influenced: "$3,640",
            generated: "$1,420",
            pipeline: "$9,200"
          },
          ownership: {
            confidence: "91%",
            autonomy: "Guided",
            lastDecision: "Activated CTA variant B for low-performing funnel step",
            needsHuman: "No"
          },
          autoAction: {
            enabled: true,
            lastFix: "Triggered A/B test on step 2 call-to-action",
            escalation: "Not Required"
          }
        },
        {
          name: "Content Scraping Command",
          status: "Scraping",
          tone: "blue",
          priority: "P2 High Value",
          priorityHeat: "high",
          owner: "Content Scraper Agent",
          metrics: {
            "Sources Active": "11",
            "Scraped Today": "36",
            "Failed Scrapes": "3",
            "Quality Score": "84/100"
          },
          revenue: {
            influenced: "$1,260",
            generated: "$320",
            pipeline: "$2,980"
          },
          ownership: {
            confidence: "92%",
            autonomy: "Full",
            lastDecision: "Rejected low-quality source cluster B",
            needsHuman: "No"
          },
          autoAction: {
            enabled: true,
            lastFix: "Auto-switched from timeout source to backup feed",
            escalation: "Not Required"
          }
        },
        {
          name: "Marketing Command",
          status: "Optimizing",
          tone: "yellow",
          priority: "P2 High Value",
          priorityHeat: "growth",
          owner: "Campaign Orchestrator",
          metrics: {
            "Active Campaigns": "6",
            "Top Offer": "AI Website Audit",
            "Acquisition Cost": "$21.60",
            "Revenue Influenced": "$6,420"
          },
          revenue: {
            influenced: "$6,420",
            generated: "$2,870",
            pipeline: "$11,200"
          },
          ownership: {
            confidence: "86%",
            autonomy: "Guided",
            lastDecision: "Paused underperforming ad group and reallocated budget",
            needsHuman: "Yes"
          },
          autoAction: {
            enabled: true,
            lastFix: "Shifted 15% spend toward highest converting campaign",
            escalation: "Review Suggested"
          }
        },
        {
          name: "Social Posting Command",
          status: "Scheduled",
          tone: "green",
          priority: "P3 Important",
          priorityHeat: "monitor",
          owner: "Social Publisher Agent",
          metrics: {
            "Posts Today": "18",
            "Failed Publishes": "2",
            "Engagement Rate": "3.9%",
            "Queue Size": "27"
          },
          revenue: {
            influenced: "$1,880",
            generated: "$540",
            pipeline: "$3,120"
          },
          ownership: {
            confidence: "90%",
            autonomy: "Guided",
            lastDecision: "Rescheduled two posts after token refresh failure",
            needsHuman: "No"
          },
          autoAction: {
            enabled: true,
            lastFix: "Retried LinkedIn publish after auth refresh",
            escalation: "Not Required"
          }
        }
      ],
      crossInsights: [
        {
          title: "SEO drag impacting funnel traffic",
          detail: "Ranking losses on two service pages correlate with a 14% visit drop at funnel entry."
        },
        {
          title: "Top content driving lead quality",
          detail: "One AI automation article generated 60% of high-intent form completions today."
        },
        {
          title: "Campaign tuning improved scrape relevance",
          detail: "Audience shift toward operations terms increased useful content match score by 11%."
        }
      ],
      alerts: [
        {
          title: "Social API token expired",
          detail: "LinkedIn publisher failed twice in 30 minutes.",
          tone: "red"
        },
        {
          title: "Lead routing warning",
          detail: "3 form submissions did not sync to CRM.",
          tone: "yellow"
        },
        {
          title: "SEO ranking dip",
          detail: "Target page dropped 4 positions for primary keyword.",
          tone: "yellow"
        },
        {
          title: "Scraper retries in progress",
          detail: "Source cluster B had 3 timeout failures.",
          tone: "blue"
        }
      ],
      activityFeed: [
        {
          title: "Content Summarizer completed",
          detail: "14 source articles summarized and tagged for review.",
          time: "12 minutes ago"
        },
        {
          title: "Funnel test variant launched",
          detail: "New CTA copy activated for audit funnel step 2.",
          time: "24 minutes ago"
        },
        {
          title: "SEO issue escalated",
          detail: "Missing schema on /services/ai-automation marked P1.",
          time: "38 minutes ago"
        },
        {
          title: "Campaign click anomaly",
          detail: "CTR down 11% on one paid source cohort.",
          time: "1 hour ago"
        }
      ],
      agents: [
        {
          name: "Content Scraper Agent",
          status: "Active",
          tone: "green",
          statline: "98% success rate | 36 tasks today",
          rank: 1,
          trend: "Up",
          efficiency: "94%"
        },
        {
          name: "SEO Optimizer Agent",
          status: "Active",
          tone: "violet",
          statline: "9 recommendations generated",
          rank: 2,
          trend: "Steady",
          efficiency: "89%"
        },
        {
          name: "Alerting Agent",
          status: "Active",
          tone: "blue",
          statline: "12 alerts triaged in last 2 hours",
          rank: 3,
          trend: "Up",
          efficiency: "87%"
        },
        {
          name: "Lead Router Agent",
          status: "Error",
          tone: "red",
          statline: "3 failed handoffs | escalation flagged",
          rank: 4,
          trend: "Down",
          efficiency: "62%"
        }
      ],
      buildQueue: {
        "Idea Backlog": [
          "Competitor intelligence scanner",
          "Reputation management module"
        ],
        "Ready to Build": [
          "Lead recovery agent",
          "Backlink prospecting engine"
        ],
        Building: ["Local SEO heatmap module"],
        Testing: ["Content repurposing engine"],
        Live: ["LinkedIn social publisher"],
        Archived: ["Legacy feed parser"]
      }
    },
    {
      id: "client-alpha",
      name: "Client Alpha Retail",
      domain: "alpha-retail.com",
      status: "Minor Warnings",
      kpis: [
        { label: "Websites Monitored", value: 1, delta: "Single domain profile" },
        { label: "Active Funnels", value: 3, delta: "1 in testing" },
        { label: "Scrapers Running", value: 2, delta: "Healthy" },
        { label: "Posts Published Today", value: 6, delta: "On schedule" },
        { label: "Leads Captured Today", value: 12, delta: "+8% vs weekly average" },
        { label: "SEO Issues Open", value: 4, delta: "No critical issues" },
        { label: "Failed Jobs", value: 1, delta: "Auto-retry enabled" },
        { label: "AI Agents Active", value: 5, delta: "All expected agents online" }
      ],
      missionStrip: {
        summary: "Healthy operation with mild caution in campaign cost efficiency.",
        statuses: [
          { label: "All Systems Green", tone: "green" },
          { label: "Minor Warnings", tone: "yellow" },
          { label: "Growth Opportunity Detected", tone: "blue" }
        ]
      },
      modules: [
        {
          name: "Lead Funnel Command",
          status: "Live",
          tone: "green",
          priority: "P2 High Value",
          priorityHeat: "high",
          owner: "Funnel Monitor Agent",
          metrics: {
            "Live Funnels": "3",
            "Leads Today": "12",
            "Conversion Rate": "6.1%",
            "Appointments": "5"
          },
          revenue: {
            influenced: "$2,140",
            generated: "$1,120",
            pipeline: "$3,780"
          },
          ownership: {
            confidence: "94%",
            autonomy: "Full",
            lastDecision: "Promoted top funnel to primary traffic route",
            needsHuman: "No"
          },
          autoAction: {
            enabled: true,
            lastFix: "Adjusted follow-up timing after drop-off signal",
            escalation: "Not Required"
          }
        },
        {
          name: "SEO Command",
          status: "Needs Optimization",
          tone: "yellow",
          priority: "P3 Important",
          priorityHeat: "growth",
          owner: "SEO Optimizer Agent",
          metrics: {
            "Pages Indexed": "94",
            "Issues Open": "4",
            "Improving Keywords": "15",
            "Dropping Keywords": "2"
          },
          revenue: {
            influenced: "$1,280",
            generated: "$430",
            pipeline: "$2,260"
          },
          ownership: {
            confidence: "87%",
            autonomy: "Guided",
            lastDecision: "Scheduled metadata refresh for product pages",
            needsHuman: "No"
          },
          autoAction: {
            enabled: true,
            lastFix: "Generated optimization checklist from page audit",
            escalation: "Not Required"
          }
        },
        {
          name: "Social Posting Command",
          status: "Posted",
          tone: "green",
          priority: "P3 Important",
          priorityHeat: "monitor",
          owner: "Social Publisher Agent",
          metrics: {
            "Posts Today": "6",
            "Queue Size": "8",
            Engagement: "4.2%",
            Failed: "0"
          },
          revenue: {
            influenced: "$920",
            generated: "$210",
            pipeline: "$1,640"
          },
          ownership: {
            confidence: "92%",
            autonomy: "Full",
            lastDecision: "Prioritized testimonial content for evening post window",
            needsHuman: "No"
          },
          autoAction: {
            enabled: true,
            lastFix: "Auto-rescheduled one post to highest engagement slot",
            escalation: "Not Required"
          }
        }
      ],
      crossInsights: [
        {
          title: "Funnel momentum from social proof posts",
          detail: "Testimonial sequence lifted landing page conversions by 0.9 points."
        },
        {
          title: "SEO improvements reinforcing remarketing",
          detail: "Metadata cleanup improved quality score for branded campaigns."
        }
      ],
      alerts: [
        {
          title: "Campaign CPL drift",
          detail: "Acquisition cost rose 9% in last 48 hours.",
          tone: "yellow"
        },
        {
          title: "Webhook retry",
          detail: "One lead webhook retried successfully.",
          tone: "blue"
        }
      ],
      activityFeed: [
        {
          title: "Offer test published",
          detail: "Spring campaign variation B went live.",
          time: "31 minutes ago"
        },
        {
          title: "SEO metadata patched",
          detail: "Updated titles on 6 high-traffic pages.",
          time: "2 hours ago"
        }
      ],
      agents: [
        {
          name: "Funnel Monitor Agent",
          status: "Active",
          tone: "green",
          statline: "3 funnels tracked | no outages",
          rank: 1,
          trend: "Up",
          efficiency: "93%"
        },
        {
          name: "CRM Sync Agent",
          status: "Active",
          tone: "blue",
          statline: "100% sync for last 24h",
          rank: 2,
          trend: "Steady",
          efficiency: "91%"
        }
      ],
      buildQueue: {
        "Idea Backlog": ["Conversion anomaly detector"],
        "Ready to Build": ["Review sentiment parser"],
        Building: ["Cart abandonment agent"],
        Testing: [],
        Live: ["Email follow-up chain"]
      }
    }
  ]
};

const runtimeApiBase = (() => {
  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.get("apiBase");

  if (fromQuery) {
    localStorage.setItem("ghost_api_base_url", fromQuery);
  }

  const fromStorage = localStorage.getItem("ghost_api_base_url") || "";
  const fromWindow = typeof window.GHOST_API_BASE_URL === "string" ? window.GHOST_API_BASE_URL : "";

  return (fromQuery || fromStorage || fromWindow || "").trim().replace(/\/+$/, "");
})();

function apiUrl(path) {
  return runtimeApiBase ? `${runtimeApiBase}${path}` : path;
}

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
  navBadgeAgents: document.getElementById("navBadgeAgents"),
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
  operationsPanel: document.getElementById("operationsPanel"),
  buildQueuePanel: document.getElementById("buildQueuePanel"),
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
let liveAgentIntelligence = [];
let livePredictiveSignals = [];
let liveAutonomousGoals = [];
let activeSiteId = missionData.websites[0]?.id || "";

function getActiveSite() {
  return missionData.websites.find((entry) => entry.id === activeSiteId) ?? missionData.websites[0];
}

let executionPollTimer = null;
let activeView = "mission-control";
let activeExecutionSubview = "overview";
let activeAgentsSubview = "rankings";
let isFocusMode = false;
let paletteSelectionIndex = 0;
let currentPaletteActions = [];
const badgeCounts = {
  execution: null,
  agents: null,
  intelligence: null,
  autonomy: null
};

const storageKeys = {
  executionSubview: "ghostMissionControl.executionSubview",
  agentsSubview: "ghostMissionControl.agentsSubview",
  focusMode: "ghostMissionControl.focusMode"
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
    "predictivePanel",
    "crossSystemPanel",
    "activityPanel"
  ],
  execution: [
    "commandPlanPanel",
    "commandMemoryPanel",
    "activityPanel",
    "agentCollabPanel"
  ],
  agents: ["agentsPanel", "agentCollabPanel", "activityPanel"],
  intelligence: ["predictivePanel", "crossSystemPanel", "alertsPanel", "activityPanel"],
  strategy: ["strategicPanel", "commandPlanPanel", "commandMemoryPanel"],
  simulation: ["scenarioPanel", "strategicPanel", "predictivePanel"],
  autonomy: ["autonomyPanel", "scenarioPanel", "strategicPanel"],
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
    "buildQueuePanel",
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

  renderFocusBanner();
}

function setupNavigation() {
  restoreSubviewPreferences();

  const storedFocusMode = loadStoredValue(storageKeys.focusMode);
  isFocusMode = storedFocusMode === "1";

  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const selectedView = item.dataset.view;
      setActiveView(selectedView);

      if (selectedView === "mission-control") {
        setFocusMode(false);
      } else {
        setFocusMode(true, selectedView);
      }
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

function getViewLabel(view) {
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
  const setView = (view, focus = false) => ({
    id: `view-${view}`,
    label: `Open ${getViewLabel(view)} view`,
    hint: focus ? "workspace takeover" : "view switch",
    keywords: `${view} switch open`,
    run: () => {
      setActiveView(view);
      setFocusMode(focus, view);
    }
  });

  return [
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
    if (!paletteOpen) {
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
  const execution = getExecutionBadgeMeta(activeCommandPlan.execution?.actions || []);
  const agents = getAgentsBadgeMeta(liveAgentIntelligence);
  const intelligence = getIntelligenceBadgeMeta(livePredictiveSignals);
  const autonomy = getAutonomyBadgeMeta(liveAutonomousGoals);

  setBadge(elements.navBadgeExecution, "execution", execution);
  setBadge(elements.navBadgeAgents, "agents", agents);
  setBadge(elements.navBadgeIntelligence, "intelligence", intelligence);
  setBadge(elements.navBadgeAutonomy, "autonomy", autonomy);
  updateCorrelationHint(execution, agents, intelligence, autonomy);
  updateContextualAwareness(execution, agents, intelligence, autonomy);
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
  const byName = new Map(liveAgentIntelligence.map((entry) => [entry.name, entry]));
  const mergedAgents = site.agents.map((agent) => {
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

  const columns = preferredOrder.filter((name) =>
    Object.prototype.hasOwnProperty.call(site.buildQueue, name)
  );

  elements.buildQueueColumns.innerHTML = columns
    .map((name) => {
      const items = site.buildQueue[name];
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

function renderSite(siteId) {
  const site = missionData.websites.find((entry) => entry.id === siteId) ?? missionData.websites[0];
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
    elements.commandResponse.textContent = plan.summary;
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

function init() {
  setupNavigation();
  renderWebsiteOptions();

  const initialSite = missionData.websites[0];
  elements.siteSelect.value = initialSite.id;
  renderSite(initialSite.id);
  renderCommandPlan();
  loadCommandMemory();
  loadAgentIntelligence(initialSite.id);
  loadPredictiveSignals(initialSite.id);
  loadStrategicGoals(initialSite.id);
  loadAutonomousGoals(initialSite.id);
  loadScenarioForecasts(initialSite.id);
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
}

init();
