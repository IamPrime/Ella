const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const basePort = Number(process.env.PORT) || 3000;
const dataPath = path.join(__dirname, "data", "canonical-data.json");

function loadData() {
  const raw = fs.readFileSync(dataPath, "utf8");
  return JSON.parse(raw);
}

function indexById(records) {
  return records.reduce((acc, record) => {
    acc[record.id] = record;
    return acc;
  }, {});
}

function getParticipantRows(data, filters = {}) {
  const franchisesById = indexById(data.franchises);
  const seasonsById = indexById(data.seasons);
  const peopleById = indexById(data.people);
  const locationsById = indexById(data.locations);
  const primaryLocationsByPerson = data.person_locations
    .filter((row) => row.is_primary && row.location_type === "based_in")
    .reduce((acc, row) => {
      acc[row.person_id] = row;
      return acc;
    }, {});

  return data.participations
    .filter((participation) => {
      const season = seasonsById[participation.season_id];
      if (!season) {
        return false;
      }

      const franchise = franchisesById[season.franchise_id];
      const seasonCountry = franchise ? franchise.country : null;

      if (filters.country && seasonCountry !== filters.country) {
        return false;
      }
      if (filters.seasonId && filters.seasonId !== "all" && participation.season_id !== filters.seasonId) {
        return false;
      }
      if (filters.role && participation.final_role !== filters.role) {
        if (participation.starting_role !== filters.role) {
          return false;
        }
      }
      if (filters.outcome && participation.exit_type !== filters.outcome) {
        return false;
      }
      return true;
    })
    .map((participation) => {
      const person = peopleById[participation.person_id];
      const season = seasonsById[participation.season_id];
      const franchise = franchisesById[season.franchise_id];
      const personLocation = primaryLocationsByPerson[participation.person_id];
      const location = personLocation ? locationsById[personLocation.location_id] : null;

      return {
        participation_id: participation.id,
        franchise_id: franchise ? franchise.id : null,
        franchise_name: franchise ? franchise.name : null,
        season_title: season.title,
        season_id: season.id,
        season_number: season.season_number,
        season_country: franchise ? franchise.country : null,
        person_id: person.id,
        name: person.name,
        occupation: person.occupation,
        starting_role: participation.starting_role,
        final_role: participation.final_role,
        winner: participation.winner,
        placement: participation.placement,
        exit_type: participation.exit_type,
        exit_episode: participation.exit_episode,
        based_in: location
          ? `${location.city}, ${location.region}, ${location.country}`
          : "Unknown",
        city: location ? location.city : null,
        region: location ? location.region : null,
        country: location ? location.country : null,
        latitude: location ? location.latitude : null,
        longitude: location ? location.longitude : null
      };
    });
}

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/franchises", (req, res) => {
  const data = loadData();
  res.json(data.franchises);
});

app.get("/api/seasons", (req, res) => {
  const data = loadData();
  const franchisesById = indexById(data.franchises);
  let seasons = data.seasons.map((season) => {
    const franchise = franchisesById[season.franchise_id];
    return {
      ...season,
      franchise_name: franchise ? franchise.name : null,
      country: franchise ? franchise.country : null
    };
  });

  if (req.query.country) {
    seasons = seasons.filter((season) => season.country === req.query.country);
  }

  res.json(seasons);
});

app.get("/api/countries", (req, res) => {
  const data = loadData();
  const countries = [...new Set(data.franchises.map((franchise) => franchise.country))].sort();
  res.json(countries);
});

app.get("/api/contestants", (req, res) => {
  const data = loadData();
  const rows = getParticipantRows(data, {
    country: req.query.country || null,
    seasonId: req.query.seasonId || "all",
    role: req.query.role || null,
    outcome: req.query.outcome || null
  });

  res.json(rows);
});

app.get("/api/seasons/:seasonId/contestants", (req, res) => {
  const data = loadData();
  const rows = getParticipantRows(data, {
    seasonId: req.params.seasonId,
    role: req.query.role || null,
    outcome: req.query.outcome || null
  });
  res.json(rows);
});

app.get("/api/locations", (req, res) => {
  const data = loadData();
  const rows = getParticipantRows(data, {
    country: req.query.country || null,
    seasonId: req.query.seasonId || "all",
    role: req.query.role || null,
    outcome: req.query.outcome || null
  }).filter((row) => row.latitude !== null && row.longitude !== null);

  const byCity = rows.reduce((acc, row) => {
    const key = `${row.city}-${row.region}-${row.country}`;
    if (!acc[key]) {
      acc[key] = {
        city: row.city,
        region: row.region,
        country: row.country,
        latitude: row.latitude,
        longitude: row.longitude,
        contestant_count: 0,
        contestants: []
      };
    }
    acc[key].contestant_count += 1;
    acc[key].contestants.push({
      person_id: row.person_id,
      name: row.name,
      final_role: row.final_role,
      exit_type: row.exit_type,
      winner: row.winner,
      season_number: row.season_number,
      season_title: row.season_title,
      franchise_name: row.franchise_name
    });
    return acc;
  }, {});

  res.json(Object.values(byCity));
});

app.get("/api/seasons/:seasonId/locations", (req, res) => {
  const data = loadData();
  const rows = getParticipantRows(data, {
    seasonId: req.params.seasonId,
    role: req.query.role || null,
    outcome: req.query.outcome || null
  }).filter((row) => row.latitude !== null && row.longitude !== null);

  const byCity = rows.reduce((acc, row) => {
    if (!acc[row.city]) {
      acc[row.city] = {
        city: row.city,
        region: row.region,
        country: row.country,
        latitude: row.latitude,
        longitude: row.longitude,
        contestant_count: 0,
        contestants: []
      };
    }
    acc[row.city].contestant_count += 1;
    acc[row.city].contestants.push({
      person_id: row.person_id,
      name: row.name,
      final_role: row.final_role,
      exit_type: row.exit_type,
      winner: row.winner,
      season_number: row.season_number
    });
    return acc;
  }, {});

  res.json(Object.values(byCity));
});

app.get("/api/people/:personId", (req, res) => {
  const data = loadData();
  const person = data.people.find((p) => p.id === req.params.personId);
  if (!person) {
    res.status(404).json({ error: "Person not found" });
    return;
  }

  const participationRows = data.participations
    .filter((p) => p.person_id === person.id)
    .map((participation) => {
      const season = data.seasons.find((s) => s.id === participation.season_id);
      const franchise = season ? data.franchises.find((f) => f.id === season.franchise_id) : null;
      return {
        ...participation,
        season_title: season ? season.title : "Unknown season",
        season_number: season ? season.season_number : null,
        franchise_name: franchise ? franchise.name : null,
        country: franchise ? franchise.country : null
      };
    });

  const locationRows = data.person_locations
    .filter((pl) => pl.person_id === person.id)
    .map((pl) => {
      const location = data.locations.find((l) => l.id === pl.location_id);
      const source = data.sources.find((s) => s.id === pl.source_id) || null;
      return {
        ...pl,
        location,
        source
      };
    });

  const locationIds = new Set(locationRows.map((row) => row.id));
  const participationIds = new Set(participationRows.map((row) => row.id));

  const claims = data.source_claims
    .filter((claim) => {
      if (claim.entity_type === "person_locations") {
        return locationIds.has(claim.entity_id);
      }
      if (claim.entity_type === "participations") {
        return participationIds.has(claim.entity_id);
      }
      return false;
    })
    .map((claim) => {
      const source = data.sources.find((s) => s.id === claim.source_id) || null;
      return {
        ...claim,
        source
      };
    });

  res.json({
    person,
    participations: participationRows,
    locations: locationRows,
    claims
  });
});

app.get("/api/statistics", (req, res) => {
  const data = loadData();
  const rows = getParticipantRows(data, {
    country: req.query.country || null,
    seasonId: req.query.seasonId || "all",
    role: req.query.role || null,
    outcome: req.query.outcome || null
  });

  const stats = {
    contestants: rows.length,
    traitors: rows.filter((r) => r.final_role === "traitor").length,
    faithfuls: rows.filter((r) => r.final_role === "faithful").length,
    winners: rows.filter((r) => r.winner).length,
    cities: new Set(rows.filter((r) => r.city).map((r) => r.city)).size,
    countries: new Set(rows.filter((r) => r.country).map((r) => r.country)).size,
    seasons: new Set(rows.map((r) => r.season_id)).size,
    franchises: new Set(rows.map((r) => r.franchise_id)).size
  };

  res.json(stats);
});

app.get("/api/filter-context", (req, res) => {
  const data = loadData();
  const franchisesById = indexById(data.franchises);

  let seasons = data.seasons;
  if (req.query.country) {
    seasons = seasons.filter((season) => {
      const franchise = franchisesById[season.franchise_id];
      return franchise && franchise.country === req.query.country;
    });
  }
  if (req.query.seasonId && req.query.seasonId !== "all") {
    seasons = seasons.filter((season) => season.id === req.query.seasonId);
  }

  const seasonFranchiseIds = new Set(seasons.map((season) => season.franchise_id));
  const hosts = [...new Set(data.franchises.filter((franchise) => seasonFranchiseIds.has(franchise.id)).map((franchise) => franchise.host).filter(Boolean))];
  const venues = [...new Set(seasons.map((season) => season.filming_location).filter(Boolean))];

  res.json({
    hosts,
    venues
  });
});

app.get("/api/seasons/:seasonId/statistics", (req, res) => {
  const data = loadData();
  const rows = getParticipantRows(data, { seasonId: req.params.seasonId });

  const stats = {
    contestants: rows.length,
    traitors: rows.filter((r) => r.final_role === "traitor").length,
    faithfuls: rows.filter((r) => r.final_role === "faithful").length,
    winners: rows.filter((r) => r.winner).length,
    cities: new Set(rows.filter((r) => r.city).map((r) => r.city)).size,
    countries: new Set(rows.filter((r) => r.country).map((r) => r.country)).size
  };

  res.json(stats);
});

app.get("/api/leaderboard", (req, res) => {
  const data = loadData();
  const rows = getParticipantRows(data, {
    country: req.query.country || null,
    seasonId: req.query.seasonId || "all",
    role: req.query.role || null,
    outcome: req.query.outcome || null
  }).filter((row) => row.city);

  const byCity = {};
  rows.forEach((row) => {
    const key = `${row.city}, ${row.country}`;
    if (!byCity[key]) {
      byCity[key] = {
        city: row.city,
        region: row.region,
        country: row.country,
        total_contestants: 0,
        traitors_count: 0,
        faithfuls_count: 0,
        winners_count: 0,
        contestants: []
      };
    }
    byCity[key].total_contestants += 1;
    if (row.final_role === "traitor") byCity[key].traitors_count += 1;
    if (row.final_role === "faithful") byCity[key].faithfuls_count += 1;
    if (row.winner) byCity[key].winners_count += 1;
    byCity[key].contestants.push({
      participation_id: row.participation_id,
      person_id: row.person_id,
      name: row.name,
      final_role: row.final_role,
      season_title: row.season_title,
      winner: row.winner
    });
  });

  const ranked = Object.values(byCity).sort((a, b) => b.total_contestants - a.total_contestants || a.city.localeCompare(b.city));
  res.json(ranked);
});

app.get("/api/voting-analytics", (req, res) => {
  const data = loadData();
  const participantRows = getParticipantRows(data, {
    country: req.query.country || null,
    seasonId: req.query.seasonId || "all",
    role: req.query.role || null,
    outcome: req.query.outcome || null
  });

  const allowedPartIds = new Set(participantRows.map((p) => p.participation_id));
  const partMap = indexById(data.participations);
  const peopleMap = indexById(data.people);
  const allVotes = (data.votes || []).filter((v) => {
    if (req.query.seasonId && req.query.seasonId !== "all" && v.season_id !== req.query.seasonId) {
      return false;
    }
    return allowedPartIds.has(v.voter_participation_id) || allowedPartIds.has(v.target_participation_id);
  });

  let totalVotes = 0;
  let correctTraitorVotes = 0;
  let votesOnFaithfuls = 0;
  const votesByEpisode = {};

  allVotes.forEach((v) => {
    const key = `${v.season_id}_ep_${v.episode}`;
    if (!votesByEpisode[key]) votesByEpisode[key] = {};
    votesByEpisode[key][v.target_participation_id] = (votesByEpisode[key][v.target_participation_id] || 0) + 1;
  });

  const contestantStats = {};
  participantRows.forEach((p) => {
    contestantStats[p.participation_id] = {
      participation_id: p.participation_id,
      person_id: p.person_id,
      name: p.name,
      starting_role: p.starting_role,
      final_role: p.final_role,
      season_title: p.season_title,
      votes_cast: 0,
      correct_traitor_votes: 0,
      votes_on_faithfuls: 0,
      votes_received: 0,
      majority_aligned_votes: 0,
      accuracy_rate: 0,
      false_accusation_rate: 0,
      majority_alignment_rate: 0
    };
  });

  allVotes.forEach((v) => {
    const voter = contestantStats[v.voter_participation_id];
    const targetPart = partMap[v.target_participation_id];
    const target = contestantStats[v.target_participation_id];

    if (voter) {
      voter.votes_cast += 1;
      totalVotes += 1;

      if (targetPart && targetPart.final_role === "traitor") {
        voter.correct_traitor_votes += 1;
        correctTraitorVotes += 1;
      } else if (targetPart && targetPart.final_role === "faithful") {
        voter.votes_on_faithfuls += 1;
        votesOnFaithfuls += 1;
      }

      const epVotes = votesByEpisode[`${v.season_id}_ep_${v.episode}`] || {};
      let maxVotes = 0;
      let majorityTarget = null;
      Object.entries(epVotes).forEach(([tId, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          majorityTarget = tId;
        }
      });

      if (majorityTarget && v.target_participation_id === majorityTarget) {
        voter.majority_aligned_votes += 1;
      }
    }

    if (target) {
      target.votes_received += 1;
    }
  });

  Object.values(contestantStats).forEach((s) => {
    s.accuracy_rate = s.votes_cast > 0 ? Math.round((s.correct_traitor_votes / s.votes_cast) * 100) : 0;
    s.false_accusation_rate = s.votes_cast > 0 ? Math.round((s.votes_on_faithfuls / s.votes_cast) * 100) : 0;
    s.majority_alignment_rate = s.votes_cast > 0 ? Math.round((s.majority_aligned_votes / s.votes_cast) * 100) : 0;
  });

  const overallAccuracy = totalVotes > 0 ? Math.round((correctTraitorVotes / totalVotes) * 100) : 0;
  const overallFalseAccusation = totalVotes > 0 ? Math.round((votesOnFaithfuls / totalVotes) * 100) : 0;

  res.json({
    summary: {
      total_votes_cast: totalVotes,
      traitor_detection_accuracy: overallAccuracy,
      false_accusation_rate: overallFalseAccusation,
      total_contestants: participantRows.length
    },
    contestants: Object.values(contestantStats).sort((a, b) => b.votes_cast - a.votes_cast || b.accuracy_rate - a.accuracy_rate),
    raw_votes: allVotes.map((v) => {
      const voterPart = partMap[v.voter_participation_id];
      const targetPart = partMap[v.target_participation_id];
      return {
        id: v.id,
        episode: v.episode,
        vote_type: v.vote_type,
        voter_name: voterPart ? peopleMap[voterPart.person_id]?.name : "Unknown",
        voter_role: voterPart ? voterPart.final_role : "unknown",
        target_name: targetPart ? peopleMap[targetPart.person_id]?.name : "Unknown",
        target_role: targetPart ? targetPart.final_role : "unknown"
      };
    })
  });
});

app.get("/api/people/:personId/timeline", (req, res) => {
  const data = loadData();
  const person = data.people.find((p) => p.id === req.params.personId);
  if (!person) {
    res.status(404).json({ error: "Person not found" });
    return;
  }

  const participations = data.participations.filter((p) => p.person_id === person.id);
  const partIds = new Set(participations.map((p) => p.id));
  const partMap = indexById(data.participations);
  const peopleMap = indexById(data.people);

  const events = (data.game_events || []).filter(
    (e) => (e.actor_participation_id && partIds.has(e.actor_participation_id)) || (e.target_participation_id && partIds.has(e.target_participation_id))
  );

  const votesCast = (data.votes || []).filter((v) => partIds.has(v.voter_participation_id));
  const votesReceived = (data.votes || []).filter((v) => partIds.has(v.target_participation_id));

  const timelineItems = [];

  events.forEach((evt) => {
    timelineItems.push({
      episode: evt.episode,
      order: evt.event_order || 1,
      type: evt.event_type,
      title: evt.metadata?.label || evt.event_type,
      category: "event",
      result: evt.result
    });
  });

  votesCast.forEach((v) => {
    const targetPart = partMap[v.target_participation_id];
    const targetName = targetPart ? peopleMap[targetPart.person_id]?.name : "Unknown";
    timelineItems.push({
      episode: v.episode,
      order: 2,
      type: "vote_cast",
      title: `Voted for ${targetName} (${targetPart?.final_role || "unknown"})`,
      category: "vote_cast",
      result: "vote"
    });
  });

  votesReceived.forEach((v) => {
    const voterPart = partMap[v.voter_participation_id];
    const voterName = voterPart ? peopleMap[voterPart.person_id]?.name : "Unknown";
    timelineItems.push({
      episode: v.episode,
      order: 3,
      type: "vote_received",
      title: `Accused & received vote from ${voterName}`,
      category: "vote_received",
      result: "suspect"
    });
  });

  timelineItems.sort((a, b) => a.episode - b.episode || a.order - b.order);

  res.json({
    person,
    participations,
    timeline: timelineItems
  });
});

app.get("/api/voting-graph", (req, res) => {
  const data = loadData();
  const participantRows = getParticipantRows(data, {
    country: req.query.country || null,
    seasonId: req.query.seasonId || "all",
    role: req.query.role || null,
    outcome: req.query.outcome || null
  });

  const allowedPartIds = new Set(participantRows.map((p) => p.participation_id));
  const nodes = participantRows.map((p) => ({
    id: p.participation_id,
    person_id: p.person_id,
    name: p.name,
    role: p.final_role,
    starting_role: p.starting_role,
    winner: p.winner,
    placement: p.placement,
    season_title: p.season_title,
    city: p.city
  }));

  const linkMap = {};
  (data.votes || []).forEach((v) => {
    if (allowedPartIds.has(v.voter_participation_id) && allowedPartIds.has(v.target_participation_id)) {
      const key = `${v.voter_participation_id}->${v.target_participation_id}`;
      if (!linkMap[key]) {
        linkMap[key] = {
          source: v.voter_participation_id,
          target: v.target_participation_id,
          value: 0,
          episodes: []
        };
      }
      linkMap[key].value += 1;
      linkMap[key].episodes.push(v.episode);
    }
  });

  res.json({
    nodes,
    links: Object.values(linkMap)
  });
});

function startServer(preferredPort) {
  const server = app.listen(preferredPort, () => {
    console.log(`Reality competition analytics app running on http://localhost:${preferredPort}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const nextPort = preferredPort + 1;
      console.warn(`Port ${preferredPort} is in use. Retrying on ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    throw error;
  });
}

startServer(basePort);
