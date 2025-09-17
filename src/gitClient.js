import os from "os";
import fs from "fs";
import path from "path";
import { simpleGit } from "simple-git";

function buildAuthenticatedRemoteUrl(remoteUrl, username, appPassword) {
  try {
    const url = new URL(remoteUrl);
    if (!url.username && username) {
      url.username = encodeURIComponent(username);
    }
    if (!url.password && appPassword) {
      url.password = encodeURIComponent(appPassword);
    }
    return url.toString();
  } catch {
    return remoteUrl;
  }
}

async function removeDirectoryRecursive(targetPath) {
  try {
    await fs.promises.rm(targetPath, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

export class GitClient {
  constructor({ dryRun = false } = {}) {
    this.dryRun = dryRun;
  }

  async createEmptyCommitAndPush({
    remoteUrl,
    workspace,
    repoSlug,
    fromRef,
    branchName,
    message,
    forcePush = false,
    username,
    appPassword,
  }) {
    if (this.dryRun) {
      return {
        dryRun: true,
        action: "createEmptyCommitAndPush",
        remoteUrl,
        fromRef,
        branchName,
        message,
        forcePush,
      };
    }

    const effectiveRemoteUrl = remoteUrl || `https://bitbucket.org/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}.git`;
    const authRemote = buildAuthenticatedRemoteUrl(effectiveRemoteUrl, username, appPassword);

    const tempBase = await fs.promises.mkdtemp(path.join(os.tmpdir(), "bb-brancher-"));

    try {
      const git = simpleGit({ baseDir: tempBase, timeout: { block: 60000 } });

      const cloneOptions = ["--depth", "1", "--no-single-branch"]; // fetch minimal history
      await git.clone(authRemote, tempBase, cloneOptions);

      // Try to use remote branch if it exists
      let checkedOut = false;
      try {
        await git.fetch("origin", branchName);
        await git.checkout(["-B", branchName, `origin/${branchName}`]);
        checkedOut = true;
      } catch {
        // ignore; will try fromRef or create new branch from current HEAD
      }

      if (!checkedOut) {
        try {
          if (fromRef) {
            await git.checkout([fromRef]);
          }
        } catch {
          // ignore if fromRef not found locally
        }
        const branches = await git.branch();
        if (branches.all.includes(branchName)) {
          await git.checkout(branchName);
        } else {
          await git.checkoutLocalBranch(branchName);
        }
      }

      // Ensure user identity is set to allow committing
      const fallbackUser = username || "automation";
      await git.addConfig("user.name", fallbackUser);
      await git.addConfig("user.email", `${fallbackUser}@users.noreply.local`);

      // Create an empty commit
      await git.raw(["commit", "--allow-empty", "-m", message || `Empty commit on ${branchName}`]);

      // Push the branch
      const pushArgs = ["-u", "origin", branchName];
      if (forcePush) {
        pushArgs.push("--force-with-lease");
      }
      await git.push(pushArgs);

      return { success: true, branch: branchName };
    } finally {
      await removeDirectoryRecursive(tempBase);
    }
  }
}

