# Contributing Guide

Thank you for contributing to this project. This repository is a small but structured analytics platform, and the most important work is keeping the data model consistent and provenance-aware.

## Project goals

This project aims to support:

- franchise-agnostic reality competition analytics
- normalized, auditable contestant and season data
- geography and outcome analysis
- transparent provenance for every claim
- clean UI and backend APIs built around canonical records

## Working principles

Follow these rules when contributing:

- Preserve the canonical data model rather than adding ad hoc fields in the frontend.
- Keep source/provenance information attached to claims whenever you change data.
- Prefer reusable server-side logic over duplicating query code.
- Treat country and season filters as first-class product behavior.
- Keep UI changes simple and consistent with the existing dashboard layout.

## Repository structure

- `server.js` contains the Express API and data transformations.
- `public/app.js` controls the interactive client behavior and D3 rendering.
- `public/index.html` defines the app shell.
- `data/` stores canonical JSON records.
- `build_*.js` and `merge_new_editions.js` generate or extend the dataset.

## Setup for local development

```bash
npm install
npm start
```

Use the app in a browser and confirm the relevant dashboard view still works after your change.

## Data changes

If you modify or add dataset records:

1. Update the canonical source data in the relevant dataset file.
2. Re-run any build or merge scripts that generate the final data file.
3. Confirm the server still loads the JSON properly.
4. Check a few key API endpoints for the affected country or season.

Key endpoints to smoke test after data changes:

- `/api/countries`
- `/api/seasons?country=...`
- `/api/contestants?country=...`
- `/api/statistics?country=...`
- `/api/leaderboard?country=...`

## Frontend changes

When modifying the UI:

- Keep the controls and tabs aligned with the existing app structure.
- Avoid hard-coding assumptions that break country-specific labels or locales.
- Ensure candidate values like role and outcome are still filtered correctly.
- Test the map, leaderboard, voting tab, and contestant profile flow for regressions.

## Backend/API changes

When changing endpoints or response shapes:

- Update any frontend code that relies on the response.
- Keep response objects consistent and documented.
- Prefer filtering in the server layer so the frontend remains simple.
- Consider whether the change should also be reflected in the static app or public docs.

## Quality checklist

Before opening a PR, confirm the following:

- Local server starts successfully.
- The affected page or analytics view loads in the browser.
- Filters still work as expected.
- Data and API responses are still valid JSON.
- The change does not break province/country mappings or season scoping.
- Any new data source is documented or cited when relevant.

## Git workflow

Use a clean branching workflow:

```bash
git checkout -b feature/your-change
# make edits
git status
git add .
git commit -m "Describe your change"
```

Open a pull request with a short summary that explains:

- what changed
- why it changed
- what was validated locally

## Pull request guidance

A strong PR includes:

- a clear summary of the change
- the relevant files touched
- screenshots if the UI changed
- validation notes, such as browser checks or endpoint smoke tests

## Documentation

If you add new behavior, update the relevant docs in this repository, especially:

- the project README
- the user guide
- the getting started guide
- any API-specific notes relevant to the change

## Questions

If you are unsure whether a change belongs in the frontend, dataset, or API layer, start by tracing the data flow from the source file through the server and then into the dashboard. That keeps fixes small and reduces accidental duplication.
