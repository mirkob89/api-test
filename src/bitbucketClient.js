import axios from "axios";

export class BitbucketClient {
  constructor({ baseUrl, workspace, repoSlug, username, appPassword, dryRun = false }) {
    const normalizedBase = (baseUrl || "https://api.bitbucket.org/2.0").replace(/\/+$/, "");
    this.baseUrl = `${normalizedBase}/`;
    this.workspace = workspace;
    this.repoSlug = repoSlug;
    this.username = username;
    this.appPassword = appPassword;
    this.dryRun = dryRun;
    this.http = axios.create({
      baseURL: this.baseUrl,
      auth: username && appPassword ? { username, password: appPassword } : undefined,
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });
  }

  async getDefaultBranchOrMaster() {
    const url = `repositories/${encodeURIComponent(this.workspace)}/${encodeURIComponent(this.repoSlug)}`;
    const { data } = await this.http.get(url);
    const mainRef = data?.mainbranch?.name || data?.default_branch;
    return mainRef || "master";
  }

  async branchExists(branchName) {
    try {
      const url = `repositories/${encodeURIComponent(this.workspace)}/${encodeURIComponent(this.repoSlug)}/refs/branches/${encodeURIComponent(branchName)}`;
      await this.http.get(url);
      return true;
    } catch (error) {
      if (error?.response?.status === 404) return false;
      throw error;
    }
  }

  async createBranch({ name, from }) {
    if (this.dryRun) {
      return { dryRun: true, action: "createBranch", name, from };
    }
    const url = `repositories/${encodeURIComponent(this.workspace)}/${encodeURIComponent(this.repoSlug)}/refs/branches`;
    const payload = { name, target: { hash: from } };
    const { data } = await this.http.post(url, payload);
    return data;
  }

  async getCommitHashForRef(refName) {
    // Accept a branch or tag name, return its commit hash
    const url = `repositories/${encodeURIComponent(this.workspace)}/${encodeURIComponent(this.repoSlug)}/refs/branches/${encodeURIComponent(refName)}`;
    try {
      const { data } = await this.http.get(url);
      return data?.target?.hash;
    } catch (error) {
      if (error?.response?.status !== 404) throw error;
      // Try as a tag
      const tagUrl = `repositories/${encodeURIComponent(this.workspace)}/${encodeURIComponent(this.repoSlug)}/refs/tags/${encodeURIComponent(refName)}`;
      const { data } = await this.http.get(tagUrl);
      return data?.target?.hash;
    }
  }

  async createCommit({ branch, message = "Initial commit", filePath = "README.md", content = "Created by automation." }) {
    if (this.dryRun) {
      return { dryRun: true, action: "createCommit", branch, message, filePath };
    }
    const url = `repositories/${encodeURIComponent(this.workspace)}/${encodeURIComponent(this.repoSlug)}/src`;
    // Bitbucket API expects multipart form for creating commits with files
    // To avoid a heavy dependency, we can construct the payload manually, but since we installed form-data, use it
    const FormData = (await import("form-data")).default;
    const form = new FormData();
    form.append(filePath, content);
    form.append("branch", branch);
    form.append("message", message);

    const headers = form.getHeaders();
    const { data } = await this.http.post(url, form, { headers });
    return data;
  }
}

