const assert = require("assert");

const {
  canonicalClientId,
  normalizeClient,
  mergeClientRecords,
  getClientDataHealth,
  deriveLeadStage,
  normalizeWebHelperRequestPayload,
  dbRowToWebHelperRequest
} = require("../server");

function testCanonicalClientAliases() {
  assert.strictEqual(canonicalClientId("anna-s-air"), "annas-air");
  assert.strictEqual(canonicalClientId("anna_air"), "annas-air");
}

function testClientMergePreservesRuntimeUpdates() {
  const seeded = normalizeClient({
    id: "gray-matters-tech",
    clientName: "Gray Matters Tech",
    websiteUrl: "https://www.graymatterstech.com",
    stage: "web-helper-care",
    source: "deployment-map"
  });
  const runtime = normalizeClient({
    id: "gray-matters-tech",
    clientName: "Gray Matters Tech",
    websiteUrl: "https://www.graymatterstech.com",
    stage: "launch-handoff",
    leadSource: "email",
    contact: "Barbara Consulting",
    source: "runtime"
  });
  const merged = mergeClientRecords(seeded, runtime);
  assert.strictEqual(merged.stage, "launch-handoff");
  assert.strictEqual(merged.leadSource, "email");
  assert.strictEqual(merged.contact, "Barbara Consulting");
}

function testLeadStageMapping() {
  assert.strictEqual(deriveLeadStage({ stage: "lead" }), "new-lead");
  assert.strictEqual(deriveLeadStage({ stage: "lead", proposalSent: true }), "proposal-sent");
  assert.strictEqual(deriveLeadStage({ stage: "deposit-paid" }), "deposit-paid");
  assert.strictEqual(deriveLeadStage({ stage: "web-helper-care" }), "deposit-paid");
  assert.strictEqual(deriveLeadStage({ stage: "paused-archived", leadStage: "lost-not-now" }), "lost-not-now");
}

function testDataHealthDetectsDuplicateIdentity() {
  const health = getClientDataHealth([
    normalizeClient({
      id: "client-a",
      clientName: "Client A",
      websiteUrl: "https://example.com",
      repo: "burchdad/client-a",
      services: ["website-build"]
    }),
    normalizeClient({
      id: "client-b",
      clientName: "Client B",
      websiteUrl: "https://example.com",
      repo: "burchdad/client-b",
      services: ["website-build"]
    })
  ]);
  assert.strictEqual(health.status, "attention");
  assert.strictEqual(health.duplicateCount, 1);
}

function testWebHelperRequestEvents() {
  const client = normalizeClient({
    id: "gray-matters-tech",
    clientName: "Gray Matters Tech",
    websiteUrl: "https://www.graymatterstech.com",
    services: ["website-build", "web-helper-care"]
  });
  const request = normalizeWebHelperRequestPayload(
    {
      source: "client_admin_dashboard",
      summary: "Update services copy",
      details: "Tighten the first service card.",
      priority: "normal"
    },
    client
  );
  assert.strictEqual(request.clientId, "gray-matters-tech");
  assert.strictEqual(request.events.length, 1);
  assert.strictEqual(request.events[0].type, "created");

  const row = dbRowToWebHelperRequest({
    id: "ticket-1",
    client_id: "gray-matters-tech",
    web_helper_id: "gray-matters-tech-web-helper",
    source: "client_admin_dashboard",
    request_type: "text_update",
    title: "Update services copy",
    summary: "Update services copy",
    details: "Tighten the first service card.",
    page_url: "/services",
    priority: "normal",
    status: "triage",
    branch_policy: "testing_branch_only",
    approval_required: true,
    attachments: [],
    events: [{ type: "created", status: "new", at: "2026-06-17T00:00:00.000Z" }],
    payload: {},
    created_at: "2026-06-17T00:00:00.000Z",
    updated_at: "2026-06-17T00:01:00.000Z"
  });
  assert.strictEqual(row.events.length, 1);
  assert.strictEqual(row.events[0].status, "new");
}

[
  testCanonicalClientAliases,
  testClientMergePreservesRuntimeUpdates,
  testLeadStageMapping,
  testDataHealthDetectsDuplicateIdentity,
  testWebHelperRequestEvents
].forEach((test) => test());

console.log("Regression tests passed");
