let missionData = { websites: [] };
let draftedAgentBuilds = [];
let currentRecommendedAgents = [];
let webHelperPollTimer = null;
let webHelperTicketStageMemory = new Map();
let webHelperToastHost = null;
const configuredApiBase = normalizeApiBase(window.GHOST_API_BASE_URL);
const API_BASE_URL = configuredApiBase && !configuredApiBase.includes("__GHOST_API_BASE_URL__") ? configuredApiBase : "";
const toneClass = {
  green: "tone-green",
  yellow: "tone-yellow",
  red: "tone-red",
  blue: "tone-blue",
  violet: "tone-violet",
  gray: "tone-gray"
};

function normalizeApiBase(value) {
  const trimmedValue = String(value || "").trim().replace(/\/+$/, "");
  if (!trimmedValue || trimmedValue.includes("__GHOST_API_BASE_URL__")) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

function apiUrl(path) {
  const normalizedPath = String(path || "").startsWith("/") ? String(path || "") : `/${path || ""}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

const elements = {
  body: document.body,
  topbarPanel: document.getElementById("topbarPanel"),
  missionStrip: document.getElementById("missionStrip"),
  siteSelect: document.getElementById("siteSelect"),
  globalStatusBadge: document.getElementById("globalStatusBadge"),
  commandInput: document.getElementById("commandInput"),
  commandSend: document.getElementById("commandSend"),
  commandResponse: document.getElementById("commandResponse"),
  executionCommandInput: document.getElementById("executionCommandInput"),
  executionCommandSend: document.getElementById("executionCommandSend"),
  executionCommandResponse: document.getElementById("executionCommandResponse"),
  executionSummary: document.getElementById("executionSummary"),
  executionBoard: document.getElementById("executionBoard"),
  executionActions: document.getElementById("executionActions"),
  commandPlan: document.getElementById("commandPlan"),
  commandMemory: document.getElementById("commandMemory"),
  kpiSection: document.getElementById("kpiSection"),
  missionSummary: document.getElementById("missionSummary"),
  missionStatuses: document.getElementById("missionStatuses"),
  cockpitPanel: document.getElementById("cockpitPanel"),
  cockpitBoard: document.getElementById("cockpitBoard"),
  moduleCards: document.getElementById("moduleCards"),
  alertList: document.getElementById("alertList"),
  perceptionPanel: document.getElementById("perceptionPanel"),
  nextBestAction: document.getElementById("nextBestAction"),
  trustExplanation: document.getElementById("trustExplanation"),
  activityFeed: document.getElementById("activityFeed"),
  crossSystemInsights: document.getElementById("crossSystemInsights"),
  intelligenceSummary: document.getElementById("intelligenceSummary"),
  intelligenceBoard: document.getElementById("intelligenceBoard"),
  strategySummary: document.getElementById("strategySummary"),
  strategyBoard: document.getElementById("strategyBoard"),
  agentSnapshot: document.getElementById("agentSnapshot"),
  agentOpsSummary: document.getElementById("agentOpsSummary"),
  agentOpsBoard: document.getElementById("agentOpsBoard"),
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
  editClientDetailButton: document.getElementById("editClientDetailButton"),
  clientDetailTitle: document.getElementById("clientDetailTitle"),
  clientDetailSubtitle: document.getElementById("clientDetailSubtitle"),
  clientDetailContent: document.getElementById("clientDetailContent"),
  openClientModalButton: document.getElementById("openClientModalButton"),
  startOnboardingButton: document.getElementById("startOnboardingButton"),
  closeClientModalButton: document.getElementById("closeClientModalButton"),
  clientOnboardModal: document.getElementById("clientOnboardModal"),
  leadNotificationModal: document.getElementById("leadNotificationModal"),
  leadNotificationTitle: document.getElementById("leadNotificationTitle"),
  leadNotificationSubtitle: document.getElementById("leadNotificationSubtitle"),
  leadNotificationContent: document.getElementById("leadNotificationContent"),
  closeLeadNotificationButton: document.getElementById("closeLeadNotificationButton"),
  clientDataHealthModal: document.getElementById("clientDataHealthModal"),
  clientDataHealthTitle: document.getElementById("clientDataHealthTitle"),
  clientDataHealthContent: document.getElementById("clientDataHealthContent"),
  closeClientDataHealthButton: document.getElementById("closeClientDataHealthButton"),
  clientModalTitle: document.getElementById("clientModalTitle"),
  clientModalSubtitle: document.getElementById("clientModalSubtitle"),
  clientOnboardForm: document.getElementById("clientOnboardForm"),
  clientEditIdInput: document.getElementById("clientEditIdInput"),
  clientNameInput: document.getElementById("clientNameInput"),
  clientStageInput: document.getElementById("clientStageInput"),
  clientLeadSourceInput: document.getElementById("clientLeadSourceInput"),
  clientLeadSourceDetailInput: document.getElementById("clientLeadSourceDetailInput"),
  clientLeadStageInput: document.getElementById("clientLeadStageInput"),
  clientRelationshipInput: document.getElementById("clientRelationshipInput"),
  clientPricingTierInput: document.getElementById("clientPricingTierInput"),
  clientWebsiteInput: document.getElementById("clientWebsiteInput"),
  clientRepoInput: document.getElementById("clientRepoInput"),
  clientRailwayInput: document.getElementById("clientRailwayInput"),
  clientVercelInput: document.getElementById("clientVercelInput"),
  clientMobileAppInput: document.getElementById("clientMobileAppInput"),
  clientGoogleBusinessInput: document.getElementById("clientGoogleBusinessInput"),
  clientSocialsInput: document.getElementById("clientSocialsInput"),
  clientProposalSentInput: document.getElementById("clientProposalSentInput"),
  clientDepositInvoiceSentInput: document.getElementById("clientDepositInvoiceSentInput"),
  clientProposalInput: document.getElementById("clientProposalInput"),
  clientDepositInput: document.getElementById("clientDepositInput"),
  clientFinalPaymentInput: document.getElementById("clientFinalPaymentInput"),
  clientPartnershipInput: document.getElementById("clientPartnershipInput"),
  clientFinalDomainInput: document.getElementById("clientFinalDomainInput"),
  clientDetailsPendingInput: document.getElementById("clientDetailsPendingInput"),
  clientBusinessEmailInput: document.getElementById("clientBusinessEmailInput"),
  clientBusinessPhoneInput: document.getElementById("clientBusinessPhoneInput"),
  clientPlanInput: document.getElementById("clientPlanInput"),
  clientServicesInput: document.getElementById("clientServicesInput"),
  clientContactInput: document.getElementById("clientContactInput"),
  clientNotesInput: document.getElementById("clientNotesInput"),
  clientArchiveButton: document.getElementById("clientArchiveButton"),
  clientDeleteButton: document.getElementById("clientDeleteButton"),
  clientSubmitButton: document.getElementById("clientSubmitButton"),
  clientFormResponse: document.getElementById("clientFormResponse"),
  agentBuildModal: document.getElementById("agentBuildModal"),
  closeAgentBuildModalButton: document.getElementById("closeAgentBuildModalButton"),
  agentBuildForm: document.getElementById("agentBuildForm"),
  agentBuildNameInput: document.getElementById("agentBuildNameInput"),
  agentBuildServiceInput: document.getElementById("agentBuildServiceInput"),
  agentBuildPriorityInput: document.getElementById("agentBuildPriorityInput"),
  agentBuildTargetInput: document.getElementById("agentBuildTargetInput"),
  agentBuildPurposeInput: document.getElementById("agentBuildPurposeInput"),
  agentBuildPrerequisitesInput: document.getElementById("agentBuildPrerequisitesInput"),
  agentBuildPromptInput: document.getElementById("agentBuildPromptInput"),
  copyAgentBuildPromptButton: document.getElementById("copyAgentBuildPromptButton"),
  agentBuildResponse: document.getElementById("agentBuildResponse"),
  onboardingSummary: document.getElementById("onboardingSummary"),
  onboardingSearchInput: document.getElementById("onboardingSearchInput"),
  onboardingBucketFilter: document.getElementById("onboardingBucketFilter"),
  onboardingStatusFilter: document.getElementById("onboardingStatusFilter"),
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
  webHelperSearchInput: document.getElementById("webHelperSearchInput"),
  webHelperStatusFilter: document.getElementById("webHelperStatusFilter"),
  webHelperPriorityFilter: document.getElementById("webHelperPriorityFilter"),
  webHelperApprovalFilter: document.getElementById("webHelperApprovalFilter"),
  webHelperCards: document.getElementById("webHelperCards"),
  webHelperRequests: document.getElementById("webHelperRequests"),
  webHelperTicketModal: document.getElementById("webHelperTicketModal"),
  closeWebHelperTicketButton: document.getElementById("closeWebHelperTicketButton"),
  webHelperTicketTitle: document.getElementById("webHelperTicketTitle"),
  webHelperTicketSubtitle: document.getElementById("webHelperTicketSubtitle"),
  webHelperTicketContent: document.getElementById("webHelperTicketContent"),
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
  executionPanel: document.getElementById("executionPanel"),
  executionActionsPanel: document.getElementById("executionActionsPanel"),
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
  intelligencePanel: document.getElementById("intelligencePanel"),
  strategyPanel: document.getElementById("strategyPanel"),
  agentsPanel: document.getElementById("agentsPanel"),
  agentOpsPanel: document.getElementById("agentOpsPanel"),
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
let editingClientId = "";
let selectedLeadNotificationId = "";
let draggingClientId = "";
let lastClientDragAt = 0;
let draggingLeadId = "";
let lastLeadDragAt = 0;
let liveAgentIntelligence = [];
let liveWebHelpers = [];
let currentWebHelperTickets = [];
let liveOnboarding = null;
let liveServiceCatalog = null;
let liveToolRegistry = null;
let livePredictiveSignals = [];
let liveStrategicPlan = null;
let liveAutonomousGoals = [];
let liveClientDataHealth = null;
let activeSiteId = "";

const clientPipelineStages = [
  { id: "lead", label: "Lead" },
  { id: "deposit-paid", label: "Deposit Paid" },
  { id: "website-build", label: "Website Build" },
  { id: "client-review", label: "Client Review" },
  { id: "final-payment", label: "Final Payment" },
  { id: "launch-handoff", label: "Web Helper Handoff" },
  { id: "completed-archived", label: "Completed / Archived" },
  { id: "web-helper-care", label: "Web Helper Care" },
  { id: "growth-services", label: "Growth Services" },
  { id: "paused-archived", label: "Paused / Archived" }
];

const webClientPipelineStages = [
  "deposit-paid",
  "website-build",
  "client-review",
  "final-payment",
  "launch-handoff",
  "completed-archived"
].map((stageId) => clientPipelineStages.find((stage) => stage.id === stageId)).filter(Boolean);

const leadSourceDefinitions = [
  {
    id: "social-media",
    label: "Social Media",
    detail: "Facebook, Instagram, TikTok, LinkedIn, or messenger conversations.",
    status: "active"
  },
  {
    id: "referral",
    label: "Referral",
    detail: "Client, partner, family, or local word-of-mouth referral.",
    status: "active"
  },
  {
    id: "lead-command-center",
    label: "Ghost Lead Command",
    detail: "burchdad/ghost-lead-command routed lead.",
    status: "integration-ready"
  },
  {
    id: "digital-business-card",
    label: "Digital Business Card",
    detail: "QR, card, profile link, or direct booking path.",
    status: "integration-ready"
  },
  {
    id: "email",
    label: "Email",
    detail: "Direct email, reply thread, or inbox lead.",
    status: "active"
  },
  {
    id: "ai-outreach",
    label: "AI Outreach",
    detail: "Future outbound AI outreach and follow-up campaigns.",
    status: "planned"
  },
  {
    id: "other",
    label: "Other / Manual",
    detail: "Manual entry or source not classified yet.",
    status: "manual"
  }
];

const leadDeskColumns = [
  { id: "new-lead", label: "New Lead", helper: "Inquiry captured, needs discovery and proposal prep." },
  { id: "contacted-discovery", label: "Contacted / Discovery", helper: "Phone, Messenger, or email discussion is active." },
  { id: "proposal-sent", label: "Proposal + Invoice Sent", helper: "Waiting on agreement response." },
  { id: "agreement-returned", label: "Agreement Returned", helper: "Waiting on deposit payment." },
  { id: "deposit-paid", label: "Closed Leads / Build Queue", helper: "Won leads queued into the Web Clients build pipeline." },
  { id: "lost-not-now", label: "Lost / Not Now", helper: "Paused, archived, or not ready yet." }
];

const closedLeadClientStages = clientPipelineStages
  .map((stage) => stage.id)
  .filter((stageId) => stageId !== "lead" && stageId !== "paused-archived");

function getLeadSourceDefinition(sourceId) {
  return leadSourceDefinitions.find((source) => source.id === sourceId) || null;
}

function getLeadSourceLabel(client) {
  return getLeadSourceDefinition(client?.leadSource)?.label || "Source pending";
}

function getLeadSourceTone(sourceId) {
  const status = getLeadSourceDefinition(sourceId)?.status || "missing";
  if (status === "active") {
    return "tone-green";
  }
  if (status === "planned") {
    return "tone-blue";
  }
  if (status === "integration-ready") {
    return "tone-yellow";
  }
  return "tone-gray";
}

function normalizeLeadStageForUi(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (!normalized) {
    return "";
  }

  const aliases = {
    contacted: "contacted-discovery",
    discovery: "contacted-discovery",
    "proposal": "proposal-sent",
    "proposal-invoice-sent": "proposal-sent",
    "agreement": "agreement-returned",
    "agreement-back": "agreement-returned",
    "deposit": "deposit-paid",
    "build-queue": "deposit-paid",
    lost: "lost-not-now",
    paused: "lost-not-now",
    archived: "lost-not-now"
  };
  const mapped = aliases[normalized] || normalized;
  return leadDeskColumns.some((column) => column.id === mapped) ? mapped : "";
}

function deriveLeadStage(client) {
  const explicit = normalizeLeadStageForUi(client?.leadStage || client?.lead_stage);
  const stage = getClientStage(client);
  if (closedLeadClientStages.includes(stage)) {
    return "deposit-paid";
  }

  if (stage === "paused-archived") {
    return explicit === "lost-not-now" ? "lost-not-now" : "";
  }

  if (stage !== "lead") {
    return "";
  }

  if (explicit) {
    return explicit;
  }

  if (client?.proposalSigned) {
    return "agreement-returned";
  }
  if (client?.proposalSent || client?.depositInvoiceSent) {
    return "proposal-sent";
  }
  if (client?.contact || client?.businessEmail || client?.businessPhone || client?.notes) {
    return "contacted-discovery";
  }
  return "new-lead";
}

function isLeadDeskClient(client) {
  return Boolean(deriveLeadStage(client));
}

function getLeadStageLabel(stageId) {
  return leadDeskColumns.find((column) => column.id === stageId)?.label || "New Lead";
}

const clientRelationshipDefinitions = {
  client: { label: "Client", pricingTier: "standard" },
  partner: { label: "Partner", pricingTier: "partner" },
  internal: { label: "Internal / owned", pricingTier: "internal" },
  prospect: { label: "Prospect", pricingTier: "standard" }
};

function normalizeClientRelationship(value) {
  const relationship = String(value || "").trim().toLowerCase();
  return clientRelationshipDefinitions[relationship] ? relationship : "client";
}

function normalizeClientPricingTier(value, relationshipType = "client") {
  const tier = String(value || "").trim().toLowerCase();
  if (["standard", "partner", "custom", "internal"].includes(tier)) {
    return tier;
  }
  return clientRelationshipDefinitions[normalizeClientRelationship(relationshipType)]?.pricingTier || "standard";
}

function getClientRelationshipLabel(client) {
  return clientRelationshipDefinitions[normalizeClientRelationship(client?.relationshipType)]?.label || "Client";
}

const clientServiceDefinitions = {
  "website-build": {
    label: "Website Build",
    category: "Web",
    agreement: "Website build proposal agreement",
    system: "GitHub + Vercel",
    pipeline: "web-delivery",
    pricing: {
      client: "$1,500-$4,500 project",
      partner: "Partner scope / rev share"
    }
  },
  "web-helper-care": {
    label: "Web Helper Care",
    category: "Care",
    agreement: "Maintenance / Web Helper care contract",
    system: "Web Helper Agent",
    pipeline: "web-care",
    pricing: {
      client: "$149-$499/mo",
      partner: "Partner care allocation"
    }
  },
  "search-intelligence": {
    label: "SEO / AEO / GEO",
    category: "Growth",
    agreement: "SEO integration contract",
    system: "geo.ghostai.solutions",
    pipeline: "seo-geo",
    pricing: {
      client: "$500-$1,500/mo",
      partner: "Partner growth allocation"
    }
  },
  "local-service": {
    label: "Local Service Growth",
    category: "Growth",
    agreement: "Local SEO integration contract",
    system: "GBP + GEO + Web Helper",
    pipeline: "seo-geo",
    pricing: {
      client: "$350-$1,200/mo",
      partner: "Partner local growth allocation"
    }
  },
  "lead-funnel": {
    label: "Lead Funnel",
    category: "Growth",
    agreement: "Lead generation / funnel contract",
    system: "Ghost Lead Command + GhostCRM",
    pipeline: "automations",
    pricing: {
      client: "$750-$2,500/mo",
      partner: "Partner lead-share motion"
    }
  },
  "software-tool": {
    label: "Software Tool",
    category: "Software",
    agreement: "Software build / automation contract",
    system: "Tool registry + deployment map",
    pipeline: "automations",
    pricing: {
      client: "Custom project",
      partner: "Partner build allocation"
    }
  },
  "ai-automation": {
    label: "AI Automation",
    category: "Automation",
    agreement: "AI workflow / agent automation contract",
    system: "Lead Command + GhostCRM + Slack approvals",
    pipeline: "automations",
    pricing: {
      client: "$500-$2,000/mo",
      partner: "Partner automation allocation"
    }
  },
  ecommerce: {
    label: "Ecommerce",
    category: "Commerce",
    agreement: "Ecommerce operations contract",
    system: "Storefront + payments",
    pipeline: "commerce",
    pricing: {
      client: "$500-$2,500/mo",
      partner: "Partner store allocation"
    }
  },
  "content-social": {
    label: "Content + Social",
    category: "Social",
    agreement: "Social/content management contract",
    system: "Content operator + social pages",
    pipeline: "social",
    pricing: {
      client: "$399-$1,500/mo",
      partner: "Partner content allocation"
    }
  },
  "paid-ads": {
    label: "Paid Ads",
    category: "Ads",
    agreement: "Ads management contract",
    system: "Meta Ads + Google Ads + reporting",
    pipeline: "ads",
    pricing: {
      client: "10%-15% of ad spend",
      partner: "Partner ad ops allocation"
    }
  },
  "mobile-app": {
    label: "Mobile App",
    category: "Mobile",
    agreement: "Mobile app build contract",
    system: "App build queue + stores",
    pipeline: "mobile-apps",
    pricing: {
      client: "Custom project",
      partner: "Partner build allocation"
    }
  },
  reporting: {
    label: "Client Reporting",
    category: "Reporting",
    agreement: "Reporting / analytics scope",
    system: "Mission Control + client reports",
    pipeline: "web-care",
    pricing: {
      client: "$99-$399/mo",
      partner: "Included in partner ops"
    }
  }
};

const servicePipelineDefinitions = [
  {
    id: "web-care",
    label: "Web Helper Care",
    description: "Live site maintenance, approved changes, health checks, and client request handling.",
    system: "Web Helper Agents",
    serviceKeys: ["web-helper-care"],
    stages: [
      { id: "handoff", label: "Handoff" },
      { id: "memory-build", label: "Memory Build" },
      { id: "active-care", label: "Active Care" }
    ]
  },
  {
    id: "seo-geo",
    label: "SEO / AEO / GEO",
    description: "Search visibility, AI answer presence, local authority, competitor analysis, and GEO action queues.",
    system: "geo.ghostai.solutions",
    serviceKeys: ["search-intelligence", "local-service"],
    stages: [
      { id: "eligible", label: "Eligible" },
      { id: "audit-needed", label: "Audit Needed" },
      { id: "strategy", label: "Strategy" },
      { id: "approval", label: "Contract" },
      { id: "active", label: "Active" },
      { id: "reporting", label: "Reporting" }
    ]
  },
  {
    id: "social",
    label: "Social Management",
    description: "Social page access, content calendar, posting approvals, reputation responses, and campaign support.",
    system: "Social pages + content operator",
    serviceKeys: ["content-social"],
    stages: [
      { id: "candidate", label: "Candidate" },
      { id: "access", label: "Access" },
      { id: "calendar", label: "Calendar" },
      { id: "approval", label: "Approval" },
      { id: "publishing", label: "Publishing" },
      { id: "reporting", label: "Reporting" }
    ]
  },
  {
    id: "ads",
    label: "Paid Ads",
    description: "Ad account access, tracking, offer alignment, campaign launch, optimization, and reporting.",
    system: "Meta Ads + Google Ads",
    serviceKeys: ["paid-ads"],
    stages: [
      { id: "candidate", label: "Candidate" },
      { id: "access", label: "Access" },
      { id: "tracking", label: "Tracking" },
      { id: "launch", label: "Launch" },
      { id: "optimize", label: "Optimize" },
      { id: "reporting", label: "Reporting" }
    ]
  },
  {
    id: "mobile-apps",
    label: "Mobile Apps",
    description: "Mobile app ideas, scope, build, client review, release, and post-launch care.",
    system: "App build queue + stores",
    serviceKeys: ["mobile-app"],
    stages: [
      { id: "idea", label: "Idea" },
      { id: "scope", label: "Scope" },
      { id: "build", label: "Build" },
      { id: "review", label: "Review" },
      { id: "release", label: "Release" },
      { id: "care", label: "Care" }
    ]
  },
  {
    id: "automations",
    label: "Automations + Lead Systems",
    description: "Lead Command, CRM, workflow agents, software builds, and revenue automation systems.",
    system: "Ghost Lead Command + GhostCRM + tool registry",
    serviceKeys: ["lead-funnel", "software-tool", "ai-automation"],
    stages: [
      { id: "opportunity", label: "Opportunity" },
      { id: "mapped", label: "Mapped" },
      { id: "build", label: "Build" },
      { id: "approval", label: "Approval" },
      { id: "live", label: "Live" },
      { id: "retention", label: "Retention" }
    ]
  },
  {
    id: "commerce",
    label: "Commerce Ops",
    description: "Storefront, products, payments, fulfillment, growth offers, and care workflows.",
    system: "Storefront + payments + reporting",
    serviceKeys: ["ecommerce"],
    stages: [
      { id: "storefront", label: "Storefront" },
      { id: "products", label: "Products" },
      { id: "payments", label: "Payments" },
      { id: "fulfillment", label: "Fulfillment" },
      { id: "growth", label: "Growth" },
      { id: "care", label: "Care" }
    ]
  }
];

const seededClientProfiles = [
  {
    id: "gray-matters-tech",
    clientName: "Gray Matters Tech",
    websiteUrl: "https://www.graymatterstech.com",
    railwayUrl: "https://barbaraconsulting-production.up.railway.app",
    repo: "barbara_consulting",
    githubUrl: "https://github.com/burchdad/barbara_consulting",
    stage: "web-helper-care",
    plan: "Client website care",
    services: ["website-build", "web-helper-care"],
    plannedServices: ["search-intelligence"],
    contact: "Barbara Consulting",
    source: "client-deployment-map"
  },
  {
    id: "peppers-and-vibes",
    clientName: "Peppers and Vibes",
    websiteUrl: "https://www.peppersandvibes.com",
    railwayUrl: "https://e-commercepeptides-production.up.railway.app",
    repo: "e-commerce_peptides",
    githubUrl: "https://github.com/burchdad/e-commerce_peptides",
    stage: "web-helper-care",
    plan: "Client commerce website care",
    services: ["website-build", "web-helper-care", "ecommerce"],
    plannedServices: ["search-intelligence"],
    source: "client-deployment-map"
  },
  {
    id: "design-haven-build",
    clientName: "Design Haven Build",
    websiteUrl: "https://www.designhavenbuild.com",
    repo: "Design-and-Renovation",
    githubUrl: "https://github.com/burchdad/Design-and-Renovation",
    stage: "web-helper-care",
    plan: "Client website care",
    services: ["website-build", "web-helper-care"],
    plannedServices: ["search-intelligence"],
    source: "client-deployment-map"
  },
  {
    id: "ghost-ai-solutions",
    clientName: "Ghost AI Solutions",
    websiteUrl: "https://www.ghostai.solutions",
    railwayUrl: "https://ghostaisolutions-production.up.railway.app",
    repo: "ghostaisolutions",
    githubUrl: "https://github.com/burchdad/ghostaisolutions",
    stage: "growth-services",
    plan: "Internal growth and authority site",
    services: ["website-build", "web-helper-care", "search-intelligence", "lead-funnel", "content-social"],
    source: "client-deployment-map"
  },
  {
    id: "price-consulting",
    clientName: "Price Consulting",
    websiteUrl: "https://price-consulting-site.vercel.app",
    railwayUrl: "https://price-consulting-site-production.up.railway.app",
    repo: "price-consulting-site",
    githubUrl: "https://github.com/burchdad/price-consulting-site",
    stage: "web-helper-care",
    plan: "Client website care",
    services: ["website-build", "web-helper-care"],
    plannedServices: ["search-intelligence"],
    finalDomainPurchased: false,
    notes: "Website is launched and ready for SEO/monthly maintenance contract review.",
    source: "client-deployment-map"
  },
  {
    id: "stephen-burch",
    clientName: "Stephen Burch",
    websiteUrl: "https://www.stephenburch.app",
    repo: "i-need-to-make-a-quick",
    githubUrl: "https://github.com/burchdad/i-need-to-make-a-quick",
    stage: "web-helper-care",
    plan: "Personal digital business card",
    services: ["website-build", "web-helper-care"],
    plannedServices: ["search-intelligence"],
    source: "client-deployment-map"
  },
  {
    id: "alpha-ghost",
    clientName: "Alpha Ghost",
    websiteUrl: "https://www.alphaghost.org",
    railwayUrl: "https://ghostalphaterminal-production.up.railway.app",
    repo: "ghost-alpha-terminal",
    githubUrl: "https://github.com/burchdad/ghost-alpha-terminal",
    stage: "growth-services",
    plan: "Trading intelligence product",
    services: ["website-build", "web-helper-care", "software-tool"],
    plannedServices: ["search-intelligence"],
    source: "client-deployment-map"
  },
  {
    id: "ghostcrm",
    clientName: "GhostCRM",
    websiteUrl: "https://www.ghostcrm.ai",
    railwayUrl: "https://ghostcrm-core-production.up.railway.app",
    repo: "ghostcrm",
    githubUrl: "https://github.com/burchdad/ghostcrm",
    stage: "paused-archived",
    plan: "Dealership CRM product",
    services: ["software-tool"],
    source: "client-deployment-map"
  },
  {
    id: "keisha-law",
    clientName: "Keisha Law",
    websiteUrl: "https://keisha-law.vercel.app",
    repo: "keisha-law",
    githubUrl: "https://github.com/burchdad/keisha-law",
    stage: "web-helper-care",
    plan: "Client website care",
    services: ["website-build", "web-helper-care"],
    plannedServices: ["search-intelligence"],
    notes: "Website is launched and ready for SEO/monthly maintenance contract review.",
    source: "client-deployment-map"
  },
  {
    id: "mobile-detailing",
    clientName: "Mobile Detailing",
    websiteUrl: "https://mobile-detailing-sigma.vercel.app",
    repo: "mobile-detailing",
    githubUrl: "https://github.com/burchdad/mobile-detailing",
    stage: "growth-services",
    plan: "Partner web care and social management",
    services: ["website-build", "web-helper-care", "search-intelligence", "content-social"],
    finalDomainPurchased: false,
    partnershipSigned: true,
    notes: "Partner site is live. Buy the final custom domain, then continue SEO and social management.",
    source: "client-deployment-map"
  },
  {
    id: "bougie-and-company",
    clientName: "Bougie and Company",
    websiteUrl: "https://www.bougieandcompany.com",
    railwayUrl: "https://railway.com/project/3032a264-caf7-4d92-a0f8-406d00cd395c",
    repo: "bougie_and_company",
    githubUrl: "https://github.com/burchdad/bougie_and_company",
    stage: "web-helper-care",
    plan: "Launch + Care",
    services: ["website-build", "web-helper-care", "ecommerce"],
    plannedServices: ["search-intelligence"],
    socialUrls: [
      "https://www.facebook.com/people/Bougie-Company/61585356908803/",
      "https://www.instagram.com/bougieandcompanytx/",
      "https://www.tiktok.com/@bougieandcompany"
    ],
    notes: "Website finished, domain wrapped, final website payment accepted. Web Helper care is active; SEO/monthly contract is the next service step.",
    source: "client-deployment-map"
  },
  {
    id: "annas-air",
    clientName: "Anna's Air",
    websiteUrl: "https://www.annasair.com",
    repo: "anna_air",
    githubUrl: "https://github.com/burchdad/anna_air",
    stage: "web-helper-care",
    plan: "Client website care",
    services: ["website-build", "web-helper-care"],
    plannedServices: ["local-service"],
    source: "client-deployment-map"
  }
];

function titleFromSlug(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getSeededClientProfilesForUi() {
  return seededClientProfiles.map((client) => ({
    finalDomainPurchased: true,
    clientDetailsPending: false,
    leadSource: "",
    leadSourceDetail: "",
    leadStage: "",
    proposalSent: false,
    depositInvoiceSent: false,
    proposalSigned: false,
    partnershipSigned: false,
    plannedServices: [],
    businessEmail: "",
    businessPhone: "",
    socialUrls: [],
    notes: "",
    actions: [],
    ...client
  }));
}

function summarizeClientsForUi(clients) {
  return clients.reduce((summary, client) => {
    const stage = getClientStage(client);
    const issues = getClientIssueTags(client);
    summary.clientCount += 1;
    if (["lead", "deposit-paid"].includes(stage)) {
      summary.onboardingCount += 1;
    }
    if (["web-helper-care", "growth-services", "paused-archived", "completed-archived"].includes(stage)) {
      summary.liveCount += 1;
    }
    const searchServices = [...new Set([...(client.services || []), ...(client.plannedServices || [])])];
    if (searchServices.includes("search-intelligence") || searchServices.includes("local-service")) {
      summary.searchClients += 1;
    }
    if (client.repo) {
      summary.repoLinked += 1;
    }
    if (["deposit-paid", "website-build", "client-review", "final-payment", "launch-handoff"].includes(stage)) {
      summary.websiteBuildCount += 1;
    }
    summary.connectionGaps += issues.length;
    return summary;
  }, {
    clientCount: 0,
    onboardingCount: 0,
    liveCount: 0,
    searchClients: 0,
    repoLinked: 0,
    websiteBuildCount: 0,
    connectionGaps: 0
  });
}

function getClientFallbackActions(clients) {
  return clients
    .flatMap((client) => {
      const actions = [];
      if (client.finalDomainPurchased === false) {
        actions.push(`${client.clientName}: buy or connect final custom domain for the launched preview-domain site.`);
      }
      if (client.clientDetailsPending) {
        actions.push(`${client.clientName}: collect final business details and approval notes.`);
      }
      const serviceIntent = [...new Set([...(client.services || []), ...(client.plannedServices || [])])];
      if ((serviceIntent.includes("search-intelligence") || serviceIntent.includes("local-service")) && !client.googleBusinessUrl) {
        actions.push(`${client.clientName}: connect Google Business / GEO authority source.`);
      }
      if (["web-helper-care", "growth-services"].includes(getClientStage(client))) {
        actions.push(`${client.clientName}: assign Web Helper care rhythm and health checks.`);
      }
      return actions;
    })
    .slice(0, 12);
}

function buildClientPayloadFallback(reason = "") {
  const clients = getSeededClientProfilesForUi();
  const actions = getClientFallbackActions(clients);
  if (reason) {
    actions.unshift(`Live client API fallback active: ${reason}`);
  }

  return {
    generatedAt: new Date().toISOString(),
    source: "frontend-seeded-client-map",
    summary: summarizeClientsForUi(clients),
    clients,
    actions
  };
}

function mergeClientPayloadWithSeed(payload = {}) {
  const seeded = getSeededClientProfilesForUi();
  const incoming = Array.isArray(payload.clients) ? payload.clients : [];
  const byKey = new Map();
  const aliases = new Map();

  seeded.forEach((client) => {
    addClientToMergedUiRoster(byKey, aliases, client);
  });

  incoming.forEach((client) => {
    addClientToMergedUiRoster(byKey, aliases, client);
  });

  const clients = [...byKey.values()];
  return {
    ...payload,
    source: payload.source || "client-map",
    clients,
    summary: summarizeClientsForUi(clients),
    actions: payload.actions?.length ? payload.actions : getClientFallbackActions(clients)
  };
}

function getActiveClientPayload() {
  return liveClients?.clients?.length ? liveClients : buildClientPayloadFallback();
}

function getActiveClients() {
  return getActiveClientPayload().clients || [];
}

function buildClientOverviewModules(client) {
  const stage = getClientStage(client);
  const needsDomain = client.finalDomainPurchased === false;
  const needsDetails = Boolean(client.clientDetailsPending);
  const hasWebHelper = client.services?.includes("web-helper-care");
  const serviceIntent = [...new Set([...(client.services || []), ...(client.plannedServices || [])])];
  const needsGbp = serviceIntent.some((service) => ["search-intelligence", "local-service"].includes(service)) && !client.googleBusinessUrl;
  const modules = [];

  modules.push({
    name: "Web Helper Operations",
    status: hasWebHelper ? (stage === "launch-handoff" ? "Handoff" : "Active") : "Not Included",
    tone: hasWebHelper ? (stage === "launch-handoff" ? "yellow" : "green") : "gray",
    priority: hasWebHelper ? "P2 High Value" : "P4 Nice to Improve",
    priorityHeat: hasWebHelper && stage === "launch-handoff" ? "high" : "monitor",
    owner: `${client.clientName} Web Helper`,
    metrics: {
      Stage: getClientStageLabel(stage),
      Repo: client.repo ? "linked" : "missing",
      "Approval Rules": stage === "launch-handoff" ? "needed" : "owner-gated",
      "Memory Status": hasWebHelper ? "ready" : "not included"
    },
    revenue: {
      influenced: "client retention",
      generated: "n/a",
      pipeline: client.plan || "Launch + Care"
    },
    ownership: {
      confidence: hasWebHelper ? "86%" : "55%",
      autonomy: "Owner-gated",
      lastDecision: hasWebHelper ? "Web Helper can prepare small approved updates." : "Add Web Helper Care if this site needs maintenance.",
      needsHuman: stage === "launch-handoff" || needsDetails ? "Yes" : "No"
    },
    autoAction: {
      enabled: hasWebHelper,
      lastFix: hasWebHelper ? "Prepared handoff and care workflow" : "No helper assigned",
      escalation: stage === "launch-handoff" ? "Approval Required" : "Normal"
    }
  });

  if (needsDomain || needsDetails) {
    modules.push({
      name: "Post-launch Tasks",
      status: "Needs Approval",
      tone: "yellow",
      priority: "P2 High Value",
      priorityHeat: "high",
      owner: "Launch Operator",
      metrics: {
        "Final Domain": needsDomain ? "needed" : "ready",
        "Client Details": needsDetails ? "needed" : "ready",
        "Current Stage": getClientStageLabel(stage),
        "Approval Path": "owner review"
      },
      revenue: {
        influenced: "launch completion",
        generated: "n/a",
        pipeline: "handoff"
      },
      ownership: {
        confidence: "78%",
        autonomy: "Guided",
        lastDecision: "Resolve handoff blockers before full care rhythm.",
        needsHuman: "Yes"
      },
      autoAction: {
        enabled: true,
        lastFix: "Queued handoff requirement follow-up",
        escalation: "Required"
      }
    });
  }

  if (needsGbp) {
    modules.push({
      name: "Local Authority Setup",
      status: "Connection Needed",
      tone: "blue",
      priority: "P3 Important",
      priorityHeat: "monitor",
      owner: "Search Intelligence Agent",
      metrics: {
        "Google Business": "missing",
        "GEO Eligible": "yes",
        "Search Layer": "planned",
        "Client Type": serviceIntent.includes("local-service") ? "local service" : "growth"
      },
      revenue: {
        influenced: "growth services",
        generated: "n/a",
        pipeline: "SEO/AEO/GEO"
      },
      ownership: {
        confidence: "74%",
        autonomy: "Guided",
        lastDecision: "Add GBP/GEO authority source when available.",
        needsHuman: "Yes"
      },
      autoAction: {
        enabled: true,
        lastFix: "Flagged authority profile gap",
        escalation: "Review Suggested"
      }
    });
  }

  return modules;
}

function buildFallbackMissionWebsites(clients = getSeededClientProfilesForUi()) {
  return clients
    .filter((client) => client.websiteUrl)
    .map((client) => {
      let domain = client.websiteUrl;
      try {
        domain = new URL(client.websiteUrl).hostname;
      } catch {
        domain = client.websiteUrl.replace(/^https?:\/\//, "");
      }

      return {
        id: client.id || slugForUi(client.clientName),
        name: client.clientName,
        domain,
        rootUrl: client.websiteUrl,
        status: "Monitoring Ready",
        kpis: [
          { label: "Client Site", value: "live", delta: "seeded" },
          { label: "Repo", value: client.repo ? "linked" : "missing", delta: client.repo || "connect repo" }
        ],
        missionStrip: {
          summary: `${client.clientName} is loaded from the client deployment map. Connect live probes for uptime, forms, SEO, and service checks.`,
          statuses: [
            { label: client.repo ? "Repo Linked" : "Repo Missing", tone: client.repo ? "green" : "yellow" },
            { label: client.finalDomainPurchased === false ? "Domain Needed" : "Domain Ready", tone: client.finalDomainPurchased === false ? "yellow" : "green" }
          ]
        },
        modules: buildClientOverviewModules(client),
        crossInsights: [
          {
            title: "Client target seeded",
            detail: "Mission Control can use this client map while live monitoring, Vercel, Railway, and GitHub enrichments hydrate."
          },
          {
            title: "Web Helper state",
            detail: client.services?.includes("web-helper-care")
              ? `${client.clientName} is mapped into Web Helper operations.`
              : `${client.clientName} has no Web Helper service mapped yet.`
          }
        ],
        alerts: client.finalDomainPurchased === false
          ? [{ title: "Final domain needed", detail: "Client is live on a temporary deployment URL.", tone: "yellow" }]
          : [],
        activityFeed: [
          {
            title: "Client loaded from deployment map",
            detail: `${client.repo || "Repo"} linked for ${client.clientName}.`,
            time: new Date().toISOString()
          }
        ],
        agents: [],
        buildQueue: buildClientBuildQueue([client])
      };
    });
}

function mergeMissionWebsitesWithFallback(websites = []) {
  const fallbackWebsites = buildFallbackMissionWebsites();
  const fallbackByKey = new Map();
  fallbackWebsites.forEach((site) => {
    fallbackByKey.set(normalizeIdentityDomainForUi(site.rootUrl || site.domain || site.name), site);
    fallbackByKey.set(`id:${slugForUi(site.id)}`, site);
  });

  return websites.map((site) => {
    const fallback = fallbackByKey.get(normalizeIdentityDomainForUi(site.rootUrl || site.pages?.[0]?.url || site.domain)) ||
      fallbackByKey.get(`id:${slugForUi(site.id)}`) ||
      {};
    return {
      ...fallback,
      ...site,
      modules: site.modules?.length ? site.modules : fallback.modules || [],
      crossInsights: site.crossInsights?.length ? site.crossInsights : fallback.crossInsights || [],
      activityFeed: site.activityFeed?.length ? site.activityFeed : fallback.activityFeed || [],
      alerts: site.alerts?.length ? site.alerts : fallback.alerts || [],
      missionStrip: site.missionStrip || fallback.missionStrip
    };
  });
}

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
      websites: payload.websites?.length ? mergeMissionWebsitesWithFallback(payload.websites) : buildFallbackMissionWebsites()
    };
  } catch {
    missionData = { websites: buildFallbackMissionWebsites() };
  }
}

let executionPollTimer = null;
let activeView = "mission-control";
let activeExecutionSubview = "overview";
let activeAgentsSubview = "rankings";
let activeServiceSubview = "all";
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
  serviceSubview: "ghostMissionControl.serviceSubview",
  focusMode: "ghostMissionControl.focusMode",
  deferredRecommendation: "ghostMissionControl.deferredRecommendation",
  skippedOnboarding: "ghostMissionControl.skippedOnboarding"
};

const executionSubviewVisibility = {
  overview: ["executionPanel", "executionActionsPanel"],
  active: ["executionPanel", "executionActionsPanel", "agentCollabPanel"],
  history: ["executionPanel", "executionActionsPanel", "commandMemoryPanel", "activityPanel"],
  failures: ["executionPanel", "executionActionsPanel", "alertsPanel"]
};

const agentsSubviewVisibility = {
  rankings: ["agentOpsPanel", "agentsPanel"],
  logs: ["agentOpsPanel", "agentsPanel", "activityPanel", "commandMemoryPanel"],
  collaboration: ["agentOpsPanel", "agentsPanel", "agentCollabPanel"]
};

const viewVisibility = {
  "mission-control": [
    "cockpitPanel",
    "operationsPanel",
    "alertsPanel",
    "perceptionPanel",
    "predictivePanel",
    "crossSystemPanel",
    "activityPanel"
  ],
  clients: ["clientsPanel", "clientActionsPanel"],
  onboarding: ["onboardingPanel"],
  services: ["servicesPanel", "serviceActionsPanel"],
  execution: [
    "executionPanel",
    "executionActionsPanel"
  ],
  agents: ["agentOpsPanel", "agentsPanel"],
  "web-helpers": ["webHelpersPanel", "webHelperRequestsPanel"],
  tools: ["toolsPanel", "toolActionsPanel", "commandPlanPanel"],
  intelligence: ["intelligencePanel", "predictivePanel", "crossSystemPanel", "perceptionPanel", "alertsPanel", "activityPanel"],
  strategy: ["strategyPanel", "strategicPanel", "perceptionPanel", "commandPlanPanel", "commandMemoryPanel"],
  simulation: ["scenarioPanel", "strategicPanel", "predictivePanel"],
  autonomy: ["autonomyPanel", "scenarioPanel", "strategicPanel", "perceptionPanel"],
  "build-queue": ["buildQueuePanel", "operationsPanel"]
};

function setActiveView(view) {
  activeView = view;
  if (elements.body) {
    elements.body.dataset.activeView = view;
  }
  let visiblePanels = new Set(viewVisibility[view] || []);

  if (view === "execution") {
    visiblePanels = new Set(executionSubviewVisibility[activeExecutionSubview] || executionSubviewVisibility.overview);
  }

  if (view === "agents") {
    visiblePanels = new Set(agentsSubviewVisibility[activeAgentsSubview] || agentsSubviewVisibility.rankings);
  }

  const shellPanels = [
    "operationsPanel",
    "cockpitPanel",
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
    "intelligencePanel",
    "strategyPanel",
    "executionPanel",
    "agentOpsPanel",
    "executionActionsPanel",
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

  const mainColumnPanels = ["operationsPanel", "cockpitPanel", "clientsPanel", "onboardingPanel", "servicesPanel", "toolsPanel", "buildQueuePanel", "webHelpersPanel", "intelligencePanel", "strategyPanel", "executionPanel", "agentOpsPanel"];
  const sideColumnPanels = [
    "clientActionsPanel",
    "onboardingActionsPanel",
    "serviceActionsPanel",
    "toolActionsPanel",
    "webHelperRequestsPanel",
    "executionActionsPanel",
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

      if (selectedView === "tools") {
        loadTools(true);
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

  document.addEventListener("click", (event) => {
    const shortcut = event.target.closest("[data-view-shortcut]");
    if (!shortcut || elements.cockpitBoard?.contains(shortcut)) {
      return;
    }
    setActiveView(shortcut.dataset.viewShortcut);
  });

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
    clients: "Web Clients",
    onboarding: "Leads / Proposals",
    services: "Service Pipelines",
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
    clients: "Web Clients",
    onboarding: "Leads / Proposals",
    services: "Service Pipelines",
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

function getClientById(clientId) {
  const clients = liveClients?.clients?.length ? liveClients.clients : buildClientPayloadFallback().clients;
  const canonicalId = canonicalClientIdForUi(clientId);
  return clients.find((client) => canonicalClientIdForUi(client.id) === canonicalId) || null;
}

function getClientBySharedIdentity(client) {
  const clients = liveClients?.clients?.length ? liveClients.clients : buildClientPayloadFallback().clients;
  const keys = new Set(getClientIdentityKeysForUi(client));
  return clients.find((candidate) => getClientIdentityKeysForUi(candidate).some((key) => keys.has(key))) || null;
}

function setFieldValue(field, value = "") {
  if (field) {
    field.value = value ?? "";
  }
}

function setFieldChecked(field, value) {
  if (field) {
    field.checked = Boolean(value);
  }
}

function ensureSelectOption(select, value) {
  const optionValue = String(value || "").trim();
  if (!select || !optionValue || [...select.options].some((option) => option.value === optionValue || option.textContent === optionValue)) {
    return;
  }

  const option = document.createElement("option");
  option.value = optionValue;
  option.textContent = optionValue;
  select.appendChild(option);
}

function setMultiSelectValues(select, values = []) {
  if (!select) {
    return;
  }

  if (!select.options) {
    return;
  }

  values.forEach((value) => ensureSelectOption(select, value));
  const selectedValues = new Set(values);
  [...select.options].forEach((option) => {
    option.selected = selectedValues.has(option.value);
  });
}

function getClientServiceChecks(state) {
  if (!elements.clientServicesInput) {
    return [];
  }

  return [...elements.clientServicesInput.querySelectorAll(`input[data-client-service-state="${state}"]`)];
}

function setClientServicePickerValues(activeServices = [], plannedServices = []) {
  if (!elements.clientServicesInput) {
    return;
  }

  const activeSet = new Set(activeServices);
  const plannedSet = new Set(plannedServices.filter((service) => !activeSet.has(service)));
  [...elements.clientServicesInput.querySelectorAll("input[data-client-service]")].forEach((input) => {
    const service = input.dataset.clientService;
    input.checked =
      input.dataset.clientServiceState === "active"
        ? activeSet.has(service)
        : plannedSet.has(service);
  });
}

function getSelectedClientServiceState() {
  const active = getClientServiceChecks("active")
    .filter((input) => input.checked)
    .map((input) => input.value);
  const activeSet = new Set(active);
  const planned = getClientServiceChecks("planned")
    .filter((input) => input.checked && !activeSet.has(input.value))
    .map((input) => input.value);

  return {
    services: [...new Set(active)],
    plannedServices: [...new Set(planned)]
  };
}

const clientModalModeDefaults = {
  client: {
    title: "New Client",
    subtitle: "Add the client profile, services, and operating links.",
    submitLabel: "Create Client",
    stage: "website-build",
    leadSource: "",
    leadStage: "",
    services: ["website-build", "web-helper-care"],
    plannedServices: []
  },
  lead: {
    title: "New Lead / Proposal",
    subtitle: "Capture the inquiry, proposal email, deposit invoice, agreement status, and first build notes.",
    submitLabel: "Save Lead",
    stage: "lead",
    leadSource: "",
    leadStage: "",
    services: ["website-build"],
    plannedServices: []
  }
};

function getClientModalModeDefaults(mode) {
  return clientModalModeDefaults[mode] || clientModalModeDefaults.client;
}

function resetClientForm(mode = "client") {
  const defaults = getClientModalModeDefaults(mode);
  elements.clientOnboardForm?.reset();
  editingClientId = "";
  setFieldValue(elements.clientEditIdInput, "");
  setFieldChecked(elements.clientFinalDomainInput, true);
  setFieldChecked(elements.clientDetailsPendingInput, false);
  if (elements.clientStageInput) {
    elements.clientStageInput.value = defaults.stage;
  }
  setFieldValue(elements.clientLeadSourceInput, defaults.leadSource);
  setFieldValue(elements.clientLeadSourceDetailInput, "");
  setFieldValue(elements.clientLeadStageInput, defaults.leadStage);
  setFieldValue(elements.clientRelationshipInput, "client");
  setFieldValue(elements.clientPricingTierInput, "standard");
  setClientServicePickerValues(defaults.services, defaults.plannedServices);
  if (elements.clientSubmitButton) {
    elements.clientSubmitButton.textContent = defaults.submitLabel;
  }
  elements.clientArchiveButton?.classList.add("view-hidden");
  elements.clientDeleteButton?.classList.add("view-hidden");
}

function populateClientForm(client) {
  if (!client) {
    return;
  }

  editingClientId = client.id;
  setFieldValue(elements.clientEditIdInput, client.id);
  setFieldValue(elements.clientNameInput, client.clientName);
  ensureSelectOption(elements.clientStageInput, getClientStage(client));
  setFieldValue(elements.clientStageInput, getClientStage(client));
  ensureSelectOption(elements.clientLeadSourceInput, client.leadSource);
  setFieldValue(elements.clientLeadSourceInput, client.leadSource);
  setFieldValue(elements.clientLeadSourceDetailInput, client.leadSourceDetail);
  ensureSelectOption(elements.clientLeadStageInput, deriveLeadStage(client));
  setFieldValue(elements.clientLeadStageInput, deriveLeadStage(client));
  ensureSelectOption(elements.clientRelationshipInput, normalizeClientRelationship(client.relationshipType));
  setFieldValue(elements.clientRelationshipInput, normalizeClientRelationship(client.relationshipType));
  ensureSelectOption(elements.clientPricingTierInput, normalizeClientPricingTier(client.pricingTier, client.relationshipType));
  setFieldValue(elements.clientPricingTierInput, normalizeClientPricingTier(client.pricingTier, client.relationshipType));
  setFieldValue(elements.clientWebsiteInput, client.websiteUrl);
  setFieldValue(elements.clientRepoInput, client.repo);
  setFieldValue(elements.clientRailwayInput, client.railwayUrl);
  setFieldValue(elements.clientVercelInput, client.vercelUrl);
  setFieldValue(elements.clientMobileAppInput, client.mobileAppUrl);
  setFieldValue(elements.clientGoogleBusinessInput, client.googleBusinessUrl);
  setFieldValue(elements.clientSocialsInput, (client.socialUrls || []).join("\n"));
  setFieldChecked(elements.clientProposalSentInput, client.proposalSent || client.proposalSigned || client.depositPaid);
  setFieldChecked(elements.clientDepositInvoiceSentInput, client.depositInvoiceSent || client.depositPaid);
  setFieldChecked(elements.clientProposalInput, client.proposalSigned);
  setFieldChecked(elements.clientDepositInput, client.depositPaid);
  setFieldChecked(elements.clientFinalPaymentInput, client.finalPaymentPaid);
  setFieldChecked(elements.clientPartnershipInput, client.partnershipSigned);
  setFieldChecked(elements.clientFinalDomainInput, client.finalDomainPurchased !== false);
  setFieldChecked(elements.clientDetailsPendingInput, client.clientDetailsPending);
  setFieldValue(elements.clientBusinessEmailInput, client.businessEmail);
  setFieldValue(elements.clientBusinessPhoneInput, client.businessPhone);
  ensureSelectOption(elements.clientPlanInput, client.plan);
  setFieldValue(elements.clientPlanInput, client.plan || "Launch + Care");
  setClientServicePickerValues(client.services || [], client.plannedServices || []);
  setFieldValue(elements.clientContactInput, client.contact);
  setFieldValue(elements.clientNotesInput, client.notes);
  if (elements.clientSubmitButton) {
    elements.clientSubmitButton.textContent = "Save Client";
  }
  elements.clientArchiveButton?.classList.remove("view-hidden");
  elements.clientDeleteButton?.classList.remove("view-hidden");
}

function openClientModal(options = {}) {
  if (!elements.clientOnboardModal) {
    return;
  }

  const mode = options.mode || "client";
  const defaults = getClientModalModeDefaults(mode);
  resetClientForm(mode);
  const client = options.client || (options.clientId ? getClientById(options.clientId) : null);
  if (elements.clientModalTitle) {
    elements.clientModalTitle.textContent = options.title || (client ? "Edit Client" : defaults.title);
  }
  if (elements.clientModalSubtitle) {
    elements.clientModalSubtitle.textContent = options.subtitle || (client ? "Update profile, pipeline stage, service scope, links, and payment checkpoints." : defaults.subtitle);
  }
  if (client) {
    populateClientForm(client);
  }
  if (elements.clientStageInput && options.stage) {
    elements.clientStageInput.value = options.stage;
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
  resetClientForm();
  if (elements.clientModalTitle) {
    elements.clientModalTitle.textContent = "New Client";
  }
  if (elements.clientModalSubtitle) {
    elements.clientModalSubtitle.textContent = clientModalModeDefaults.client.subtitle;
  }
}

function buildAgentDraftPrompt(agent, target = "codex") {
  const targetLabel = {
    codex: "Codex build session",
    "backend-worker": "backend worker or API endpoint",
    "client-helper": "client Web Helper template"
  }[target] || target;

  return [
    `Create a Ghost Mission Control agent named "${agent.name}".`,
    `Build target: ${targetLabel}.`,
    `Service area: ${agent.service}.`,
    `Priority: ${agent.priority}.`,
    `Purpose: ${agent.why}`,
    `Required access/prerequisites: ${agent.prerequisites.join(", ")}.`,
    "The agent should include a reusable spec, operating prompt, required tools, approval rules, routing triggers, and a UI/status card.",
    "Keep risky client-facing actions owner-approved, including deploys, billing, ad spend, form changes, public replies, and credential handling.",
    "Return an implementation plan first, then code changes only after approval."
  ].join("\n");
}

function openAgentBuildModal(agentIndex) {
  if (!elements.agentBuildModal) {
    return;
  }

  const agent = currentRecommendedAgents[Number(agentIndex)];
  if (!agent) {
    return;
  }

  elements.agentBuildNameInput.value = agent.name;
  elements.agentBuildServiceInput.value = agent.service;
  elements.agentBuildPriorityInput.value = agent.priority;
  elements.agentBuildTargetInput.value = "codex";
  elements.agentBuildPurposeInput.value = agent.why;
  elements.agentBuildPrerequisitesInput.value = agent.prerequisites.join("\n");
  elements.agentBuildPromptInput.value = buildAgentDraftPrompt(agent, "codex");
  if (elements.agentBuildResponse) {
    elements.agentBuildResponse.textContent = "";
  }

  elements.agentBuildModal.classList.remove("view-hidden");
  elements.agentBuildNameInput?.focus();
}

function closeAgentBuildModal() {
  elements.agentBuildModal?.classList.add("view-hidden");
}

function submitAgentBuildDraft(event) {
  event.preventDefault();
  const draft = {
    id: `agent-draft-${Date.now()}`,
    name: elements.agentBuildNameInput.value.trim(),
    service: elements.agentBuildServiceInput.value.trim(),
    priority: elements.agentBuildPriorityInput.value,
    target: elements.agentBuildTargetInput.value,
    purpose: elements.agentBuildPurposeInput.value.trim(),
    prerequisites: elements.agentBuildPrerequisitesInput.value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    prompt: elements.agentBuildPromptInput.value.trim(),
    status: "queued",
    createdAt: new Date().toISOString()
  };

  draftedAgentBuilds = [draft, ...draftedAgentBuilds].slice(0, 6);
  if (elements.agentBuildResponse) {
    elements.agentBuildResponse.textContent = `${draft.name} build draft queued for ${draft.target}.`;
  }
  renderAgents(getActiveSite());
}

async function copyAgentBuildPrompt() {
  const prompt = elements.agentBuildPromptInput?.value || "";
  if (!prompt) {
    return;
  }

  try {
    await navigator.clipboard.writeText(prompt);
    if (elements.agentBuildResponse) {
      elements.agentBuildResponse.textContent = "Build prompt copied.";
    }
  } catch {
    elements.agentBuildPromptInput?.select();
    if (elements.agentBuildResponse) {
      elements.agentBuildResponse.textContent = "Prompt selected. Copy it with Ctrl+C.";
    }
  }
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
    const agentBuildModalOpen = elements.agentBuildModal && !elements.agentBuildModal.classList.contains("view-hidden");
    const leadNotificationOpen = elements.leadNotificationModal && !elements.leadNotificationModal.classList.contains("view-hidden");
    const webHelperTicketOpen = elements.webHelperTicketModal && !elements.webHelperTicketModal.classList.contains("view-hidden");
    if (!paletteOpen) {
      if (key === "escape" && webHelperTicketOpen) {
        closeWebHelperTicket();
        return;
      }
      if (key === "escape" && leadNotificationOpen) {
        closeLeadNotification();
        return;
      }
      if (key === "escape" && agentBuildModalOpen) {
        closeAgentBuildModal();
        return;
      }
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

  const storedServiceSubview = loadStoredValue(storageKeys.serviceSubview);
  if (storedServiceSubview === "all" || servicePipelineDefinitions.some((pipeline) => pipeline.id === storedServiceSubview)) {
    activeServiceSubview = storedServiceSubview;
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
  const supportRequests = (helpers || [])
    .flatMap((helper) => helper.requests || [])
    .filter((request) => !isWebHelperOperationalTask(request));
  const pendingApprovals = supportRequests.filter((request) => request.approvalRequired).length;
  const openRequests = supportRequests.length;
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
  const websiteBuildCount = clientsPayload?.summary?.websiteBuildCount || 0;
  if (!websiteBuildCount) {
    return { count: 0, text: "", severity: "none", tooltip: "No paid websites are currently in active build." };
  }

  return {
    count: websiteBuildCount,
    text: String(websiteBuildCount),
    severity: "active",
    tooltip: `${websiteBuildCount} paid website build${websiteBuildCount === 1 ? " is" : "s are"} active.`
  };
}

function getOnboardingBadgeMeta(onboarding) {
  const activeLeads = onboarding?.summary?.activeClients || 0;
  if (!activeLeads) {
    return { count: 0, text: "", severity: "none", tooltip: "No active leads or proposal follow-ups." };
  }

  return {
    count: activeLeads,
    text: String(activeLeads),
    severity: onboarding?.summary?.blockedClients ? "warning" : "active",
    tooltip: `${activeLeads} lead${activeLeads === 1 ? "" : "s"} in proposal/deposit follow-up.`
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
    renderExecutionConsole();
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
  renderExecutionConsole();
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

const fallbackAgentRoster = [
  {
    name: "Automation Supervisor",
    role: "Command routing, action ranking, and approval control.",
    service: "Execution",
    status: "ready",
    tone: "green",
    triggers: ["Mission command", "Risk review", "Fallback routing"],
    responsibilities: ["Rank next actions", "Assign operators", "Escalate owner approval"]
  },
  {
    name: "Web Helper Agent",
    role: "Client site updates, fixes, safe deploy notes, and reply drafts.",
    service: "Web Helper Care",
    status: "ready",
    tone: "green",
    triggers: ["Client request", "Final payment", "Site issue"],
    responsibilities: ["Classify request", "Prepare code change", "Draft client response"]
  },
  {
    name: "Search Intelligence Agent",
    role: "SEO, AEO, GEO readiness, visibility checks, and content recommendations.",
    service: "SEO / AEO / GEO",
    status: "integration-needed",
    tone: "yellow",
    triggers: ["GEO profile connected", "Visibility drop", "Topic gap"],
    responsibilities: ["Import GEO signals", "Create site tasks", "Recommend content"]
  },
  {
    name: "Funnel Monitor Agent",
    role: "Lead forms, conversion paths, CRM handoff, and follow-up health.",
    service: "Lead Funnel",
    status: "planned",
    tone: "blue",
    triggers: ["Lead drop", "Form issue", "Campaign launch"],
    responsibilities: ["Probe forms", "Map conversion events", "Route CRM follow-up"]
  },
  {
    name: "Content Operator",
    role: "Business page posting, social queue, campaign calendar, and briefs.",
    service: "Content + Social",
    status: "planned",
    tone: "blue",
    triggers: ["Calendar due", "Business update", "GEO opportunity"],
    responsibilities: ["Build monthly plan", "Queue posts", "Hold approvals"]
  },
  {
    name: "Reporting Agent",
    role: "Monthly summaries, service outcomes, site health, and renewal cues.",
    service: "Client Reporting",
    status: "planned",
    tone: "blue",
    triggers: ["Report due", "Client check-in", "Renewal window"],
    responsibilities: ["Collect outcomes", "Prepare report", "Surface next-best work"]
  }
];

const recommendedAgentBacklog = [
  {
    name: "Reputation Manager Agent",
    priority: "high",
    service: "Google Business + Social",
    why: "Monitor reviews, business profile questions, testimonial opportunities, and owner-approved response drafts.",
    prerequisites: ["Google Business access", "Approved response tone", "Escalation rules"]
  },
  {
    name: "Ads Optimizer Agent",
    priority: "high",
    service: "Paid Ads",
    why: "Track campaign spend, conversion drops, landing page issues, and weekly performance actions.",
    prerequisites: ["Meta/Google Ads", "Budget rules", "Conversion tracking"]
  },
  {
    name: "CRM Follow-Up Agent",
    priority: "medium",
    service: "Lead Funnel",
    why: "Watch lead status, missed follow-ups, form submissions, and handoff gaps after new inquiries.",
    prerequisites: ["CRM access", "Lead stages", "Follow-up rules"]
  },
  {
    name: "Site Health Sentinel",
    priority: "medium",
    service: "Web Helper Care",
    why: "Monitor uptime, forms, broken links, deploy regressions, and urgent client-facing failures.",
    prerequisites: ["Website URL", "Form probes", "Deploy logs"]
  },
  {
    name: "Billing + Renewal Agent",
    priority: "medium",
    service: "Client Reporting",
    why: "Track final payments, recurring care plans, renewal windows, and service value summaries.",
    prerequisites: ["Plan terms", "Payment status", "Renewal dates"]
  },
  {
    name: "Mobile App Support Agent",
    priority: "low",
    service: "Mobile App",
    why: "Only activates for clients with apps; tracks store links, app issues, release notes, and support requests.",
    prerequisites: ["App store links", "Repo access", "Release process"]
  }
];

function normalizeAgentStatus(status = "") {
  return status.toString().toLowerCase().replace(/\s+/g, "-");
}

function agentStatusLabel(status = "") {
  const normalized = normalizeAgentStatus(status);
  if (normalized.includes("integration")) {
    return "needs setup";
  }

  if (normalized === "active") {
    return "active";
  }

  if (normalized === "ready") {
    return "ready";
  }

  if (normalized === "planned") {
    return "planned";
  }

  return normalized || "planned";
}

function agentLaneForStatus(status = "") {
  const normalized = normalizeAgentStatus(status);
  if (["active", "ready"].includes(normalized)) {
    return "ready";
  }

  if (normalized.includes("integration") || ["blocked", "degraded", "offline"].includes(normalized)) {
    return "setup";
  }

  return "planned";
}

function renderAgentOpsCard(agent) {
  const status = normalizeAgentStatus(agent.status || "planned");
  const triggerLine = (agent.triggers || ["Mission command"]).slice(0, 2).join(", ");
  const ownsLine = (agent.responsibilities || ["Prepare next action"]).slice(0, 2).join(", ");
  return `<article class="agent-ops-card">
    <div class="agent-card-head">
      <div>
        <h3>${agent.name}</h3>
        <p>${agent.role || agent.statline || "Service operator ready for routing."}</p>
      </div>
      <span class="pill ${toneClass[agent.tone] ?? "tone-gray"}">${agentStatusLabel(status)}</span>
    </div>
    <p class="agent-service">${agent.service || "Mission Ops"}</p>
    <dl class="agent-quick-list">
      <div>
        <dt>Triggers</dt>
        <dd>${triggerLine}</dd>
      </div>
      <div>
        <dt>Owns</dt>
        <dd>${ownsLine}</dd>
      </div>
    </dl>
  </article>`;
}

function renderRecommendedAgentCard(agent, index) {
  return `<article class="recommended-agent-card">
    <div class="agent-card-head">
      <div>
        <h3>${agent.name}</h3>
        <p>${agent.why}</p>
      </div>
      <span class="priority-badge priority-${agent.priority}">${agent.priority}</span>
    </div>
    <p class="agent-service">${agent.service}</p>
    <div class="ops-chip-row">
      ${agent.prerequisites.map((item) => `<span>${item}</span>`).join("")}
    </div>
    <button class="agent-build-button" type="button" data-agent-build-index="${index}">Draft Agent Build</button>
  </article>`;
}

function renderAgentBuildDraftSnapshot() {
  if (!draftedAgentBuilds.length) {
    return "";
  }

  return `<article class="agent-item">
    <h3>Draft builds queued</h3>
    <p class="statline">${draftedAgentBuilds.length} agent build ${draftedAgentBuilds.length === 1 ? "request" : "requests"} ready for Codex/build handoff.</p>
  </article>
  ${draftedAgentBuilds
    .slice(0, 2)
    .map(
      (draft) => `<article class="agent-item">
        <h3>${draft.name}</h3>
        <p class="pill priority-${draft.priority}">${draft.priority}</p>
        <p class="statline">${draft.service} | ${draft.target}</p>
      </article>`
    )
    .join("")}`;
}

function renderAgentOps(rankedAgents = []) {
  if (!elements.agentOpsSummary || !elements.agentOpsBoard) {
    return;
  }

  const liveOps = rankedAgents.map((agent) => ({
    ...agent,
    role: agent.dynamicOutcome || agent.statline || "Live operator from command telemetry.",
    service: agent.service || "Live Agent",
    status: agent.status || "active",
    triggers: ["Live command", "Monitoring cycle"],
    responsibilities: ["Respond to assigned actions", "Report confidence"]
  }));
  const opsAgents = liveOps.length ? liveOps : fallbackAgentRoster;
  const activeCount = opsAgents.filter((agent) => ["active", "ready"].includes(normalizeAgentStatus(agent.status))).length;
  const integrationCount = opsAgents.filter((agent) => normalizeAgentStatus(agent.status).includes("integration")).length;
  const plannedCount = opsAgents.filter((agent) => normalizeAgentStatus(agent.status) === "planned").length;
  const degradedCount = opsAgents.filter((agent) => ["blocked", "degraded", "offline"].includes(normalizeAgentStatus(agent.status))).length;
  const laneGroups = {
    ready: opsAgents.filter((agent) => agentLaneForStatus(agent.status) === "ready"),
    setup: opsAgents.filter((agent) => agentLaneForStatus(agent.status) === "setup"),
    planned: opsAgents.filter((agent) => agentLaneForStatus(agent.status) === "planned")
  };
  const nextAgent = laneGroups.setup[0] || laneGroups.planned[0] || laneGroups.ready[0];
  const existingAgentNames = new Set(opsAgents.map((agent) => agent.name.toLowerCase()));
  const recommendedAgents = recommendedAgentBacklog.filter((agent) => !existingAgentNames.has(agent.name.toLowerCase()));
  currentRecommendedAgents = recommendedAgents;

  elements.agentOpsSummary.innerHTML = [
    ["agents", opsAgents.length],
    ["ready / active", activeCount],
    ["integration needed", integrationCount],
    ["planned", plannedCount],
    ["degraded", degradedCount],
    ["recommended", recommendedAgents.length]
  ]
    .map(
      ([label, value]) => `<article class="summary-card">
        <span>${label}</span>
        <strong>${value}</strong>
      </article>`
    )
    .join("");

  elements.agentOpsBoard.innerHTML = `
    <section class="agent-command-strip" aria-label="Agent operating model">
      <article>
        <span class="section-kicker">Operating Model</span>
        <h3>Owner-supervised automation</h3>
        <p>Agents can prepare client updates, service work, reports, and investigation plans while deploys, billing, ads, forms, and sensitive client replies stay approval-gated.</p>
      </article>
      <article>
        <span class="section-kicker">Service Routing</span>
        <h3>Client -> Service -> Agent -> Approval</h3>
        <p>Every client service should map to an operator, required tools, trigger conditions, next actions, and a clear handoff record.</p>
      </article>
    </section>

    <section>
      <div class="section-heading-row">
        <div>
          <h3>Agent Roster</h3>
          <p>Mission operators grouped by what can run now, what needs integration, and what comes next.</p>
        </div>
        <span class="count-pill">${opsAgents.length}</span>
      </div>
      <div class="agent-lane-grid">
        <article class="agent-lane">
          <div class="agent-lane-head">
            <h3>Ready</h3>
            <span>${laneGroups.ready.length}</span>
          </div>
          <div class="agent-card-stack">
            ${laneGroups.ready.length ? laneGroups.ready.map(renderAgentOpsCard).join("") : `<p class="empty-lane">No ready agents yet.</p>`}
          </div>
        </article>
        <article class="agent-lane">
          <div class="agent-lane-head">
            <h3>Needs Setup</h3>
            <span>${laneGroups.setup.length}</span>
          </div>
          <div class="agent-card-stack">
            ${laneGroups.setup.length ? laneGroups.setup.map(renderAgentOpsCard).join("") : `<p class="empty-lane">No setup blockers.</p>`}
          </div>
        </article>
        <article class="agent-lane">
          <div class="agent-lane-head">
            <h3>Planned</h3>
            <span>${laneGroups.planned.length}</span>
          </div>
          <div class="agent-card-stack">
            ${laneGroups.planned.length ? laneGroups.planned.map(renderAgentOpsCard).join("") : `<p class="empty-lane">No planned agents.</p>`}
          </div>
        </article>
      </div>
    </section>

    <section>
      <div class="section-heading-row">
        <div>
          <h3>Recommended Agent Builds</h3>
          <p>Suggested operators to create as the client services stack expands.</p>
        </div>
        <span class="count-pill">${recommendedAgents.length}</span>
      </div>
      <div class="recommended-agent-grid">
        ${recommendedAgents.map(renderRecommendedAgentCard).join("")}
      </div>
    </section>

    <section class="agent-next-strip">
      <article>
        <span class="section-kicker">Next Activation</span>
        <h3>${nextAgent?.name || "Agent roster waiting"}</h3>
        <p>${nextAgent ? `${agentStatusLabel(nextAgent.status)} | ${nextAgent.service}` : "Create or connect the first agent profile."}</p>
      </article>
      <article>
        <span class="section-kicker">Activation Rule</span>
        <h3>Connect tools before autonomy</h3>
        <p>Every agent needs client scope, approved contacts, connected systems, and owner approval rules before it can act.</p>
      </article>
    </section>

    <section>
      <div class="section-heading-row">
        <div>
          <h3>Routing Rules</h3>
          <p>Guardrails that keep agent work useful without letting risky changes run loose.</p>
        </div>
      </div>
      <div class="agent-routing-grid">
        <article class="agent-routing-card">
          <h3>Client request</h3>
          <p>Route to Web Helper triage, classify urgency, attach client/site context, and draft the reply.</p>
        </article>
        <article class="agent-routing-card">
          <h3>GEO signal</h3>
          <p>Route geo.ghostai.solutions output into Search Intelligence, then generate site/content tasks.</p>
        </article>
        <article class="agent-routing-card">
          <h3>Risky change</h3>
          <p>Deploy, billing, forms, ads, and public client replies require owner approval before execution.</p>
        </article>
        <article class="agent-routing-card">
          <h3>Low confidence</h3>
          <p>Escalate to Automation Supervisor, record the reason, and keep the action in pending review.</p>
        </article>
      </div>
    </section>
  `;
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

  renderAgentOps(rankedAgents);

  if (!rankedAgents.length) {
    elements.agentSnapshot.innerHTML = `
      <article class="agent-item">
        <h3>Agent roster ready</h3>
        <p class="statline">Live rankings, logs, and collaboration populate after command execution and monitoring cycles.</p>
      </article>
      <article class="agent-item">
        <h3>Next agent to activate</h3>
        <p class="statline">Search Intelligence Agent needs the geo.ghostai.solutions API connection before it can route GEO service work.</p>
      </article>
      ${renderAgentBuildDraftSnapshot()}
    `;
    updateNavBadges();
    renderIntelligenceCore(getActiveSite());
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
    .join("") + renderAgentBuildDraftSnapshot();

  updateNavBadges();
  renderIntelligenceCore(getActiveSite());
  renderExecutionConsole();
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
  renderIntelligenceCore(getActiveSite());
}

async function loadStrategicGoals(siteId = activeSiteId) {
  try {
    const response = await fetch(apiUrl(`/mission/strategy?siteId=${encodeURIComponent(siteId)}`));
    if (!response.ok) {
      liveStrategicPlan = null;
      renderStrategyCommand(null);
      return;
    }

    const payload = await response.json();
    liveStrategicPlan = payload;
    renderStrategicGoals(payload);
    renderStrategyCommand(payload);
  } catch {
    liveStrategicPlan = null;
    renderStrategicGoals(null);
    renderStrategyCommand(null);
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

function renderStrategyCommand(strategy) {
  if (!elements.strategySummary || !elements.strategyBoard) {
    return;
  }

  const site = getActiveSite() || getEmptySiteState();
  const goals = strategy?.allGoals || [];
  const primaryGoal = goals[0];
  const allocation = strategy?.recommendedAllocation || { primary: 0, secondary: 0, contingency: 0 };

  if (!strategy || !primaryGoal) {
    renderOpsSummary(elements.strategySummary, [
      { label: "Primary Bet", value: "Waiting" },
      { label: "Score", value: "0" },
      { label: "Success", value: "0%" },
      { label: "Decisions", value: "0" }
    ]);

    elements.strategyBoard.innerHTML = `
      <section class="strategy-command-grid">
        <article class="strategy-command-card strategy-command-card-wide">
          <span class="intel-kicker">Strategy Engine</span>
          <h3>No strategy payload available</h3>
          <p>Start the backend strategy route or select a configured site to generate a scored command plan.</p>
        </article>
      </section>
    `;
    return;
  }

  const success = Math.round(Number(primaryGoal.successProbability || 0) * 100);
  const primaryName = formatStrategyGoalName(primaryGoal.goal);
  const signalCount = (livePredictiveSignals || []).length;
  const secondaryGoals = strategy.secondaryGoals || goals.slice(1);
  const nextSteps = primaryGoal.nextSteps || [];
  const resources = primaryGoal.resources || [];
  const rationale = strategy.rationale || [];
  const riskTone = primaryGoal.riskIfIgnored === "high" ? "tone-red" : primaryGoal.riskIfIgnored === "medium" ? "tone-yellow" : "tone-green";

  renderOpsSummary(elements.strategySummary, [
    { label: "Primary Bet", value: primaryName },
    { label: "Score", value: primaryGoal.score ?? 0 },
    { label: "Success", value: `${success}%` },
    { label: "Signals", value: signalCount }
  ]);

  const resourceMarkup = resources.length
    ? resources.map((resource) => `<span>${escapeHtml(formatStrategyGoalName(resource))}</span>`).join("")
    : `<span>Campaign Orchestrator</span><span>Web Helper</span>`;

  const stepsMarkup = nextSteps.length
    ? nextSteps.map((step, index) => `<li><span>${index + 1}</span>${escapeHtml(step)}</li>`).join("")
    : `<li><span>1</span>Review current site state and select the next measurable growth move.</li>`;

  const portfolioMarkup = goals.length
    ? goals.map((goal, index) => `<article class="strategy-portfolio-card">
        <div>
          <span class="intel-kicker">Rank ${index + 1}</span>
          <h3>${escapeHtml(formatStrategyGoalName(goal.goal))}</h3>
        </div>
        <strong>${escapeHtml(goal.score ?? 0)}</strong>
        <p>Urgency ${escapeHtml(goal.urgency ?? 0)}/10 - ${escapeHtml(goal.duration ?? 0)}h - ${Math.round(Number(goal.successProbability || 0) * 100)}% success</p>
        <span class="pill ${goal.riskIfIgnored === "high" ? "tone-red" : goal.riskIfIgnored === "medium" ? "tone-yellow" : "tone-green"}">${escapeHtml(goal.riskIfIgnored || "low")} risk</span>
      </article>`).join("")
    : `<article class="intel-empty"><h3>No goal portfolio</h3><p>The strategy engine returned no ranked alternatives.</p></article>`;

  const secondaryMarkup = secondaryGoals.length
    ? secondaryGoals.slice(0, 4).map((goal) => `<article class="strategy-market-card">
        <span class="intel-kicker">Secondary Bet</span>
        <h3>${escapeHtml(formatStrategyGoalName(goal.goal))}</h3>
        <p>Score ${escapeHtml(goal.score ?? 0)} with ${Math.round(Number(goal.successProbability || 0) * 100)}% modeled success.</p>
      </article>`).join("")
    : `<article class="strategy-market-card"><h3>No secondary bets</h3><p>Primary strategy owns the current planning window.</p></article>`;

  const rationaleMarkup = rationale.length
    ? rationale.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")
    : `<li>Strategy engine is favoring the highest score path for the current site.</li>`;

  elements.strategyBoard.innerHTML = `
    <section class="strategy-command-grid">
      <article class="strategy-hero-card strategy-command-card-wide">
        <div class="strategy-hero-copy">
          <span class="intel-kicker">Primary Strategic Bet</span>
          <h3>${escapeHtml(primaryName)}</h3>
          <p>${escapeHtml(strategy.primaryReasoning || "This is the strongest next move based on current urgency, success probability, and risk if ignored.")}</p>
          <div class="ops-chip-row">${resourceMarkup}</div>
        </div>
        <div class="strategy-score-ring">
          <strong>${escapeHtml(primaryGoal.score ?? 0)}</strong>
          <span>goal score</span>
        </div>
      </article>

      <article class="strategy-command-card">
        <span class="intel-kicker">Execution Window</span>
        <h3>${escapeHtml(primaryGoal.duration || 0)} hours</h3>
        <p>Expected revenue impact: ${escapeHtml(primaryGoal.impactOnRevenue || "unknown")}. Risk if ignored is marked ${escapeHtml(primaryGoal.riskIfIgnored || "unknown")}.</p>
        <span class="pill ${riskTone}">${escapeHtml(primaryGoal.riskIfIgnored || "low")} risk</span>
      </article>

      <article class="strategy-command-card">
        <span class="intel-kicker">Resource Allocation</span>
        <div class="strategy-bar-stack">
          <div class="strategy-bar-row">
            <span>Primary</span>
            <div class="strategy-progress-track"><div class="strategy-progress-fill" style="width: ${Number(allocation.primary || 0)}%"></div></div>
            <strong>${escapeHtml(allocation.primary || 0)}%</strong>
          </div>
          <div class="strategy-bar-row">
            <span>Secondary</span>
            <div class="strategy-progress-track"><div class="strategy-progress-fill" style="width: ${Number(allocation.secondary || 0)}%"></div></div>
            <strong>${escapeHtml(allocation.secondary || 0)}%</strong>
          </div>
          <div class="strategy-bar-row">
            <span>Contingency</span>
            <div class="strategy-progress-track"><div class="strategy-progress-fill" style="width: ${Number(allocation.contingency || 0)}%"></div></div>
            <strong>${escapeHtml(allocation.contingency || 0)}%</strong>
          </div>
        </div>
      </article>

      <article class="strategy-command-card strategy-command-card-wide">
        <span class="intel-kicker">Next Moves</span>
        <ol class="strategy-step-list">${stepsMarkup}</ol>
      </article>

      <article class="strategy-command-card strategy-command-card-wide">
        <span class="intel-kicker">Goal Portfolio</span>
        <div class="strategy-portfolio-grid">${portfolioMarkup}</div>
      </article>

      <article class="strategy-command-card">
        <span class="intel-kicker">Secondary Opportunities</span>
        <div class="strategy-market-grid">${secondaryMarkup}</div>
      </article>

      <article class="strategy-command-card">
        <span class="intel-kicker">Decision Rationale</span>
        <ul class="strategy-risk-list">${rationaleMarkup}</ul>
        <p class="strategy-site-note">Current target: ${escapeHtml(site.name || "Ghost Ops")} / ${escapeHtml(site.domain || "n/a")}</p>
      </article>
    </section>
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
    goals = [
      {
        title: "Client Care Loop",
        priority: "P2",
        trigger: "Daily scan of launched and review-stage client sites.",
        expectedImpact: "Keeps live websites, helper requests, and handoff work from drifting.",
        confidence: 82,
        horizonHours: 24,
        proposedCommand: "Scan active client sites, surface blockers, and draft Web Helper tasks."
      },
      {
        title: "Revenue Services Loop",
        priority: "P2",
        trigger: "Service map includes planned GEO, lead funnel, content, ads, and reporting packages.",
        expectedImpact: "Turns client status into upsell-ready service recommendations.",
        confidence: 78,
        horizonHours: 48,
        proposedCommand: "Match each client to one low-risk growth offer and queue owner review."
      },
      {
        title: "Repo Steward Loop",
        priority: "P3",
        trigger: "GitHub registry has unclassified or unlinked tools.",
        expectedImpact: "Keeps Ghost tools mapped to clients, products, services, and future systems.",
        confidence: 74,
        horizonHours: 72,
        proposedCommand: "Classify unmapped repos and propose deploy/client ownership."
      }
    ];
  }

  liveAutonomousGoals = [...goals];

  elements.autonomousGoals.innerHTML = goals
    .map((goal) => {
      const priorityTone = goal.priority === "P1" ? "tone-red" : goal.priority === "P2" ? "tone-yellow" : "tone-blue";
      return `
      <article class="autonomy-item">
        <div class="autonomy-header">
          <h3>${escapeHtml(goal.title)}</h3>
          <span class="pill ${priorityTone}">${escapeHtml(goal.priority)}</span>
        </div>
        <p class="autonomy-trigger">Trigger: ${escapeHtml(goal.trigger)}</p>
        <p class="autonomy-impact">Expected: ${escapeHtml(goal.expectedImpact)}</p>
        <div class="autonomy-meta">
          <span>Confidence: ${Math.round(Number(goal.confidence || 0))}%</span>
          <span>Horizon: ${escapeHtml(String(goal.horizonHours || 0))}h</span>
        </div>
        <div class="autonomy-command">Suggested command: ${escapeHtml(goal.proposedCommand)}</div>
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

function getSignalSeverityCounts(signals) {
  return (signals || []).reduce(
    (totals, signal) => {
      if (signal.severity === "critical") {
        totals.critical += 1;
      } else if (signal.severity === "warning") {
        totals.warning += 1;
      } else {
        totals.info += 1;
      }

      return totals;
    },
    { critical: 0, warning: 0, info: 0 }
  );
}

function renderIntelligenceCore(site = getActiveSite() || getEmptySiteState()) {
  if (!elements.intelligenceSummary || !elements.intelligenceBoard) {
    return;
  }

  const monitoredPages = site.pages || [];
  const failedPages = monitoredPages.filter((page) => !page.ok);
  const slowPages = monitoredPages.filter((page) => page.ok && Number(page.latencyMs || 0) >= 1500);
  const healthyPages = monitoredPages.filter((page) => page.ok && Number(page.latencyMs || 0) < 1500);
  const signals = livePredictiveSignals || [];
  const signalCounts = getSignalSeverityCounts(signals);
  const agents = liveAgentIntelligence || [];
  const degradedAgents = agents.filter((agent) => Number(agent.confidence || 0) < 70 || agent.status === "degraded");
  const crossInsights = site.crossInsights || [];
  const alerts = site.alerts || [];
  const modules = site.modules || [];
  const activeModules = modules.filter((module) => module.status && module.status !== "offline");

  const perceptionScore = Math.max(
    0,
    Math.min(
      100,
      92 - failedPages.length * 18 - slowPages.length * 6 - signalCounts.critical * 16 - signalCounts.warning * 7 - degradedAgents.length * 5
    )
  );
  const coverageScore = monitoredPages.length
    ? Math.round((healthyPages.length / monitoredPages.length) * 100)
    : 0;
  const confidenceScore = agents.length
    ? Math.round(agents.reduce((sum, agent) => sum + Number(agent.confidence || 0), 0) / agents.length)
    : perceptionScore;
  const decisionCount = alerts.length + signalCounts.critical + degradedAgents.length;

  renderOpsSummary(elements.intelligenceSummary, [
    { label: "Perception Score", value: `${perceptionScore}` },
    { label: "Coverage", value: `${coverageScore}%` },
    { label: "Confidence", value: `${confidenceScore}%` },
    { label: "Decisions", value: decisionCount }
  ]);

  const targetRows = monitoredPages.length
    ? monitoredPages.slice(0, 6).map((page) => {
        const tone = page.ok ? (Number(page.latencyMs || 0) >= 1500 ? "tone-yellow" : "tone-green") : "tone-red";
        const status = page.ok ? `${page.statusCode || 200} / ${page.latencyMs || 0}ms` : `failed / ${page.error || "unreachable"}`;
        return `<article class="intel-row">
          <div>
            <h3>${escapeHtml(page.label || page.url)}</h3>
            <p>${escapeHtml(page.url)}</p>
          </div>
          <span class="pill ${tone}">${escapeHtml(status)}</span>
        </article>`;
      }).join("")
    : `<article class="intel-empty">
        <h3>No monitored targets</h3>
        <p>Backend has no website/page configuration for monitoring.</p>
      </article>`;

  const signalRows = signals.length
    ? signals.slice(0, 5).map((signal) => `<article class="intel-row">
        <div>
          <h3>${escapeHtml(signal.type || "Signal").replaceAll("_", " ")}</h3>
          <p>${escapeHtml(signal.message || signal.predictedOutcome || "No signal detail available.")}</p>
        </div>
        <span class="pill ${signal.severity === "critical" ? "tone-red" : "tone-yellow"}">${escapeHtml(signal.severity || "watch")}</span>
      </article>`).join("")
    : `<article class="intel-empty">
        <h3>No predictive risks</h3>
        <p>Signal layer is clear for the selected site.</p>
      </article>`;

  const decisionRows = [
    ...alerts.map((alert) => ({
      title: alert.title,
      detail: alert.detail,
      tone: alert.tone === "red" ? "tone-red" : alert.tone === "yellow" ? "tone-yellow" : "tone-blue"
    })),
    ...degradedAgents.map((agent) => ({
      title: `${agent.name || "Agent"} confidence review`,
      detail: agent.role || agent.service || "Agent requires attention before more autonomous routing.",
      tone: "tone-yellow"
    }))
  ];

  const decisionsMarkup = decisionRows.length
    ? decisionRows.slice(0, 5).map((item) => `<article class="intel-decision ${item.tone}">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.detail)}</p>
      </article>`).join("")
    : `<article class="intel-decision tone-green">
        <h3>Decision queue clear</h3>
        <p>No critical owner intervention is required for the current site.</p>
      </article>`;

  const authoritySources = [
    { label: "AI Search", value: perceptionScore >= 80 ? "stable" : "review" },
    { label: "Citation Coverage", value: crossInsights.length ? `${crossInsights.length} signals` : "waiting" },
    { label: "Entity Authority", value: activeModules.length ? "mapped" : "unmapped" },
    { label: "Competitor Layer", value: site.domain && site.domain !== "n/a" ? "watching" : "needs target" }
  ];

  elements.intelligenceBoard.innerHTML = `
    <section class="intelligence-grid">
      <article class="intelligence-card intelligence-card-wide">
        <div class="intel-card-head">
          <div>
            <span class="intel-kicker">Now Watching</span>
            <h3>${escapeHtml(site.name || "Ghost Ops")}</h3>
          </div>
          <span class="pill ${failedPages.length ? "tone-red" : slowPages.length ? "tone-yellow" : "tone-green"}">
            ${failedPages.length ? "action" : slowPages.length ? "watch" : "clear"}
          </span>
        </div>
        <div class="intel-target-list">${targetRows}</div>
      </article>
      <article class="intelligence-card">
        <div class="intel-card-head">
          <div>
            <span class="intel-kicker">Signal Radar</span>
            <h3>Predictive Layer</h3>
          </div>
          <span class="pill ${signalCounts.critical ? "tone-red" : signalCounts.warning ? "tone-yellow" : "tone-green"}">
            ${signals.length} signals
          </span>
        </div>
        <div class="intel-target-list">${signalRows}</div>
      </article>
      <article class="intelligence-card">
        <div class="intel-card-head">
          <div>
            <span class="intel-kicker">Decision Queue</span>
            <h3>Operator Review</h3>
          </div>
          <span class="pill ${decisionCount ? "tone-yellow" : "tone-green"}">${decisionCount} open</span>
        </div>
        <div class="intel-decision-list">${decisionsMarkup}</div>
      </article>
      <article class="intelligence-card intelligence-card-wide">
        <div class="intel-card-head">
          <div>
            <span class="intel-kicker">Perception Layer</span>
            <h3>Authority and Source Coverage</h3>
          </div>
          <span class="pill tone-blue">${coverageScore}% coverage</span>
        </div>
        <div class="intel-authority-grid">
          ${authoritySources.map((source) => `<div>
            <span>${escapeHtml(source.label)}</span>
            <strong>${escapeHtml(source.value)}</strong>
          </div>`).join("")}
        </div>
        <div class="intel-insight-strip">
          ${(crossInsights.length ? crossInsights : [{ title: "Insight pipeline waiting", detail: "More authority and citation signals will appear after monitored targets are configured." }])
            .slice(0, 3)
            .map((insight) => `<article>
              <h3>${escapeHtml(insight.title)}</h3>
              <p>${escapeHtml(insight.detail)}</p>
            </article>`)
            .join("")}
        </div>
      </article>
    </section>
  `;
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

  const buildQueue = {
    ...(site.buildQueue || {})
  };
  const clientBuildQueue = buildClientBuildQueue(getActiveClients());
  Object.entries(clientBuildQueue).forEach(([column, items]) => {
    buildQueue[column] = [...(buildQueue[column] || []), ...items];
  });
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

function buildClientBuildQueue(clients) {
  return clients.reduce((queue, client) => {
    const stage = getClientStage(client);
    const name = client.clientName;
    const repoLabel = client.repo ? `repo: ${client.repo}` : "repo needed";
    const domainLabel = client.finalDomainPurchased === false ? "final domain needed" : "domain ready";

    if (stage === "lead" || stage === "deposit-paid") {
      queue.Researching.push(`${name}: confirm scope, offer, access, and deposit path.`);
    } else if (stage === "website-build") {
      queue.Building.push(`${name}: build website path with ${repoLabel}.`);
    } else if (stage === "client-review") {
      queue.Testing.push(`${name}: client review, polish pass, ${domainLabel}.`);
    } else if (stage === "final-payment") {
      queue["Ready to Deploy"].push(`${name}: collect final payment and prep launch checklist.`);
    } else if (stage === "launch-handoff") {
      queue["Ready to Deploy"].push(`${name}: launch handoff, Web Helper memory, scope rules.`);
    } else if (stage === "web-helper-care" || stage === "growth-services") {
      queue.Live.push(`${name}: live care active, monitor health and upsell services.`);
    } else if (stage === "paused-archived") {
      queue.Archived.push(`${name}: paused property, retain repo/domain record.`);
    }

    if (client.clientDetailsPending) {
      queue.Researching.push(`${name}: collect final business details before automation.`);
    }
    if (client.finalDomainPurchased === false) {
      queue["Ready to Deploy"].push(`${name}: buy or connect final custom domain.`);
    }
    return queue;
  }, {
    "Idea Backlog": [],
    Researching: [],
    "Ready to Build": [],
    Building: [],
    Testing: [],
    "Ready to Deploy": [],
    Live: [],
    Archived: []
  });
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

    liveClients = mergeClientPayloadWithSeed(await response.json());
    renderClients(liveClients);
    if (elements.serviceCards && (activeView === "services" || liveServiceCatalog)) {
      renderServices(liveServiceCatalog);
    }
  } catch (error) {
    liveClients = buildClientPayloadFallback(String(error.message || error));
    renderClients(liveClients);
    if (elements.serviceCards && (activeView === "services" || liveServiceCatalog)) {
      renderServices(liveServiceCatalog);
    }
  }

  if (liveOnboarding) {
    renderOnboarding(liveOnboarding);
  }

  const activeSite = getActiveSite() || getEmptySiteState();
  renderBuildQueue(activeSite);
  if (activeView === "web-helpers") {
    loadWebHelpers("");
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

function formatStrategyGoalName(value) {
  return String(value || "strategic_goal")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function slugForUi(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function canonicalClientIdForUi(value) {
  const id = slugForUi(value);
  const aliases = {
    "anna-s-air": "annas-air",
    "anna-air": "annas-air"
  };
  return aliases[id] || id;
}

function compactIdentityKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeIdentityDomainForUi(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  try {
    return new URL(raw.startsWith("http") ? raw : `https://${raw}`).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return raw.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase();
  }
}

function normalizeRepoIdentityForUi(value) {
  const raw = String(value || "").trim().replace(/\.git$/, "");
  if (!raw) {
    return "";
  }

  try {
    const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const parts = parsed.pathname.replace(/^\/+/, "").split("/");
    return compactIdentityKey(parts[1] || parts[0] || raw);
  } catch {
    const parts = raw.split("/");
    return compactIdentityKey(parts[parts.length - 1] || raw);
  }
}

function getClientIdentityKeysForUi(client) {
  return [
    client?.websiteUrl ? `site:${normalizeIdentityDomainForUi(client.websiteUrl)}` : "",
    client?.repo || client?.githubUrl ? `repo:${normalizeRepoIdentityForUi(client.repo || client.githubUrl)}` : "",
    client?.clientName ? `name:${compactIdentityKey(client.clientName)}` : "",
    client?.id ? `id:${canonicalClientIdForUi(client.id)}` : ""
  ].filter(Boolean);
}

function mergeClientRecordsForUi(existing, incoming) {
  if (!existing) {
    return incoming;
  }

  const isRuntimeOverride = incoming.source === "runtime";
  const pick = (field) => (isRuntimeOverride ? incoming[field] : incoming[field] || existing[field]);
  const pickBoolean = (field) => (isRuntimeOverride ? Boolean(incoming[field]) : Boolean(existing[field] || incoming[field]));

  return {
    ...existing,
    ...incoming,
    id: incoming.id || existing.id,
    clientName: pick("clientName"),
    websiteUrl: pick("websiteUrl"),
    repo: pick("repo"),
    githubUrl: pick("githubUrl"),
    railwayUrl: pick("railwayUrl"),
    vercelUrl: pick("vercelUrl"),
    mobileAppUrl: pick("mobileAppUrl"),
    googleBusinessUrl: pick("googleBusinessUrl"),
    analyticsUrl: pick("analyticsUrl"),
    socialUrls: isRuntimeOverride ? incoming.socialUrls || [] : [...new Set([...(existing.socialUrls || []), ...(incoming.socialUrls || [])])],
    services: isRuntimeOverride ? incoming.services || [] : [...new Set([...(existing.services || []), ...(incoming.services || [])])],
    plannedServices: isRuntimeOverride
      ? incoming.plannedServices || []
      : (() => {
          const activeServices = new Set([...(existing.services || []), ...(incoming.services || [])]);
          return [...new Set([...(existing.plannedServices || []), ...(incoming.plannedServices || [])])].filter((service) => !activeServices.has(service));
        })(),
    finalDomainPurchased: incoming.finalDomainPurchased ?? existing.finalDomainPurchased,
    clientDetailsPending: pickBoolean("clientDetailsPending"),
    leadSource: pick("leadSource"),
    leadSourceDetail: pick("leadSourceDetail"),
    leadStage: pick("leadStage") || deriveLeadStage(incoming) || deriveLeadStage(existing),
    relationshipType: pick("relationshipType"),
    pricingTier: pick("pricingTier"),
    proposalSent: pickBoolean("proposalSent"),
    depositInvoiceSent: pickBoolean("depositInvoiceSent"),
    proposalSigned: pickBoolean("proposalSigned"),
    partnershipSigned: pickBoolean("partnershipSigned"),
    depositPaid: pickBoolean("depositPaid"),
    finalPaymentPaid: pickBoolean("finalPaymentPaid"),
    businessEmail: pick("businessEmail"),
    businessPhone: pick("businessPhone"),
    plan: pick("plan"),
    contact: pick("contact"),
    notes: pick("notes"),
    actions: incoming.actions?.length ? incoming.actions : existing.actions
  };
}

function addClientToMergedUiRoster(merged, aliases, client) {
  const keys = getClientIdentityKeysForUi(client);
  const stableIdKey = client?.id ? `id:${canonicalClientIdForUi(client.id)}` : "";
  const existingPrimaryKey =
    keys
      .filter((key) => key !== stableIdKey)
      .map((key) => aliases.get(key))
      .find(Boolean) || (stableIdKey ? aliases.get(stableIdKey) : "");
  const primaryKey = existingPrimaryKey || stableIdKey || `name:${compactIdentityKey(client.clientName)}`;
  const mergedClient = mergeClientRecordsForUi(merged.get(primaryKey), client);
  merged.set(primaryKey, mergedClient);
  getClientIdentityKeysForUi(mergedClient).forEach((key) => aliases.set(key, primaryKey));
}

function getClientStage(client) {
  return client?.stage || client?.status || "website-build";
}

function getClientStageLabel(stageId) {
  return clientPipelineStages.find((stage) => stage.id === stageId)?.label || stageId || "Website Build";
}

function getWebClientPipelineStage(client) {
  const stage = getClientStage(client);
  if (["web-helper-care", "growth-services", "paused-archived", "completed-archived"].includes(stage)) {
    return "completed-archived";
  }
  return webClientPipelineStages.some((entry) => entry.id === stage) ? stage : "website-build";
}

function getClientIssueTags(client) {
  const issues = [];
  const services = [...new Set([...(client.services || []), ...(client.plannedServices || [])])];
  const needsSearch = services.includes("search-intelligence") || services.includes("local-service");
  const needsSocial = services.includes("content-social");
  if (!client.websiteUrl) {
    issues.push({ id: "missing-website", label: "Missing website" });
  }
  if (!client.repo) {
    issues.push({ id: "missing-repo", label: "Missing repo" });
  }
  if (!client.vercelUrl) {
    issues.push({ id: "missing-vercel", label: "Missing Vercel" });
  }
  if (needsSearch && !client.googleBusinessUrl) {
    issues.push({ id: "missing-gbp", label: "Missing GBP" });
  }
  if (needsSocial && !client.socialUrls?.length) {
    issues.push({ id: "missing-socials", label: "Missing socials" });
  }
  if (needsSearch) {
    issues.push({ id: "needs-geo", label: "Needs GEO setup" });
  }
  if (client.finalDomainPurchased === false) {
    issues.push({ id: "final-domain-needed", label: "Final domain needed" });
  }
  if (client.clientDetailsPending) {
    issues.push({ id: "details-pending", label: "Details pending" });
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
      client.leadSource,
      getLeadSourceLabel(client),
      client.leadSourceDetail,
      client.plan,
      client.contact,
      client.notes,
      ...(client.socialUrls || []),
      ...(client.services || []),
      ...(client.plannedServices || []),
      ...issueTags.map((issue) => issue.label)
    ]
      .join(" ")
      .toLowerCase();

    if (filters.query && !haystack.includes(filters.query)) {
      return false;
    }

    if (filters.stage !== "all" && getWebClientPipelineStage(client) !== filters.stage) {
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
    <span>${escapeHtml(options.sensitive ? `${label} / internal` : label)}</span>
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

function renderClientQuickActions(client, options = {}) {
  const actions = getClientQuickActions(client);
  const links = actions
    .slice(0, 6)
    .map((action) => `<a href="${escapeHtml(action.url)}" target="_blank" rel="noreferrer">${escapeHtml(action.label)}</a>`)
    .join("");
  const detailsButton = options.includeDetails === false ? "" : `<button type="button" data-client-detail="${escapeHtml(client.id)}">Details</button>`;
  const provisionButton = shouldShowWebHelperProvision(client)
    ? `<button type="button" data-client-provision-web-helper="${escapeHtml(client.id)}">Provision Web Helper</button>`
    : "";

  return `<div class="client-quick-actions">
    ${links || `<span>No links yet</span>`}
    ${detailsButton}
    ${provisionButton}
  </div>`;
}

function shouldShowWebHelperProvision(client) {
  const stage = getClientStage(client);
  const hasCoreLinks = Boolean(client.websiteUrl && client.repo);
  const postBuildStage = ["final-payment", "launch-handoff", "completed-archived", "web-helper-care", "growth-services"].includes(stage);
  const hasHelperService = (client.services || []).includes("web-helper-care") || (client.plannedServices || []).includes("web-helper-care");
  return hasCoreLinks && (postBuildStage || hasHelperService || client.finalPaymentPaid);
}

function getClientDisplayUrl(client) {
  const value = client.websiteUrl || client.vercelUrl || client.repo || "";
  if (!value) {
    return "";
  }

  try {
    return new URL(value.startsWith("http") ? value : `https://${value}`).hostname.replace(/^www\./, "");
  } catch {
    return String(value).replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

function formatClientDate(value) {
  if (!value) {
    return "Not recorded";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getClientServiceSummary(client) {
  const active = [...new Set(client.services || [])];
  const activeSet = new Set(active);
  const planned = [...new Set(client.plannedServices || [])].filter((service) => !activeSet.has(service));
  return {
    active,
    planned,
    total: active.length + planned.length
  };
}

function getClientReadinessSummary(client) {
  const healthChecks = getClientHealthChecks(client);
  const handoffItems = getClientHandoffItems(client);
  const readyHealth = healthChecks.filter((item) => item.status === "ready").length;
  const readyHandoff = handoffItems.filter((item) => item.status === "ready").length;
  const blockers = [...healthChecks, ...handoffItems].filter((item) => ["missing", "blocked", "needs-action", "needs-input"].includes(item.status));
  return {
    readyHealth,
    totalHealth: healthChecks.length,
    readyHandoff,
    totalHandoff: handoffItems.length,
    blockers
  };
}

function renderClientModalStats(client) {
  const issueCount = getClientIssueTags(client).length;
  const serviceSummary = getClientServiceSummary(client);
  const readiness = getClientReadinessSummary(client);
  const readyChecks = readiness.readyHealth + readiness.readyHandoff;
  const totalChecks = readiness.totalHealth + readiness.totalHandoff;
  return `<div class="client-modal-stats">
    <div><span>Stage</span><strong>${escapeHtml(getClientStageLabel(getClientStage(client)))}</strong></div>
    <div><span>Plan</span><strong>${escapeHtml(client.plan || "Launch + Care")}</strong></div>
    <div><span>Services</span><strong>${escapeHtml(`${serviceSummary.active.length} active / ${serviceSummary.planned.length} planned`)}</strong></div>
    <div><span>Readiness</span><strong>${escapeHtml(`${readyChecks}/${totalChecks} ops checks`)}</strong></div>
    <div><span>Connections</span><strong>${escapeHtml(issueCount ? `${issueCount} gaps` : "Ready")}</strong></div>
    <div><span>Lead Source</span><strong>${escapeHtml(getLeadSourceLabel(client))}</strong></div>
    <div><span>Relationship</span><strong>${escapeHtml(getClientRelationshipLabel(client))}</strong></div>
    <div><span>Pricing</span><strong>${escapeHtml(normalizeClientPricingTier(client.pricingTier, client.relationshipType))}</strong></div>
    <div><span>Record</span><strong>${escapeHtml(`${client.source || "deployment-map"} / ${client.id || "no-id"}`)}</strong></div>
  </div>`;
}

function getClientHandoffItems(client) {
  const serviceIntent = [...new Set([...(client.services || []), ...(client.plannedServices || [])])];
  const items = [
    {
      label: "Client profile",
      status: client.contact || client.notes ? "ready" : "needs-input",
      detail: client.contact || client.notes || "Add primary contact, offer, audience, and brand notes."
    },
    {
      label: "Repo and deployment",
      status: client.websiteUrl && client.repo && client.vercelUrl ? "ready" : "blocked",
      detail: client.repo || client.websiteUrl || "Link website, repo, and deployment."
    },
    {
      label: "Final domain",
      status: client.finalDomainPurchased === false ? "needs-action" : "ready",
      detail: client.finalDomainPurchased === false ? "Preview domain is live, final domain still needed." : "Custom domain or accepted live URL is set."
    },
    {
      label: "Web Helper memory",
      status: client.services?.includes("web-helper-care") ? "ready" : "optional",
      detail: "Generate client-profile.md, brand-voice.md, website-stack.md, scope-rules.md, and update-history.md."
    },
    {
      label: "Growth layer",
      status: serviceIntent.includes("search-intelligence") || serviceIntent.includes("local-service") ? "queued" : "optional",
      detail: serviceIntent.includes("search-intelligence") || serviceIntent.includes("local-service")
        ? "Map to GEO/search intelligence and authority monitoring."
        : "Not currently included in package."
    }
  ];
  return items;
}

function getClientHealthChecks(client) {
  return [
    { label: "Homepage", value: client.websiteUrl || "Not linked", status: client.websiteUrl ? "ready" : "missing" },
    { label: "Repository", value: client.repo || "Not linked", status: client.repo ? "ready" : "missing" },
    { label: "Deployment", value: client.vercelUrl || "Not linked", status: client.vercelUrl ? "ready" : "missing" },
    { label: "Backend", value: client.railwayUrl || "Not required unless app/backend exists", status: client.railwayUrl ? "ready" : "optional" },
    { label: "Search profile", value: client.googleBusinessUrl || "Not linked", status: client.googleBusinessUrl ? "ready" : "optional" }
  ];
}

function renderHandoffList(items) {
  return `<div class="handoff-list">
    ${items.map((item) => `<article class="handoff-item">
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <p>${escapeHtml(item.detail)}</p>
      </div>
      <span class="pill ${item.status === "ready" ? "tone-green" : item.status === "blocked" || item.status === "needs-action" ? "tone-red" : "tone-blue"}">${escapeHtml(item.status)}</span>
    </article>`).join("")}
  </div>`;
}

function renderHealthCheckList(items) {
  return `<div class="handoff-list compact">
    ${items.map((item) => `<article class="handoff-item">
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <p>${escapeHtml(item.value)}</p>
      </div>
      <span class="pill ${item.status === "ready" ? "tone-green" : item.status === "missing" ? "tone-yellow" : "tone-blue"}">${escapeHtml(item.status)}</span>
    </article>`).join("")}
  </div>`;
}

function renderClientBuildTasks(client) {
  const tasks = buildClientBuildQueue([client]);
  const activeTasks = Object.entries(tasks)
    .flatMap(([column, items]) => items.map((item) => ({ column, item })))
    .filter((entry) => entry.item);

  return `<div class="ops-mini-list">
    ${activeTasks.length
      ? activeTasks.map((entry) => `<p><strong>${escapeHtml(entry.column)}:</strong> ${escapeHtml(entry.item)}</p>`).join("")
      : "<p>No build tasks generated for this client.</p>"}
  </div>`;
}

function getClientNextActions(client) {
  const actions = [
    ...(Array.isArray(client.actions) ? client.actions : []),
    ...getClientFallbackActions([client])
  ];
  return [...new Set(actions.filter(Boolean))].slice(0, 6);
}

function renderClientNextActions(client) {
  const actions = getClientNextActions(client);
  if (!actions.length) {
    return `<div class="pipeline-empty">No immediate actions generated.</div>`;
  }

  return `<div class="client-next-actions">
    ${actions.map((action) => `<p>${escapeHtml(action)}</p>`).join("")}
  </div>`;
}

function renderClientContactNotes(client) {
  const contactRows = [
    { label: "Primary", value: client.contact || "Not set" },
    { label: "Email", value: client.businessEmail || "Not set" },
    { label: "Phone", value: client.businessPhone || "Not set" },
    { label: "Lead Source", value: getLeadSourceLabel(client) },
    { label: "Source Detail", value: client.leadSourceDetail || "Not set" }
  ];

  return `<div class="client-contact-grid">
    ${contactRows.map((row) => `<div><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(row.value)}</strong></div>`).join("")}
    <div class="client-contact-note"><span>Notes</span><p>${escapeHtml(client.notes || "No notes yet.")}</p></div>
  </div>`;
}

function renderClientUpdateHistory(client) {
  const rows = [
    { label: "Created", value: formatClientDate(client.createdAt) },
    { label: "Updated", value: formatClientDate(client.updatedAt) },
    { label: "Record Source", value: client.source || "runtime" }
  ];

  return `<div class="client-history-grid">
    ${rows.map((row) => `<div><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(row.value)}</strong></div>`).join("")}
  </div>`;
}

function renderClientDataHealth(dataHealth) {
  if (!dataHealth) {
    return "";
  }

  const clean = dataHealth.status === "clean";
  return `<button class="client-board-note client-data-health ${clean ? "is-clean" : "needs-attention"}" type="button" data-client-data-health>
    <div>
      <h3>${clean ? "Client Data Clean" : "Client Data Needs Review"}</h3>
      <p>${clean
        ? "No duplicate client identities or required-field gaps detected."
        : `${dataHealth.duplicateCount || 0} duplicate identity group(s), ${dataHealth.missingRequiredCount || 0} required-field gap(s).`}</p>
    </div>
    <span>${escapeHtml(dataHealth.status || "unknown")}</span>
  </button>`;
}

function renderDataHealthList(title, items, emptyText, renderer) {
  const rows = Array.isArray(items) ? items : [];
  return `<section class="data-health-section">
    <div class="data-health-section-head">
      <h3>${escapeHtml(title)}</h3>
      <span>${rows.length}</span>
    </div>
    ${rows.length
      ? `<div class="data-health-list">${rows.map(renderer).join("")}</div>`
      : `<p>${escapeHtml(emptyText)}</p>`}
  </section>`;
}

function openClientDataHealth() {
  if (!elements.clientDataHealthModal || !elements.clientDataHealthContent) {
    return;
  }

  const dataHealth = liveClientDataHealth || {};
  const duplicateGroups = dataHealth.duplicateGroups || dataHealth.duplicates || [];
  const missingRequired = dataHealth.missingRequired || dataHealth.requiredFieldGaps || dataHealth.missingFields || [];
  elements.clientDataHealthContent.innerHTML = `
    <section class="client-modal-overview data-health-overview ${dataHealth.status === "attention" ? "needs-attention" : "is-clean"}">
      <div>
        <span>Client Records</span>
        <h3>${escapeHtml(dataHealth.status === "attention" ? "Cleanup needed" : "Data is clean")}</h3>
        <p>${escapeHtml(dataHealth.status === "attention"
          ? "Resolve duplicate identities and missing required fields so cards, modals, and pipelines stay synced."
          : "No duplicate client identities or required field gaps are currently detected.")}</p>
      </div>
      <span class="pill ${dataHealth.status === "attention" ? "tone-yellow" : "tone-green"}">${escapeHtml(dataHealth.status || "unknown")}</span>
    </section>
    <div class="client-modal-stats">
      <div><span>Duplicate Groups</span><strong>${escapeHtml(dataHealth.duplicateCount || duplicateGroups.length || 0)}</strong></div>
      <div><span>Field Gaps</span><strong>${escapeHtml(dataHealth.missingRequiredCount || missingRequired.length || 0)}</strong></div>
      <div><span>Source</span><strong>${escapeHtml(dataHealth.source || "runtime scan")}</strong></div>
      <div><span>Last Check</span><strong>${escapeHtml(formatClientDate(dataHealth.checkedAt || dataHealth.updatedAt))}</strong></div>
    </div>
    ${renderDataHealthList("Duplicate Identity Groups", duplicateGroups, "No duplicate identity groups found.", (group) => {
      const clients = group.clients || group.records || group.items || group.entries || [];
      const target = clients[0] || {};
      return `<article>
        <strong>${escapeHtml(group.key || group.identity || group.websiteUrl || "Duplicate group")}</strong>
        <p>${escapeHtml(group.reason || group.message || "These records appear to describe the same client.")}</p>
        <div class="ops-chip-row">${clients.map((client) => `<span>${escapeHtml(client.clientName || client.id || client)}</span>`).join("")}</div>
        ${clients.length > 1 ? `<div class="data-health-actions">
          ${clients.slice(1).map((client) => `<button class="new-client-button secondary-button" type="button" data-client-merge-source="${escapeHtml(client.id || client)}" data-client-merge-target="${escapeHtml(target.id || target)}">Merge ${escapeHtml(client.clientName || client.id || client)} into ${escapeHtml(target.clientName || target.id || target)}</button>`).join("")}
        </div>` : ""}
      </article>`;
    })}
    ${renderDataHealthList("Required Field Gaps", missingRequired, "No required field gaps found.", (item) => `<article>
      <strong>${escapeHtml(item.clientName || item.id || "Client")}</strong>
      <p>${escapeHtml(item.message || item.reason || `Missing ${Array.isArray(item.fields || item.missing) ? (item.fields || item.missing).join(", ") : item.field || "required data"}.`)}</p>
      <div class="ops-chip-row">${(Array.isArray(item.fields || item.missing) ? (item.fields || item.missing) : [item.field]).filter(Boolean).map((field) => `<span>${escapeHtml(field)}</span>`).join("")}</div>
    </article>`)}
  `;
  elements.clientDataHealthModal.classList.remove("view-hidden");
}

function closeClientDataHealth() {
  elements.clientDataHealthModal?.classList.add("view-hidden");
}

function getCockpitClients() {
  return (liveClients?.clients?.length ? mergeClientPayloadWithSeed(liveClients).clients : buildClientPayloadFallback().clients) || [];
}

function buildCockpitActions(clients, tickets, dataHealth) {
  const actions = [];
  const approvalTicket = tickets.find((ticket) => ticket.approvalRequired && !["done", "completed", "merged"].includes(normalizeWebHelperStatus(ticket.status)));
  if (approvalTicket) {
    actions.push({
      title: "Review Web Helper approval",
      detail: `${approvalTicket.clientName || "Client"}: ${approvalTicket.title || approvalTicket.summary || "Request waiting"}`,
      tone: "yellow",
      view: "web-helpers"
    });
  }

  const finalPaymentClient = clients.find((client) => getClientStage(client) === "final-payment" || client.finalPaymentPaid === false && getClientStage(client) === "launch-handoff");
  if (finalPaymentClient) {
    actions.push({
      title: "Check final payment gate",
      detail: `${finalPaymentClient.clientName} is near handoff and should not drift into care until payment/handoff are clear.`,
      tone: "yellow",
      view: "clients"
    });
  }

  if (dataHealth?.status === "attention") {
    actions.push({
      title: "Clean client data health",
      detail: `${dataHealth.duplicateCount || 0} duplicate group(s), ${dataHealth.missingRequiredCount || 0} field gap(s).`,
      tone: "red",
      action: "data-health"
    });
  }

  const buildClient = clients.find((client) => ["deposit-paid", "website-build", "client-review"].includes(getWebClientPipelineStage(client)));
  if (buildClient) {
    actions.push({
      title: "Move active build forward",
      detail: `${buildClient.clientName} is in ${getClientStageLabel(getClientStage(buildClient))}.`,
      tone: "blue",
      view: "clients"
    });
  }

  return actions.slice(0, 5);
}

function renderCockpit() {
  if (!elements.cockpitBoard) {
    return;
  }

  const clients = getCockpitClients();
  const webClients = clients.filter((client) => getClientStage(client) !== "lead");
  const tickets = flattenWebHelperRequests(liveWebHelpers || []);
  const dataHealth = liveClientDataHealth;
  const activeBuilds = webClients.filter((client) => ["deposit-paid", "website-build", "client-review", "final-payment", "launch-handoff"].includes(getWebClientPipelineStage(client)));
  const approvals = tickets.filter((ticket) => ticket.approvalRequired && ["new", "triage", "needs_approval", "approved"].includes(normalizeWebHelperStatus(ticket.status)));
  const blocked = tickets.filter((ticket) => normalizeWebHelperStatus(ticket.status) === "blocked");
  const leadQueue = liveOnboarding?.activation?.queue || [];
  const actions = buildCockpitActions(webClients, tickets, dataHealth);

  const stats = [
    { label: "Active Builds", value: activeBuilds.length, tone: activeBuilds.length ? "blue" : "green" },
    { label: "Approval Gates", value: approvals.length, tone: approvals.length ? "yellow" : "green" },
    { label: "Blocked Tickets", value: blocked.length, tone: blocked.length ? "red" : "green" },
    { label: "Lead Queue", value: leadQueue.length, tone: leadQueue.length ? "blue" : "gray" },
    { label: "Data Health", value: dataHealth?.status || "unknown", tone: dataHealth?.status === "attention" ? "yellow" : "green" }
  ];

  elements.cockpitBoard.innerHTML = `
    <div class="cockpit-stat-grid">
      ${stats.map((stat) => `<article class="cockpit-stat tone-border-${escapeHtml(stat.tone)}">
        <span>${escapeHtml(stat.label)}</span>
        <strong>${escapeHtml(stat.value)}</strong>
      </article>`).join("")}
    </div>
    <div class="cockpit-work-grid">
      <section class="cockpit-lane">
        <div class="cockpit-lane-head">
          <h3>Next Operator Actions</h3>
          <span>${actions.length}</span>
        </div>
        ${actions.length ? actions.map((action) => `<button class="cockpit-action tone-border-${escapeHtml(action.tone)}" type="button" ${action.view ? `data-view-shortcut="${escapeHtml(action.view)}"` : ""} ${action.action ? `data-cockpit-action="${escapeHtml(action.action)}"` : ""}>
          <strong>${escapeHtml(action.title)}</strong>
          <span>${escapeHtml(action.detail)}</span>
        </button>`).join("") : `<div class="pipeline-empty">No urgent operator actions.</div>`}
      </section>
      <section class="cockpit-lane">
        <div class="cockpit-lane-head">
          <h3>Build Focus</h3>
          <span>${activeBuilds.length}</span>
        </div>
        ${activeBuilds.slice(0, 5).map((client) => `<button class="cockpit-mini-card" type="button" data-client-detail="${escapeHtml(client.id)}">
          <strong>${escapeHtml(client.clientName)}</strong>
          <span>${escapeHtml(getClientStageLabel(getClientStage(client)))}</span>
        </button>`).join("") || `<div class="pipeline-empty">No active builds.</div>`}
      </section>
      <section class="cockpit-lane">
        <div class="cockpit-lane-head">
          <h3>Approval Queue</h3>
          <span>${approvals.length}</span>
        </div>
        ${approvals.slice(0, 5).map((ticket) => `<button class="cockpit-mini-card" type="button" data-web-helper-ticket="${escapeHtml(getWebHelperTicketId(ticket))}">
          <strong>${escapeHtml(ticket.clientName || "Client")}</strong>
          <span>${escapeHtml(ticket.title || ticket.summary || "Approval needed")}</span>
        </button>`).join("") || `<div class="pipeline-empty">No approvals waiting.</div>`}
      </section>
    </div>
  `;
}

function renderClientPipeline(clients) {
  if (!elements.clientPipeline) {
    return;
  }

  elements.clientPipeline.innerHTML = webClientPipelineStages
    .map((stage) => {
      const stageClients = clients.filter((client) => getWebClientPipelineStage(client) === stage.id);
      const cards = stageClients.length
        ? stageClients.map((client) => {
          const issueCount = getClientIssueTags(client).length;
          const displayUrl = getClientDisplayUrl(client);
          return `<article class="pipeline-card pipeline-card-compact" draggable="true" data-client-drag="${escapeHtml(client.id)}" data-client-detail="${escapeHtml(client.id)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(client.clientName)} details">
            <div class="pipeline-card-head">
              <h3>${escapeHtml(client.clientName)}</h3>
              <span>${issueCount}</span>
            </div>
            <p>${escapeHtml(displayUrl || "Open details")}</p>
            <small>${escapeHtml(getLeadSourceLabel(client))}${client.businessEmail ? ` / ${escapeHtml(client.businessEmail)}` : ""}</small>
          </article>`;
        }).join("")
        : `<div class="pipeline-empty">No clients</div>`;

      return `<section class="pipeline-column" data-client-stage-drop="${escapeHtml(stage.id)}">
        <div class="pipeline-column-head">
          <h3>${escapeHtml(stage.label)}</h3>
          <span>${stageClients.length}</span>
        </div>
        ${cards}
      </section>`;
    })
    .join("");
}

function getClientServiceDefinition(serviceKey) {
  const definition = clientServiceDefinitions[serviceKey];
  if (definition) {
    return definition;
  }

  return {
    label: titleFromSlug(serviceKey || "Unmapped Service"),
    category: "Custom",
    agreement: "Custom service contract",
    system: "Manual operator",
    pipeline: "custom"
  };
}

function getClientServiceAgreementStatus(client, serviceKey) {
  const stage = getClientStage(client);
  const hasBaseAgreement = Boolean(client.proposalSigned || client.depositPaid || !["lead", "deposit-paid"].includes(stage));
  const hasGrowthAgreement = Boolean(client.partnershipSigned || stage === "growth-services");
  const isPlannedOnly = client.plannedServices?.includes(serviceKey) && !client.services?.includes(serviceKey);

  if (isPlannedOnly) {
    return "planned setup pending";
  }

  if (serviceKey === "website-build") {
    return hasBaseAgreement ? "build agreement complete" : "proposal agreement needed";
  }

  if (serviceKey === "web-helper-care") {
    return client.partnershipSigned || ["web-helper-care", "growth-services", "paused-archived"].includes(stage)
      ? "care contract active"
      : "care contract pending";
  }

  if (["search-intelligence", "local-service"].includes(serviceKey)) {
    return hasGrowthAgreement ? "SEO contract active" : "SEO contract pending";
  }

  if (serviceKey === "content-social") {
    return hasGrowthAgreement ? "social contract active" : "social contract pending";
  }

  if (["lead-funnel", "paid-ads", "ai-automation"].includes(serviceKey)) {
    return hasGrowthAgreement ? "growth contract active" : "growth contract pending";
  }

  if (serviceKey === "ecommerce" || serviceKey === "mobile-app" || serviceKey === "software-tool") {
    return hasBaseAgreement ? "scope active" : "scope contract pending";
  }

  return hasBaseAgreement ? "contract active" : "contract pending";
}

function getAgreementTone(status) {
  if (/needed|missing|pending/i.test(status)) {
    return "tone-yellow";
  }

  if (/active|signed|ready|complete/i.test(status)) {
    return "tone-green";
  }

  return "tone-blue";
}

function getClientServiceDeliveryMeta(client, serviceKey, definition, pipeline) {
  const stage = getClientStage(client);
  const hasRepo = Boolean(client.repo || client.githubUrl);
  const hasVercel = Boolean(client.vercelUrl);
  const hasWebsite = Boolean(client.websiteUrl);
  const isLaunched = ["web-helper-care", "growth-services", "paused-archived", "completed-archived"].includes(stage);
  const isPaidOrLaunched = Boolean(client.finalPaymentPaid || isLaunched);

  if (serviceKey === "website-build") {
    return {
      pipelineLabel: isPaidOrLaunched && hasWebsite ? "Web Delivery complete" : pipeline?.label || "Web Delivery",
      pipelineTone: isPaidOrLaunched && hasWebsite ? "tone-green" : "tone-yellow",
      systemLabel: hasRepo && hasVercel ? "GitHub + Vercel linked" : hasRepo ? "GitHub linked / Vercel missing" : hasVercel ? "Vercel linked / GitHub missing" : "GitHub + Vercel missing",
      systemTone: hasRepo && hasVercel ? "tone-green" : "tone-yellow"
    };
  }

  if (serviceKey === "web-helper-care") {
    const lifecycleStage = getWebHelperCareLifecycleStage(client);
    const lifecycleLabel = lifecycleStage === "active-care" ? "Care active" : lifecycleStage === "memory-build" ? "Building memory" : "Handoff queued";
    return {
      pipelineLabel: lifecycleLabel,
      pipelineTone: lifecycleStage === "active-care" ? "tone-green" : lifecycleStage === "memory-build" ? "tone-blue" : "tone-yellow",
      systemLabel: hasWebsite ? "Helper can monitor site" : "Website URL needed",
      systemTone: hasWebsite ? "tone-green" : "tone-yellow"
    };
  }

  return {
    pipelineLabel: pipeline?.label || titleFromSlug(definition.pipeline || "custom"),
    pipelineTone: client.services?.includes(serviceKey) ? "tone-green" : "tone-blue",
    systemLabel: definition.system,
    systemTone: "tone-blue"
  };
}

function getClientServiceBreakdown(client) {
  const activeServices = [...new Set(client.services || [])].map((serviceKey) => ({
    serviceKey,
    serviceState: "active",
    serviceStateLabel: "Active service"
  }));
  const activeSet = new Set(activeServices.map((entry) => entry.serviceKey));
  const inferredPlannedServices = [...new Set(client.plannedServices || [])];
  if (
    !activeSet.has("web-helper-care") &&
    !inferredPlannedServices.includes("web-helper-care") &&
    shouldSurfaceWebHelperCareHandoff(client)
  ) {
    inferredPlannedServices.push("web-helper-care");
  }
  const plannedServices = inferredPlannedServices
    .filter((serviceKey) => !activeSet.has(serviceKey))
    .map((serviceKey) => ({
      serviceKey,
      serviceState: "planned",
      serviceStateLabel: "Planned next"
    }));

  return [...activeServices, ...plannedServices].map(({ serviceKey, serviceState, serviceStateLabel }) => {
    const definition = getClientServiceDefinition(serviceKey);
    const pipeline = servicePipelineDefinitions.find((entry) => entry.id === definition.pipeline);
    const agreementStatus = getClientServiceAgreementStatus(client, serviceKey);
    const deliveryMeta = getClientServiceDeliveryMeta(client, serviceKey, definition, pipeline);
    return {
      key: serviceKey,
      serviceState,
      serviceStateLabel,
      priceLabel: getClientServicePriceLabel(client, definition),
      ...definition,
      ...deliveryMeta,
      agreementStatus
    };
  });
}

function shouldSurfaceWebHelperCareHandoff(client) {
  const stage = getClientStage(client);
  const hasBuildSignals = Boolean(client.websiteUrl || client.repo || client.githubUrl || client.vercelUrl);
  return hasBuildSignals && ["final-payment", "launch-handoff", "completed-archived"].includes(stage);
}

function getWebHelperCareLifecycleStage(client) {
  const stage = getClientStage(client);
  const activation = client?.webHelperActivation || client?.activation || null;
  const hasActivation = Boolean(activation?.id || activation?.learnedAt || activation?.status);
  const memoryBuilt = hasActivation && Number(activation.memoryDocumentCount || 0) > 0 && activation.repoStatus !== "learn-failed";

  if (!hasActivation) {
    return "handoff";
  }

  if (memoryBuilt) {
    return "active-care";
  }

  return "memory-build";
}

function getClientServicePriceLabel(client, definition) {
  const relationshipType = normalizeClientRelationship(client?.relationshipType);
  const pricingTier = normalizeClientPricingTier(client?.pricingTier, relationshipType);
  if (pricingTier === "custom") {
    return "Custom quote";
  }
  if (pricingTier === "internal") {
    return "Internal allocation";
  }
  return definition?.pricing?.[pricingTier === "partner" || relationshipType === "partner" ? "partner" : "client"] || "Pricing TBD";
}

function getClientUpsellRecommendations(client) {
  const active = new Set(client.services || []);
  const planned = new Set(client.plannedServices || []);
  const stage = getClientStage(client);
  const relationshipType = normalizeClientRelationship(client.relationshipType);
  const candidates = [];
  const pushCandidate = (serviceKey, reason, timing = "Next outreach") => {
    if (active.has(serviceKey)) {
      return;
    }
    const definition = getClientServiceDefinition(serviceKey);
    candidates.push({
      serviceKey,
      label: definition.label,
      reason,
      timing,
      priceLabel: getClientServicePriceLabel(client, definition),
      planned: planned.has(serviceKey),
      relationshipType
    });
  };

  if (["client-review", "final-payment", "launch-handoff", "completed-archived", "web-helper-care"].includes(stage)) {
    pushCandidate("web-helper-care", "Protect the finished website with small approved updates, uptime checks, and request handling.", "After final payment");
  }
  if (client.websiteUrl && !client.googleBusinessUrl) {
    pushCandidate("local-service", "Connect local authority signals and Google Business Profile work for search visibility.", "After launch");
  }
  if (client.websiteUrl) {
    pushCandidate("search-intelligence", "Turn the website into a visibility engine with SEO, AEO, and GEO tracking.", "Growth follow-up");
  }
  if (!active.has("content-social") && (client.socialUrls?.length || ["web-helper-care", "growth-services", "completed-archived"].includes(stage))) {
    pushCandidate("content-social", "Keep social/content touchpoints warm so the site has fresh proof and offer movement.", "Monthly growth");
  }
  if (!active.has("lead-funnel") && ["web-helper-care", "growth-services", "completed-archived"].includes(stage)) {
    pushCandidate("lead-funnel", "Add lead capture, follow-up automation, and request routing after the website foundation is stable.", "Expansion");
  }

  return candidates.slice(0, 4);
}

function renderClientUpsellRecommendations(client) {
  const recommendations = getClientUpsellRecommendations(client);
  if (!recommendations.length) {
    return `<div class="pipeline-empty">No obvious upsell recommendation yet.</div>`;
  }

  return `<div class="client-upsell-list">
    ${recommendations.map((item) => `<article class="client-upsell-card">
      <div>
        <span class="eyebrow">${escapeHtml(item.timing)}</span>
        <h4>${escapeHtml(item.label)}</h4>
        <p>${escapeHtml(item.reason)}</p>
      </div>
      <div class="client-upsell-meta">
        <span class="pill ${item.planned ? "tone-blue" : "tone-yellow"}">${escapeHtml(item.planned ? "planned" : "not mapped")}</span>
        <strong>${escapeHtml(item.priceLabel)}</strong>
        <button type="button" data-client-upsell-email="${escapeHtml(client.id)}" data-client-upsell-service="${escapeHtml(item.serviceKey)}">Draft Email</button>
      </div>
    </article>`).join("")}
  </div>`;
}

function openUpsellEmailAgent(clientId, serviceKey) {
  const client = getClientById(clientId);
  if (!client) {
    return;
  }
  const recommendation = getClientUpsellRecommendations(client).find((item) => item.serviceKey === serviceKey);
  const definition = getClientServiceDefinition(serviceKey);
  const serviceLabel = recommendation?.label || definition.label;
  const prompt = [
    `Draft a client-safe upsell email for ${client.clientName}.`,
    `Relationship: ${getClientRelationshipLabel(client)}.`,
    `Pricing tier: ${normalizeClientPricingTier(client.pricingTier, client.relationshipType)}.`,
    `Current stage: ${getClientStageLabel(getClientStage(client))}.`,
    `Current services: ${(client.services || []).map((service) => getClientServiceDefinition(service).label).join(", ") || "none mapped"}.`,
    `Recommended service: ${serviceLabel}.`,
    `Pricing lane: ${recommendation?.priceLabel || getClientServicePriceLabel(client, definition)}.`,
    `Reason to pitch: ${recommendation?.reason || "Service expansion opportunity."}`,
    `Contact context: ${client.contact || client.businessEmail || client.businessPhone || "contact pending"}.`,
    "Write a concise email draft with a helpful tone, no pressure, and a clear next step. Do not send anything automatically."
  ].join("\n");

  closeClientDetail();
  setActiveView("execution");
  setFocusMode(true, "execution");
  if (elements.executionCommandInput) {
    elements.executionCommandInput.value = prompt;
    elements.executionCommandInput.focus();
  }
  if (elements.executionCommandResponse) {
    elements.executionCommandResponse.textContent = `Upsell email prompt loaded for ${client.clientName}.`;
  }
}

function renderClientServiceBreakdown(client) {
  const services = getClientServiceBreakdown(client);
  if (!services.length) {
    return `<div class="pipeline-empty">No services mapped yet.</div>`;
  }

  const renderGroup = (label, groupServices) =>
    groupServices.length
      ? `<div class="client-service-group">
          <h4>${escapeHtml(label)}</h4>
          ${groupServices.map((service) => `<article class="client-service-row${service.serviceState === "planned" ? " is-planned" : ""}">
            <div>
              <span class="eyebrow">${escapeHtml(service.category)}</span>
              <h4>${escapeHtml(service.label)}</h4>
              <p>${escapeHtml(service.agreement)}</p>
              <p>${escapeHtml(service.priceLabel)}</p>
            </div>
            <div class="client-service-meta">
              <span class="pill ${service.serviceState === "active" ? "tone-green" : "tone-blue"}">${escapeHtml(service.serviceStateLabel)}</span>
              <span class="pill ${getAgreementTone(service.agreementStatus)}">${escapeHtml(service.agreementStatus)}</span>
              <span class="${escapeHtml(service.pipelineTone || "tone-blue")}">${escapeHtml(service.pipelineLabel)}</span>
              <span class="${escapeHtml(service.systemTone || "tone-blue")}">${escapeHtml(service.systemLabel || service.system)}</span>
            </div>
          </article>`).join("")}
        </div>`
      : "";

  return `<div class="client-service-breakdown">
    ${renderGroup("Active Now", services.filter((service) => service.serviceState === "active"))}
    ${renderGroup("Planned / Not Implemented", services.filter((service) => service.serviceState === "planned"))}
  </div>`;
}

function openClientDetail(clientId) {
  const clients = liveClients?.clients?.length ? liveClients.clients : buildClientPayloadFallback().clients;
  const client = clients.find((entry) => entry.id === clientId);
  if (!client || !elements.clientDetailDrawer || !elements.clientDetailContent) {
    return;
  }

  selectedClientId = client.id;
  elements.clientDetailTitle.textContent = client.clientName;
  elements.clientDetailSubtitle.textContent = `${getClientStageLabel(getClientStage(client))} - ${client.plan || "Launch + Care"}`;
  elements.clientDetailContent.innerHTML = `
    <section class="client-modal-overview">
      <div>
        <span class="eyebrow">${escapeHtml(getClientStageLabel(getClientStage(client)))}</span>
        <h3>${escapeHtml(getClientDisplayUrl(client) || client.websiteUrl || client.repo || "Connection details pending")}</h3>
        <p>${escapeHtml(client.notes || "Open links, inspect gaps, confirm handoff state, and route the next operator action.")}</p>
      </div>
      <span class="pill ${getClientIssueTags(client).length ? "tone-yellow" : "tone-green"}">${escapeHtml(getClientIssueTags(client).length ? `${getClientIssueTags(client).length} gaps` : "ready")}</span>
    </section>
    ${renderClientModalStats(client)}
    ${renderClientIssueBadges(client)}
    <div class="client-detail-section client-detail-section-wide client-detail-section-compact">
      <h3>Quick Actions</h3>
      ${renderClientQuickActions(client, { includeDetails: false })}
      <p id="clientProvisionResponse" class="command-response client-provision-response" aria-live="polite"></p>
    </div>
    ${renderClientLeadChecklist(client)}
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
      ${client.railwayUrl ? `<p class="sensitive-link-note">Railway is highlighted because backend/project links are internal infrastructure and stay owner-gated.</p>` : ""}
    </div>
    <div class="client-detail-section">
      <h3>Ordered Services</h3>
      ${renderClientServiceBreakdown(client)}
    </div>
    <div class="client-detail-section">
      <h3>Upsell Agent Prep</h3>
      ${renderClientUpsellRecommendations(client)}
    </div>
    <div class="client-detail-section">
      <h3>Operator Handoff</h3>
      ${renderHandoffList(getClientHandoffItems(client))}
    </div>
    <div class="client-detail-section client-detail-section-wide">
      <h3>Next Actions</h3>
      ${renderClientNextActions(client)}
    </div>
    <div class="client-detail-section">
      <h3>Health Checks</h3>
      ${renderHealthCheckList(getClientHealthChecks(client))}
    </div>
    <div class="client-detail-section">
      <h3>Build Queue</h3>
      ${renderClientBuildTasks(client)}
    </div>
    <div class="client-detail-section">
      <h3>Web Helper Scope</h3>
      <div class="ops-chip-row">
        ${["copy edits", "image swaps", "hours", "broken links", "minor layout bugs", "approval-gated deploys"].map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
    </div>
    <div class="client-detail-section">
      <h3>Contact</h3>
      ${renderClientContactNotes(client)}
    </div>
    <div class="client-detail-section">
      <h3>Update History</h3>
      ${renderClientUpdateHistory(client)}
    </div>
  `;
  elements.clientDetailDrawer.classList.remove("view-hidden");
}

function closeClientDetail() {
  selectedClientId = "";
  elements.clientDetailDrawer?.classList.add("view-hidden");
}

function renderClients(payload) {
  const activePayload = payload?.clients?.length ? mergeClientPayloadWithSeed(payload) : buildClientPayloadFallback();
  liveClientDataHealth = activePayload.dataHealth || null;
  const clients = activePayload.clients || [];
  const webClients = clients.filter((client) => getClientStage(client) !== "lead");
  const summary = summarizeClientsForUi(webClients);

  renderOpsSummary(elements.clientSummary, [
    { label: "Clients", value: summary.clientCount },
    { label: "Website Build", value: summary.websiteBuildCount },
    { label: "Completed / Post-build", value: summary.liveCount },
    { label: "SEO/AEO/GEO", value: summary.searchClients },
    { label: "Connection Gaps", value: summary.connectionGaps }
  ]);

  const filteredClients = getFilteredClients(webClients);
  renderClientPipeline(filteredClients);

  elements.clientCards.innerHTML = webClients.length
    ? filteredClients.length
      ? `${renderClientDataHealth(activePayload.dataHealth)}
        <div class="client-board-note">
          <div>
            <h3>Client Detail Mode</h3>
            <p>Click any client card to open links, handoff state, connection gaps, services, and operator notes in a centered command modal.</p>
          </div>
          <div class="client-board-actions">
            <button type="button" data-run-web-helper-handoff>Run Handoff Automation</button>
            <span>${filteredClients.length} visible</span>
          </div>
        </div>`
      : `<article class="ops-card">
        <h3>No clients match the filters</h3>
        <p>Adjust search, stage, or issue filters to bring clients back into view.</p>
      </article>`
    : `<article class="ops-card">
        <h3>No paid web clients yet</h3>
        <p>Move a lead to deposit paid once the agreement is back and the deposit is paid.</p>
      </article>`;

  const clientActions = webClients.flatMap((client) =>
    (client.actions || []).slice(0, 3).map((action) => `${client.clientName}: ${action}`)
  );
  renderOpsActions(elements.clientActions, clientActions.length ? clientActions : activePayload.actions || [], "Client actions will appear here.");
  updateNavBadges();
  renderCockpit();
}

function getSelectedClientServices() {
  return getSelectedClientServiceState().services;
}

function buildClientSavePayloadFromRecord(client, overrides = {}) {
  return {
    id: client.id,
    clientName: client.clientName,
    stage: getClientStage(client),
    websiteUrl: client.websiteUrl || "",
    repo: client.repo || "",
    railwayUrl: client.railwayUrl || "",
    vercelUrl: client.vercelUrl || "",
    mobileAppUrl: client.mobileAppUrl || "",
    googleBusinessUrl: client.googleBusinessUrl || "",
    leadSource: client.leadSource || "",
    leadSourceDetail: client.leadSourceDetail || "",
    leadStage: deriveLeadStage(client),
    relationshipType: normalizeClientRelationship(client.relationshipType),
    pricingTier: normalizeClientPricingTier(client.pricingTier, client.relationshipType),
    socialUrls: client.socialUrls || [],
    proposalSent: Boolean(client.proposalSent),
    depositInvoiceSent: Boolean(client.depositInvoiceSent),
    proposalSigned: Boolean(client.proposalSigned),
    depositPaid: Boolean(client.depositPaid),
    finalPaymentPaid: Boolean(client.finalPaymentPaid),
    partnershipSigned: Boolean(client.partnershipSigned),
    finalDomainPurchased: client.finalDomainPurchased,
    clientDetailsPending: Boolean(client.clientDetailsPending),
    businessEmail: client.businessEmail || "",
    businessPhone: client.businessPhone || "",
    plan: client.plan || "Launch + Care",
    services: client.services || [],
    plannedServices: client.plannedServices || [],
    contact: client.contact || "",
    notes: client.notes || "",
    ...overrides
  };
}

async function saveClientRecord(payload) {
  const response = await fetch(apiUrl("/mission/clients"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || `Client save failed with status ${response.status}`);
  }

  liveClients = mergeClientPayloadWithSeed(result);
  renderClients(liveClients);
  loadOnboarding();
  renderBuildQueue(getActiveSite() || getEmptySiteState());
  if (activeView === "web-helpers") {
    loadWebHelpers("");
  }
  return result;
}

async function postClientMutation(path, payload) {
  const response = await fetch(apiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || `Client mutation failed with status ${response.status}`);
  }

  liveClients = mergeClientPayloadWithSeed(result);
  renderClients(liveClients);
  loadOnboarding();
  renderBuildQueue(getActiveSite() || getEmptySiteState());
  if (activeView === "web-helpers") {
    loadWebHelpers("");
  }
  return result;
}

async function archiveEditingClient() {
  const clientId = editingClientId || elements.clientEditIdInput?.value;
  if (!clientId) {
    return;
  }

  elements.clientFormResponse.textContent = "Archiving client...";
  try {
    const result = await postClientMutation("/mission/clients/archive", {
      id: clientId,
      stage: "completed-archived",
      finalPaymentPaid: Boolean(elements.clientFinalPaymentInput?.checked),
      note: "Archived from client edit modal."
    });
    elements.clientFormResponse.textContent = `${result.message || "Client archived."}${getClientStorageMessage(result)}`;
    closeClientModal();
  } catch (error) {
    elements.clientFormResponse.textContent = String(error.message || error);
  }
}

async function deleteEditingClient() {
  const clientId = editingClientId || elements.clientEditIdInput?.value;
  const client = getClientById(clientId);
  if (!client) {
    return;
  }

  const confirmed = window.confirm(`Remove ${client.clientName} from Mission Control runtime records? Use this for duplicates or bad records only.`);
  if (!confirmed) {
    return;
  }

  elements.clientFormResponse.textContent = "Deleting duplicate record...";
  try {
    const result = await postClientMutation("/mission/clients/delete", { id: clientId });
    elements.clientFormResponse.textContent = `${result.message || "Client removed."}${getClientStorageMessage(result)}`;
    closeClientModal();
  } catch (error) {
    elements.clientFormResponse.textContent = String(error.message || error);
  }
}

async function mergeClientRecordsFromUi(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) {
    return;
  }

  const source = getClientById(sourceId);
  const target = getClientById(targetId);
  const confirmed = window.confirm(`Merge ${source?.clientName || sourceId} into ${target?.clientName || targetId}? The source duplicate will be removed.`);
  if (!confirmed) {
    return;
  }

  if (elements.clientDataHealthContent) {
    elements.clientDataHealthContent.insertAdjacentHTML("afterbegin", `<p class="command-response">Merging duplicate client records...</p>`);
  }

  try {
    const result = await postClientMutation("/mission/clients/merge", {
      sourceId,
      targetId,
      note: "Merged from Client Data Health."
    });
    liveClientDataHealth = result.dataHealth || liveClientDataHealth;
    openClientDataHealth();
  } catch (error) {
    if (elements.clientDataHealthContent) {
      elements.clientDataHealthContent.insertAdjacentHTML("afterbegin", `<p class="command-response error-text">${escapeHtml(String(error.message || error))}</p>`);
    }
  }
}

function formatProvisionEnvBundle(envBundle) {
  const entries = Object.entries(envBundle?.values || {});
  if (!entries.length) {
    return "No env bundle returned.";
  }

  return entries.map(([key, value]) => `${key}=${value}`).join("\n");
}

async function provisionClientWebHelper(clientId) {
  const client = getClientById(clientId);
  if (!client) {
    return;
  }

  const confirmed = window.confirm(`Provision a Web Helper for ${client.clientName}? This updates Mission Control, activates helper memory, and returns the client env bundle.`);
  if (!confirmed) {
    return;
  }

  const target = document.getElementById("clientProvisionResponse");
  if (target) {
    target.textContent = "Provisioning Web Helper...";
  }

  try {
    const result = await postClientMutation("/mission/clients/provision-web-helper", {
      id: clientId,
      finalPaymentPaid: client.finalPaymentPaid || getClientStage(client) === "completed-archived",
      refresh: true
    });
    const provisioned = result.provisioned || {};
    const envText = formatProvisionEnvBundle(provisioned.envBundle);
    if (target) {
      target.innerHTML = `
        <strong>${escapeHtml(provisioned.message || "Web Helper provisioned.")}</strong>
        <span>Helper: ${escapeHtml(provisioned.webHelperId || "")}</span>
        <span>Activation: ${escapeHtml(provisioned.activation?.status || "ready")}</span>
        <pre>${escapeHtml(envText)}</pre>
      `;
    }
    loadWebHelpers("");
  } catch (error) {
    if (target) {
      target.textContent = String(error.message || error);
    }
  }
}

function setServiceActionButtonState(button, label, disabled = true) {
  if (!button) {
    return;
  }
  if (!button.dataset.originalLabel) {
    button.dataset.originalLabel = button.textContent;
  }
  button.textContent = label;
  button.disabled = disabled;
}

function restoreServiceActionButtonState(button) {
  if (!button) {
    return;
  }
  button.textContent = button.dataset.originalLabel || button.textContent;
  button.disabled = false;
}

function setServiceCardMessage(clientId, message) {
  const target = elements.servicesPanel?.querySelector(`[data-service-card-message="${CSS.escape(clientId)}"]`);
  if (target) {
    target.textContent = message;
  }
}

async function refreshClientWebHelperMemory(clientId, button = null) {
  const client = getClientById(clientId);
  if (!client) {
    return;
  }

  setServiceActionButtonState(button, "Refreshing...");
  setServiceCardMessage(clientId, "Refreshing helper memory...");
  renderOpsActions(elements.serviceActions, [`Refreshing Web Helper memory for ${client.clientName}...`], "Service actions will appear here.");
  try {
    const result = await postClientMutation("/mission/clients/provision-web-helper", {
      id: clientId,
      finalPaymentPaid: true,
      refresh: true,
      command: "Refresh Web Helper memory from service pipeline",
      note: false
    });
    const provisioned = result.provisioned || {};
    const activation = provisioned.activation || {};
    const statusMessage = activation.repoError
      ? `Repo memory issue: ${activation.repoError}`
      : `${activation.agentName || client.clientName} memory refreshed | ${activation.memoryDocumentCount || 0} docs`;
    renderOpsActions(elements.serviceActions, [
      provisioned.message || `${client.clientName} Web Helper memory refreshed.`,
      statusMessage
    ], "Service actions will appear here.");
    liveClients = mergeClientPayloadWithSeed(result);
    renderClients(liveClients);
    renderServices(liveServiceCatalog);
    loadWebHelpers("");
  } catch (error) {
    const message = `${client.clientName} memory refresh failed: ${String(error.message || error)}`;
    setServiceCardMessage(clientId, message);
    renderOpsActions(elements.serviceActions, [message], "Service actions will appear here.");
  } finally {
    restoreServiceActionButtonState(button);
  }
}

function openClientSupportLink(clientId) {
  const client = getClientById(clientId);
  const supportUrl = client?.supportUrl;
  if (!supportUrl) {
    renderOpsActions(elements.serviceActions, [`No support link is available for ${client?.clientName || clientId}.`], "Service actions will appear here.");
    return;
  }
  window.open(supportUrl, "_blank", "noopener,noreferrer");
}

async function sendClientWebHelperTestTicket(clientId, button = null) {
  const client = getClientById(clientId);
  if (!client) {
    return;
  }

  setServiceActionButtonState(button, "Sending...");
  setServiceCardMessage(clientId, "Sending test ticket...");
  renderOpsActions(elements.serviceActions, [`Sending test Web Helper ticket for ${client.clientName}...`], "Service actions will appear here.");
  try {
    const result = await postClientMutation("/mission/clients/test-web-helper-ticket", {
      id: clientId,
      pageUrl: "/",
      summary: `Test Web Helper ticket for ${client.clientName}`,
      details: "Mission Control test ticket. Verify intake, automation, queue movement, and owner review workflow.",
      priority: "low"
    });
    renderOpsActions(elements.serviceActions, [
      result.message || `${client.clientName} test ticket queued.`,
      `Ticket: ${result.ticket?.id || "created"}`
    ], "Service actions will appear here.");
    setServiceCardMessage(clientId, `Test ticket queued: ${result.ticket?.id || "created"}`);
    loadWebHelpers("");
  } catch (error) {
    const message = `${client.clientName} test ticket failed: ${String(error.message || error)}`;
    setServiceCardMessage(clientId, message);
    renderOpsActions(elements.serviceActions, [message], "Service actions will appear here.");
  } finally {
    restoreServiceActionButtonState(button);
  }
}

async function runWebHelperHandoffAutomation() {
  const confirmed = window.confirm("Run Web Helper handoff automation for eligible clients? This provisions missing helpers and builds memory packs where client website and repo details are ready.");
  if (!confirmed) {
    return;
  }

  renderOpsActions(elements.clientActions, ["Running Web Helper handoff automation..."], "Client actions will appear here.");
  try {
    const result = await postClientMutation("/mission/clients/run-web-helper-handoff-automation", {});
    const automation = result.automation || {};
    const messages = [
      result.message || "Web Helper handoff automation completed.",
      ...(automation.provisioned || []).map((entry) => `${entry.clientName}: helper provisioned and memory activated.`),
      ...(automation.existing || []).map((entry) => `${entry.clientName}: helper already active.`),
      ...(automation.skipped || []).map((entry) => `${entry.clientName}: skipped - ${entry.reason}`),
      ...(automation.failed || []).map((entry) => `${entry.clientName}: failed - ${entry.error}`)
    ];
    renderOpsActions(elements.clientActions, messages, "Client actions will appear here.");
    loadWebHelpers("");
  } catch (error) {
    renderOpsActions(elements.clientActions, [`Web Helper handoff automation failed: ${String(error.message || error)}`], "Client actions will appear here.");
  }
}

function getClientStorageMessage(result) {
  const write = result?.storage?.lastWrite || result?.storage?.database?.lastWrite || result?.storage?.repoStore?.lastWrite;
  const databaseWrite = result?.storage?.database?.lastWrite;
  const repoWrite = result?.storage?.repoStore?.lastWrite;
  if (!write) {
    return "";
  }

  if (write.ok && write.target === "postgres") {
    return " Saved to Railway Postgres.";
  }

  if (write.ok && write.target === "github") {
    if (databaseWrite && !databaseWrite.ok) {
      return ` Saved to Mission Control repo store; Postgres needs attention: ${databaseWrite.error || databaseWrite.reason || "check DATABASE_URL"}.`;
    }
    return " Saved to Mission Control repo store.";
  }

  if (databaseWrite && !databaseWrite.ok && repoWrite && !repoWrite.ok) {
    return ` Saved locally, but Postgres and repo store did not update: ${databaseWrite.error || databaseWrite.reason || repoWrite.error || "check DATABASE_URL"}.`;
  }

  return ` Saved locally, but persistent store did not update: ${write.error || write.reason || "check DATABASE_URL"}.`;
}

function didClientRepoStoreFail(result) {
  const write = result?.storage?.lastWrite || result?.storage?.database?.lastWrite || result?.storage?.repoStore?.lastWrite;
  return Boolean(write && !write.ok);
}

async function updateClientStage(clientId, stageId) {
  const client = getClientById(clientId);
  if (!client || getClientStage(client) === stageId) {
    return;
  }

  const targetStage = webClientPipelineStages.find((stage) => stage.id === stageId);
  if (!targetStage) {
    return;
  }

  const payload = buildClientSavePayloadFromRecord(client, { stage: stageId });
  try {
    const result = await saveClientRecord(payload);
    if (didClientRepoStoreFail(result)) {
      renderOpsActions(elements.clientActions, [`${client.clientName}:${getClientStorageMessage(result)}`], "Client actions will appear here.");
    }
  } catch (error) {
    renderOpsActions(elements.clientActions, [`${client.clientName}: ${String(error.message || error)}`], "Client actions will appear here.");
  }
}

async function submitClientOnboarding(event) {
  event.preventDefault();
  if (!elements.clientOnboardForm) {
    return;
  }

  const payload = {
    id: editingClientId || elements.clientEditIdInput?.value || undefined,
    clientName: elements.clientNameInput?.value || "",
    stage: elements.clientStageInput?.value || "website-build",
    websiteUrl: elements.clientWebsiteInput?.value || "",
    repo: elements.clientRepoInput?.value || "",
    railwayUrl: elements.clientRailwayInput?.value || "",
    vercelUrl: elements.clientVercelInput?.value || "",
    mobileAppUrl: elements.clientMobileAppInput?.value || "",
    googleBusinessUrl: elements.clientGoogleBusinessInput?.value || "",
    leadSource: elements.clientLeadSourceInput?.value || "",
    leadSourceDetail: elements.clientLeadSourceDetailInput?.value || "",
    leadStage: elements.clientLeadStageInput?.value || "",
    relationshipType: normalizeClientRelationship(elements.clientRelationshipInput?.value),
    pricingTier: normalizeClientPricingTier(elements.clientPricingTierInput?.value, elements.clientRelationshipInput?.value),
    socialUrls: String(elements.clientSocialsInput?.value || "")
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean),
    proposalSent: Boolean(elements.clientProposalSentInput?.checked),
    depositInvoiceSent: Boolean(elements.clientDepositInvoiceSentInput?.checked),
    proposalSigned: Boolean(elements.clientProposalInput?.checked),
    depositPaid: Boolean(elements.clientDepositInput?.checked),
    finalPaymentPaid: Boolean(elements.clientFinalPaymentInput?.checked),
    partnershipSigned: Boolean(elements.clientPartnershipInput?.checked),
    finalDomainPurchased: Boolean(elements.clientFinalDomainInput?.checked),
    clientDetailsPending: Boolean(elements.clientDetailsPendingInput?.checked),
    businessEmail: elements.clientBusinessEmailInput?.value || "",
    businessPhone: elements.clientBusinessPhoneInput?.value || "",
    plan: elements.clientPlanInput?.value || "",
    ...getSelectedClientServiceState(),
    contact: elements.clientContactInput?.value || "",
    notes: elements.clientNotesInput?.value || ""
  };

  if (!payload.clientName.trim()) {
    elements.clientFormResponse.textContent = "Client name is required.";
    return;
  }

  if (payload.depositPaid) {
    payload.proposalSent = true;
    payload.depositInvoiceSent = true;
    payload.proposalSigned = true;
    if (payload.stage === "lead") {
      payload.stage = "deposit-paid";
    }
  } else if (payload.proposalSigned) {
    payload.proposalSent = true;
  } else if (payload.depositInvoiceSent) {
    payload.proposalSent = true;
  }
  if (
    payload.finalPaymentPaid &&
    payload.stage === "final-payment" &&
    !payload.partnershipSigned
  ) {
    payload.stage = "launch-handoff";
  }
  payload.leadStage = payload.leadStage || deriveLeadStage(payload);

  const isEditing = Boolean(payload.id);
  elements.clientFormResponse.textContent = isEditing ? "Saving client record..." : "Creating client record...";

  try {
    const result = await saveClientRecord(payload);
    const provisionNote = result.provisioned
      ? ` ${result.provisioned.message || "Web Helper auto-provisioned."}`
      : "";
    elements.clientFormResponse.textContent = `${isEditing ? "Saved" : "Created"} ${result.created.clientName}.${getClientStorageMessage(result)}${provisionNote}`;
    if (!didClientRepoStoreFail(result)) {
      closeClientModal();
    }
  } catch (error) {
    elements.clientFormResponse.textContent = String(error.message || error);
  }
}

async function loadOnboarding() {
  if (!elements.onboardingSummary || !elements.onboardingQueue || !elements.onboardingConnections || !elements.onboardingStages) {
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
  const tasks = buildOnboardingTasks({ ...client, connections });
  const requiredTasks = tasks.filter((task) => task.required && task.status !== "skipped");
  const readyRequired = requiredTasks.filter((task) =>
    ["complete", "ready", "active"].includes(task.status)
  );
  const blockers = requiredTasks.filter((task) =>
    ["missing", "access-needed", "blocked"].includes(task.status)
  );
  const progress = requiredTasks.length ? Math.round((readyRequired.length / requiredTasks.length) * 100) : 100;

  return {
    ...client,
    progress,
    blockerCount: blockers.length,
    blockers,
    nextAction: blockers[0] ? blockers[0].title : getLeadDeskNextAction(client),
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

const onboardingBuckets = [
  { id: "intake", label: "Lead Intake" },
  { id: "proposal", label: "Proposal + Invoice" },
  { id: "agreement", label: "Agreement" },
  { id: "deposit", label: "Deposit / Build Queue" }
];

const fallbackOnboardingStages = [
  {
    name: "Lead Intake",
    status: "ready",
    description: "Capture the inquiry source, phone or messenger notes, contact method, and basic business fit.",
    requiredArtifacts: ["Lead record", "Primary contact", "Discovery notes"],
    automations: ["Create lead record", "Queue proposal follow-up"]
  },
  {
    name: "Proposal + Deposit Invoice",
    status: "ready",
    description: "Email the website project proposal and deposit invoice after the call or messenger conversation.",
    requiredArtifacts: ["Proposal sent", "Deposit invoice sent", "Build scope"],
    automations: ["Flag unsent proposal", "Remind on stale invoice"]
  },
  {
    name: "Agreement Returned",
    status: "ready",
    description: "Track signed proposal agreement before the website build enters paid production work.",
    requiredArtifacts: ["Signed agreement", "Approval contact", "Payment expectation"],
    automations: ["Escalate unsigned agreement", "Prepare deposit follow-up"]
  },
  {
    name: "Deposit Paid / Build Queue",
    status: "ready",
    description: "Once deposit is paid, move the client into the web build queue for initial draft production.",
    requiredArtifacts: ["Deposit paid", "Initial draft notes", "Build queue status"],
    automations: ["Move to deposit paid", "Queue initial draft"]
  }
];

const fallbackServiceCatalog = [
  {
    id: "website-build",
    name: "Website Build",
    status: "active",
    category: "Launch",
    owner: "Build Operator",
    description: "Discovery, design, build, review, final payment, launch, and handoff into maintenance.",
    connectedSystems: ["Clients", "Lead Desk", "Build Queue", "GitHub", "Vercel"],
    triggers: ["Initial deposit paid", "New build approved", "Client revision received"],
    nextActions: ["Create client profile", "Link repo and deployment", "Define launch checklist"]
  },
  {
    id: "web-helper-care",
    name: "Web Helper Care",
    status: "active",
    category: "Maintenance",
    owner: "Web Helper Agent",
    description: "Client request handling, small edits, safe fixes, approval gates, deploy notes, and client replies.",
    connectedSystems: ["Web Helpers", "Approvals", "GitHub", "Vercel"],
    triggers: ["Completion payment received", "Client update request", "Site issue detected"],
    nextActions: ["Attach agent memory", "Set scope rules", "Connect approved contacts"]
  },
  {
    id: "search-intelligence",
    name: "SEO / AEO / GEO",
    status: "integration-needed",
    category: "Growth",
    owner: "Search Intelligence Agent",
    description: "Organic search, answer engine readiness, and generative engine visibility through geo.ghostai.solutions.",
    connectedSystems: ["geo.ghostai.solutions", "Reports", "Web Helpers", "Approvals"],
    triggers: ["New client onboarded", "Ranking issue", "AI visibility opportunity"],
    nextActions: ["Add API credentials", "Map siteId to GEO profile", "Import scores and recommendations"]
  },
  {
    id: "lead-funnel",
    name: "Lead Funnel",
    status: "planned",
    category: "Growth",
    owner: "Funnel Monitor Agent",
    description: "Lead capture, conversion path monitoring, follow-up routing, and form health.",
    connectedSystems: ["Forms", "CRM", "Analytics", "Client Reports"],
    triggers: ["Lead drop", "Form failure", "Campaign launch"],
    nextActions: ["Define conversion events", "Connect CRM", "Add form probes"]
  },
  {
    id: "content-social",
    name: "Content + Social",
    status: "planned",
    category: "Marketing",
    owner: "Content Operator",
    description: "Content briefs, posting queue, social distribution, business page posting, and campaign support.",
    connectedSystems: ["Social Pages", "Google Business", "Content Tools", "Search Intelligence"],
    triggers: ["Content calendar due", "GEO topic gap", "Campaign push"],
    nextActions: ["Connect social pages", "Create monthly plan", "Set approval rules"]
  },
  {
    id: "paid-ads",
    name: "Paid Ads",
    status: "planned",
    category: "Growth",
    owner: "Ads Operator",
    description: "Ad account access, campaign setup, landing-page alignment, tracking, and performance review.",
    connectedSystems: ["Meta Ads", "Google Ads", "Analytics", "Lead Funnel"],
    triggers: ["Ad package sold", "Campaign refresh", "Conversion tracking issue"],
    nextActions: ["Collect ad account access", "Confirm budget rules", "Connect tracking"]
  },
  {
    id: "ecommerce",
    name: "Commerce Ops",
    status: "active",
    category: "Commerce",
    owner: "Commerce Operator",
    description: "Storefront maintenance, product updates, checkout health, fulfillment handoffs, and growth offers.",
    connectedSystems: ["Storefront", "Payments", "Inventory", "Client Reports"],
    triggers: ["Product update", "Checkout issue", "Promotion launch"],
    nextActions: ["Map product workflow", "Connect payment health", "Define fulfillment checks"]
  },
  {
    id: "mobile-app",
    name: "Mobile App Builds",
    status: "planned",
    category: "Mobile",
    owner: "App Build Operator",
    description: "Mobile app scoping, build pipeline, store release path, and post-launch care.",
    connectedSystems: ["App Build Queue", "Client Approvals", "Store Accounts"],
    triggers: ["Mobile app sold", "Client app idea approved", "Portal expansion"],
    nextActions: ["Define app scope", "Collect store accounts", "Create release checklist"]
  },
  {
    id: "ai-automation",
    name: "AI Automation",
    status: "planned",
    category: "Automation",
    owner: "Automation Operator",
    description: "Workflow agents, lead systems, CRM automations, Slack approvals, and revenue operations.",
    connectedSystems: ["Ghost Lead Command", "GhostCRM", "Slack", "Tool Registry"],
    triggers: ["Automation package sold", "Manual process identified", "Lead system requested"],
    nextActions: ["Map workflow", "Define approval gates", "Connect CRM and Slack"]
  },
  {
    id: "reporting",
    name: "Client Reporting",
    status: "planned",
    category: "Retention",
    owner: "Reporting Agent",
    description: "Monthly service summaries, completed work, search visibility, site health, and next-best investment.",
    connectedSystems: ["Mission History", "Search Intelligence", "Web Helpers", "Billing"],
    triggers: ["Monthly report due", "Client check-in", "Renewal window"],
    nextActions: ["Create report template", "Map service KPIs", "Add export workflow"]
  }
];

function getConnectionByLabel(client, label) {
  return (client.connections || []).find((connection) => connection.label === label) || null;
}

function hasEmail(value) {
  return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(String(value || ""));
}

function hasPhone(value) {
  return /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(String(value || ""));
}

function makeOnboardingTask(client, bucket, title, status, detail, options = {}) {
  const id = options.id || slugForUi(title);
  const skipped = isOnboardingSkipped(client.id, id);
  return {
    id,
    bucket,
    title,
    status: skipped ? "skipped" : status,
    detail,
    clientId: client.id,
    clientName: client.clientName,
    required: Boolean(options.required),
    skipped
  };
}

function getLeadDeskColumnId(client) {
  return deriveLeadStage(client);
}

function getLeadStageSaveOverrides(leadStage) {
  const columnId = normalizeLeadStageForUi(leadStage);
  const base = { leadStage: columnId };
  if (columnId === "new-lead") {
    return {
      ...base,
      stage: "lead",
      proposalSent: false,
      depositInvoiceSent: false,
      proposalSigned: false,
      depositPaid: false
    };
  }
  if (columnId === "contacted-discovery") {
    return {
      ...base,
      stage: "lead",
      proposalSent: false,
      depositInvoiceSent: false,
      proposalSigned: false,
      depositPaid: false
    };
  }
  if (columnId === "proposal-sent") {
    return {
      ...base,
      stage: "lead",
      proposalSent: true,
      depositInvoiceSent: true,
      proposalSigned: false,
      depositPaid: false
    };
  }
  if (columnId === "agreement-returned") {
    return {
      ...base,
      stage: "lead",
      proposalSent: true,
      depositInvoiceSent: true,
      proposalSigned: true,
      depositPaid: false
    };
  }
  if (columnId === "deposit-paid") {
    return {
      ...base,
      stage: "deposit-paid",
      proposalSent: true,
      depositInvoiceSent: true,
      proposalSigned: true,
      depositPaid: true
    };
  }
  if (columnId === "lost-not-now") {
    return {
      ...base,
      stage: "paused-archived"
    };
  }
  return null;
}

async function updateLeadStage(clientId, leadStage) {
  const client = getClientById(clientId);
  const overrides = getLeadStageSaveOverrides(leadStage);
  if (!client || !overrides || deriveLeadStage(client) === overrides.leadStage) {
    return;
  }

  const payload = buildClientSavePayloadFromRecord(client, overrides);
  try {
    const result = await saveClientRecord(payload);
    if (didClientRepoStoreFail(result)) {
      renderOpsActions(elements.onboardingActions, [`${client.clientName}:${getClientStorageMessage(result)}`], "Lead actions will appear here.");
    }
  } catch (error) {
    renderOpsActions(elements.onboardingActions, [`${client.clientName}: ${String(error.message || error)}`], "Lead actions will appear here.");
  }
}

function getLeadDeskNextAction(client) {
  const column = getLeadDeskColumnId(client);
  if (column === "new-lead") {
    return "Capture discovery notes, contact path, and lead source.";
  }
  if (column === "contacted-discovery") {
    return "Send project proposal and deposit invoice.";
  }
  if (column === "proposal-sent") {
    return "Follow up for signed agreement.";
  }
  if (column === "agreement-returned") {
    return "Follow up on deposit payment.";
  }
  if (column === "deposit-paid") {
    return "Queued in Web Clients for the initial website build.";
  }
  return "Decide whether to revive, archive, or remove this lead.";
}

function getLeadCardSourceLine(client) {
  const source = getLeadSourceLabel(client);
  const detail = String(client.leadSourceDetail || "").trim();
  return detail ? `${source}: ${detail}` : source;
}

function getLeadCardContactLine(client) {
  const contact = String(client.contact || "").trim();
  const email = String(client.businessEmail || "").trim();
  const phone = String(client.businessPhone || "").trim();
  if (contact && email) {
    return `${contact} / ${email}`;
  }
  return contact || email || phone || "Contact pending";
}

function getLeadNextStageId(client) {
  const column = getLeadDeskColumnId(client);
  if (column === "new-lead") {
    return "contacted-discovery";
  }
  if (column === "contacted-discovery") {
    return "proposal-sent";
  }
  if (column === "proposal-sent") {
    return "agreement-returned";
  }
  if (column === "agreement-returned") {
    return "deposit-paid";
  }
  return "";
}

function getLeadNotificationItems(client) {
  const tasks = buildOnboardingTasks(client);
  const activeTasks = tasks.filter((task) => ["missing", "blocked", "access-needed", "planned"].includes(task.status));
  const column = getLeadDeskColumnId(client);
  if (column === "deposit-paid") {
    return [
      {
        title: "Closed lead queued",
        detail: "This won client is visible in Web Clients for website build work.",
        status: "ready"
      }
    ];
  }
  if (column === "lost-not-now") {
    return [
      {
        title: "Paused or lost lead",
        detail: "Decide whether to revive, archive, or remove this lead.",
        status: "planned"
      }
    ];
  }
  return activeTasks.length
    ? activeTasks.slice(0, 4)
    : [
        {
          title: "Ready for next step",
          detail: getLeadDeskNextAction(client),
          status: "ready"
        }
      ];
}

function getLeadNotificationCount(client) {
  return getLeadNotificationItems(client).length;
}

function renderLeadNotificationButton(client) {
  const count = getLeadNotificationCount(client);
  return `<button class="lead-notification-button" type="button" data-lead-notification="${escapeHtml(client.id)}" aria-label="Open ${escapeHtml(client.clientName)} lead notifications">
    <span>!</span>
    <strong>${escapeHtml(String(count))}</strong>
  </button>`;
}

function renderLeadNotificationActions(client) {
  const nextStageId = getLeadNextStageId(client);
  const isClosedLead = getLeadDeskColumnId(client) === "deposit-paid";
  const actions = [
    `<button type="button" data-lead-notification-detail="${escapeHtml(client.id)}">${isClosedLead ? "Review Build Queue" : "Open Details"}</button>`,
    `<button type="button" data-lead-notification-edit="${escapeHtml(client.id)}">Edit Client</button>`
  ];
  if (nextStageId) {
    actions.unshift(`<button type="button" data-lead-action-stage="${escapeHtml(nextStageId)}">Move to ${escapeHtml(getLeadStageLabel(nextStageId))}</button>`);
  }
  return `<div class="lead-notification-actions">${actions.join("")}</div>`;
}

function openLeadNotification(clientId) {
  const client = (liveOnboarding?.activation?.queue || []).find((entry) => entry.id === clientId) || getClientById(clientId);
  if (!client || !elements.leadNotificationModal || !elements.leadNotificationContent) {
    return;
  }

  selectedLeadNotificationId = client.id;
  const columnId = getLeadDeskColumnId(client);
  if (elements.leadNotificationTitle) {
    elements.leadNotificationTitle.textContent = client.clientName;
  }
  if (elements.leadNotificationSubtitle) {
    elements.leadNotificationSubtitle.textContent = `${getLeadStageLabel(columnId)} - ${getLeadSourceLabel(client)}`;
  }
  const items = getLeadNotificationItems(client);
  elements.leadNotificationContent.innerHTML = `
    <section class="lead-notification-summary">
      <span class="pill ${columnId === "deposit-paid" ? "tone-green" : columnId === "lost-not-now" ? "tone-gray" : "tone-yellow"}">${escapeHtml(getLeadStageLabel(columnId))}</span>
      <p>${escapeHtml(client.nextAction || getLeadDeskNextAction(client))}</p>
    </section>
    <div class="lead-notification-list">
      ${items.map((item) => `<article class="lead-notification-item">
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.detail)}</p>
        </div>
        <span class="pill ${getStatusTone(item.status)}">${escapeHtml(item.status)}</span>
      </article>`).join("")}
    </div>
    ${renderLeadNotificationActions(client)}
  `;
  elements.leadNotificationModal.classList.remove("view-hidden");
}

function closeLeadNotification() {
  selectedLeadNotificationId = "";
  elements.leadNotificationModal?.classList.add("view-hidden");
}

function renderLeadSourceStrip(queue) {
  const counts = new Map();
  queue.forEach((client) => {
    const sourceId = client.leadSource || "source-pending";
    counts.set(sourceId, (counts.get(sourceId) || 0) + 1);
  });

  const rows = [
    ...leadSourceDefinitions,
    { id: "source-pending", label: "Source Pending", detail: "Lead source still needs to be tagged.", status: "missing" }
  ];

  return `<div class="lead-source-strip">
    ${rows.map((source) => `<article class="lead-source-chip ${counts.get(source.id) ? "has-count" : ""}">
      <span>${escapeHtml(source.label)}</span>
      <strong>${escapeHtml(String(counts.get(source.id) || 0))}</strong>
      <p>${escapeHtml(source.detail)}</p>
    </article>`).join("")}
  </div>`;
}

function renderLeadDeskPipeline(queue) {
  return `<div class="lead-desk-flow lead-kanban-board">
    ${leadDeskColumns.map((column) => {
      const clients = queue.filter((client) => getLeadDeskColumnId(client) === column.id);
      return `<section class="onboarding-column lead-drop-column" data-lead-stage-drop="${escapeHtml(column.id)}">
        <div class="onboarding-column-head">
          <div>
            <h3>${escapeHtml(column.label)}</h3>
            <p>${escapeHtml(column.helper)}</p>
          </div>
          <span>${clients.length}</span>
        </div>
        ${clients.length ? clients.map((client) => `<article class="onboarding-client-card lead-card" draggable="true" data-lead-drag="${escapeHtml(client.id)}" data-client-detail="${escapeHtml(client.id)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(client.clientName)} details">
          ${renderLeadNotificationButton(client)}
          <div class="onboarding-client-head">
            <div>
              <h3>${escapeHtml(client.clientName)}</h3>
              <p>${escapeHtml(getLeadCardSourceLine(client))}</p>
              <p>${escapeHtml(getLeadCardContactLine(client))}</p>
            </div>
            <span class="pill ${column.id === "deposit-paid" ? "tone-green" : column.id === "lost-not-now" ? "tone-gray" : column.id === "agreement-returned" ? "tone-blue" : "tone-yellow"}">${escapeHtml(getLeadStageLabel(column.id))}</span>
          </div>
          <p>${escapeHtml(client.nextAction || getLeadDeskNextAction(client))}</p>
        </article>`).join("") : `<div class="pipeline-empty">No leads</div>`}
      </section>`;
    }).join("")}
  </div>`;
}

function syncOnboardingClientWithRoster(client) {
  const liveClient = getClientById(client.id) || getClientBySharedIdentity(client);
  if (!liveClient) {
    return client;
  }

  return {
    ...mergeClientRecordsForUi(client, liveClient),
    connections: client.connections || [],
    progress: client.progress,
    blockerCount: client.blockerCount,
    checklist: client.checklist || [],
    nextAction: client.nextAction || getLeadDeskNextAction(liveClient)
  };
}

function renderLeadChecklistList(client) {
  const tasks = buildOnboardingTasks(client);
  return `<div class="lead-checklist-list">
    ${tasks.map((task) => `<article class="lead-checklist-item">
      <div>
        <h4>${escapeHtml(task.title)}</h4>
        <p>${escapeHtml(task.detail)}</p>
      </div>
      <span class="pill ${getStatusTone(task.status)}">${escapeHtml(task.status)}</span>
    </article>`).join("")}
  </div>`;
}

function renderClientLeadChecklist(client) {
  if (!isLeadDeskClient(client)) {
    return "";
  }

  return `<div class="client-detail-section client-detail-section-wide">
    <h3>Lead / Proposal Checklist</h3>
    ${renderLeadChecklistList(client)}
  </div>`;
}

function buildOnboardingTasks(client) {
  const contact = client.contact || "";
  const businessEmail = client.businessEmail || "";
  const businessPhone = client.businessPhone || "";
  const hasContactMethod = hasEmail(contact) || hasPhone(contact) || hasEmail(businessEmail) || hasPhone(businessPhone);
  const proposalSent = client.proposalSent || client.proposalSigned || client.depositPaid;
  const depositInvoiceSent = client.depositInvoiceSent || client.depositPaid;
  const proposalSigned = client.proposalSigned || client.depositPaid;
  const depositPaid = client.depositPaid || getClientStage(client) === "deposit-paid";

  return [
    makeOnboardingTask(client, "intake", "Lead source", client.leadSource ? "complete" : "missing", client.leadSource ? `${getLeadSourceLabel(client)}${client.leadSourceDetail ? ` - ${client.leadSourceDetail}` : ""}` : "Tag the lead as social media, referral, Ghost Lead Command, digital business card, email, AI outreach, or manual.", { required: true }),
    makeOnboardingTask(client, "intake", "Discovery call / message thread", client.notes ? "complete" : "missing", client.notes || "Capture what they asked for over phone or Facebook Messenger.", { required: true }),
    makeOnboardingTask(client, "intake", "Primary contact", contact ? "complete" : "missing", contact || "Name, role, and best contact method.", { required: true }),
    makeOnboardingTask(client, "intake", "Email or phone", hasContactMethod ? "complete" : "missing", businessEmail || businessPhone || "At least one contact path is needed before sending proposal.", { required: true }),
    makeOnboardingTask(client, "proposal", "Project proposal sent", proposalSent ? "complete" : "missing", "Email the website project proposal after the discussion.", { required: true }),
    makeOnboardingTask(client, "proposal", "Deposit invoice sent", depositInvoiceSent ? "complete" : "missing", "Send the deposit invoice with the proposal email.", { required: true }),
    makeOnboardingTask(client, "agreement", "Signed project agreement", proposalSigned ? "complete" : "missing", "Client replied with agreement to the proposal terms.", { required: true }),
    makeOnboardingTask(client, "deposit", "Deposit paid", depositPaid ? "complete" : "missing", "Deposit must be paid before initial draft work begins.", { required: true }),
    makeOnboardingTask(client, "deposit", "Initial draft queue", depositPaid ? "ready" : "planned", depositPaid ? "Move this client into the website build queue." : "Waiting for deposit before build queue.", { required: true })
  ];
}

function renderOnboardingCard(task) {
  return `<article class="onboarding-client-card">
    <div class="onboarding-client-head">
      <div>
        <h3>${escapeHtml(task.title)}</h3>
        <p>${escapeHtml(task.clientName)}</p>
      </div>
      <span class="pill ${getStatusTone(task.status)}">${escapeHtml(task.status)}</span>
    </div>
    <p>${escapeHtml(task.detail)}</p>
    <div class="onboarding-checklist">
      <div>
        <span>${task.required ? "Required" : "Optional"}</span>
        <strong class="${getStatusTone(task.status)}">${escapeHtml(task.status)}</strong>
        <button type="button" data-onboarding-skip-client="${escapeHtml(task.clientId)}" data-onboarding-skip-item="${escapeHtml(task.id)}">${task.skipped ? "Unskip" : "Skip"}</button>
      </div>
    </div>
  </article>`;
}

function getOnboardingFilters() {
  return {
    query: String(elements.onboardingSearchInput?.value || "").trim().toLowerCase(),
    bucket: elements.onboardingBucketFilter?.value || "all",
    status: elements.onboardingStatusFilter?.value || "all"
  };
}

function taskMatchesOnboardingFilters(task, filters) {
  const matchesBucket = filters.bucket === "all" || task.bucket === filters.bucket;
  const matchesStatus = filters.status === "all" || task.status === filters.status;
  const haystack = `${task.title} ${task.clientName} ${task.detail} ${task.status}`.toLowerCase();
  const matchesQuery = !filters.query || haystack.includes(filters.query);
  return matchesBucket && matchesStatus && matchesQuery;
}

function clientMatchesOnboardingFilters(client, filters, clientTasks) {
  const haystack = `${client.clientName} ${client.stageLabel} ${client.plan} ${client.nextAction} ${getLeadSourceLabel(client)} ${client.leadSourceDetail || ""} ${(client.blockers || []).map((blocker) => blocker.label || blocker.title).join(" ")}`.toLowerCase();
  return !filters.query || haystack.includes(filters.query) || clientTasks.some((task) => taskMatchesOnboardingFilters(task, filters));
}

function getSkippedOnboardingCount(tasks) {
  return tasks.filter((task) => task.skipped || task.status === "skipped").length;
}

function renderOnboarding(payload) {
  const filters = getOnboardingFilters();
  const rawQueue = (payload?.activation?.queue || []).map(syncOnboardingClientWithRoster).map(applyOnboardingSkips);
  const tasksByClient = new Map(rawQueue.map((client) => [client.id, buildOnboardingTasks(client)]));
  const queue = rawQueue.filter((client) => clientMatchesOnboardingFilters(client, filters, tasksByClient.get(client.id) || []));
  const onboardingTasks = queue.flatMap((client) => tasksByClient.get(client.id) || []);
  const summary = payload?.summary || {
    activeClients: 0,
    blockedClients: 0,
    proposalsSent: 0,
    agreementsReturned: 0,
    depositPaid: 0,
    openTasks: 0
  };
  renderOpsSummary(elements.onboardingSummary, [
    { label: "Active Leads", value: summary.activeClients || 0 },
    { label: "Proposals Sent", value: summary.proposalsSent || 0 },
    { label: "Agreements Back", value: summary.agreementsReturned || 0 },
    { label: "Deposits Paid", value: summary.depositPaid || 0 },
    { label: "Skipped Items", value: getSkippedOnboardingCount(onboardingTasks) }
  ]);

  const boardEmptyCopy = rawQueue.length
    ? "No matching items for the current filters."
    : "Add the next lead to track proposal, invoice, agreement, and deposit follow-up.";
  elements.onboardingQueue.innerHTML = `<div class="onboarding-section-title">
      <h3>Lead Flow</h3>
      <p>Move prospects from social media, referrals, Lead Command, digital cards, email, and AI outreach into proposal follow-up and paid build work.</p>
    </div>
    ${renderLeadSourceStrip(rawQueue)}
    ${renderLeadDeskPipeline(queue)}
    ${queue.length ? `<div class="client-board-note">
      <div>
        <h3>Lead Detail Mode</h3>
        <p>Drag lead cards between stages, then open any card to edit contact info, source, proposal status, services, and checklist items.</p>
      </div>
      <span>${queue.length} visible</span>
    </div>` : `<article class="onboarding-empty-state">
      <h3>No active lead cards</h3>
      <p>${escapeHtml(boardEmptyCopy)}</p>
    </article>`}`;

  elements.onboardingConnections.innerHTML = "";

  const stages = payload?.stages?.length ? payload.stages : fallbackOnboardingStages;
  elements.onboardingStages.innerHTML = stages.length
    ? `<details class="onboarding-blueprint" ${rawQueue.length ? "" : "open"}>
        <summary>
          <span>Standard Blueprint</span>
          <strong>${stages.length} phases</strong>
        </summary>
        <p>The reusable lead-to-build path before the paid website project enters production.</p>
        <div class="onboarding-blueprint-grid">
          ${stages.map((stage) => `<article class="ops-card">
            <div class="ops-card-head">
              <h3>${escapeHtml(stage.name)}</h3>
              <span class="pill ${stage.status === "needs-integration" ? "tone-yellow" : "tone-green"}">${escapeHtml(stage.status)}</span>
            </div>
            <p>${escapeHtml(stage.description)}</p>
            <div class="ops-chip-row">${stage.requiredArtifacts.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
            <div class="ops-mini-list">${stage.automations.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}</div>
          </article>`).join("")}
        </div>
      </details>`
    : `<article class="ops-card"><h3>No lead blueprint</h3><p>Lead stages will appear when the backend is available.</p></article>`;

  updateNavBadges();
  renderCockpit();
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
  const services = payload?.services?.length ? payload.services : fallbackServiceCatalog;
  const clientPayload = liveClients?.clients?.length ? mergeClientPayloadWithSeed(liveClients) : buildClientPayloadFallback();
  const clients = clientPayload.clients || [];
  const serviceBreakdown = clients.flatMap((client) => getClientServiceBreakdown(client).map((service) => ({ client, service })));
  const contractPending = serviceBreakdown.filter((entry) => /pending/i.test(entry.service.agreementStatus)).length;
  const summary = {
    servicePipelines: servicePipelineDefinitions.length,
    serviceClients: clients.filter((client) => client.services?.length || client.plannedServices?.length).length,
    mappedServices: serviceBreakdown.length,
    contractPending
  };
  renderOpsSummary(elements.serviceSummary, [
    { label: "Pipelines", value: summary.servicePipelines },
    { label: "Service Clients", value: summary.serviceClients },
    { label: "Mapped Services", value: summary.mappedServices },
    { label: "Contracts Pending", value: summary.contractPending }
  ]);

  const activeServices = services.filter((service) => service.status === "active");
  const integrationServices = services.filter((service) => service.status === "integration-needed");
  const plannedServices = services.filter((service) => service.status === "planned");
  const serviceGroups = [
    { label: "Active Services", description: "Services ready to run against client accounts.", services: activeServices },
    { label: "Integration Queue", description: "Services that need API credentials, account mapping, or workflow wiring.", services: integrationServices },
    { label: "Planned Packages", description: "Revenue services prepared for future clients or upsells.", services: plannedServices }
  ];
  const visiblePipelines = getVisibleServicePipelines();
  const selectedPipeline = activeServiceSubview === "all"
    ? null
    : servicePipelineDefinitions.find((pipeline) => pipeline.id === activeServiceSubview);

  elements.serviceCards.innerHTML = services.length
    ? `${renderServiceSubviewTabs(clients)}
      <div class="service-command-strip">
        <article>
          <span>Operating Model</span>
          <strong>${selectedPipeline ? `${escapeHtml(selectedPipeline.label)} pipeline focus` : "Web first, then service pipelines"}</strong>
          <p>${selectedPipeline ? `Showing the ${escapeHtml(selectedPipeline.label)} service lane only, with mapped clients, planned services, and contract status kept together.` : "Web Clients stays focused on launch and care. Expansion services route through their own kanban lanes with recurring contract status visible in the client modal."}</p>
        </article>
        <article>
          <span>Connected Systems</span>
          <strong>${selectedPipeline ? escapeHtml(selectedPipeline.system) : "GEO, Lead Command, CRM, cards, apps"}</strong>
          <p>${selectedPipeline ? "Use this focused view when you want to work one service line without scrolling past the rest of the stack." : "Each service pipeline can later connect to its own operator system without making the web client board carry every detail."}</p>
        </article>
      </div>
      <div class="service-pipeline-stack">
        ${visiblePipelines.map((pipeline) => renderServicePipeline(pipeline, clients)).join("")}
      </div>
      <details class="service-catalog-details">
        <summary>Service Package Catalog</summary>
        <div class="service-lane-grid">
        ${serviceGroups.map((group) => `<section class="service-lane">
          <div class="service-lane-head">
            <div>
              <h3>${escapeHtml(group.label)}</h3>
              <p>${escapeHtml(group.description)}</p>
            </div>
            <span>${group.services.length}</span>
          </div>
          <div class="service-card-stack">
            ${group.services.length ? group.services.map(renderServiceCard).join("") : `<div class="pipeline-empty">No services</div>`}
          </div>
        </section>`).join("")}
        </div>
      </details>`
    : `<article class="ops-card"><h3>No services loaded</h3><p>Service catalog will appear when the backend is available.</p></article>`;

  const actions = payload?.actions?.length ? payload.actions : [
    "Connect geo.ghostai.solutions API for SEO / AEO / GEO service delivery.",
    "Map each client to purchased services and required tools.",
    "Define approval rules for ads, socials, reports, and site changes.",
    "Attach Web Helper tasks to active care and growth services."
  ];
  renderOpsActions(elements.serviceActions, getServiceActions(actions), "Service actions will appear here.");
  updateNavBadges();
}

function getVisibleServicePipelines() {
  if (activeServiceSubview === "all") {
    return servicePipelineDefinitions;
  }

  const selectedPipeline = servicePipelineDefinitions.find((pipeline) => pipeline.id === activeServiceSubview);
  return selectedPipeline ? [selectedPipeline] : servicePipelineDefinitions;
}

function renderServiceSubviewTabs(clients) {
  const tabs = [
    {
      id: "all",
      label: "All",
      count: servicePipelineDefinitions.reduce((total, pipeline) => total + getServicePipelineCards(pipeline, clients).length, 0)
    },
    ...servicePipelineDefinitions.map((pipeline) => ({
      id: pipeline.id,
      label: pipeline.label,
      count: getServicePipelineCards(pipeline, clients).length
    }))
  ];

  return `<div class="subview-tabs service-subview-tabs" aria-label="Service pipeline views">
    ${tabs.map((tab) => `<button class="subview-tab ${activeServiceSubview === tab.id ? "active" : ""}" type="button" data-service-tab="${escapeHtml(tab.id)}">
      <span>${escapeHtml(tab.label)}</span>
      <strong>${tab.count}</strong>
    </button>`).join("")}
  </div>`;
}

function getServiceActions(actions) {
  if (activeServiceSubview === "all") {
    return actions;
  }

  const selectedPipeline = servicePipelineDefinitions.find((pipeline) => pipeline.id === activeServiceSubview);
  if (!selectedPipeline) {
    return actions;
  }

  return [
    `Review ${selectedPipeline.label} mapped clients and contract status.`,
    selectedPipeline.id === "web-care"
      ? "Confirm helper provisioning, repo memory, support link, and care activation."
      : `Confirm ${selectedPipeline.system} access, approvals, and reporting handoff.`,
    `Move stalled ${selectedPipeline.label} clients into the next service stage.`
  ];
}

function getServicePipelineStatus(client, pipeline, serviceKey, serviceState = "active") {
  const stage = getClientStage(client);
  const issueTags = getClientIssueTags(client);
  const issues = issueTags.map((issue) => `${issue.id} ${issue.label}`).join(" ").toLowerCase();
  const hasCoreConnectionGap = issueTags.some((issue) =>
    ["missing-website", "missing-repo", "missing-vercel", "details-pending"].includes(issue.id)
  );

  if (serviceState === "planned") {
    if (pipeline.id === "seo-geo") {
      return client.partnershipSigned ? "strategy" : "approval";
    }
    if (pipeline.id === "web-care") {
      return getWebHelperCareLifecycleStage(client);
    }
    if (pipeline.id === "social" || pipeline.id === "ads") {
      return "candidate";
    }
    if (pipeline.id === "mobile-apps") {
      return "idea";
    }
    if (pipeline.id === "automations") {
      return "opportunity";
    }
    if (pipeline.id === "commerce") {
      return "storefront";
    }
  }

  if (pipeline.id === "web-care") {
    return getWebHelperCareLifecycleStage(client);
  }

  if (pipeline.id === "seo-geo") {
    if (stage === "growth-services" || client.partnershipSigned) {
      return "active";
    }
    if (["search-intelligence", "local-service"].includes(serviceKey)) {
      return "approval";
    }
    if (issues.includes("gbp") || issues.includes("geo")) {
      return "audit-needed";
    }
    if (["web-helper-care", "launch-handoff"].includes(stage)) {
      return "strategy";
    }
    return "eligible";
  }

  if (pipeline.id === "social") {
    if (issues.includes("social")) {
      return "access";
    }
    return stage === "growth-services" ? "publishing" : "candidate";
  }

  if (pipeline.id === "ads") {
    if (issues.includes("ads") || issues.includes("analytics")) {
      return "tracking";
    }
    return stage === "growth-services" ? "optimize" : "candidate";
  }

  if (pipeline.id === "mobile-apps") {
    return stage === "client-review" ? "review" : stage === "launch-handoff" ? "release" : stage === "web-helper-care" ? "care" : "scope";
  }

  if (pipeline.id === "automations") {
    if (stage === "growth-services") {
      return "live";
    }
    if (stage === "paused-archived") {
      return "retention";
    }
    return serviceKey === "lead-funnel" ? "mapped" : "build";
  }

  if (pipeline.id === "commerce") {
    if (stage === "web-helper-care") {
      return "care";
    }
    if (stage === "growth-services") {
      return "growth";
    }
    return "storefront";
  }

  return pipeline.stages[0]?.id || "queued";
}

function getServicePipelineCards(pipeline, clients) {
  return clients.flatMap((client) =>
    getClientServiceBreakdown(client)
      .filter((service) => pipeline.serviceKeys.includes(service.key))
      .map((service) => {
        return {
          client,
          serviceKey: service.key,
          serviceLabel: service.label,
          serviceState: service.serviceState,
          agreementStatus: getClientServiceAgreementStatus(client, service.key),
          stage: getServicePipelineStatus(client, pipeline, service.key, service.serviceState),
          issueCount: getClientIssueTags(client).length
        };
      })
  );
}

function renderServicePipeline(pipeline, clients) {
  const cards = getServicePipelineCards(pipeline, clients);
  return `<section class="service-pipeline-board">
    <div class="service-pipeline-head">
      <div>
        <span class="eyebrow">${escapeHtml(pipeline.system)}</span>
        <h3>${escapeHtml(pipeline.label)}</h3>
        <p>${escapeHtml(pipeline.description)}</p>
      </div>
      <span class="pill ${cards.length ? "tone-green" : "tone-blue"}">${cards.length} mapped</span>
    </div>
    <div class="service-pipeline-lanes">
      ${pipeline.stages.map((stage) => {
        const stageCards = cards.filter((card) => card.stage === stage.id);
        return `<section class="service-pipeline-lane">
          <div class="pipeline-column-head">
            <h3>${escapeHtml(stage.label)}</h3>
            <span>${stageCards.length}</span>
          </div>
          ${stageCards.length ? stageCards.map(renderServiceClientCard).join("") : `<div class="pipeline-empty">No clients</div>`}
        </section>`;
      }).join("")}
    </div>
  </section>`;
}

function renderServiceClientCard(card) {
  const displayUrl = getClientDisplayUrl(card.client);
  const activation = card.client.webHelperActivation || null;
  const webHelperStatus = activation?.repoStatus === "learn-failed"
    ? `Repo memory issue: ${activation.repoError || "Unable to learn repo."}`
    : activation?.agentName
      ? `${activation.agentName} | ${activation.memoryDocumentCount || 0} docs`
      : "";
  const webHelperActions = card.serviceKey === "web-helper-care"
    ? `<div class="service-client-card-actions">
        <button type="button" data-service-refresh-memory="${escapeHtml(card.client.id)}">Refresh Memory</button>
        <button type="button" data-service-support-link="${escapeHtml(card.client.id)}">Open Support Link</button>
        <button type="button" data-service-test-ticket="${escapeHtml(card.client.id)}">Send Test Ticket</button>
      </div>`
    : "";
  return `<article class="service-client-card" data-client-detail="${escapeHtml(card.client.id)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(card.client.clientName)} service details">
    <div class="pipeline-card-head">
      <h3>${escapeHtml(card.client.clientName)}</h3>
      <span>${card.issueCount}</span>
    </div>
    <p>${escapeHtml(card.serviceLabel)}</p>
    <p class="service-client-card-status" data-service-card-message="${escapeHtml(card.client.id)}">${escapeHtml(webHelperStatus)}</p>
    <div class="service-client-card-meta">
      <span class="pill ${card.serviceState === "planned" ? "tone-blue" : "tone-green"}">${escapeHtml(card.serviceState === "planned" ? "planned" : "active")}</span>
      <span class="pill ${getAgreementTone(card.agreementStatus)}">${escapeHtml(card.agreementStatus)}</span>
      <span>${escapeHtml(displayUrl || card.client.repo || "details pending")}</span>
    </div>
    ${webHelperActions}
  </article>`;
}

function renderServiceCard(service) {
  const statusTone = service.status === "active" ? "tone-green" : service.status === "integration-needed" ? "tone-yellow" : "tone-blue";
  return `<article class="service-card">
    <div class="service-card-head">
      <div>
        <h3>${escapeHtml(service.name)}</h3>
        <p>${escapeHtml(service.category)} | ${escapeHtml(service.owner)}</p>
      </div>
      <span class="pill ${statusTone}">${escapeHtml(service.status)}</span>
    </div>
    <p>${escapeHtml(service.description)}</p>
    <div class="service-card-section">
      <span>Connected Systems</span>
      <div class="ops-chip-row">${(service.connectedSystems || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
    </div>
    <div class="service-card-grid">
      <div>
        <span>Trigger</span>
        <p>${escapeHtml((service.triggers || [])[0] || "Manual dispatch")}</p>
      </div>
      <div>
        <span>Next Action</span>
        <p>${escapeHtml((service.nextActions || [])[0] || "Define service workflow")}</p>
      </div>
    </div>
  </article>`;
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
  } catch (error) {
    liveToolRegistry = null;
    renderTools({
      error: "Tool registry unavailable",
      detail: String(error?.message || error || "Unknown tools error")
    });
  }
}

function renderTools(payload) {
  const summary = payload?.summary || { totalTools: 0, activeTools: 0, needsClassification: 0, revenueProducts: 0, privateTools: 0 };
  renderOpsSummary(elements.toolSummary, [
    { label: "Repos", value: summary.totalTools },
    { label: "Active", value: summary.activeTools },
    { label: "Private", value: summary.privateTools || 0 },
    { label: "Revenue Tools", value: summary.revenueProducts }
  ]);

  const tools = payload?.tools || [];
  const sync = payload?.sync || {};
  const apiStatusMarkup = `<article class="ops-card tool-sync-card">
    <div class="ops-card-head">
      <h3>GitHub Sync</h3>
      <span class="pill ${payload?.error || sync.lastError ? "tone-red" : sync.tokenConfigured ? "tone-green" : "tone-yellow"}">
        ${payload?.error ? "failed" : sync.tokenConfigured ? "token ready" : "public only"}
      </span>
    </div>
    <div class="ops-meta-grid">
      <div><span>API Base</span>${escapeHtml(API_BASE_URL || "same-origin")}</div>
      <div><span>Owner</span>${escapeHtml(sync.owner || payload?.owner || "burchdad")}</div>
      <div><span>Private Access</span>${sync.privateRepoAccess ? "enabled" : "not enabled"}</div>
      <div><span>Last Sync</span>${escapeHtml(sync.lastSuccessAt ? new Date(sync.lastSuccessAt).toLocaleString() : "not synced")}</div>
    </div>
    ${payload?.detail || sync.lastError ? `<p>${escapeHtml(payload?.detail || sync.lastError)}</p>` : ""}
  </article>`;
  const groupedTools = tools.reduce((groups, tool) => {
    const category = tool.category || "Unclassified";
    groups[category] = groups[category] || [];
    groups[category].push(tool);
    return groups;
  }, {});

  elements.toolCards.innerHTML = apiStatusMarkup + (tools.length
    ? Object.entries(groupedTools).map(([category, categoryTools]) => `
      <section class="tool-category-group">
        <div class="tool-category-head">
          <h3>${escapeHtml(category)}</h3>
          <span class="pill ${category === "Unclassified" ? "tone-yellow" : "tone-green"}">${categoryTools.length} repos</span>
        </div>
        <div class="tool-repo-grid">
          ${categoryTools.map((tool) => `<article class="ops-card tool-repo-card">
            <div class="ops-card-head">
              <div>
                <h3>${escapeHtml(tool.name)}</h3>
                <p>${escapeHtml(tool.fullName || "")}</p>
              </div>
              <span class="pill ${tool.private ? "tone-blue" : tool.archived ? "tone-yellow" : "tone-green"}">${tool.private ? "private" : tool.archived ? "archived" : "public"}</span>
            </div>
            <p>${escapeHtml(tool.description)}</p>
            <div class="ops-meta-grid">
              <div><span>Status</span>${escapeHtml(tool.productStatus)}</div>
              <div><span>Service</span>${escapeHtml(tool.serviceId)}</div>
              ${tool.clientName ? `<div><span>Client</span>${escapeHtml(tool.clientName)}</div>` : ""}
              <div><span>Deployment</span>${escapeHtml(tool.deploymentStatus || tool.deployment || "Unlinked")}</div>
              <div><span>Language</span>${escapeHtml(tool.language)}</div>
              <div><span>Branch</span>${escapeHtml(tool.defaultBranch || "main")}</div>
            </div>
            ${tool.needsActions?.length ? `<ul class="ops-mini-list">${tool.needsActions.slice(0, 2).map((action) => `<li>${escapeHtml(action)}</li>`).join("")}</ul>` : ""}
            <div class="tool-card-footer">
              <span>${escapeHtml(tool.pushedAt ? `Pushed ${new Date(tool.pushedAt).toLocaleDateString()}` : "No push date")}</span>
              ${tool.deploymentUrl ? `<a href="${escapeHtml(tool.deploymentUrl)}" target="_blank" rel="noreferrer">Open live</a>` : ""}
              ${tool.url ? `<a href="${escapeHtml(tool.url)}" target="_blank" rel="noreferrer">Open repo</a>` : ""}
            </div>
          </article>`).join("")}
        </div>
      </section>
    `).join("")
    : `<article class="ops-card"><h3>No GitHub tools loaded</h3><p>Add public repos or configure GITHUB_TOKEN to inventory private burchdad tools.</p></article>`);

  const buckets = payload?.actionBuckets || [];
  if (buckets.length) {
    elements.toolActions.innerHTML = buckets.map((bucket) => `
      <article class="ops-action-card">
        <div class="ops-card-head">
          <h3>${escapeHtml(bucket.label)}</h3>
          <span class="pill tone-${escapeHtml(bucket.tone || "blue")}">${Number(bucket.count || 0)}</span>
        </div>
        ${bucket.items?.length ? `<div class="ops-action-list">
          ${bucket.items.map((item) => `
            <div class="ops-action-item">
              <strong>${escapeHtml(item.name)}</strong>
              ${item.clientName ? `<span>${escapeHtml(item.clientName)}</span>` : ""}
              <p>${escapeHtml(item.reason || item.status || "Ready for operator mapping.")}</p>
              ${item.deploymentUrl ? `<a href="${escapeHtml(item.deploymentUrl)}" target="_blank" rel="noreferrer">Open live</a>` : ""}
            </div>
          `).join("")}
        </div>` : `<p>No current items in this bucket.</p>`}
      </article>
    `).join("");
  } else {
    const actions = payload?.actions || [
      "Configure GITHUB_TOKEN for private repo inventory.",
      "Classify repos once imported.",
      "Connect tools to client services."
    ];
    renderOpsActions(elements.toolActions, actions, "Tool actions will appear here.");
  }
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
    const hydratedPayload = mergeWebHelpersWithSeed(payload, siteId);
    liveWebHelpers = hydratedPayload.helpers || [];
    renderWebHelpers(hydratedPayload);
  } catch (error) {
    const fallbackPayload = buildFallbackWebHelpersPayload(siteId, String(error.message || error));
    liveWebHelpers = fallbackPayload.helpers || [];
    renderWebHelpers(fallbackPayload);
  }
}

function startWebHelperPolling() {
  if (webHelperPollTimer) {
    return;
  }

  webHelperPollTimer = setInterval(() => {
    if (activeView === "web-helpers") {
      loadWebHelpers("");
    }
  }, 7000);
}

async function activateWebHelper(targetId, options = {}) {
  if (!targetId) {
    elements.commandResponse.textContent = "No helper target found for activation.";
    return;
  }

  elements.commandResponse.textContent = "Activating Web Helper knowledge pack...";

  try {
    const response = await fetch(apiUrl("/mission/web-helpers/activate"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        siteId: targetId,
        command: options.command || "Activate Web Helper from dashboard",
        refresh: Boolean(options.refresh)
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `Activation failed with status ${response.status}`);
    }

    const activated = payload.activated || {};
    elements.commandResponse.textContent = `${activated.agentName || "Web Helper"} activated. Learned ${activated.routeCount || 0} routes, ${activated.apiRouteCount || 0} APIs, and ${activated.memoryDocumentCount || 0} memory docs.`;
    await loadWebHelpers("");
  } catch (error) {
    elements.commandResponse.textContent = `Web Helper activation failed: ${String(error.message || error)}`;
  }
}

function summarizeWebHelpersForUi(helpers) {
  const openRequests = helpers.flatMap((helper) => helper.requests || []).filter((request) => !isWebHelperOperationalTask(request));
  return {
    helperCount: helpers.length,
    activeCount: helpers.filter((helper) => helper.status === "active").length,
    openRequests: openRequests.length,
    pendingApprovals: openRequests.filter((request) => request.approvalRequired).length,
    templateReadyCount: helpers.length
  };
}

function getWebHelperMergeKey(helper) {
  const keys = getClientIdentityKeysForUi({
    id: helper?.siteId || helper?.id,
    clientName: helper?.clientName || helper?.name,
    websiteUrl: helper?.websiteUrl,
    repo: helper?.repo
  });
  return keys[0] || `name:${slugForUi(helper?.clientName || helper?.id || helper?.name || "")}`;
}

function mergeWebHelpersWithSeed(payload = {}, siteId = activeSiteId) {
  const seededPayload = buildFallbackWebHelpersPayload(siteId, "Merged with seeded client map.");
  const mergedHelpers = new Map();
  const aliases = new Map();

  const addHelper = (helper) => {
    const keys = getClientIdentityKeysForUi({
      id: helper?.siteId || helper?.id,
      clientName: helper?.clientName || helper?.name,
      websiteUrl: helper?.websiteUrl,
      repo: helper?.repo
    });
    const existingKey = keys.map((key) => aliases.get(key)).find(Boolean);
    const key = existingKey || getWebHelperMergeKey(helper);
    const seeded = mergedHelpers.get(key) || {};
    const merged = {
      ...seeded,
      ...helper,
      scope: helper.scope?.length ? helper.scope : seeded.scope || [],
      requests: helper.requests?.length ? helper.requests : seeded.requests || []
    };
    mergedHelpers.set(key, merged);
    keys.forEach((item) => aliases.set(item, key));
  };

  (seededPayload.helpers || []).forEach((helper) => {
    addHelper(helper);
  });

  (payload.helpers || []).forEach((helper) => {
    addHelper(helper);
  });

  const helpers = [...mergedHelpers.values()];
  return {
    ...seededPayload,
    ...payload,
    source: payload.source || seededPayload.source,
    helpers,
    summary: summarizeWebHelpersForUi(helpers)
  };
}

function buildFallbackWebHelpersPayload(siteId = activeSiteId, reason = "") {
  const clients = getActiveClients();
  const scopedClients = clients.filter((client) =>
    client.websiteUrl &&
    client.repo &&
    client.services?.includes("website-build") &&
    client.services?.includes("web-helper-care") &&
    getClientStage(client) !== "paused-archived" &&
    ["web-helper-care", "growth-services", "client-review", "launch-handoff"].includes(getClientStage(client))
  );
  const helperClients = scopedClients.length
    ? scopedClients
    : clients.filter((client) => client.websiteUrl && getClientStage(client) !== "paused-archived").slice(0, 6);

  const helpers = helperClients.map((client) => {
    const requests = [];
    if (client.finalDomainPurchased === false) {
      requests.push({
        title: "Connect final domain",
        summary: `${client.clientName} is still running on a temporary deployment URL. Confirm final domain purchase and DNS handoff.`,
        type: "domain",
        status: "queued",
        sla: "owner review",
        source: "mission_control_setup",
        operationalTask: true,
        approvalRequired: true
      });
    }
    if (client.clientDetailsPending) {
      requests.push({
        title: "Collect client details",
        summary: `${client.clientName} needs final business details before automated helper actions can safely run.`,
        type: "intake",
        status: "queued",
        sla: "before launch",
        source: "mission_control_setup",
        operationalTask: true,
        approvalRequired: true
      });
    }
    if (!requests.length) {
      requests.push({
        title: "Monthly health check",
        summary: `Review ${client.clientName} for uptime, broken links, conversion forms, visible content drift, and new service opportunities.`,
        type: "maintenance",
        status: "ready",
        sla: "monthly",
        source: "mission_control_setup",
        operationalTask: true,
        approvalRequired: false
      });
    }

    return {
      id: `${client.id || slugForUi(client.clientName)}-web-helper`,
      siteId: client.id || slugForUi(client.clientName),
      name: `${client.clientName} Web Helper`,
      clientName: client.clientName,
      websiteUrl: client.websiteUrl,
      status: ["web-helper-care", "growth-services"].includes(getClientStage(client)) ? "active" : "needs-approval",
      statusLabel: ["web-helper-care", "growth-services"].includes(getClientStage(client)) ? "active" : "handoff",
      autonomyLevel: "owner-gated",
      plan: client.plan || "Client website care",
      repo: client.repo || "",
      deployment: client.vercelUrl ? "Vercel linked" : "Deployment pending",
      lastDeploymentLabel: "seeded",
      scope: [
        "copy updates",
        "page checks",
        "form checks",
        "domain handoff",
        "owner approval"
      ],
      requests
    };
  });

  const openRequests = helpers.flatMap((helper) => helper.requests || []).filter((request) => !isWebHelperOperationalTask(request));
  return {
    generatedAt: new Date().toISOString(),
    source: "frontend-seeded-client-map",
    reason,
    helpers,
    summary: {
      helperCount: helpers.length,
      activeCount: helpers.filter((helper) => helper.status === "active").length,
      openRequests: openRequests.length,
      pendingApprovals: openRequests.filter((request) => request.approvalRequired).length,
      templateReadyCount: helpers.length
    }
  };
}

function renderWebHelperKnowledge(helper) {
  const activation = helper.activation;
  if (!activation) {
    return `<div class="web-helper-knowledge is-pending">
      <div><span>Knowledge</span><strong>Not activated</strong></div>
      <p>Repo map and helper memory will populate after activation.</p>
    </div>`;
  }

  return `<div class="web-helper-knowledge">
    <div><span>Knowledge</span><strong>${escapeHtml(activation.framework || "Learned")}</strong></div>
    <div><span>Routes</span><strong>${escapeHtml(String(activation.routeCount || 0))}</strong></div>
    <div><span>Live Pages</span><strong>${escapeHtml(String(activation.livePageCount || 0))}</strong></div>
    <div><span>APIs</span><strong>${escapeHtml(String(activation.apiRouteCount || 0))}</strong></div>
    <div><span>Memory</span><strong>${escapeHtml(String(activation.memoryDocumentCount || 0))} docs</strong></div>
    ${activation.crawlFailureCount ? `<p>${escapeHtml(`${activation.crawlFailureCount} live page crawl issue(s) need review.`)}</p>` : ""}
    <p>${escapeHtml((activation.nextActions || [])[0] || "Knowledge pack ready for owner-reviewed updates.")}</p>
  </div>`;
}

const webHelperKanbanColumns = [
  {
    id: "new",
    label: "New Intake",
    hint: "Fresh requests from client dashboards.",
    match: ["new", "intake", "submitted"]
  },
  {
    id: "triage",
    label: "Needs Triage",
    hint: "Clarify scope, page, assets, and risk.",
    match: ["triage", "queued", "needs-triage"]
  },
  {
    id: "in_progress",
    label: "Codex Building",
    hint: "Codex/helper is preparing the testing-branch change.",
    match: ["in_progress", "in-progress", "running", "working", "codex_queued", "codex-queued", "sent_to_runner", "external_verification", "sent-to-runner"]
  },
  {
    id: "ready_review",
    label: "Ready for Review",
    hint: "Changes are ready for owner/client review.",
    match: ["ready_review", "ready-for-review", "review", "changes_requested", "changes-requested"]
  },
  {
    id: "needs_approval",
    label: "Owner Approval",
    hint: "Approve the prepared fix before merge or production deploy.",
    match: ["needs_approval", "needs-approval", "needs-review", "approval", "owner_approval", "owner-approval"]
  },
  {
    id: "approved",
    label: "Approved to Merge",
    hint: "Owner approved merge after testing/review.",
    match: ["approved", "approved_to_merge", "approved-to-merge", "ready", "safe", "assigned"]
  },
  {
    id: "done",
    label: "Done / Merged",
    hint: "Completed, merged, closed, or archived.",
    match: ["done", "merged", "closed", "complete", "completed"]
  },
  {
    id: "blocked",
    label: "Blocked",
    hint: "Needs credentials, assets, details, or manual intervention.",
    match: ["blocked", "failed", "error", "retry_needed", "retry-needed"]
  }
];

function normalizeWebHelperStatus(value) {
  return String(value || "new").trim().toLowerCase().replace(/\s+/g, "_");
}

function getWebHelperTicketColumn(request) {
  const status = normalizeWebHelperStatus(request.status);
  const directColumn = webHelperKanbanColumns.find((column) => column.match.includes(status));
  if (directColumn) {
    return directColumn.id;
  }

  if (request.approvalRequired && ["queued", "needs_review", "needs-review"].includes(status)) {
    return "needs_approval";
  }

  return request.approvalRequired && status !== "new" ? "needs_approval" : "triage";
}

function getWebHelperColumnLabel(columnId) {
  return webHelperKanbanColumns.find((column) => column.id === columnId)?.label || "Updated";
}

function getWebHelperToastMessage(ticket, previousColumn, nextColumn) {
  const title = ticket.title || ticket.summary || "Website support ticket";
  const client = ticket.clientName || "Client";
  if (!previousColumn) {
    return {
      title: "New Web Helper Intake",
      body: `${client}: ${title}`
    };
  }

  if (nextColumn === "in_progress") {
    return {
      title: "Codex Build Started",
      body: `${client}: ${title}`
    };
  }

  if (nextColumn === "ready_review") {
    return {
      title: "Ready for Your Review",
      body: `${client}: ${title}`
    };
  }

  if (nextColumn === "blocked") {
    return {
      title: "Web Helper Needs Attention",
      body: `${client}: ${title}`
    };
  }

  return {
    title: `Moved to ${getWebHelperColumnLabel(nextColumn)}`,
    body: `${client}: ${title}`
  };
}

function showWebHelperToast(title, body) {
  if (!webHelperToastHost) {
    webHelperToastHost = document.createElement("div");
    webHelperToastHost.className = "web-helper-toast-host";
    webHelperToastHost.setAttribute("aria-live", "polite");
    document.body.appendChild(webHelperToastHost);
  }

  const toast = document.createElement("button");
  toast.type = "button";
  toast.className = "web-helper-toast";
  toast.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(body)}</span>`;
  toast.addEventListener("click", () => {
    setActiveView("web-helpers");
    setFocusMode(true, "web-helpers");
    toast.remove();
  });
  webHelperToastHost.appendChild(toast);
  window.setTimeout(() => toast.remove(), 8500);
}

function notifyWebHelperTicketChanges(tickets) {
  const nextMemory = new Map();
  const hadMemory = webHelperTicketStageMemory.size > 0;
  tickets.forEach((ticket) => {
    const id = getWebHelperTicketId(ticket);
    const column = getWebHelperTicketColumn(ticket);
    nextMemory.set(id, column);
    const previousColumn = webHelperTicketStageMemory.get(id);
    if (!hadMemory || previousColumn === column) {
      return;
    }

    const message = getWebHelperToastMessage(ticket, previousColumn, column);
    showWebHelperToast(message.title, message.body);
  });
  webHelperTicketStageMemory = nextMemory;
}

function getPriorityTone(priority) {
  const value = String(priority || "normal").toLowerCase();
  if (["urgent", "critical", "high"].includes(value)) {
    return "tone-red";
  }
  if (["medium", "normal"].includes(value)) {
    return "tone-yellow";
  }
  return "tone-green";
}

function getPriorityCardClass(priority) {
  const value = String(priority || "normal").toLowerCase();
  if (["urgent", "critical", "high"].includes(value)) {
    return "is-high-priority";
  }
  if (["medium", "normal"].includes(value)) {
    return "is-medium-priority";
  }
  return "is-low-priority";
}

function formatWebHelperDateForUi(value) {
  if (!value) {
    return "not dated";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getWebHelperTicketId(request) {
  return request.id || `${slugForUi(request.clientName)}-${slugForUi(request.title)}-${slugForUi(request.status)}`;
}

function isWebHelperOperationalTask(request) {
  if (request?.operationalTask || request?.operational_task || request?.payload?.operationalTask || request?.payload?.operational_task) {
    return true;
  }

  const source = String(request?.source || request?.payload?.source || "").toLowerCase();
  if (source.startsWith("mission_control_")) {
    return true;
  }

  const type = String(request?.requestType || request?.type || request?.payload?.request_type || "").toLowerCase();
  return ["template_setup", "domain_setup", "client_intake", "maintenance"].includes(type);
}

function flattenWebHelperRequests(helpers) {
  return helpers.flatMap((helper) =>
    (helper.requests || []).map((request, index) => ({
      ...request,
      id: request.id || request.ticketId || request.payload?.ticket_id || request.payload?.ticketId || `${helper.id || slugForUi(helper.clientName)}-${slugForUi(request.title || request.summary || request.type || "request")}-${index}`,
      helperId: helper.id,
      helperName: helper.name,
      clientName: helper.clientName,
      websiteUrl: helper.websiteUrl,
      repo: helper.repo,
      branchPolicy: request.branchPolicy || request.branch_policy || request.payload?.branch_policy || "testing_branch_only",
      pageUrl: request.pageUrl || request.page_url || request.payload?.page_url || "sitewide",
      priority: request.priority || request.payload?.priority || "normal",
      requestType: request.requestType || request.type || request.payload?.request_type || "website_update",
      approvalRequired: Boolean(request.approvalRequired ?? request.approval_required ?? request.payload?.approval_required),
      createdAt: request.createdAt || request.payload?.created_at || request.updatedAt || ""
    }))
  );
}

function getWebHelperFilterState() {
  return {
    search: String(elements.webHelperSearchInput?.value || "").trim().toLowerCase(),
    status: elements.webHelperStatusFilter?.value || "all",
    priority: elements.webHelperPriorityFilter?.value || "all",
    approval: elements.webHelperApprovalFilter?.value || "all"
  };
}

function webHelperTicketMatchesFilters(ticket, filters = getWebHelperFilterState()) {
  const column = getWebHelperTicketColumn(ticket);
  const priority = String(ticket.priority || "normal").toLowerCase();
  if (filters.status !== "all" && column !== filters.status) {
    return false;
  }
  if (filters.priority !== "all" && priority !== filters.priority) {
    return false;
  }
  if (filters.approval === "required" && !ticket.approvalRequired) {
    return false;
  }
  if (filters.approval === "safe" && ticket.approvalRequired) {
    return false;
  }
  if (!filters.search) {
    return true;
  }

  const haystack = [
    ticket.clientName,
    ticket.title,
    ticket.summary,
    ticket.details,
    ticket.pageUrl,
    ticket.requestType,
    ticket.helperName,
    ticket.repo,
    ticket.branchPolicy
  ].join(" ").toLowerCase();
  return haystack.includes(filters.search);
}

function renderWebHelperTicketCard(request) {
  const ticketId = getWebHelperTicketId(request);
  const shortPage = request.pageUrl && request.pageUrl !== "sitewide" ? request.pageUrl : request.requestType || request.type || "website_update";

  return `<button class="web-helper-ticket ${getPriorityCardClass(request.priority)}" type="button" data-web-helper-ticket="${escapeHtml(ticketId)}" aria-label="Open ${escapeHtml(request.title || "web helper ticket")}">
    <span class="web-helper-ticket-client">${escapeHtml(request.clientName || "Client")}</span>
    <strong>${escapeHtml(request.title || request.summary || "Website update request")}</strong>
    <span class="web-helper-ticket-row">
      <span class="pill ${getPriorityTone(request.priority)}">${escapeHtml(request.priority || "normal")}</span>
      <span>${escapeHtml(shortPage)}</span>
    </span>
  </button>`;
}

function renderWebHelperCapacityCard(helper) {
  const tone = helper.status === "active" ? "green" : helper.status === "needs-approval" ? "yellow" : "gray";
  const targetId = helper.siteId || helper.id || helper.clientName;
  const activationLabel = helper.activation ? "Relearn Build" : "Activate Helper";
  const requestCount = (helper.requests || []).length;
  const pendingCount = (helper.requests || []).filter((request) => request.approvalRequired).length;

  return `<article class="web-helper-card">
    <div class="web-helper-card-head">
      <h3>${escapeHtml(helper.clientName)}</h3>
      <span class="pill ${toneClass[tone] ?? "tone-gray"}">${escapeHtml(helper.statusLabel || helper.status || "ready")}</span>
    </div>
    <p class="web-helper-domain">${escapeHtml(helper.websiteUrl)}</p>
    <div class="web-helper-meta">
      <div><span>Agent</span>${escapeHtml(helper.name)}</div>
      <div><span>Open / Approval</span>${escapeHtml(`${requestCount} / ${pendingCount}`)}</div>
      <div><span>Plan</span>${escapeHtml(helper.plan)}</div>
      <div><span>Repo</span>${escapeHtml(helper.repo || "Not connected")}</div>
      <div><span>Deployment</span>${escapeHtml(helper.deployment)}</div>
      <div><span>Last Deploy</span>${escapeHtml(helper.lastDeploymentLabel)}</div>
    </div>
    <div class="web-helper-scope">
      ${(helper.scope || []).slice(0, 6).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
    </div>
    ${renderWebHelperKnowledge(helper)}
    <div class="web-helper-actions">
      <button type="button" data-web-helper-activate="${escapeHtml(targetId)}">${activationLabel}</button>
    </div>
  </article>`;
}

function renderWebHelperTicketStats(request, helper) {
  const stats = [
    { label: "Status", value: request.status || "new" },
    { label: "Priority", value: request.priority || "normal" },
    { label: "Type", value: request.requestType || request.type || "website_update" },
    { label: "Page", value: request.pageUrl || "sitewide" },
    { label: "Branch Policy", value: request.branchPolicy || "testing_branch_only" },
    { label: "Approval", value: request.approvalRequired ? "Required" : "Safe scope" },
    { label: "Created", value: formatWebHelperDateForUi(request.createdAt) },
    { label: "Ticket", value: getWebHelperTicketId(request) }
  ];

  if (helper) {
    stats.push(
      { label: "Helper", value: helper.name || request.helperName || "Unassigned" },
      { label: "Open / Approval", value: `${(helper.requests || []).length} / ${(helper.requests || []).filter((item) => item.approvalRequired).length}` },
      { label: "Repo", value: helper.repo || request.repo || "Not connected" },
      { label: "Deployment", value: helper.deployment || "Deployment pending" }
    );
  }

  return `<div class="client-modal-stats web-helper-ticket-stats">
    ${stats.map((item) => `<div><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join("")}
  </div>`;
}

function renderWebHelperTicketActions(ticket) {
  const actions = [
    { label: "Send to Codex Build", action: "codex-build", tone: "primary", hint: "Create the testing-branch build prompt for the Codex runner." },
    { label: "Acknowledge", action: "triage", status: "triage", tone: "secondary", hint: "Confirm this is real and ready for triage." },
    { label: "Assign / Start", action: "start", status: "in_progress", tone: "secondary", hint: "Move manual helper work into active build." },
    { label: "Ready for Review", action: "review", status: "ready_review", tone: "secondary", hint: "Prepared work is ready for owner/client review." },
    { label: "Request Approval", action: "approval", status: "needs_approval", tone: "secondary", hint: "Move the prepared fix into owner approval." },
    { label: "Approve Change", action: "approve-merge", tone: "primary", hint: "Owner approves merge after testing and review." },
    { label: "Redo", action: "redo", tone: "secondary", hint: "Send this back through the Codex build loop." },
    { label: "Redo with Chat", action: "redo-chat", tone: "secondary", hint: "Use the ticket note as owner feedback for Codex." },
    { label: "Complete / Archive", action: "done", status: "done", tone: "secondary", hint: "Close the ticket after merge, delivery, or archive." },
    { label: "Needs Info", action: "needs-info", status: "blocked", tone: "danger", hint: "Send back for credentials, copy, assets, or approval details." },
    { label: "Open Agent Chat", action: "chat", tone: "secondary", hint: "Load this ticket into Execution with full context." }
  ];

  return `<div class="web-helper-ticket-actions">
    ${actions.map((item) => `<button class="${item.tone === "primary" ? "command-send" : item.tone === "danger" ? "danger-button" : "new-client-button secondary-button"}" type="button" title="${escapeHtml(item.hint)}" data-web-helper-ticket-action="${escapeHtml(item.action)}" data-web-helper-ticket-id="${escapeHtml(getWebHelperTicketId(ticket))}" ${item.status ? `data-web-helper-ticket-status="${escapeHtml(item.status)}"` : ""}>
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.hint)}</span>
    </button>`).join("")}
  </div>
  <p id="webHelperTicketActionResponse" class="command-response" aria-live="polite"></p>`;
}

function renderWebHelperTicketEvents(ticket) {
  const events = Array.isArray(ticket.events) ? ticket.events : [];
  if (!events.length) {
    return `<section class="web-helper-ticket-modal-section">
      <h3>Activity</h3>
      <p>No ticket events have been recorded yet.</p>
    </section>`;
  }

  return `<section class="web-helper-ticket-modal-section">
    <h3>Activity</h3>
    <div class="web-helper-ticket-events">
      ${events.slice().reverse().map((event) => `<article>
        <span>${escapeHtml(formatWebHelperDateForUi(event.at || event.createdAt))}</span>
        <strong>${escapeHtml(event.status || event.type || "event")}</strong>
        <p>${escapeHtml(event.message || event.actor || "Ticket updated.")}</p>
      </article>`).join("")}
    </div>
  </section>`;
}

function renderWebHelperTicketConversation(ticket) {
  return `<section class="web-helper-ticket-modal-section web-helper-ticket-conversation">
    <h3>Ticket Conversation</h3>
    <p>Capture owner approvals, client notes, agent handoff context, and manual decisions directly on this ticket.</p>
    <label>
      <span>Add note for the Web Helper</span>
      <textarea id="webHelperTicketNoteInput" rows="4" placeholder="Example: Approved for testing branch only. Do not merge until I review the preview."></textarea>
    </label>
    <div class="web-helper-ticket-actions">
      <button class="command-send" type="button" data-web-helper-ticket-note-send="${escapeHtml(getWebHelperTicketId(ticket))}">Save Ticket Note</button>
      <button class="new-client-button secondary-button" type="button" data-web-helper-ticket-action="chat" data-web-helper-ticket-id="${escapeHtml(getWebHelperTicketId(ticket))}">Open Agent Chat</button>
    </div>
  </section>`;
}

function openWebHelperTicket(ticketId) {
  const ticket = currentWebHelperTickets.find((request) => getWebHelperTicketId(request) === ticketId);
  if (!ticket || !elements.webHelperTicketModal || !elements.webHelperTicketContent) {
    return;
  }

  const helper = liveWebHelpers.find((item) => item.id === ticket.helperId || item.name === ticket.helperName || item.clientName === ticket.clientName);
  elements.webHelperTicketTitle.textContent = ticket.title || ticket.summary || "Web Helper Ticket";
  elements.webHelperTicketSubtitle.textContent = `${ticket.clientName || "Client"} - ${ticket.status || "new"} - ${ticket.priority || "normal"}`;
  elements.webHelperTicketContent.innerHTML = `
    <section class="client-modal-overview web-helper-ticket-overview ${getPriorityCardClass(ticket.priority)}">
      <div>
        <span class="web-helper-ticket-client">${escapeHtml(ticket.clientName || "Client")}</span>
        <h3>${escapeHtml(ticket.title || ticket.summary || "Website update request")}</h3>
        <p>${escapeHtml(ticket.summary || "No summary captured yet.")}</p>
      </div>
      <span class="pill ${getPriorityTone(ticket.priority)}">${escapeHtml(ticket.priority || "normal")}</span>
    </section>
    ${renderWebHelperTicketStats(ticket, helper)}
    <section class="web-helper-ticket-modal-section">
      <h3>Request Details</h3>
      <p>${escapeHtml(ticket.details || ticket.summary || "No expanded details were captured for this request.")}</p>
    </section>
    <section class="web-helper-ticket-modal-section">
      <h3>Helper Context</h3>
      <p>${escapeHtml(helper?.name || ticket.helperName || "Unassigned helper")}</p>
      <p>${escapeHtml(helper?.websiteUrl || ticket.websiteUrl || "Website URL pending")}</p>
      <div class="web-helper-scope">${(helper?.scope || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
    </section>
    <section class="web-helper-ticket-modal-section">
      <h3>Guardrails</h3>
      <p>${escapeHtml(ticket.approvalRequired ? "Owner approval is required before this request moves into active helper work or deployment." : "This is marked as safe scope, but deployment should still follow the configured branch policy.")}</p>
      <p>${escapeHtml(`Work should stay under ${ticket.branchPolicy || "testing_branch_only"} until approved and merged.`)}</p>
    </section>
    ${renderWebHelperTicketConversation(ticket)}
    ${renderWebHelperTicketEvents(ticket)}
    ${renderWebHelperTicketActions(ticket)}
  `;
  elements.webHelperTicketModal.classList.remove("view-hidden");
}

function closeWebHelperTicket() {
  elements.webHelperTicketModal?.classList.add("view-hidden");
}

function findCurrentWebHelperTicket(ticketId) {
  return currentWebHelperTickets.find((request) => getWebHelperTicketId(request) === ticketId);
}

function setWebHelperTicketStatusLocally(ticketId, status) {
  let updatedTicket = null;
  liveWebHelpers = (liveWebHelpers || []).map((helper) => ({
    ...helper,
    requests: (helper.requests || []).map((request, index) => {
      const candidate = {
        ...request,
        id: request.id || request.ticketId || request.payload?.ticket_id || request.payload?.ticketId || `${helper.id || slugForUi(helper.clientName)}-${slugForUi(request.title || request.summary || request.type || "request")}-${index}`,
        helperId: helper.id,
        helperName: helper.name,
        clientName: helper.clientName
      };
      if (getWebHelperTicketId(candidate) !== ticketId) {
        return request;
      }
      const event = {
        type: "status_change",
        status,
        message: `Local/default ticket moved to ${status}.`,
        actor: "mission_control",
        at: new Date().toISOString()
      };
      updatedTicket = { ...request, status, events: [...(request.events || []), event] };
      return updatedTicket;
    })
  }));
  renderWebHelpers({ helpers: liveWebHelpers, summary: summarizeWebHelpersForUi(liveWebHelpers) });
  return updatedTicket;
}

function appendWebHelperTicketEventLocally(ticketId, event) {
  let updatedTicket = null;
  liveWebHelpers = (liveWebHelpers || []).map((helper) => ({
    ...helper,
    requests: (helper.requests || []).map((request, index) => {
      const candidate = {
        ...request,
        id: request.id || request.ticketId || request.payload?.ticket_id || request.payload?.ticketId || `${helper.id || slugForUi(helper.clientName)}-${slugForUi(request.title || request.summary || request.type || "request")}-${index}`,
        helperId: helper.id,
        helperName: helper.name,
        clientName: helper.clientName
      };
      if (getWebHelperTicketId(candidate) !== ticketId) {
        return request;
      }
      updatedTicket = { ...request, events: [...(request.events || []), event] };
      return updatedTicket;
    })
  }));
  renderWebHelpers({ helpers: liveWebHelpers, summary: summarizeWebHelpersForUi(liveWebHelpers) });
  return updatedTicket;
}

async function appendWebHelperTicketEvent(ticketId, event) {
  const response = await fetch(apiUrl("/mission/web-helper-requests/event"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: ticketId,
      type: event.type || "note",
      status: event.status || "note",
      actor: event.actor || "mission_control",
      message: event.message || ""
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Ticket note failed with ${response.status}`);
  }

  await loadWebHelpers("");
  return payload.request;
}

async function saveWebHelperTicketNote(ticketId) {
  const noteInput = document.getElementById("webHelperTicketNoteInput");
  const actionResponse = document.getElementById("webHelperTicketActionResponse");
  const message = String(noteInput?.value || "").trim();
  if (!message) {
    if (actionResponse) {
      actionResponse.textContent = "Add a note before saving.";
    }
    return;
  }

  if (actionResponse) {
    actionResponse.textContent = "Saving ticket note...";
  }

  const event = {
    type: "note",
    status: "note",
    message,
    actor: "mission_control",
    at: new Date().toISOString()
  };

  try {
    await appendWebHelperTicketEvent(ticketId, event);
    if (actionResponse) {
      actionResponse.textContent = "Ticket note saved.";
    }
    openWebHelperTicket(ticketId);
  } catch (error) {
    const localTicket = appendWebHelperTicketEventLocally(ticketId, event);
    if (actionResponse) {
      actionResponse.textContent = localTicket
        ? "Default/generated ticket note saved locally. Stored client tickets persist in Postgres."
        : `Unable to save ticket note: ${String(error.message || error)}`;
    }
    if (localTicket) {
      openWebHelperTicket(ticketId);
    }
  }
}

async function updateWebHelperTicketStatus(ticketId, status) {
  const statusMessages = {
    triage: "Operator acknowledged the ticket and moved it into triage.",
    in_progress: "Helper work started under the configured testing-branch policy.",
    ready_review: "Helper marked the requested change ready for owner/client review.",
    needs_approval: "Prepared fix is waiting for owner approval before merge or production deploy.",
    approved_to_merge: "Owner approved the prepared fix for merge after testing/review.",
    approved: "Owner approved the prepared fix for merge after testing/review.",
    blocked: "Ticket needs more information before helper work can continue.",
    done: "Ticket completed, merged, or archived."
  };
  const actionResponse = document.getElementById("webHelperTicketActionResponse");
  if (actionResponse) {
    actionResponse.textContent = "Updating ticket...";
  }

  try {
    const response = await fetch(apiUrl("/mission/web-helper-requests/status"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: ticketId,
        status,
        actor: "mission_control",
        message: statusMessages[status] || `Operator moved ticket to ${status}.`
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || `Status update failed with ${response.status}`);
    }

    await loadWebHelpers("");
    if (actionResponse) {
      actionResponse.textContent = `Ticket moved to ${status}.`;
    }
    openWebHelperTicket(ticketId);
  } catch (error) {
    const localTicket = setWebHelperTicketStatusLocally(ticketId, status);
    if (actionResponse) {
      actionResponse.textContent = localTicket
        ? `Default/generated ticket moved to ${status} locally. Stored client tickets will persist in Postgres.`
        : `Unable to update ticket: ${String(error.message || error)}`;
    }
    if (localTicket) {
      openWebHelperTicket(ticketId);
    }
  }
}

async function createWebHelperCodexBuild(ticketId) {
  const actionResponse = document.getElementById("webHelperTicketActionResponse");
  if (actionResponse) {
    actionResponse.textContent = "Creating Codex build task...";
  }

  try {
    const response = await fetch(apiUrl("/mission/web-helper-requests/codex-build"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: ticketId
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || `Codex build task failed with ${response.status}`);
    }

    await loadWebHelpers("");
    const relayMessage = payload.relay?.ok
      ? "sent to the configured Codex runner"
      : "queued in Mission Control for Codex runner pickup";
    openWebHelperTicket(ticketId);
    const refreshedResponse = document.getElementById("webHelperTicketActionResponse");
    if (refreshedResponse) {
      refreshedResponse.textContent = `${payload.task?.id || "Codex build task"} ${relayMessage}. Branch: ${payload.task?.targetBranch || "testing branch"}.`;
    }
  } catch (error) {
    if (actionResponse) {
      actionResponse.textContent = `Unable to create Codex build task: ${String(error.message || error)}`;
    }
  }
}

async function handleWebHelperOwnerAction(ticketId, action) {
  const noteInput = document.getElementById("webHelperTicketNoteInput");
  const actionResponse = document.getElementById("webHelperTicketActionResponse");
  const instructions = String(noteInput?.value || "").trim();
  const normalizedAction = action === "approve-merge"
    ? "approve_merge"
    : action === "redo-chat"
      ? "redo_with_chat"
      : action;

  if (action === "redo-chat" && !instructions) {
    if (actionResponse) {
      actionResponse.textContent = "Add redo instructions in the ticket note box first.";
    }
    noteInput?.focus();
    return;
  }

  if (actionResponse) {
    actionResponse.textContent = action === "approve-merge" ? "Approving merge handoff..." : "Sending redo request...";
  }

  try {
    const response = await fetch(apiUrl("/mission/web-helper-requests/owner-action"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: ticketId,
        action: normalizedAction,
        instructions
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || `Owner action failed with ${response.status}`);
    }

    await loadWebHelpers("");
    openWebHelperTicket(ticketId);
    const refreshedResponse = document.getElementById("webHelperTicketActionResponse");
    if (refreshedResponse) {
      if (action === "approve-merge") {
        refreshedResponse.textContent = payload.relay?.ok
          ? "Merge approval sent to the Codex runner."
          : "Merge approval queued for the Codex runner.";
      } else {
        refreshedResponse.textContent = payload.relay?.ok
          ? "Redo instructions sent to the Codex runner."
          : "Redo instructions queued for the Codex runner.";
      }
    }
  } catch (error) {
    if (actionResponse) {
      actionResponse.textContent = `Unable to complete workflow action: ${String(error.message || error)}`;
    }
  }
}

async function openWebHelperAgentChat(ticketId) {
  const ticket = findCurrentWebHelperTicket(ticketId);
  if (!ticket) {
    return;
  }

  const prompt = [
    `Web Helper ticket: ${ticket.title || ticket.summary || ticketId}`,
    `Client: ${ticket.clientName || "Unknown client"}`,
    `Page: ${ticket.pageUrl || "sitewide"}`,
    `Priority: ${ticket.priority || "normal"}`,
    `Status: ${ticket.status || "new"}`,
    `Branch policy: ${ticket.branchPolicy || "testing_branch_only"}`,
    `Approval required: ${ticket.approvalRequired ? "yes" : "no"}`,
    `Details: ${ticket.details || ticket.summary || "No details captured."}`,
    "Prepare the next operator action, keep changes review-gated, and do not deploy without approval."
  ].join("\n");

  const event = {
    type: "agent_chat",
    status: "agent_chat",
    message: "Operator opened this ticket in the Execution agent chat workspace.",
    actor: "mission_control",
    at: new Date().toISOString()
  };
  try {
    await appendWebHelperTicketEvent(ticketId, event);
  } catch {
    appendWebHelperTicketEventLocally(ticketId, event);
  }

  closeWebHelperTicket();
  setActiveView("execution");
  setFocusMode(true, "execution");
  if (elements.executionCommandInput) {
    elements.executionCommandInput.value = prompt;
    elements.executionCommandInput.focus();
  }
  if (elements.executionCommandResponse) {
    elements.executionCommandResponse.textContent = "Ticket context loaded. Run when you want the Web Helper agent plan.";
  }
}

function renderWebHelpers(payload) {
  if (!elements.webHelperCards || !elements.webHelperRequests || !elements.webHelperSummary) {
    return;
  }

  const helpers = payload?.helpers || [];
  const requests = flattenWebHelperRequests(helpers);
  const supportRequests = requests.filter((request) => !isWebHelperOperationalTask(request));
  const filters = getWebHelperFilterState();
  const visibleRequests = supportRequests.filter((request) => webHelperTicketMatchesFilters(request, filters));
  notifyWebHelperTicketChanges(supportRequests);
  currentWebHelperTickets = supportRequests;
  const requestsByColumn = webHelperKanbanColumns.reduce((accumulator, column) => {
    accumulator[column.id] = [];
    return accumulator;
  }, {});
  visibleRequests.forEach((request) => {
    const columnId = getWebHelperTicketColumn(request);
    requestsByColumn[columnId] = requestsByColumn[columnId] || [];
    requestsByColumn[columnId].push(request);
  });

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
      <span>New Intake</span>
      <strong>${requestsByColumn.new.length}</strong>
    </article>
    <article class="web-helper-stat">
      <span>Owner Approval</span>
      <strong>${requestsByColumn.needs_approval.length}</strong>
    </article>
    <article class="web-helper-stat">
      <span>In Motion</span>
      <strong>${requestsByColumn.in_progress.length + requestsByColumn.ready_review.length + requestsByColumn.needs_approval.length}</strong>
    </article>
  `;

  if (!helpers.length) {
    elements.webHelperCards.innerHTML = `
      <div class="web-helper-empty">
        <article class="web-helper-empty-hero">
          <div>
            <h3>No Web Helpers Configured</h3>
            <p>Activate one helper per completed client site after final payment, with client-safe request handling, approval rules, repo access, and handoff memory.</p>
          </div>
          <span class="pill tone-gray">Waiting</span>
        </article>
        <div class="web-helper-factory">
          ${[
            {
              title: "Template Factory",
              status: "ready",
              detail: "Generate a reusable helper profile from client onboarding, service scope, site stack, and approved contacts.",
              chips: ["client-profile.md", "scope-rules.md", "website-stack.md"]
            },
            {
              title: "Request Intake",
              status: "planned",
              detail: "Route client texts or update requests into classified tasks: copy, images, hours, links, forms, bugs, or escalation.",
              chips: ["client request", "triage", "SLA"]
            },
            {
              title: "Approval Gates",
              status: "required",
              detail: "Let helpers prepare code or content while owner approval controls deploys, risky changes, ads, forms, and billing-sensitive work.",
              chips: ["safe edits", "owner approval", "deploy notes"]
            },
            {
              title: "Agent Handoff",
              status: "next",
              detail: "After completion payment, move the site from build mode into Web Helper care with memory files and maintenance rhythm.",
              chips: ["final payment", "handoff", "monthly care"]
            }
          ].map((item) => `<article class="web-helper-factory-card">
            <div class="web-helper-card-head">
              <h3>${escapeHtml(item.title)}</h3>
              <span class="pill ${item.status === "required" ? "tone-yellow" : item.status === "ready" ? "tone-green" : "tone-blue"}">${escapeHtml(item.status)}</span>
            </div>
            <p>${escapeHtml(item.detail)}</p>
            <div class="web-helper-scope">${item.chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join("")}</div>
          </article>`).join("")}
        </div>
      </div>
    `;
    elements.webHelperRequests.innerHTML = `
      <article class="web-helper-request">
        <h3>Helper Intake Ready</h3>
        <p>Add monitored sites, connect client repos/deployments, or move a launched client into Web Helper Care to create the first helper queue.</p>
      </article>
      <article class="web-helper-request">
        <h3>First Activation Path</h3>
        <p>Client final payment -> helper template -> scope rules -> approved contacts -> request queue.</p>
      </article>
    `;
    updateNavBadges();
    return;
  }

  elements.webHelperCards.innerHTML = `
    <div class="web-helper-filter-status">
      <span>${visibleRequests.length} of ${supportRequests.length} support tickets visible</span>
      ${filters.search || filters.status !== "all" || filters.priority !== "all" || filters.approval !== "all"
        ? "<strong>Filtered support view</strong>"
        : "<strong>Support tickets only</strong>"}
    </div>
    <div class="web-helper-kanban">
      ${webHelperKanbanColumns.map((column) => {
        const columnRequests = requestsByColumn[column.id] || [];
        return `<section class="web-helper-kanban-column" aria-label="${escapeHtml(column.label)}">
          <div class="web-helper-kanban-head">
            <div>
              <h3>${escapeHtml(column.label)}</h3>
              <p>${escapeHtml(column.hint)}</p>
            </div>
            <strong>${columnRequests.length}</strong>
          </div>
          <div class="web-helper-kanban-stack">
            ${columnRequests.length
              ? columnRequests.map(renderWebHelperTicketCard).join("")
              : `<div class="web-helper-kanban-empty">No tickets here.</div>`}
          </div>
        </section>`;
      }).join("")}
    </div>
  `;

  elements.webHelperRequests.innerHTML = helpers.length
    ? `<article class="web-helper-request">
        <h3>Capacity Moved to Ticket Details</h3>
        <p>Click any ticket card to review helper assignment, repo, deployment, branch policy, scope, and approval context.</p>
      </article>`
    : `<article class="web-helper-request">
        <h3>No Helper Capacity</h3>
        <p>Activate client helpers to create capacity and triage routes.</p>
      </article>`;

  updateNavBadges();
  renderCockpit();
  renderExecutionConsole();
}

function renderExecutionConsole() {
  if (!elements.executionSummary || !elements.executionBoard) {
    return;
  }

  const execution = activeCommandPlan.execution;
  const actions = execution?.actions || [];
  const runningCount = actions.filter((action) => ["running", "queued", "attention"].includes(action.status)).length;
  const completedCount = actions.filter((action) => ["complete", "completed", "success"].includes(action.status)).length;
  const failedCount = actions.filter((action) => ["failed", "error", "blocked"].includes(action.status)).length;
  renderOpsSummary(elements.executionSummary, [
    { label: "Active Run", value: execution ? 1 : 0 },
    { label: "Routed Actions", value: actions.length },
    { label: "Running", value: runningCount },
    { label: "Completed", value: completedCount },
    { label: "Failures", value: failedCount }
  ]);

  const statusCard = execution
    ? `<article class="execution-status-card">
        <div>
          <span>Current Run</span>
          <h3>${escapeHtml(execution.id)}</h3>
          <p>Overall status: <strong class="${getExecutionStatusClass(execution.status)}">${escapeHtml(execution.status)}</strong></p>
        </div>
        <span class="pill ${getExecutionStatusClass(execution.status)}">${escapeHtml(execution.status)}</span>
      </article>`
    : `<article class="execution-status-card">
        <div>
          <span>Current Run</span>
          <h3>No active execution</h3>
          <p>Dispatch a command to generate a coordinated action plan, route agents, and begin status polling.</p>
        </div>
        <span class="pill tone-gray">waiting</span>
      </article>`;

  const actionCards = actions.length
    ? actions.map((action) => `<article class="execution-action-card">
        <div class="execution-action-head">
          <h3>${escapeHtml(action.action)}</h3>
          <span class="exec-status ${getExecutionStatusClass(action.status)}">${escapeHtml(action.status)}</span>
        </div>
        <p>${escapeHtml(action.detail || "No detail provided.")}</p>
        <div class="execution-mini-grid">
          <div><span>Target</span>${escapeHtml(action.target || "n/a")}</div>
          <div><span>Agent</span>${escapeHtml(action.agent || "n/a")}</div>
          <div><span>Mode</span>${escapeHtml(action.dispatchMode || "primary")}</div>
          <div><span>Attempts</span>${escapeHtml(String(action.attempts ?? 0))}</div>
        </div>
      </article>`).join("")
    : `<article class="execution-empty-card">
        <h3>Execution Ready</h3>
        <p>Use this tab for commands that need coordinated action: client updates, Web Helper handoffs, GEO setup, service routing, incident triage, or approval prep.</p>
      </article>`;

  const historyItems = execution?.history?.length
    ? execution.history.slice(-5).map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : "<li>No execution events yet.</li>";

  const memoryItems = commandMemory.length
    ? commandMemory.slice(0, 3).map((entry) => `<article class="execution-memory-card">
        <h3>${escapeHtml(entry.command)}</h3>
        <p>${escapeHtml(entry.summary)}</p>
        <span>${escapeHtml(entry.status)} | ${escapeHtml(entry.priority)}</span>
      </article>`).join("")
    : `<article class="execution-memory-card">
        <h3>No command history</h3>
        <p>Completed command outcomes will appear here as Mission Control learns from runs.</p>
      </article>`;

  elements.executionBoard.innerHTML = `
    <div class="execution-primary-grid">
      ${statusCard}
      <article class="execution-status-card">
        <div>
          <span>Operating Mode</span>
          <h3>Owner-supervised automation</h3>
          <p>Agents can prepare actions, but risky client, deploy, billing, ad, and form changes stay approval-gated.</p>
        </div>
      </article>
    </div>
    <section class="execution-section">
      <div class="onboarding-section-title">
        <h3>Action Routing</h3>
        <p>Live run actions, assigned agents, targets, and dispatch state.</p>
      </div>
      <div class="execution-actions-grid">${actionCards}</div>
    </section>
    <section class="execution-secondary-grid">
      <article>
        <h3>Run Timeline</h3>
        <ul>${historyItems}</ul>
      </article>
      <article>
        <h3>Recent Command Memory</h3>
        <div class="execution-memory-stack">${memoryItems}</div>
      </article>
    </section>
  `;
  renderExecutionActions();
}

function renderExecutionActions() {
  if (!elements.executionActions) {
    return;
  }

  const execution = activeCommandPlan.execution;
  const actions = execution?.actions || [];
  const blockedActions = actions.filter((action) => ["attention", "blocked", "failed", "error"].includes(action.status));
  const runningActions = actions.filter((action) => ["running", "queued", "pending"].includes(action.status));
  const recentEvents = execution?.history?.slice(-3) || [];

  if (!execution) {
    elements.executionActions.innerHTML = `
      <article class="execution-side-item">
        <h3>No active run</h3>
        <p>Dispatch a mission command to generate routed actions and execution status.</p>
      </article>
      <article class="execution-side-item">
        <h3>Approval Model</h3>
        <p>Agents prepare work. Owner approval controls deploys, billing-sensitive changes, ads, forms, and risky client updates.</p>
      </article>
      <article class="execution-side-item">
        <h3>Best First Commands</h3>
        <p>Try a Web Helper handoff, GEO service connection, client issue triage, or service routing directive.</p>
      </article>
    `;
    return;
  }

  elements.executionActions.innerHTML = `
    <article class="execution-side-item">
      <div class="execution-side-head">
        <h3>Current Run</h3>
        <span class="exec-status ${getExecutionStatusClass(execution.status)}">${escapeHtml(execution.status)}</span>
      </div>
      <p>${escapeHtml(execution.id)}</p>
    </article>
    <article class="execution-side-item">
      <h3>Approval Needed</h3>
      ${blockedActions.length
        ? blockedActions.map((action) => `<p>${escapeHtml(action.action)} -> ${escapeHtml(action.target || "review")}</p>`).join("")
        : "<p>No approval blockers detected.</p>"}
    </article>
    <article class="execution-side-item">
      <h3>Active Routing</h3>
      ${runningActions.length
        ? runningActions.slice(0, 4).map((action) => `<p>${escapeHtml(action.agent || "Agent")}: ${escapeHtml(action.action)}</p>`).join("")
        : "<p>No active routed actions.</p>"}
    </article>
    <article class="execution-side-item">
      <h3>Recent Run Events</h3>
      ${recentEvents.length
        ? recentEvents.map((event) => `<p>${escapeHtml(event)}</p>`).join("")
        : "<p>No execution events recorded yet.</p>"}
    </article>
  `;
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
  renderIntelligenceCore(site);
  renderStrategyCommand(liveStrategicPlan);
  renderAgents(site);
  renderBuildQueue(site);
  loadWebHelpers("");
}

async function runMissionCommand() {
  const isExecutionView = activeView === "execution";
  const sourceInput = isExecutionView && elements.executionCommandInput ? elements.executionCommandInput : elements.commandInput;
  const sourceResponse = isExecutionView && elements.executionCommandResponse ? elements.executionCommandResponse : elements.commandResponse;
  const sourceButton = isExecutionView && elements.executionCommandSend ? elements.executionCommandSend : elements.commandSend;
  const input = sourceInput.value.trim();
  if (!input) {
    sourceResponse.textContent = "Enter a command to dispatch next-action intelligence.";
    return;
  }

  if (elements.commandInput && sourceInput !== elements.commandInput) {
    elements.commandInput.value = input;
  }
  if (elements.executionCommandInput && sourceInput !== elements.executionCommandInput) {
    elements.executionCommandInput.value = input;
  }

  sourceButton.disabled = true;
  sourceResponse.textContent = "Dispatching command to mission backend...";
  if (sourceResponse !== elements.commandResponse) {
    elements.commandResponse.textContent = sourceResponse.textContent;
  }

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
    const activationNote = plan.webHelperActivation?.agentName
      ? ` ${plan.webHelperActivation.agentName} knowledge pack activated.`
      : "";
    const bulkActivationNote = plan.webHelperBulkActivation
      ? ` Web Helper handoff checked ${plan.webHelperBulkActivation.targetCount || 0} clients: ${plan.webHelperBulkActivation.activatedCount || 0} activated, ${plan.webHelperBulkActivation.existingCount || 0} already active, ${plan.webHelperBulkActivation.failedCount || 0} failed.`
      : "";
    sourceResponse.textContent = `${plan.summary}${aiNote}${activationNote}${bulkActivationNote}`;
    if (sourceResponse !== elements.commandResponse) {
      elements.commandResponse.textContent = sourceResponse.textContent;
    }
    if (elements.executionCommandResponse && sourceResponse !== elements.executionCommandResponse) {
      elements.executionCommandResponse.textContent = sourceResponse.textContent;
    }
    renderCommandPlan();
    renderCommandMemory();
    renderCollaborationFeed([]);
    startExecutionPolling();
    pollExecutionStatus();
  } catch (error) {
    stopExecutionPolling();
    sourceResponse.textContent = "Mission backend unavailable. Start the app with npm start to enable live command routing.";
    if (sourceResponse !== elements.commandResponse) {
      elements.commandResponse.textContent = sourceResponse.textContent;
    }
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
    sourceButton.disabled = false;
  }
}

async function init() {
  setupNavigation();
  loadTools();
  await loadMissionSnapshot();
  renderWebsiteOptions();

  const initialSite = missionData.websites[0] || getEmptySiteState();
  elements.siteSelect.value = initialSite.id || "";
  renderSite(initialSite.id);
  renderCommandPlan();
  loadCommandMemory();
  await loadClients();
  loadOnboarding();
  loadServices();
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
  elements.executionCommandSend?.addEventListener("click", runMissionCommand);
  elements.executionCommandInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      runMissionCommand();
    }
  });

  if (elements.clientOnboardForm) {
    elements.clientOnboardForm.addEventListener("submit", submitClientOnboarding);
  }
  elements.clientServicesInput?.addEventListener("change", (event) => {
    const input = event.target.closest("input[data-client-service]");
    if (!input || !input.checked) {
      return;
    }

    const oppositeState = input.dataset.clientServiceState === "active" ? "planned" : "active";
    const oppositeInput = elements.clientServicesInput.querySelector(
      `input[data-client-service="${input.dataset.clientService}"][data-client-service-state="${oppositeState}"]`
    );
    if (oppositeInput) {
      oppositeInput.checked = false;
    }
  });
  if (elements.agentBuildForm) {
    elements.agentBuildForm.addEventListener("submit", submitAgentBuildDraft);
  }

  elements.openClientModalButton?.addEventListener("click", () => openClientModal());
  elements.startOnboardingButton?.addEventListener("click", () => openClientModal({ mode: "lead", stage: "lead" }));
  elements.closeClientModalButton?.addEventListener("click", closeClientModal);
  elements.closeLeadNotificationButton?.addEventListener("click", closeLeadNotification);
  elements.closeAgentBuildModalButton?.addEventListener("click", closeAgentBuildModal);
  elements.closeWebHelperTicketButton?.addEventListener("click", closeWebHelperTicket);
  elements.closeClientDataHealthButton?.addEventListener("click", closeClientDataHealth);
  elements.clientArchiveButton?.addEventListener("click", archiveEditingClient);
  elements.clientDeleteButton?.addEventListener("click", deleteEditingClient);
  elements.copyAgentBuildPromptButton?.addEventListener("click", copyAgentBuildPrompt);
  elements.agentBuildTargetInput?.addEventListener("change", () => {
    const agent = {
      name: elements.agentBuildNameInput.value,
      service: elements.agentBuildServiceInput.value,
      priority: elements.agentBuildPriorityInput.value,
      why: elements.agentBuildPurposeInput.value,
      prerequisites: elements.agentBuildPrerequisitesInput.value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
    };
    elements.agentBuildPromptInput.value = buildAgentDraftPrompt(agent, elements.agentBuildTargetInput.value);
  });
  elements.closeClientDetailButton?.addEventListener("click", closeClientDetail);
  elements.editClientDetailButton?.addEventListener("click", () => {
    if (!selectedClientId) {
      return;
    }

    const clientId = selectedClientId;
    closeClientDetail();
    openClientModal({ clientId, title: "Edit Client" });
  });
  elements.clientSearchInput?.addEventListener("input", () => renderClients(liveClients));
  elements.clientStageFilter?.addEventListener("change", () => renderClients(liveClients));
  elements.clientIssueFilter?.addEventListener("change", () => renderClients(liveClients));
  elements.clientCards?.addEventListener("click", (event) => {
    if (event.target.closest("[data-run-web-helper-handoff]")) {
      runWebHelperHandoffAutomation();
    }
  });
  elements.webHelperSearchInput?.addEventListener("input", () => renderWebHelpers({ helpers: liveWebHelpers, summary: summarizeWebHelpersForUi(liveWebHelpers) }));
  elements.webHelperStatusFilter?.addEventListener("change", () => renderWebHelpers({ helpers: liveWebHelpers, summary: summarizeWebHelpersForUi(liveWebHelpers) }));
  elements.webHelperPriorityFilter?.addEventListener("change", () => renderWebHelpers({ helpers: liveWebHelpers, summary: summarizeWebHelpersForUi(liveWebHelpers) }));
  elements.webHelperApprovalFilter?.addEventListener("change", () => renderWebHelpers({ helpers: liveWebHelpers, summary: summarizeWebHelpersForUi(liveWebHelpers) }));
  elements.onboardingSearchInput?.addEventListener("input", () => renderOnboarding(liveOnboarding));
  elements.onboardingBucketFilter?.addEventListener("change", () => renderOnboarding(liveOnboarding));
  elements.onboardingStatusFilter?.addEventListener("change", () => renderOnboarding(liveOnboarding));
  elements.cockpitBoard?.addEventListener("click", (event) => {
    const dataHealthTarget = event.target.closest("[data-cockpit-action='data-health'], [data-client-data-health]");
    if (dataHealthTarget) {
      openClientDataHealth();
      return;
    }

    const viewTarget = event.target.closest("[data-view-shortcut]");
    if (viewTarget) {
      setActiveView(viewTarget.dataset.viewShortcut);
      return;
    }

    const clientTarget = event.target.closest("[data-client-detail]");
    if (clientTarget) {
      openClientDetail(clientTarget.dataset.clientDetail);
      return;
    }

    const ticketTarget = event.target.closest("[data-web-helper-ticket]");
    if (ticketTarget) {
      setActiveView("web-helpers");
      openWebHelperTicket(ticketTarget.dataset.webHelperTicket);
    }
  });
  elements.clientsPanel?.addEventListener("click", (event) => {
    if (Date.now() - lastClientDragAt < 350) {
      return;
    }

    const dataHealthTarget = event.target.closest("[data-client-data-health]");
    if (dataHealthTarget) {
      openClientDataHealth();
      return;
    }

    const editTarget = event.target.closest("[data-client-edit]");
    if (editTarget) {
      closeClientDetail();
      openClientModal({ clientId: editTarget.dataset.clientEdit, title: "Edit Client" });
      return;
    }

    const detailTarget = event.target.closest("[data-client-detail]");
    if (!detailTarget) {
      return;
    }

    if (event.target.closest("a")) {
      return;
    }

    openClientDetail(detailTarget.dataset.clientDetail);
  });
  elements.clientsPanel?.addEventListener("dragstart", (event) => {
    const dragTarget = event.target.closest("[data-client-drag]");
    if (!dragTarget) {
      return;
    }

    draggingClientId = dragTarget.dataset.clientDrag;
    dragTarget.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggingClientId);
  });
  elements.clientsPanel?.addEventListener("dragend", () => {
    lastClientDragAt = Date.now();
    draggingClientId = "";
    elements.clientPipeline?.querySelectorAll(".is-dragging, .is-drag-over").forEach((element) => {
      element.classList.remove("is-dragging", "is-drag-over");
    });
  });
  elements.clientPipeline?.addEventListener("dragover", (event) => {
    const dropTarget = event.target.closest("[data-client-stage-drop]");
    if (!dropTarget || !draggingClientId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    elements.clientPipeline.querySelectorAll(".is-drag-over").forEach((element) => element.classList.remove("is-drag-over"));
    dropTarget.classList.add("is-drag-over");
  });
  elements.clientPipeline?.addEventListener("dragleave", (event) => {
    const dropTarget = event.target.closest("[data-client-stage-drop]");
    if (dropTarget && !dropTarget.contains(event.relatedTarget)) {
      dropTarget.classList.remove("is-drag-over");
    }
  });
  elements.clientPipeline?.addEventListener("drop", (event) => {
    const dropTarget = event.target.closest("[data-client-stage-drop]");
    if (!dropTarget) {
      return;
    }

    event.preventDefault();
    const clientId = event.dataTransfer.getData("text/plain") || draggingClientId;
    const stageId = dropTarget.dataset.clientStageDrop;
    dropTarget.classList.remove("is-drag-over");
    draggingClientId = "";
    lastClientDragAt = Date.now();
    updateClientStage(clientId, stageId);
  });
  elements.clientDetailDrawer?.addEventListener("click", (event) => {
    const upsellTarget = event.target.closest("[data-client-upsell-email][data-client-upsell-service]");
    if (upsellTarget) {
      openUpsellEmailAgent(upsellTarget.dataset.clientUpsellEmail, upsellTarget.dataset.clientUpsellService);
      return;
    }

    const provisionTarget = event.target.closest("[data-client-provision-web-helper]");
    if (provisionTarget) {
      provisionClientWebHelper(provisionTarget.dataset.clientProvisionWebHelper);
      return;
    }

    const editTarget = event.target.closest("[data-client-edit]");
    if (!editTarget) {
      return;
    }

    closeClientDetail();
    openClientModal({ clientId: editTarget.dataset.clientEdit, title: "Edit Client" });
  });
  elements.clientsPanel?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const detailTarget = event.target.closest("[data-client-detail]");
    if (!detailTarget) {
      return;
    }

    event.preventDefault();
    openClientDetail(detailTarget.dataset.clientDetail);
  });
  elements.servicesPanel?.addEventListener("click", (event) => {
    const serviceTab = event.target.closest("[data-service-tab]");
    if (serviceTab) {
      activeServiceSubview = serviceTab.dataset.serviceTab || "all";
      saveStoredValue(storageKeys.serviceSubview, activeServiceSubview);
      renderServices(liveServiceCatalog);
      return;
    }

    const refreshMemoryTarget = event.target.closest("[data-service-refresh-memory]");
    if (refreshMemoryTarget) {
      event.preventDefault();
      event.stopPropagation();
      refreshClientWebHelperMemory(refreshMemoryTarget.dataset.serviceRefreshMemory, refreshMemoryTarget);
      return;
    }

    const supportLinkTarget = event.target.closest("[data-service-support-link]");
    if (supportLinkTarget) {
      event.preventDefault();
      event.stopPropagation();
      openClientSupportLink(supportLinkTarget.dataset.serviceSupportLink);
      return;
    }

    const testTicketTarget = event.target.closest("[data-service-test-ticket]");
    if (testTicketTarget) {
      event.preventDefault();
      event.stopPropagation();
      sendClientWebHelperTestTicket(testTicketTarget.dataset.serviceTestTicket, testTicketTarget);
      return;
    }

    const detailTarget = event.target.closest("[data-client-detail]");
    if (!detailTarget) {
      return;
    }

    if (event.target.closest("a")) {
      return;
    }

    openClientDetail(detailTarget.dataset.clientDetail);
  });
  elements.servicesPanel?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const detailTarget = event.target.closest("[data-client-detail]");
    if (!detailTarget) {
      return;
    }

    event.preventDefault();
    openClientDetail(detailTarget.dataset.clientDetail);
  });
  elements.clientOnboardModal?.addEventListener("click", (event) => {
    if (event.target === elements.clientOnboardModal) {
      closeClientModal();
    }
  });
  elements.leadNotificationModal?.addEventListener("click", (event) => {
    if (event.target === elements.leadNotificationModal) {
      closeLeadNotification();
      return;
    }

    const stageTarget = event.target.closest("[data-lead-action-stage]");
    if (stageTarget && selectedLeadNotificationId) {
      const clientId = selectedLeadNotificationId;
      const stageId = stageTarget.dataset.leadActionStage;
      closeLeadNotification();
      updateLeadStage(clientId, stageId);
      return;
    }

    const editTarget = event.target.closest("[data-lead-notification-edit]");
    if (editTarget) {
      const clientId = editTarget.dataset.leadNotificationEdit;
      closeLeadNotification();
      closeClientDetail();
      openClientModal({ clientId, title: "Edit Client" });
      return;
    }

    const detailTarget = event.target.closest("[data-lead-notification-detail]");
    if (detailTarget) {
      const clientId = detailTarget.dataset.leadNotificationDetail;
      closeLeadNotification();
      openClientDetail(clientId);
    }
  });
  elements.agentBuildModal?.addEventListener("click", (event) => {
    if (event.target === elements.agentBuildModal) {
      closeAgentBuildModal();
    }
  });
  elements.clientDataHealthModal?.addEventListener("click", (event) => {
    if (event.target === elements.clientDataHealthModal) {
      closeClientDataHealth();
      return;
    }

    const mergeButton = event.target.closest("[data-client-merge-source][data-client-merge-target]");
    if (mergeButton) {
      mergeClientRecordsFromUi(mergeButton.dataset.clientMergeSource, mergeButton.dataset.clientMergeTarget);
    }
  });
  elements.webHelperTicketModal?.addEventListener("click", (event) => {
    if (event.target === elements.webHelperTicketModal) {
      closeWebHelperTicket();
      return;
    }

    const actionButton = event.target.closest("[data-web-helper-ticket-action]");
    const noteButton = event.target.closest("[data-web-helper-ticket-note-send]");
    if (noteButton) {
      saveWebHelperTicketNote(noteButton.dataset.webHelperTicketNoteSend);
      return;
    }

    if (!actionButton) {
      return;
    }

    const ticketId = actionButton.dataset.webHelperTicketId;
    if (actionButton.dataset.webHelperTicketAction === "chat") {
      openWebHelperAgentChat(ticketId);
      return;
    }

    if (actionButton.dataset.webHelperTicketAction === "codex-build") {
      createWebHelperCodexBuild(ticketId);
      return;
    }

    if (["approve-merge", "redo", "redo-chat"].includes(actionButton.dataset.webHelperTicketAction)) {
      handleWebHelperOwnerAction(ticketId, actionButton.dataset.webHelperTicketAction);
      return;
    }

    updateWebHelperTicketStatus(ticketId, actionButton.dataset.webHelperTicketStatus || "triage");
  });
  elements.agentOpsPanel?.addEventListener("click", (event) => {
    const buildButton = event.target.closest("[data-agent-build-index]");
    if (!buildButton) {
      return;
    }

    openAgentBuildModal(buildButton.dataset.agentBuildIndex);
  });
  elements.webHelperCards?.addEventListener("click", (event) => {
    const ticketButton = event.target.closest("[data-web-helper-ticket]");
    if (ticketButton) {
      openWebHelperTicket(ticketButton.dataset.webHelperTicket);
      return;
    }

    const activateButton = event.target.closest("[data-web-helper-activate]");
    if (!activateButton) {
      return;
    }

    activateWebHelper(activateButton.dataset.webHelperActivate, {
      refresh: Boolean(event.shiftKey)
    });
  });
  elements.webHelperRequests?.addEventListener("click", (event) => {
    const activateButton = event.target.closest("[data-web-helper-activate]");
    if (!activateButton) {
      return;
    }

    activateWebHelper(activateButton.dataset.webHelperActivate, {
      refresh: Boolean(event.shiftKey)
    });
  });
  elements.onboardingPanel?.addEventListener("click", (event) => {
    if (Date.now() - lastLeadDragAt < 350) {
      return;
    }

    const notificationTarget = event.target.closest("[data-lead-notification]");
    if (notificationTarget) {
      event.preventDefault();
      event.stopPropagation();
      openLeadNotification(notificationTarget.dataset.leadNotification);
      return;
    }

    const skipButton = event.target.closest("[data-onboarding-skip-client][data-onboarding-skip-item]");
    if (skipButton) {
      toggleOnboardingSkip(skipButton.dataset.onboardingSkipClient, skipButton.dataset.onboardingSkipItem);
      return;
    }

    const detailTarget = event.target.closest("[data-client-detail]");
    if (detailTarget) {
      if (event.target.closest("button")) {
        return;
      }
      openClientDetail(detailTarget.dataset.clientDetail);
    }
  });
  elements.onboardingPanel?.addEventListener("dragstart", (event) => {
    const dragTarget = event.target.closest("[data-lead-drag]");
    if (!dragTarget) {
      return;
    }

    draggingLeadId = dragTarget.dataset.leadDrag;
    dragTarget.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggingLeadId);
  });
  elements.onboardingPanel?.addEventListener("dragend", () => {
    lastLeadDragAt = Date.now();
    draggingLeadId = "";
    elements.onboardingPanel?.querySelectorAll(".is-dragging, .is-drag-over").forEach((element) => {
      element.classList.remove("is-dragging", "is-drag-over");
    });
  });
  elements.onboardingPanel?.addEventListener("dragover", (event) => {
    const dropTarget = event.target.closest("[data-lead-stage-drop]");
    if (!dropTarget || !draggingLeadId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    elements.onboardingPanel.querySelectorAll(".is-drag-over").forEach((element) => element.classList.remove("is-drag-over"));
    dropTarget.classList.add("is-drag-over");
  });
  elements.onboardingPanel?.addEventListener("dragleave", (event) => {
    const dropTarget = event.target.closest("[data-lead-stage-drop]");
    if (dropTarget && !dropTarget.contains(event.relatedTarget)) {
      dropTarget.classList.remove("is-drag-over");
    }
  });
  elements.onboardingPanel?.addEventListener("drop", (event) => {
    const dropTarget = event.target.closest("[data-lead-stage-drop]");
    if (!dropTarget) {
      return;
    }

    event.preventDefault();
    const clientId = event.dataTransfer.getData("text/plain") || draggingLeadId;
    const leadStage = dropTarget.dataset.leadStageDrop;
    dropTarget.classList.remove("is-drag-over");
    draggingLeadId = "";
    lastLeadDragAt = Date.now();
    updateLeadStage(clientId, leadStage);
  });
  elements.onboardingPanel?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const detailTarget = event.target.closest("[data-client-detail]");
    if (!detailTarget) {
      return;
    }

    if (event.target.closest("[data-lead-notification]")) {
      return;
    }

    event.preventDefault();
    openClientDetail(detailTarget.dataset.clientDetail);
  });

  setInterval(async () => {
    const previousSiteId = activeSiteId;
    await loadMissionSnapshot();
    renderWebsiteOptions();

    const nextSite = missionData.websites.find((site) => site.id === previousSiteId) || missionData.websites[0] || getEmptySiteState();
    elements.siteSelect.value = nextSite.id || "";
    renderSite(nextSite.id);
  }, 60_000);

  startWebHelperPolling();
}

init();
