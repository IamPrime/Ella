# Reality Competition Analytics Platform (Vertical Slice MVP)

This repository contains a runnable vertical-slice application derived from the specification in `reality_competition_analytics_platform.md`.

## What this build includes

- **Canonical Normalized Domain Model**:
  - `franchises`, `seasons`, `people`, `locations`, `person_locations`, `participations`, `game_events`, `votes`, `sources`, and `source_claims`
- **Tabbed Single-Page Interface** (instant content switching without page reloads):
  - 🗺️ **Contestant Map**: Interactive D3 geo map, world polygons, active country highlighting, pan/zoom (+/- / Reset), and hover tooltips.
  - 📊 **City Leaderboard**: D3 horizontal bar chart of top origin cities + full ranking table with breakdown of Faithfuls, Traitors, and Winners.
  - 🎯 **Voting Analytics & Sabermetrics**: Traitor detection accuracy, false accusation rate, majority alignment %, and searchable roundtable logs.
  - ⏳ **Player Journey Timeline**: Chronological episode cards with event badges (shields, murder attempts, recruitments, banishments, votes).
  - 🕸️ **Social & Voting Graph**: D3 force-directed network showing voter $\rightarrow$ target relationships with drag interaction.
- **Dynamic Country & Season Scoping**:
  - Filter across UK, US, Australia, New Zealand, Canada with "All seasons in country" or per-season drilldowns.
  - Role and outcome filtering across all tabs.
  - Franchise Host & Castle/Location context display.
- **Contestant Accordion & Provenance Layer**:
  - Single-open accordion list of matching contestants.
  - "Show Sources" toggle for auditable provenance claims, URLs, confidence scores, and formatted retrieval dates.

## Quick start

- Step 1 — Install dependencies: `npm install`
- Step 2 — Run the app: `npm start` (if port 3000 is occupied, it automatically retries on the next available port)
- Step 3 — Open the printed URL (e.g. `http://localhost:3000` or `http://localhost:3001`)

## API endpoints

- `GET /api/countries`
- `GET /api/franchises`
- `GET /api/seasons?country=`
- `GET /api/contestants?country=&seasonId=&role=&outcome=`
- `GET /api/statistics?country=&seasonId=&role=&outcome=`
- `GET /api/filter-context?country=&seasonId=`
- `GET /api/leaderboard?country=&seasonId=&role=&outcome=`
- `GET /api/voting-analytics?country=&seasonId=&role=&outcome=`
- `GET /api/people/:personId`
- `GET /api/people/:personId/timeline`
- `GET /api/voting-graph?country=&seasonId=&role=&outcome=`

## Notes

- This is the requested MVP vertical slice (Phase 1 + Phase 2 direction).
- Data is intentionally small and seeded for architecture validation.
- The schema design mirrors the normalization/provenance model so migration to PostgreSQL/Laravel can be done without rewriting product behavior.
