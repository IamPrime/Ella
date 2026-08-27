# User Guide

This dashboard helps you explore contestant geography, season outcomes, voting patterns, and provenance across reality competition franchises.

## Overview

The app is organized around a filtered analytics workspace. You can:

- choose a country
- choose a season or all seasons in that country
- filter by role and outcome
- switch between analytics tabs
- click an individual contestant to inspect a profile

## Main controls

### Country filter

The country selector limits the dataset to a franchise geography. This changes which seasons and contestants appear across the dashboard.

### Season filter

The season selector lets you:

- inspect all seasons in a country
- drill into a single season
- compare season-level patterns across the same franchise series

### Role filter

You can restrict results to:

- Faithful
- Traitor
- All roles

### Outcome filter

The outcome filter narrows the dataset by final result categories such as:

- winner
- finale
- banishment
- murder
- quit
- removed

## Dashboard tabs

### Contestant Map

This tab shows contestant home locations plotted on a world map. It includes:

- country and season scoping
- pan and zoom controls
- hover tooltips for quick details
- click-to-open contestant profiles

Use it to compare geographic clustering and contestant base locations across a filtered set.

### City Leaderboard

This view ranks cities by contestant count and shows totals for:

- traitors
- faithfuls
- winners

It is useful for seeing which hometowns and homes appear most often in the selected data slice.

### Voting Analytics

This tab summarizes:

- traitor detection accuracy
- false accusation rate
- majority alignment percentage
- raw roundtable vote activity

The metrics are derived from the votes recorded in the current filter scope.

### Outcome Funnel

This view provides a high-level outcome summary across the filtered cast. It compares:

- starting roles
- exit types
- finalists
- winners

### Role Survival

Shows the median exit episode for contestants by starting role. This helps compare how long faithfuls and traitors tend to last in a given filter set.

### Win-Rate Breakdown

This tab compares winning percentages by role and franchise. It is helpful for cross-season or cross-country comparisons.

### Elimination Timeline

This tab groups exit outcomes by episode so you can see when eliminations cluster over the season.

### Placement Distribution

This view shows where contestants finish by starting role. It is especially useful when comparing performance by role type.

### Geographic Diversity

This analytics tab highlights the number of unique cities and regions represented in a selected season or season set.

### Player Timeline

This tab displays the chronological events for a selected contestant, including:

- entry into the game
- role transitions
- votes cast
- votes received
- eliminations and results

### Social & Voting Network Graph

The network graph visualizes voter-to-target relationships. You can drag nodes and inspect the social structure of voting behavior in the selected subset.

## Contestant profile

Selecting a contestant opens a profile panel with:

- season and franchise context
- role history
- participation outcomes
- source-backed provenance claims
- any location and event metadata attached to that contestant

The profile is designed to let you inspect the relationship between a contestant record and the evidence used to support it.

## Provenance and source claims

This project is designed to preserve where data came from. When a contestant or location is selected, the profile view exposes claims and sources rather than treating the data as unverified or anonymous.

This matters because the platform is built to be:

- auditable
- extensible across new franchises
- structured around normalized data instead of free-text summaries

## Tips for using the dashboard effectively

- Start with a country and season filter before exploring deeper analytics.
- Compare one season at a time before looking at multi-season summaries.
- Use the profile panel to verify data points and provenance claims.
- Use the network graph to understand whether voting patterns are clustered or highly fragmented.
- Use the map and leaderboard together to see geographic concentration and hometown distribution.

## Data boundaries

This project currently contains a vertical-slice dataset and is designed for product validation, not as a production-grade archive of every reality competition show. The underlying schema is intentionally normalized so new seasons, countries, and franchise editions can be added over time without rewriting the product layer.

## Related docs

- [Getting Started](./getting-started.md)
- [Contributing Guide](./contributing.md)
- [Project specification](../reality_competition_analytics_platform.md)
