# GScrap Core

Monorepo workspace for the GScrap library, containing core scraping functionality and CLI tools.

## Badges

[![GitHub License](https://img.shields.io/github/license/FunnyPaper/GScrap)](https://github.com/FunnyPaper/GScrap/blob/main/LICENSE)

## Description

GScrap Core is the foundation library for GScrap, providing reusable scraping utilities and a command-line interface. This is a workspace monorepo containing:

- **`packages/core`** - Core library with scraping logic and utilities
- **`packages/cli`** - CLI tool for programmatic access to GScrap functionality

## Project Structure

```
packages/gscrap/service/packages/gscrap/
├── packages/
│   ├── core/               # Core library package
│   └── cli/                # CLI package
├── package.json            # Workspace root
└── LICENSE
```

## Prerequisites

- [Node.js](https://nodejs.org/) 24.x or later
- [npm](https://www.npmjs.com/) 9.x or later

## Setup

```bash
# Install all workspace dependencies and build
npm install
```

The `prepare` script automatically runs `npm run build` on install, ensuring all workspace sub-packages are compiled.

## Available Scripts

| Script | Description |
|--------|-------------|
| `build` | Build all workspace sub-packages (`core`, `cli`) |
| `prepare` | Post-install hook that builds all packages |
| `test` | Run tests across all workspaces |

## Workspace Packages

| Package | Path | Type |
|---------|------|------|
| gscrap-core | packages/core | Library |
| gscrap-cli | packages/cli | CLI |

## Links

- **Bug Reports:** [https://github.com/FunnyPaper/GScrap/issues](https://github.com/FunnyPaper/GScrap/issues)
- **Repository:** [https://github.com/FunnyPaper/GScrap](https://github.com/FunnyPaper/GScrap)

## License

[MIT License](LICENSE)