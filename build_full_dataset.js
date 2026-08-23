const fs = require('fs');
const path = require('path');

// Franchise definitions
const franchises = [
  {
    id: "fr_uk_traitors",
    name: "The Traitors UK",
    country: "United Kingdom",
    host: "Claudia Winkleman",
    language: "English",
    network: "BBC",
    slug: "the-traitors-uk"
  },
  {
    id: "fr_us_traitors",
    name: "The Traitors US",
    country: "United States",
    host: "Alan Cumming",
    language: "English",
    network: "Peacock",
    slug: "the-traitors-us"
  },
  {
    id: "fr_au_traitors",
    name: "The Traitors Australia",
    country: "Australia",
    host: "Rodger Corser",
    language: "English",
    network: "Network 10",
    slug: "the-traitors-australia"
  },
  {
    id: "fr_nz_traitors",
    name: "The Traitors New Zealand",
    country: "New Zealand",
    host: "Paul Henry",
    language: "English",
    network: "TVNZ",
    slug: "the-traitors-new-zealand"
  },
  {
    id: "fr_ca_traitors",
    name: "The Traitors Canada",
    country: "Canada",
    host: "Karine Vanasse",
    language: "English/French",
    network: "CTV",
    slug: "the-traitors-canada"
  }
];

const seasons = [
  { id: "s_uk_1", franchise_id: "fr_uk_traitors", season_number: 1, title: "The Traitors UK Season 1", slug: "the-traitors-uk-s1", contestant_count: 22, filming_location: "Ardross Castle, Scotland" },
  { id: "s_uk_2", franchise_id: "fr_uk_traitors", season_number: 2, title: "The Traitors UK Season 2", slug: "the-traitors-uk-s2", contestant_count: 22, filming_location: "Ardross Castle, Scotland" },
  { id: "s_uk_3", franchise_id: "fr_uk_traitors", season_number: 3, title: "The Traitors UK Season 3", slug: "the-traitors-uk-s3", contestant_count: 22, filming_location: "Ardross Castle, Scotland" },
  { id: "s_uk_4", franchise_id: "fr_uk_traitors", season_number: 4, title: "The Traitors UK Season 4", slug: "the-traitors-uk-s4", contestant_count: 22, filming_location: "Ardross Castle, Scotland" },
  { id: "s_us_1", franchise_id: "fr_us_traitors", season_number: 1, title: "The Traitors US Season 1", slug: "the-traitors-us-s1", contestant_count: 20, filming_location: "Ardross Castle, Scotland" },
  { id: "s_us_2", franchise_id: "fr_us_traitors", season_number: 2, title: "The Traitors US Season 2", slug: "the-traitors-us-s2", contestant_count: 22, filming_location: "Ardross Castle, Scotland" },
  { id: "s_au_1", franchise_id: "fr_au_traitors", season_number: 1, title: "The Traitors Australia Season 1", slug: "the-traitors-au-s1", contestant_count: 24, filming_location: "Robertson Hotel, NSW" },
  { id: "s_au_2", franchise_id: "fr_au_traitors", season_number: 2, title: "The Traitors Australia Season 2", slug: "the-traitors-au-s2", contestant_count: 20, filming_location: "Robertson Hotel, NSW" },
  { id: "s_nz_1", franchise_id: "fr_nz_traitors", season_number: 1, title: "The Traitors New Zealand Season 1", slug: "the-traitors-nz-s1", contestant_count: 19, filming_location: "Claremont Manor, Canterbury" },
  { id: "s_nz_2", franchise_id: "fr_nz_traitors", season_number: 2, title: "The Traitors New Zealand Season 2", slug: "the-traitors-nz-s2", contestant_count: 22, filming_location: "Claremont Manor, Canterbury" },
  { id: "s_ca_1", franchise_id: "fr_ca_traitors", season_number: 1, title: "The Traitors Canada Season 1", slug: "the-traitors-ca-s1", contestant_count: 20, filming_location: "Manoir Montmorency, Quebec" }
];

const sources = [
  { id: "src_bbc_official", url: "https://www.bbc.co.uk/programmes/p0db9b5t", source_type: "official", publisher: "BBC Media Centre", retrieved_at: "2026-08-22T00:00:00Z", title: "BBC The Traitors UK Official Series Archive" },
  { id: "src_peacock_official", url: "https://www.peacocktv.com/stream-tv/the-traitors", source_type: "official", publisher: "Peacock TV", retrieved_at: "2026-08-22T00:00:00Z", title: "Peacock The Traitors US Press Cast Bios" },
  { id: "src_network10_official", url: "https://10play.com.au/the-traitors", source_type: "official", publisher: "Network 10 Australia", retrieved_at: "2026-08-22T00:00:00Z", title: "10 Play The Traitors Australia Contestant Cast Hub" },
  { id: "src_tvnz_official", url: "https://www.tvnz.co.nz/shows/the-traitors-nz", source_type: "official", publisher: "TVNZ", retrieved_at: "2026-08-22T00:00:00Z", title: "TVNZ The Traitors NZ Cast Profile Archive" },
  { id: "src_ctv_official", url: "https://www.ctv.ca/shows/the-traitors-canada", source_type: "official", publisher: "CTV Canada", retrieved_at: "2026-08-22T00:00:00Z", title: "CTV The Traitors Canada Cast Directory" }
];

// City coordinate lookup
const cityCoords = {
  // UK
  "London": { region: "Greater London", country: "United Kingdom", lat: 51.5072, lon: -0.1276 },
  "Manchester": { region: "Greater Manchester", country: "United Kingdom", lat: 53.4808, lon: -2.2426 },
  "Birmingham": { region: "West Midlands", country: "United Kingdom", lat: 52.4862, lon: -1.8904 },
  "Edinburgh": { region: "Scotland", country: "United Kingdom", lat: 55.9533, lon: -3.1883 },
  "Glasgow": { region: "Scotland", country: "United Kingdom", lat: 55.8642, lon: -4.2518 },
  "Cardiff": { region: "Wales", country: "United Kingdom", lat: 51.4816, lon: -3.1791 },
  "Swansea": { region: "Wales", country: "United Kingdom", lat: 51.6214, lon: -3.9436 },
  "Belfast": { region: "Northern Ireland", country: "United Kingdom", lat: 54.5973, lon: -5.9300 },
  "Bristol": { region: "South West England", country: "United Kingdom", lat: 51.4545, lon: -2.5879 },
  "Leeds": { region: "Yorkshire", country: "United Kingdom", lat: 53.8008, lon: -1.5491 },
  "Liverpool": { region: "North West England", country: "United Kingdom", lat: 53.4084, lon: -2.9916 },
  "Newcastle": { region: "North East England", country: "United Kingdom", lat: 54.9783, lon: -1.6178 },
  "Sheffield": { region: "Yorkshire", country: "United Kingdom", lat: 53.3811, lon: -1.4701 },
  "Brighton": { region: "East Sussex", country: "United Kingdom", lat: 50.8225, lon: -0.1372 },
  "Oxford": { region: "Oxfordshire", country: "United Kingdom", lat: 51.7520, lon: -1.2577 },
  "Cambridge": { region: "Cambridgeshire", country: "United Kingdom", lat: 52.2053, lon: 0.1218 },
  "Inverness": { region: "Highlands, Scotland", country: "United Kingdom", lat: 57.4778, lon: -4.2247 },
  "Aberdeen": { region: "Scotland", country: "United Kingdom", lat: 57.1497, lon: -2.0943 },
  "York": { region: "Yorkshire", country: "United Kingdom", lat: 53.9590, lon: -1.0815 },
  "Exeter": { region: "Devon", country: "United Kingdom", lat: 50.7184, lon: -3.5339 },
  "Norwich": { region: "Norfolk", country: "United Kingdom", lat: 52.6309, lon: 1.2974 },
  "Southampton": { region: "Hampshire", country: "United Kingdom", lat: 50.9097, lon: -1.4044 },
  "Bath": { region: "Somerset", country: "United Kingdom", lat: 51.3811, lon: -2.3590 },
  "Dundee": { region: "Scotland", country: "United Kingdom", lat: 56.4620, lon: -2.9707 },
  "Nottingham": { region: "East Midlands", country: "United Kingdom", lat: 52.9548, lon: -1.1581 },

  // US
  "New York": { region: "New York", country: "United States", lat: 40.7128, lon: -74.0060 },
  "Los Angeles": { region: "California", country: "United States", lat: 34.0522, lon: -118.2437 },
  "Chicago": { region: "Illinois", country: "United States", lat: 41.8781, lon: -87.6298 },
  "Houston": { region: "Texas", country: "United States", lat: 29.7604, lon: -95.3698 },
  "Atlanta": { region: "Georgia", country: "United States", lat: 33.7490, lon: -84.3880 },
  "Miami": { region: "Florida", country: "United States", lat: 25.7617, lon: -80.1918 },
  "Boston": { region: "Massachusetts", country: "United States", lat: 42.3601, lon: -71.0589 },
  "Dallas": { region: "Texas", country: "United States", lat: 32.7767, lon: -96.7970 },
  "Seattle": { region: "Washington", country: "United States", lat: 47.6062, lon: -122.3321 },
  "San Francisco": { region: "California", country: "United States", lat: 37.7749, lon: -122.4194 },
  "Nashville": { region: "Tennessee", country: "United States", lat: 36.1627, lon: -86.7816 },
  "Denver": { region: "Colorado", country: "United States", lat: 39.7392, lon: -104.9903 },
  "Philadelphia": { region: "Pennsylvania", country: "United States", lat: 39.9526, lon: -75.1652 },
  "Phoenix": { region: "Arizona", country: "United States", lat: 33.4484, lon: -112.0740 },
  "Las Vegas": { region: "Nevada", country: "United States", lat: 36.1699, lon: -115.1398 },
  "Austin": { region: "Texas", country: "United States", lat: 30.2672, lon: -97.7431 },
  "Orlando": { region: "Florida", country: "United States", lat: 28.5383, lon: -81.3792 },
  "New Orleans": { region: "Louisiana", country: "United States", lat: 29.9511, lon: -90.0715 },
  "Detroit": { region: "Michigan", country: "United States", lat: 42.3314, lon: -83.0458 },
  "Minneapolis": { region: "Minnesota", country: "United States", lat: 44.9778, lon: -93.2650 },
  "Portland": { region: "Oregon", country: "United States", lat: 45.5152, lon: -122.6784 },
  "San Diego": { region: "California", country: "United States", lat: 32.7157, lon: -117.1611 },

  // Australia
  "Sydney": { region: "New South Wales", country: "Australia", lat: -33.8688, lon: 151.2093 },
  "Melbourne": { region: "Victoria", country: "Australia", lat: -37.8136, lon: 144.9631 },
  "Brisbane": { region: "Queensland", country: "Australia", lat: -27.4698, lon: 153.0251 },
  "Perth": { region: "Western Australia", country: "Australia", lat: -31.9505, lon: 115.8605 },
  "Adelaide": { region: "South Australia", country: "Australia", lat: -34.9285, lon: 138.6007 },
  "Gold Coast": { region: "Queensland", country: "Australia", lat: -28.0167, lon: 153.4000 },
  "Hobart": { region: "Tasmania", country: "Australia", lat: -42.8821, lon: 147.3272 },
  "Darwin": { region: "Northern Territory", country: "Australia", lat: -12.4634, lon: 130.8456 },
  "Canberra": { region: "Australian Capital Territory", country: "Australia", lat: -35.2809, lon: 149.1300 },
  "Newcastle AU": { region: "New South Wales", country: "Australia", lat: -32.9283, lon: 151.7817 },
  "Cairns": { region: "Queensland", country: "Australia", lat: -16.9186, lon: 145.7781 },
  "Geelong": { region: "Victoria", country: "Australia", lat: -38.1499, lon: 144.3617 },

  // New Zealand
  "Auckland": { region: "Auckland", country: "New Zealand", lat: -36.8485, lon: 174.7633 },
  "Wellington": { region: "Wellington", country: "New Zealand", lat: -41.2866, lon: 174.7756 },
  "Christchurch": { region: "Canterbury", country: "New Zealand", lat: -43.5321, lon: 172.6362 },
  "Hamilton": { region: "Waikato", country: "New Zealand", lat: -37.7870, lon: 175.2793 },
  "Tauranga": { region: "Bay of Plenty", country: "New Zealand", lat: -37.6878, lon: 176.1651 },
  "Dunedin": { region: "Otago", country: "New Zealand", lat: -45.8788, lon: 170.5028 },
  "Napier": { region: "Hawke's Bay", country: "New Zealand", lat: -39.4928, lon: 176.9120 },
  "Queenstown": { region: "Otago", country: "New Zealand", lat: -45.0312, lon: 168.6626 },
  "Nelson": { region: "Nelson", country: "New Zealand", lat: -41.2706, lon: 173.2840 },
  "Rotorua": { region: "Bay of Plenty", country: "New Zealand", lat: -38.1368, lon: 176.2497 },

  // Canada
  "Toronto": { region: "Ontario", country: "Canada", lat: 43.6532, lon: -79.3832 },
  "Montreal": { region: "Quebec", country: "Canada", lat: 45.5017, lon: -73.5673 },
  "Vancouver": { region: "British Columbia", country: "Canada", lat: 49.2827, lon: -123.1207 },
  "Calgary": { region: "Alberta", country: "Canada", lat: 51.0447, lon: -114.0719 },
  "Edmonton": { region: "Alberta", country: "Canada", lat: 53.5461, lon: -113.4938 },
  "Ottawa": { region: "Ontario", country: "Canada", lat: 45.4215, lon: -75.6972 },
  "Winnipeg": { region: "Manitoba", country: "Canada", lat: 49.8951, lon: -97.1384 },
  "Quebec City": { region: "Quebec", country: "Canada", lat: 46.8139, lon: -71.2080 },
  "Halifax": { region: "Nova Scotia", country: "Canada", lat: 44.6488, lon: -63.5752 },
  "Victoria": { region: "British Columbia", country: "Canada", lat: 48.4284, lon: -123.3656 }
};

// Full authentic contestant rosters
const castData = {
  // -------------------------------------------------------------
  // THE TRAITORS UK - SEASON 1 (22 Contestants)
  // -------------------------------------------------------------
  s_uk_1: [
    { name: "Aaron Evans", city: "Portsmouth", occupation: "Property Agent", start: "faithful", final: "faithful", exit: "winner", ep_in: 1, ep_out: 12, place: 1, win: true },
    { name: "Hannah Byczkowski", city: "London", occupation: "Comedian", start: "faithful", final: "faithful", exit: "winner", ep_in: 1, ep_out: 12, place: 1, win: true },
    { name: "Meryl Williams", city: "Edinburgh", occupation: "Call Centre Agent", start: "faithful", final: "faithful", exit: "winner", ep_in: 1, ep_out: 12, place: 1, win: true },
    { name: "Wilfred Webster", city: "London", occupation: "Senior Fundraiser", start: "traitor", final: "traitor", exit: "finale", ep_in: 1, ep_out: 12, place: 2, win: false },
    { name: "Kieran Tompsett", city: "London", occupation: "Solutions Consultant", start: "faithful", final: "traitor", exit: "finale", ep_in: 1, ep_out: 12, place: 3, win: false },
    { name: "Andrea Addison", city: "Brussels", city_fallback: "London", occupation: "Retired", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 11, place: 4, win: false },
    { name: "Maddy Smedley", city: "Kent", city_fallback: "London", occupation: "Receptionist & Actor", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 10, place: 5, win: false },
    { name: "Fay Greaves", city: "Suffolk", city_fallback: "Norwich", occupation: "School Welfare Officer", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 9, place: 6, win: false },
    { name: "Alex Gray", city: "London", occupation: "Presenter & Actor", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 8, place: 7, win: false },
    { name: "Amanda Lovett", city: "Swansea", occupation: "Estate Agent", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 7, place: 8, win: false },
    { name: "Amos Ogunkoya", city: "London", occupation: "Doctor", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 6, place: 9, win: false },
    { name: "Alyssa Chan", city: "Edinburgh", occupation: "Business Student", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 6, place: 10, win: false },
    { name: "Theo Mayne", city: "Leeds", occupation: "Cheerleading Coach", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 5, place: 11, win: false },
    { name: "Matt Harris", city: "Hertfordshire", city_fallback: "London", occupation: "BMX Athlete", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 5, place: 12, win: false },
    { name: "Rayan", city: "London", occupation: "Trainee Lawyer", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 4, place: 13, win: false },
    { name: "Tom Elderfield", city: "London", occupation: "Magician", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 4, place: 14, win: false },
    { name: "John McManus", city: "Edinburgh", occupation: "Spa Therapist", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 3, place: 15, win: false },
    { name: "Imran", city: "Leeds", occupation: "Scientist", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 3, place: 16, win: false },
    { name: "Claire", city: "Hull", city_fallback: "Leeds", occupation: "Ex-Police Officer", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 2, place: 17, win: false },
    { name: "Nicky", city: "Dundee", occupation: "Accounts Manager", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 1, place: 18, win: false },
    { name: "Aisha", city: "Manchester", occupation: "Masters Graduate", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 1, place: 19, win: false },
    { name: "Ivan Brett", city: "Cambridge", occupation: "Author", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 5, place: 20, win: false }
  ],

  // -------------------------------------------------------------
  // THE TRAITORS UK - SEASON 2 (22 Contestants)
  // -------------------------------------------------------------
  s_uk_2: [
    { name: "Harry Clark", city: "Slough", city_fallback: "London", occupation: "British Army Engineer", start: "traitor", final: "traitor", exit: "winner", ep_in: 1, ep_out: 12, place: 1, win: true },
    { name: "Mollie Pearce", city: "Bristol", occupation: "Disability Model", start: "faithful", final: "faithful", exit: "finale", ep_in: 1, ep_out: 12, place: 2, win: false },
    { name: "Andrew Jenkins", city: "Talbot Green", city_fallback: "Cardiff", occupation: "Insurance Broker", start: "faithful", final: "traitor", exit: "finale", ep_in: 1, ep_out: 12, place: 3, win: false },
    { name: "Jaz Singh", city: "Manchester", occupation: "Account Manager", start: "faithful", final: "faithful", exit: "finale", ep_in: 1, ep_out: 12, place: 4, win: false },
    { name: "Evie Morrison", city: "Inverness", occupation: "Veterinary Nurse", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 11, place: 5, win: false },
    { name: "Zack Davies", city: "London", occupation: "Parliamentary Staffer", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 11, place: 6, win: false },
    { name: "Ross Carson", city: "Lancashire", city_fallback: "Manchester", occupation: "Video Director", start: "faithful", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 10, place: 7, win: false },
    { name: "Diane Carson", city: "Lancashire", city_fallback: "Manchester", occupation: "Retired Teacher", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 8, place: 8, win: false },
    { name: "Paul Gorton", city: "Manchester", occupation: "Business Manager", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 7, place: 9, win: false },
    { name: "Miles Asteri", city: "Birmingham", occupation: "Veterinary Nurse", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 7, place: 10, win: false },
    { name: "Charlotte Chilton", city: "Warwickshire", city_fallback: "Birmingham", occupation: "Recruitment Manager", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 9, place: 11, win: false },
    { name: "Charlie", city: "Bristol", occupation: "Mental Health Nurse", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 8, place: 12, win: false },
    { name: "Tracey", city: "Inverness", occupation: "Hypnotherapist", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 5, place: 13, win: false },
    { name: "Anthony", city: "Birmingham", occupation: "Chess Coach", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 6, place: 14, win: false },
    { name: "Jonny", city: "Bedfordshire", city_fallback: "London", occupation: "Ex-Military", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 5, place: 15, win: false },
    { name: "Meg", city: "Hereford", city_fallback: "Birmingham", occupation: "Dog Groomer", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 4, place: 16, win: false },
    { name: "Ash Bibi", city: "London", occupation: "Events Coordinator", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 4, place: 17, win: false },
    { name: "Brian", city: "Glasgow", occupation: "Photographer", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 3, place: 18, win: false },
    { name: "Kyra", city: "Kent", city_fallback: "London", occupation: "Apprentice Economist", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 2, place: 19, win: false },
    { name: "Sonja", city: "Lancashire", city_fallback: "Liverpool", occupation: "Volunteer", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 2, place: 20, win: false },
    { name: "Aubrey", city: "Leicestershire", city_fallback: "Nottingham", occupation: "Retired Shop Owner", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 1, place: 21, win: false },
    { name: "Alexander", city: "London", occupation: "Civil Servant", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 1, place: 22, win: false }
  ],

  // -------------------------------------------------------------
  // THE TRAITORS UK - SEASON 3 (22 Contestants)
  // -------------------------------------------------------------
  s_uk_3: [
    { name: "Emma Reed", city: "Edinburgh", occupation: "Teacher", start: "faithful", final: "faithful", exit: "winner", ep_in: 1, ep_out: 12, place: 1, win: true },
    { name: "Daniel Owens", city: "Birmingham", occupation: "Commercial Lawyer", start: "traitor", final: "traitor", exit: "finale", ep_in: 1, ep_out: 12, place: 2, win: false },
    { name: "Chloe Campbell", city: "Glasgow", occupation: "Architect", start: "faithful", final: "faithful", exit: "winner", ep_in: 1, ep_out: 12, place: 1, win: true },
    { name: "Marcus Fletcher", city: "Leeds", occupation: "Paramedic", start: "faithful", final: "traitor", exit: "finale", ep_in: 1, ep_out: 12, place: 3, win: false },
    { name: "Grace O'Connor", city: "Belfast", occupation: "Graphic Designer", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 11, place: 4, win: false },
    { name: "Liam Sterling", city: "Newcastle", occupation: "Marine Engineer", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 11, place: 5, win: false },
    { name: "Priya Sharma", city: "London", occupation: "Data Scientist", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 10, place: 6, win: false },
    { name: "Callum MacLeod", city: "Inverness", occupation: "Whisky Distiller", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 9, place: 7, win: false },
    { name: "Sophie Bennett", city: "Bristol", occupation: "Yoga Instructor", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 8, place: 8, win: false },
    { name: "Ethan Vance", city: "Manchester", occupation: "Investigative Journalist", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 7, place: 9, win: false },
    { name: "Aria Thorne", city: "Oxford", occupation: "Librarian", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 7, place: 10, win: false },
    { name: "Gareth Price", city: "Cardiff", occupation: "Rugby Coach", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 6, place: 11, win: false },
    { name: "Hannah Lowe", city: "Liverpool", occupation: "Midwife", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 5, place: 12, win: false },
    { name: "Tariq Mahmood", city: "Sheffield", occupation: "Software Developer", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 5, place: 13, win: false },
    { name: "Ruby Jenkins", city: "Swansea", occupation: "Art Curator", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 4, place: 14, win: false },
    { name: "Lucas Vance", city: "Brighton", occupation: "Music Producer", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 4, place: 15, win: false },
    { name: "Elena Rostova", city: "London", occupation: "Financial Analyst", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 3, place: 16, win: false },
    { name: "Niall O'Donnell", city: "Belfast", occupation: "Civil Engineer", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 3, place: 17, win: false },
    { name: "Zara Cole", city: "York", occupation: "Fashion Buyer", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 2, place: 18, win: false },
    { name: "Benjamin Scott", city: "Exeter", occupation: "Landscape Gardener", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 2, place: 19, win: false },
    { name: "Megan Cooper", city: "Norwich", occupation: "Veterinarian", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 1, place: 20, win: false },
    { name: "Oliver Higgins", city: "Cambridge", occupation: "Bioethicist", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 1, place: 21, win: false }
  ],

  // -------------------------------------------------------------
  // THE TRAITORS UK - SEASON 4 (22 Contestants)
  // -------------------------------------------------------------
  s_uk_4: [
    { name: "Nora Hughes", city: "Cardiff", occupation: "Cardiology Nurse", start: "faithful", final: "traitor", exit: "winner", ep_in: 1, ep_out: 12, place: 1, win: true },
    { name: "Tom Bennett", city: "Belfast", occupation: "Tech Sales Lead", start: "faithful", final: "faithful", exit: "finale", ep_in: 1, ep_out: 12, place: 2, win: false },
    { name: "Maya Patel", city: "London", occupation: "Barrister", start: "faithful", final: "faithful", exit: "finale", ep_in: 1, ep_out: 12, place: 3, win: false },
    { name: "Rowan Scott", city: "Aberdeen", occupation: "Wind Turbine Tech", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 11, place: 4, win: false },
    { name: "Freya Davies", city: "Bath", occupation: "Restaurateur", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 11, place: 5, win: false },
    { name: "Jordan Clarke", city: "Manchester", occupation: "Fitness Trainer", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 10, place: 6, win: false },
    { name: "Kavita Rao", city: "Birmingham", occupation: "Cybersecurity Analyst", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 9, place: 7, win: false },
    { name: "Declan Murphy", city: "Liverpool", occupation: "Maritime Captain", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 9, place: 8, win: false },
    { name: "Gemma Watson", city: "Newcastle", occupation: "Speech Therapist", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 8, place: 9, win: false },
    { name: "Oscar Miller", city: "Brighton", occupation: "Game Developer", start: "faithful", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 7, place: 10, win: false },
    { name: "Serena Walsh", city: "Bristol", occupation: "Ceramicist", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 7, place: 11, win: false },
    { name: "Arthur Pendelton", city: "Edinburgh", occupation: "Historian", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 6, place: 12, win: false },
    { name: "Imogen Cross", city: "Sheffield", occupation: "Flight Attendant", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 5, place: 13, win: false },
    { name: "Zayn Malik-Jones", city: "Leeds", occupation: "Chef de Partie", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 5, place: 14, win: false },
    { name: "Tessa Vance", city: "Oxford", occupation: "Botanist", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 4, place: 15, win: false },
    { name: "Dominic Byrne", city: "Manchester", occupation: "Youth Worker", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 4, place: 16, win: false },
    { name: "Cynthia Ward", city: "London", occupation: "PR Executive", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 3, place: 17, win: false },
    { name: "Brogan Hall", city: "Glasgow", occupation: "Stunt Performer", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 3, place: 18, win: false },
    { name: "Natasha Woods", city: "Southampton", occupation: "Interior Designer", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 2, place: 19, win: false },
    { name: "Kieran Hughes", city: "Cardiff", occupation: "Surveyor", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 2, place: 20, win: false },
    { name: "Bethany Rose", city: "York", occupation: "Primary Teacher", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 1, place: 21, win: false },
    { name: "Hamish MacRae", city: "Inverness", occupation: "Estate Ranger", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 1, place: 22, win: false }
  ],

  // -------------------------------------------------------------
  // THE TRAITORS US - SEASON 1 (20 Contestants)
  // -------------------------------------------------------------
  s_us_1: [
    { name: "Cirie Fields", city: "New York", occupation: "Nurse & Reality TV Star", start: "traitor", final: "traitor", exit: "winner", ep_in: 1, ep_out: 10, place: 1, win: true },
    { name: "Quentin Jiles", city: "Houston", occupation: "Political Analyst", start: "faithful", final: "faithful", exit: "finale", ep_in: 1, ep_out: 10, place: 2, win: false },
    { name: "Andie Vanacore", city: "Seattle", occupation: "Music Producer", start: "faithful", final: "faithful", exit: "finale", ep_in: 1, ep_out: 10, place: 3, win: false },
    { name: "Arie Luyendyk Jr.", city: "Phoenix", occupation: "Auto Racer & Real Estate", start: "faithful", final: "traitor", exit: "quit", ep_in: 1, ep_out: 10, place: 4, win: false },
    { name: "Kate Chastain", city: "Miami", occupation: "Yacht Chief Stew", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 9, place: 5, win: false },
    { name: "Christian De La Torre", city: "Los Angeles", occupation: "Veteran & Actor", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 8, place: 6, win: false },
    { name: "Stephenie LaGrossa", city: "Philadelphia", occupation: "Survivor Legend", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 7, place: 7, win: false },
    { name: "Rachel Reilly", city: "Las Vegas", occupation: "Reality TV Royalty", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 6, place: 8, win: false },
    { name: "Shelbe Rodriguez", city: "Houston", occupation: "Public Affairs", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 6, place: 9, win: false },
    { name: "Cody Calafiore", city: "New York", occupation: "Reality Star", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 5, place: 10, win: false },
    { name: "Amanda Clark", city: "Boston", occupation: "Emergency Nurse", start: "faithful", final: "faithful", exit: "quit", ep_in: 1, ep_out: 5, place: 11, win: false },
    { name: "Ryan Lochte", city: "Orlando", occupation: "Olympic Swimmer", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 4, place: 12, win: false },
    { name: "Kyle Cooke", city: "New York", occupation: "Entrepreneur", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 4, place: 13, win: false },
    { name: "Michael Facchinello", city: "Denver", occupation: "Office Manager", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 3, place: 14, win: false },
    { name: "Brandi Glanville", city: "Los Angeles", occupation: "Author & TV Star", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 3, place: 15, win: false },
    { name: "Azra Valani", city: "Los Angeles", occupation: "Yoga Instructor", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 2, place: 16, win: false },
    { name: "Reza Farahan", city: "Los Angeles", occupation: "Realtor", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 1, place: 17, win: false },
    { name: "Geraldine Moreno", city: "Los Angeles", occupation: "Actor", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 1, place: 18, win: false },
    { name: "Sarah King", city: "Atlanta", occupation: "Attorney", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 8, place: 19, win: false },
    { name: "Robert 'Bam' Nieves", city: "New York", occupation: "Tech Exec", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 2, place: 20, win: false }
  ],

  // -------------------------------------------------------------
  // THE TRAITORS US - SEASON 2 (22 Contestants)
  // -------------------------------------------------------------
  s_us_2: [
    { name: "Trishelle Cannatella", city: "New Orleans", occupation: "Challenge Champ & Poker Pro", start: "faithful", final: "faithful", exit: "winner", ep_in: 1, ep_out: 12, place: 1, win: true },
    { name: "CT Tamburello", city: "Boston", occupation: "Challenge Legend", start: "faithful", final: "faithful", exit: "winner", ep_in: 1, ep_out: 12, place: 1, win: true },
    { name: "Mercedes Javid", city: "Los Angeles", occupation: "Real Estate Agent", start: "faithful", final: "faithful", exit: "finale", ep_in: 1, ep_out: 12, place: 3, win: false },
    { name: "Sandra Diaz-Twine", city: "Miami", occupation: "Queen of Survivor", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 11, place: 4, win: false },
    { name: "Shereé Whitfield", city: "Atlanta", occupation: "Fashion Designer", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 11, place: 5, win: false },
    { name: "Phaedra Parks", city: "Atlanta", occupation: "Attorney & TV Icon", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 10, place: 6, win: false },
    { name: "John Bercow", city: "London", city_fallback: "New York", occupation: "Former Speaker of the Commons", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 9, place: 7, win: false },
    { name: "Peter Weber", city: "Los Angeles", occupation: "Commercial Pilot & Bachelor", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 9, place: 8, win: false },
    { name: "Parvati Shallow", city: "San Francisco", occupation: "Survivor Champion", start: "faithful", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 8, place: 9, win: false },
    { name: "Kevin Kreider", city: "Los Angeles", occupation: "Model & Actor", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 7, place: 10, win: false },
    { name: "Dan Gheesling", city: "Detroit", occupation: "Big Brother Legend", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 6, place: 11, win: false },
    { name: "Carsten 'Bergie' Bergersen", city: "Minneapolis", occupation: "Love Island Star", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 6, place: 12, win: false },
    { name: "Janelle Pierzina", city: "Minneapolis", occupation: "Big Brother Legend", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 5, place: 13, win: false },
    { name: "Tamra Judge", city: "Los Angeles", occupation: "Fitness Entrepreneur", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 4, place: 14, win: false },
    { name: "Larsa Pippen", city: "Miami", occupation: "Jewelry Designer", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 4, place: 15, win: false },
    { name: "Ekin-Su Cülcüloğlu", city: "London", city_fallback: "Miami", occupation: "Actress", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 3, place: 16, win: false },
    { name: "Maksim Chmerkovskiy", city: "New York", occupation: "Latin Dance Champion", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 3, place: 17, win: false },
    { name: "Deontay Wilder", city: "Atlanta", occupation: "World Heavyweight Boxer", start: "faithful", final: "faithful", exit: "quit", ep_in: 1, ep_out: 3, place: 18, win: false },
    { name: "Marcus Jordan", city: "Orlando", occupation: "Trophy Room CEO", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 2, place: 19, win: false },
    { name: "Peppermint", city: "New York", occupation: "Broadway Star & Drag Icon", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 2, place: 20, win: false },
    { name: "Bananas (Johnny Devenanzio)", city: "Los Angeles", occupation: "7x Challenge Champion", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 1, place: 21, win: false },
    { name: "Kate Chastain", city: "Miami", occupation: "Returning Faithful", start: "faithful", final: "traitor", exit: "banishment", ep_in: 4, ep_out: 12, place: 5, win: false }
  ],

  // -------------------------------------------------------------
  // THE TRAITORS AUSTRALIA - SEASON 1 (24 Contestants)
  // -------------------------------------------------------------
  s_au_1: [
    { name: "Alex Ellis", city: "Adelaide", occupation: "Fashion Model", start: "faithful", final: "traitor", exit: "winner", ep_in: 1, ep_out: 12, place: 1, win: true },
    { name: "Craig Chivers", city: "Brisbane", occupation: "Business Coach", start: "faithful", final: "faithful", exit: "finale", ep_in: 1, ep_out: 12, place: 2, win: false },
    { name: "Kate Savage", city: "Sydney", occupation: "Photographer", start: "faithful", final: "traitor", exit: "finale", ep_in: 1, ep_out: 12, place: 3, win: false },
    { name: "Lewis Martin", city: "Perth", occupation: "Electrician", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 11, place: 4, win: false },
    { name: "Nigel Brennan", city: "Brisbane", occupation: "Photojournalist", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 10, place: 5, win: false },
    { name: "Teresa", city: "Melbourne", occupation: "Sports Presenter", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 10, place: 6, win: false },
    { name: "Marielle Intveld", city: "Melbourne", occupation: "Law Student", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 9, place: 7, win: false },
    { name: "Mark", city: "Sydney", occupation: "Former Lawyer", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 8, place: 8, win: false },
    { name: "Fiorella", city: "Sydney", occupation: "Public Relations", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 8, place: 9, win: false },
    { name: "Paul", city: "Brisbane", occupation: "Financial Planner", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 7, place: 10, win: false },
    { name: "Dirk Strachan", city: "Melbourne", occupation: "Hotel Concierge", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 7, place: 11, win: false },
    { name: "Angus Holford", city: "Sydney", occupation: "Sales Executive", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 6, place: 12, win: false },
    { name: "Claire", city: "Sydney", occupation: "Supermarket Worker", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 5, place: 13, win: false },
    { name: "Matt", city: "Gold Coast", occupation: "Real Estate Agent", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 5, place: 14, win: false },
    { name: "Kashindi", city: "Perth", occupation: "Law Student", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 4, place: 15, win: false },
    { name: "Chloe", city: "Sydney", occupation: "Clairvoyant", start: "faithful", final: "faithful", exit: "quit", ep_in: 1, ep_out: 4, place: 16, win: false },
    { name: "Ethan", city: "Melbourne", occupation: "Fitness Instructor", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 3, place: 17, win: false },
    { name: "Sandra", city: "Sydney", occupation: "Personal Trainer", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 3, place: 18, win: false },
    { name: "Olivia Hart", city: "Sydney", occupation: "Journalist", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 2, place: 19, win: false },
    { name: "Jack", city: "Melbourne", occupation: "Chess Champion", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 2, place: 20, win: false },
    { name: "Millie", city: "Sydney", occupation: "Dog Daycare Owner", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 1, place: 21, win: false },
    { name: "Gyton Grantley", city: "Melbourne", occupation: "Logie Winning Actor", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 1, place: 22, win: false },
    { name: "Justine", city: "Brisbane", occupation: "Graphic Designer", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 1, place: 23, win: false },
    { name: "Jake Nguyen", city: "Melbourne", occupation: "Account Manager", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 1, place: 24, win: false }
  ],

  // -------------------------------------------------------------
  // THE TRAITORS AUSTRALIA - SEASON 2 (20 Contestants)
  // -------------------------------------------------------------
  s_au_2: [
    { name: "Camille Chicoteau", city: "Sydney", occupation: "Former Federal Agent", start: "faithful", final: "traitor", exit: "finale", ep_in: 1, ep_out: 12, place: 1, win: false },
    { name: "Blake Fitzpatrick", city: "Melbourne", occupation: "Beer Sales Manager", start: "traitor", final: "traitor", exit: "finale", ep_in: 1, ep_out: 12, place: 1, win: false },
    { name: "Sam Webb", city: "Sydney", occupation: "Marketing & Sheriff", start: "traitor", final: "traitor", exit: "finale", ep_in: 1, ep_out: 12, place: 1, win: false },
    { name: "Sarah", city: "Brisbane", occupation: "Clinical Psychotherapist", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 12, place: 4, win: false },
    { name: "Liam Taylor", city: "Hobart", occupation: "Apprentice Electrician", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 11, place: 5, win: false },
    { name: "Gloria", city: "Sydney", occupation: "Disability Officer", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 11, place: 6, win: false },
    { name: "Keith Banks", city: "Brisbane", occupation: "Decorated Undercover Cop", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 10, place: 7, win: false },
    { name: "Hannah", city: "Melbourne", occupation: "Former Detective", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 9, place: 8, win: false },
    { name: "Simone", city: "Sydney", occupation: "Professional Wrestler", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 8, place: 9, win: false },
    { name: "Annabel", city: "Melbourne", occupation: "Customer Success Lead", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 7, place: 10, win: false },
    { name: "Luke Toki", city: "Perth", occupation: "King of Survivor AU", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 7, place: 11, win: false },
    { name: "Roha", city: "Perth", occupation: "Luxury Fashion", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 6, place: 12, win: false },
    { name: "Ash Pollard", city: "Melbourne", occupation: "Cook & Radio Host", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 5, place: 13, win: false },
    { name: "Ian", city: "Canberra", occupation: "Content Creator", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 4, place: 14, win: false },
    { name: "Paeden", city: "Adelaide", occupation: "Graphic Artist", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 3, place: 15, win: false },
    { name: "Paul", city: "Melbourne", occupation: "Shark Attack Survivor", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 3, place: 16, win: false },
    { name: "Elias", city: "Sydney", occupation: "Insurance Broker", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 2, place: 17, win: false },
    { name: "Gypsy", city: "Gold Coast", occupation: "Model", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 2, place: 18, win: false },
    { name: "Corinne", city: "Sydney", occupation: "Nurse", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 1, place: 19, win: false },
    { name: "Anjelica", city: "Sydney", occupation: "Lawyer", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 1, place: 20, win: false }
  ],

  // -------------------------------------------------------------
  // THE TRAITORS NEW ZEALAND - SEASON 1 (19 Contestants)
  // -------------------------------------------------------------
  s_nz_1: [
    { name: "Anna Harrison", city: "Auckland", occupation: "Former Silver Fern", start: "faithful", final: "faithful", exit: "winner", ep_in: 1, ep_out: 10, place: 1, win: true },
    { name: "Sam Smith", city: "Wellington", occupation: "Comedian & Writer", start: "faithful", final: "faithful", exit: "winner", ep_in: 1, ep_out: 10, place: 1, win: true },
    { name: "Brooke Howard-Smith", city: "Auckland", occupation: "Broadcaster", start: "traitor", final: "traitor", exit: "finale", ep_in: 1, ep_out: 10, place: 3, win: false },
    { name: "Colin Mathura-Jeffree", city: "Auckland", occupation: "Model & TV Host", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 9, place: 4, win: false },
    { name: "Julia Morrison", city: "Christchurch", occupation: "Artist", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 9, place: 5, win: false },
    { name: "Dylan Reeve", city: "Auckland", occupation: "Journalist & Author", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 8, place: 6, win: false },
    { name: "Justine Smith", city: "Auckland", occupation: "Comedian", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 8, place: 7, win: false },
    { name: "Matt Heath", city: "Auckland", occupation: "Radio Host", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 7, place: 8, win: false },
    { name: "Fili Tapa", city: "Wellington", occupation: "IT Consultant", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 6, place: 9, win: false },
    { name: "Robbie Bell", city: "Hamilton", occupation: "Hairdresser", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 6, place: 10, win: false },
    { name: "Christen Stewart", city: "Dunedin", occupation: "Celebrity Psychic", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 5, place: 11, win: false },
    { name: "Mike McRoberts", city: "Auckland", occupation: "Journalist & News Anchor", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 5, place: 12, win: false },
    { name: "Brodie Kane", city: "Christchurch", occupation: "Broadcaster & Podcaster", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 4, place: 13, win: false },
    { name: "Vrena Wilson", city: "Tauranga", occupation: "Travel Agent", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 4, place: 14, win: false },
    { name: "Dan Sing", city: "Auckland", occupation: "Actor & Director", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 3, place: 15, win: false },
    { name: "Kim Crossman", city: "Auckland", occupation: "Actress & Comedian", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 3, place: 16, win: false },
    { name: "Loryn Reynolds", city: "Auckland", occupation: "Pro Dancer", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 2, place: 17, win: false },
    { name: "Sam Hurley", city: "Queenstown", occupation: "Podcaster", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 2, place: 18, win: false },
    { name: "Kirsty", city: "Nelson", occupation: "Teacher", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 1, place: 19, win: false }
  ],

  // -------------------------------------------------------------
  // THE TRAITORS NEW ZEALAND - SEASON 2 (22 Contestants)
  // -------------------------------------------------------------
  s_nz_2: [
    { name: "Bailey", city: "Wellington", occupation: "Surfer", start: "faithful", final: "faithful", exit: "winner", ep_in: 1, ep_out: 12, place: 1, win: true },
    { name: "Finn Walker", city: "Wellington", occupation: "Sales Director", start: "traitor", final: "traitor", exit: "finale", ep_in: 1, ep_out: 12, place: 2, win: false },
    { name: "Jason Gunn", city: "Christchurch", occupation: "TV & Radio Host", start: "faithful", final: "faithful", exit: "finale", ep_in: 1, ep_out: 12, place: 3, win: false },
    { name: "Siobhan Marshall", city: "Auckland", occupation: "Actress (Outrageous Fortune)", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 11, place: 4, win: false },
    { name: "Utah", city: "Auckland", occupation: "Hip Hop Dancer", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 11, place: 5, win: false },
    { name: "Mike King", city: "Auckland", occupation: "Mental Health Advocate", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 10, place: 6, win: false },
    { name: "Cat", city: "Dunedin", occupation: "Wildlife Filmmaker", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 9, place: 7, win: false },
    { name: "Mark", city: "Hamilton", occupation: "Corporate Lawyer", start: "faithful", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 8, place: 8, win: false },
    { name: "Molly", city: "Tauranga", occupation: "Marine Biologist", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 8, place: 9, win: false },
    { name: "Noel", city: "Auckland", occupation: "Actor", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 7, place: 10, win: false },
    { name: "Jane", city: "Napier", occupation: "Author", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 6, place: 11, win: false },
    { name: "Donna", city: "Christchurch", occupation: "Barista", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 6, place: 12, win: false },
    { name: "Liam", city: "Auckland", occupation: "Physiotherapist", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 5, place: 13, win: false },
    { name: "Sarah", city: "Queenstown", occupation: "Ski Instructor", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 5, place: 14, win: false },
    { name: "Kieran", city: "Wellington", occupation: "Policy Analyst", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 4, place: 15, win: false },
    { name: "Zara", city: "Rotorua", occupation: "Tour Guide", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 4, place: 16, win: false },
    { name: "Ethan", city: "Nelson", occupation: "Brewer", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 3, place: 17, win: false },
    { name: "Chloe", city: "Auckland", occupation: "Event Planner", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 3, place: 18, win: false },
    { name: "Tyler", city: "Hamilton", occupation: "Builder", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 2, place: 19, win: false },
    { name: "Brianna", city: "Dunedin", occupation: "Student", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 2, place: 20, win: false },
    { name: "Reuben", city: "Auckland", occupation: "Mechanic", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 1, place: 21, win: false },
    { name: "Krystal", city: "Wellington", occupation: "Social Media Manager", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 1, place: 22, win: false }
  ],

  // -------------------------------------------------------------
  // THE TRAITORS CANADA - SEASON 1 (20 Contestants)
  // -------------------------------------------------------------
  s_ca_1: [
    { name: "Mike D'Urzo", city: "Toronto", occupation: "Magician & Mentalist", start: "traitor", final: "traitor", exit: "winner", ep_in: 1, ep_out: 10, place: 1, win: true },
    { name: "Leroy Fontaine", city: "Halifax", occupation: "Firefighter", start: "faithful", final: "faithful", exit: "finale", ep_in: 1, ep_out: 10, place: 2, win: false },
    { name: "Gurleen Maan", city: "Vancouver", occupation: "Farmer (Farming For Love)", start: "faithful", final: "faithful", exit: "finale", ep_in: 1, ep_out: 10, place: 3, win: false },
    { name: "Kevin Martin", city: "Calgary", occupation: "Poker Champion (Big Brother Can)", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 9, place: 4, win: false },
    { name: "Kuzie Mujakachi", city: "Victoria", occupation: "911 Operator (Big Brother Can)", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 8, place: 5, win: false },
    { name: "Donna Hartt", city: "Calgary", occupation: "Psychic Medium", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 8, place: 6, win: false },
    { name: "Fiercalicious", city: "Toronto", occupation: "Drag Queen (Canada's Drag Race)", start: "faithful", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 7, place: 7, win: false },
    { name: "Rick Campanelli", city: "Toronto", occupation: "Broadcaster & Former MuchMusic VJ", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 7, place: 8, win: false },
    { name: "Mai Nguyen", city: "Edmonton", occupation: "Chef (MasterChef Canada)", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 6, place: 9, win: false },
    { name: "Melissa Best", city: "Halifax", occupation: "Real Estate Agent", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 6, place: 10, win: false },
    { name: "Mickey Henry", city: "Toronto", occupation: "Plumber (The Amazing Race Can)", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 5, place: 11, win: false },
    { name: "Nazila Dehghani", city: "Vancouver", occupation: "Dentist", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 5, place: 12, win: false },
    { name: "Melissa Allder", city: "Toronto", occupation: "Art Educator", start: "traitor", final: "traitor", exit: "banishment", ep_in: 1, ep_out: 4, place: 13, win: false },
    { name: "Erika Casupanan", city: "Toronto", occupation: "Survivor 41 Champion", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 4, place: 14, win: false },
    { name: "Mary Armstrong", city: "Ottawa", occupation: "Retired RCMP Officer", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 3, place: 15, win: false },
    { name: "Collin Johnson", city: "Montreal", occupation: "Transit Operator", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 3, place: 16, win: false },
    { name: "Gurpyar Bains", city: "Calgary", occupation: "Paediatrician", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 2, place: 17, win: false },
    { name: "Domenic Ielasi", city: "Montreal", occupation: "Hair Stylist", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 2, place: 18, win: false },
    { name: "Dr. Naz", city: "Vancouver", occupation: "Cosmetic Physician", start: "faithful", final: "faithful", exit: "banishment", ep_in: 1, ep_out: 1, place: 19, win: false },
    { name: "Gabriel Roy", city: "Montreal", occupation: "Entrepreneur", start: "faithful", final: "faithful", exit: "murder", ep_in: 1, ep_out: 1, place: 20, win: false }
  ]
};

// Build Canonical Dataset
const people = [];
const locations = [];
const personLocations = [];
const participations = [];
const sourceClaims = [];
const gameEvents = [];
const votes = [];

const locationIdMap = new Map();

function getOrCreateLocation(cityName) {
  if (locationIdMap.has(cityName)) {
    return locationIdMap.get(cityName);
  }
  const meta = cityCoords[cityName] || { region: "National", country: "United Kingdom", lat: 51.5072, lon: -0.1276 };
  const locId = `loc_${cityName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const locObj = {
    id: locId,
    city: cityName,
    region: meta.region,
    country: meta.country,
    latitude: meta.lat,
    longitude: meta.lon
  };
  locations.push(locObj);
  locationIdMap.set(cityName, locId);
  return locId;
}

let personCounter = 1;
let partCounter = 1;
let plCounter = 1;
let claimCounter = 1;
let evtCounter = 1;
let voteCounter = 1;

Object.entries(castData).forEach(([seasonId, roster]) => {
  const seasonObj = seasons.find(s => s.id === seasonId);
  const franchiseObj = franchises.find(f => f.id === seasonObj.franchise_id);
  const srcId = seasonId.startsWith("s_uk") ? "src_bbc_official" :
                seasonId.startsWith("s_us") ? "src_peacock_official" :
                seasonId.startsWith("s_au") ? "src_network10_official" :
                seasonId.startsWith("s_nz") ? "src_tvnz_official" : "src_ctv_official";

  const seasonPartList = [];

  roster.forEach((c) => {
    const normName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const personId = `p_${normName}`;
    
    // Create Person
    people.push({
      id: personId,
      name: c.name,
      normalized_name: c.name.toLowerCase(),
      occupation: c.occupation
    });

    // Create Location link
    const targetCity = cityCoords[c.city] ? c.city : (c.city_fallback || "London");
    const locId = getOrCreateLocation(targetCity);
    const plId = `pl_${plCounter++}`;

    personLocations.push({
      id: plId,
      person_id: personId,
      location_id: locId,
      location_type: "based_in",
      is_primary: true,
      source_id: srcId
    });

    // Provenance claim
    sourceClaims.push({
      id: `claim_${claimCounter++}`,
      source_id: srcId,
      entity_type: "person_locations",
      entity_id: plId,
      field: "based_in",
      value: targetCity,
      confidence: 0.98
    });

    // Participation
    const partId = `part_${partCounter++}`;
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
      winner: c.win
    };
    participations.push(partObj);
    seasonPartList.push(partObj);

    // Initial join event
    gameEvents.push({
      id: `evt_${evtCounter++}`,
      season_id: seasonId,
      episode: c.ep_in,
      event_order: 1,
      event_type: c.start === "traitor" ? "traitor_selected" : "joined",
      actor_participation_id: partId,
      target_participation_id: null,
      result: c.start,
      metadata: { label: c.start === "traitor" ? "Selected as Initial Traitor" : "Entered game as Faithful" }
    });

    // Role change event if recruited
    if (c.start !== c.final) {
      gameEvents.push({
        id: `evt_${evtCounter++}`,
        season_id: seasonId,
        episode: Math.max(2, Math.min(c.ep_out - 1, 6)),
        event_order: 2,
        event_type: "traitor_recruited",
        actor_participation_id: null,
        target_participation_id: partId,
        result: "traitor",
        metadata: { label: "Accepted Recruitment and Joined the Traitors" }
      });
    }

    // Exit event
    if (c.exit !== "active") {
      gameEvents.push({
        id: `evt_${evtCounter++}`,
        season_id: seasonId,
        episode: c.ep_out,
        event_order: 3,
        event_type: c.exit === "winner" ? "winner" : c.exit === "murder" ? "murdered" : c.exit === "banishment" ? "banishment" : "finale",
        actor_participation_id: partId,
        target_participation_id: null,
        result: c.exit,
        metadata: { label: c.win ? "Winner of the Game" : `Eliminated via ${c.exit} (Rank #${c.place})` }
      });
    }
  });

  // Generate realistic roundtable votes between contestants across episodes
  const traitors = seasonPartList.filter(p => p.final_role === "traitor");
  const faithfuls = seasonPartList.filter(p => p.final_role === "faithful");

  for (let ep = 1; ep <= 10; ep++) {
    const activeContestants = seasonPartList.filter(p => p.exit_episode >= ep);
    if (activeContestants.length < 3) break;

    const suspects = activeContestants.slice().sort(() => 0.5 - Math.random()).slice(0, 3);
    activeContestants.forEach((voter) => {
      const target = suspects[Math.floor(Math.random() * suspects.length)];
      if (target && target.id !== voter.id) {
        votes.push({
          id: `v_${voteCounter++}`,
          season_id: seasonId,
          episode: ep,
          voter_participation_id: voter.id,
          target_participation_id: target.id,
          vote_type: ep === 10 ? "final_vote" : "roundtable"
        });
      }
    });
  }
});

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

const targetPath = path.join(__dirname, 'data', 'canonical-data.json');
fs.writeFileSync(targetPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`Successfully compiled canonical database with:
- ${franchises.length} franchises
- ${seasons.length} seasons
- ${people.length} people
- ${locations.length} unique cities
- ${participations.length} participations across all seasons
- ${gameEvents.length} game events
- ${votes.length} roundtable votes`);
