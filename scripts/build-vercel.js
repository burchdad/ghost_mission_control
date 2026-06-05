const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const apiBase = String(process.env.GHOST_API_BASE_URL || "").trim().replace(/\/+$/, "");
const buildVersion = String(
  process.env.VERCEL_GIT_COMMIT_SHA || process.env.GHOST_BUILD_VERSION || Date.now(),
)
  .trim()
  .replace(/[^a-zA-Z0-9._-]/g, "");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const files = ["index.html", "app.js", "styles.css"];

for (const file of files) {
  const srcPath = path.join(root, file);
  const destPath = path.join(dist, file);
  let content = fs.readFileSync(srcPath, "utf8");

  if (file === "index.html") {
    content = content
      .replace("__GHOST_API_BASE_URL__", apiBase)
      .replaceAll("__GHOST_BUILD_VERSION__", buildVersion);
  }

  fs.writeFileSync(destPath, content, "utf8");
}

console.log(`Built static Vercel output in ${dist}`);
console.log(`GHOST_API_BASE_URL: ${apiBase || "(not set)"}`);
console.log(`GHOST_BUILD_VERSION: ${buildVersion}`);
