# Getting Started

This project is a local, browser-based analytics dashboard for reality competition data. It serves a static frontend from the public folder and exposes JSON endpoints through an Express server.

## Prerequisites

Before you start, make sure you have:

- Node.js 18 or later
- npm 9 or later
- A local terminal with access to the repo folder

## Install dependencies

From the repository root:

```bash
npm install
```

## Run the app

Start the server:

```bash
npm start
```

The app will listen on the first available port starting at 3000. For example:

- [http://localhost:3000](Localhost 3000)
- [http://localhost:3001](Localhost 3001)

If port 3000 is already occupied, the server retries on the next port automatically.

## Verify the app is running

Open the URL printed in the terminal in a browser. The homepage should load the analytics dashboard and the filter controls should be visible.

A quick API smoke check is also useful:

```bash
curl http://localhost:3000/api/countries
```

You should receive a JSON array of countries such as United Kingdom and United States.

## Project structure

```text
.
├── public/                 # Static frontend assets
│   ├── app.js              # Dashboard behavior and D3 rendering
│   ├── index.html          # App shell and tab layout
│   └── styles.css          # Presentation and layout styles
├── data/                   # Canonical dataset JSON files
├── server.js               # Express server and API layer
├── build_full_dataset.js   # Builds the core dataset
├── build_international_dataset.js
├── merge_new_editions.js   # Merges additional franchise data
├── package.json            # Node scripts and dependencies
├── README.md               # Top-level project overview
├── reality_competition_analytics_platform.md
│                          # Product and technical specification
└── docs/                   # User and contributor docs
```

## Common startup issues

### Port already in use

The app handles this automatically by incrementing the port number. Check the terminal output for the actual URL.

### Server fails to start

Confirm the dependency install completed and that Node is available:

```bash
node --version
npm --version
```

Then retry:

```bash
npm start
```

### Browser shows blank page

Check the terminal output for runtime errors. If the frontend is blank but the API is responding, confirm the app is loading the public assets correctly and that the server is not crashing after startup.

## Recommended workflow

1. Start the app locally.
2. Apply a country or season filter.
3. Explore the map, leaderboard, voting analytics, timeline, and network graph.
4. Click a contestant to inspect profile details and provenance claims.

## Next steps

- Read the [user guide](./user-guide.md) for application usage
- Read the [contributing guide](./contributing.md) for project workflow and standards
- Review the project's product specification in [reality_competition_analytics_platform.md](../reality_competition_analytics_platform.md)
