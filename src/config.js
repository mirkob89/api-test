import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export function loadEnv(envPath = ".env") {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

export function loadConfig(configPath) {
  const absolutePath = path.isAbsolute(configPath) ? configPath : path.join(process.cwd(), configPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Konfigurationsdatei nicht gefunden: ${absolutePath}`);
  }
  const raw = fs.readFileSync(absolutePath, "utf8");
  const data = JSON.parse(raw);
  return normalizeConfig(data);
}

function normalizeConfig(cfg) {
  if (!cfg) throw new Error("Leere Konfiguration");
  const requiredTop = ["workspace", "repoSlug", "branches"];
  for (const key of requiredTop) {
    if (!cfg[key]) throw new Error(`Fehlender Konfigurationsschlüssel: ${key}`);
  }
  if (!Array.isArray(cfg.branches) || cfg.branches.length === 0) {
    throw new Error("'branches' muss ein nicht-leeres Array sein");
  }
  const baseUrl = cfg.baseUrl || process.env.BITBUCKET_BASE_URL || "https://api.bitbucket.org/2.0";
  const username = cfg.username || process.env.BITBUCKET_USERNAME;
  const appPassword = cfg.appPassword || process.env.BITBUCKET_APP_PASSWORD;
  const defaultCommitFilePath = cfg.defaultCommitFilePath || "README.md";
  const defaultCommitContent = cfg.defaultCommitContent || "Created by automation.";
  const dryRunEnv = String(process.env.DRY_RUN || "").toLowerCase();
  const dryRun = cfg.dryRun ?? (dryRunEnv === "1" || dryRunEnv === "true");

  const branches = cfg.branches.map((b) => {
    if (typeof b === "string") return { name: b };
    return {
      name: b.name,
      from: b.from,
      commitMessage: b.commitMessage,
      filePath: b.filePath,
      content: b.content,
      createCommit: b.createCommit !== false,
    };
  });

  return {
    baseUrl,
    workspace: cfg.workspace,
    repoSlug: cfg.repoSlug,
    username,
    appPassword,
    defaultCommitFilePath,
    defaultCommitContent,
    dryRun,
    branches,
  };
}

