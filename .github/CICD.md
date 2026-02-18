# GitHub Actions CI/CD Setup

This repository uses GitHub Actions for continuous integration and automated releases.

## Workflows

### 1. CI Workflow (`[ci.yml](./workflows/ci.yml)`)

**Trigger:** Pull requests to `main` branch

**Steps:**

- Checkout code
- Setup Node.js (using version from `.nvmrc`)
- Install dependencies
- Run linter
- Build the extension
- Run tests

### 2. Release Workflow (`[release.yml](./workflows/release.yml)`)

**Trigger:** Pushes to `main` branch

**Steps:**

- Checkout code
- Setup Node.js (using version from `.nvmrc`)
- Install dependencies
- Run linter
- Build the extension
- Run tests
- Run semantic-release (creates GitHub release and publishes to VS Code Marketplace)

## Semantic Release

This project uses [semantic-release](https://semantic-release.gitbook.io/) to automate:

- Version management (based on commit messages)
- Changelog generation
- GitHub release creation with release notes
- VS Code Marketplace publishing

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat: new feature` → Minor version bump (e.g., 1.0.0 → 1.1.0)
- `fix: bug fix` → Patch version bump (e.g., 1.0.0 → 1.0.1)
- `feat!: breaking change` or `BREAKING CHANGE:` in footer → Major version bump (e.g., 1.0.0 → 2.0.0)
- `chore:`, `docs:`, `style:`, `refactor:`, `test:` → No release

**Examples:**

```
feat: add dark mode support
fix: resolve memory leak in notes provider
docs: update README with installation steps
chore: update dependencies
```

## Required Secrets

To enable publishing to VS Code Marketplace, add the following secret to your GitHub repository:

### `VSCE_PAT` (Personal Access Token)

1. Go to [Azure DevOps](https://dev.azure.com/)
2. Create a Personal Access Token with **Marketplace (Manage)** scope
3. Add it as a repository secret:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `VSCE_PAT`
   - Value: Your Azure DevOps PAT

The `GITHUB_TOKEN` is automatically provided by GitHub Actions.

## Publisher Configuration

Before publishing, ensure your `package.json` has the correct publisher name:

```json
{
  "publisher": "your-publisher-id"
}
```

To create a publisher account, visit the [VS Code Marketplace Publisher Management](https://marketplace.visualstudio.com/manage).
