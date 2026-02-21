# CLAUDE.md

## Project overview

Tetris clone built with Phaser 3, deployed at https://tetris.fallibledev.com via AWS Amplify.

## Commands

- `npm start` — dev server (webpack-dev-server, mode=development)
- `npm run build` — production build (webpack, output in `dist/`)
- `npm test` — run all tests (Jest)

## Architecture

- **Entry point**: `src/index.js` — creates Phaser game instance
- **Game scene**: `src/scenes/Game.js` — main game logic
- **Managers/utilities**: `src/*.js` — modular classes (LevelManager, NextTetrominoManager, TetrominoPicker, SoundPlayer, etc.)
- **Assets**: `assets/` — JSON configs, audio (mp3), icons (svg)
- **Tests**: `test/*.test.js` — Jest unit tests
- **Build**: `webpack.config.js` — webpack 5 with DefinePlugin globals (`DEV`, `COMMIT_SHA`, etc.)

## Code conventions

- ES6 modules (`import`/`export`)
- Classes: PascalCase. Functions/vars: camelCase. Private members: leading underscore (`_bag`)
- Single-responsibility modules, dependency injection in constructors

## Deployment

- **CI**: `.github/workflows/ci.yml` — runs on PRs to main (`npm ci` → `npm test` → `npm run build`)
- **Amplify**: `amplify.yml` — AWS Amplify builds and deploys from `main` branch
- **Amplify app ID**: `d7sx40lhxsd8g` (eu-west-2)
- Commit SHA is injected at build time via `COMMIT_SHA` env var (Amplify uses `AWS_COMMIT_ID`)

## Workflow preferences

- After changes: commit → push → create PR with `--auto --merge` → poll Amplify deploy
- Use `gh` CLI for GitHub operations
- Use `aws amplify` CLI to poll deploy status: `aws amplify list-jobs --app-id d7sx40lhxsd8g --branch-name main --max-items 1`
- Feature branches merge to `main` via PR (not squash)
