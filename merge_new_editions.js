// One-off helper: takes raw research JS/JSON files from the scratchpad (each shaped like
// { franchise, seasons, source_urls, confidence, notes } or { franchises: [...], seasons: [{franchise_slug,...}] })
// and appends them, normalized into the EDITIONS shape build_international_dataset.js expects,
// onto data/international-editions.js. Re-run per batch of new research; safe since it just
// appends to the in-memory array read from the current file, then rewrites the whole file.

const fs = require('fs');
const path = require('path');

const SCRATCH = 'C:\\Users\\primu\\AppData\\Local\\Temp\\claude\\c--Users-primu-OneDrive-Documents-A-Requiem-Ella\\07ca2216-09a8-4820-8dcd-2b62b0fd2eaf\\scratchpad';
const EDITIONS_FILE = path.join(__dirname, 'data', 'international-editions.js');

function loadRaw(filename) {
  const p = path.join(SCRATCH, filename);
  const text = fs.readFileSync(p, 'utf8');
  try {
    return JSON.parse(text);
  } catch (e) {
    // Not plain JSON (has comments / module.exports) — load as a JS module instead.
    return require(p);
  }
}

// --- Country metadata needed to complete each franchise entry ---
const COUNTRY_META = {
  cz: { id: 'fr_cz_traitors', defaultLocation: { city: 'Prague', region: 'Prague', country: 'Czechia', lat: 50.0755, lon: 14.4378 } },
  dk: { id: 'fr_dk_traitors', defaultLocation: { city: 'Copenhagen', region: 'Capital Region', country: 'Denmark', lat: 55.6761, lon: 12.5683 } },
  dk_ug: { id: 'fr_dk_ukendtgrund_traitors', defaultLocation: { city: 'Copenhagen', region: 'Capital Region', country: 'Denmark', lat: 55.6761, lon: 12.5683 } },
  fi: { id: 'fr_fi_traitors', defaultLocation: { city: 'Helsinki', region: 'Uusimaa', country: 'Finland', lat: 60.1699, lon: 24.9384 } },
  gr: { id: 'fr_gr_traitors', defaultLocation: { city: 'Athens', region: 'Attica', country: 'Greece', lat: 37.9838, lon: 23.7275 } },
  fr: { id: 'fr_fr_traitors', defaultLocation: { city: 'Paris', region: 'Île-de-France', country: 'France', lat: 48.8566, lon: 2.3522 } },
  de: { id: 'fr_de_traitors', defaultLocation: { city: 'Berlin', region: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050 } },
  hu: { id: 'fr_hu_traitors', defaultLocation: { city: 'Budapest', region: 'Central Hungary', country: 'Hungary', lat: 47.4979, lon: 19.0402 } },
  in: { id: 'fr_in_traitors', defaultLocation: { city: 'Mumbai', region: 'Maharashtra', country: 'India', lat: 19.0760, lon: 72.8777 } },
  ie: { id: 'fr_ie_traitors', defaultLocation: { city: 'Dublin', region: 'Leinster', country: 'Ireland', lat: 53.3498, lon: -6.2603 } },
  il: { id: 'fr_il_traitors', defaultLocation: { city: 'Tel Aviv', region: 'Tel Aviv District', country: 'Israel', lat: 32.0853, lon: 34.7818 } },
  it: { id: 'fr_it_traitors', defaultLocation: { city: 'Rome', region: 'Lazio', country: 'Italy', lat: 41.9028, lon: 12.4964 } },
  no: { id: 'fr_no_traitors', defaultLocation: { city: 'Oslo', region: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522 } },
  pl: { id: 'fr_pl_traitors', defaultLocation: { city: 'Warsaw', region: 'Masovian', country: 'Poland', lat: 52.2297, lon: 21.0122 } },
  pt: { id: 'fr_pt_traitors', defaultLocation: { city: 'Lisbon', region: 'Lisbon', country: 'Portugal', lat: 38.7223, lon: -9.1393 } },
  ro: { id: 'fr_ro_traitors', defaultLocation: { city: 'Bucharest', region: 'Bucharest', country: 'Romania', lat: 44.4268, lon: 26.1025 } },
  es: { id: 'fr_es_traitors', defaultLocation: { city: 'Madrid', region: 'Community of Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038 } },
  se: { id: 'fr_se_traitors', defaultLocation: { city: 'Stockholm', region: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686 } },
  ca_fr: { id: 'fr_ca_fr_traitors', defaultLocation: { city: 'Quebec City', region: 'Quebec', country: 'Canada (Québec)', lat: 46.8139, lon: -71.2080 } },
  ua: { id: 'fr_ua_traitors', defaultLocation: { city: 'Kyiv', region: 'Kyiv', country: 'Ukraine', lat: 50.4501, lon: 30.5234 } }
};

function makeSourceId(slug) {
  return `src_${slug.replace(/-/g, '_')}`;
}

function normalizeSingleFranchiseEdition(raw, meta) {
  return {
    franchise: { id: meta.id, ...raw.franchise },
    source: {
      id: makeSourceId(raw.franchise.slug),
      url: (raw.source_urls && raw.source_urls[0]) || '',
      source_type: 'research',
      publisher: 'Wikipedia / press (compiled)',
      retrieved_at: '2026-08-24T00:00:00Z',
      title: `${raw.franchise.name} — Season Archive`
    },
    defaultLocation: meta.defaultLocation,
    seasons: raw.seasons.map(s => ({
      number: s.season_number,
      title: s.title,
      slug: `${raw.franchise.slug}-s${s.season_number}`,
      filming_location: s.filming_location,
      contestant_count: s.contestant_count,
      roster: s.roster
    }))
  };
}

const newEditions = [];

// Portugal
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_portugal.js'), COUNTRY_META.pt));

// Romania
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_romania.js'), COUNTRY_META.ro));

// Spain
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_spain.js'), COUNTRY_META.es));

// Sweden
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_sweden.js'), COUNTRY_META.se));

// Canada (Québec)
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_canada_quebec.js'), COUNTRY_META.ca_fr));

// Ukraine
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_ukraine.js'), COUNTRY_META.ua));

/* Already merged in a previous run — kept here as a record of what's been processed:
// Italy
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_italy.js'), COUNTRY_META.it));

// Norway
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_norway.js'), COUNTRY_META.no));

// Poland
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_poland.js'), COUNTRY_META.pl));

// India
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_india.js'), COUNTRY_META.in));

// Ireland
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_ireland.js'), COUNTRY_META.ie));

// Israel
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_israel.js'), COUNTRY_META.il));

// France
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_france.js'), COUNTRY_META.fr));

// Germany
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_germany.js'), COUNTRY_META.de));

// Hungary
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_hungary.js'), COUNTRY_META.hu));

// Greece
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_greece.js'), COUNTRY_META.gr));
// Czechia
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_czechia.js'), COUNTRY_META.cz));

// Finland
newEditions.push(normalizeSingleFranchiseEdition(loadRaw('traitors_finland.js'), COUNTRY_META.fi));

// Denmark — two franchises sharing one raw file, seasons tagged by franchise_slug
const dkRaw = loadRaw('traitors_denmark.js');
for (const franchiseDef of dkRaw.franchises) {
  const meta = franchiseDef.slug === 'forraeder-denmark' ? COUNTRY_META.dk : COUNTRY_META.dk_ug;
  const seasonsForThis = dkRaw.seasons.filter(s => s.franchise_slug === franchiseDef.slug);
  newEditions.push({
    franchise: { id: meta.id, name: franchiseDef.name, country: franchiseDef.country, host: franchiseDef.host, language: franchiseDef.language, network: franchiseDef.network, slug: franchiseDef.slug },
    source: {
      id: makeSourceId(franchiseDef.slug),
      url: (dkRaw.source_urls && dkRaw.source_urls[0]) || '',
      source_type: 'research',
      publisher: 'Wikipedia / press (compiled)',
      retrieved_at: '2026-08-24T00:00:00Z',
      title: `${franchiseDef.name} — Season Archive`
    },
    defaultLocation: meta.defaultLocation,
    seasons: seasonsForThis.map(s => ({
      number: s.season_number,
      title: s.title,
      slug: `${franchiseDef.slug}-s${s.season_number}`,
      filming_location: s.filming_location,
      contestant_count: s.contestant_count,
      roster: s.roster
    }))
  });
}
*/

// --- Append to existing EDITIONS and rewrite the file ---
const { EDITIONS: existingEditions } = require(EDITIONS_FILE);
const merged = [...existingEditions, ...newEditions];

const header = `// International Traitors editions data, added beyond the original UK/US/AU/NZ/CA(English) set.
// Each entry in EDITIONS follows the same shape build_international_dataset.js expects:
//
// {
//   franchise: { id, name, country, host, language, network, slug },
//   source: { id, url, source_type, publisher, retrieved_at, title },
//   defaultLocation: { city, region, country, lat, lon },   // fallback when a contestant's hometown isn't known
//   seasons: [
//     { number, title, slug, filming_location, contestant_count,
//       roster: [ { name, city, region, occupation, start, final, exit, ep_in, ep_out, place, win } ] }
//   ]
// }
//
// "start"/"final" are "faithful" | "traitor". "exit" is one of:
//   "winner" | "finale" | "murder" | "banishment" | "quit" | "unknown"
// Roster entries without a known hometown just omit/null "city"/"region" (defaultLocation is used instead).
// Regenerated by merge_new_editions.js — hand edits will survive until the next merge run overwrites this file.

`;

const body = `const EDITIONS = ${JSON.stringify(merged, null, 2)};\n\nmodule.exports = { EDITIONS };\n`;

fs.writeFileSync(EDITIONS_FILE, header + body, 'utf8');
console.log(`Merged ${newEditions.length} new franchise entries. Total editions now: ${merged.length}`);
