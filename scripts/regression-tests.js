const assert = require("assert");

const {
  canonicalClientId,
  normalizeClient,
  mergeClientRecords,
  getClientDataHealth,
  deriveLeadStage,
  buildClientRecord,
  normalizeWebHelperRequestPayload,
  dbRowToWebHelperRequest,
  buildCodexTaskPayload,
  assessWebHelperRequest,
  buildClientConfirmationToken,
  buildClientUpdateEmailPayload,
  hasWebHelperEvent,
  buildCodexRunnerWorkOrder,
  buildCodexWorkerPrompt,
  parseWorkerArgs,
  materializeWorkerArgs,
  normalizeCodexWorkerArgs,
  appendCodexPromptArg,
  isCodexWorkerCommand,
  summarizeGithubVerification,
  buildWebHelperProvisionEnvBundle,
  buildClientSupportUrl,
  buildClientSupportToken
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

function testCodexBuildPayloadUsesTicketAsPrompt() {
  const client = normalizeClient({
    id: "gray-matters-tech",
    clientName: "Gray Matters Tech",
    websiteUrl: "https://www.graymatterstech.com",
    repo: "burchdad/barbara_consulting",
    services: ["website-build", "web-helper-care"]
  });
  const request = normalizeWebHelperRequestPayload(
    {
      id: "ticket-123",
      source: "client_admin_dashboard",
      request_type: "layout_change",
      summary: "Fix services card layout",
      details: "Make the services cards fit on one row.",
      page_url: "/services",
      priority: "normal"
    },
    client
  );
  const payload = buildCodexTaskPayload(request, client, {
    baseBranch: "main",
    targetBranch: "testing/web-helper-ticket-123",
    testCommand: "npm run check && npm run build"
  });
  assert.strictEqual(payload.repo, "burchdad/barbara_consulting");
  assert.strictEqual(payload.targetBranch, "testing/web-helper-ticket-123");
  assert.strictEqual(payload.approvalRequired, true);
  assert.ok(payload.prompt.includes("Fix services card layout"));
  assert.ok(payload.prompt.includes("Do not merge to main"));
  assert.ok(payload.prompt.includes("npm run check && npm run build"));
}

function testWebHelperAutomationAssessment() {
  const client = normalizeClient({
    id: "gray-matters-tech",
    clientName: "Gray Matters Tech",
    websiteUrl: "https://www.graymatterstech.com",
    repo: "burchdad/barbara_consulting"
  });
  const urgent = normalizeWebHelperRequestPayload(
    {
      summary: "Broken contact form",
      details: "The contact form is throwing an error and leads are not submitting.",
      page_url: "/contact"
    },
    client
  );
  const urgentAssessment = assessWebHelperRequest(urgent, client);
  assert.strictEqual(urgentAssessment.priority, "high");
  assert.strictEqual(urgentAssessment.risk, "owner_review");
  assert.strictEqual(urgentAssessment.route, "codex_build");

  const vague = normalizeWebHelperRequestPayload(
    {
      summary: "Fix it",
      details: ""
    },
    client
  );
  const vagueAssessment = assessWebHelperRequest(vague, client);
  assert.strictEqual(vagueAssessment.missingDetails, true);
  assert.strictEqual(vagueAssessment.route, "blocked");
}

function testClientConfirmationTokenIsStable() {
  const token = buildClientConfirmationToken("ticket-1", "task-1");
  assert.strictEqual(token, buildClientConfirmationToken("ticket-1", "task-1"));
  assert.notStrictEqual(token, buildClientConfirmationToken("ticket-1", "task-2"));
}

function testClientUpdateEmailUsesRequesterFallback() {
  const client = normalizeClient({
    id: "gray-matters-tech",
    clientName: "Gray Matters Tech",
    websiteUrl: "https://www.graymatterstech.com",
    repo: "burchdad/barbara_consulting"
  });
  const request = normalizeWebHelperRequestPayload(
    {
      id: "ticket-email",
      summary: "Update services copy",
      details: "Tighten the services intro paragraph.",
      requesterEmail: "time@graymatterstech.com"
    },
    client
  );
  const email = buildClientUpdateEmailPayload(request, {
    id: "codex_ticket-email",
    targetBranch: "testing/web-helper-ticket-email",
    repo: "burchdad/barbara_consulting"
  });
  assert.strictEqual(email.to, "time@graymatterstech.com");
  assert.ok(email.subject.includes("Update services copy"));
  assert.ok(email.html.includes("Website update ready"));
  assert.ok(email.html.includes("testing/web-helper-ticket-email"));
}

function testWebHelperEventDeduplicationMatcher() {
  const events = [
    { type: "status_change", status: "approved_to_merge", message: "Merge completed." },
    { type: "client_email_sent", status: "client_review", message: "Email sent." }
  ];
  assert.strictEqual(hasWebHelperEvent(events, "status_change", "approved_to_merge"), true);
  assert.strictEqual(hasWebHelperEvent(events, "client_email_sent", "client_review"), true);
  assert.strictEqual(hasWebHelperEvent(events, "client_email_queued", "client_review"), false);
}

function testCodexRunnerWorkOrderIncludesBranchAndPrompt() {
  const workOrder = buildCodexRunnerWorkOrder({
    ticketId: "whr_123",
    taskId: "codex_whr_123",
    clientName: "Gray Matters Tech",
    repo: "burchdad/barbara_consulting",
    baseBranch: "main",
    targetBranch: "testing/web-helper-whr-123",
    summary: "Update services copy",
    details: "Replace the first services paragraph.",
    prompt: "Make the requested copy update.",
    testCommand: "npm run check && npm run build"
  });
  assert.ok(workOrder.includes("testing/web-helper-whr-123"));
  assert.ok(workOrder.includes("Replace the first services paragraph."));
  assert.ok(workOrder.includes("Make the requested copy update."));
}

function testCodexWorkerPromptCarriesTicketContext() {
  const prompt = buildCodexWorkerPrompt({
    ticketId: "whr_456",
    taskId: "codex_whr_456",
    repo: "burchdad/barbara_consulting",
    targetBranch: "testing/web-helper-whr-456",
    summary: "Swap hero copy",
    details: "Use the provided owner-approved headline."
  });
  assert.ok(prompt.includes("whr_456"));
  assert.ok(prompt.includes("testing/web-helper-whr-456"));
  assert.ok(prompt.includes("Use the provided owner-approved headline."));
}

function testWorkerArgsParsingSupportsJsonAndQuotes() {
  assert.deepStrictEqual(parseWorkerArgs('["--prompt","file path"]'), ["--prompt", "file path"]);
  assert.deepStrictEqual(parseWorkerArgs('--prompt "file path" --dry-run'), ["--prompt", "file path", "--dry-run"]);
  assert.deepStrictEqual(materializeWorkerArgs(["--prompt", "{PROMPT_PATH}"], { PROMPT_PATH: "work/order.txt" }), ["--prompt", "work/order.txt"]);
  assert.deepStrictEqual(normalizeCodexWorkerArgs("codex", ["exec", "--prompt-file", "work/order.txt"]), ["exec"]);
  assert.deepStrictEqual(normalizeCodexWorkerArgs("codex", ["exec", "--sandbox", "workspace-write", "--ask-for-approval", "never"]), ["exec", "--dangerously-bypass-approvals-and-sandbox"]);
  assert.deepStrictEqual(appendCodexPromptArg("codex", ["exec"], "Do the work."), ["exec", "Do the work."]);
  assert.strictEqual(isCodexWorkerCommand("codex"), true);
  assert.strictEqual(isCodexWorkerCommand("node"), false);
}

function testFinalPaymentCompletesWebBuildStage() {
  const client = buildClientRecord({
    clientName: "Done Build",
    stage: "launch-handoff",
    depositPaid: true,
    finalPaymentPaid: true,
    services: ["website-build"]
  });
  assert.strictEqual(client.stage, "completed-archived");

  const careClient = buildClientRecord({
    clientName: "Care Build",
    stage: "web-helper-care",
    depositPaid: true,
    finalPaymentPaid: true,
    partnershipSigned: true,
    services: ["website-build", "web-helper-care"]
  });
  assert.strictEqual(careClient.stage, "web-helper-care");
}

function testWebHelperProvisionEnvBundle() {
  const client = buildClientRecord({
    id: "gray-matters-tech",
    clientName: "Gray Matters Tech",
    websiteUrl: "https://www.graymatterstech.com",
    repo: "burchdad/barbara_consulting",
    stage: "completed-archived",
    services: ["website-build", "web-helper-care"]
  });
  const bundle = buildWebHelperProvisionEnvBundle(client, {
    headers: { host: "ghostmissioncontrol-production.up.railway.app" }
  });

  assert.strictEqual(bundle.webHelperId, "gray-matters-tech-web-helper");
  assert.strictEqual(bundle.values.GHOST_CLIENT_ID, "gray-matters-tech");
  assert.strictEqual(bundle.values.GHOST_REPO, "burchdad/barbara_consulting");
  assert.strictEqual(bundle.values.GHOST_MISSION_CONTROL_WEBHOOK_URL, "https://ghostmissioncontrol-production.up.railway.app/mission/web-helper-requests");
  assert.ok(bundle.values.GHOST_SUPPORT_URL.includes("/mission/web-helper-support?clientId=gray-matters-tech"));
  assert.strictEqual(bundle.values.GHOST_MISSION_CONTROL_WEBHOOK_SECRET, "<owner-managed shared intake secret>");
}

function testClientSupportUrlUsesSignedClientLink() {
  const client = buildClientRecord({
    id: "gray-matters-tech",
    clientName: "Gray Matters Tech",
    websiteUrl: "https://www.graymatterstech.com",
    repo: "burchdad/barbara_consulting",
    stage: "web-helper-care",
    services: ["website-build", "web-helper-care"]
  });
  const token = buildClientSupportToken(client.id);
  const url = buildClientSupportUrl(client, { headers: { host: "missioncontrol.ghostai.solutions" } });
  assert.ok(url.startsWith("https://missioncontrol.ghostai.solutions/mission/web-helper-support"));
  assert.ok(url.includes(`clientId=${encodeURIComponent(client.id)}`));
  assert.ok(url.includes(`token=${encodeURIComponent(token)}`));
}

function testGithubVerificationSummary() {
  const passing = summarizeGithubVerification(
    { state: "pending", statuses: [] },
    { check_runs: [{ name: "Vercel", status: "completed", conclusion: "success" }] }
  );
  assert.strictEqual(passing.state, "success");
  assert.strictEqual(passing.ok, true);

  const failing = summarizeGithubVerification(
    { state: "success", statuses: [] },
    { check_runs: [{ name: "Vercel", status: "completed", conclusion: "failure" }] }
  );
  assert.strictEqual(failing.state, "failure");
  assert.strictEqual(failing.ok, false);
  assert.ok(failing.summary.includes("Vercel"));

  const pending = summarizeGithubVerification({ state: "pending", statuses: [] }, { check_runs: [] });
  assert.strictEqual(pending.state, "pending");
  assert.strictEqual(pending.ok, false);
}

[
  testCanonicalClientAliases,
  testClientMergePreservesRuntimeUpdates,
  testLeadStageMapping,
  testDataHealthDetectsDuplicateIdentity,
  testWebHelperRequestEvents,
  testCodexBuildPayloadUsesTicketAsPrompt,
  testWebHelperAutomationAssessment,
  testClientConfirmationTokenIsStable,
  testClientUpdateEmailUsesRequesterFallback,
  testWebHelperEventDeduplicationMatcher,
  testCodexRunnerWorkOrderIncludesBranchAndPrompt,
  testCodexWorkerPromptCarriesTicketContext,
  testWorkerArgsParsingSupportsJsonAndQuotes,
  testFinalPaymentCompletesWebBuildStage,
  testWebHelperProvisionEnvBundle,
  testClientSupportUrlUsesSignedClientLink,
  testGithubVerificationSummary
].forEach((test) => test());

console.log("Regression tests passed");
