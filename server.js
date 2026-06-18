const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const BASE_PORT = Number(process.env.PORT || 4173);
const MAX_PORT_ATTEMPTS = 10;
const ROOT = __dirname;
const PAGE_TIMEOUT_MS = Number(process.env.PAGE_TIMEOUT_MS || 8000);
const MONITOR_CACHE_TTL_MS = Number(process.env.MONITOR_CACHE_TTL_MS || 60000);
const DISCOVERY_CACHE_TTL_MS = Number(process.env.DISCOVERY_CACHE_TTL_MS || 300000);
const MAX_DISCOVERED_PAGES = Number(process.env.MAX_DISCOVERED_PAGES || 250);
const DISCOVERY_MAX_DEPTH = Number(process.env.DISCOVERY_MAX_DEPTH || 2);
const AUTO_DISCOVER_PAGES_DEFAULT = String(process.env.AUTO_DISCOVER_PAGES || "true").toLowerCase() !== "false";
const AI_REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 12000);
const AI_PROVIDER = String(process.env.AI_PROVIDER || "auto").toLowerCase();
const OPENAI_API_KEY = String(process.env.OPENAI_API_KEY || "").trim();
const OPENAI_MODEL = String(process.env.OPENAI_MODEL || "gpt-4.1-mini").trim();
const ANTHROPIC_API_KEY = String(process.env.ANTHROPIC_API_KEY || "").trim();
const ANTHROPIC_MODEL = String(process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest").trim();
const OPENROUTER_API_KEY = String(process.env.OPENROUTER_API_KEY || "").trim();
const OPENROUTER_MODEL = String(process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini").trim();
const OPENROUTER_HTTP_REFERER = String(process.env.OPENROUTER_HTTP_REFERER || "").trim();
const OPENROUTER_APP_NAME = String(process.env.OPENROUTER_APP_NAME || "Ghost Mission Control").trim();
const VERCEL_TOKEN = String(process.env.VERCEL_TOKEN || "").trim();
const VERCEL_TEAM_ID = String(process.env.VERCEL_TEAM_ID || "").trim();
const VERCEL_AUTO_IMPORT_PROJECTS = String(process.env.VERCEL_AUTO_IMPORT_PROJECTS || "true").toLowerCase() !== "false";
const VERCEL_SYNC_CACHE_TTL_MS = Number(process.env.VERCEL_SYNC_CACHE_TTL_MS || 300000);
const VERCEL_MAX_PROJECTS = Number(process.env.VERCEL_MAX_PROJECTS || 100);
const GITHUB_OWNER = String(process.env.GITHUB_OWNER || "burchdad").trim();
const GITHUB_TOKEN = String(process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "").trim();
const GITHUB_REPO_CACHE_TTL_MS = Number(process.env.GITHUB_REPO_CACHE_TTL_MS || 300000);
const GITHUB_MAX_REPO_PAGES = Math.max(1, Number(process.env.GITHUB_MAX_REPO_PAGES || 10));
const WEB_HELPER_ACTIVATIONS_PATH = String(
  process.env.WEB_HELPER_ACTIVATIONS_PATH || path.join(ROOT, ".ghost-web-helper-activations.json")
).trim();
const RUNTIME_CLIENTS_PATH = String(
  process.env.RUNTIME_CLIENTS_PATH || path.join(ROOT, ".ghost-runtime-clients.json")
).trim();
const CLIENT_STORE_REPO = String(process.env.CLIENT_STORE_REPO || `${GITHUB_OWNER}/ghost_mission_control`).trim();
const CLIENT_STORE_FILE = String(process.env.CLIENT_STORE_FILE || "data/mission-clients.json").trim();
const CLIENT_STORE_BRANCH = String(process.env.CLIENT_STORE_BRANCH || "main").trim();
const CLIENT_STORE_GITHUB_SYNC = String(process.env.CLIENT_STORE_GITHUB_SYNC || "true").toLowerCase() !== "false";
const CLIENT_STORE_POSTGRES_ENABLED = String(process.env.CLIENT_STORE_POSTGRES_ENABLED || "true").toLowerCase() !== "false";
const CLIENT_STORE_CACHE_TTL_MS = Number(process.env.CLIENT_STORE_CACHE_TTL_MS || 30000);
const DATABASE_URL = String(process.env.DATABASE_URL || process.env.POSTGRES_URL || "").trim();
const DATABASE_SSL = String(process.env.DATABASE_SSL || "auto").toLowerCase();
const WEB_HELPER_AUTO_ACTIVATE = String(process.env.WEB_HELPER_AUTO_ACTIVATE || "true").toLowerCase() !== "false";
const WEB_HELPER_HANDOFF_STAGE = "launch-handoff";
const GHOST_WEB_HELPER_WEBHOOK_SECRET = String(process.env.GHOST_WEB_HELPER_WEBHOOK_SECRET || "").trim();
const GHOST_WEB_HELPER_ALLOWED_SOURCES = String(process.env.GHOST_WEB_HELPER_ALLOWED_SOURCES || "client_admin_dashboard")
  .split(",")
  .map((source) => source.trim())
  .filter(Boolean);
const GHOST_WEB_HELPER_DEFAULT_BRANCH_POLICY = String(process.env.GHOST_WEB_HELPER_DEFAULT_BRANCH_POLICY || "testing_branch_only").trim();
const GHOST_WEB_HELPER_DEFAULT_APPROVAL_REQUIRED = String(process.env.GHOST_WEB_HELPER_DEFAULT_APPROVAL_REQUIRED || "true").toLowerCase() !== "false";
const CODEX_BUILD_WEBHOOK_URL = String(process.env.CODEX_BUILD_WEBHOOK_URL || "").trim();
const CODEX_BUILD_WEBHOOK_SECRET = String(process.env.CODEX_BUILD_WEBHOOK_SECRET || "").trim();
const CODEX_BUILD_DEFAULT_BASE_BRANCH = String(process.env.CODEX_BUILD_DEFAULT_BASE_BRANCH || "main").trim();
const CODEX_BUILD_DEFAULT_TEST_COMMAND = String(process.env.CODEX_BUILD_DEFAULT_TEST_COMMAND || "npm run check && npm run build").trim();
const WEB_HELPER_AUTOMATION_ENABLED = String(process.env.WEB_HELPER_AUTOMATION_ENABLED || "true").toLowerCase() !== "false";
const CLIENT_UPDATE_EMAIL_WEBHOOK_URL = String(process.env.CLIENT_UPDATE_EMAIL_WEBHOOK_URL || "").trim();
const CLIENT_UPDATE_EMAIL_WEBHOOK_SECRET = String(process.env.CLIENT_UPDATE_EMAIL_WEBHOOK_SECRET || "").trim();
const GHOST_MISSION_CONTROL_PUBLIC_URL = String(process.env.GHOST_MISSION_CONTROL_PUBLIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN || "").trim();
const runtimeClients = [];
let runtimeClientsHydrated = false;
let runtimeClientsRepoSyncedAt = 0;
let runtimeClientsRepoSyncPending = null;
let runtimeClientsRepoLastError = "";
let runtimeClientsRepoLastPersistAt = 0;
let runtimeClientsDbSyncedAt = 0;
let runtimeClientsDbLastPersistAt = 0;
let runtimeClientsDbLastError = "";
let runtimeClientsDbAvailable = null;
let clientStorePgPool = null;
let clientStorePgInitPromise = null;
let webHelperRequestPgInitPromise = null;
let codexBuildTaskPgInitPromise = null;

const CLIENT_PIPELINE_STAGES = [
  { id: "lead", label: "Lead / Prospect" },
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

const LEAD_SOURCE_DEFINITIONS = [
  { id: "social-media", label: "Social Media" },
  { id: "referral", label: "Referral" },
  { id: "lead-command-center", label: "Ghost Lead Command" },
  { id: "digital-business-card", label: "Digital Business Card" },
  { id: "email", label: "Email" },
  { id: "ai-outreach", label: "AI Outreach" },
  { id: "other", label: "Other / Manual" }
];

const LEAD_PIPELINE_STAGES = [
  { id: "new-lead", label: "New Lead" },
  { id: "contacted-discovery", label: "Contacted / Discovery" },
  { id: "proposal-sent", label: "Proposal + Invoice Sent" },
  { id: "agreement-returned", label: "Agreement Returned" },
  { id: "deposit-paid", label: "Closed Leads / Build Queue" },
  { id: "lost-not-now", label: "Lost / Not Now" }
];

const CLOSED_LEAD_CLIENT_STAGES = CLIENT_PIPELINE_STAGES
  .map((stage) => stage.id)
  .filter((stageId) => stageId !== "lead" && stageId !== "paused-archived");

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

const monitoringCache = {
  generatedAt: 0,
  snapshot: null,
  pending: null
};

const discoveryCache = new Map();
const vercelSiteCache = {
  generatedAt: 0,
  sites: [],
  pending: null,
  lastAttemptAt: 0,
  lastSuccessAt: 0,
  lastError: "",
  lastProjectCount: 0
};
const githubRepoCache = {
  generatedAt: 0,
  repos: [],
  pending: null,
  lastAttemptAt: 0,
  lastSuccessAt: 0,
  lastError: ""
};
const repoKnowledgeCache = new Map();
const webHelperActivations = new Map();
let webHelperActivationsHydrated = false;
let webHelperAutoActivationPromise = null;

function parseBool(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["0", "false", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `site-${Math.random().toString(36).slice(2, 8)}`;
}

function canonicalClientId(value) {
  const id = slugify(value);
  const aliases = {
    "anna-s-air": "annas-air",
    "anna-air": "annas-air"
  };
  return aliases[id] || id;
}

function normalizeDomain(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "";
  }

  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return new URL(trimmed).hostname;
    }
  } catch {
    return "";
  }

  return trimmed.replace(/\/+$/, "").toLowerCase();
}

function normalizeIdentityDomain(value) {
  return normalizeDomain(value).replace(/^www\./, "");
}

function ensureHttpsUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "";
  }

  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return new URL(trimmed).origin;
    }

    return new URL(`https://${trimmed}`).origin;
  } catch {
    return "";
  }
}

function parseMonitoredSites() {
  const rawJson = process.env.MONITORED_SITES || process.env.MONITORED_SITES_JSON || "";
  const quickUrls = String(process.env.MONITORED_SITE_URLS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  let sites = [];

  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) {
        sites = parsed;
      }
    } catch {
      console.warn("Unable to parse MONITORED_SITES JSON. Falling back to MONITORED_SITE_URLS if provided.");
    }
  }

  if (!sites.length && quickUrls.length) {
    sites = quickUrls
      .map((urlString) => {
        try {
          const parsed = new URL(urlString);
          return {
            name: parsed.hostname,
            domain: parsed.hostname,
            rootUrl: parsed.origin,
            pages: [urlString],
            autoDiscoverPages: true
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }

  return sites
    .map((site, index) => {
      const pages = Array.isArray(site.pages)
        ? site.pages
            .map((page) => {
              if (typeof page === "string") {
                return { url: page };
              }

              if (page && typeof page.url === "string") {
                return {
                  label: page.label || "",
                  url: page.url
                };
              }

              return null;
            })
            .filter(Boolean)
        : [];

      let rootUrl = site.rootUrl || site.baseUrl || site.url || "";
      if (!rootUrl && pages.length) {
        try {
          rootUrl = new URL(pages[0].url).origin;
        } catch {
          rootUrl = "";
        }
      }

      if (rootUrl) {
        try {
          rootUrl = new URL(rootUrl).origin;
        } catch {
          rootUrl = "";
        }
      }

      if (!pages.length && !rootUrl) {
        return null;
      }

      const domain = site.domain || (() => {
        try {
          if (pages.length) {
            return new URL(pages[0].url).hostname;
          }

          if (rootUrl) {
            return new URL(rootUrl).hostname;
          }

          return `site-${index + 1}`;
        } catch {
          return `site-${index + 1}`;
        }
      })();

      const id = site.id || slugify(site.name || domain);
      return {
        id,
        name: site.name || domain,
        domain,
        rootUrl,
        pages,
        autoDiscoverPages: parseBool(site.autoDiscoverPages, AUTO_DISCOVER_PAGES_DEFAULT)
      };
    })
    .filter(Boolean);
}

const staticMonitoredSites = parseMonitoredSites();

function hasVercelIntegrationConfigured() {
  return Boolean(VERCEL_TOKEN) && VERCEL_AUTO_IMPORT_PROJECTS;
}

function getVercelApiUrl(pathname, query = {}) {
  const base = new URL(`https://api.vercel.com${pathname}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      base.searchParams.set(key, String(value));
    }
  }

  if (VERCEL_TEAM_ID) {
    base.searchParams.set("teamId", VERCEL_TEAM_ID);
  }

  return base.toString();
}

async function fetchVercelJson(pathname, query = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PAGE_TIMEOUT_MS);

  try {
    const response = await fetch(getVercelApiUrl(pathname, query), {
      method: "GET",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Vercel API request failed (${response.status})`);
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchVercelProjectDomains(projectId, fallbackDomains = []) {
  try {
    const payload = await fetchVercelJson(`/v9/projects/${encodeURIComponent(projectId)}/domains`, {
      limit: 100
    });

    const apiDomains = (Array.isArray(payload?.domains) ? payload.domains : [])
      .map((item) => normalizeDomain(item?.name || item?.domain || item))
      .filter(Boolean);

    const combined = [...fallbackDomains, ...apiDomains];
    return [...new Set(combined)];
  } catch {
    return [...new Set(fallbackDomains)];
  }
}

async function fetchLatestVercelDeploymentUrl(projectId) {
  try {
    const payload = await fetchVercelJson("/v13/deployments", {
      projectId,
      target: "production",
      state: "READY",
      limit: 1
    });

    const deployment = Array.isArray(payload?.deployments) ? payload.deployments[0] : null;
    if (!deployment?.url) {
      return "";
    }

    return ensureHttpsUrl(deployment.url);
  } catch {
    return "";
  }
}

async function fetchVercelMonitoredSites() {
  if (!hasVercelIntegrationConfigured()) {
    return { sites: [], projectCount: 0 };
  }

  const payload = await fetchVercelJson("/v9/projects", {
    limit: Math.max(1, Math.min(VERCEL_MAX_PROJECTS, 100))
  });
  const projects = Array.isArray(payload?.projects) ? payload.projects : [];

  const sites = await Promise.all(
    projects.map(async (project, index) => {
      const projectId = String(project?.id || "").trim();
      const projectName = String(project?.name || projectId || `vercel-project-${index + 1}`).trim();
      if (!projectId) {
        return null;
      }

      const fallbackDomains = (Array.isArray(project?.domains) ? project.domains : [])
        .map((item) => normalizeDomain(item?.name || item?.domain || item))
        .filter(Boolean);

      const domains = await fetchVercelProjectDomains(projectId, fallbackDomains);
      const rootFromDomain = domains.length ? ensureHttpsUrl(domains[0]) : "";
      const rootFromDeployment = await fetchLatestVercelDeploymentUrl(projectId);
      const rootUrl = rootFromDomain || rootFromDeployment;
      const domain = normalizeDomain(rootUrl) || domains[0] || "";

      if (!rootUrl && !domain) {
        return null;
      }

      return {
        id: `vercel-${slugify(projectName)}`,
        name: projectName,
        domain: domain || `${slugify(projectName)}.vercel.app`,
        rootUrl,
        pages: rootUrl ? [{ label: "Homepage", url: rootUrl }] : [],
        autoDiscoverPages: true
      };
    })
  );

  return {
    sites: sites.filter(Boolean),
    projectCount: projects.length
  };
}

function toIsoOrNull(timestamp) {
  if (!timestamp) {
    return null;
  }

  return new Date(timestamp).toISOString();
}

function getVercelIntegrationStatus() {
  const now = Date.now();
  const cacheAgeMs = vercelSiteCache.generatedAt ? now - vercelSiteCache.generatedAt : null;
  return {
    autoImportEnabled: VERCEL_AUTO_IMPORT_PROJECTS,
    tokenConfigured: Boolean(VERCEL_TOKEN),
    teamScopeConfigured: Boolean(VERCEL_TEAM_ID),
    configured: hasVercelIntegrationConfigured(),
    cache: {
      ttlMs: VERCEL_SYNC_CACHE_TTL_MS,
      ageMs: cacheAgeMs,
      importedSites: vercelSiteCache.sites.length,
      sourceProjects: vercelSiteCache.lastProjectCount
    },
    limits: {
      maxProjects: Math.max(1, Math.min(VERCEL_MAX_PROJECTS, 100))
    },
    sync: {
      lastAttemptAt: toIsoOrNull(vercelSiteCache.lastAttemptAt),
      lastSuccessAt: toIsoOrNull(vercelSiteCache.lastSuccessAt),
      lastError: vercelSiteCache.lastError || null,
      inFlight: Boolean(vercelSiteCache.pending)
    }
  };
}

async function getVercelMonitoredSites(forceRefresh = false) {
  if (!hasVercelIntegrationConfigured()) {
    return [];
  }

  const now = Date.now();
  if (!forceRefresh && vercelSiteCache.sites.length && now - vercelSiteCache.generatedAt < VERCEL_SYNC_CACHE_TTL_MS) {
    return vercelSiteCache.sites;
  }

  if (!forceRefresh && vercelSiteCache.pending) {
    return vercelSiteCache.pending;
  }

  vercelSiteCache.lastAttemptAt = Date.now();
  vercelSiteCache.pending = fetchVercelMonitoredSites()
    .then((result) => {
      const sites = result?.sites || [];
      vercelSiteCache.sites = sites;
      vercelSiteCache.generatedAt = Date.now();
      vercelSiteCache.lastSuccessAt = vercelSiteCache.generatedAt;
      vercelSiteCache.lastProjectCount = Number(result?.projectCount || 0);
      vercelSiteCache.lastError = "";
      vercelSiteCache.pending = null;
      return sites;
    })
    .catch((error) => {
      vercelSiteCache.pending = null;
      vercelSiteCache.lastError = String(error?.message || error || "unknown error");
      console.warn(`Unable to sync Vercel monitored projects: ${vercelSiteCache.lastError}`);
      return vercelSiteCache.sites;
    });

  return vercelSiteCache.pending;
}

async function getResolvedMonitoredSites(forceRefresh = false) {
  const vercelSites = await getVercelMonitoredSites(forceRefresh);
  if (!vercelSites.length) {
    return staticMonitoredSites;
  }

  const domainSet = new Set(staticMonitoredSites.map((site) => normalizeDomain(site.domain)).filter(Boolean));
  const rootSet = new Set(staticMonitoredSites.map((site) => ensureHttpsUrl(site.rootUrl)).filter(Boolean));
  const merged = [...staticMonitoredSites];

  for (const site of vercelSites) {
    const domain = normalizeDomain(site.domain);
    const root = ensureHttpsUrl(site.rootUrl);
    if ((domain && domainSet.has(domain)) || (root && rootSet.has(root))) {
      continue;
    }

    merged.push(site);
    if (domain) {
      domainSet.add(domain);
    }

    if (root) {
      rootSet.add(root);
    }
  }

  return merged;
}

function getDefaultSiteId() {
  return monitoringCache.snapshot?.websites?.[0]?.id || staticMonitoredSites[0]?.id || "unknown-site";
}

function parseXmlLocTags(xml) {
  const locMatches = [...String(xml || "").matchAll(/<loc>([^<]+)<\/loc>/gi)];
  return locMatches
    .map((match) => String(match[1] || "").trim())
    .filter(Boolean);
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PAGE_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "GhostMissionControl/1.0 (+discovery)"
      }
    });

    if (!response.ok) {
      return "";
    }

    return await response.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

function parseSitemapsFromRobots(robotsText) {
  return String(robotsText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^sitemap:/i.test(line))
    .map((line) => line.replace(/^sitemap:/i, "").trim())
    .filter(Boolean);
}

async function discoverFromSitemapUrl(sitemapUrl, depth, visited, pageUrls) {
  if (!sitemapUrl || visited.has(sitemapUrl) || depth > DISCOVERY_MAX_DEPTH || pageUrls.size >= MAX_DISCOVERED_PAGES) {
    return;
  }

  visited.add(sitemapUrl);

  const xml = await fetchText(sitemapUrl);
  if (!xml) {
    return;
  }

  const locs = parseXmlLocTags(xml);
  if (!locs.length) {
    return;
  }

  const isIndex = /<sitemapindex[\s>]/i.test(xml);
  if (isIndex) {
    for (const loc of locs) {
      await discoverFromSitemapUrl(loc, depth + 1, visited, pageUrls);
      if (pageUrls.size >= MAX_DISCOVERED_PAGES) {
        break;
      }
    }
    return;
  }

  for (const loc of locs) {
    if (pageUrls.size >= MAX_DISCOVERED_PAGES) {
      break;
    }

    pageUrls.add(loc);
  }
}

async function discoverSitePages(site) {
  const cached = discoveryCache.get(site.id);
  const now = Date.now();
  if (cached && now - cached.generatedAt < DISCOVERY_CACHE_TTL_MS) {
    return cached.pages;
  }

  const discovered = new Map();
  for (const page of site.pages || []) {
    discovered.set(page.url, {
      label: page.label || "",
      url: page.url
    });
  }

  if (site.rootUrl && site.autoDiscoverPages) {
    const sitemapCandidates = [`${site.rootUrl}/sitemap.xml`];
    const robotsText = await fetchText(`${site.rootUrl}/robots.txt`);
    sitemapCandidates.push(...parseSitemapsFromRobots(robotsText));

    const pageUrls = new Set();
    const visited = new Set();
    for (const sitemapUrl of sitemapCandidates) {
      await discoverFromSitemapUrl(sitemapUrl, 0, visited, pageUrls);
      if (pageUrls.size >= MAX_DISCOVERED_PAGES) {
        break;
      }
    }

    for (const url of pageUrls) {
      if (!discovered.has(url)) {
        discovered.set(url, { label: "", url });
      }
    }
  }

  if (!discovered.size && site.rootUrl) {
    discovered.set(site.rootUrl, { label: "Homepage", url: site.rootUrl });
  }

  const pages = [...discovered.values()].slice(0, MAX_DISCOVERED_PAGES);
  discoveryCache.set(site.id, {
    generatedAt: Date.now(),
    pages
  });

  return pages;
}

async function probePage(page) {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PAGE_TIMEOUT_MS);

  try {
    const response = await fetch(page.url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "GhostMissionControl/1.0 (+monitoring)"
      }
    });

    clearTimeout(timer);

    return {
      label: page.label || "",
      url: page.url,
      ok: response.ok,
      statusCode: response.status,
      latencyMs: Date.now() - start,
      error: null,
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    clearTimeout(timer);
    return {
      label: page.label || "",
      url: page.url,
      ok: false,
      statusCode: 0,
      latencyMs: Date.now() - start,
      error: String(error?.message || error || "request failed"),
      checkedAt: new Date().toISOString()
    };
  }
}

function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  return `${(ms / 1000).toFixed(2)}s`;
}

function toneFromStatus(status) {
  if (status === "Action Needed") {
    return "red";
  }

  if (status === "Minor Warnings") {
    return "yellow";
  }

  return "green";
}

function buildSiteSnapshot(site, checks, totalSites) {
  const failed = checks.filter((item) => !item.ok);
  const slow = checks.filter((item) => item.ok && item.latencyMs >= 1500);
  const healthy = checks.filter((item) => item.ok && item.latencyMs < 1500);

  const status = failed.length > 0 ? "Action Needed" : slow.length > 0 ? "Minor Warnings" : "All Systems Green";

  const recommendation = failed.length
    ? "Investigate failed pages and recover reachability."
    : slow.length
      ? "Optimize page latency and CDN behavior for warning pages."
      : "System stable. Scale monitoring coverage or add deeper page checks.";

  const topSlow = [...slow].sort((a, b) => b.latencyMs - a.latencyMs)[0];

  const alerts = [
    ...failed.map((item) => ({
      title: `Page unreachable (${item.statusCode || "error"})`,
      detail: `${item.url}${item.error ? ` - ${item.error}` : ""}`,
      tone: "red"
    })),
    ...slow.map((item) => ({
      title: "High latency detected",
      detail: `${item.url} responded in ${formatDuration(item.latencyMs)}`,
      tone: "yellow"
    }))
  ].slice(0, 6);

  const activityFeed = checks
    .slice()
    .sort((a, b) => b.latencyMs - a.latencyMs)
    .map((item) => ({
      title: item.ok ? "Page check completed" : "Page check failed",
      detail: `${item.url} | status ${item.statusCode || "error"} | ${formatDuration(item.latencyMs)}`,
      time: item.checkedAt
    }))
    .slice(0, 8);

  const rankedAgents = getRankedAgents(site.id).slice(0, 4).map((entry) => ({
    name: entry.name,
    status: entry.trend === "Down" ? "Error" : "Active",
    tone: entry.trend === "Down" ? "red" : "blue",
    statline: `${entry.successfulActions} success | ${entry.failedActions} fail | ${entry.retriedActions} retries`,
    rank: entry.rank,
    trend: entry.trend,
    efficiency: `${Math.round(entry.confidence)}%`
  }));

  const generatedAt = new Date().toISOString();

  return {
    id: site.id,
    name: site.name,
    domain: site.domain,
    status,
    pages: checks,
    kpis: [
      { label: "Websites Monitored", value: totalSites, delta: "Live configuration" },
      { label: "Pages Monitored", value: checks.length, delta: `${healthy.length} healthy` },
      { label: "Failed Pages", value: failed.length, delta: failed.length ? "requires action" : "none" },
      { label: "Slow Pages", value: slow.length, delta: slow.length ? "latency warning" : "within target" }
    ],
    missionStrip: {
      summary: `${status}. ${recommendation}`,
      statuses: [
        { label: "All Systems Green", tone: "green" },
        { label: "Minor Warnings", tone: "yellow" },
        { label: "Action Needed", tone: "red" }
      ]
    },
    modules: [
      {
        name: "Uptime Monitor",
        status,
        tone: toneFromStatus(status),
        priority: failed.length ? "P1 Critical" : slow.length ? "P2 High Value" : "P3 Important",
        priorityHeat: failed.length ? "critical" : slow.length ? "high" : "monitor",
        owner: "Monitoring Agent",
        metrics: {
          "Pages Healthy": String(healthy.length),
          "Pages Failed": String(failed.length),
          "Checks Run": String(checks.length),
          "Last Sync": generatedAt
        },
        revenue: {
          influenced: "n/a",
          generated: "n/a",
          pipeline: "n/a"
        },
        ownership: {
          confidence: `${failed.length ? 70 : slow.length ? 82 : 95}%`,
          autonomy: "Guided",
          lastDecision: recommendation,
          needsHuman: failed.length ? "Yes" : "No"
        },
        autoAction: {
          enabled: true,
          lastFix: failed.length ? "Prepared remediation recommendation" : "No corrective action required",
          escalation: failed.length ? "Required" : "Not Required"
        }
      },
      {
        name: "Performance Guardrail",
        status: slow.length ? "Optimizing" : "Stable",
        tone: slow.length ? "yellow" : "green",
        priority: slow.length ? "P2 High Value" : "P4 Nice to Improve",
        priorityHeat: slow.length ? "high" : "monitor",
        owner: "Performance Agent",
        metrics: {
          "Average Latency": `${Math.round(checks.reduce((sum, item) => sum + item.latencyMs, 0) / Math.max(checks.length, 1))}ms`,
          "Slow Pages": String(slow.length),
          "Top Slow URL": topSlow ? topSlow.url : "none",
          "Latency Threshold": "1500ms"
        },
        revenue: {
          influenced: "n/a",
          generated: "n/a",
          pipeline: "n/a"
        },
        ownership: {
          confidence: `${slow.length ? 80 : 92}%`,
          autonomy: "Guided",
          lastDecision: slow.length ? "Flagged latency hotspots for optimization" : "Latency within acceptable range",
          needsHuman: "No"
        },
        autoAction: {
          enabled: true,
          lastFix: slow.length ? "Queued performance investigation" : "No optimization action required",
          escalation: slow.length ? "Review Suggested" : "Not Required"
        }
      }
    ],
    crossInsights: [
      {
        title: "Coverage summary",
        detail: `${checks.length} monitored pages checked for ${site.domain}.`
      },
      {
        title: "Stability insight",
        detail: failed.length
          ? `${failed.length} page(s) are unreachable and likely impacting visibility.`
          : "No unreachable pages detected in current monitoring cycle."
      },
      {
        title: "Performance insight",
        detail: slow.length
          ? `${slow.length} page(s) exceeded latency threshold and should be optimized.`
          : "All reachable pages are within latency thresholds."
      }
    ],
    alerts,
    activityFeed,
    agents: rankedAgents,
    buildQueue: {
      "Idea Backlog": failed.length ? [] : ["Add deeper synthetic checks"],
      Researching: slow.length ? ["Analyze slow endpoint dependency chain"] : [],
      "Ready to Build": failed.length ? ["Create outage auto-remediation workflow"] : [],
      Building: [],
      Testing: [],
      "Ready to Deploy": [],
      Live: ["Live website/page monitoring"],
      Archived: []
    }
  };
}

async function computeMissionSnapshot(forceRefresh = false) {
  const resolvedSites = await getResolvedMonitoredSites(forceRefresh);
  const websites = [];

  for (const site of resolvedSites) {
    const resolvedPages = await discoverSitePages(site);
    const checks = await Promise.all(resolvedPages.map((page) => probePage(page)));
    websites.push(buildSiteSnapshot(site, checks, resolvedSites.length));
  }

  return {
    generatedAt: new Date().toISOString(),
    configuredSites: resolvedSites.length,
    websites
  };
}

async function getMissionSnapshot(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && monitoringCache.snapshot && now - monitoringCache.generatedAt < MONITOR_CACHE_TTL_MS) {
    return monitoringCache.snapshot;
  }

  if (!forceRefresh && monitoringCache.pending) {
    return monitoringCache.pending;
  }

  monitoringCache.pending = computeMissionSnapshot(forceRefresh)
    .then((snapshot) => {
      monitoringCache.snapshot = snapshot;
      monitoringCache.generatedAt = Date.now();
      monitoringCache.pending = null;
      return snapshot;
    })
    .catch((error) => {
      monitoringCache.pending = null;
      throw error;
    });

  return monitoringCache.pending;
}

function formatWebHelperDate(value) {
  if (!value) {
    return "No deploy recorded";
  }

  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return "No deploy recorded";
  }
}

function hydrateWebHelperActivations() {
  if (webHelperActivationsHydrated) {
    return;
  }

  webHelperActivationsHydrated = true;

  try {
    if (!WEB_HELPER_ACTIVATIONS_PATH || !fs.existsSync(WEB_HELPER_ACTIVATIONS_PATH)) {
      return;
    }

    const raw = fs.readFileSync(WEB_HELPER_ACTIVATIONS_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const entries = Array.isArray(parsed?.activations)
      ? parsed.activations
      : Object.entries(parsed?.activations || {});

    entries.forEach((entry) => {
      const key = Array.isArray(entry) ? entry[0] : entry?.siteId || entry?.clientId;
      const activation = Array.isArray(entry) ? entry[1] : entry;
      if (key && activation?.agent?.name && activation?.knowledge) {
        webHelperActivations.set(String(key), activation);
      }
    });
  } catch (error) {
    console.warn(`Unable to hydrate Web Helper activations: ${String(error?.message || error)}`);
  }
}

function persistWebHelperActivations() {
  if (!WEB_HELPER_ACTIVATIONS_PATH) {
    return;
  }

  try {
    const dir = path.dirname(WEB_HELPER_ACTIVATIONS_PATH);
    fs.mkdirSync(dir, { recursive: true });
    const payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      activations: Object.fromEntries(webHelperActivations.entries())
    };
    const tempPath = `${WEB_HELPER_ACTIVATIONS_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2));
    fs.renameSync(tempPath, WEB_HELPER_ACTIVATIONS_PATH);
  } catch (error) {
    console.warn(`Unable to persist Web Helper activations: ${String(error?.message || error)}`);
  }
}

function getClientStoreLocalPath() {
  const candidate = path.resolve(ROOT, CLIENT_STORE_FILE || "data/mission-clients.json");
  return candidate.startsWith(ROOT) ? candidate : path.join(ROOT, "data", "mission-clients.json");
}

function parseClientStorePayload(raw) {
  if (!raw) {
    return [];
  }

  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  return Array.isArray(parsed?.clients) ? parsed.clients : Array.isArray(parsed) ? parsed : [];
}

const PROTECTED_CLIENT_IDS = new Set(["annas-air", "bougie-and-company", "keisha-law", "procoat-concrete-coatings"]);

function hasProtectedClientIdConflict(left, right) {
  const leftId = canonicalClientId(left?.id);
  const rightId = canonicalClientId(right?.id);
  return Boolean(
    leftId &&
      rightId &&
      leftId !== rightId &&
      PROTECTED_CLIENT_IDS.has(leftId) &&
      PROTECTED_CLIENT_IDS.has(rightId)
  );
}

function upsertRuntimeClient(client) {
  const normalized = normalizeClient({
    ...client,
    source: "runtime"
  });
  if (!normalized) {
    return null;
  }

  const normalizedKeys = new Set(getClientIdentityKeys(normalized));
  const existingIndex = runtimeClients.findIndex((entry) => {
    if (canonicalClientId(entry.id) === canonicalClientId(normalized.id)) {
      return true;
    }
    if (entry.id && normalized.id) {
      return false;
    }
    return getClientIdentityKeys(entry).some((key) => key !== `id:${canonicalClientId(entry.id)}` && normalizedKeys.has(key));
  });
  if (existingIndex >= 0) {
    runtimeClients[existingIndex] = mergeClientRecords(runtimeClients[existingIndex], {
      ...normalized,
      source: "runtime"
    });
    return runtimeClients[existingIndex];
  }

  runtimeClients.push({
    ...normalized,
    source: "runtime"
  });
  return runtimeClients[runtimeClients.length - 1];
}

function hydrateRuntimeClientsFromFile(filePath, label) {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      return;
    }

    const raw = fs.readFileSync(filePath, "utf8");
    parseClientStorePayload(raw).forEach(upsertRuntimeClient);
  } catch (error) {
    console.warn(`Unable to hydrate ${label} clients: ${String(error?.message || error)}`);
  }
}

function hydrateRuntimeClients() {
  if (runtimeClientsHydrated) {
    return;
  }

  runtimeClientsHydrated = true;
  hydrateRuntimeClientsFromFile(getClientStoreLocalPath(), "repo store");
  hydrateRuntimeClientsFromFile(RUNTIME_CLIENTS_PATH, "runtime cache");
}

function persistRuntimeClients() {
  if (!RUNTIME_CLIENTS_PATH) {
    return;
  }

  try {
    const dir = path.dirname(RUNTIME_CLIENTS_PATH);
    fs.mkdirSync(dir, { recursive: true });
    const payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      clients: runtimeClients
    };
    const tempPath = `${RUNTIME_CLIENTS_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2));
    fs.renameSync(tempPath, RUNTIME_CLIENTS_PATH);
  } catch (error) {
    console.warn(`Unable to persist runtime clients: ${String(error?.message || error)}`);
  }
}

function getClientStorePayload() {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    storage: "ghost-mission-control-repo",
    clients: runtimeClients
  };
}

function isClientStoreDatabaseEnabled() {
  return CLIENT_STORE_POSTGRES_ENABLED && Boolean(DATABASE_URL);
}

function getClientStoreDatabaseSsl() {
  if (DATABASE_SSL === "true") {
    return { rejectUnauthorized: false };
  }

  if (DATABASE_SSL === "false") {
    return false;
  }

  try {
    const parsed = new URL(DATABASE_URL);
    const sslMode = String(parsed.searchParams.get("sslmode") || "").toLowerCase();
    if (["require", "prefer", "no-verify"].includes(sslMode)) {
      return { rejectUnauthorized: false };
    }
  } catch {
    // Keep Railway/internal Postgres as the default no-SSL path.
  }

  return false;
}

function getClientStorePgPool() {
  if (!isClientStoreDatabaseEnabled()) {
    return null;
  }

  if (clientStorePgPool) {
    return clientStorePgPool;
  }

  try {
    const { Pool } = require("pg");
    clientStorePgPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: getClientStoreDatabaseSsl()
    });
    clientStorePgPool.on("error", (error) => {
      runtimeClientsDbAvailable = false;
      runtimeClientsDbLastError = String(error?.message || error);
    });
    return clientStorePgPool;
  } catch (error) {
    runtimeClientsDbAvailable = false;
    runtimeClientsDbLastError = `Postgres client unavailable: ${String(error?.message || error)}`;
    return null;
  }
}

async function ensureClientStoreTable() {
  const pool = getClientStorePgPool();
  if (!pool) {
    return {
      ok: false,
      target: "postgres",
      skipped: true,
      reason: isClientStoreDatabaseEnabled() ? runtimeClientsDbLastError : "DATABASE_URL is not configured."
    };
  }

  if (clientStorePgInitPromise) {
    return clientStorePgInitPromise;
  }

  clientStorePgInitPromise = pool
    .query(`
      CREATE TABLE IF NOT EXISTS mission_clients (
        id text PRIMARY KEY,
        client_name text NOT NULL,
        stage text NOT NULL DEFAULT 'website-build',
        website_url text NOT NULL DEFAULT '',
        repo text NOT NULL DEFAULT '',
        github_url text NOT NULL DEFAULT '',
        railway_url text NOT NULL DEFAULT '',
        vercel_url text NOT NULL DEFAULT '',
        mobile_app_url text NOT NULL DEFAULT '',
        google_business_url text NOT NULL DEFAULT '',
        analytics_url text NOT NULL DEFAULT '',
        ads_status text NOT NULL DEFAULT '',
        social_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
        services jsonb NOT NULL DEFAULT '[]'::jsonb,
        planned_services jsonb NOT NULL DEFAULT '[]'::jsonb,
        final_domain_purchased boolean,
        client_details_pending boolean NOT NULL DEFAULT false,
        lead_source text NOT NULL DEFAULT '',
        lead_source_detail text NOT NULL DEFAULT '',
        lead_stage text NOT NULL DEFAULT '',
        relationship_type text NOT NULL DEFAULT 'client',
        pricing_tier text NOT NULL DEFAULT 'standard',
        proposal_sent boolean NOT NULL DEFAULT false,
        deposit_invoice_sent boolean NOT NULL DEFAULT false,
        proposal_signed boolean NOT NULL DEFAULT false,
        partnership_signed boolean NOT NULL DEFAULT false,
        deposit_paid boolean NOT NULL DEFAULT false,
        final_payment_paid boolean NOT NULL DEFAULT false,
        business_email text NOT NULL DEFAULT '',
        business_phone text NOT NULL DEFAULT '',
        plan text NOT NULL DEFAULT 'Launch + Care',
        contact text NOT NULL DEFAULT '',
        notes text NOT NULL DEFAULT '',
        source text NOT NULL DEFAULT 'runtime',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE mission_clients ADD COLUMN IF NOT EXISTS planned_services jsonb NOT NULL DEFAULT '[]'::jsonb;
      ALTER TABLE mission_clients ADD COLUMN IF NOT EXISTS lead_source text NOT NULL DEFAULT '';
      ALTER TABLE mission_clients ADD COLUMN IF NOT EXISTS lead_source_detail text NOT NULL DEFAULT '';
      ALTER TABLE mission_clients ADD COLUMN IF NOT EXISTS lead_stage text NOT NULL DEFAULT '';
      ALTER TABLE mission_clients ADD COLUMN IF NOT EXISTS relationship_type text NOT NULL DEFAULT 'client';
      ALTER TABLE mission_clients ADD COLUMN IF NOT EXISTS pricing_tier text NOT NULL DEFAULT 'standard';
      ALTER TABLE mission_clients ADD COLUMN IF NOT EXISTS proposal_sent boolean NOT NULL DEFAULT false;
      ALTER TABLE mission_clients ADD COLUMN IF NOT EXISTS deposit_invoice_sent boolean NOT NULL DEFAULT false;
      CREATE INDEX IF NOT EXISTS mission_clients_updated_at_idx ON mission_clients (updated_at DESC);
    `)
    .then(() => {
      runtimeClientsDbAvailable = true;
      runtimeClientsDbLastError = "";
      return { ok: true, target: "postgres", table: "mission_clients" };
    })
    .catch((error) => {
      runtimeClientsDbAvailable = false;
      runtimeClientsDbLastError = String(error?.message || error);
      clientStorePgInitPromise = null;
      return { ok: false, target: "postgres", error: runtimeClientsDbLastError };
    });

  return clientStorePgInitPromise;
}

async function ensureWebHelperRequestTable() {
  const pool = getClientStorePgPool();
  if (!pool) {
    return {
      ok: false,
      target: "postgres",
      skipped: true,
      reason: isClientStoreDatabaseEnabled() ? runtimeClientsDbLastError : "DATABASE_URL is not configured."
    };
  }

  if (webHelperRequestPgInitPromise) {
    return webHelperRequestPgInitPromise;
  }

  webHelperRequestPgInitPromise = pool
    .query(`
      CREATE TABLE IF NOT EXISTS mission_web_helper_requests (
        id text PRIMARY KEY,
        client_id text NOT NULL,
        web_helper_id text NOT NULL DEFAULT '',
        source text NOT NULL DEFAULT '',
        request_type text NOT NULL DEFAULT 'website_update',
        title text NOT NULL DEFAULT '',
        summary text NOT NULL DEFAULT '',
        details text NOT NULL DEFAULT '',
        page_url text NOT NULL DEFAULT '',
        priority text NOT NULL DEFAULT 'normal',
        status text NOT NULL DEFAULT 'new',
        branch_policy text NOT NULL DEFAULT 'testing_branch_only',
        approval_required boolean NOT NULL DEFAULT true,
        attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
        events jsonb NOT NULL DEFAULT '[]'::jsonb,
        payload jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE mission_web_helper_requests ADD COLUMN IF NOT EXISTS events jsonb NOT NULL DEFAULT '[]'::jsonb;
      CREATE INDEX IF NOT EXISTS mission_web_helper_requests_client_idx ON mission_web_helper_requests (client_id, updated_at DESC);
      CREATE INDEX IF NOT EXISTS mission_web_helper_requests_status_idx ON mission_web_helper_requests (status, updated_at DESC);
    `)
    .then(() => ({ ok: true, target: "postgres", table: "mission_web_helper_requests" }))
    .catch((error) => {
      webHelperRequestPgInitPromise = null;
      return { ok: false, target: "postgres", table: "mission_web_helper_requests", error: String(error?.message || error) };
    });

  return webHelperRequestPgInitPromise;
}

async function ensureCodexBuildTaskTable() {
  const pool = getClientStorePgPool();
  if (!pool) {
    return {
      ok: false,
      target: "postgres",
      skipped: true,
      reason: isClientStoreDatabaseEnabled() ? runtimeClientsDbLastError : "DATABASE_URL is not configured."
    };
  }

  if (codexBuildTaskPgInitPromise) {
    return codexBuildTaskPgInitPromise;
  }

  codexBuildTaskPgInitPromise = pool
    .query(`
      CREATE TABLE IF NOT EXISTS mission_codex_build_tasks (
        id text PRIMARY KEY,
        source_ticket_id text NOT NULL,
        client_id text NOT NULL,
        web_helper_id text NOT NULL DEFAULT '',
        client_name text NOT NULL DEFAULT '',
        repo text NOT NULL DEFAULT '',
        base_branch text NOT NULL DEFAULT 'main',
        target_branch text NOT NULL DEFAULT '',
        title text NOT NULL DEFAULT '',
        status text NOT NULL DEFAULT 'queued',
        priority text NOT NULL DEFAULT 'normal',
        approval_required boolean NOT NULL DEFAULT true,
        prompt text NOT NULL DEFAULT '',
        payload jsonb NOT NULL DEFAULT '{}'::jsonb,
        relay jsonb NOT NULL DEFAULT '{}'::jsonb,
        events jsonb NOT NULL DEFAULT '[]'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS mission_codex_build_tasks_ticket_idx ON mission_codex_build_tasks (source_ticket_id, updated_at DESC);
      CREATE INDEX IF NOT EXISTS mission_codex_build_tasks_client_idx ON mission_codex_build_tasks (client_id, updated_at DESC);
      CREATE INDEX IF NOT EXISTS mission_codex_build_tasks_status_idx ON mission_codex_build_tasks (status, updated_at DESC);
    `)
    .then(() => ({ ok: true, target: "postgres", table: "mission_codex_build_tasks" }))
    .catch((error) => {
      codexBuildTaskPgInitPromise = null;
      return { ok: false, target: "postgres", table: "mission_codex_build_tasks", error: String(error?.message || error) };
    });

  return codexBuildTaskPgInitPromise;
}

function normalizeWebhookSecret(value) {
  return String(value || "").trim();
}

function timingSafeEqualText(left, right) {
  const leftValue = normalizeWebhookSecret(left);
  const rightValue = normalizeWebhookSecret(right);
  if (!leftValue || !rightValue) {
    return false;
  }

  const leftBuffer = Buffer.from(leftValue);
  const rightBuffer = Buffer.from(rightValue);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyWebHelperWebhookSecret(request) {
  if (!GHOST_WEB_HELPER_WEBHOOK_SECRET) {
    return { ok: false, status: 503, error: "GHOST_WEB_HELPER_WEBHOOK_SECRET is not configured." };
  }

  const providedSecret = request.headers["x-ghost-webhook-secret"] || request.headers["x-webhook-secret"] || "";
  if (!timingSafeEqualText(providedSecret, GHOST_WEB_HELPER_WEBHOOK_SECRET)) {
    return { ok: false, status: 401, error: "Invalid webhook secret." };
  }

  return { ok: true };
}

function normalizeWebHelperRequestPayload(payload, client) {
  const source = String(payload.source || "client_admin_dashboard").trim();
  const requestType = String(payload.request_type || payload.requestType || "website_update").trim();
  const priority = String(payload.priority || "normal").trim().toLowerCase();
  const branchPolicy = String(payload.branch_policy || payload.branchPolicy || GHOST_WEB_HELPER_DEFAULT_BRANCH_POLICY).trim();
  const approvalRequired =
    payload.approval_required === undefined && payload.approvalRequired === undefined
      ? GHOST_WEB_HELPER_DEFAULT_APPROVAL_REQUIRED
      : normalizeBoolean(payload.approval_required ?? payload.approvalRequired);
  const summary = String(payload.summary || payload.title || `${requestType.replace(/[_-]+/g, " ")} request`).trim();
  const details = String(payload.details || payload.message || "").trim();
  const pageUrl = String(payload.page_url || payload.pageUrl || "").trim();
  const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];
  const id = String(payload.id || `whr_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`).trim();

  return {
    id,
    clientId: client.id,
    webHelperId: String(payload.web_helper_id || payload.webHelperId || `${client.id}-web-helper`).trim(),
    source,
    requestType,
    title: summary,
    summary,
    details,
    pageUrl,
    priority,
    status: String(payload.status || "new").trim(),
    branchPolicy,
    approvalRequired,
    attachments,
    events: Array.isArray(payload.events)
      ? payload.events
      : [
          {
            type: "created",
            status: String(payload.status || "new").trim(),
            message: "Request captured from client dashboard.",
            at: new Date().toISOString(),
            actor: source
          }
        ],
    payload
  };
}

function dbRowToWebHelperRequest(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    clientId: row.client_id,
    webHelperId: row.web_helper_id,
    source: row.source,
    type: row.request_type,
    requestType: row.request_type,
    title: row.title || row.summary,
    summary: row.summary,
    details: row.details,
    pageUrl: row.page_url,
    priority: row.priority,
    status: row.status,
    branchPolicy: row.branch_policy,
    approvalRequired: Boolean(row.approval_required),
    attachments: parsePostgresJsonList(row.attachments),
    events: parsePostgresJsonList(row.events),
    payload: row.payload || {},
    sla: row.approval_required ? "Owner approval" : "Safe update",
    createdAt: postgresTimestampToIso(row.created_at),
    updatedAt: postgresTimestampToIso(row.updated_at)
  };
}

async function persistWebHelperRequestToPostgres(record) {
  const init = await ensureWebHelperRequestTable();
  if (!init.ok) {
    return init;
  }

  const result = await getClientStorePgPool().query(
    `
    INSERT INTO mission_web_helper_requests (
      id,
      client_id,
      web_helper_id,
      source,
      request_type,
      title,
      summary,
      details,
      page_url,
      priority,
      status,
      branch_policy,
      approval_required,
      attachments,
      events,
      payload,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14::jsonb, $15::jsonb, $16::jsonb, now(), now()
    )
    ON CONFLICT (id) DO UPDATE SET
      client_id = EXCLUDED.client_id,
      web_helper_id = EXCLUDED.web_helper_id,
      source = EXCLUDED.source,
      request_type = EXCLUDED.request_type,
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      details = EXCLUDED.details,
      page_url = EXCLUDED.page_url,
      priority = EXCLUDED.priority,
      status = EXCLUDED.status,
      branch_policy = EXCLUDED.branch_policy,
      approval_required = EXCLUDED.approval_required,
      attachments = EXCLUDED.attachments,
      events = CASE
        WHEN mission_web_helper_requests.events = '[]'::jsonb THEN EXCLUDED.events
        ELSE mission_web_helper_requests.events
      END,
      payload = EXCLUDED.payload,
      updated_at = now()
    RETURNING *;
    `,
    [
      record.id,
      record.clientId,
      record.webHelperId,
      record.source,
      record.requestType,
      record.title,
      record.summary,
      record.details,
      record.pageUrl,
      record.priority,
      record.status,
      record.branchPolicy,
      record.approvalRequired,
      JSON.stringify(record.attachments || []),
      JSON.stringify(record.events || []),
      JSON.stringify(record.payload || {})
    ]
  );

  return { ok: true, target: "postgres", table: "mission_web_helper_requests", request: dbRowToWebHelperRequest(result.rows[0]) };
}

async function readWebHelperRequestsFromPostgres(options = {}) {
  const init = await ensureWebHelperRequestTable();
  if (!init.ok) {
    return { ...init, requests: [] };
  }

  const clientIds = Array.isArray(options.clientIds) ? options.clientIds.filter(Boolean) : [];
  const limit = Math.max(1, Math.min(500, Number(options.limit || 200)));
  const result = clientIds.length
    ? await getClientStorePgPool().query(
        "SELECT * FROM mission_web_helper_requests WHERE client_id = ANY($1::text[]) ORDER BY updated_at DESC LIMIT $2",
        [clientIds, limit]
      )
    : await getClientStorePgPool().query("SELECT * FROM mission_web_helper_requests ORDER BY updated_at DESC LIMIT $1", [limit]);

  return {
    ok: true,
    target: "postgres",
    table: "mission_web_helper_requests",
    requests: result.rows.map(dbRowToWebHelperRequest).filter(Boolean)
  };
}

async function updateWebHelperRequestStatusInPostgres(id, status, options = {}) {
  const init = await ensureWebHelperRequestTable();
  if (!init.ok) {
    return init;
  }

  const normalizedId = String(id || "").trim();
  const normalizedStatus = String(status || "").trim();
  if (!normalizedId || !normalizedStatus) {
    return { ok: false, status: 400, error: "Request id and status are required." };
  }

  const event = {
    type: "status_change",
    status: normalizedStatus,
    message: String(options.message || `Ticket moved to ${normalizedStatus}.`).trim(),
    actor: String(options.actor || "mission_control").trim(),
    at: new Date().toISOString()
  };

  const result = await getClientStorePgPool().query(
    `
    UPDATE mission_web_helper_requests
    SET
      status = $2,
      events = COALESCE(events, '[]'::jsonb) || $3::jsonb,
      updated_at = now()
    WHERE id = $1
    RETURNING *;
    `,
    [normalizedId, normalizedStatus, JSON.stringify([event])]
  );

  if (!result.rows.length) {
    return { ok: false, status: 404, error: "Web Helper request was not found in the request store." };
  }

  return {
    ok: true,
    target: "postgres",
    table: "mission_web_helper_requests",
    request: dbRowToWebHelperRequest(result.rows[0])
  };
}

async function appendWebHelperRequestEventInPostgres(id, options = {}) {
  const init = await ensureWebHelperRequestTable();
  if (!init.ok) {
    return init;
  }

  const normalizedId = String(id || "").trim();
  const message = String(options.message || "").trim();
  if (!normalizedId || !message) {
    return { ok: false, status: 400, error: "Request id and message are required." };
  }

  const event = {
    type: String(options.type || "note").trim(),
    status: String(options.status || "note").trim(),
    message,
    actor: String(options.actor || "mission_control").trim(),
    at: new Date().toISOString()
  };

  const result = await getClientStorePgPool().query(
    `
    UPDATE mission_web_helper_requests
    SET
      events = COALESCE(events, '[]'::jsonb) || $2::jsonb,
      updated_at = now()
    WHERE id = $1
    RETURNING *;
    `,
    [normalizedId, JSON.stringify([event])]
  );

  if (!result.rows.length) {
    return { ok: false, status: 404, error: "Web Helper request was not found in the request store." };
  }

  return {
    ok: true,
    target: "postgres",
    table: "mission_web_helper_requests",
    request: dbRowToWebHelperRequest(result.rows[0])
  };
}

async function readWebHelperRequestByIdFromPostgres(id) {
  const init = await ensureWebHelperRequestTable();
  if (!init.ok) {
    return init;
  }

  const normalizedId = String(id || "").trim();
  if (!normalizedId) {
    return { ok: false, status: 400, error: "Request id is required." };
  }

  const result = await getClientStorePgPool().query("SELECT * FROM mission_web_helper_requests WHERE id = $1 LIMIT 1", [normalizedId]);
  if (!result.rows.length) {
    return { ok: false, status: 404, error: "Web Helper request was not found in the request store." };
  }

  return {
    ok: true,
    target: "postgres",
    table: "mission_web_helper_requests",
    request: dbRowToWebHelperRequest(result.rows[0])
  };
}

function dbRowToCodexBuildTask(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    sourceTicketId: row.source_ticket_id,
    clientId: row.client_id,
    webHelperId: row.web_helper_id,
    clientName: row.client_name,
    repo: row.repo,
    baseBranch: row.base_branch,
    targetBranch: row.target_branch,
    title: row.title,
    status: row.status,
    priority: row.priority,
    approvalRequired: Boolean(row.approval_required),
    prompt: row.prompt,
    payload: row.payload || {},
    relay: row.relay || {},
    events: parsePostgresJsonList(row.events),
    createdAt: postgresTimestampToIso(row.created_at),
    updatedAt: postgresTimestampToIso(row.updated_at)
  };
}

function normalizeCodexBranchSlug(value) {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slug || "web-helper-update";
}

function buildCodexBuildPrompt(ticket, client, options = {}) {
  const repo = normalizeGithubRepoFullName(client.repo || client.githubUrl) || String(client.repo || client.githubUrl || "").trim();
  const branchPolicy = ticket.branchPolicy || GHOST_WEB_HELPER_DEFAULT_BRANCH_POLICY;
  const targetBranch = options.targetBranch || `testing/web-helper-${normalizeCodexBranchSlug(ticket.id || ticket.title)}`;
  const page = ticket.pageUrl || "sitewide";
  const testCommand = options.testCommand || CODEX_BUILD_DEFAULT_TEST_COMMAND;

  return [
    `You are the Codex build agent for ${client.clientName}.`,
    "",
    "Goal:",
    ticket.summary || ticket.title || "Resolve the client website update request.",
    "",
    "Client request:",
    ticket.details || ticket.summary || "No expanded client details were captured. Inspect the site and make the smallest safe update.",
    "",
    "Context:",
    `- Client: ${client.clientName}`,
    `- Website: ${client.websiteUrl || client.vercelUrl || "not linked"}`,
    `- Repo: ${repo || "not linked"}`,
    `- Page or section: ${page}`,
    `- Request type: ${ticket.requestType || ticket.type || "website_update"}`,
    `- Priority: ${ticket.priority || "normal"}`,
    `- Source ticket: ${ticket.id}`,
    "",
    "Required workflow:",
    `1. Work from base branch ${options.baseBranch || CODEX_BUILD_DEFAULT_BASE_BRANCH}.`,
    `2. Create/use branch ${targetBranch}.`,
    "3. Make the smallest focused code/content change that satisfies the ticket.",
    `4. Run verification: ${testCommand}.`,
    "5. Do not merge to main and do not deploy production.",
    "6. Leave a concise owner review note with changed files, tests run, preview/deployment status, and any remaining risk.",
    "",
    "Guardrails:",
    `- Branch policy: ${branchPolicy}.`,
    `- Owner approval required before merge: ${ticket.approvalRequired ? "yes" : "yes, always for Web Helper builds"}.`,
    "- If credentials, paid services, DNS, forms, payments, or legal copy are needed, stop and request owner approval.",
    "- Keep client data isolated to this repo and this ticket."
  ].join("\n");
}

function buildCodexTaskPayload(ticket, client, options = {}) {
  const repo = normalizeGithubRepoFullName(client.repo || client.githubUrl) || String(client.repo || client.githubUrl || "").trim();
  const baseBranch = String(options.baseBranch || CODEX_BUILD_DEFAULT_BASE_BRANCH || "main").trim();
  const targetBranch = String(options.targetBranch || `testing/web-helper-${normalizeCodexBranchSlug(ticket.id || ticket.title)}`).trim();
  const prompt = buildCodexBuildPrompt(ticket, client, {
    baseBranch,
    targetBranch,
    testCommand: options.testCommand
  });

  return {
    source: "ghost_mission_control",
    taskType: "web_helper_codex_build",
    ticketId: ticket.id,
    clientId: client.id,
    clientName: client.clientName,
    webHelperId: ticket.webHelperId || `${client.id}-web-helper`,
    repo,
    websiteUrl: client.websiteUrl || "",
    baseBranch,
    targetBranch,
    branchPolicy: ticket.branchPolicy || GHOST_WEB_HELPER_DEFAULT_BRANCH_POLICY,
    approvalRequired: true,
    priority: ticket.priority || "normal",
    requestType: ticket.requestType || ticket.type || "website_update",
    pageUrl: ticket.pageUrl || "",
    summary: ticket.summary || ticket.title || "",
    details: ticket.details || "",
    testCommand: options.testCommand || CODEX_BUILD_DEFAULT_TEST_COMMAND,
    prompt
  };
}

async function relayCodexBuildTask(task) {
  if (!CODEX_BUILD_WEBHOOK_URL) {
    return {
      ok: false,
      skipped: true,
      status: "queued",
      reason: "CODEX_BUILD_WEBHOOK_URL is not configured; task is persisted for manual/runner pickup."
    };
  }

  const headers = {
    "Content-Type": "application/json"
  };
  if (CODEX_BUILD_WEBHOOK_SECRET) {
    headers["X-Codex-Build-Secret"] = CODEX_BUILD_WEBHOOK_SECRET;
  }

  try {
    const response = await fetch(CODEX_BUILD_WEBHOOK_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(task.payload)
    });
    const body = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      body: body.slice(0, 2000)
    };
  } catch (error) {
    return {
      ok: false,
      status: "network_error",
      error: String(error?.message || error)
    };
  }
}

async function persistCodexBuildTask(task) {
  const init = await ensureCodexBuildTaskTable();
  if (!init.ok) {
    return init;
  }

  const result = await getClientStorePgPool().query(
    `
    INSERT INTO mission_codex_build_tasks (
      id,
      source_ticket_id,
      client_id,
      web_helper_id,
      client_name,
      repo,
      base_branch,
      target_branch,
      title,
      status,
      priority,
      approval_required,
      prompt,
      payload,
      relay,
      events,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14::jsonb, $15::jsonb, $16::jsonb, now(), now()
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      relay = EXCLUDED.relay,
      events = mission_codex_build_tasks.events || EXCLUDED.events,
      updated_at = now()
    RETURNING *;
    `,
    [
      task.id,
      task.sourceTicketId,
      task.clientId,
      task.webHelperId,
      task.clientName,
      task.repo,
      task.baseBranch,
      task.targetBranch,
      task.title,
      task.status,
      task.priority,
      task.approvalRequired,
      task.prompt,
      JSON.stringify(task.payload || {}),
      JSON.stringify(task.relay || {}),
      JSON.stringify(task.events || [])
    ]
  );

  return { ok: true, target: "postgres", table: "mission_codex_build_tasks", task: dbRowToCodexBuildTask(result.rows[0]) };
}

async function createCodexBuildTaskFromWebHelperRequest(ticketId, options = {}) {
  const ticketResult = await readWebHelperRequestByIdFromPostgres(ticketId);
  if (!ticketResult.ok) {
    return ticketResult;
  }

  const ticket = ticketResult.request;
  const client = getAllClients().find((entry) => entry.id === ticket.clientId) || findClientForWebHelperTarget(ticket.clientId);
  if (!client) {
    return { ok: false, status: 404, error: "Unable to match Web Helper request to a Mission Control client." };
  }

  const payload = buildCodexTaskPayload(ticket, client, options);
  const taskId = `codex_${ticket.id}`;
  payload.taskId = taskId;
  payload.resultCallbackUrl = buildMissionControlUrl("/mission/codex-build-tasks/result");
  const queuedEvent = {
    type: "codex_build_queued",
    status: "codex_queued",
    actor: "mission_control",
    message: `Codex build task queued for ${payload.repo || client.clientName} on ${payload.targetBranch}.`,
    at: new Date().toISOString()
  };
  const task = {
    id: taskId,
    sourceTicketId: ticket.id,
    clientId: client.id,
    webHelperId: payload.webHelperId,
    clientName: client.clientName,
    repo: payload.repo,
    baseBranch: payload.baseBranch,
    targetBranch: payload.targetBranch,
    title: ticket.title || ticket.summary || "Web Helper Codex build",
    status: "queued",
    priority: payload.priority,
    approvalRequired: true,
    prompt: payload.prompt,
    payload,
    relay: {},
    events: [queuedEvent]
  };

  const queued = await persistCodexBuildTask(task);
  if (!queued.ok) {
    return queued;
  }

  const relay = await relayCodexBuildTask(task);
  task.relay = relay;
  task.status = relay.ok ? "sent_to_runner" : "queued";
  task.events.push({
    type: relay.ok ? "codex_build_relay_sent" : "codex_build_relay_pending",
    status: task.status,
    actor: "mission_control",
    message: relay.ok
      ? "Codex build payload sent to the configured runner webhook."
      : relay.reason || relay.error || `Codex runner did not accept the handoff (${relay.status || "unknown"}).`,
    at: new Date().toISOString()
  });

  const stored = await persistCodexBuildTask(task);
  if (!stored.ok) {
    return stored;
  }

  const ticketStatus = relay.ok ? "sent_to_runner" : "codex_queued";
  const updatedTicket = await updateWebHelperRequestStatusInPostgres(ticket.id, ticketStatus, {
    actor: "mission_control",
    message: relay.ok
      ? `${stored.task.id} sent to Codex runner. Branch ${stored.task.targetBranch}. Owner approval still required before merge.`
      : `${stored.task.id} created. Branch ${stored.task.targetBranch}. Waiting for Codex runner pickup; owner approval still required before merge.`
  });

  return {
    ok: true,
    task: stored.task,
    ticket: updatedTicket.ok ? updatedTicket.request : ticket,
    relay
  };
}

function assessWebHelperRequest(ticket, client = {}) {
  const text = `${ticket.title || ""} ${ticket.summary || ""} ${ticket.details || ""} ${ticket.pageUrl || ""}`.toLowerCase();
  const urgentTerms = ["urgent", "down", "offline", "broken", "error", "payment", "checkout", "form", "lead", "security"];
  const complexTerms = ["new page", "redesign", "integration", "api", "database", "payment", "checkout", "auth", "login", "dns"];
  const simpleTerms = ["text", "copy", "typo", "image", "photo", "hours", "phone", "email", "link"];
  const missingDetails = !String(ticket.details || ticket.summary || "").trim() || String(ticket.details || ticket.summary || "").trim().length < 12;
  const priority = urgentTerms.some((term) => text.includes(term)) ? "high" : ticket.priority || "normal";
  const complexity = complexTerms.some((term) => text.includes(term))
    ? "complex"
    : simpleTerms.some((term) => text.includes(term))
      ? "simple"
      : "standard";
  const risk = complexity === "complex" || text.includes("dns") || text.includes("payment") || text.includes("form")
    ? "owner_review"
    : "normal";

  return {
    priority,
    complexity,
    risk,
    missingDetails,
    route: missingDetails ? "blocked" : "codex_build",
    recommendedStatus: missingDetails ? "blocked" : "triage",
    summary: missingDetails
      ? "Ticket needs more detail before Codex build handoff."
      : `Ticket assessed as ${complexity} complexity / ${priority} priority for ${client.clientName || ticket.clientName || "client"}.`
  };
}

async function runWebHelperAutomationForTicket(ticket, options = {}) {
  if (!WEB_HELPER_AUTOMATION_ENABLED || !ticket?.id) {
    return { ok: true, skipped: true, reason: "Web Helper automation is disabled or ticket is missing." };
  }

  const client = getAllClients().find((entry) => entry.id === ticket.clientId) || findClientForWebHelperTarget(ticket.clientId);
  const assessment = assessWebHelperRequest(ticket, client || {});
  const assessmentEvent = await appendWebHelperRequestEventInPostgres(ticket.id, {
    type: "automation_assessment",
    status: "triage",
    actor: "web_helper_agent",
    message: `${assessment.summary} Route: ${assessment.route}. Risk: ${assessment.risk}.`
  });
  if (!assessmentEvent.ok) {
    return assessmentEvent;
  }

  if (assessment.missingDetails) {
    const blocked = await updateWebHelperRequestStatusInPostgres(ticket.id, "blocked", {
      actor: "web_helper_agent",
      message: "Automation paused because the request needs more details before a safe Codex handoff."
    });
    return { ok: blocked.ok, assessment, ticket: blocked.request || ticket, codex: null };
  }

  const triaged = await updateWebHelperRequestStatusInPostgres(ticket.id, "triage", {
    actor: "web_helper_agent",
    message: "Automation completed intake assessment and is preparing the Codex build prompt."
  });
  if (!triaged.ok) {
    return triaged;
  }

  if (options.skipCodexBuild) {
    return { ok: true, assessment, ticket: triaged.request, codex: null };
  }

  const codex = await createCodexBuildTaskFromWebHelperRequest(ticket.id);
  return { ok: codex.ok, assessment, ticket: codex.ticket || triaged.request, codex };
}

async function updateCodexBuildTaskStatus(taskId, status, event = {}) {
  const init = await ensureCodexBuildTaskTable();
  if (!init.ok) {
    return init;
  }

  const normalizedId = String(taskId || "").trim();
  const normalizedStatus = String(status || "").trim();
  if (!normalizedId || !normalizedStatus) {
    return { ok: false, status: 400, error: "Task id and status are required." };
  }

  const taskEvent = {
    type: String(event.type || "codex_task_update").trim(),
    status: normalizedStatus,
    actor: String(event.actor || "codex_runner").trim(),
    message: String(event.message || `Codex build task moved to ${normalizedStatus}.`).trim(),
    at: new Date().toISOString(),
    data: event.data || {}
  };

  const result = await getClientStorePgPool().query(
    `
    UPDATE mission_codex_build_tasks
    SET
      status = $2,
      relay = COALESCE(relay, '{}'::jsonb) || $3::jsonb,
      events = COALESCE(events, '[]'::jsonb) || $4::jsonb,
      updated_at = now()
    WHERE id = $1
    RETURNING *;
    `,
    [normalizedId, normalizedStatus, JSON.stringify(event.data || {}), JSON.stringify([taskEvent])]
  );

  if (!result.rows.length) {
    return { ok: false, status: 404, error: "Codex build task was not found." };
  }

  return {
    ok: true,
    target: "postgres",
    table: "mission_codex_build_tasks",
    task: dbRowToCodexBuildTask(result.rows[0])
  };
}

async function findCodexBuildTaskForTicket(ticketId) {
  const init = await ensureCodexBuildTaskTable();
  if (!init.ok) {
    return init;
  }

  const normalizedTicketId = String(ticketId || "").trim();
  if (!normalizedTicketId) {
    return { ok: false, status: 400, error: "Ticket id is required." };
  }

  const result = await getClientStorePgPool().query(
    "SELECT * FROM mission_codex_build_tasks WHERE source_ticket_id = $1 ORDER BY updated_at DESC LIMIT 1",
    [normalizedTicketId]
  );
  if (!result.rows.length) {
    return { ok: false, status: 404, error: "No Codex build task is linked to this ticket." };
  }

  return { ok: true, task: dbRowToCodexBuildTask(result.rows[0]) };
}

function buildMissionControlUrl(pathname) {
  const base = GHOST_MISSION_CONTROL_PUBLIC_URL
    ? (GHOST_MISSION_CONTROL_PUBLIC_URL.startsWith("http") ? GHOST_MISSION_CONTROL_PUBLIC_URL : `https://${GHOST_MISSION_CONTROL_PUBLIC_URL}`)
    : "";
  if (!base) {
    return "";
  }

  const normalizedPath = String(pathname || "");
  return `${base.replace(/\/+$/, "")}${normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`}`;
}

function buildClientConfirmationUrl(ticketId, taskId) {
  const base = buildMissionControlUrl("");
  if (!base) {
    return "";
  }

  const token = buildClientConfirmationToken(ticketId, taskId);
  return `${base.replace(/\/+$/, "")}/mission/web-helper-requests/client-confirm?ticketId=${encodeURIComponent(ticketId)}&taskId=${encodeURIComponent(taskId)}&token=${encodeURIComponent(token)}`;
}

function buildClientConfirmationToken(ticketId, taskId) {
  return crypto
    .createHash("sha256")
    .update(`${ticketId}:${taskId}:${CODEX_BUILD_WEBHOOK_SECRET || GHOST_WEB_HELPER_WEBHOOK_SECRET}`)
    .digest("hex")
    .slice(0, 32);
}

async function notifyClientUpdateReady(ticket, task, options = {}) {
  const client = getAllClients().find((entry) => entry.id === ticket.clientId) || {};
  const confirmationUrl = buildClientConfirmationUrl(ticket.id, task.id);
  const payload = {
    source: "ghost_mission_control",
    type: "web_helper_update_ready",
    clientId: ticket.clientId,
    clientName: client.clientName || ticket.clientName || "",
    to: client.businessEmail || options.email || "",
    ticketId: ticket.id,
    taskId: task.id,
    summary: ticket.summary || ticket.title || "Website update completed",
    pageUrl: ticket.pageUrl || "",
    branch: task.targetBranch || "",
    repo: task.repo || "",
    confirmationUrl,
    message: "The requested website update has been merged and is ready for client review."
  };

  if (!CLIENT_UPDATE_EMAIL_WEBHOOK_URL) {
    return { ok: false, skipped: true, reason: "CLIENT_UPDATE_EMAIL_WEBHOOK_URL is not configured.", payload };
  }

  const headers = { "Content-Type": "application/json" };
  if (CLIENT_UPDATE_EMAIL_WEBHOOK_SECRET) {
    headers["X-Client-Update-Email-Secret"] = CLIENT_UPDATE_EMAIL_WEBHOOK_SECRET;
  }

  try {
    const response = await fetch(CLIENT_UPDATE_EMAIL_WEBHOOK_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    const body = await response.text();
    return { ok: response.ok, status: response.status, body: body.slice(0, 2000), payload };
  } catch (error) {
    return { ok: false, status: "network_error", error: String(error?.message || error), payload };
  }
}

async function processCodexRunnerResult(payload = {}) {
  const ticketId = String(payload.ticketId || payload.ticket_id || payload.sourceTicketId || "").trim();
  const taskId = String(payload.taskId || payload.task_id || (ticketId ? `codex_${ticketId}` : "")).trim();
  const resultStatus = String(payload.status || payload.result || "").trim().toLowerCase();
  if (!ticketId || !taskId) {
    return { ok: false, status: 400, error: "ticketId and taskId are required." };
  }

  const mergedStatuses = ["merged", "merge_complete", "merge-complete", "deployed", "sent_to_client", "client_review"];
  if (mergedStatuses.includes(resultStatus)) {
    return markWebHelperMergeComplete(ticketId, taskId, {
      actor: "codex_runner",
      message: payload.message || "Codex runner merged the testing branch and prepared client review.",
      branch: payload.branch || payload.targetBranch || "",
      commitSha: payload.commitSha || payload.commit_sha || "",
      previewUrl: payload.previewUrl || payload.preview_url || "",
      productionUrl: payload.productionUrl || payload.production_url || ""
    });
  }

  const readyStatuses = ["ready_review", "ready-for-review", "success", "completed", "tests_passed"];
  const blockedStatuses = ["blocked", "failed", "error", "needs_info"];
  const nextTicketStatus = readyStatuses.includes(resultStatus)
    ? "ready_review"
    : blockedStatuses.includes(resultStatus)
      ? "blocked"
      : "in_progress";
  const nextTaskStatus = nextTicketStatus === "ready_review" ? "ready_for_owner_review" : nextTicketStatus;
  const taskUpdate = await updateCodexBuildTaskStatus(taskId, nextTaskStatus, {
    type: "codex_runner_result",
    actor: "codex_runner",
    message: payload.message || (nextTicketStatus === "ready_review" ? "Codex runner completed work and tests; owner review is ready." : "Codex runner updated task status."),
    data: {
      branch: payload.branch || payload.targetBranch || "",
      commitSha: payload.commitSha || payload.commit_sha || "",
      previewUrl: payload.previewUrl || payload.preview_url || "",
      tests: payload.tests || payload.testResults || ""
    }
  });
  if (!taskUpdate.ok) {
    return taskUpdate;
  }

  const ticketUpdate = await updateWebHelperRequestStatusInPostgres(ticketId, nextTicketStatus, {
    actor: "codex_runner",
    message: payload.message || (nextTicketStatus === "ready_review" ? "Codex build completed on testing branch and is ready for owner review." : "Codex runner reported the ticket needs attention.")
  });

  return { ok: ticketUpdate.ok, task: taskUpdate.task, ticket: ticketUpdate.request, status: nextTicketStatus };
}

async function requestCodexRedo(ticketId, instructions = "") {
  const linkedTask = await findCodexBuildTaskForTicket(ticketId);
  if (!linkedTask.ok) {
    return linkedTask;
  }

  const task = linkedTask.task;
  const redoEvent = await appendWebHelperRequestEventInPostgres(ticketId, {
    type: "redo_requested",
    status: "in_progress",
    actor: "mission_control",
    message: instructions ? `Owner requested Codex redo: ${instructions}` : "Owner requested Codex redo."
  });
  if (!redoEvent.ok) {
    return redoEvent;
  }

  const payload = {
    ...task.payload,
    taskType: "web_helper_codex_redo",
    taskId: task.id,
    ticketId,
    redoInstructions: instructions,
    prompt: `${task.prompt}\n\nOwner redo instructions:\n${instructions || "Revise the prepared fix based on owner feedback and run verification again."}`
  };
  const relay = await relayCodexBuildTask({ ...task, payload });
  await updateCodexBuildTaskStatus(task.id, relay.ok ? "redo_sent_to_runner" : "redo_queued", {
    type: "codex_redo_requested",
    actor: "mission_control",
    message: relay.ok ? "Redo instructions sent to Codex runner." : "Redo instructions queued for Codex runner pickup.",
    data: { relay }
  });
  const ticketUpdate = await updateWebHelperRequestStatusInPostgres(ticketId, "in_progress", {
    actor: "mission_control",
    message: relay.ok ? "Redo sent to Codex runner." : "Redo queued for Codex runner pickup."
  });
  return { ok: true, relay, ticket: ticketUpdate.request, task };
}

async function approveCodexMerge(ticketId) {
  const linkedTask = await findCodexBuildTaskForTicket(ticketId);
  if (!linkedTask.ok) {
    return linkedTask;
  }

  const task = linkedTask.task;
  await updateWebHelperRequestStatusInPostgres(ticketId, "approved_to_merge", {
    actor: "mission_control",
    message: "Owner approved the prepared testing-branch fix for merge."
  });
  await updateCodexBuildTaskStatus(task.id, "merge_approved", {
    type: "owner_merge_approval",
    actor: "mission_control",
    message: "Owner approved merge to main.",
    data: { targetBranch: task.targetBranch, baseBranch: task.baseBranch }
  });

  const relayPayload = {
    ...task.payload,
    taskType: "web_helper_codex_merge",
    taskId: task.id,
    ticketId,
    mergeApproved: true
  };
  const relay = await relayCodexBuildTask({ ...task, payload: relayPayload });
  await updateCodexBuildTaskStatus(task.id, relay.ok ? "merge_sent_to_runner" : "merge_queued", {
    type: "merge_handoff",
    actor: "mission_control",
    message: relay.ok ? "Merge request sent to Codex runner." : "Merge approval queued for Codex runner pickup.",
    data: { relay }
  });

  return { ok: true, task, relay };
}

async function markWebHelperMergeComplete(ticketId, taskId, options = {}) {
  const ticketResult = await readWebHelperRequestByIdFromPostgres(ticketId);
  if (!ticketResult.ok) {
    return ticketResult;
  }
  const taskResult = await findCodexBuildTaskForTicket(ticketId);
  const task = taskResult.task || { id: taskId || `codex_${ticketId}` };
  await updateCodexBuildTaskStatus(task.id, "merged", {
    type: "merge_complete",
    actor: options.actor || "codex_runner",
    message: options.message || "Testing branch merged into main.",
    data: options
  });
  const ticketUpdate = await updateWebHelperRequestStatusInPostgres(ticketId, "approved_to_merge", {
    actor: options.actor || "codex_runner",
    message: "Merge completed. Waiting for client confirmation."
  });
  const email = await notifyClientUpdateReady(ticketUpdate.request || ticketResult.request, task, options);
  await appendWebHelperRequestEventInPostgres(ticketId, {
    type: email.ok ? "client_email_sent" : "client_email_queued",
    status: "client_review",
    actor: "mission_control",
    message: email.ok ? "Client update confirmation email sent." : `Client email not sent automatically: ${email.reason || email.error || "email webhook unavailable"}.`
  });

  return { ok: true, ticket: ticketUpdate.request, task, email };
}

function parsePostgresJsonList(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function postgresTimestampToIso(value) {
  if (!value) {
    return new Date().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function dbRowToClient(row) {
  if (!row) {
    return null;
  }

  return normalizeClient({
    id: row.id,
    clientName: row.client_name,
    stage: row.stage,
    websiteUrl: row.website_url,
    repo: row.repo,
    railwayUrl: row.railway_url,
    vercelUrl: row.vercel_url,
    mobileAppUrl: row.mobile_app_url,
    googleBusinessUrl: row.google_business_url,
    analyticsUrl: row.analytics_url,
    adsStatus: row.ads_status,
    socialUrls: parsePostgresJsonList(row.social_urls),
    services: parsePostgresJsonList(row.services),
    plannedServices: parsePostgresJsonList(row.planned_services),
    finalDomainPurchased: row.final_domain_purchased,
    clientDetailsPending: row.client_details_pending,
    leadSource: row.lead_source,
    leadSourceDetail: row.lead_source_detail,
    leadStage: row.lead_stage,
    relationshipType: row.relationship_type,
    pricingTier: row.pricing_tier,
    proposalSent: row.proposal_sent,
    depositInvoiceSent: row.deposit_invoice_sent,
    proposalSigned: row.proposal_signed,
    partnershipSigned: row.partnership_signed,
    depositPaid: row.deposit_paid,
    finalPaymentPaid: row.final_payment_paid,
    businessEmail: row.business_email,
    businessPhone: row.business_phone,
    plan: row.plan,
    contact: row.contact,
    notes: row.notes,
    source: "runtime",
    createdAt: postgresTimestampToIso(row.created_at),
    updatedAt: postgresTimestampToIso(row.updated_at)
  });
}

function clientToPostgresValues(client) {
  const normalized = normalizeClient({
    ...client,
    source: "runtime"
  });

  if (!normalized) {
    return null;
  }

  return [
    normalized.id,
    normalized.clientName,
    normalized.stage,
    normalized.websiteUrl,
    normalized.repo,
    normalized.githubUrl,
    normalized.railwayUrl,
    normalized.vercelUrl,
    normalized.mobileAppUrl,
    normalized.googleBusinessUrl,
    normalized.analyticsUrl,
    normalized.adsStatus,
    JSON.stringify(normalized.socialUrls || []),
    JSON.stringify(normalized.services || []),
    JSON.stringify(normalized.plannedServices || []),
    normalized.finalDomainPurchased,
    Boolean(normalized.clientDetailsPending),
    normalized.leadSource,
    normalized.leadSourceDetail,
    normalized.leadStage,
    normalized.relationshipType,
    normalized.pricingTier,
    Boolean(normalized.proposalSent),
    Boolean(normalized.depositInvoiceSent),
    Boolean(normalized.proposalSigned),
    Boolean(normalized.partnershipSigned),
    Boolean(normalized.depositPaid),
    Boolean(normalized.finalPaymentPaid),
    normalized.businessEmail,
    normalized.businessPhone,
    normalized.plan,
    normalized.contact,
    normalized.notes,
    "runtime",
    normalized.createdAt,
    normalized.updatedAt
  ];
}

async function persistRuntimeClientToPostgres(client, options = {}) {
  const init = await ensureClientStoreTable();
  if (!init.ok) {
    return init;
  }

  const values = clientToPostgresValues(client);
  if (!values) {
    return { ok: false, target: "postgres", error: "Client name is required." };
  }

  try {
    const result = await getClientStorePgPool().query(
      `
      INSERT INTO mission_clients (
        id,
        client_name,
        stage,
        website_url,
        repo,
        github_url,
        railway_url,
        vercel_url,
        mobile_app_url,
        google_business_url,
        analytics_url,
        ads_status,
        social_urls,
        services,
        planned_services,
        final_domain_purchased,
        client_details_pending,
        lead_source,
        lead_source_detail,
        lead_stage,
        relationship_type,
        pricing_tier,
        proposal_sent,
        deposit_invoice_sent,
        proposal_signed,
        partnership_signed,
        deposit_paid,
        final_payment_paid,
        business_email,
        business_phone,
        plan,
        contact,
        notes,
        source,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13::jsonb, $14::jsonb, $15::jsonb, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35::timestamptz, $36::timestamptz
      )
      ON CONFLICT (id) DO UPDATE SET
        client_name = EXCLUDED.client_name,
        stage = EXCLUDED.stage,
        website_url = EXCLUDED.website_url,
        repo = EXCLUDED.repo,
        github_url = EXCLUDED.github_url,
        railway_url = EXCLUDED.railway_url,
        vercel_url = EXCLUDED.vercel_url,
        mobile_app_url = EXCLUDED.mobile_app_url,
        google_business_url = EXCLUDED.google_business_url,
        analytics_url = EXCLUDED.analytics_url,
        ads_status = EXCLUDED.ads_status,
        social_urls = EXCLUDED.social_urls,
        services = EXCLUDED.services,
        planned_services = EXCLUDED.planned_services,
        final_domain_purchased = EXCLUDED.final_domain_purchased,
        client_details_pending = EXCLUDED.client_details_pending,
        lead_source = EXCLUDED.lead_source,
        lead_source_detail = EXCLUDED.lead_source_detail,
        lead_stage = EXCLUDED.lead_stage,
        relationship_type = EXCLUDED.relationship_type,
        pricing_tier = EXCLUDED.pricing_tier,
        proposal_sent = EXCLUDED.proposal_sent,
        deposit_invoice_sent = EXCLUDED.deposit_invoice_sent,
        proposal_signed = EXCLUDED.proposal_signed,
        partnership_signed = EXCLUDED.partnership_signed,
        deposit_paid = EXCLUDED.deposit_paid,
        final_payment_paid = EXCLUDED.final_payment_paid,
        business_email = EXCLUDED.business_email,
        business_phone = EXCLUDED.business_phone,
        plan = EXCLUDED.plan,
        contact = EXCLUDED.contact,
        notes = EXCLUDED.notes,
        source = EXCLUDED.source,
        created_at = COALESCE(mission_clients.created_at, EXCLUDED.created_at),
        updated_at = EXCLUDED.updated_at
      RETURNING *;
      `,
      values
    );
    runtimeClientsDbAvailable = true;
    runtimeClientsDbLastError = "";
    runtimeClientsDbLastPersistAt = Date.now();
    const savedClient = dbRowToClient(result.rows[0]);
    if (savedClient && options.updateMemory !== false) {
      upsertRuntimeClient(savedClient);
    }
    if (options.persistLocal !== false) {
      persistRuntimeClients();
    }
    return { ok: true, target: "postgres", table: "mission_clients", clientId: savedClient?.id || values[0] };
  } catch (error) {
    runtimeClientsDbAvailable = false;
    runtimeClientsDbLastError = String(error?.message || error);
    return { ok: false, target: "postgres", error: runtimeClientsDbLastError };
  }
}

async function persistRuntimeClientsToPostgres() {
  const init = await ensureClientStoreTable();
  if (!init.ok) {
    return init;
  }

  let count = 0;
  for (const client of [...runtimeClients]) {
    const result = await persistRuntimeClientToPostgres(client, {
      updateMemory: false,
      persistLocal: false
    });
    if (!result.ok) {
      return result;
    }
    count += 1;
  }

  runtimeClientsDbAvailable = true;
  runtimeClientsDbLastError = "";
  runtimeClientsDbLastPersistAt = Date.now();
  return { ok: true, target: "postgres", table: "mission_clients", count };
}

async function deleteRuntimeClientFromPostgres(clientId) {
  const init = await ensureClientStoreTable();
  if (!init.ok) {
    return init;
  }

  const normalizedId = canonicalClientId(clientId);
  if (!normalizedId) {
    return { ok: false, target: "postgres", status: 400, error: "Client id is required." };
  }

  const result = await getClientStorePgPool().query("DELETE FROM mission_clients WHERE id = $1 RETURNING id", [normalizedId]);
  runtimeClientsDbAvailable = true;
  runtimeClientsDbLastError = "";
  runtimeClientsDbLastPersistAt = Date.now();
  return { ok: true, target: "postgres", table: "mission_clients", deleted: result.rowCount };
}

function removeRuntimeClient(clientId) {
  const normalizedId = canonicalClientId(clientId);
  const before = runtimeClients.length;
  for (let index = runtimeClients.length - 1; index >= 0; index -= 1) {
    if (canonicalClientId(runtimeClients[index]?.id) === normalizedId) {
      runtimeClients.splice(index, 1);
    }
  }
  persistRuntimeClients();
  return before - runtimeClients.length;
}

function buildClientResponsePayload(storageWrite, status = 200, extra = {}) {
  const clients = getAllClients();
  return {
    ...extra,
    summary: summarizeClients(clients),
    pipelineStages: CLIENT_PIPELINE_STAGES,
    dataHealth: getClientDataHealth(clients),
    storage: getClientStorageStatus(storageWrite),
    clients: clients.map((entry) => ({
      ...entry,
      actions: getClientDerivedActions(entry)
    }))
  };
}

async function persistClientMutationFallback(databaseWrite) {
  if (databaseWrite.ok) {
    return databaseWrite;
  }

  try {
    const repoWrite = await persistRuntimeClientsToGitHubStore();
    return { ...repoWrite, fallbackFrom: databaseWrite };
  } catch (error) {
    runtimeClientsRepoLastError = String(error?.message || error);
    return {
      ok: false,
      target: "client-store",
      error: runtimeClientsRepoLastError,
      fallbackFrom: databaseWrite,
      fallbackWrite: { ok: false, target: "github", error: runtimeClientsRepoLastError }
    };
  }
}

async function loadRuntimeClientsFromPostgres() {
  hydrateRuntimeClients();

  const init = await ensureClientStoreTable();
  if (!init.ok) {
    return init;
  }

  try {
    const result = await getClientStorePgPool().query("SELECT * FROM mission_clients ORDER BY updated_at DESC, client_name ASC");
    const clients = result.rows.map(dbRowToClient).filter(Boolean);
    clients.forEach(upsertRuntimeClient);
    runtimeClientsDbSyncedAt = Date.now();
    runtimeClientsDbAvailable = true;
    runtimeClientsDbLastError = "";
    persistRuntimeClients();

    if (!clients.length && runtimeClients.length) {
      const seedWrite = await persistRuntimeClientsToPostgres();
      return {
        ok: true,
        target: "postgres",
        table: "mission_clients",
        clients: runtimeClients,
        count: runtimeClients.length,
        seeded: seedWrite.ok ? seedWrite.count || runtimeClients.length : 0
      };
    }

    return { ok: true, target: "postgres", table: "mission_clients", clients, count: clients.length };
  } catch (error) {
    runtimeClientsDbAvailable = false;
    runtimeClientsDbLastError = String(error?.message || error);
    return { ok: false, target: "postgres", error: runtimeClientsDbLastError };
  }
}

async function syncClientStore(forceRefresh = false) {
  hydrateRuntimeClients();
  const databaseRead = await loadRuntimeClientsFromPostgres();
  if (databaseRead.ok) {
    return {
      ok: true,
      target: "client-store",
      database: databaseRead,
      repo: { ok: false, skipped: true, reason: "Postgres client store is active." }
    };
  }

  const repoRead = await syncRuntimeClientsFromGitHubStore(forceRefresh);
  return {
    ok: Boolean(repoRead?.ok),
    target: "client-store",
    database: databaseRead,
    repo: repoRead,
    fallback: true
  };
}

function encodeGitHubPath(filePath) {
  return String(filePath || "")
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function decodeGitHubContent(content) {
  return Buffer.from(String(content || "").replace(/\n/g, ""), "base64").toString("utf8");
}

async function fetchClientStoreFromGitHub() {
  if (!CLIENT_STORE_GITHUB_SYNC || !CLIENT_STORE_REPO || !CLIENT_STORE_FILE) {
    return { ok: false, target: "github", skipped: true, reason: "GitHub client store is disabled." };
  }

  const [owner, repo] = CLIENT_STORE_REPO.split("/");
  if (!owner || !repo) {
    return { ok: false, target: "github", skipped: true, reason: "CLIENT_STORE_REPO must be owner/repo." };
  }

  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeGitHubPath(CLIENT_STORE_FILE)}?ref=${encodeURIComponent(CLIENT_STORE_BRANCH)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getGitHubApiHeaders("client-store")
  });

  if (response.status === 404) {
    return { ok: true, target: "github", clients: [], missing: true };
  }

  if (!response.ok) {
    throw new Error(`GitHub client store read failed (${response.status})`);
  }

  const payload = await response.json();
  const clients = parseClientStorePayload(decodeGitHubContent(payload.content));
  clients.forEach(upsertRuntimeClient);
  return {
    ok: true,
    target: "github",
    clients,
    sha: payload.sha || "",
    path: payload.path || CLIENT_STORE_FILE
  };
}

async function syncRuntimeClientsFromGitHubStore(forceRefresh = false) {
  hydrateRuntimeClients();

  if (!CLIENT_STORE_GITHUB_SYNC) {
    return { ok: false, target: "github", skipped: true, reason: "GitHub client store is disabled." };
  }

  const now = Date.now();
  if (!forceRefresh && runtimeClientsRepoSyncedAt && now - runtimeClientsRepoSyncedAt < CLIENT_STORE_CACHE_TTL_MS) {
    return { ok: true, target: "github", cached: true };
  }

  if (runtimeClientsRepoSyncPending) {
    return runtimeClientsRepoSyncPending;
  }

  runtimeClientsRepoSyncPending = fetchClientStoreFromGitHub()
    .then((result) => {
      runtimeClientsRepoSyncedAt = Date.now();
      runtimeClientsRepoLastError = "";
      persistRuntimeClients();
      return result;
    })
    .catch((error) => {
      runtimeClientsRepoLastError = String(error?.message || error);
      return { ok: false, target: "github", error: runtimeClientsRepoLastError };
    })
    .finally(() => {
      runtimeClientsRepoSyncPending = null;
    });

  return runtimeClientsRepoSyncPending;
}

async function persistRuntimeClientsToGitHubStore() {
  if (!CLIENT_STORE_GITHUB_SYNC) {
    return { ok: false, target: "github", skipped: true, reason: "GitHub client store is disabled." };
  }

  if (!GITHUB_TOKEN) {
    return { ok: false, target: "github", skipped: true, reason: "GITHUB_TOKEN is required to write the Mission Control client store." };
  }

  const [owner, repo] = CLIENT_STORE_REPO.split("/");
  if (!owner || !repo) {
    return { ok: false, target: "github", skipped: true, reason: "CLIENT_STORE_REPO must be owner/repo." };
  }

  const encodedPath = encodeGitHubPath(CLIENT_STORE_FILE);
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}`;
  let sha = "";

  const existingResponse = await fetch(`${url}?ref=${encodeURIComponent(CLIENT_STORE_BRANCH)}`, {
    method: "GET",
    headers: getGitHubApiHeaders("client-store")
  });

  if (existingResponse.ok) {
    const existingPayload = await existingResponse.json();
    sha = existingPayload.sha || "";
  } else if (existingResponse.status !== 404) {
    throw new Error(`GitHub client store lookup failed (${existingResponse.status})`);
  }

  const content = JSON.stringify(getClientStorePayload(), null, 2);
  const writeResponse = await fetch(url, {
    method: "PUT",
    headers: {
      ...getGitHubApiHeaders("client-store"),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Update Mission Control client store",
      content: Buffer.from(content, "utf8").toString("base64"),
      branch: CLIENT_STORE_BRANCH,
      ...(sha ? { sha } : {})
    })
  });

  if (!writeResponse.ok) {
    throw new Error(`GitHub client store write failed (${writeResponse.status})`);
  }

  runtimeClientsRepoLastPersistAt = Date.now();
  runtimeClientsRepoSyncedAt = Date.now();
  runtimeClientsRepoLastError = "";
  return { ok: true, target: "github", path: CLIENT_STORE_FILE, repo: CLIENT_STORE_REPO };
}

function getClientStorageStatus(lastWrite = null) {
  const databaseWrite =
    lastWrite?.target === "postgres"
      ? lastWrite
      : lastWrite?.fallbackFrom?.target === "postgres"
        ? lastWrite.fallbackFrom
        : null;
  const repoWrite =
    lastWrite?.target === "github"
      ? lastWrite
      : lastWrite?.fallbackWrite?.target === "github"
        ? lastWrite.fallbackWrite
        : null;

  return {
    lastWrite,
    runtimeCachePath: RUNTIME_CLIENTS_PATH,
    database: {
      enabled: CLIENT_STORE_POSTGRES_ENABLED,
      urlConfigured: Boolean(DATABASE_URL),
      active: isClientStoreDatabaseEnabled(),
      available: runtimeClientsDbAvailable,
      table: "mission_clients",
      lastSyncedAt: toIsoOrNull(runtimeClientsDbSyncedAt),
      lastPersistedAt: toIsoOrNull(runtimeClientsDbLastPersistAt),
      lastError: runtimeClientsDbLastError || null,
      lastWrite: databaseWrite
    },
    repoStore: {
      enabled: CLIENT_STORE_GITHUB_SYNC,
      repo: CLIENT_STORE_REPO,
      file: CLIENT_STORE_FILE,
      branch: CLIENT_STORE_BRANCH,
      tokenConfigured: Boolean(GITHUB_TOKEN),
      lastSyncedAt: toIsoOrNull(runtimeClientsRepoSyncedAt),
      lastPersistedAt: toIsoOrNull(runtimeClientsRepoLastPersistAt),
      lastError: runtimeClientsRepoLastError || null,
      lastWrite: repoWrite
    }
  };
}

function normalizeGithubRepoFullName(value) {
  const trimmed = String(value || "").trim().replace(/\.git$/, "");
  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (parsed.hostname.toLowerCase() === "github.com") {
      const [owner, repo] = parsed.pathname.replace(/^\/+/, "").split("/");
      return owner && repo ? `${owner}/${repo.replace(/\.git$/, "")}` : "";
    }
  } catch {
    // Fall through to owner/repo or repo-name handling.
  }

  if (/^[\w.-]+\/[\w.-]+$/.test(trimmed)) {
    return trimmed;
  }

  if (/^[\w.-]+$/.test(trimmed)) {
    return `${GITHUB_OWNER}/${trimmed}`;
  }

  return "";
}

function getGitHubApiHeaders(purpose = "web-helper") {
  const headers = {
    "User-Agent": `GhostMissionControl/1.0 (+${purpose})`,
    Accept: "application/vnd.github+json"
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchGitHubApiJson(apiUrl, purpose = "web-helper") {
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: getGitHubApiHeaders(purpose)
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed (${response.status})`);
  }

  return response.json();
}

async function fetchGitHubTextFile(repoFullName, filePath, ref = "main") {
  try {
    const [owner, repo] = repoFullName.split("/");
    if (!owner || !repo) {
      return "";
    }

    const payload = await fetchGitHubApiJson(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath}?ref=${encodeURIComponent(ref)}`,
      "web-helper-file"
    );

    if (!payload?.content || payload.encoding !== "base64") {
      return "";
    }

    return Buffer.from(String(payload.content).replace(/\s/g, ""), "base64").toString("utf8");
  } catch {
    return "";
  }
}

function safeParseJson(raw, fallback = null) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function getPackageManager(paths) {
  if (paths.includes("pnpm-lock.yaml")) {
    return "pnpm";
  }

  if (paths.includes("yarn.lock")) {
    return "yarn";
  }

  if (paths.includes("bun.lockb") || paths.includes("bun.lock")) {
    return "bun";
  }

  if (paths.includes("package-lock.json")) {
    return "npm";
  }

  return "unknown";
}

function getAppRelativePath(filePath) {
  const normalized = String(filePath || "").replace(/\\/g, "/");
  if (normalized.startsWith("src/app/")) {
    return normalized.slice("src/app/".length);
  }

  if (normalized.startsWith("app/")) {
    return normalized.slice("app/".length);
  }

  return "";
}

function routePathFromAppFile(filePath, fileName) {
  const normalized = getAppRelativePath(filePath);
  const suffix = `/${fileName}`;
  if (!normalized || !normalized.endsWith(fileName)) {
    return "";
  }

  const withoutPrefix = normalized === fileName ? "" : normalized.slice(0, -suffix.length);
  const cleaned = withoutPrefix
    .split("/")
    .filter((segment) => segment && !/^\(.+\)$/.test(segment))
    .map((segment) => segment.replace(/^\[(.+)\]$/, ":$1"))
    .join("/");

  return cleaned ? `/${cleaned}` : "/";
}

function parseEnvKeys(raw) {
  return String(raw || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => line.split("=")[0].trim())
    .filter(Boolean);
}

function uniq(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function pickMatching(paths, predicate, limit = 18) {
  return paths.filter(predicate).slice(0, limit);
}

async function fetchGitHubRepoBlueprint(repoFullName, forceRefresh = false) {
  const cacheKey = repoFullName.toLowerCase();
  const cached = repoKnowledgeCache.get(cacheKey);
  const now = Date.now();
  if (!forceRefresh && cached && now - cached.generatedAt < GITHUB_REPO_CACHE_TTL_MS) {
    return cached.blueprint;
  }

  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) {
    throw new Error("Invalid GitHub repo name.");
  }

  const repoMeta = await fetchGitHubApiJson(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    "web-helper-repo"
  );
  const defaultBranch = repoMeta.default_branch || "main";
  const treePayload = await fetchGitHubApiJson(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`,
    "web-helper-tree"
  );
  const paths = (Array.isArray(treePayload?.tree) ? treePayload.tree : [])
    .filter((entry) => entry.type === "blob")
    .map((entry) => String(entry.path || ""))
    .filter(Boolean)
    .sort();
  const packageJsonRaw = await fetchGitHubTextFile(repoFullName, "package.json", defaultBranch);
  const envExampleRaw = await fetchGitHubTextFile(repoFullName, ".env.example", defaultBranch);

  const blueprint = {
    repo: repoFullName,
    defaultBranch,
    description: repoMeta.description || "",
    visibility: repoMeta.visibility || (repoMeta.private ? "private" : "public"),
    updatedAt: repoMeta.updated_at || "",
    pushedAt: repoMeta.pushed_at || "",
    treeTruncated: Boolean(treePayload?.truncated),
    paths,
    packageJson: safeParseJson(packageJsonRaw, {}),
    envKeys: parseEnvKeys(envExampleRaw)
  };

  repoKnowledgeCache.set(cacheKey, {
    generatedAt: now,
    blueprint
  });

  return blueprint;
}

function inferFramework(packageJson, paths) {
  const dependencies = {
    ...(packageJson?.dependencies || {}),
    ...(packageJson?.devDependencies || {})
  };

  if (dependencies.next || paths.some((filePath) => filePath.startsWith("app/") || filePath.startsWith("src/app/"))) {
    return "Next.js App Router";
  }

  if (dependencies.vite) {
    return "Vite";
  }

  if (dependencies.react) {
    return "React";
  }

  return "Unknown web framework";
}

function inferBuildKnowledge(client, blueprint) {
  const paths = blueprint?.paths || [];
  const packageJson = blueprint?.packageJson || {};
  const dependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {})
  };
  const dependencyNames = Object.keys(dependencies);
  const scripts = packageJson.scripts || {};
  const pageRoutes = uniq(paths.map((filePath) => routePathFromAppFile(filePath, "page.tsx")).filter(Boolean));
  const apiRoutes = uniq(paths.map((filePath) => routePathFromAppFile(filePath, "route.ts")).filter(Boolean));
  const envKeys = blueprint?.envKeys || [];
  const integrations = [];

  if (dependencyNames.includes("@neondatabase/serverless") || envKeys.includes("DATABASE_URL")) {
    integrations.push("Neon Postgres / DATABASE_URL");
  }

  if (dependencyNames.includes("@vercel/blob") || envKeys.includes("BLOB_READ_WRITE_TOKEN")) {
    integrations.push("Vercel Blob product/image storage");
  }

  if (envKeys.some((key) => key.startsWith("EPOS_")) || apiRoutes.some((route) => route.includes("/api/epos"))) {
    integrations.push("Epos Now catalog, stock, order, and webhook sync");
  }

  if (envKeys.includes("RESEND_API_KEY") || envKeys.includes("FORMSPREE_ENDPOINT")) {
    integrations.push("Contact form email delivery");
  }

  if (envKeys.includes("ADMIN_ACCESS_KEY") || apiRoutes.some((route) => route.includes("/api/admin"))) {
    integrations.push("Owner admin dashboard and protected admin APIs");
  }

  const safeEditFiles = pickMatching(paths, (filePath) =>
    /^(src\/)?app\/(page|about\/page|about-us\/page|contact\/page|service-areas\/page|services\/page|testimonials\/page|shipping-returns\/page|privacy-policy\/page)\.tsx$/.test(filePath) ||
    /^(src\/)?app\/globals\.css$/.test(filePath) ||
    /^(src\/)?components\/(site-header|site-footer|category-menu|product-showcase|review-carousel|contact-form|newsletter-form)\.tsx$/.test(filePath) ||
    /^src\/components\/(layout|sections|forms|seo)\//.test(filePath) ||
    filePath === "src/content/site.ts" ||
    filePath === "src/lib/seo.ts" ||
    filePath === "lib/data.ts" ||
    filePath === "app/globals.css"
  );

  const protectedFiles = pickMatching(paths, (filePath) =>
    filePath === ".env.example" ||
    filePath === "package-lock.json" ||
    filePath.startsWith("database/") ||
    filePath.startsWith("app/api/admin/") ||
    filePath.startsWith("src/app/api/admin/") ||
    filePath.startsWith("app/api/epos/") ||
    filePath.startsWith("src/app/api/epos/") ||
    ["lib/db.ts", "lib/orders.ts", "lib/epos.ts", "lib/epos-sync.ts", "lib/admin-products.ts", "scripts/sync-epos-catalog.mjs"].includes(filePath)
  );

  return {
    repo: blueprint?.repo || normalizeGithubRepoFullName(client.repo || client.githubUrl),
    repoStatus: blueprint ? "learned" : "not-indexed",
    lastRepoUpdate: blueprint?.pushedAt || blueprint?.updatedAt || "",
    framework: inferFramework(packageJson, paths),
    language: paths.includes("tsconfig.json") ? "TypeScript" : "JavaScript",
    packageManager: getPackageManager(paths),
    scripts,
    dependencies: dependencyNames.slice(0, 24),
    envKeys,
    pageRoutes: pageRoutes.slice(0, 24),
    apiRoutes: apiRoutes.slice(0, 32),
    componentFiles: pickMatching(paths, (filePath) => /^(src\/)?components\/.+\.tsx$/.test(filePath), 24),
    libFiles: pickMatching(paths, (filePath) => /^(src\/)?lib\/.+\.(ts|tsx|js)$/.test(filePath) || /^src\/content\/.+\.(ts|tsx|js)$/.test(filePath), 28),
    assetFiles: pickMatching(paths, (filePath) => filePath.startsWith("public/"), 20),
    databaseFiles: pickMatching(paths, (filePath) => filePath.startsWith("database/"), 8),
    integrations: uniq(integrations),
    safeEditFiles,
    protectedFiles,
    approvalGates: [
      "Deploys and public client replies require owner approval.",
      "Admin, order, product, inventory, discount, shipping, and Epos sync changes require owner approval.",
      "Database schema, environment variables, webhook secrets, and auth/session changes require owner approval.",
      "Product image imports, stock repair, and order retry actions require owner approval before execution."
    ],
    standardChecks: [
      scripts.build ? "npm run build" : "",
      scripts.lint ? "npm run lint" : "",
      "Check homepage, shop, contact, admin login, product APIs, contact form, newsletter, and order/admin flows after relevant changes."
    ].filter(Boolean)
  };
}

function getClientProfileGaps(client) {
  const gaps = [];
  const services = uniq([...(client.services || []), ...(client.plannedServices || [])]);
  const needsSearch = services.includes("search-intelligence") || services.includes("local-service");
  const needsSocial = services.includes("content-social");
  if (!client.websiteUrl) {
    gaps.push({ id: "missing-website", label: "Missing website", priority: "required" });
  }
  if (!client.repo) {
    gaps.push({ id: "missing-repo", label: "Missing repo", priority: "required" });
  }
  if (!client.vercelUrl) {
    gaps.push({ id: "missing-vercel", label: "Missing Vercel", priority: "required" });
  }
  if (needsSearch && !client.googleBusinessUrl) {
    gaps.push({ id: "missing-gbp", label: "Missing Google Business Profile", priority: "growth" });
  }
  if (needsSocial && !client.socialUrls?.length) {
    gaps.push({ id: "missing-socials", label: "Missing social profiles", priority: "growth" });
  }
  if (client.finalDomainPurchased === false) {
    gaps.push({ id: "final-domain-needed", label: "Final domain needed", priority: "launch" });
  }
  if (client.clientDetailsPending) {
    gaps.push({ id: "details-pending", label: "Client details pending", priority: "launch" });
  }
  return gaps;
}

function buildMemoryDocument(title, fileName, lines) {
  return {
    title,
    fileName,
    content: lines.filter((line) => line !== null && line !== undefined && line !== "").join("\n")
  };
}

function buildWebHelperMemoryDocuments(client, knowledge, activationMeta) {
  const gaps = getClientProfileGaps(client);
  const connectionLines = [
    `- Website: ${client.websiteUrl || "not linked"}`,
    `- GitHub: ${client.githubUrl || client.repo || "not linked"}`,
    `- Vercel: ${client.vercelUrl || "not linked"}`,
    `- Railway/backend: ${client.railwayUrl || "not linked"}`,
    `- Google Business: ${client.googleBusinessUrl || "not linked"}`,
    `- Socials: ${client.socialUrls?.length ? client.socialUrls.join(", ") : "not linked"}`
  ];
  const routeLines = knowledge.pageRoutes.length ? knowledge.pageRoutes.map((route) => `- ${route}`) : ["- No page routes learned yet."];
  const apiLines = knowledge.apiRoutes.length ? knowledge.apiRoutes.map((route) => `- ${route}`) : ["- No API routes learned yet."];
  const safeFiles = knowledge.safeEditFiles.length ? knowledge.safeEditFiles.map((filePath) => `- ${filePath}`) : ["- Confirm repo map before editing."];
  const protectedFiles = knowledge.protectedFiles.length ? knowledge.protectedFiles.map((filePath) => `- ${filePath}`) : ["- Treat backend, auth, data, payment, and deployment files as approval-gated."];

  return [
    buildMemoryDocument("Client Profile", "client-profile.md", [
      `# ${client.clientName} Web Helper Profile`,
      "",
      `Activated: ${activationMeta.createdAt}`,
      `Stage: ${client.stage || "unknown"}`,
      `Plan: ${client.plan || "Launch + Care"}`,
      `Services: ${(client.services || []).join(", ") || "not mapped"}`,
      `Planned services: ${(client.plannedServices || []).join(", ") || "none"}`,
      "",
      "## Connections",
      ...connectionLines,
      "",
      "## Known Gaps",
      ...(gaps.length ? gaps.map((gap) => `- ${gap.label} (${gap.priority})`) : ["- No known gaps."]),
      "",
      "## Notes",
      client.notes || "No notes recorded."
    ]),
    buildMemoryDocument("Website Stack", "website-stack.md", [
      `# ${client.clientName} Website Stack`,
      "",
      `Repo: ${knowledge.repo || "not linked"}`,
      `Framework: ${knowledge.framework}`,
      `Language: ${knowledge.language}`,
      `Package manager: ${knowledge.packageManager}`,
      `Last repo update: ${knowledge.lastRepoUpdate || "unknown"}`,
      "",
      "## Integrations",
      ...(knowledge.integrations.length ? knowledge.integrations.map((item) => `- ${item}`) : ["- No integrations learned yet."]),
      "",
      "## Environment Keys",
      ...(knowledge.envKeys.length ? knowledge.envKeys.map((key) => `- ${key}`) : ["- No .env.example keys learned yet."]),
      "",
      "## Page Routes",
      ...routeLines,
      "",
      "## API Routes",
      ...apiLines
    ]),
    buildMemoryDocument("Scope Rules", "scope-rules.md", [
      `# ${client.clientName} Scope Rules`,
      "",
      "## Safe First-Pass Changes",
      "- Copy edits",
      "- Image swaps using approved assets",
      "- Hours, contact, social, and non-sensitive content updates",
      "- Minor layout polish on public marketing pages",
      "- Broken link fixes",
      "",
      "## Safe Edit Files",
      ...safeFiles,
      "",
      "## Approval-Gated Areas",
      ...knowledge.approvalGates.map((rule) => `- ${rule}`),
      "",
      "## Protected Files",
      ...protectedFiles
    ]),
    buildMemoryDocument("Repo Map", "repo-map.md", [
      `# ${client.clientName} Repo Map`,
      "",
      "## Components",
      ...(knowledge.componentFiles.length ? knowledge.componentFiles.map((filePath) => `- ${filePath}`) : ["- No component files learned yet."]),
      "",
      "## Libraries",
      ...(knowledge.libFiles.length ? knowledge.libFiles.map((filePath) => `- ${filePath}`) : ["- No library files learned yet."]),
      "",
      "## Assets",
      ...(knowledge.assetFiles.length ? knowledge.assetFiles.map((filePath) => `- ${filePath}`) : ["- No public assets learned yet."]),
      "",
      "## Database",
      ...(knowledge.databaseFiles.length ? knowledge.databaseFiles.map((filePath) => `- ${filePath}`) : ["- No database files learned yet."])
    ]),
    buildMemoryDocument("Update History", "update-history.md", [
      `# ${client.clientName} Update History`,
      "",
      `- ${activationMeta.createdAt}: Web Helper knowledge pack activated by Mission Control.`,
      activationMeta.command ? `- Trigger command: ${activationMeta.command}` : "",
      "",
      "## Verification Checklist",
      ...knowledge.standardChecks.map((check) => `- ${check}`)
    ])
  ];
}

function summarizeWebHelperActivation(activation) {
  if (!activation) {
    return null;
  }

  return {
    id: activation.id,
    status: activation.status,
    agentName: activation.agent.name,
    learnedAt: activation.createdAt,
    updatedAt: activation.updatedAt,
    repoStatus: activation.knowledge.repoStatus,
    framework: activation.knowledge.framework,
    routeCount: activation.knowledge.pageRoutes.length,
    apiRouteCount: activation.knowledge.apiRoutes.length,
    integrationCount: activation.knowledge.integrations.length,
    memoryDocumentCount: activation.memoryDocuments.length,
    knownGapCount: activation.knownGaps.length,
    nextActions: activation.nextActions.slice(0, 4)
  };
}

function getWebHelperActivationSummary(siteId) {
  hydrateWebHelperActivations();
  return summarizeWebHelperActivation(webHelperActivations.get(siteId));
}

function looseLookupKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findClientForWebHelperTarget(targetId) {
  const normalizedTarget = String(targetId || "").trim();
  const targetSlug = slugify(normalizedTarget);
  const targetLoose = looseLookupKey(normalizedTarget);
  const clients = getAllClients();

  return clients.find((client) => {
    const repoFullName = normalizeGithubRepoFullName(client.repo || client.githubUrl);
    const possibleIds = [
      client.id,
      slugify(client.clientName),
      `${client.id}-web-helper`,
      normalizeIdentityDomain(client.websiteUrl),
      normalizeIdentityDomain(client.vercelUrl),
      repoFullName,
      repoFullName.split("/")[1] || ""
    ]
      .map((value) => String(value || "").trim())
      .filter(Boolean);

    return possibleIds.some((value) =>
      value === normalizedTarget ||
      slugify(value) === targetSlug ||
      looseLookupKey(value) === targetLoose
    );
  }) || null;
}

function findClientForWebHelperRequest(payload) {
  const candidates = [
    payload.clientId,
    payload.client_id,
    payload.webHelperId,
    payload.web_helper_id,
    payload.client,
    payload.clientName,
    payload.client_name,
    payload.site,
    payload.siteUrl,
    payload.site_url,
    payload.websiteUrl,
    payload.website_url,
    payload.repo,
    payload.githubRepo,
    payload.github_repo
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  for (const candidate of candidates) {
    const client = findClientForWebHelperTarget(candidate);
    if (client) {
      return client;
    }
  }

  const siteDomain = normalizeIdentityDomain(payload.site || payload.siteUrl || payload.site_url || payload.websiteUrl || payload.website_url);
  const repoIdentity = normalizeRepoIdentity(payload.repo || payload.githubRepo || payload.github_repo);
  const clientLoose = looseLookupKey(payload.client || payload.clientName || payload.client_name);

  return getAllClients().find((client) => {
    const clientRepo = normalizeRepoIdentity(client.repo || client.githubUrl);
    const clientDomains = [client.websiteUrl, client.vercelUrl].map(normalizeIdentityDomain).filter(Boolean);
    return (
      (siteDomain && clientDomains.includes(siteDomain)) ||
      (repoIdentity && clientRepo === repoIdentity) ||
      (clientLoose && looseLookupKey(client.clientName).includes(clientLoose))
    );
  }) || null;
}

function validateWebHelperRequestPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return "JSON payload is required.";
  }

  const source = String(payload.source || "client_admin_dashboard").trim();
  if (GHOST_WEB_HELPER_ALLOWED_SOURCES.length && !GHOST_WEB_HELPER_ALLOWED_SOURCES.includes(source)) {
    return `Source ${source || "(blank)"} is not allowed.`;
  }

  if (!payload.summary && !payload.details && !payload.message) {
    return "summary, details, or message is required.";
  }

  return "";
}

function webHelperTargetMatchesClient(client, targetId) {
  if (!targetId) {
    return false;
  }

  const normalizedTarget = String(targetId || "").trim();
  const targetSlug = slugify(normalizedTarget);
  const targetLoose = looseLookupKey(normalizedTarget);
  return getClientIdentityKeys(client).some((key) => {
    const value = key.split(":").slice(1).join(":");
    return value === normalizedTarget || slugify(value) === targetSlug || looseLookupKey(value) === targetLoose;
  });
}

function findClientForMonitoredSite(site) {
  const siteDomain = normalizeIdentityDomain(site?.rootUrl || site?.pages?.[0]?.url || site?.domain);
  const siteSlug = slugify(site?.id || site?.name || site?.domain);
  return getAllClients().find((client) =>
    normalizeIdentityDomain(client.websiteUrl) === siteDomain ||
    normalizeIdentityDomain(client.vercelUrl) === siteDomain ||
    slugify(client.id) === siteSlug ||
    slugify(client.clientName) === siteSlug
  ) || null;
}

function buildClientFromMonitoredSite(site) {
  let websiteUrl = site.rootUrl || "";
  if (!websiteUrl && site.pages?.[0]?.url) {
    try {
      websiteUrl = new URL(site.pages[0].url).origin;
    } catch {
      websiteUrl = site.pages[0].url;
    }
  }

  return normalizeClient({
    id: site.id,
    clientName: site.name || site.domain || site.id,
    websiteUrl,
    stage: "web-helper-care",
    services: ["website-build", "web-helper-care"],
    plan: "Post-launch maintenance template",
    source: "monitored-site"
  });
}

async function findWebHelperTarget(targetId) {
  const client = findClientForWebHelperTarget(targetId);
  if (client) {
    return client;
  }

  const snapshot = await getMissionSnapshot(false);
  const targetSlug = slugify(targetId);
  const site = (snapshot.websites || []).find((entry) =>
    entry.id === targetId ||
    slugify(entry.id) === targetSlug ||
    slugify(entry.name) === targetSlug ||
    normalizeDomain(entry.domain) === normalizeDomain(targetId)
  );

  return site ? buildClientFromMonitoredSite(site) : null;
}

async function buildWebHelperKnowledgePack(client, options = {}) {
  const createdAt = new Date().toISOString();
  const repoFullName = normalizeGithubRepoFullName(client.repo || client.githubUrl);
  let blueprint = null;
  let repoError = "";

  if (repoFullName) {
    try {
      blueprint = await fetchGitHubRepoBlueprint(repoFullName, Boolean(options.forceRefresh));
    } catch (error) {
      repoError = String(error?.message || error || "Unable to learn repo.");
    }
  }

  const knowledge = inferBuildKnowledge(client, blueprint);
  if (repoError) {
    knowledge.repoStatus = "learn-failed";
    knowledge.repoError = repoError;
  }

  const knownGaps = getClientProfileGaps(client);
  const activation = {
    id: `${client.id}-web-helper-${Date.now()}`,
    siteId: client.id,
    clientId: client.id,
    status: "active",
    createdAt,
    updatedAt: createdAt,
    command: options.command || "",
    agent: {
      name: `${client.clientName} Web Helper`,
      role: "Post-launch website operator",
      autonomyLevel: "Level 1 - prepare changes, owner approves deploy",
      mission: "Keep the website easy to update, safely maintainable, and ready for quick owner-reviewed changes.",
      allowedWork: ["copy edits", "image swaps", "hours/contact/social updates", "broken link fixes", "minor layout bugs"],
      approvalRequiredFor: knowledge.approvalGates
    },
    clientProfile: {
      clientName: client.clientName,
      stage: client.stage,
      plan: client.plan,
      services: client.services || [],
      plannedServices: client.plannedServices || [],
      websiteUrl: client.websiteUrl,
      repo: repoFullName || client.repo || "",
      githubUrl: client.githubUrl || (repoFullName ? `https://github.com/${repoFullName}` : ""),
      vercelUrl: client.vercelUrl,
      railwayUrl: client.railwayUrl,
      googleBusinessUrl: client.googleBusinessUrl,
      socialUrls: client.socialUrls || [],
      notes: client.notes || ""
    },
    knowledge,
    knownGaps,
    memoryDocuments: [],
    nextActions: [
      knownGaps.find((gap) => gap.id === "missing-gbp") ? "Add Google Business Profile URL when available." : "",
      "Review generated memory documents before first client-facing update.",
      "Run build/lint checks before deployment after code changes.",
      "Keep admin, order, inventory, Epos, database, and deployment work owner-approved."
    ].filter(Boolean)
  };

  activation.memoryDocuments = buildWebHelperMemoryDocuments(client, knowledge, activation);
  return activation;
}

async function activateWebHelperForTarget(targetId, options = {}) {
  hydrateWebHelperActivations();
  const client = await findWebHelperTarget(targetId);
  if (!client) {
    return null;
  }

  const activation = await buildWebHelperKnowledgePack(client, options);
  webHelperActivations.set(client.id, activation);
  persistWebHelperActivations();
  return activation;
}

function isCurrentWebsiteWebHelperClient(client) {
  const services = client?.services || [];
  return Boolean(
    client?.websiteUrl &&
    client?.repo &&
    client.stage !== "paused-archived" &&
    services.includes("website-build") &&
    services.includes("web-helper-care")
  );
}

function getCurrentWebsiteWebHelperClients() {
  return getAllClients().filter(isCurrentWebsiteWebHelperClient);
}

async function ensureCurrentWebsiteWebHelpersActivated(options = {}) {
  hydrateWebHelperActivations();
  const refreshExisting = Boolean(options.refreshExisting);
  const command = options.command || "Auto-activate current live website Web Helpers";
  const targets = getCurrentWebsiteWebHelperClients();
  const activated = [];
  const existing = [];
  const failed = [];
  let changed = false;

  for (const client of targets) {
    const current = webHelperActivations.get(client.id);
    if (current && !refreshExisting) {
      existing.push(summarizeWebHelperActivation(current));
      continue;
    }

    try {
      const activation = await buildWebHelperKnowledgePack(client, {
        command,
        forceRefresh: refreshExisting || Boolean(options.forceRefresh)
      });
      webHelperActivations.set(client.id, activation);
      activated.push(summarizeWebHelperActivation(activation));
      changed = true;
    } catch (error) {
      failed.push({
        clientId: client.id,
        clientName: client.clientName,
        error: String(error?.message || error || "Activation failed")
      });
    }
  }

  if (changed) {
    persistWebHelperActivations();
  }

  return {
    generatedAt: new Date().toISOString(),
    enabled: true,
    targetCount: targets.length,
    activatedCount: activated.length,
    existingCount: existing.length,
    failedCount: failed.length,
    activated,
    existing,
    failed
  };
}

function getWebHelperAutoActivation(options = {}) {
  if (!WEB_HELPER_AUTO_ACTIVATE && !options.forceRun) {
    return Promise.resolve({
      generatedAt: new Date().toISOString(),
      enabled: false,
      targetCount: 0,
      activatedCount: 0,
      existingCount: 0,
      failedCount: 0,
      activated: [],
      existing: [],
      failed: []
    });
  }

  if (!options.forceRun && !options.refreshExisting && webHelperAutoActivationPromise) {
    return webHelperAutoActivationPromise;
  }

  const activationPromise = ensureCurrentWebsiteWebHelpersActivated(options)
    .finally(() => {
      if (webHelperAutoActivationPromise === activationPromise) {
        webHelperAutoActivationPromise = null;
      }
    });

  if (!options.forceRun && !options.refreshExisting) {
    webHelperAutoActivationPromise = activationPromise;
  }

  return activationPromise;
}

function buildWebHelperRequests(site) {
  const failedPages = (site.pages || []).filter((page) => !page.ok);
  const slowPages = (site.pages || []).filter((page) => page.ok && page.latencyMs >= 1500);
  const requests = [];

  if (failedPages.length > 0) {
    requests.push({
      id: `${site.id}-repair-${failedPages.length}`,
      type: "bug_fix",
      title: "Repair unreachable website pages",
      summary: `${failedPages.length} page checks are failing and should be triaged before client-facing reply.`,
      status: "needs-review",
      source: "mission_control_monitoring",
      operationalTask: true,
      approvalRequired: true,
      sla: "Same day"
    });
  }

  if (slowPages.length > 0) {
    requests.push({
      id: `${site.id}-latency-${slowPages.length}`,
      type: "performance",
      title: "Investigate slow page performance",
      summary: `${slowPages.length} monitored pages are responding slowly and may need optimization.`,
      status: "queued",
      source: "mission_control_monitoring",
      operationalTask: true,
      approvalRequired: false,
      sla: "Next business day"
    });
  }

  if (!requests.length) {
    requests.push({
      id: `${site.id}-template-ready`,
      type: "template_setup",
      title: "Create reusable helper template",
      summary: "Site is stable. Helper is ready for client profile, scope rules, and repo connection.",
      status: "ready",
      source: "mission_control_setup",
      operationalTask: true,
      approvalRequired: false,
      sla: "Template setup"
    });
  }

  return requests;
}

function getStoredRequestsForClient(storedRequests, clientId) {
  return (storedRequests || [])
    .filter((request) => request.clientId === clientId)
    .map((request) => ({
      ...request,
      title: request.title || request.summary || "Client website request",
      summary: request.summary || request.details || "Client submitted a website helper request.",
      status: request.status || "new",
      approvalRequired: Boolean(request.approvalRequired),
      sla: request.sla || (request.approvalRequired ? "Owner approval" : "Safe update")
    }));
}

function buildWebHelperAgents(snapshot, requestedSiteId = "", storedRequests = []) {
  const websites = snapshot.websites || [];
  const filteredSites = requestedSiteId
    ? websites.filter((site) => site.id === requestedSiteId || webHelperTargetMatchesClient(findClientForMonitoredSite(site), requestedSiteId))
    : websites;

  return filteredSites.map((site) => {
    const client = findClientForMonitoredSite(site);
    if (client && !isCurrentWebsiteWebHelperClient(client)) {
      return null;
    }

    const storedClientRequests = client ? getStoredRequestsForClient(storedRequests, client.id) : [];
    const requests = [...storedClientRequests, ...buildWebHelperRequests(site)];
    const pendingApprovals = requests.filter((request) => request.approvalRequired).length;
    const status = pendingApprovals > 0 ? "needs-approval" : "active";
    let rootUrl = `https://${site.domain}`;
    try {
      if (site.pages?.[0]?.url) {
        rootUrl = new URL(site.pages[0].url).origin;
      }
    } catch {
      rootUrl = `https://${site.domain}`;
    }

    return {
      id: `${client?.id || site.id}-web-helper`,
      siteId: client?.id || site.id,
      name: `${client?.clientName || site.name} Web Helper`,
      clientName: client?.clientName || site.name,
      websiteUrl: rootUrl,
      repo: client?.repo || "",
      deployment: "Vercel / monitored site",
      status,
      statusLabel: status === "needs-approval" ? "Needs Approval" : "Active",
      autonomyLevel: "Level 1 - prepare changes, owner approves deploy",
      plan: client?.plan || "Post-launch maintenance template",
      openRequests: requests.length,
      pendingApprovals,
      lastDeployment: snapshot.generatedAt,
      lastDeploymentLabel: formatWebHelperDate(snapshot.generatedAt),
      scope: ["copy edits", "image swaps", "hours", "broken links", "minor layout bugs"],
      escalationRules: ["new pages", "forms", "payments", "billing", "angry client"],
      memoryFiles: [
        "client-profile.md",
        "brand-voice.md",
        "website-stack.md",
        "scope-rules.md",
        "update-history.md"
      ],
      activation: getWebHelperActivationSummary(client?.id || site.id),
      requests
    };
  }).filter(Boolean);
}

function buildClientWebHelperAgents(clients, requestedSiteId = "", existingHelpers = [], storedRequests = []) {
  const existingUrls = new Set(
    (existingHelpers || [])
      .map((helper) => {
        return normalizeIdentityDomain(helper.websiteUrl);
      })
      .filter(Boolean)
  );

  return (clients || [])
    .filter(isCurrentWebsiteWebHelperClient)
    .filter((client) => !requestedSiteId || webHelperTargetMatchesClient(client, requestedSiteId))
    .filter((client) => {
      return !existingUrls.has(normalizeIdentityDomain(client.websiteUrl));
    })
    .map((client) => {
      const requests = getStoredRequestsForClient(storedRequests, client.id);
      if (client.finalDomainPurchased === false) {
        requests.push({
          id: `${client.id}-domain`,
          type: "domain_setup",
          title: "Attach final custom domain",
          summary: "Client is running on a preview deployment. Purchase or connect the final domain before handoff.",
          status: "needs-review",
          source: "mission_control_setup",
          operationalTask: true,
          approvalRequired: true,
          sla: "Before launch"
        });
      }

      if (client.clientDetailsPending) {
        requests.push({
          id: `${client.id}-details`,
          type: "client_intake",
          title: "Collect final client details",
          summary: "Client details are still pending. Confirm business information, service scope, and launch notes.",
          status: "needs-review",
          source: "mission_control_setup",
          operationalTask: true,
          approvalRequired: true,
          sla: "Before automation"
        });
      }

      if (!requests.length) {
        requests.push({
          id: `${client.id}-helper-memory`,
          type: "template_setup",
          title: "Create Web Helper memory",
          summary: "Live client site is ready for brand voice, repo map, scope rules, and update-history memory.",
          status: "ready",
          source: "mission_control_setup",
          operationalTask: true,
          approvalRequired: false,
          sla: "Template setup"
        });
      }

      const pendingApprovals = requests.filter((request) => request.approvalRequired).length;
      const status = pendingApprovals > 0 ? "needs-approval" : "active";
      return {
        id: `${client.id}-web-helper`,
        siteId: client.id,
        name: `${client.clientName} Web Helper`,
        clientName: client.clientName,
        websiteUrl: client.websiteUrl,
        repo: client.repo,
        deployment: client.vercelUrl ? "Vercel / live client site" : "Live client site",
        status,
        statusLabel: status === "needs-approval" ? "Needs Approval" : "Active",
        autonomyLevel: "Level 1 - prepare changes, owner approves deploy",
        plan: client.plan || "Launch + Care",
        openRequests: requests.length,
        pendingApprovals,
        lastDeployment: client.updatedAt,
        lastDeploymentLabel: formatWebHelperDate(client.updatedAt),
        scope: ["copy edits", "image swaps", "hours", "broken links", "minor layout bugs"],
        escalationRules: ["new pages", "forms", "payments", "billing", "angry client"],
        memoryFiles: [
          "client-profile.md",
          "brand-voice.md",
          "website-stack.md",
          "scope-rules.md",
          "update-history.md"
        ],
        activation: getWebHelperActivationSummary(client.id),
        requests
      };
    });
}

function isOperationalWebHelperTask(request) {
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

function summarizeWebHelpers(helpers) {
  const supportRequests = helpers.flatMap((helper) => helper.requests || []).filter((request) => !isOperationalWebHelperTask(request));
  return {
    helperCount: helpers.length,
    activeCount: helpers.filter((helper) => helper.status === "active").length,
    openRequests: supportRequests.length,
    pendingApprovals: supportRequests.filter((request) => request.approvalRequired).length,
    templateReadyCount: helpers.filter((helper) =>
      (helper.requests || []).some((request) => request.type === "template_setup")
    ).length
  };
}

function getServiceCatalog() {
  return [
    {
      id: "website-build",
      name: "Website Build",
      status: "active",
      category: "launch",
      owner: "Build Operator",
      description: "Discovery, design, build, review, final payment, launch, and handoff into maintenance.",
      connectedSystems: ["Build Queue", "Vercel", "GitHub", "Web Helper Agents"],
      triggers: ["initial deposit paid", "new build approved", "client revision received"],
      nextActions: ["Create client profile", "Link repo and deployment", "Define launch checklist"]
    },
    {
      id: "web-helper-care",
      name: "Web Helper Care",
      status: "active",
      category: "maintenance",
      owner: "Web Helper Agent",
      description: "Client request handling, small edits, safe fixes, approval gates, deploy notes, and client replies.",
      connectedSystems: ["Web Helpers", "Client Request Inbox", "Approvals", "GitHub", "Vercel"],
      triggers: ["completion payment received", "client update request", "site issue detected"],
      nextActions: ["Attach agent memory", "Set scope rules", "Connect approved contacts"]
    },
    {
      id: "search-intelligence",
      name: "SEO / AEO / GEO",
      status: "integration-needed",
      category: "growth",
      owner: "Search Intelligence Agent",
      description: "Organic search, answer engine readiness, and generative engine visibility from geo.ghostai.solutions.",
      connectedSystems: ["geo.ghostai.solutions", "Reports", "Web Helpers", "Approvals"],
      triggers: ["new client onboarded", "ranking issue", "AI visibility opportunity"],
      nextActions: ["Add API credentials", "Map siteId to GEO profile", "Import scores and recommendations"]
    },
    {
      id: "lead-funnel",
      name: "Lead Funnel",
      status: "planned",
      category: "growth",
      owner: "Funnel Monitor Agent",
      description: "Lead capture, conversion path monitoring, follow-up routing, and form health.",
      connectedSystems: ["Forms", "CRM", "Analytics", "Client Reports"],
      triggers: ["lead drop", "form failure", "campaign launch"],
      nextActions: ["Define conversion events", "Connect CRM", "Add form probes"]
    },
    {
      id: "content-social",
      name: "Content + Social",
      status: "planned",
      category: "marketing",
      owner: "Content Operator",
      description: "Content briefs, posting queue, social distribution, business page posting, and campaign support.",
      connectedSystems: ["Social Pages", "Google Business", "Content Tools", "Search Intelligence"],
      triggers: ["content calendar due", "GEO topic gap", "campaign push"],
      nextActions: ["Connect social pages", "Create monthly plan", "Set approval rules"]
    },
    {
      id: "paid-ads",
      name: "Paid Ads",
      status: "planned",
      category: "growth",
      owner: "Ads Operator",
      description: "Ad account access, campaign setup, landing-page alignment, tracking, and performance review.",
      connectedSystems: ["Meta Ads", "Google Ads", "Analytics", "Lead Funnel"],
      triggers: ["ad package sold", "campaign refresh", "conversion tracking issue"],
      nextActions: ["Collect ad account access", "Confirm budget rules", "Connect tracking"]
    },
    {
      id: "reporting",
      name: "Client Reporting",
      status: "planned",
      category: "retention",
      owner: "Reporting Agent",
      description: "Monthly service summaries, completed work, search visibility, site health, and next-best investment.",
      connectedSystems: ["Mission History", "Search Intelligence", "Web Helpers", "Billing"],
      triggers: ["monthly report due", "client check-in", "renewal window"],
      nextActions: ["Create report template", "Map service KPIs", "Add export workflow"]
    }
  ];
}

function getOnboardingBlueprint() {
  return {
    stages: [
      {
        id: "intake",
        name: "Lead Intake",
        status: "template-ready",
        description: "Capture the phone or Facebook Messenger inquiry, contact path, business basics, and first website goal.",
        requiredArtifacts: ["Lead record", "Primary contact", "Discovery notes"],
        automations: ["create lead record", "queue proposal follow-up"]
      },
      {
        id: "proposal-invoice",
        name: "Proposal + Deposit Invoice",
        status: "template-ready",
        description: "Send the project proposal and deposit invoice after the discovery discussion.",
        requiredArtifacts: ["Proposal sent", "Deposit invoice sent", "Build scope"],
        automations: ["flag unsent proposal", "remind on stale invoice"]
      },
      {
        id: "agreement-returned",
        name: "Agreement Returned",
        status: "template-ready",
        description: "Track the signed project agreement before paid production work starts.",
        requiredArtifacts: ["Signed agreement", "Approval contact", "Payment expectation"],
        automations: ["escalate unsigned agreement", "prepare deposit follow-up"]
      },
      {
        id: "deposit-build-queue",
        name: "Deposit Paid / Build Queue",
        status: "template-ready",
        description: "Once the deposit is paid, move the client into the website build queue for initial draft production.",
        requiredArtifacts: ["Deposit paid", "Initial draft notes", "Build queue status"],
        automations: ["move to deposit paid", "queue initial draft"]
      }
    ],
    actions: [
      "Add new leads from phone or Facebook Messenger.",
      "Send project proposal and deposit invoice.",
      "Track agreement returned and deposit paid.",
      "Move deposit-paid clients into the website build queue."
    ]
  };
}

function parseConfiguredClients() {
  const rawJson = process.env.MISSION_CLIENTS || process.env.CLIENTS_JSON || "";
  if (!rawJson) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawJson);
    return Array.isArray(parsed) ? parsed.map(normalizeClient).filter(Boolean) : [];
  } catch {
    console.warn("Unable to parse MISSION_CLIENTS JSON.");
    return [];
  }
}

function normalizeServiceList(services) {
  if (Array.isArray(services)) {
    return services.map((service) => String(service || "").trim()).filter(Boolean);
  }

  if (typeof services === "string") {
    return services.split(",").map((service) => service.trim()).filter(Boolean);
  }

  return [];
}

function getClientWebsiteUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "";
  }

  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return new URL(trimmed).origin;
    }

    return new URL(`https://${trimmed}`).origin;
  } catch {
    return "";
  }
}

function getClientUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "";
  }

  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return new URL(trimmed).href;
    }

    return new URL(`https://${trimmed}`).href;
  } catch {
    return "";
  }
}

function normalizeUrlList(value) {
  if (Array.isArray(value)) {
    return value.map(getClientUrl).filter(Boolean);
  }

  if (typeof value === "string") {
    return value.split(/[\n,]/).map(getClientUrl).filter(Boolean);
  }

  return [];
}

function normalizeClientStage(value) {
  const stage = String(value || "").trim().toLowerCase();
  if (CLIENT_PIPELINE_STAGES.some((entry) => entry.id === stage)) {
    return stage;
  }

  if (stage === "onboarding") {
    return "website-build";
  }

  if (["completed", "complete", "archived", "done"].includes(stage)) {
    return "completed-archived";
  }

  if (stage === "live") {
    return "web-helper-care";
  }

  return "website-build";
}

function getGithubUrl(repo) {
  const trimmed = String(repo || "").trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return getClientUrl(trimmed);
  }

  if (/^[\w.-]+\/[\w.-]+$/.test(trimmed)) {
    return `https://github.com/${trimmed}`;
  }

  return "";
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value === 1;
  }
  const normalized = String(value || "").trim().toLowerCase();
  return ["1", "true", "yes", "signed", "paid", "complete"].includes(normalized);
}

function normalizeLeadSource(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (!normalized) {
    return "";
  }

  const aliases = {
    social: "social-media",
    socials: "social-media",
    facebook: "social-media",
    instagram: "social-media",
    tiktok: "social-media",
    linkedin: "social-media",
    messenger: "social-media",
    referral: "referral",
    referred: "referral",
    "lead-command": "lead-command-center",
    "ghost-lead-command": "lead-command-center",
    "lead-command-center": "lead-command-center",
    "digital-card": "digital-business-card",
    "business-card": "digital-business-card",
    "digital-business-card": "digital-business-card",
    email: "email",
    gmail: "email",
    "ai-outreach": "ai-outreach",
    ai: "ai-outreach",
    outreach: "ai-outreach",
    manual: "other",
    other: "other"
  };

  const mapped = aliases[normalized] || normalized;
  return LEAD_SOURCE_DEFINITIONS.some((source) => source.id === mapped) ? mapped : "other";
}

function normalizeLeadStage(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (!normalized) {
    return "";
  }

  const aliases = {
    contacted: "contacted-discovery",
    discovery: "contacted-discovery",
    proposal: "proposal-sent",
    "proposal-invoice-sent": "proposal-sent",
    agreement: "agreement-returned",
    "agreement-back": "agreement-returned",
    deposit: "deposit-paid",
    "build-queue": "deposit-paid",
    lost: "lost-not-now",
    paused: "lost-not-now",
    archived: "lost-not-now"
  };
  const mapped = aliases[normalized] || normalized;
  return LEAD_PIPELINE_STAGES.some((stage) => stage.id === mapped) ? mapped : "";
}

function normalizeClientRelationship(value) {
  const relationship = String(value || "").trim().toLowerCase().replace(/[\s_]+/g, "-");
  return ["client", "partner", "internal", "prospect"].includes(relationship) ? relationship : "client";
}

function normalizeClientPricingTier(value, relationshipType = "client") {
  const tier = String(value || "").trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (["standard", "partner", "custom", "internal"].includes(tier)) {
    return tier;
  }
  const relationship = normalizeClientRelationship(relationshipType);
  if (relationship === "partner" || relationship === "internal") {
    return relationship;
  }
  return "standard";
}

function deriveLeadStage(client) {
  const explicit = normalizeLeadStage(client?.leadStage || client?.lead_stage);
  const stage = normalizeClientStage(client?.stage || client?.pipelineStage || client?.status);
  if (CLOSED_LEAD_CLIENT_STAGES.includes(stage)) {
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

  if (client?.proposalSigned || client?.proposal_signed) {
    return "agreement-returned";
  }
  if (client?.proposalSent || client?.proposal_sent || client?.depositInvoiceSent || client?.deposit_invoice_sent) {
    return "proposal-sent";
  }
  if (client?.contact || client?.businessEmail || client?.business_email || client?.businessPhone || client?.business_phone || client?.notes) {
    return "contacted-discovery";
  }
  return "new-lead";
}

function isLeadDeskClient(client) {
  return Boolean(deriveLeadStage(client));
}

function normalizeClient(client) {
  if (!client || typeof client !== "object") {
    return null;
  }

  const clientName = String(client.clientName || client.name || "").trim();
  if (!clientName) {
    return null;
  }

  const id = client.id || slugify(clientName);
  const services = uniq(normalizeServiceList(client.services || client.activeServices));
  const activeServiceSet = new Set(services);
  const plannedServices = uniq(
    normalizeServiceList(client.plannedServices || client.planned_services || client.queuedServices || client.nextServices)
  ).filter((service) => !activeServiceSet.has(service));
  const websiteUrl = getClientWebsiteUrl(client.websiteUrl || client.website || client.rootUrl);
  const repo = String(client.repo || client.githubRepo || "").trim();
  const stage = normalizeClientStage(client.stage || client.pipelineStage || client.status);
  const relationshipType = normalizeClientRelationship(client.relationshipType || client.relationship_type);
  const now = new Date().toISOString();

  return repairKnownClientIdentity({
    id,
    clientName,
    websiteUrl,
    repo,
    githubUrl: getGithubUrl(repo),
    railwayUrl: getClientUrl(client.railwayUrl || client.backendUrl || client.apiUrl),
    vercelUrl: getClientUrl(client.vercelUrl || client.deploymentUrl),
    mobileAppUrl: getClientUrl(client.mobileAppUrl || client.appUrl),
    googleBusinessUrl: getClientUrl(client.googleBusinessUrl || client.googleBusinessProfile || client.gbpUrl),
    analyticsUrl: getClientUrl(client.analyticsUrl || client.analytics || client.gaUrl),
    adsStatus: String(client.adsStatus || client.ads || "").trim(),
    socialUrls: normalizeUrlList(client.socialUrls || client.socials),
    finalDomainPurchased:
      client.finalDomainPurchased === undefined || client.finalDomainPurchased === null
        ? null
        : normalizeBoolean(client.finalDomainPurchased),
    clientDetailsPending: normalizeBoolean(client.clientDetailsPending),
    leadSource: normalizeLeadSource(client.leadSource || client.lead_source),
    leadSourceDetail: String(client.leadSourceDetail || client.lead_source_detail || client.leadSourceNote || "").trim(),
    leadStage: deriveLeadStage({ ...client, stage }),
    relationshipType,
    pricingTier: normalizeClientPricingTier(client.pricingTier || client.pricing_tier, relationshipType),
    proposalSent: normalizeBoolean(client.proposalSent),
    depositInvoiceSent: normalizeBoolean(client.depositInvoiceSent),
    proposalSigned: normalizeBoolean(client.proposalSigned),
    partnershipSigned: normalizeBoolean(client.partnershipSigned),
    depositPaid: normalizeBoolean(client.depositPaid),
    finalPaymentPaid: normalizeBoolean(client.finalPaymentPaid),
    businessEmail: String(client.businessEmail || "").trim(),
    businessPhone: String(client.businessPhone || "").trim(),
    plan: String(client.plan || "Launch + Care").trim(),
    contact: String(client.contact || client.primaryContact || "").trim(),
    notes: String(client.notes || "").trim(),
    stage,
    status: stage,
    services,
    plannedServices,
    createdAt: client.createdAt || now,
    updatedAt: client.updatedAt || now,
    source: client.source || "configured"
  });
}

function repairKnownClientIdentity(client) {
  if (!client) {
    return client;
  }

  const id = canonicalClientId(client.id);
  const haystack = `${client.clientName} ${client.websiteUrl} ${client.repo} ${client.githubUrl} ${client.vercelUrl} ${client.businessEmail}`;
  const looksLikeProCoat =
    /pro(coat|crete)/i.test(haystack);
  const looksLikeBougie = /bougie/i.test(haystack);
  const looksLikeKeisha = /keisha|kracha|krachal/i.test(haystack);

  if (id === "annas-air" && slugify(client.id) !== "annas-air") {
    client = {
      ...client,
      id: "annas-air"
    };
  }

  if (id === "bougie-and-company" && looksLikeProCoat) {
    return {
      ...client,
      clientName: "Bougie and Company",
      websiteUrl: "https://www.bougieandcompany.com",
      repo: "bougie_and_company",
      githubUrl: "https://github.com/burchdad/bougie_and_company",
      railwayUrl: "https://railway.com/project/3032a264-caf7-4d92-a0f8-406d00cd395c",
      vercelUrl: "https://vercel.com/burchdads-projects/bougie-and-company-oy7t",
      businessEmail: "",
      businessPhone: "",
      contact: "",
      notes: "Website finished, domain wrapped, final website payment accepted. Web Helper care is active; SEO/monthly contract is the next service step.",
      stage: "web-helper-care",
      status: "web-helper-care",
      services: uniq(["website-build", "web-helper-care", "ecommerce"]),
      plannedServices: uniq(["search-intelligence"]),
      finalDomainPurchased: true,
      clientDetailsPending: false,
      finalPaymentPaid: true
    };
  }

  if (id === "keisha-law" && (looksLikeBougie || looksLikeProCoat) && !looksLikeKeisha) {
    return {
      ...client,
      clientName: "Keisha Law",
      websiteUrl: "https://keisha-law.vercel.app",
      repo: "burchdad/keisha-law",
      githubUrl: "https://github.com/burchdad/keisha-law",
      railwayUrl: "",
      vercelUrl: "https://keisha-law.vercel.app/",
      mobileAppUrl: "",
      googleBusinessUrl: "",
      businessEmail: "ker@krachallaw.com",
      businessPhone: "",
      contact: "",
      notes: "Website is launched and ready for SEO/monthly maintenance contract review.",
      stage: "web-helper-care",
      status: "web-helper-care",
      services: uniq(["website-build", "web-helper-care"]),
      plannedServices: uniq(["search-intelligence"]),
      finalDomainPurchased: false,
      clientDetailsPending: false,
      finalPaymentPaid: false
    };
  }

  if (id === "procoat-concrete-coatings" && looksLikeBougie) {
    return {
      ...client,
      clientName: "ProCoat Concrete Coatings",
      websiteUrl: "https://etxprocoat.com",
      repo: "burchdad/procrete_coatings",
      githubUrl: "https://github.com/burchdad/procrete_coatings",
      railwayUrl: "",
      vercelUrl: "https://vercel.com/burchdads-projects/procrete-coatings",
      mobileAppUrl: "",
      googleBusinessUrl: "",
      businessEmail: "steven.procoat@gmail.com",
      businessPhone: "",
      contact: "",
      notes: "Concrete coatings website project in the web build pipeline.",
      stage: "website-build",
      status: "website-build",
      services: uniq(["website-build"]),
      plannedServices: uniq(["web-helper-care"]),
      finalDomainPurchased: true,
      clientDetailsPending: false,
      finalPaymentPaid: false
    };
  }

  return client;
}

function buildClientRecord(input) {
  const normalized = normalizeClient({
    ...input,
    source: "runtime",
    stage: input.stage || input.status || "website-build"
  });

  if (!normalized) {
    return null;
  }

  if (!normalized.services.length) {
    normalized.services = normalized.stage === "lead" ? ["website-build"] : ["website-build", "web-helper-care"];
  }

  if (normalized.depositPaid) {
    normalized.proposalSent = true;
    normalized.depositInvoiceSent = true;
    normalized.proposalSigned = true;
    if (normalized.stage === "lead") {
      normalized.stage = "deposit-paid";
      normalized.status = "deposit-paid";
    }
  } else if (normalized.proposalSigned || normalized.depositInvoiceSent) {
    normalized.proposalSent = true;
  }

  if (
    normalized.finalPaymentPaid &&
    ["final-payment", "launch-handoff"].includes(normalized.stage) &&
    !normalized.partnershipSigned
  ) {
    normalized.stage = "completed-archived";
    normalized.status = "completed-archived";
  }

  return normalized;
}

function normalizeRepoIdentity(value) {
  const repoFullName = normalizeGithubRepoFullName(value);
  const repoName = repoFullName ? repoFullName.split("/")[1] : String(value || "");
  return repoName.toLowerCase().replace(/\.git$/, "").replace(/[^a-z0-9]+/g, "");
}

function getClientIdentityKeys(client) {
  return [
    client?.websiteUrl ? `site:${normalizeIdentityDomain(client.websiteUrl)}` : "",
    client?.repo || client?.githubUrl ? `repo:${normalizeRepoIdentity(client.repo || client.githubUrl)}` : "",
    client?.clientName ? `name:${looseLookupKey(client.clientName)}` : "",
    client?.id ? `id:${canonicalClientId(client.id)}` : ""
  ].filter(Boolean);
}

function mergeClientRecords(existing, incoming) {
  if (!existing) {
    return incoming;
  }

  const isRuntimeOverride = incoming.source === "runtime";
  const pick = (field) => (isRuntimeOverride ? incoming[field] : incoming[field] || existing[field]);
  const pickBoolean = (field) => (isRuntimeOverride ? Boolean(incoming[field]) : Boolean(existing[field] || incoming[field]));

  return {
    ...existing,
    ...incoming,
    id: existing.id || incoming.id,
    clientName: pick("clientName"),
    websiteUrl: pick("websiteUrl"),
    repo: pick("repo"),
    githubUrl: pick("githubUrl"),
    railwayUrl: pick("railwayUrl"),
    vercelUrl: pick("vercelUrl"),
    mobileAppUrl: pick("mobileAppUrl"),
    googleBusinessUrl: pick("googleBusinessUrl"),
    analyticsUrl: pick("analyticsUrl"),
    adsStatus: pick("adsStatus"),
    socialUrls: isRuntimeOverride ? incoming.socialUrls || [] : uniq([...(existing.socialUrls || []), ...(incoming.socialUrls || [])]),
    services: isRuntimeOverride ? incoming.services || [] : uniq([...(existing.services || []), ...(incoming.services || [])]),
    plannedServices: isRuntimeOverride
      ? incoming.plannedServices || []
      : (() => {
          const activeServices = new Set([...(existing.services || []), ...(incoming.services || [])]);
          return uniq([...(existing.plannedServices || []), ...(incoming.plannedServices || [])]).filter((service) => !activeServices.has(service));
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
    source: incoming.source || existing.source
  };
}

function addClientToMergedRoster(merged, aliases, client) {
  if (!client?.id) {
    return;
  }

  const keys = getClientIdentityKeys(client);
  const stableIdKey = `id:${canonicalClientId(client.id)}`;
  const existingPrimaryKey = keys
    .filter((key) => key !== stableIdKey)
    .map((key) => aliases.get(key))
    .find((key) => key && !hasProtectedClientIdConflict(merged.get(key), client)) || aliases.get(stableIdKey);
  const primaryKey = existingPrimaryKey || stableIdKey;
  const mergedClient = mergeClientRecords(merged.get(primaryKey), client);
  merged.set(primaryKey, mergedClient);
  getClientIdentityKeys(mergedClient).forEach((key) => aliases.set(key, primaryKey));
}

function getAllClients() {
  hydrateRuntimeClients();
  const seeded = getSeededClientProfiles();
  const configured = parseConfiguredClients();
  const merged = new Map();
  const aliases = new Map();

  [...seeded, ...configured, ...runtimeClients].forEach((client) => {
    addClientToMergedRoster(merged, aliases, client);
  });

  return [...merged.values()].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

function getClientDataHealth(clients = getAllClients()) {
  const identityMap = new Map();
  const duplicateGroups = [];
  const missingRequired = [];

  clients.forEach((client) => {
    const keys = getClientIdentityKeys(client);
    keys.forEach((key) => {
      const entries = identityMap.get(key) || [];
      entries.push({
        id: client.id,
        clientName: client.clientName,
        websiteUrl: client.websiteUrl,
        repo: client.repo,
        source: client.source || "unknown"
      });
      identityMap.set(key, entries);
    });

    const missing = [];
    if (!client.websiteUrl) {
      missing.push("websiteUrl");
    }
    if (!["lead", "deposit-paid"].includes(client.stage) && !client.repo && !client.githubUrl) {
      missing.push("repo");
    }
    if (!client.stage) {
      missing.push("stage");
    }
    if (!client.services?.length) {
      missing.push("services");
    }
    if (missing.length) {
      missingRequired.push({
        id: client.id,
        clientName: client.clientName,
        missing
      });
    }
  });

  identityMap.forEach((entries, key) => {
    const uniqueIds = [...new Set(entries.map((entry) => entry.id))];
    if (uniqueIds.length > 1) {
      duplicateGroups.push({ key, entries });
    }
  });

  return {
    status: duplicateGroups.length || missingRequired.length ? "attention" : "clean",
    duplicateGroups,
    duplicateCount: duplicateGroups.length,
    missingRequired,
    missingRequiredCount: missingRequired.length,
    checkedAt: new Date().toISOString()
  };
}

function getClientDerivedActions(client) {
  const actions = [];
  const services = uniq([...(client.services || []), ...(client.plannedServices || [])]);
  const needsSearch = services.includes("search-intelligence") || services.includes("local-service");
  const needsSocial = services.includes("content-social");
  if (!client.websiteUrl) {
    actions.push("Add website URL so monitoring and Web Helper setup can attach.");
  }
  if (!client.repo) {
    actions.push("Link GitHub repo for code-aware updates.");
  }
  if (!client.vercelUrl) {
    actions.push("Link Vercel project or deployment URL.");
  }
  if (!client.railwayUrl) {
    actions.push("Add Railway/backend URL if this client has a backend service.");
  }
  if (needsSearch && !client.googleBusinessUrl) {
    actions.push("Add Google Business Profile if local search matters.");
  }
  if (needsSocial && !client.socialUrls?.length) {
    actions.push("Add social profile URLs for content and reputation services.");
  }
  if (client.railwayUrl) {
    actions.push("Keep backend links internal until auth, role masking, and audit logging are active.");
  }
  if (client.finalDomainPurchased === false) {
    actions.push("Purchase or attach the final custom domain before handoff.");
  }
  if (client.clientDetailsPending) {
    actions.push("Collect final client details before moving into full automation.");
  }
  if (!needsSearch) {
    actions.push("Decide whether SEO/AEO/GEO belongs in this client package.");
  }
  if (needsSearch) {
    actions.push("Map client to geo.ghostai.solutions profile.");
  }
  actions.push("Define approval rules and monthly maintenance scope.");
  return actions;
}

function summarizeClients(clients) {
  const intakeStages = ["lead", "deposit-paid"];
  const careStages = ["web-helper-care", "growth-services"];
  return {
    clientCount: clients.length,
    onboardingCount: clients.filter((client) => intakeStages.includes(client.stage)).length,
    liveCount: clients.filter((client) => careStages.includes(client.stage)).length,
    websiteBuildCount: clients.filter((client) => client.stage === "website-build").length,
    searchClients: clients.filter((client) =>
      uniq([...(client.services || []), ...(client.plannedServices || [])]).includes("search-intelligence") ||
      uniq([...(client.services || []), ...(client.plannedServices || [])]).includes("local-service")
    ).length,
    repoLinked: clients.filter((client) => Boolean(client.repo)).length,
    connectedCount: clients.filter((client) => client.websiteUrl && client.repo && client.vercelUrl).length,
    connectionGaps: clients.filter((client) => !client.websiteUrl || !client.repo || !client.vercelUrl).length
  };
}

function socialPlatformMap(urls) {
  const platforms = {
    facebook: "",
    instagram: "",
    linkedin: "",
    tiktok: "",
    youtube: ""
  };

  (urls || []).forEach((url) => {
    const lower = String(url).toLowerCase();
    if (lower.includes("facebook.com") || lower.includes("fb.com")) {
      platforms.facebook = url;
    } else if (lower.includes("instagram.com")) {
      platforms.instagram = url;
    } else if (lower.includes("linkedin.com")) {
      platforms.linkedin = url;
    } else if (lower.includes("tiktok.com")) {
      platforms.tiktok = url;
    } else if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
      platforms.youtube = url;
    }
  });

  return platforms;
}

function connectionStatus(label, status, options = {}) {
  return {
    id: slugify(label),
    label,
    status,
    required: Boolean(options.required),
    url: options.url || "",
    note: options.note || ""
  };
}

function getClientActivationConnections(client) {
  const activeServices = client.services || [];
  const services = uniq([...activeServices, ...(client.plannedServices || [])]);
  const socials = socialPlatformMap(client.socialUrls);
  const needsSearch = services.includes("search-intelligence");
  const needsSocial = services.includes("content-social");
  const needsLeads = services.includes("lead-funnel");
  const needsReporting = services.includes("reporting") || needsSearch || needsLeads;
  const needsBackend = Boolean(client.railwayUrl) || services.includes("lead-funnel");
  const adsRaw = String(client.adsStatus || "").toLowerCase();
  const adsActive = ["active", "connected", "running"].includes(adsRaw);
  const adsPlanned = ["planned", "setup", "needed"].includes(adsRaw) || needsLeads;

  return [
    connectionStatus("Website", client.websiteUrl ? "connected" : "missing", {
      required: true,
      url: client.websiteUrl
    }),
    connectionStatus("GitHub", client.repo ? "connected" : "missing", {
      required: true,
      url: client.githubUrl || client.repo
    }),
    connectionStatus("Vercel", client.vercelUrl ? "connected" : "missing", {
      required: true,
      url: client.vercelUrl
    }),
    connectionStatus("Railway", client.railwayUrl ? "connected" : needsBackend ? "missing" : "not-needed", {
      required: needsBackend,
      url: client.railwayUrl
    }),
    connectionStatus("Google Business", client.googleBusinessUrl ? "connected" : needsSearch ? "access-needed" : "missing", {
      required: needsSearch,
      url: client.googleBusinessUrl
    }),
    connectionStatus("GEO Profile", needsSearch ? "missing" : "not-included", {
      required: needsSearch,
      note: needsSearch ? "Map to geo.ghostai.solutions." : "Not in current package."
    }),
    connectionStatus("Facebook", socials.facebook ? "connected" : needsSocial ? "access-needed" : "not-included", {
      required: needsSocial,
      url: socials.facebook
    }),
    connectionStatus("Instagram", socials.instagram ? "connected" : needsSocial ? "access-needed" : "not-included", {
      required: needsSocial,
      url: socials.instagram
    }),
    connectionStatus("LinkedIn", socials.linkedin ? "connected" : needsSocial ? "planned" : "not-included", {
      required: false,
      url: socials.linkedin
    }),
    connectionStatus("TikTok", socials.tiktok ? "connected" : needsSocial ? "planned" : "not-included", {
      required: false,
      url: socials.tiktok
    }),
    connectionStatus("YouTube", socials.youtube ? "connected" : needsSocial ? "planned" : "not-included", {
      required: false,
      url: socials.youtube
    }),
    connectionStatus("Ads", adsActive ? "active" : adsPlanned ? "planned" : "not-included", {
      required: adsPlanned,
      note: adsPlanned ? "Ad account access and campaign rules needed." : "Not in current package."
    }),
    connectionStatus("Analytics", client.analyticsUrl ? "connected" : needsReporting ? "missing" : "not-included", {
      required: needsReporting,
      url: client.analyticsUrl
    }),
    connectionStatus("Reporting", services.includes("reporting") ? "planned" : "not-included", {
      required: services.includes("reporting")
    }),
    connectionStatus(
      "Web Helper",
      activeServices.includes("web-helper-care") && ["web-helper-care", "growth-services"].includes(client.stage)
        ? "active"
        : services.includes("web-helper-care")
          ? "planned"
          : "not-included",
      {
      required: services.includes("web-helper-care")
      }
    )
  ];
}

function getClientActivationChecklist(client, connections) {
  const activeServices = client.services || [];
  const plannedServices = client.plannedServices || [];
  const serviceIntent = uniq([...activeServices, ...plannedServices]);
  const plannedOnly = (serviceKey) => plannedServices.includes(serviceKey) && !activeServices.includes(serviceKey);
  const requiredConnections = connections.filter((connection) => connection.required);
  const connectedRequired = requiredConnections.filter((connection) =>
    ["connected", "active", "planned"].includes(connection.status)
  );
  const blockers = requiredConnections.filter((connection) =>
    ["missing", "access-needed"].includes(connection.status)
  );
  const percent = requiredConnections.length
    ? Math.round((connectedRequired.length / requiredConnections.length) * 100)
    : 100;

  const checklist = [
    { label: "Client profile", status: client.contact ? "complete" : "missing" },
    { label: "Service map", status: serviceIntent.length ? "complete" : "missing" },
    { label: "Website build setup", status: client.websiteUrl && client.repo && client.vercelUrl ? "complete" : "blocked" },
    {
      label: "Search/GEO setup",
      status: serviceIntent.some((service) => ["search-intelligence", "local-service"].includes(service))
        ? plannedOnly("search-intelligence") || plannedOnly("local-service")
          ? "planned"
          : client.googleBusinessUrl
            ? "in-progress"
            : "blocked"
        : "not-included"
    },
    {
      label: "Social posting setup",
      status: serviceIntent.includes("content-social")
        ? plannedOnly("content-social")
          ? "planned"
          : client.socialUrls?.length
            ? "in-progress"
            : "blocked"
        : "not-included"
    },
    {
      label: "Ads setup",
      status: serviceIntent.includes("lead-funnel") || serviceIntent.includes("paid-ads")
        ? plannedOnly("lead-funnel") || plannedOnly("paid-ads")
          ? "planned"
          : client.adsStatus
            ? "in-progress"
            : "blocked"
        : "not-included"
    },
    {
      label: "Reporting setup",
      status: serviceIntent.includes("reporting")
        ? plannedOnly("reporting")
          ? "planned"
          : client.analyticsUrl
            ? "in-progress"
            : "blocked"
        : "not-included"
    },
    {
      label: "Web Helper activation",
      status: activeServices.includes("web-helper-care")
        ? ["web-helper-care", "growth-services"].includes(client.stage)
          ? "active"
          : "ready"
        : plannedServices.includes("web-helper-care")
          ? "planned"
          : "not-included"
    }
  ];

  return {
    percent,
    blockers,
    checklist,
    nextAction: blockers[0]
      ? `Connect ${blockers[0].label}.`
      : client.stage === "launch-handoff"
        ? "Activate Web Helper and handoff scope."
        : "Move client to next onboarding stage."
  };
}

function getLeadDeskAction(client) {
  const leadStage = deriveLeadStage(client);
  if (leadStage === "new-lead") {
    return "Capture discovery notes, contact path, and lead source.";
  }

  if (leadStage === "contacted-discovery") {
    return "Send project proposal and deposit invoice.";
  }

  if (leadStage === "lost-not-now") {
    return "Decide whether to revive, archive, or remove this lead.";
  }

  if (client.depositPaid || client.stage === "deposit-paid") {
    return "Queued in Web Clients for the initial website build.";
  }

  if (client.proposalSigned) {
    return "Follow up on deposit payment.";
  }

  if (client.proposalSent || client.depositInvoiceSent) {
    return "Follow up for signed project agreement.";
  }

  return "Send project proposal and deposit invoice.";
}

function getLeadDeskOpenTaskCount(client) {
  const required = [
    Boolean(client.leadSource),
    Boolean(client.contact || client.businessEmail || client.businessPhone),
    Boolean(client.notes),
    Boolean(client.proposalSent || client.proposalSigned || client.depositPaid),
    Boolean(client.depositInvoiceSent || client.depositPaid),
    Boolean(client.proposalSigned || client.depositPaid),
    Boolean(client.depositPaid || client.stage === "deposit-paid")
  ];
  return required.filter((complete) => !complete).length;
}

function buildOnboardingActivation(clients) {
  const activeClients = clients.filter(isLeadDeskClient);
  const progressTotal = 7;

  const queue = activeClients.map((client) => {
    const connections = getClientActivationConnections(client);
    const openTaskCount = getLeadDeskOpenTaskCount(client);
    return {
      id: client.id,
      clientName: client.clientName,
      stage: client.stage,
      stageLabel: CLIENT_PIPELINE_STAGES.find((stage) => stage.id === client.stage)?.label || client.stage,
      plan: client.plan,
      services: client.services,
      plannedServices: client.plannedServices,
      contact: client.contact,
      notes: client.notes,
      leadSource: client.leadSource,
      leadSourceDetail: client.leadSourceDetail,
      leadStage: deriveLeadStage(client),
      proposalSent: client.proposalSent,
      depositInvoiceSent: client.depositInvoiceSent,
      proposalSigned: client.proposalSigned,
      partnershipSigned: client.partnershipSigned,
      depositPaid: client.depositPaid,
      finalPaymentPaid: client.finalPaymentPaid,
      businessEmail: client.businessEmail,
      businessPhone: client.businessPhone,
      progress: Math.max(0, Math.round(((progressTotal - openTaskCount) / progressTotal) * 100)),
      blockerCount: openTaskCount,
      nextAction: getLeadDeskAction(client),
      blockers: [],
      checklist: [],
      connections
    };
  });

  const openTasks = queue.reduce((total, client) => total + client.blockerCount, 0);
  const sourceBreakdown = LEAD_SOURCE_DEFINITIONS.map((source) => ({
    ...source,
    count: queue.filter((client) => client.leadSource === source.id).length
  }));
  const sourcePending = queue.filter((client) => !client.leadSource).length;

  return {
    queue,
    summary: {
      activeClients: queue.filter((client) => !["deposit-paid", "lost-not-now"].includes(client.leadStage)).length,
      blockedClients: queue.filter((client) => client.blockerCount > 0).length,
      proposalsSent: queue.filter((client) => client.proposalSent || client.depositInvoiceSent || client.proposalSigned || client.depositPaid).length,
      agreementsReturned: queue.filter((client) => client.proposalSigned || client.depositPaid).length,
      depositPaid: queue.filter((client) => client.depositPaid || client.stage === "deposit-paid").length,
      openTasks,
      sourcePending,
      sourceBreakdown
    },
    actions: queue.length
      ? queue.slice(0, 6).map((client) => `${client.clientName}: ${client.nextAction}`)
      : ["Add a lead, send the project proposal and deposit invoice, then move paid clients into website build."]
  };
}

function classifyRepo(repo) {
  const name = String(repo.name || "").toLowerCase();
  const description = String(repo.description || "").toLowerCase();
  const haystack = `${name} ${description}`;
  const explicitClassifications = {
    "airtable-clone-1": { category: "Internal Data Tools", productStatus: "Internal Tool", serviceId: "operations-db" },
    anna_air: { category: "Client Websites", productStatus: "Client Tool", serviceId: "website-build" },
    ai_portfolio: { category: "Backlog / Unknown", productStatus: "Needs Review", serviceId: "incubation" },
    barbara_consulting: { category: "Client Websites", productStatus: "Client Tool", serviceId: "website-build" },
    barbara_consulting_2: { category: "Client Websites", productStatus: "Client Tool", serviceId: "website-build" },
    burchfitness: { category: "Backlog / Unknown", productStatus: "Needs Review", serviceId: "incubation" },
    consult_prototype: { category: "Prototype Websites", productStatus: "Prototype", serviceId: "website-build" },
    "design-and-renovation": { category: "Client Websites", productStatus: "Client Tool", serviceId: "website-build" },
    "e-commerce_peptides": { category: "Client Websites", productStatus: "Client Tool", serviceId: "website-build" },
    ghostdrop: { category: "Backlog / Unknown", productStatus: "Needs Review", serviceId: "incubation" },
    "ghost-enterprise-template": { category: "Backlog / Unknown", productStatus: "Needs Review", serviceId: "incubation" },
    "ghost-hvac": { category: "Sellable Software", productStatus: "Revenue Product", serviceId: "software-product" },
    "ghost-investor-ai": { category: "Investor Tools", productStatus: "Revenue Product", serviceId: "investor-intelligence" },
    ghostmain: { category: "Backlog / Unknown", productStatus: "Needs Review", serviceId: "incubation" },
    ghostmain1: { category: "Backlog / Unknown", productStatus: "Needs Review", serviceId: "incubation" },
    ghostscore: { category: "Personal Financial Tools", productStatus: "Personal Tool", serviceId: "finance-intelligence" },
    ghosttable: { category: "Internal Data Tools", productStatus: "Internal Tool", serviceId: "operations-db" },
    ghostvoicegpt: { category: "Voice Revenue Tools", productStatus: "Revenue Product", serviceId: "voice-ai" },
    "ghostvoice_orderhandler": { category: "Voice Revenue Tools", productStatus: "Revenue Product", serviceId: "voice-ai" },
    "ghost-voice-os": { category: "Voice Revenue Tools", productStatus: "Revenue Product", serviceId: "voice-ai" },
    "ghost-voice-tts": { category: "Voice Revenue Tools", productStatus: "Revenue Product", serviceId: "voice-ai" },
    "ghost-voice-tts-landing": { category: "Voice Revenue Tools", productStatus: "Revenue Product", serviceId: "voice-ai" },
    "investor-command-center": { category: "Investor Tools", productStatus: "Revenue Product", serviceId: "investor-intelligence" },
    "kaisyn-contact-card": { category: "Other Business Ventures", productStatus: "Venture Tool", serviceId: "venture-build" },
    kaisynphotography: { category: "Prototype Websites", productStatus: "Prototype", serviceId: "website-build" },
    landscape_design: { category: "Client Websites", productStatus: "Client Tool", serviceId: "website-build" },
    "mobile-detailing": { category: "Client Websites", productStatus: "Client Tool", serviceId: "website-build" },
    "nova-ceo": { category: "Executive OS", productStatus: "Strategic Platform", serviceId: "executive-ops" },
    piddy: { category: "Piddy Local AI", productStatus: "Strategic Platform", serviceId: "local-ai" },
    "piddy-growth": { category: "Piddy Local AI", productStatus: "Strategic Platform", serviceId: "local-ai" },
    "piddy-knowledge-base": { category: "Piddy Local AI", productStatus: "Strategic Platform", serviceId: "local-ai" },
    "piddy-microservices": { category: "Piddy Local AI", productStatus: "Strategic Platform", serviceId: "local-ai" },
    "price-consulting": { category: "Client Websites", productStatus: "Client Tool", serviceId: "website-build" },
    "price-consulting-site": { category: "Client Websites", productStatus: "Client Tool", serviceId: "website-build" },
    "project-vortex": { category: "Games / Experiments", productStatus: "Prototype", serviceId: "product-lab" },
    "quick-contact-card": { category: "Other Business Ventures", productStatus: "Venture Tool", serviceId: "venture-build" },
    relateos: { category: "Sellable Software", productStatus: "Client SaaS Build", serviceId: "software-product" },
    smoke_shop: { category: "Prototype Websites", productStatus: "Prototype", serviceId: "website-build" },
    stephenburch: { category: "Backlog / Unknown", productStatus: "Needs Review", serviceId: "incubation" },
    "wedding-package": { category: "Prototype Websites", productStatus: "Prototype", serviceId: "website-build" },
    wellness: { category: "Prototype Websites", productStatus: "Prototype", serviceId: "website-build" },
    "wholesale-jewelry": { category: "Prototype Websites", productStatus: "Prototype", serviceId: "website-build" }
  };

  if (explicitClassifications[name]) {
    return explicitClassifications[name];
  }

  if (haystack.includes("geo") || haystack.includes("seo") || haystack.includes("aeo")) {
    return { category: "SEO / AEO / GEO Tools", productStatus: "Revenue Product", serviceId: "search-intelligence" };
  }

  if (haystack.includes("mission") || haystack.includes("dashboard") || haystack.includes("control")) {
    return { category: "Internal Dashboards", productStatus: "Internal Tool", serviceId: "reporting" };
  }

  if (haystack.includes("agent") || haystack.includes("automation") || haystack.includes("bot")) {
    return { category: "Agent Runtimes", productStatus: "Internal Tool", serviceId: "web-helper-care" };
  }

  if (haystack.includes("lead") || haystack.includes("funnel") || haystack.includes("crm")) {
    return { category: "Lead Funnel Tools", productStatus: "Revenue Product", serviceId: "lead-funnel" };
  }

  if (haystack.includes("content") || haystack.includes("scrap") || haystack.includes("social")) {
    return { category: "Content / Social Tools", productStatus: "Internal Tool", serviceId: "content-social" };
  }

  if (haystack.includes("site") || haystack.includes("web") || haystack.includes("client")) {
    return { category: "Client Websites", productStatus: "Client Tool", serviceId: "website-build" };
  }

  return { category: "Unclassified", productStatus: "Needs Classification", serviceId: "website-build" };
}

function isRemovedClientRepo(repo) {
  const lookup = `${repo?.name || ""} ${repo?.full_name || ""}`.toLowerCase();
  const retiredClientKeys = ["arc" + "ane"];
  return retiredClientKeys.some((key) => lookup.includes(key));
}

const liveDeploymentMap = {
  "anna-air": {
    provider: "Vercel",
    url: "https://www.annasair.com",
    status: "Live custom domain",
    clientName: "Anna's Air",
    canonicalRepo: "anna_air",
    repoAliases: ["anna-air"],
    stage: "web-helper-care",
    services: ["website-build", "web-helper-care"],
    plannedServices: ["local-service"],
    finalDomainPurchased: true
  },
  "barbara-consulting": {
    provider: "Vercel",
    url: "https://www.graymatterstech.com",
    railwayUrl: "https://barbaraconsulting-production.up.railway.app",
    databaseAttached: true,
    status: "Live custom domain",
    clientName: "Gray Matters Tech",
    canonicalRepo: "barbara_consulting",
    repoAliases: ["barbara-consulting", "barbara_consulting_2"],
    stage: "web-helper-care",
    services: ["website-build", "web-helper-care"],
    plannedServices: ["search-intelligence"],
    finalDomainPurchased: true
  },
  "design-and-renovation": {
    provider: "Vercel",
    url: "https://www.designhavenbuild.com",
    status: "Live custom domain",
    clientName: "Design Haven Build",
    canonicalRepo: "design-and-renovation",
    repoAliases: ["design_and_renovation"],
    stage: "web-helper-care",
    services: ["website-build", "web-helper-care"],
    plannedServices: ["search-intelligence"],
    finalDomainPurchased: true
  },
  "ghost-alpha-terminal": {
    provider: "Vercel",
    url: "https://www.alphaghost.org",
    railwayUrl: "https://ghostalphaterminal-production.up.railway.app",
    status: "Live custom domain",
    clientName: "Alpha Ghost",
    canonicalRepo: "ghost-alpha-terminal",
    stage: "growth-services",
    services: ["website-build", "web-helper-care", "software-tool"],
    plannedServices: ["search-intelligence"],
    finalDomainPurchased: true,
    notes: "Stock market intelligence and trading bot property."
  },
  ghostaisolutions: {
    provider: "Vercel",
    url: "https://www.ghostai.solutions",
    railwayUrl: "https://ghostaisolutions-production.up.railway.app",
    databaseAttached: true,
    status: "Live custom domain",
    clientName: "Ghost AI Solutions",
    canonicalRepo: "ghostaisolutions",
    stage: "growth-services",
    services: ["website-build", "web-helper-care", "search-intelligence", "lead-funnel", "content-social"],
    finalDomainPurchased: true,
    notes: "Primary Ghost AI brand and lead-intelligence backend."
  },
  ghostcrm: {
    provider: "Vercel",
    url: "https://www.ghostcrm.ai",
    railwayUrl: "https://ghostcrm-core-production.up.railway.app",
    databaseAttached: true,
    status: "Live custom domain",
    clientName: "GhostCRM",
    canonicalRepo: "ghostcrm",
    stage: "paused-archived",
    services: ["website-build"],
    finalDomainPurchased: true,
    notes: "Dealership CRM property that is currently paused."
  },
  "i-need-to-make-a-quick": {
    provider: "Vercel",
    url: "https://www.stephenburch.app",
    status: "Live custom domain",
    clientName: "Stephen Burch",
    canonicalRepo: "i-need-to-make-a-quick",
    stage: "web-helper-care",
    services: ["website-build", "web-helper-care"],
    plannedServices: ["search-intelligence"],
    finalDomainPurchased: true,
    notes: "Personal digital business card."
  },
  "keisha-law": {
    provider: "Vercel",
    url: "https://keisha-law.vercel.app",
    status: "Live preview domain",
    clientName: "Keisha Law",
    canonicalRepo: "keisha-law",
    stage: "web-helper-care",
    services: ["website-build", "web-helper-care"],
    plannedServices: ["search-intelligence"],
    finalDomainPurchased: false,
    notes: "Website is launched and ready for SEO/monthly maintenance contract review."
  },
  "mobile-detailing": {
    provider: "Vercel",
    url: "https://mobile-detailing-sigma.vercel.app",
    status: "Live preview domain",
    clientName: "Mobile Detailing",
    canonicalRepo: "mobile-detailing",
    stage: "growth-services",
    services: ["website-build", "web-helper-care", "search-intelligence", "content-social"],
    finalDomainPurchased: false,
    partnershipSigned: true,
    notes: "Partner site is live. Buy the final custom domain, then continue SEO and social management."
  },
  "bougie-and-company": {
    provider: "Vercel",
    url: "https://www.bougieandcompany.com",
    vercelUrl: "https://vercel.com/burchdads-projects/bougie-and-company-oy7t",
    railwayUrl: "https://railway.com/project/3032a264-caf7-4d92-a0f8-406d00cd395c",
    status: "Live custom domain",
    clientName: "Bougie and Company",
    canonicalRepo: "bougie_and_company",
    stage: "web-helper-care",
    services: ["website-build", "web-helper-care", "ecommerce"],
    plannedServices: ["search-intelligence"],
    finalDomainPurchased: true,
    socialUrls: [
      "https://www.facebook.com/people/Bougie-Company/61585356908803/",
      "https://www.instagram.com/bougieandcompanytx/",
      "https://www.tiktok.com/@bougieandcompany"
    ],
    notes: "Website finished, domain wrapped, final website payment accepted. Web Helper care is active; SEO/monthly contract is the next service step."
  },
  "peptides-ecommerce": {
    provider: "Vercel",
    url: "https://www.peppersandvibes.com",
    railwayUrl: "https://e-commercepeptides-production.up.railway.app",
    databaseAttached: true,
    status: "Live custom domain",
    clientName: "Peppers and Vibes",
    canonicalRepo: "e-commerce_peptides",
    repoAliases: ["peptides-ecommerce"],
    stage: "web-helper-care",
    services: ["website-build", "web-helper-care", "ecommerce"],
    plannedServices: ["search-intelligence"],
    finalDomainPurchased: true
  },
  "price-consulting-site": {
    provider: "Vercel",
    url: "https://price-consulting-site.vercel.app",
    railwayUrl: "https://price-consulting-site-production.up.railway.app",
    databaseAttached: true,
    status: "Live preview domain",
    clientName: "Price Consulting",
    canonicalRepo: "price-consulting-site",
    repoAliases: ["price-consulting"],
    stage: "web-helper-care",
    services: ["website-build", "web-helper-care"],
    plannedServices: ["search-intelligence"],
    finalDomainPurchased: false,
    notes: "Website is launched and ready for SEO/monthly maintenance contract review."
  },
  "consult-prototype": {
    provider: "Railway",
    url: "https://consultprototype-production.up.railway.app",
    railwayUrl: "https://consultprototype-production.up.railway.app",
    databaseAttached: true,
    status: "Live Railway app",
    canonicalRepo: "consult_prototype",
    category: "Prototype Websites",
    services: ["website-build"],
    finalDomainPurchased: false
  },
  "ghost-hvac": {
    provider: "Railway",
    url: "https://ghost-hvac-production.up.railway.app",
    railwayUrl: "https://ghost-hvac-production.up.railway.app",
    status: "Live Railway app",
    canonicalRepo: "ghost-hvac",
    category: "Sellable Software",
    services: ["software-product"]
  },
  "ghost-mission-control": {
    provider: "Railway",
    url: "https://ghostmissioncontrol-production.up.railway.app",
    railwayUrl: "https://ghostmissioncontrol-production.up.railway.app",
    status: "Live Railway backend",
    canonicalRepo: "ghost_mission_control",
    category: "Internal Dashboards",
    services: ["reporting", "web-helper-care"]
  },
  "ghost-visibility-command": {
    provider: "Railway",
    url: "https://ghost-visibility-command-production.up.railway.app",
    railwayUrl: "https://ghost-visibility-command-production.up.railway.app",
    databaseAttached: true,
    status: "Live Railway app",
    canonicalRepo: "ghost-visibility-command",
    category: "Internal Dashboards",
    services: ["search-intelligence", "reporting"]
  },
  "ghost-voice-tts": {
    provider: "Railway",
    url: "https://ghost-voice-tts-production.up.railway.app",
    railwayUrl: "https://ghost-voice-tts-production.up.railway.app",
    status: "Live Railway app",
    canonicalRepo: "ghost-voice-tts",
    category: "Voice Revenue Tools",
    services: ["voice-ai"]
  },
  "ghostcrm-core": {
    provider: "Railway",
    url: "https://ghostcrm-core-production.up.railway.app",
    railwayUrl: "https://ghostcrm-core-production.up.railway.app",
    databaseAttached: true,
    status: "Live Railway backend",
    canonicalRepo: "ghostcrm-core",
    category: "Lead Funnel Tools",
    services: ["lead-funnel"]
  },
  piddy: {
    provider: "Railway",
    url: "https://piddy-production.up.railway.app",
    railwayUrl: "https://piddy-production.up.railway.app",
    status: "Live Railway app",
    canonicalRepo: "Piddy",
    repoAliases: ["piddy"],
    category: "Piddy Local AI",
    services: ["local-ai"]
  },
  "piddy-growth": {
    provider: "Railway",
    url: "https://piddy-production-4103.up.railway.app",
    railwayUrl: "https://piddy-production-4103.up.railway.app",
    status: "Live Railway app",
    canonicalRepo: "piddy-growth",
    category: "Piddy Local AI",
    services: ["local-ai"]
  },
  "piddy-microservices": {
    provider: "Railway",
    url: "https://piddy-production-485b.up.railway.app",
    railwayUrl: "https://piddy-production-485b.up.railway.app",
    status: "Live Railway app",
    canonicalRepo: "piddy-microservices",
    category: "Piddy Local AI",
    services: ["local-ai"]
  },
  relateos: {
    provider: "Railway",
    url: "https://relateos-production.up.railway.app",
    railwayUrl: "https://relateos-production.up.railway.app",
    databaseAttached: true,
    status: "Live Railway app",
    canonicalRepo: "relateos",
    category: "Sellable Software",
    services: ["software-product"]
  }
};

const liveDeploymentAliases = Object.entries(liveDeploymentMap).reduce((aliases, [key, deployment]) => {
  aliases[key] = deployment;
  aliases[key.replace(/-/g, "_")] = deployment;
  aliases[key.replace(/_/g, "-")] = deployment;
  (deployment.repoAliases || []).forEach((alias) => {
    aliases[String(alias).toLowerCase()] = deployment;
  });
  return aliases;
}, {});

function getRepoDeployment(repo) {
  const name = String(repo?.name || "").toLowerCase();
  return liveDeploymentAliases[name] || liveDeploymentAliases[name.replace(/_/g, "-")] || liveDeploymentAliases[name.replace(/-/g, "_")] || null;
}

function getSeededClientProfiles() {
  const seen = new Set();
  return Object.values(liveDeploymentMap)
    .filter((deployment) => {
      if (!deployment.clientName) {
        return false;
      }
      const canonicalRepo = deployment.canonicalRepo || deployment.url;
      if (seen.has(canonicalRepo)) {
        return false;
      }
      seen.add(canonicalRepo);
      return true;
    })
    .map((deployment) =>
      normalizeClient({
        id: slugify(deployment.clientName || deployment.canonicalRepo),
        clientName: deployment.clientName || deployment.canonicalRepo,
        websiteUrl: deployment.url,
        vercelUrl: deployment.vercelUrl || deployment.url,
        railwayUrl: deployment.railwayUrl,
        repo: `${GITHUB_OWNER}/${deployment.canonicalRepo}`,
        stage: deployment.stage || "web-helper-care",
        services: deployment.services || ["website-build", "web-helper-care"],
        plannedServices: deployment.plannedServices || [],
        finalDomainPurchased: deployment.finalDomainPurchased,
        clientDetailsPending: deployment.clientDetailsPending,
        partnershipSigned: deployment.partnershipSigned,
        proposalSigned: deployment.proposalSigned,
        depositPaid: deployment.depositPaid,
        finalPaymentPaid: deployment.finalPaymentPaid,
        googleBusinessUrl: deployment.googleBusinessUrl,
        socialUrls: deployment.socialUrls,
        contact: deployment.contact,
        businessEmail: deployment.businessEmail,
        businessPhone: deployment.businessPhone,
        plan: deployment.plan || "Launch + Care",
        notes: deployment.notes || "",
        source: "deployment-map"
      })
    )
    .filter(Boolean);
}

function getToolNeedsActions(tool) {
  const actions = [];
  if (tool.productStatus === "Needs Classification") {
    actions.push("Classify this repo into a product, client, prototype, or archive bucket.");
  }
  if (!tool.deploymentUrl && ["Client Tool", "Revenue Product", "Strategic Platform"].includes(tool.productStatus)) {
    actions.push("Attach a live URL, Vercel project, Railway service, or mark it intentionally internal.");
  }
  if (tool.finalDomainPurchased === false) {
    actions.push("Buy or connect the final client domain for the launched preview-domain site.");
  }
  if (tool.clientDetailsPending) {
    actions.push("Collect final client details before launching automation or search work.");
  }
  if (tool.deploymentUrl && tool.category === "Client Websites") {
    actions.push("Attach Web Helper memory and monthly scope rules.");
  }
  if (tool.deploymentUrl && !tool.healthCheckUrl) {
    actions.push("Add a page-specific health check path if the root URL is not enough.");
  }
  return actions;
}

function buildToolActionBuckets(tools) {
  const bucketDefinitions = [
    {
      id: "final-domain-needed",
      label: "Final Domain Needed",
      tone: "yellow",
      items: tools.filter((tool) => tool.finalDomainPurchased === false)
    },
    {
      id: "client-details-pending",
      label: "Client Details Pending",
      tone: "yellow",
      items: tools.filter((tool) => tool.clientDetailsPending)
    },
    {
      id: "needs-classification",
      label: "Needs Classification",
      tone: "yellow",
      items: tools.filter((tool) => tool.productStatus === "Needs Classification")
    },
    {
      id: "needs-live-link",
      label: "Needs Live Link",
      tone: "blue",
      items: tools.filter(
        (tool) => !tool.deploymentUrl && ["Client Tool", "Revenue Product", "Strategic Platform"].includes(tool.productStatus)
      )
    },
    {
      id: "web-helper-ready",
      label: "Web Helper Ready",
      tone: "green",
      items: tools.filter((tool) => tool.deploymentUrl && tool.category === "Client Websites")
    },
    {
      id: "revenue-candidates",
      label: "Revenue Candidates",
      tone: "green",
      items: tools.filter((tool) => ["Revenue Product", "Strategic Platform"].includes(tool.productStatus))
    }
  ];

  return bucketDefinitions.map((bucket) => ({
    id: bucket.id,
    label: bucket.label,
    tone: bucket.tone,
    count: bucket.items.length,
    items: bucket.items.slice(0, 8).map((tool) => ({
      id: tool.id,
      name: tool.name,
      clientName: tool.clientName || "",
      status: tool.productStatus,
      serviceId: tool.serviceId,
      deploymentUrl: tool.deploymentUrl || "",
      reason: getToolNeedsActions(tool)[0] || "Ready for operator mapping."
    }))
  }));
}

async function fetchGitHubRepos(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && githubRepoCache.repos.length && now - githubRepoCache.generatedAt < GITHUB_REPO_CACHE_TTL_MS) {
    return githubRepoCache.repos;
  }

  if (!forceRefresh && githubRepoCache.pending) {
    return githubRepoCache.pending;
  }

  githubRepoCache.lastAttemptAt = Date.now();
  const headers = {
    "User-Agent": "GhostMissionControl/1.0 (+tool-registry)",
    Accept: "application/vnd.github+json"
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  githubRepoCache.pending = (async () => {
    const repos = [];
    const seenIds = new Set();
    const baseUrl = GITHUB_TOKEN
      ? "https://api.github.com/user/repos"
      : `https://api.github.com/users/${encodeURIComponent(GITHUB_OWNER)}/repos`;

    for (let page = 1; page <= GITHUB_MAX_REPO_PAGES; page += 1) {
      const params = new URLSearchParams({
        per_page: "100",
        page: String(page),
        sort: "updated"
      });

      if (GITHUB_TOKEN) {
        params.set("affiliation", "owner,collaborator,organization_member");
        params.set("visibility", "all");
      }

      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        method: "GET",
        headers
      });

      if (!response.ok) {
        throw new Error(`GitHub repo request failed (${response.status})`);
      }

      const pageRepos = await response.json();
      if (!Array.isArray(pageRepos) || pageRepos.length === 0) {
        break;
      }

      pageRepos
        .filter((repo) => !GITHUB_TOKEN || repo?.owner?.login?.toLowerCase() === GITHUB_OWNER.toLowerCase())
        .forEach((repo) => {
          if (!seenIds.has(repo.id)) {
            seenIds.add(repo.id);
            repos.push(repo);
          }
        });

      if (pageRepos.length < 100) {
        break;
      }
    }

    return repos;
  })()
    .then((repos) => {
      githubRepoCache.repos = repos;
      githubRepoCache.generatedAt = Date.now();
      githubRepoCache.lastSuccessAt = githubRepoCache.generatedAt;
      githubRepoCache.lastError = "";
      githubRepoCache.pending = null;
      return githubRepoCache.repos;
    })
    .catch((error) => {
      githubRepoCache.pending = null;
      githubRepoCache.lastError = String(error?.message || error || "unknown error");
      console.warn(`Unable to sync GitHub repos: ${githubRepoCache.lastError}`);
      return githubRepoCache.repos;
    });

  return githubRepoCache.pending;
}

async function buildToolRegistry(forceRefresh = false) {
  const repos = await fetchGitHubRepos(forceRefresh);
  const tools = repos.filter((repo) => !isRemovedClientRepo(repo)).map((repo) => {
    const classification = classifyRepo(repo);
    const deployment = getRepoDeployment(repo);
    const tool = {
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || "No description set.",
      url: repo.html_url,
      private: Boolean(repo.private),
      archived: Boolean(repo.archived),
      fork: Boolean(repo.fork),
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
      defaultBranch: repo.default_branch || "main",
      visibility: repo.visibility || (repo.private ? "private" : "public"),
      openIssues: Number(repo.open_issues_count || 0),
      topics: Array.isArray(repo.topics) ? repo.topics : [],
      language: repo.language || "n/a",
      category: classification.category,
      productStatus: classification.productStatus,
      serviceId: classification.serviceId,
      deployment: deployment?.provider || "Unlinked",
      deploymentUrl: deployment?.url || "",
      deploymentStatus: deployment?.status || "Unlinked",
      clientName: deployment?.clientName || "",
      clientId: deployment?.clientName ? slugify(deployment.clientName) : "",
      finalDomainPurchased: deployment?.finalDomainPurchased ?? null,
      clientDetailsPending: Boolean(deployment?.clientDetailsPending),
      healthCheckUrl: deployment?.healthCheckUrl || deployment?.url || "",
      notes: deployment?.notes || "",
      health: repo.archived ? "archived" : deployment ? "live" : "needs-review"
    };
    return {
      ...tool,
      needsActions: getToolNeedsActions(tool)
    };
  });

  const categoryCounts = tools.reduce((counts, tool) => {
    counts[tool.category] = (counts[tool.category] || 0) + 1;
    return counts;
  }, {});
  const actionBuckets = buildToolActionBuckets(tools);

  return {
    owner: GITHUB_OWNER,
    generatedAt: new Date().toISOString(),
    sync: {
      tokenConfigured: Boolean(GITHUB_TOKEN),
      owner: GITHUB_OWNER,
      maxPages: GITHUB_MAX_REPO_PAGES,
      privateRepoAccess: Boolean(GITHUB_TOKEN),
      lastSuccessAt: toIsoOrNull(githubRepoCache.lastSuccessAt),
      lastError: githubRepoCache.lastError || null
    },
    summary: {
      totalTools: tools.length,
      activeTools: tools.filter((tool) => !tool.archived).length,
      privateTools: tools.filter((tool) => tool.private).length,
      publicTools: tools.filter((tool) => !tool.private).length,
      liveDeployments: tools.filter((tool) => tool.deploymentUrl).length,
      archivedTools: tools.filter((tool) => tool.archived).length,
      needsClassification: tools.filter((tool) => tool.category === "Unclassified").length,
      revenueProducts: tools.filter((tool) => tool.productStatus === "Revenue Product").length,
      categoryCounts
    },
    tools,
    actionBuckets,
    actions: [
      `Set GITHUB_OWNER=${GITHUB_OWNER} and GITHUB_TOKEN in Railway/Vercel backend env for private repo access.`,
      "Use a fine-grained GitHub token with repository metadata/content read access for the repos agents can inspect.",
      "Classify unassigned repos into services.",
      "Attach live URLs and deployment providers.",
      "Map each production tool to a client or internal owner.",
      "Register APIs exposed by service tools.",
      "Add health checks for active revenue tools."
    ]
  };
}

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

function readJsonBody(request, maxBytes = 1_000_000) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > maxBytes) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON payload"));
      }
    });

    request.on("error", reject);
  });
}

function hasAiProviderConfigured(provider) {
  if (provider === "openai") {
    return Boolean(OPENAI_API_KEY);
  }

  if (provider === "anthropic") {
    return Boolean(ANTHROPIC_API_KEY);
  }

  if (provider === "openrouter") {
    return Boolean(OPENROUTER_API_KEY);
  }

  return false;
}

function getConfiguredAiProviders() {
  const providers = [];
  if (hasAiProviderConfigured("openai")) {
    providers.push("openai");
  }

  if (hasAiProviderConfigured("anthropic")) {
    providers.push("anthropic");
  }

  if (hasAiProviderConfigured("openrouter")) {
    providers.push("openrouter");
  }

  return providers;
}

function withAiTimeout(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer)
  };
}

function sanitizeAiGuidance(raw) {
  const fallback = {
    rationaleAdditions: [],
    autoActionsAdditions: [],
    growthOpportunities: [],
    confidenceNote: "AI guidance unavailable. Using deterministic mission planning.",
    provider: "none"
  };

  if (!raw || typeof raw !== "object") {
    return fallback;
  }

  const takeList = (value) =>
    (Array.isArray(value) ? value : [])
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .slice(0, 3);

  return {
    rationaleAdditions: takeList(raw.rationaleAdditions),
    autoActionsAdditions: takeList(raw.autoActionsAdditions),
    growthOpportunities: takeList(raw.growthOpportunities),
    confidenceNote: String(raw.confidenceNote || fallback.confidenceNote).trim(),
    provider: String(raw.provider || fallback.provider)
  };
}

async function callOpenAiGuidance(payload) {
  const timeout = withAiTimeout(AI_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: timeout.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are Ghost Mission Control AI copilot. Return only valid JSON with keys: rationaleAdditions (array of strings), autoActionsAdditions (array of strings), growthOpportunities (array of strings), confidenceNote (string). Keep concise and production-safe."
          },
          {
            role: "user",
            content: JSON.stringify(payload)
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed (${response.status})`);
    }

    const completion = await response.json();
    const content = completion?.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    return sanitizeAiGuidance({ ...parsed, provider: "openai" });
  } finally {
    timeout.clear();
  }
}

async function callAnthropicGuidance(payload) {
  const timeout = withAiTimeout(AI_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: timeout.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 500,
        temperature: 0.2,
        system:
          "You are Ghost Mission Control AI copilot. Return only valid JSON with keys: rationaleAdditions (array of strings), autoActionsAdditions (array of strings), growthOpportunities (array of strings), confidenceNote (string).",
        messages: [
          {
            role: "user",
            content: JSON.stringify(payload)
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic request failed (${response.status})`);
    }

    const completion = await response.json();
    const text = (completion?.content || [])
      .filter((item) => item?.type === "text")
      .map((item) => item.text)
      .join("\n");
    const parsed = JSON.parse(text || "{}");
    return sanitizeAiGuidance({ ...parsed, provider: "anthropic" });
  } finally {
    timeout.clear();
  }
}

async function callOpenRouterGuidance(payload) {
  const timeout = withAiTimeout(AI_REQUEST_TIMEOUT_MS);

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "X-Title": OPENROUTER_APP_NAME
    };

    if (OPENROUTER_HTTP_REFERER) {
      headers["HTTP-Referer"] = OPENROUTER_HTTP_REFERER;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: timeout.signal,
      headers,
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are Ghost Mission Control AI copilot. Return only valid JSON with keys: rationaleAdditions (array of strings), autoActionsAdditions (array of strings), growthOpportunities (array of strings), confidenceNote (string). Keep concise and production-safe."
          },
          {
            role: "user",
            content: JSON.stringify(payload)
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter request failed (${response.status})`);
    }

    const completion = await response.json();
    const content = completion?.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    return sanitizeAiGuidance({ ...parsed, provider: "openrouter" });
  } finally {
    timeout.clear();
  }
}

async function getAiGuidance(command, siteId, plan) {
  const providers = getConfiguredAiProviders();
  if (!providers.length) {
    return sanitizeAiGuidance(null);
  }

  const requestedOrder =
    AI_PROVIDER === "openai" || AI_PROVIDER === "anthropic" || AI_PROVIDER === "openrouter"
      ? [AI_PROVIDER]
      : providers;
  const providerOrder = [...requestedOrder, ...providers.filter((provider) => !requestedOrder.includes(provider))];

  const promptPayload = {
    command,
    siteId,
    plan: {
      category: plan.category,
      summary: plan.summary,
      objective: plan.objective,
      priority: plan.priority,
      owners: plan.owners,
      systemActions: plan.systemActions
    },
    constraints: {
      maxRationaleAdditions: 3,
      maxAutoActionsAdditions: 3,
      maxGrowthOpportunities: 3
    }
  };

  let lastError = null;

  for (const provider of providerOrder) {
    try {
      if (provider === "openai" && hasAiProviderConfigured("openai")) {
        return await callOpenAiGuidance(promptPayload);
      }

      if (provider === "anthropic" && hasAiProviderConfigured("anthropic")) {
        return await callAnthropicGuidance(promptPayload);
      }

      if (provider === "openrouter" && hasAiProviderConfigured("openrouter")) {
        return await callOpenRouterGuidance(promptPayload);
      }
    } catch (error) {
      lastError = error;
    }
  }

  return sanitizeAiGuidance({
    confidenceNote: `AI guidance unavailable (${String(lastError?.message || "provider error")}). Using deterministic mission planning.`
  });
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

function joinClientNames(clients, fallback = "current live website clients") {
  const names = (clients || []).map((client) => client.clientName).filter(Boolean);
  return names.length ? names.join(", ") : fallback;
}

function getWebHelperHandoffClients() {
  const handoffClients = getCurrentWebsiteWebHelperClients().filter((client) => client.stage === WEB_HELPER_HANDOFF_STAGE);
  return handoffClients.length ? handoffClients : getCurrentWebsiteWebHelperClients();
}

function isWebHelperHandoffCommand(command) {
  return String(command || "").toLowerCase().includes("handoff");
}

function buildWebHelperHandoffDispatchTemplates() {
  const clients = getWebHelperHandoffClients();
  const missingContacts = clients.filter((client) => !client.contact && !client.businessEmail);
  const missingDomains = clients.filter((client) => client.finalDomainPurchased === false);
  const missingAuthority = clients.filter((client) =>
    !client.googleBusinessUrl &&
    uniq([...(client.services || []), ...(client.plannedServices || [])]).some((service) => ["search-intelligence", "local-service"].includes(service))
  );

  return [
    {
      action: "ensure_web_helper_memory",
      target: joinClientNames(clients),
      agent: "Web Helper Agent",
      detail: "Confirm every handoff client has activated helper memory, repo map, scope rules, and update history."
    },
    {
      action: "collect_handoff_contacts",
      target: joinClientNames(missingContacts, "handoff approval contacts"),
      agent: "Automation Supervisor",
      detail: "Collect primary contact name, approval email, and urgent launch phone for each handoff client."
    },
    {
      action: "confirm_recurring_service_contracts",
      target: joinClientNames(clients),
      agent: "Automation Supervisor",
      detail: "Mark monthly maintenance, SEO/AEO/GEO, social, and other recurring-service contracts with billing-safe boundaries and owner approval policy."
    },
    {
      action: "resolve_final_domains",
      target: joinClientNames(missingDomains, "clients already on final domains"),
      agent: "Launch Operator",
      detail: "Prepare final-domain purchase or DNS tasks for launched clients still operating on preview domains."
    },
    {
      action: "connect_local_authority_profiles",
      target: joinClientNames(missingAuthority, "clients without local authority gaps"),
      agent: "Search Intelligence Agent",
      detail: "Queue Google Business Profile and GEO authority mapping wherever local search or GEO service is included."
    },
    {
      action: "schedule_first_health_checks",
      target: joinClientNames(clients),
      agent: "Monitoring Agent",
      detail: "Create the first post-handoff health check covering uptime, links, forms, content drift, and owner-visible notes."
    }
  ];
}

function buildDispatchActions(command, category, priority, siteId) {
  const normalizedPriority = normalizePriority(priority);
  const normalizedCommand = String(command || "").toLowerCase();

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
    web_helper: [
      {
        action: "classify_client_request",
        target: "client-update-inbox",
        agent: "Web Helper Agent",
        detail: "Identify whether the client request is content, bug fix, feature, billing, or escalation."
      },
      {
        action: "check_scope_rules",
        target: "maintenance-plan-policy",
        agent: "Automation Supervisor",
        detail: "Compare request against allowed maintenance scope and approval thresholds."
      },
      {
        action: "prepare_site_change",
        target: "client-website-workspace",
        agent: "Web Helper Agent",
        detail: "Prepare a review-ready code or content change with test notes."
      },
      {
        action: "draft_client_reply",
        target: "client-response-thread",
        agent: "Web Helper Agent",
        detail: "Write a clear client update in the studio voice and route risky work for owner approval."
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

  const selected = category === "web_helper" && normalizedCommand.includes("handoff")
    ? buildWebHelperHandoffDispatchTemplates()
    : templates[category] || templates.general;

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
    },
    {
      match: ["web helper", "handoff", "client update", "website update", "change hours", "broken link", "content edit", "post-launch"],
      payload: {
        category: "web_helper",
        summary: "Web Helper directive accepted. Client request triage and review-ready site change workflow are queued.",
        priority: "P2 High Value",
        objective: "Route a post-launch client website request through scope, code/content prep, approval, and client reply.",
        owners: ["Web Helper Agent", "Automation Supervisor"],
        systemActions: [
          "Identify the client site and request category.",
          "Check maintenance scope and approval rules before code work.",
          "Prepare the safest possible site change for owner review.",
          "Draft a client-facing response in the studio voice."
        ],
        autoActions: [
          "Opened web helper request workflow for " + siteLabel + ".",
          "Prepared approval gate before deployment."
        ],
        expectedImpact: "Faster post-launch support without mixing client context or skipping owner approvals."
      }
    }
  ];

  const matchedPlan =
    plans.find((plan) => plan.payload.category === "web_helper" && plan.match.some((term) => normalized.includes(term))) ||
    plans.find((plan) => plan.match.some((term) => normalized.includes(term)));

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

    sendJson(request, response, 200, {
      ok: true,
      service: "ghost-mission-control",
      monitoredSites: monitoringCache.snapshot?.configuredSites || staticMonitoredSites.length
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/ai/status") {
    const providers = getConfiguredAiProviders();
    sendJson(request, response, 200, {
      enabled: providers.length > 0,
      preferredProvider: AI_PROVIDER,
      configuredProviders: providers,
      models: {
        openai: OPENAI_MODEL,
        anthropic: ANTHROPIC_MODEL,
        openrouter: OPENROUTER_MODEL
      }
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/integrations/vercel") {
    const forceRefresh = url.searchParams.get("refresh") === "true";
    getVercelMonitoredSites(forceRefresh)
      .then(() => {
        sendJson(request, response, 200, getVercelIntegrationStatus());
      })
      .catch((error) => {
        sendJson(request, response, 500, {
          error: "Unable to load Vercel integration status",
          detail: String(error?.message || error)
        });
      });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/sites") {
    getMissionSnapshot(url.searchParams.get("refresh") === "true")
      .then((snapshot) => {
        sendJson(request, response, 200, {
          generatedAt: snapshot.generatedAt,
          configuredSites: snapshot.configuredSites,
          websites: snapshot.websites.map((site) => ({
            id: site.id,
            name: site.name,
            domain: site.domain,
            status: site.status,
            pageCount: site.pages.length
          }))
        });
      })
      .catch((error) => {
        sendJson(request, response, 500, {
          error: "Unable to generate monitored site list",
          detail: String(error?.message || error)
        });
      });

    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/snapshot") {
    getMissionSnapshot(url.searchParams.get("refresh") === "true")
      .then((snapshot) => {
        sendJson(request, response, 200, snapshot);
      })
      .catch((error) => {
        sendJson(request, response, 500, {
          error: "Unable to generate mission snapshot",
          detail: String(error?.message || error)
        });
      });

    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/clients") {
    syncClientStore(url.searchParams.get("refresh") === "true")
      .then((storageRead) => {
        const clients = getAllClients();
        sendJson(request, response, 200, {
          generatedAt: new Date().toISOString(),
          summary: summarizeClients(clients),
          pipelineStages: CLIENT_PIPELINE_STAGES,
          dataHealth: getClientDataHealth(clients),
          clients: clients.map((client) => ({
            ...client,
            actions: getClientDerivedActions(client)
          })),
          storage: getClientStorageStatus(storageRead),
          actions: [
            "Onboard one real client and connect website, repo, plan, and services.",
            "Attach Web Helper care after completion payment.",
            "Map SEO/AEO/GEO clients to geo.ghostai.solutions.",
            "Define approval and monthly scope rules per client."
          ]
        });
      })
      .catch((error) => {
        sendJson(request, response, 500, {
          error: "Unable to load clients",
          detail: String(error?.message || error)
        });
      });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/client-health") {
    syncClientStore(url.searchParams.get("refresh") === "true")
      .then((storageRead) => {
        const clients = getAllClients();
        sendJson(request, response, 200, {
          ok: true,
          generatedAt: new Date().toISOString(),
          storage: getClientStorageStatus(storageRead),
          dataHealth: getClientDataHealth(clients)
        });
      })
      .catch((error) => {
        sendJson(request, response, 500, {
          error: "Unable to load client data health",
          detail: String(error?.message || error)
        });
      });
    return;
  }

  if (request.method === "POST" && url.pathname === "/mission/clients") {
    readJsonBody(request)
      .then(async (payload) => {
        await syncClientStore(true);
        const client = buildClientRecord(payload);
        if (!client) {
          sendJson(request, response, 400, { error: "Client name is required" });
          return;
        }

        const existing = runtimeClients.find((entry) => entry.id === client.id);
        const savedClient = upsertRuntimeClient({
          ...(existing || {}),
          ...client,
          createdAt: existing?.createdAt || client.createdAt,
          updatedAt: new Date().toISOString()
        });
        persistRuntimeClients();
        let storageWrite = null;
        const databaseWrite = await persistRuntimeClientToPostgres(savedClient || client);
        storageWrite = databaseWrite;
        if (!databaseWrite.ok) {
          try {
            const repoWrite = await persistRuntimeClientsToGitHubStore();
            storageWrite = { ...repoWrite, fallbackFrom: databaseWrite };
          } catch (error) {
            runtimeClientsRepoLastError = String(error?.message || error);
            storageWrite = {
              ok: false,
              target: "client-store",
              error: runtimeClientsRepoLastError,
              fallbackFrom: databaseWrite,
              fallbackWrite: { ok: false, target: "github", error: runtimeClientsRepoLastError }
            };
          }
        }

        const clients = getAllClients();
        sendJson(request, response, 201, {
          created: savedClient || client,
          summary: summarizeClients(clients),
          pipelineStages: CLIENT_PIPELINE_STAGES,
          dataHealth: getClientDataHealth(clients),
          storage: getClientStorageStatus(storageWrite),
          clients: clients.map((entry) => ({
            ...entry,
            actions: getClientDerivedActions(entry)
          }))
        });
      })
      .catch((error) => {
        sendJson(request, response, 400, { error: String(error?.message || error || "Invalid JSON payload") });
      });
    return;
  }

  if (request.method === "POST" && url.pathname === "/mission/clients/archive") {
    readJsonBody(request)
      .then(async (payload) => {
        await syncClientStore(true);
        const clientId = canonicalClientId(payload.id || payload.clientId);
        const archiveStage = normalizeClientStage(payload.stage || "completed-archived");
        const client = getAllClients().find((entry) => canonicalClientId(entry.id) === clientId);
        if (!client) {
          sendJson(request, response, 404, { error: "Client not found" });
          return;
        }

        const archivedClient = buildClientRecord({
          ...client,
          stage: archiveStage,
          finalPaymentPaid: archiveStage === "completed-archived" ? client.finalPaymentPaid || Boolean(payload.finalPaymentPaid) : client.finalPaymentPaid,
          notes: [client.notes, payload.note || "Archived from Mission Control."].filter(Boolean).join("\n"),
          updatedAt: new Date().toISOString()
        });
        const savedClient = upsertRuntimeClient(archivedClient);
        persistRuntimeClients();
        const storageWrite = await persistClientMutationFallback(await persistRuntimeClientToPostgres(savedClient || archivedClient));
        sendJson(request, response, 200, buildClientResponsePayload(storageWrite, 200, {
          archived: savedClient || archivedClient,
          message: `${client.clientName} moved to ${archiveStage}.`
        }));
      })
      .catch((error) => {
        sendJson(request, response, 400, { error: String(error?.message || error || "Invalid JSON payload") });
      });
    return;
  }

  if (request.method === "POST" && url.pathname === "/mission/clients/delete") {
    readJsonBody(request)
      .then(async (payload) => {
        await syncClientStore(true);
        const clientId = canonicalClientId(payload.id || payload.clientId);
        const client = getAllClients().find((entry) => canonicalClientId(entry.id) === clientId);
        if (!client) {
          sendJson(request, response, 404, { error: "Client not found" });
          return;
        }

        const removed = removeRuntimeClient(clientId);
        const databaseWrite = await deleteRuntimeClientFromPostgres(clientId);
        const storageWrite = await persistClientMutationFallback(databaseWrite);
        sendJson(request, response, 200, buildClientResponsePayload(storageWrite, 200, {
          deleted: { id: client.id, clientName: client.clientName, runtimeRemoved: removed },
          message: `${client.clientName} removed from Mission Control runtime records.`
        }));
      })
      .catch((error) => {
        sendJson(request, response, 400, { error: String(error?.message || error || "Invalid JSON payload") });
      });
    return;
  }

  if (request.method === "POST" && url.pathname === "/mission/clients/merge") {
    readJsonBody(request)
      .then(async (payload) => {
        await syncClientStore(true);
        const sourceId = canonicalClientId(payload.sourceId || payload.source_id);
        const targetId = canonicalClientId(payload.targetId || payload.target_id);
        if (!sourceId || !targetId || sourceId === targetId) {
          sendJson(request, response, 400, { error: "Distinct sourceId and targetId are required." });
          return;
        }

        const clients = getAllClients();
        const sourceClient = clients.find((entry) => canonicalClientId(entry.id) === sourceId);
        const targetClient = clients.find((entry) => canonicalClientId(entry.id) === targetId);
        if (!sourceClient || !targetClient) {
          sendJson(request, response, 404, { error: "Source or target client was not found." });
          return;
        }

        const mergedClient = buildClientRecord({
          ...mergeClientRecords(sourceClient, { ...targetClient, source: "runtime" }),
          id: targetClient.id,
          clientName: targetClient.clientName || sourceClient.clientName,
          source: "runtime",
          notes: [
            sourceClient.notes,
            targetClient.notes,
            payload.note || `Merged ${sourceClient.clientName} into ${targetClient.clientName}.`
          ].filter(Boolean).join("\n"),
          updatedAt: new Date().toISOString()
        });
        removeRuntimeClient(sourceId);
        const savedClient = upsertRuntimeClient(mergedClient);
        persistRuntimeClients();
        const targetWrite = await persistRuntimeClientToPostgres(savedClient || mergedClient);
        const sourceDelete = await deleteRuntimeClientFromPostgres(sourceId);
        const storageWrite = await persistClientMutationFallback(targetWrite.ok ? sourceDelete : targetWrite);
        sendJson(request, response, 200, buildClientResponsePayload(storageWrite, 200, {
          merged: {
            source: { id: sourceClient.id, clientName: sourceClient.clientName },
            target: savedClient || mergedClient
          },
          message: `${sourceClient.clientName} merged into ${targetClient.clientName}.`
        }));
      })
      .catch((error) => {
        sendJson(request, response, 400, { error: String(error?.message || error || "Invalid JSON payload") });
      });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/web-helpers") {
    const forceRefresh = url.searchParams.get("refresh") === "true";
    const requestedSiteId = url.searchParams.get("siteId") || "";

    Promise.all([
      getMissionSnapshot(forceRefresh),
      getWebHelperAutoActivation({
        command: "Auto-activate current live website Web Helpers for handoff"
      }),
      readWebHelperRequestsFromPostgres()
    ])
      .then(([snapshot, autoActivation, requestStore]) => {
        const storedRequests = requestStore.requests || [];
        const monitoredHelpers = buildWebHelperAgents(snapshot, requestedSiteId, storedRequests);
        const clientHelpers = buildClientWebHelperAgents(getAllClients(), requestedSiteId, monitoredHelpers, storedRequests);
        const helpers = [...monitoredHelpers, ...clientHelpers];
        sendJson(request, response, 200, {
          generatedAt: new Date().toISOString(),
          siteId: requestedSiteId || null,
          autoActivation,
          requestStore: {
            ok: requestStore.ok,
            target: requestStore.target,
            count: storedRequests.length,
            error: requestStore.error || requestStore.reason || ""
          },
          summary: summarizeWebHelpers(helpers),
          helpers
        });
      })
      .catch((error) => {
        sendJson(request, response, 500, {
          error: "Unable to generate web helper agents",
          detail: String(error?.message || error)
        });
      });

    return;
  }

  if (request.method === "POST" && url.pathname === "/mission/web-helper-requests") {
    const auth = verifyWebHelperWebhookSecret(request);
    if (!auth.ok) {
      sendJson(request, response, auth.status || 401, { error: auth.error || "Unauthorized" });
      return;
    }

    readJsonBody(request)
      .then(async (payload) => {
        const validationError = validateWebHelperRequestPayload(payload);
        if (validationError) {
          sendJson(request, response, 400, { error: validationError });
          return;
        }

        const client = findClientForWebHelperRequest(payload);
        if (!client) {
          sendJson(request, response, 404, {
            error: "Unable to match request to a Mission Control client.",
            detail: "Include a matching client id/name, site domain, or repo full name."
          });
          return;
        }

        const record = normalizeWebHelperRequestPayload(payload, client);
        const stored = await persistWebHelperRequestToPostgres(record);
        if (!stored.ok) {
          sendJson(request, response, 503, {
            error: "Unable to persist Web Helper request.",
            detail: stored.error || stored.reason || "Postgres request store unavailable."
          });
          return;
        }

        const automation = await runWebHelperAutomationForTicket(stored.request).catch((error) => ({
          ok: false,
          error: String(error?.message || error)
        }));

        sendJson(request, response, 201, {
          ok: true,
          routedTo: {
            clientId: client.id,
            clientName: client.clientName,
            webHelperId: record.webHelperId,
            websiteUrl: client.websiteUrl,
            repo: client.repo
          },
          request: automation.ticket || stored.request,
          automation
        });
      })
      .catch((error) => {
        sendJson(request, response, 400, { error: String(error?.message || error || "Invalid JSON payload") });
      });

    return;
  }

  if (request.method === "POST" && url.pathname === "/mission/web-helper-requests/status") {
    readJsonBody(request)
      .then(async (payload) => {
        const updated = await updateWebHelperRequestStatusInPostgres(payload.id, payload.status, {
          actor: payload.actor || "mission_control",
          message: payload.message || ""
        });
        if (!updated.ok) {
          sendJson(request, response, updated.status || 503, {
            error: updated.error || "Unable to update Web Helper request status.",
            detail: updated.reason || ""
          });
          return;
        }

        sendJson(request, response, 200, {
          ok: true,
          request: updated.request
        });
      })
      .catch((error) => {
        sendJson(request, response, 400, { error: String(error?.message || error || "Invalid JSON payload") });
      });

    return;
  }

  if (request.method === "POST" && url.pathname === "/mission/web-helper-requests/event") {
    readJsonBody(request)
      .then(async (payload) => {
        const updated = await appendWebHelperRequestEventInPostgres(payload.id, {
          type: payload.type || "note",
          status: payload.status || "note",
          actor: payload.actor || "mission_control",
          message: payload.message || ""
        });
        if (!updated.ok) {
          sendJson(request, response, updated.status || 503, {
            error: updated.error || "Unable to append Web Helper request event.",
            detail: updated.reason || ""
          });
          return;
        }

        sendJson(request, response, 200, {
          ok: true,
          request: updated.request
        });
      })
      .catch((error) => {
        sendJson(request, response, 400, { error: String(error?.message || error || "Invalid JSON payload") });
      });

    return;
  }

  if (request.method === "POST" && url.pathname === "/mission/web-helper-requests/codex-build") {
    readJsonBody(request)
      .then(async (payload) => {
        const result = await createCodexBuildTaskFromWebHelperRequest(payload.id || payload.ticketId || payload.requestId, {
          baseBranch: payload.baseBranch,
          targetBranch: payload.targetBranch,
          testCommand: payload.testCommand
        });
        if (!result.ok) {
          sendJson(request, response, result.status || 503, {
            error: result.error || "Unable to create Codex build task.",
            detail: result.reason || result.detail || ""
          });
          return;
        }

        sendJson(request, response, 201, result);
      })
      .catch((error) => {
        sendJson(request, response, 400, { error: String(error?.message || error || "Invalid JSON payload") });
      });

    return;
  }

  if (request.method === "POST" && url.pathname === "/mission/codex-runner/intake") {
    const configuredSecret = CODEX_BUILD_WEBHOOK_SECRET || GHOST_WEB_HELPER_WEBHOOK_SECRET;
    const providedSecret = request.headers["x-codex-build-secret"] || request.headers["x-ghost-webhook-secret"] || "";
    if (configuredSecret && !timingSafeEqualText(providedSecret, configuredSecret)) {
      sendJson(request, response, 401, { error: "Unauthorized Codex runner intake." });
      return;
    }

    readJsonBody(request)
      .then(async (payload) => {
        const ticketId = String(payload.ticketId || payload.ticket_id || payload.sourceTicketId || "").trim();
        const taskId = String(payload.taskId || payload.task_id || (ticketId ? `codex_${ticketId}` : "")).trim();
        const taskType = String(payload.taskType || payload.task_type || "web_helper_codex_build").trim();
        if (!ticketId || !taskId) {
          sendJson(request, response, 400, { error: "ticketId and taskId are required." });
          return;
        }

        const isMerge = taskType.includes("merge");
        const nextTaskStatus = isMerge ? "merge_intake_received" : "in_progress";
        const nextTicketStatus = isMerge ? "approved_to_merge" : "in_progress";
        const taskUpdate = await updateCodexBuildTaskStatus(taskId, nextTaskStatus, {
          type: "codex_runner_intake",
          actor: "codex_runner_intake",
          message: isMerge
            ? "Merge handoff accepted by the Codex runner intake."
            : "Build handoff accepted by the Codex runner intake.",
          data: {
            taskType,
            repo: payload.repo || "",
            baseBranch: payload.baseBranch || "",
            targetBranch: payload.targetBranch || "",
            resultCallbackUrl: payload.resultCallbackUrl || buildMissionControlUrl("/mission/codex-build-tasks/result")
          }
        });
        if (!taskUpdate.ok) {
          sendJson(request, response, taskUpdate.status || 503, {
            error: taskUpdate.error || "Unable to update Codex task from runner intake.",
            detail: taskUpdate.reason || ""
          });
          return;
        }

        const ticketUpdate = await updateWebHelperRequestStatusInPostgres(ticketId, nextTicketStatus, {
          actor: "codex_runner_intake",
          message: isMerge
            ? "Codex runner intake accepted the merge handoff."
            : "Codex runner intake accepted the build handoff and moved the ticket into active build."
        });

        sendJson(request, response, 202, {
          ok: true,
          accepted: true,
          taskType,
          task: taskUpdate.task,
          ticket: ticketUpdate.request,
          resultCallbackUrl: payload.resultCallbackUrl || buildMissionControlUrl("/mission/codex-build-tasks/result")
        });
      })
      .catch((error) => {
        sendJson(request, response, 400, { error: String(error?.message || error || "Invalid JSON payload") });
      });

    return;
  }

  if (request.method === "POST" && url.pathname === "/mission/codex-build-tasks/result") {
    const configuredSecret = CODEX_BUILD_WEBHOOK_SECRET || GHOST_WEB_HELPER_WEBHOOK_SECRET;
    const providedSecret = request.headers["x-codex-build-secret"] || request.headers["x-ghost-webhook-secret"] || "";
    if (configuredSecret && !timingSafeEqualText(providedSecret, configuredSecret)) {
      sendJson(request, response, 401, { error: "Unauthorized Codex runner callback." });
      return;
    }

    readJsonBody(request)
      .then(async (payload) => {
        const result = await processCodexRunnerResult(payload);
        if (!result.ok) {
          sendJson(request, response, result.status || 503, {
            error: result.error || "Unable to process Codex runner result.",
            detail: result.reason || result.detail || ""
          });
          return;
        }

        sendJson(request, response, 200, result);
      })
      .catch((error) => {
        sendJson(request, response, 400, { error: String(error?.message || error || "Invalid JSON payload") });
      });

    return;
  }

  if (request.method === "POST" && url.pathname === "/mission/web-helper-requests/owner-action") {
    readJsonBody(request)
      .then(async (payload) => {
        const ticketId = String(payload.id || payload.ticketId || payload.requestId || "").trim();
        const action = String(payload.action || "").trim().toLowerCase().replace(/-/g, "_");
        const instructions = String(payload.instructions || payload.message || "").trim();
        let result;

        if (["approve_merge", "approve"].includes(action)) {
          result = await approveCodexMerge(ticketId);
        } else if (["redo", "redo_with_chat", "changes_requested"].includes(action)) {
          result = await requestCodexRedo(ticketId, instructions);
        } else if (["merge_complete", "merged"].includes(action)) {
          result = await markWebHelperMergeComplete(ticketId, payload.taskId || payload.task_id, {
            actor: "mission_control",
            message: instructions || "Owner marked the merge complete and ready for client confirmation."
          });
        } else {
          result = { ok: false, status: 400, error: "Unsupported owner action." };
        }

        if (!result.ok) {
          sendJson(request, response, result.status || 503, {
            error: result.error || "Unable to complete owner action.",
            detail: result.reason || result.detail || ""
          });
          return;
        }

        sendJson(request, response, 200, result);
      })
      .catch((error) => {
        sendJson(request, response, 400, { error: String(error?.message || error || "Invalid JSON payload") });
      });

    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/web-helper-requests/client-confirm") {
    const ticketId = String(url.searchParams.get("ticketId") || "").trim();
    const taskId = String(url.searchParams.get("taskId") || "").trim();
    const token = String(url.searchParams.get("token") || "").trim();
    const expectedToken = ticketId && taskId ? buildClientConfirmationToken(ticketId, taskId) : "";
    if (!ticketId || !taskId || !token || !expectedToken || !timingSafeEqualText(token, expectedToken)) {
      response.writeHead(401, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Unable to confirm this update. The confirmation link is invalid.");
      return;
    }

    updateWebHelperRequestStatusInPostgres(ticketId, "done", {
      actor: "client",
      message: "Client confirmed the website update is complete."
    })
      .then(async (updated) => {
        if (!updated.ok) {
          response.writeHead(updated.status || 503, { "Content-Type": "text/plain; charset=utf-8" });
          response.end("Unable to confirm this update. Please contact support.");
          return;
        }
        await appendWebHelperRequestEventInPostgres(ticketId, {
          type: "client_confirmed",
          status: "done",
          actor: "client",
          message: "Client clicked the update confirmation link."
        });
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        response.end("<!doctype html><title>Update confirmed</title><body style=\"font-family:system-ui;background:#050807;color:#f7fff6;padding:40px\"><h1>Update confirmed</h1><p>Thank you. Mission Control marked this website update complete.</p></body>");
      })
      .catch(() => {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Unable to confirm this update. Please contact support.");
      });

    return;
  }

  if (request.method === "POST" && url.pathname === "/mission/web-helpers/activate-all") {
    readJsonBody(request)
      .then(async (payload) => {
        const autoActivation = await getWebHelperAutoActivation({
          forceRun: true,
          refreshExisting: Boolean(payload.refresh),
          command: payload.command || "Bulk activate current live website Web Helpers for handoff"
        });
        const snapshot = await getMissionSnapshot(Boolean(payload.refresh));
        const monitoredHelpers = buildWebHelperAgents(snapshot, "");
        const clientHelpers = buildClientWebHelperAgents(getAllClients(), "", monitoredHelpers);
        const helpers = [...monitoredHelpers, ...clientHelpers];

        sendJson(request, response, 201, {
          generatedAt: new Date().toISOString(),
          autoActivation,
          summary: summarizeWebHelpers(helpers),
          helpers
        });
      })
      .catch((error) => {
        sendJson(request, response, 400, { error: String(error?.message || error || "Invalid JSON payload") });
      });

    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/web-helpers/knowledge") {
    const requestedSiteId = url.searchParams.get("siteId") || url.searchParams.get("clientId") || "";
    hydrateWebHelperActivations();
    const client = requestedSiteId ? findClientForWebHelperTarget(requestedSiteId) : null;
    const activation = client && isCurrentWebsiteWebHelperClient(client) ? webHelperActivations.get(client.id) : null;
    if (!activation) {
      sendJson(request, response, 404, {
        error: "Web Helper knowledge pack not activated",
        detail: "POST /mission/web-helpers/activate with siteId or clientId to generate one."
      });
      return;
    }

    sendJson(request, response, 200, activation);
    return;
  }

  if (request.method === "POST" && url.pathname === "/mission/web-helpers/activate") {
    readJsonBody(request)
      .then(async (payload) => {
        const targetId = payload.siteId || payload.clientId || payload.id || payload.websiteUrl || "";
        if (!targetId) {
          sendJson(request, response, 400, { error: "siteId, clientId, id, or websiteUrl is required" });
          return;
        }

        const activation = await activateWebHelperForTarget(targetId, {
          command: payload.command || "manual Web Helper activation",
          forceRefresh: Boolean(payload.refresh)
        });

        if (!activation) {
          sendJson(request, response, 404, { error: "Unable to find matching client or monitored site for Web Helper activation" });
          return;
        }

        sendJson(request, response, 201, {
          activated: summarizeWebHelperActivation(activation),
          activation
        });
      })
      .catch((error) => {
        sendJson(request, response, 400, { error: String(error?.message || error || "Invalid JSON payload") });
      });

    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/services") {
    const services = getServiceCatalog();
    sendJson(request, response, 200, {
      generatedAt: new Date().toISOString(),
      summary: {
        serviceCount: services.length,
        activeCount: services.filter((service) => service.status === "active").length,
        integrationNeeded: services.filter((service) => service.status === "integration-needed").length,
        plannedCount: services.filter((service) => service.status === "planned").length
      },
      services,
      actions: [
        "Connect geo.ghostai.solutions API for Search Intelligence.",
        "Create package templates for build, care, GEO, lead, content, and reporting.",
        "Map each service to required tools and approval rules."
      ]
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/onboarding") {
    const blueprint = getOnboardingBlueprint();
    const activation = buildOnboardingActivation(getAllClients());
    sendJson(request, response, 200, {
      generatedAt: new Date().toISOString(),
      summary: {
        stageCount: blueprint.stages.length,
        templateReady: blueprint.stages.filter((stage) => stage.status === "template-ready").length,
        needsIntegration: blueprint.stages.filter((stage) => stage.status === "needs-integration").length,
        activeClients: activation.summary.activeClients,
        blockedClients: activation.summary.blockedClients,
        proposalsSent: activation.summary.proposalsSent,
        agreementsReturned: activation.summary.agreementsReturned,
        depositPaid: activation.summary.depositPaid,
        openTasks: activation.summary.openTasks,
        sourcePending: activation.summary.sourcePending,
        sourceBreakdown: activation.summary.sourceBreakdown
      },
      activation,
      ...blueprint
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/tools") {
    buildToolRegistry(url.searchParams.get("refresh") === "true")
      .then((registry) => {
        sendJson(request, response, 200, registry);
      })
      .catch((error) => {
        sendJson(request, response, 500, {
          error: "Unable to generate tool registry",
          detail: String(error?.message || error)
        });
      });
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

    request.on("end", async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const command = parsed.command || "";
        const siteId = parsed.siteId || getDefaultSiteId();

        if (!String(command).trim()) {
          sendJson(request, response, 400, { error: "Command is required" });
          return;
        }

        const plan = getCommandPlan(command, siteId);
        const execution = createExecutionRun(command, siteId, plan);
        const baseRationale = getDecisionRationale(plan.category || "general");
        const aiGuidance = await getAiGuidance(command, siteId, plan);
        const isBulkWebHelperHandoff = plan.category === "web_helper" && isWebHelperHandoffCommand(command);
        const webHelperBulkActivation = isBulkWebHelperHandoff
          ? await getWebHelperAutoActivation({ command })
          : null;
        const webHelperActivation = plan.category === "web_helper" && !isBulkWebHelperHandoff
          ? await activateWebHelperForTarget(siteId, { command })
          : null;
        const rationale = [...baseRationale, ...aiGuidance.rationaleAdditions];
        const autoActions = [
          ...(plan.autoActions || []),
          ...aiGuidance.autoActionsAdditions,
          ...(webHelperBulkActivation
            ? [`Checked ${webHelperBulkActivation.targetCount} Web Helper handoff clients: ${webHelperBulkActivation.activatedCount} activated, ${webHelperBulkActivation.existingCount} already active, ${webHelperBulkActivation.failedCount} failed.`]
            : []),
          ...(webHelperActivation
            ? [`Activated ${webHelperActivation.agent.name} knowledge pack with ${webHelperActivation.memoryDocuments.length} memory documents.`]
            : [])
        ];
        const expectedImpact =
          aiGuidance.growthOpportunities.length > 0
            ? `${plan.expectedImpact} Growth opportunities: ${aiGuidance.growthOpportunities.join(" | ")}`
            : plan.expectedImpact;

        sendJson(request, response, 200, {
          command,
          siteId,
          receivedAt: new Date().toISOString(),
          ...plan,
          autoActions,
          expectedImpact,
          rationale,
          aiCopilot: aiGuidance,
          webHelperActivation: summarizeWebHelperActivation(webHelperActivation),
          webHelperBulkActivation,
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
    const siteId = url.searchParams.get("siteId") || getDefaultSiteId();
    sendJson(request, response, 200, {
      agents: getRankedAgents(siteId)
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/predict") {
    const siteId = url.searchParams.get("siteId") || getDefaultSiteId();
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
    const siteId = url.searchParams.get("siteId") || getDefaultSiteId();
    const strategy = analyzeStrategicGoals(siteId);
    sendJson(request, response, 200, strategy);
    return;
  }

  if (request.method === "GET" && url.pathname === "/mission/autonomy") {
    const siteId = url.searchParams.get("siteId") || getDefaultSiteId();
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
    const siteId = url.searchParams.get("siteId") || getDefaultSiteId();
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

if (require.main === module) {
  startServer(BASE_PORT, MAX_PORT_ATTEMPTS);
} else {
  module.exports = {
    canonicalClientId,
    normalizeClient,
    mergeClientRecords,
    getClientDataHealth,
    normalizeClientStage,
    normalizeLeadStage,
    deriveLeadStage,
    buildClientRecord,
    normalizeWebHelperRequestPayload,
    dbRowToWebHelperRequest,
    buildCodexTaskPayload,
    buildCodexBuildPrompt,
    appendWebHelperRequestEventInPostgres,
    assessWebHelperRequest,
    buildClientConfirmationToken
  };
}
