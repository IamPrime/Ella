# Reality Competition Analytics Platform

This repository is a vertical-slice analytics application for reality competition data, built around a canonical, normalized, provenance-aware model.

## Project overview

The app presents a browser-based dashboard for exploring:

- contestant geography by country and season
- city-level origin breakdowns
- voting and elimination analytics
- player timelines
- social/voting network graphs
- source-backed contestant profiles

The product direction is defined in [reality_competition_analytics_platform.md](reality_competition_analytics_platform.md), and the application is designed as a foundation for franchise-agnostic expansion beyond The Traitors.

## Features

- Canonical normalized domain model covering franchises, seasons, people, locations, participations, votes, and source claims
- Interactive D3-powered map, leaderboard, voting summary, and network graph
- Country and season scoping with role and outcome filters
- Contestant profile panel with provenance metadata
- Express API for filtering and analytics queries

## Quick start

```bash
npm install
npm start
```

Then open the printed local URL, usually:

- [http://localhost:3000](Localhost)
- or the next available port if 3000 is in use

## Documentation

- [Getting Started](./docs/getting-started.md)
- [User Guide](./docs/user-guide.md)
- [Contributing Guide](./docs/contributing.md)
- [Documentation Index](./docs/README.md)

## Key API endpoints

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

## Project structure

```text
.
├── public/                  # Frontend UI assets
├── data/                    # Canonical dataset files
├── docs/                    # User and contribution docs
├── server.js                # Express API and dataset loading
├── build_full_dataset.js    # Dataset builder
├── build_international_dataset.js
├── merge_new_editions.js    # International editions merge helper
├── package.json             # App metadata and scripts
├── README.md                # Root project guide
├── reality_competition_analytics_platform.md
└── server.js
```

## Notes

- This is a vertical-slice MVP for product validation and architecture exploration.
- The data model is intentionally normalized so new franchises and seasons can be added without redesigning the app.
- Provenance is considered a first-class concern, not a later feature.
