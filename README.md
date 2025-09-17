# Bitbucket Branch Creator CLI

Ein simples NodeJS-CLI, das eine Konfigurationsdatei einliest und basierend darauf Branches in Bitbucket erstellt und optional einen initialen Commit pro Branch anlegt.

## Voraussetzungen
- Node.js >= 18
- Bitbucket App Password und Username mit Zugriff auf das Repository

## Installation
```
npm install
```

## Konfiguration
1. `.env` anlegen (optional, siehe `.env.example`):
```
cp .env.example .env
```
2. Konfigurationsdatei anlegen (siehe `bb.config.example.json`):
```
cp bb.config.example.json bb.config.json
```
Felder:
- `workspace`: Bitbucket Workspace
- `repoSlug`: Repository-Slug
- `branches`: Liste von Branch-Definitionen (`name`, optional `from`, `commitMessage`, `filePath`, `content`, `createCommit`)
- Du kannst statt `name` auch `branch` verwenden
- Optional: `username`, `appPassword`, `baseUrl`, `defaultCommitFilePath`, `defaultCommitContent`, `dryRun`
 - Optional global: `createCommit` (Default true) – setzt das Standardverhalten fürs Anlegen eines initialen Commits, pro Branch via `createCommit: false` überschreibbar

Env-Variablen (alternativ zur Konfig-Datei):
- `BITBUCKET_USERNAME`, `BITBUCKET_APP_PASSWORD`, `BITBUCKET_BASE_URL`
- `DRY_RUN=true` für Trockenlauf

## Nutzung
- Trockenlauf:
```
npm run bb:dry -- -c bb.config.json
```
- Ausführen:
```
npm run bb -- -c bb.config.json
```

## Hinweise
- Branch-Quelle `from` kann ein Branch- oder Tag-Name sein. Standard ist der Default-Branch des Repos.
- Der initiale Commit erstellt eine Datei (Default `README.md`).
  - Das Erstellen des Commits ist optional: global via `createCommit: false` oder pro Branch via `createCommit: false`.
