# Bitbucket Branch Creator CLI

Ein simples NodeJS-CLI, das eine Konfigurationsdatei einliest und basierend darauf Branches in Bitbucket erstellt und optional einen initialen Commit pro Branch anlegt – vollständig über die Bitbucket API (ohne lokalen Git-Client).

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
- `branches`: Liste von Branch-Definitionen (`name`, optional `targetName`, `from`, `commitMessage`, `filePath`, `content`, `createCommit`, `emptyCommit`, optional `placeholderPath`, `placeholderContent`)
- Optional: `username`, `appPassword`, `baseUrl`, `defaultCommitFilePath`, `defaultCommitContent`, `defaultCreateCommit`, `emptyCommitPlaceholderPath`, `emptyCommitPlaceholderContent`, `dryRun`

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

### Placeholder-Commit (anstelle eines „leeren“ Commits)
- Setze pro Branch `emptyCommit: true`. Das Tool erstellt über die Bitbucket-API einen Commit mit einer Platzhalter-Datei.
- Standard-Pfad/Content für den Platzhalter steuerst du global via `emptyCommitPlaceholderPath` und `emptyCommitPlaceholderContent` oder pro Branch via `placeholderPath`/`placeholderContent`.

Beispiel-Branch in `bb.config.json`:
```
{
  "name": "feature/gamma",
  "emptyCommit": true,
  "commitMessage": "Trigger pipeline"
}
```

## Hinweise
- Branch-Quelle `from` kann ein Branch- oder Tag-Name sein. Standard ist der Default-Branch des Repos.
- Der initiale Commit kann optional erstellt werden. Wenn aktiv, wird standardmäßig eine Datei (Default `README.md`) angelegt.
- Für einen „leeren“ Commit nutze `emptyCommit: true`; technisch wird ein Platzhalter-File committed.
- Um die Dateierstellung global zu deaktivieren, setze `defaultCommitFilePath` auf `null` (oder lasse einen `filePath` pro Branch auf `null`). In beiden Fällen wird der Commit übersprungen, sofern kein Dateipfad vorhanden ist. `defaultCreateCommit` steuert standardmäßig, ob Commits überhaupt erzeugt werden (pro Branch via `createCommit` überschreibbar).
