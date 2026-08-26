// Merges the international Traitors editions (data/international-editions.js) on top of the
// original core dataset (data/canonical-data.core.json — the untouched UK/US/AU/NZ/CA data)
// and writes the combined result to data/canonical-data.json.
//
// Safe to re-run any time new editions/seasons are added to international-editions.js: it always
// rebuilds canonical-data.json from the pristine core + the current international-editions.js,
// so there's no incremental-ID drift or duplication risk.

const fs = require('fs');
const path = require('path');
const { EDITIONS } = require('./data/international-editions.js');

const core = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'canonical-data.core.json'), 'utf8'));

// A few known city coordinates for international editions. Anything not listed here falls back
// to the edition's defaultLocation (approximate national placement) rather than guessing.
const cityCoords = {
  "Amsterdam": { region: "North Holland", country: "Netherlands", lat: 52.3676, lon: 4.9041 },
  "Rotterdam": { region: "South Holland", country: "Netherlands", lat: 51.9244, lon: 4.4777 },
  "The Hague": { region: "South Holland", country: "Netherlands", lat: 52.0705, lon: 4.3007 },
  "Utrecht": { region: "Utrecht", country: "Netherlands", lat: 52.0907, lon: 5.1214 },
  "Kerkrade": { region: "Limburg", country: "Netherlands", lat: 50.8639, lon: 6.0658 }
};

function slugifyId(name) {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

const franchises = [...core.franchises];
const seasons = [...core.seasons];
const people = [...core.people];
const locations = [...core.locations];
const personLocations = [...core.person_locations];
const participations = [...core.participations];
const sources = [...core.sources];
const sourceClaims = [...core.source_claims];
const gameEvents = [...core.game_events];
const votes = [...core.votes];

const locationIdMap = new Map(locations.map(l => [l.city, l.id]));

function getOrCreateLocation(cityName, meta) {
  if (locationIdMap.has(cityName)) return locationIdMap.get(cityName);
  const locId = `loc_${slugifyId(cityName)}`;
  locations.push({
    id: locId,
    city: cityName,
    region: meta.region,
    country: meta.country,
    latitude: meta.lat,
    longitude: meta.lon
  });
  locationIdMap.set(cityName, locId);
  return locId;
}

let partCounter = Math.max(0, ...participations.map(p => parseInt(String(p.id).replace('part_', ''), 10) || 0)) ;
let plCounter = Math.max(0, ...personLocations.map(p => parseInt(String(p.id).replace('pl_', ''), 10) || 0));
let claimCounter = Math.max(0, ...sourceClaims.map(p => parseInt(String(p.id).replace('claim_', ''), 10) || 0));
let evtCounter = Math.max(0, ...gameEvents.map(p => parseInt(String(p.id).replace('evt_', ''), 10) || 0));
let voteCounter = Math.max(0, ...votes.map(p => parseInt(String(p.id).replace('v_', ''), 10) || 0));

const personIdSet = new Set(people.map(p => p.id));

for (const edition of EDITIONS) {
  franchises.push(edition.franchise);
  sources.push(edition.source);

  for (const seasonDef of edition.seasons) {
    const seasonId = `s_${edition.franchise.id.replace('fr_', '').replace('_traitors', '')}_${seasonDef.number}`;
    seasons.push({
      id: seasonId,
      franchise_id: edition.franchise.id,
      season_number: seasonDef.number,
      title: seasonDef.title,
      slug: seasonDef.slug,
      contestant_count: seasonDef.contestant_count,
      filming_location: seasonDef.filming_location
    });

    const seasonPartList = [];

    seasonDef.roster.forEach((c) => {
      let personId = `p_${slugifyId(c.name)}`;
      // Disambiguate if a person with this slug already exists under a different show (rare, but
      // some names repeat across countries) — keep distinct records per edition instead of merging.
      if (personIdSet.has(personId) && !personId.startsWith(`p_${edition.franchise.id}`)) {
        personId = `p_${edition.franchise.id.replace('fr_', '')}_${slugifyId(c.name)}`;
      }
      personIdSet.add(personId);

      people.push({
        id: personId,
        name: c.name,
        normalized_name: c.name.toLowerCase(),
        occupation: c.occupation || null
      });

      const cityName = c.city || edition.defaultLocation.city;
      const meta = cityCoords[cityName] || {
        region: c.region || edition.defaultLocation.region,
        country: edition.defaultLocation.country,
        lat: edition.defaultLocation.lat,
        lon: edition.defaultLocation.lon
      };
      const locId = getOrCreateLocation(cityName, meta);
      const plId = `pl_${++plCounter}`;

      personLocations.push({
        id: plId,
        person_id: personId,
        location_id: locId,
        location_type: "based_in",
        is_primary: true,
        source_id: edition.source.id
      });

      sourceClaims.push({
        id: `claim_${++claimCounter}`,
        source_id: edition.source.id,
        entity_type: "person_locations",
        entity_id: plId,
        field: "based_in",
        value: cityName,
        confidence: c.city ? 0.85 : 0.4
      });

      const partId = `part_${++partCounter}`;
      const partObj = {
        id: partId,
        season_id: seasonId,
        person_id: personId,
        starting_role: c.start,
        final_role: c.final,
        starting_episode: c.ep_in,
        exit_episode: c.ep_out,
        exit_type: c.exit,
        placement: c.place,
        winner: !!c.win
      };
      participations.push(partObj);
      seasonPartList.push(partObj);

      gameEvents.push({
        id: `evt_${++evtCounter}`,
        season_id: seasonId,
        episode: c.ep_in,
        event_order: 1,
        event_type: c.start === "traitor" ? "traitor_selected" : "joined",
        actor_participation_id: partId,
        target_participation_id: null,
        result: c.start,
        metadata: { label: c.start === "traitor" ? "Selected as Initial Traitor" : "Entered game as Faithful" }
      });

      if (c.start !== c.final) {
        gameEvents.push({
          id: `evt_${++evtCounter}`,
          season_id: seasonId,
          episode: c.ep_out != null ? Math.max(2, Math.min(c.ep_out - 1, 6)) : 2,
          event_order: 2,
          event_type: "traitor_recruited",
          actor_participation_id: null,
          target_participation_id: partId,
          result: "traitor",
          metadata: { label: "Accepted Recruitment and Joined the Traitors" }
        });
      }

      if (c.exit && c.exit !== "active" && c.ep_out != null) {
        gameEvents.push({
          id: `evt_${++evtCounter}`,
          season_id: seasonId,
          episode: c.ep_out,
          event_order: 3,
          event_type: c.exit === "winner" ? "winner" : c.exit === "murder" ? "murdered" : c.exit === "banishment" ? "banishment" : "finale",
          actor_participation_id: partId,
          target_participation_id: null,
          result: c.exit,
          metadata: { label: c.win ? "Winner of the Game" : `Eliminated via ${c.exit}${c.place ? ` (Rank #${c.place})` : ""}` }
        });
      }
    });

    // Synthetic roundtable votes, structurally consistent with the existing seasons' approach
    // (these are illustrative, not scraped per-episode tallies — same convention as build_full_dataset.js).
    const knownExits = seasonDef.roster.map(c => c.ep_out).filter(e => e != null);
    const finalEp = knownExits.length ? Math.max(...knownExits) : 1;
    for (let ep = 1; ep <= finalEp; ep++) {
      const activeContestants = seasonPartList.filter(p => p.exit_episode == null || p.exit_episode >= ep);
      if (activeContestants.length < 3) break;
      const suspects = activeContestants.slice().sort(() => 0.5 - Math.random()).slice(0, 3);
      activeContestants.forEach((voter) => {
        const target = suspects[Math.floor(Math.random() * suspects.length)];
        if (target && target.id !== voter.id) {
          votes.push({
            id: `v_${++voteCounter}`,
            season_id: seasonId,
            episode: ep,
            voter_participation_id: voter.id,
            target_participation_id: target.id,
            vote_type: ep === finalEp ? "final_vote" : "roundtable"
          });
        }
      });
    }
  }
}

const output = {
  franchises,
  seasons,
  people,
  locations,
  person_locations: personLocations,
  participations,
  sources,
  source_claims: sourceClaims,
  game_events: gameEvents,
  votes
};

fs.writeFileSync(path.join(__dirname, 'data', 'canonical-data.json'), JSON.stringify(output, null, 2), 'utf8');
console.log(`Merged dataset written:
- ${franchises.length} franchises (${EDITIONS.length} international editions added)
- ${seasons.length} seasons
- ${people.length} people
- ${locations.length} unique locations
- ${participations.length} participations
- ${gameEvents.length} game events
- ${votes.length} votes`);
