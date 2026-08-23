const countryFilter = document.getElementById("countryFilter");
const seasonFilter = document.getElementById("seasonFilter");
const roleFilter = document.getElementById("roleFilter");
const outcomeFilter = document.getElementById("outcomeFilter");
const profilePanel = document.getElementById("profilePanel");
const statsPanel = document.getElementById("seasonStats");
const showContextPanel = document.getElementById("showContext");
const tooltip = document.getElementById("tooltip");
const mapRoot = document.getElementById("mapRoot");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomResetBtn = document.getElementById("zoomResetBtn");
const graphZoomInBtn = document.getElementById("graphZoomInBtn");
const graphZoomOutBtn = document.getElementById("graphZoomOutBtn");
const graphZoomResetBtn = document.getElementById("graphZoomResetBtn");
const timelinePlayerSelect = document.getElementById("timelinePlayerSelect");

const COUNTRY_NAME_LOOKUP = {
  "United Kingdom": [
    "United Kingdom",
    "UK",
    "Great Britain",
    "United Kingdom of Great Britain and Northern Ireland",
    "England",
    "Scotland",
    "Wales",
    "Northern Ireland"
  ],
  "United States": ["United States of America", "United States", "USA"],
  Australia: ["Australia"],
  "New Zealand": ["New Zealand"],
  Canada: ["Canada"]
};

const COUNTRY_CODE_LOOKUP = {
  "United Kingdom": ["GB", "GBR", "UK"],
  "United States": ["US", "USA"],
  Australia: ["AU", "AUS"],
  "New Zealand": ["NZ", "NZL"],
  Canada: ["CA", "CAN"]
};

let worldGeoJson = null;
let currentContestants = [];
let selectedParticipationId = null;
let activeTab = "tab-map";
let showSources = false;
let graphSimulation = null;
const profileCache = new Map();

/* Map Setup */
const svg = d3
  .select("#mapRoot")
  .append("svg")
  .style("width", "100%")
  .style("height", "100%");

const mapLayer = svg.append("g");
const pointsLayer = svg.append("g");
const labelsLayer = svg.append("g");

// Upper bound raised from 8x to 40x so small, tightly-clustered countries (e.g. UK)
// can be zoomed in far enough to separate individual contestant points.
const zoomBehavior = d3.zoom().scaleExtent([0.1, 40]).on("zoom", (event) => {
  mapLayer.attr("transform", event.transform);
  pointsLayer.attr("transform", event.transform);
  labelsLayer.attr("transform", event.transform);
});

svg.call(zoomBehavior).on("dblclick.zoom", null);

zoomInBtn.addEventListener("click", () => {
  svg.transition().duration(180).call(zoomBehavior.scaleBy, 1.4);
});

zoomOutBtn.addEventListener("click", () => {
  svg.transition().duration(180).call(zoomBehavior.scaleBy, 0.7);
});

zoomResetBtn.addEventListener("click", () => {
  svg.transition().duration(220).call(zoomBehavior.transform, d3.zoomIdentity);
});

/* Social Graph pan/zoom (re-bound each render since the graph SVG is rebuilt) */
let graphZoomBehavior = null;
let graphSvgSelection = null;

graphZoomInBtn.addEventListener("click", () => {
  if (!graphSvgSelection || !graphZoomBehavior) return;
  graphSvgSelection.transition().duration(180).call(graphZoomBehavior.scaleBy, 1.4);
});

graphZoomOutBtn.addEventListener("click", () => {
  if (!graphSvgSelection || !graphZoomBehavior) return;
  graphSvgSelection.transition().duration(180).call(graphZoomBehavior.scaleBy, 0.7);
});

graphZoomResetBtn.addEventListener("click", () => {
  if (!graphSvgSelection || !graphZoomBehavior) return;
  graphSvgSelection.transition().duration(220).call(graphZoomBehavior.transform, d3.zoomIdentity);
});

/* Tab Switching */
const tabButtons = document.querySelectorAll(".tab-btn");
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetTab = btn.dataset.tab;
    if (activeTab === targetTab) return;

    tabButtons.forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((panel) => panel.classList.remove("active"));

    btn.classList.add("active");
    const activePanel = document.getElementById(targetTab);
    if (activePanel) activePanel.classList.add("active");

    activeTab = targetTab;
    handleTabActivation(targetTab);
  });
});

function handleTabActivation(tabId) {
  if (tabId === "tab-map") {
    renderMap(currentContestants);
  } else if (tabId === "tab-leaderboard") {
    loadAndRenderLeaderboard();
  } else if (tabId === "tab-voting") {
    loadAndRenderVotingAnalytics();
  } else if (tabId === "tab-timeline") {
    loadAndRenderTimeline();
  } else if (tabId === "tab-graph") {
    loadAndRenderSocialGraph();
  }
}

function roleColor(role) {
  if (role === "traitor") return "#be123c";
  if (role === "faithful") return "#0f766e";
  return "#334155";
}

function humanizeLocationType(locationType) {
  if (!locationType) return "Unknown";
  return locationType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function humanizeTimestamp(isoValue) {
  if (!isoValue) return "Unknown";
  const parsed = new Date(isoValue);
  if (Number.isNaN(parsed.getTime())) return isoValue;

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(parsed);
}

async function jsonFetch(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${url}`);
  }
  return res.json();
}

function buildQueryString() {
  const params = new URLSearchParams();
  if (countryFilter.value) params.set("country", countryFilter.value);
  if (seasonFilter.value) params.set("seasonId", seasonFilter.value);
  if (roleFilter.value) params.set("role", roleFilter.value);
  if (outcomeFilter.value) params.set("outcome", outcomeFilter.value);
  return params.toString();
}

function clearSelect(select) {
  while (select.options.length > 0) {
    select.remove(0);
  }
}

function fillCountryFilter(countries) {
  clearSelect(countryFilter);
  countries.forEach((country) => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    countryFilter.appendChild(option);
  });
}

function fillSeasonFilter(seasons) {
  const currentValue = seasonFilter.value;
  clearSelect(seasonFilter);

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All seasons in country";
  seasonFilter.appendChild(allOption);

  seasons
    .sort((a, b) => a.season_number - b.season_number)
    .forEach((season) => {
      const option = document.createElement("option");
      option.value = season.id;
      option.textContent = `${season.franchise_name} - Season ${season.season_number}`;
      seasonFilter.appendChild(option);
    });

  if ([...seasonFilter.options].some((o) => o.value === currentValue)) {
    seasonFilter.value = currentValue;
  } else {
    seasonFilter.value = "all";
  }
}

function renderStats(stats) {
  statsPanel.innerHTML = "";
  const rows = [
    ["Franchises", stats.franchises],
    ["Seasons", stats.seasons],
    ["Contestants", stats.contestants],
    ["Traitors", stats.traitors],
    ["Faithfuls", stats.faithfuls],
    ["Winners", stats.winners],
    ["Cities", stats.cities],
    ["Countries", stats.countries]
  ];

  rows.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.innerHTML = `<strong>${label}:</strong> ${value}`;
    statsPanel.appendChild(row);
  });
}

function renderShowContext(context) {
  const hosts = context.hosts && context.hosts.length ? context.hosts.join(", ") : "Unknown";
  const venues = context.venues && context.venues.length ? context.venues.join(", ") : "Unknown";

  showContextPanel.innerHTML = `
    <div><strong>Host:</strong> ${hosts}</div>
    <div><strong>Location:</strong> ${venues}</div>
  `;
}

function tooltipHtml(point) {
  return [
    `<strong>${point.name}</strong>`,
    `${point.franchise_name || ""} S${point.season_number || ""} | <span style="text-transform:capitalize">${point.final_role || ""}</span>`,
    `${point.city || ""}, ${point.region || ""}`,
    `Outcome: ${point.exit_type || "active"}`
  ].join("<br />");
}

function showTooltip(event, htmlContent) {
  tooltip.hidden = false;
  tooltip.innerHTML = htmlContent;
  tooltip.style.left = `${event.clientX + 14}px`;
  tooltip.style.top = `${event.clientY + 14}px`;
}

function hideTooltip() {
  tooltip.hidden = true;
}

function dimensions(element) {
  const target = element || mapRoot;
  const bounds = target.getBoundingClientRect();
  return {
    width: Math.max(320, Math.floor(bounds.width || 600)),
    height: Math.max(340, Math.floor(bounds.height || 400))
  };
}

function featureForCountry(country) {
  const aliases = (COUNTRY_NAME_LOOKUP[country] || [country]).map((entry) => entry.toLowerCase().trim());
  const codes = (COUNTRY_CODE_LOOKUP[country] || []).map((entry) => entry.toUpperCase().trim());
  return worldGeoJson.features.find((feature) => featureMatchesCountry(feature, aliases, codes)) || null;
}

function featureMatchesCountry(feature, aliases, codes) {
  const properties = feature.properties || {};
  const names = [
    properties.name,
    properties.admin,
    properties.sovereignt,
    properties.formal_en,
    properties.name_en,
    properties.brk_name
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase().trim());

  const featureCodes = [properties.iso_a2, properties.iso_a3]
    .filter(Boolean)
    .map((value) => String(value).toUpperCase().trim());

  const nameMatch = aliases.some((alias) => names.includes(alias));
  const codeMatch = codes.some((code) => featureCodes.includes(code));
  return nameMatch || codeMatch;
}

function isCountrySelectedFeature(feature, country, selectedFeature) {
  if (selectedFeature && feature === selectedFeature) {
    return true;
  }
  const aliases = (COUNTRY_NAME_LOOKUP[country] || [country]).map((entry) => entry.toLowerCase().trim());
  const codes = (COUNTRY_CODE_LOOKUP[country] || []).map((entry) => entry.toUpperCase().trim());
  return featureMatchesCountry(feature, aliases, codes);
}

function pointFeatureCollection(contestants) {
  return {
    type: "FeatureCollection",
    features: contestants.map((point) => ({
      type: "Feature",
      properties: { id: point.participation_id },
      geometry: {
        type: "Point",
        coordinates: [point.longitude, point.latitude]
      }
    }))
  };
}

/* ==========================================================================
   TAB 1: D3 Map Visualization
   ========================================================================== */
function renderMap(contestants) {
  if (!worldGeoJson) return;
  const mapContestants = (contestants || []).filter((c) => c.latitude !== null && c.longitude !== null);
  const { width, height } = dimensions(mapRoot);
  svg.attr("viewBox", `0 0 ${width} ${height}`);

  const projection = d3.geoMercator();
  const pathGenerator = d3.geoPath(projection);

  const activeCountry = countryFilter.value;
  const countryFeature = featureForCountry(countryFilter.value);
  const usePointFitForCountry = activeCountry === "United Kingdom" && mapContestants.length > 1;

  if (usePointFitForCountry) {
    projection.fitExtent([[128, 128], [width - 128, height - 128]], pointFeatureCollection(mapContestants));
  } else if (countryFeature) {
    projection.fitExtent([[64, 64], [width - 64, height - 64]], countryFeature);
  } else if (mapContestants.length > 1) {
    projection.fitExtent([[72, 72], [width - 72, height - 72]], pointFeatureCollection(mapContestants));
  } else {
    projection.fitExtent([[64, 64], [width - 64, height - 64]], {
      type: "FeatureCollection",
      features: worldGeoJson.features
    });
  }

  svg.call(zoomBehavior.transform, d3.zoomIdentity);

  mapLayer.selectAll("*").remove();
  pointsLayer.selectAll("*").remove();
  labelsLayer.selectAll("*").remove();

  mapLayer
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#dff5ff");

  mapLayer
    .selectAll("path.country")
    .data(worldGeoJson.features)
    .join("path")
    .attr("class", "country")
    .attr("d", pathGenerator)
    .attr("fill", (feature) => {
      if (isCountrySelectedFeature(feature, activeCountry, countryFeature)) {
        return "#d0f5e8";
      }
      return "#f8fbff";
    })
    .attr("stroke", "#97a6b5")
    .attr("stroke-width", (feature) => {
      if (isCountrySelectedFeature(feature, activeCountry, countryFeature)) {
        return 1.8;
      }
      return 0.6;
    });

  mapContestants.forEach((point) => {
    const projected = projection([point.longitude, point.latitude]);
    if (!projected) return;

    const [x, y] = projected;

    pointsLayer
      .append("circle")
      .attr("class", "contestant-point")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 7)
      .attr("fill", roleColor(point.final_role))
      .attr("fill-opacity", 0.9)
      .attr("stroke", point.winner ? "#f59e0b" : "#ffffff")
      .attr("stroke-width", point.winner ? 3 : 1.4)
      .style("cursor", "pointer")
      .on("mousemove", (event) => showTooltip(event, tooltipHtml(point)))
      .on("mouseleave", hideTooltip)
      .on("click", () => selectContestantByPerson(point.person_id));

    labelsLayer
      .append("text")
      .attr("x", x + 10)
      .attr("y", y - 9)
      .attr("font-size", 10)
      .attr("fill", "#1f2937")
      .text(point.city);
  });
}

/* ==========================================================================
   TAB 2: City Leaderboard (Bar Chart & Table)
   ========================================================================== */
async function loadAndRenderLeaderboard() {
  const chartBox = document.getElementById("leaderboardChart");
  const tableBox = document.getElementById("leaderboardTable");
  chartBox.innerHTML = "<div class='profile-empty'>Loading city rankings...</div>";

  try {
    const query = buildQueryString();
    const data = await jsonFetch(`/api/leaderboard?${query}`);

    if (!data.length) {
      chartBox.innerHTML = "<div class='profile-empty'>No city data available for this filter.</div>";
      tableBox.innerHTML = "";
      return;
    }

    // Render D3 Bar Chart
    chartBox.innerHTML = "";
    const width = chartBox.clientWidth || 550;
    const height = Math.min(320, data.length * 36 + 40);

    const svgBar = d3
      .select("#leaderboardChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const maxCount = d3.max(data, (d) => d.total_contestants) || 1;
    const x = d3.scaleLinear().domain([0, maxCount]).range([120, width - 40]);
    const y = d3.scaleBand().domain(data.map((d) => d.city)).range([10, height - 10]).padding(0.25);

    // Bars
    svgBar
      .selectAll("rect.bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", 120)
      .attr("y", (d) => y(d.city))
      .attr("width", (d) => Math.max(4, x(d.total_contestants) - 120))
      .attr("height", y.bandwidth())
      .attr("fill", "var(--accent)")
      .attr("rx", 4);

    // City Labels
    svgBar
      .selectAll("text.label")
      .data(data)
      .join("text")
      .attr("class", "label")
      .attr("x", 110)
      .attr("y", (d) => y(d.city) + y.bandwidth() / 2 + 4)
      .attr("text-anchor", "end")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", "#334155")
      .text((d) => d.city);

    // Value Labels
    svgBar
      .selectAll("text.value")
      .data(data)
      .join("text")
      .attr("class", "value")
      .attr("x", (d) => x(d.total_contestants) + 6)
      .attr("y", (d) => y(d.city) + y.bandwidth() / 2 + 4)
      .attr("font-size", "11px")
      .attr("font-weight", "700")
      .attr("fill", "var(--accent)")
      .text((d) => d.total_contestants);

    // Render Table
    tableBox.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>City</th>
            <th>Country</th>
            <th>Total</th>
            <th>Faithfuls</th>
            <th>Traitors</th>
            <th>Winners</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (item, i) => `
            <tr>
              <td><span class="rank-badge">${i + 1}</span></td>
              <td><strong>${item.city}</strong></td>
              <td>${item.country}</td>
              <td><strong>${item.total_contestants}</strong></td>
              <td><span class="role-pill faithful">${item.faithfuls_count}</span></td>
              <td><span class="role-pill traitor">${item.traitors_count}</span></td>
              <td><span class="role-pill winner">${item.winners_count}</span></td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch (err) {
    chartBox.innerHTML = `<div class='profile-empty'>Failed to load leaderboard: ${err.message}. Please restart the server (<code>npm start</code>) to activate new API routes.</div>`;
    tableBox.innerHTML = "";
  }
}

/* ==========================================================================
   TAB 3: Voting Analytics & Sabermetrics
   ========================================================================== */
async function loadAndRenderVotingAnalytics() {
  const summaryBox = document.getElementById("votingSummaryMetrics");
  const tableBox = document.getElementById("votingTableContainer");
  const logBox = document.getElementById("rawVoteLogContainer");

  summaryBox.innerHTML = "<div class='profile-empty'>Computing voting metrics...</div>";

  try {
    const query = buildQueryString();
    const data = await jsonFetch(`/api/voting-analytics?${query}`);
    const { summary, contestants, raw_votes } = data;

    summaryBox.innerHTML = `
      <div class="metric-card">
        <div class="metric-num">${summary.total_votes_cast}</div>
        <div class="metric-label">Total Votes Cast</div>
      </div>
      <div class="metric-card">
        <div class="metric-num">${summary.traitor_detection_accuracy}%</div>
        <div class="metric-label">Traitor Accuracy</div>
      </div>
      <div class="metric-card">
        <div class="metric-num red">${summary.false_accusation_rate}%</div>
        <div class="metric-label">False Accusations</div>
      </div>
      <div class="metric-card">
        <div class="metric-num">${summary.total_contestants}</div>
        <div class="metric-label">Active Players</div>
      </div>
    `;

    tableBox.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Contestant</th>
            <th>Role</th>
            <th>Season</th>
            <th>Votes Cast</th>
            <th>Traitor Hits</th>
            <th>False Accusations</th>
            <th>Votes Received</th>
            <th>Majority %</th>
            <th>Accuracy %</th>
          </tr>
        </thead>
        <tbody>
          ${contestants
            .map(
              (c) => `
            <tr>
              <td><a href="javascript:void(0)" onclick="selectContestantByPerson('${c.person_id}')"><strong>${c.name}</strong></a></td>
              <td><span class="role-pill ${c.final_role}">${c.final_role}</span></td>
              <td>${c.season_title}</td>
              <td>${c.votes_cast}</td>
              <td>${c.correct_traitor_votes}</td>
              <td>${c.votes_on_faithfuls}</td>
              <td>${c.votes_received}</td>
              <td><strong>${c.majority_alignment_rate}%</strong></td>
              <td><strong>${c.accuracy_rate}%</strong></td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    logBox.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Episode</th>
            <th>Voter</th>
            <th>Voter Role</th>
            <th>Target Accused</th>
            <th>Target Role</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          ${raw_votes
            .map(
              (v) => `
            <tr>
              <td>Ep ${v.episode}</td>
              <td><strong>${v.voter_name}</strong></td>
              <td><span class="role-pill ${v.voter_role}">${v.voter_role}</span></td>
              <td><strong>${v.target_name}</strong></td>
              <td><span class="role-pill ${v.target_role}">${v.target_role}</span></td>
              <td>${v.vote_type}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch (err) {
    summaryBox.innerHTML = `<div class='profile-empty'>Failed to load voting analytics: ${err.message}</div>`;
  }
}

/* ==========================================================================
   TAB 4: Player Journey Timeline
   ========================================================================== */
function populateTimelineSelector() {
  const currentSelection = timelinePlayerSelect.value;
  clearSelect(timelinePlayerSelect);

  currentContestants.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.person_id;
    opt.textContent = `${c.name} (${c.franchise_name || ""} S${c.season_number || ""} - ${c.final_role || ""})`;
    timelinePlayerSelect.appendChild(opt);
  });

  if (selectedParticipationId) {
    const match = currentContestants.find((c) => c.participation_id === selectedParticipationId);
    if (match) timelinePlayerSelect.value = match.person_id;
  } else if ([...timelinePlayerSelect.options].some((o) => o.value === currentSelection)) {
    timelinePlayerSelect.value = currentSelection;
  }
}

timelinePlayerSelect.addEventListener("change", () => {
  loadAndRenderTimeline();
});

async function loadAndRenderTimeline() {
  populateTimelineSelector();
  const personId = timelinePlayerSelect.value;
  const container = document.getElementById("playerTimelineRoot");

  if (!personId) {
    container.innerHTML = "<div class='profile-empty'>No contestants available for this selection.</div>";
    return;
  }

  container.innerHTML = "<div class='profile-empty'>Loading player timeline...</div>";

  try {
    const data = await jsonFetch(`/api/people/${personId}/timeline`);
    const { person, timeline } = data;

    if (!timeline.length) {
      container.innerHTML = `<div class='profile-empty'>No detailed events recorded for ${person.name}.</div>`;
      return;
    }

    container.innerHTML = timeline
      .map((item) => {
        let tagClass = "event";
        if (item.category === "vote_cast") tagClass = "vote_cast";
        if (item.category === "vote_received") tagClass = "vote_received";

        return `
        <div class="timeline-card">
          <div class="timeline-badge-col">
            Ep ${item.episode}
            <span>Event</span>
          </div>
          <div class="timeline-content">
            <span class="timeline-tag ${tagClass}">${item.type.replace(/_/g, " ")}</span>
            <div class="timeline-title">${item.title}</div>
          </div>
        </div>
      `;
      })
      .join("");
  } catch (err) {
    container.innerHTML = `<div class='profile-empty'>Failed to load timeline: ${err.message}</div>`;
  }
}

/* ==========================================================================
   TAB 5: Social / Voting Force-Directed Graph
   ========================================================================== */

// Soft containment force: only nudges a node once it drifts past the padded
// viewBox edge, pulling it back proportional to the overshoot. Nodes well
// inside the bounds are left untouched, so normal clustering/spacing is
// unaffected — this just stops weakly-connected outliers from being flung
// off-screen by the charge force with nothing pulling them back.
function forceContain(width, height, padding = 40, strength = 0.06) {
  let nodes;
  function force() {
    for (const d of nodes) {
      if (d.x < padding) d.vx += (padding - d.x) * strength;
      else if (d.x > width - padding) d.vx += (width - padding - d.x) * strength;
      if (d.y < padding) d.vy += (padding - d.y) * strength;
      else if (d.y > height - padding) d.vy += (height - padding - d.y) * strength;
    }
  }
  force.initialize = (_nodes) => {
    nodes = _nodes;
  };
  return force;
}

async function loadAndRenderSocialGraph() {
  const root = document.getElementById("graphRoot");
  root.innerHTML = "<div class='profile-empty'>Generating voting network graph...</div>";

  try {
    const query = buildQueryString();
    const data = await jsonFetch(`/api/voting-graph?${query}`);
    const { nodes = [], links = [] } = data;

    if (!nodes.length) {
      root.innerHTML = "<div class='profile-empty'>No contestants available for this selection.</div>";
      return;
    }

    root.innerHTML = "";
    const { width, height } = dimensions(root);

    const svgGraph = d3
      .select("#graphRoot")
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "100%");

    // Everything pannable/zoomable lives inside this layer so outlier nodes
    // pushed outside the viewBox by the force simulation stay reachable.
    const graphLayer = svgGraph.append("g").attr("class", "graph-content");

    graphZoomBehavior = d3.zoom().scaleExtent([0.1, 40]).on("zoom", (event) => {
      graphLayer.attr("transform", event.transform);
    });

    svgGraph.call(graphZoomBehavior).on("dblclick.zoom", null);
    svgGraph.call(graphZoomBehavior.transform, d3.zoomIdentity);
    graphSvgSelection = svgGraph;

    // Arrow marker definition
    graphLayer
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#94a3b8");

    if (graphSimulation) graphSimulation.stop();

    const cleanNodes = nodes.map((d) => ({ ...d }));
    const cleanLinks = links.map((d) => ({ ...d }));

    graphSimulation = d3
      .forceSimulation(cleanNodes)
      .force(
        "link",
        d3.forceLink(cleanLinks).id((d) => d.id).distance(120)
      )
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35))
      .force("contain", forceContain(width, height));

    const link = graphLayer
      .append("g")
      .selectAll("line")
      .data(cleanLinks)
      .join("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.min(6, 1.5 + (d.value || 1) * 0.8))
      .attr("marker-end", "url(#arrowhead)");

    const node = graphLayer
      .append("g")
      .selectAll("g")
      .data(cleanNodes)
      .join("g")
      .style("cursor", "pointer")
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) graphSimulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) graphSimulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    node
      .append("circle")
      .attr("r", 15)
      .attr("fill", (d) => roleColor(d.role))
      .attr("stroke", (d) => (d.winner ? "#f59e0b" : "#ffffff"))
      .attr("stroke-width", (d) => (d.winner ? 3.5 : 1.5));

    node
      .append("text")
      .attr("y", 26)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("fill", "#1e293b")
      .text((d) => d.name);

    node
      .on("mousemove", (event, d) => {
        showTooltip(
          event,
          `<strong>${d.name}</strong><br/>${d.season_title}<br/>Role: <span style="text-transform:capitalize">${d.role}</span>`
        );
      })
      .on("mouseleave", hideTooltip)
      .on("click", (event, d) => {
        selectContestantByPerson(d.person_id);
      });

    graphSimulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });
  } catch (err) {
    root.innerHTML = `<div class='profile-empty'>Failed to load social graph: ${err.message}. If you recently updated, please restart the server (<code>npm start</code>) and refresh.</div>`;
  }
}

/* ==========================================================================
   Profile Accordion & List Management
   ========================================================================== */
function profileSummary(row) {
  const role = `${row.starting_role} -> ${row.final_role}`;
  const outcome = row.exit_type || "unknown";
  return `${row.franchise_name} S${row.season_number} | ${role} | ${outcome}`;
}

function renderProfileDetails(payload, activeContestant) {
  const { person, participations, locations, claims } = payload;

  const participationRows = participations
    .sort((a, b) => {
      if (a.country === b.country) {
        return a.season_number - b.season_number;
      }
      return (a.country || "").localeCompare(b.country || "");
    })
    .map((part) => {
      return `
        <div class="claim">
          <div><strong>Season:</strong> ${part.season_title}</div>
          <div><strong>Country:</strong> ${part.country || "Unknown"}</div>
          <div><strong>Start role:</strong> ${part.starting_role}</div>
          <div><strong>Final role:</strong> ${part.final_role}</div>
          <div><strong>Episodes:</strong> ${part.starting_episode ?? "?"} to ${part.exit_episode ?? "?"}</div>
          <div><strong>Placement:</strong> ${part.placement ?? "Unknown"}</div>
          <div><strong>Outcome:</strong> ${part.exit_type || "Unknown"}</div>
          <div><strong>Winner:</strong> ${part.winner ? "Yes" : "No"}</div>
        </div>
      `;
    })
    .join("");

  const locationRows = locations
    .map((locationRow) => {
      const location = locationRow.location;
      const source = locationRow.source;
      return `
        <div class="claim">
          <div><strong>Type:</strong> ${humanizeLocationType(locationRow.location_type)}</div>
          <div><strong>Location:</strong> ${location ? `${location.city}, ${location.region}, ${location.country}` : "Unknown"}</div>
          <div><strong>Coordinates:</strong> ${location ? `${location.latitude}, ${location.longitude}` : "Unknown"}</div>
          <div><strong>Primary:</strong> ${locationRow.is_primary ? "Yes" : "No"}</div>
          ${showSources ? `<div><strong>Source:</strong> ${source ? `<a href="${source.url}" target="_blank" rel="noreferrer">${source.title || source.url}</a>` : "Unknown"}</div>` : ""}
          ${showSources ? `<div><strong>Retrieved:</strong> ${source ? humanizeTimestamp(source.retrieved_at) : "Unknown"}</div>` : ""}
        </div>
      `;
    })
    .join("");

  const claimRows = claims.length
    ? claims
        .map((claim) => {
          return `
            <div class="claim">
              <div><strong>Entity:</strong> ${claim.entity_type}</div>
              <div><strong>Field:</strong> ${claim.field}</div>
              <div><strong>Value:</strong> ${claim.value}</div>
              <div><strong>Confidence:</strong> ${claim.confidence ?? "n/a"}</div>
              <div><strong>Source:</strong> ${claim.source ? `<a href="${claim.source.url}" target="_blank" rel="noreferrer">${claim.source.title || claim.source.url}</a>` : "Unknown"}</div>
            </div>
          `;
        })
        .join("")
    : "<p class=\"profile-empty\">No provenance claims found.</p>";

  return `
    <div class="profile-head">
      <p class="profile-name">${person.name}</p>
      <p class="profile-sub">${person.occupation || "Unknown occupation"}</p>
      <p class="profile-sub">${activeContestant.city || ""}, ${activeContestant.region || ""}, ${activeContestant.country || ""}</p>
    </div>
    <div class="row"><strong>Season:</strong> ${activeContestant.franchise_name || ""} Season ${activeContestant.season_number || ""}</div>
    <div class="row"><strong>Outcome:</strong> ${activeContestant.exit_type || "Unknown"}</div>
    <div class="row"><strong>Participations:</strong> ${participations.length}</div>
    <h3>Season Participation History</h3>
    ${participationRows || "<p class=\"profile-empty\">No participation records.</p>"}
    <h3>Locations</h3>
    ${locationRows || "<p class=\"profile-empty\">No location records.</p>"}
    ${showSources ? `<h3>Provenance Claims</h3>${claimRows}` : ""}
  `;
}

async function loadProfile(personId) {
  try {
    if (!profileCache.has(personId)) {
      const payload = await jsonFetch(`/api/people/${personId}`);
      profileCache.set(personId, payload);
    }
    return profileCache.get(personId);
  } catch (error) {
    return null;
  }
}

function renderContestantList(contestants) {
  currentContestants = contestants;

  if (!currentContestants.length) {
    profilePanel.innerHTML = "<div class=\"profile-empty\">No contestant profile available for the current filters.</div>";
    return;
  }

  if (selectedParticipationId && !currentContestants.some((row) => row.participation_id === selectedParticipationId)) {
    selectedParticipationId = null;
  }

  const itemsHtml = currentContestants
    .map((row) => {
      const isActive = row.participation_id === selectedParticipationId;
      return `
        <div class="contestant-item ${isActive ? "active" : ""}" data-participation-id="${row.participation_id}">
          <button class="contestant-header" data-participation-id="${row.participation_id}" type="button" aria-expanded="${isActive ? "true" : "false"}">
            <span class="contestant-title">${row.name}</span>
            <span class="contestant-summary">${profileSummary(row)}</span>
          </button>
          <div class="contestant-body" data-detail-id="${row.participation_id}">${isActive ? "<div class=\"profile-empty\">Loading profile...</div>" : ""}</div>
        </div>
      `;
    })
    .join("");

  profilePanel.innerHTML = `
    <div class="profile-toolbar">
      <label class="sources-toggle">
        <input id="sourcesToggle" type="checkbox" ${showSources ? "checked" : ""} />
        Show Sources
      </label>
      <span class="profile-count">${currentContestants.length} contestants found</span>
    </div>
    <div class="contestant-list">${itemsHtml}</div>
  `;

  const toggle = document.getElementById("sourcesToggle");
  if (toggle) {
    toggle.addEventListener("change", (event) => {
      showSources = event.target.checked;
      renderContestantList(currentContestants);
      hydrateActiveContestant();
    });
  }

  const headers = profilePanel.querySelectorAll(".contestant-header");
  headers.forEach((header) => {
    header.addEventListener("click", () => {
      if (selectedParticipationId === header.dataset.participationId) {
        selectedParticipationId = null;
      } else {
        selectedParticipationId = header.dataset.participationId;
      }
      renderContestantList(currentContestants);
      hydrateActiveContestant();
    });
  });
}

async function hydrateActiveContestant() {
  if (!selectedParticipationId) return;

  const activeContestant = currentContestants.find((row) => row.participation_id === selectedParticipationId);
  if (!activeContestant) return;

  const detailNode = profilePanel.querySelector(`[data-detail-id="${selectedParticipationId}"]`);
  if (!detailNode) return;

  detailNode.innerHTML = "<div class=\"profile-empty\">Loading profile...</div>";
  const payload = await loadProfile(activeContestant.person_id);
  if (!payload) {
    detailNode.innerHTML = "<div class=\"profile-empty\">Contestant profile unavailable for this selection.</div>";
    return;
  }

  detailNode.innerHTML = renderProfileDetails(payload, activeContestant);
}

function selectContestantByPerson(personId) {
  const match = currentContestants.find((row) => row.person_id === personId);
  if (!match) return;

  selectedParticipationId = match.participation_id;
  renderContestantList(currentContestants);
  hydrateActiveContestant();

  if (activeTab === "tab-timeline") {
    timelinePlayerSelect.value = personId;
    loadAndRenderTimeline();
  }
}

async function refresh() {
  const query = buildQueryString();
  const [contestants, stats, context] = await Promise.all([
    jsonFetch(`/api/contestants?${query}`),
    jsonFetch(`/api/statistics?${query}`),
    jsonFetch(`/api/filter-context?${query}`)
  ]);

  currentContestants = contestants;
  renderStats(stats);
  renderShowContext(context);
  renderContestantList(contestants);
  await hydrateActiveContestant();
  handleTabActivation(activeTab);
}

async function loadCountryScopedSeasons() {
  const seasons = await jsonFetch(`/api/seasons?country=${encodeURIComponent(countryFilter.value)}`);
  fillSeasonFilter(seasons);
}

countryFilter.addEventListener("change", async () => {
  await loadCountryScopedSeasons();
  await refresh();
});

[seasonFilter, roleFilter, outcomeFilter].forEach((el) => {
  el.addEventListener("change", refresh);
});

window.addEventListener("resize", () => {
  if (activeTab === "tab-map") renderMap(currentContestants);
  if (activeTab === "tab-leaderboard") loadAndRenderLeaderboard();
  if (activeTab === "tab-graph") loadAndRenderSocialGraph();
});

(async function init() {
  try {
    const [countries, geo] = await Promise.all([
      jsonFetch("/api/countries"),
      jsonFetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    ]);

    worldGeoJson = geo;
    fillCountryFilter(countries);

    if (countries.length > 0) {
      countryFilter.value = countries[0];
    }

    await loadCountryScopedSeasons();
    await refresh();
  } catch (error) {
    profilePanel.innerHTML = `<div class="profile-empty">Failed to load data: ${error.message}</div>`;
  }
})();
