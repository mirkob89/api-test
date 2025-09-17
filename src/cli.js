#!/usr/bin/env node
import { Command } from "commander";
import { BitbucketClient } from "./bitbucketClient.js";
import { loadEnv, loadConfig } from "./config.js";

async function main() {
  const program = new Command();
  program
    .name("bb-brancher")
    .description("Erstellt Branches und Commits in Bitbucket basierend auf einer Konfigurationsdatei")
    .option("-c, --config <path>", "Pfad zur Konfigurationsdatei", "bb.config.json")
    .option("--dry-run", "Nur anzeigen, was passieren würde", false)
    .option("--env <path>", "Pfad zur .env Datei", ".env")
    .showHelpAfterError();

  program.parse(process.argv);
  const options = program.opts();

  loadEnv(options.env);
  const cfg = loadConfig(options.config);
  const effectiveDryRun = options.dryRun || cfg.dryRun;

  const client = new BitbucketClient({
    baseUrl: cfg.baseUrl,
    workspace: cfg.workspace,
    repoSlug: cfg.repoSlug,
    username: cfg.username,
    appPassword: cfg.appPassword,
    dryRun: effectiveDryRun,
  });

  if (!effectiveDryRun && (!cfg.username || !cfg.appPassword)) {
    throw new Error("Fehlende Zugangsdaten: BITBUCKET_USERNAME/APP_PASSWORD oder in der Konfig übergeben");
  }

  const defaultRefName = effectiveDryRun ? "main" : await client.getDefaultBranchOrMaster();
  console.log(`Standard-Branch ist: ${defaultRefName}${effectiveDryRun ? " (simuliert)" : ""}`);

  for (const branch of cfg.branches) {
    if (!branch?.name) {
      console.warn("Überspringe Branch ohne gültigen Namen:", branch);
      continue;
    }
    const branchName = branch.name;
    const fromRef = branch.from || defaultRefName;
    console.log(`\nVerarbeite Branch: ${branchName} (von ${fromRef})`);

    const exists = effectiveDryRun ? false : await client.branchExists(branchName);
    if (exists) {
      console.log(`Branch '${branchName}' existiert bereits. Überspringe Erstellung.`);
    } else {
      const fromHash = effectiveDryRun ? "SIMULATED_HASH" : await client.getCommitHashForRef(fromRef);
      if (!fromHash) throw new Error(`Konnte Commit-Hash für Referenz '${fromRef}' nicht ermitteln`);
      const created = await client.createBranch({ name: branchName, from: fromHash });
      console.log("Branch erstellt:", created?.name || created);
    }

    if (branch.createCommit !== false) {
      const message = branch.commitMessage || `Initial commit on ${branchName}`;
      const filePath = branch.filePath || cfg.defaultCommitFilePath;
      const content = branch.content || cfg.defaultCommitContent;
      const commit = await client.createCommit({ branch: branchName, message, filePath, content });
      console.log("Commit erstellt:", commit?.hash || commit);
    } else {
      console.log("Commit-Erstellung für diesen Branch deaktiviert.");
    }
  }

  console.log("\nFertig.");
}

main().catch((err) => {
  if (err?.response) {
    const status = err.response.status;
    const data = err.response.data;
    console.error("API-Fehler:", status, JSON.stringify(data, null, 2));
  } else {
    console.error(err);
  }
  process.exit(1);
});

