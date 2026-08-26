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
const languageKitBadge = document.getElementById("languageKitBadge");
const languageModeToggle = document.getElementById("languageModeToggle");
const analyticsMenuBtn = document.getElementById("analyticsMenuBtn");
const analyticsMenu = document.getElementById("analyticsMenu");
const tabNav = document.querySelector(".tab-nav");
const analyticsMenuHost = analyticsMenuBtn?.closest(".analytics-menu");

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

const COUNTRY_UI_LOCALE_FALLBACK = {
  "United Kingdom": "en-GB",
  "United States": "en-US",
  Australia: "en-AU",
  "New Zealand": "en-NZ",
  Canada: "en-CA",
  Netherlands: "nl-NL",
  Bulgaria: "bg-BG",
  "Belgium (Flanders)": "nl-BE",
  "Belgium (Wallonia)": "fr-BE",
  Czechia: "cs-CZ",
  Finland: "fi-FI",
  Denmark: "da-DK",
  Greece: "el-GR",
  France: "fr-FR",
  Germany: "de-DE",
  Hungary: "hu-HU",
  India: "hi-IN",
  Ireland: "en-IE",
  Israel: "he-IL",
  Italy: "it-IT",
  Norway: "nb-NO",
  Poland: "pl-PL",
  Portugal: "pt-PT",
  Romania: "ro-RO",
  Spain: "es-ES",
  Sweden: "sv-SE",
  "Canada (Québec)": "fr-CA",
  Ukraine: "uk-UA"
};

let worldGeoJson = null;
let currentContestants = [];
let selectedParticipationId = null;
let activeTab = "tab-map";
let showSources = false;
let graphSimulation = null;
let activeLocale = "en-US";
let activeCountryLanguages = ["English"];
let useCountryLanguageUi = true;
let activeUiLanguage = "en";
const languageKitsByCountry = new Map();
const profileCache = new Map();

const TRANSLATIONS = {
  en: {
    appSubtitle: "Country-wide and season-level contestant geography with canonical data and provenance.",
    filters: "Filters",
    country: "Country",
    season: "Season",
    role: "Role",
    outcome: "Outcome",
    allRoles: "All roles",
    faithful: "Faithful",
    traitor: "Traitor",
    allOutcomes: "All outcomes",
    winner: "Winner",
    finale: "Finale",
    banishment: "Banishment",
    murder: "Murder",
    quit: "Quit",
    removed: "Removed",
    tabMap: "🗺️ Contestant Map",
    tabLeaderboard: "📊 City Leaderboard",
    tabVoting: "🎯 Voting Analytics",
    tabTimeline: "⏳ Player Timeline",
    tabGraph: "🕸️ Social Graph",
    allSeasonsInCountry: "All seasons in country",
    modeEnglish: "English",
    modeCountry: "Country",
    languageModeLabel: "Language",
    kitLabel: "Kit",
    localeLabel: "Locale"
  },
  nl: {
    appSubtitle: "Landelijke en seizoensgebonden geografie van deelnemers met canonieke data en herkomst.",
    filters: "Filters",
    country: "Land",
    season: "Seizoen",
    role: "Rol",
    outcome: "Uitkomst",
    allRoles: "Alle rollen",
    faithful: "Getrouw",
    traitor: "Verrader",
    allOutcomes: "Alle uitkomsten",
    winner: "Winnaar",
    finale: "Finale",
    banishment: "Verbanning",
    murder: "Moord",
    quit: "Gestopt",
    removed: "Verwijderd",
    tabMap: "🗺️ Deelnemerskaart",
    tabLeaderboard: "📊 Stedenranglijst",
    tabVoting: "🎯 Stemanalyse",
    tabTimeline: "⏳ Tijdlijn speler",
    tabGraph: "🕸️ Sociaal netwerk",
    allSeasonsInCountry: "Alle seizoenen in dit land",
    modeEnglish: "Engels",
    modeCountry: "Land",
    languageModeLabel: "Taal",
    kitLabel: "Kit",
    localeLabel: "Regio"
  },
  bg: {
    appSubtitle: "Geografiya na uchastnitsite po darzhava i sezon s kanonichni danni i iztochnik.",
    filters: "Filtri",
    country: "Darzhava",
    season: "Sezon",
    role: "Roly",
    outcome: "Rezultat",
    allRoles: "Vsichki roli",
    faithful: "Loylen",
    traitor: "Predatel",
    allOutcomes: "Vsichki rezultati",
    winner: "Pobeditel",
    finale: "Final",
    banishment: "Izgonen",
    murder: "Ubiystvo",
    quit: "Napusna",
    removed: "Otstranen",
    tabMap: "🗺️ Karta na uchastnitsite",
    tabLeaderboard: "📊 Klasatsiya po gradove",
    tabVoting: "🎯 Analiz na glasuveneto",
    tabTimeline: "⏳ Hronologiya na igracha",
    tabGraph: "🕸️ Sotsialna mrezha",
    allSeasonsInCountry: "Vsichki sezoni v tazi darzhava",
    modeEnglish: "Angliyski",
    modeCountry: "Darzhava",
    languageModeLabel: "Ezik",
    kitLabel: "Kit",
    localeLabel: "Lokal"
  },
  cs: {
    appSubtitle: "Geografie soutezicich podle zeme a serie s kanonickymi daty a puvodem.",
    filters: "Filtry",
    country: "Zeme",
    season: "Serie",
    role: "Role",
    outcome: "Vysledek",
    allRoles: "Vsechny role",
    faithful: "Verna",
    traitor: "Zradce",
    allOutcomes: "Vsechny vysledky",
    winner: "Vitez",
    finale: "Finale",
    banishment: "Vyhosteni",
    murder: "Vrazda",
    quit: "Odstoupeni",
    removed: "Odstranen",
    tabMap: "🗺️ Mapa soutezicich",
    tabLeaderboard: "📊 Zebricek mest",
    tabVoting: "🎯 Analyza hlasovani",
    tabTimeline: "⏳ Casova osa hrace",
    tabGraph: "🕸️ Socialni sit",
    allSeasonsInCountry: "Vsechny serie v teto zemi",
    modeEnglish: "Anglictina",
    modeCountry: "Zeme",
    languageModeLabel: "Jazyk",
    kitLabel: "Sada",
    localeLabel: "Locale"
  },
  fi: {
    appSubtitle: "Kilpailijoiden maantiede maittain ja kausittain kanonisella datalla ja lahteilla.",
    filters: "Suodattimet",
    country: "Maa",
    season: "Kausi",
    role: "Rooli",
    outcome: "Tulos",
    allRoles: "Kaikki roolit",
    faithful: "Uskollinen",
    traitor: "Petturi",
    allOutcomes: "Kaikki tulokset",
    winner: "Voittaja",
    finale: "Finaali",
    banishment: "Karkotus",
    murder: "Murha",
    quit: "Luopui",
    removed: "Poistettu",
    tabMap: "🗺️ Kilpailijakartta",
    tabLeaderboard: "📊 Kaupunkien ranking",
    tabVoting: "🎯 Aanestysanalytiikka",
    tabTimeline: "⏳ Pelaajan aikajana",
    tabGraph: "🕸️ Sosiaalinen verkko",
    allSeasonsInCountry: "Kaikki kaudet maassa",
    modeEnglish: "Englanti",
    modeCountry: "Maa",
    languageModeLabel: "Kieli",
    kitLabel: "Paketti",
    localeLabel: "Alue"
  },
  da: {
    appSubtitle: "Deltagergeografi pa lande- og saesonniveau med kanoniske data og kilder.",
    filters: "Filtre",
    country: "Land",
    season: "Saeson",
    role: "Rolle",
    outcome: "Resultat",
    allRoles: "Alle roller",
    faithful: "Loyal",
    traitor: "Forraeder",
    allOutcomes: "Alle resultater",
    winner: "Vinder",
    finale: "Finale",
    banishment: "Forvisning",
    murder: "Mord",
    quit: "Forlod",
    removed: "Fjernet",
    tabMap: "🗺️ Deltagerkort",
    tabLeaderboard: "📊 Byrangliste",
    tabVoting: "🎯 Afstemningsanalyse",
    tabTimeline: "⏳ Spiller tidslinje",
    tabGraph: "🕸️ Socialt netvaerk",
    allSeasonsInCountry: "Alle saesoner i landet",
    modeEnglish: "Engelsk",
    modeCountry: "Land",
    languageModeLabel: "Sprog",
    kitLabel: "Kit",
    localeLabel: "Lokalitet"
  },
  el: {
    appSubtitle: "Geografia paixton ana xora kai sezon me kanonika dedomena kai piges.",
    filters: "Filtra",
    country: "Xora",
    season: "Sezon",
    role: "Rolos",
    outcome: "Apotelesma",
    allRoles: "Oloi oi roloi",
    faithful: "Pistos",
    traitor: "Prodotis",
    allOutcomes: "Ola ta apotelesmata",
    winner: "Nikitis",
    finale: "Telikos",
    banishment: "Exoria",
    murder: "Dolofonia",
    quit: "Apoxorise",
    removed: "Afairethike",
    tabMap: "🗺️ Xartis paixton",
    tabLeaderboard: "📊 Katataksi poleon",
    tabVoting: "🎯 Analysi psifoforias",
    tabTimeline: "⏳ Chronogrammi paixti",
    tabGraph: "🕸️ Koinoniko diktyo",
    allSeasonsInCountry: "Oles oi sezon sti xora",
    modeEnglish: "Agglika",
    modeCountry: "Xora",
    languageModeLabel: "Glossa",
    kitLabel: "Kit",
    localeLabel: "Topiko"
  },
  fr: {
    appSubtitle: "Geographie des participants par pays et par saison avec donnees canoniques et provenance.",
    filters: "Filtres",
    country: "Pays",
    season: "Saison",
    role: "Role",
    outcome: "Resultat",
    allRoles: "Tous les roles",
    faithful: "Loyal",
    traitor: "Traitre",
    allOutcomes: "Tous les resultats",
    winner: "Gagnant",
    finale: "Finale",
    banishment: "Bannissement",
    murder: "Meurtre",
    quit: "Abandon",
    removed: "Retire",
    tabMap: "🗺️ Carte des participants",
    tabLeaderboard: "📊 Classement des villes",
    tabVoting: "🎯 Analyse des votes",
    tabTimeline: "⏳ Chronologie du joueur",
    tabGraph: "🕸️ Graphe social",
    allSeasonsInCountry: "Toutes les saisons du pays",
    modeEnglish: "Anglais",
    modeCountry: "Pays",
    languageModeLabel: "Langue",
    kitLabel: "Kit",
    localeLabel: "Parametre regional"
  },
  de: {
    appSubtitle: "Geografie der Teilnehmer nach Land und Staffel mit kanonischen Daten und Quellen.",
    filters: "Filter",
    country: "Land",
    season: "Staffel",
    role: "Rolle",
    outcome: "Ergebnis",
    allRoles: "Alle Rollen",
    faithful: "Loyal",
    traitor: "Verrater",
    allOutcomes: "Alle Ergebnisse",
    winner: "Sieger",
    finale: "Finale",
    banishment: "Verbannung",
    murder: "Mord",
    quit: "Ausstieg",
    removed: "Entfernt",
    tabMap: "🗺️ Teilnehmerkarte",
    tabLeaderboard: "📊 Stadteranking",
    tabVoting: "🎯 Abstimmungsanalyse",
    tabTimeline: "⏳ Spielerzeitachse",
    tabGraph: "🕸️ Soziales Netzwerk",
    allSeasonsInCountry: "Alle Staffeln im Land",
    modeEnglish: "Englisch",
    modeCountry: "Land",
    languageModeLabel: "Sprache",
    kitLabel: "Kit",
    localeLabel: "Gebietsschema"
  },
  hu: {
    appSubtitle: "Versenyzok foldrajza orszag es evad szerint kanonikus adatokkal es forrasokkal.",
    filters: "Szurok",
    country: "Orszag",
    season: "Evad",
    role: "Szerep",
    outcome: "Eredmeny",
    allRoles: "Minden szerep",
    faithful: "Huseges",
    traitor: "Arulo",
    allOutcomes: "Minden eredmeny",
    winner: "Gyoztes",
    finale: "Finale",
    banishment: "Szamuzes",
    murder: "Gyilkossag",
    quit: "Kilepett",
    removed: "Eltavolitva",
    tabMap: "🗺️ Versenyzo terkep",
    tabLeaderboard: "📊 Varosi rangsor",
    tabVoting: "🎯 Szavazasi elemzes",
    tabTimeline: "⏳ Jatekos idovonal",
    tabGraph: "🕸️ Tarsas halo",
    allSeasonsInCountry: "Minden evad ebben az orszagban",
    modeEnglish: "Angol",
    modeCountry: "Orszag",
    languageModeLabel: "Nyelv",
    kitLabel: "Keszlet",
    localeLabel: "Teruleti beallitas"
  },
  hi: {
    appSubtitle: "Desh aur season star par contestants ka bhaugolik vishleshan canonical data ke saath.",
    filters: "Filters",
    country: "Desh",
    season: "Season",
    role: "Role",
    outcome: "Parinam",
    allRoles: "Sabhi roles",
    faithful: "Faithful",
    traitor: "Traitor",
    allOutcomes: "Sabhi parinam",
    winner: "Vijeta",
    finale: "Finale",
    banishment: "Banishment",
    murder: "Murder",
    quit: "Quit",
    removed: "Removed",
    tabMap: "🗺️ Contestant Map",
    tabLeaderboard: "📊 City Leaderboard",
    tabVoting: "🎯 Voting Analytics",
    tabTimeline: "⏳ Player Timeline",
    tabGraph: "🕸️ Social Graph",
    allSeasonsInCountry: "Is desh ki sabhi seasons",
    modeEnglish: "English",
    modeCountry: "Desh",
    languageModeLabel: "Bhasha",
    kitLabel: "Kit",
    localeLabel: "Locale"
  },
  he: {
    appSubtitle: "Nituach geografiya shel mishtatfim lefi medina veona im netunim kanoniyim vmekorot.",
    filters: "Filterim",
    country: "Medina",
    season: "Ona",
    role: "Tafkid",
    outcome: "Totsa'a",
    allRoles: "Kol hatafkidim",
    faithful: "Ne'eman",
    traitor: "Boged",
    allOutcomes: "Kol hatotsaot",
    winner: "Menatze'ach",
    finale: "Gmar",
    banishment: "Gerush",
    murder: "Retzach",
    quit: "Azav",
    removed: "Husar",
    tabMap: "🗺️ Mapat mishtatfim",
    tabLeaderboard: "📊 Dirug arim",
    tabVoting: "🎯 Nituach hatsba'a",
    tabTimeline: "⏳ Tzir zman shel shakhkan",
    tabGraph: "🕸️ Reshet hevratit",
    allSeasonsInCountry: "Kol haonot bamedina",
    modeEnglish: "Anglit",
    modeCountry: "Medina",
    languageModeLabel: "Safa",
    kitLabel: "Kit",
    localeLabel: "Locale"
  },
  it: {
    appSubtitle: "Geografia dei concorrenti per paese e stagione con dati canonici e fonti.",
    filters: "Filtri",
    country: "Paese",
    season: "Stagione",
    role: "Ruolo",
    outcome: "Esito",
    allRoles: "Tutti i ruoli",
    faithful: "Leale",
    traitor: "Traditore",
    allOutcomes: "Tutti gli esiti",
    winner: "Vincitore",
    finale: "Finale",
    banishment: "Bando",
    murder: "Omicidio",
    quit: "Ritiro",
    removed: "Rimosso",
    tabMap: "🗺️ Mappa concorrenti",
    tabLeaderboard: "📊 Classifica citta",
    tabVoting: "🎯 Analisi votazioni",
    tabTimeline: "⏳ Timeline giocatore",
    tabGraph: "🕸️ Rete sociale",
    allSeasonsInCountry: "Tutte le stagioni nel paese",
    modeEnglish: "Inglese",
    modeCountry: "Paese",
    languageModeLabel: "Lingua",
    kitLabel: "Kit",
    localeLabel: "Impostazione regionale"
  },
  nb: {
    appSubtitle: "Deltakergeografi pa land- og sesongniva med kanoniske data og kilder.",
    filters: "Filtre",
    country: "Land",
    season: "Sesong",
    role: "Rolle",
    outcome: "Resultat",
    allRoles: "Alle roller",
    faithful: "Lojal",
    traitor: "Forraeder",
    allOutcomes: "Alle utfall",
    winner: "Vinner",
    finale: "Finale",
    banishment: "Forvisning",
    murder: "Mord",
    quit: "Ga ut",
    removed: "Fjernet",
    tabMap: "🗺️ Deltakerkart",
    tabLeaderboard: "📊 Byrangering",
    tabVoting: "🎯 Stemmeanalyse",
    tabTimeline: "⏳ Spiller-tidslinje",
    tabGraph: "🕸️ Sosialt nettverk",
    allSeasonsInCountry: "Alle sesonger i landet",
    modeEnglish: "Engelsk",
    modeCountry: "Land",
    languageModeLabel: "Sprak",
    kitLabel: "Kit",
    localeLabel: "Lokalitet"
  },
  pl: {
    appSubtitle: "Geografia uczestnikow wedlug kraju i sezonu z danymi kanonicznymi i zrodlami.",
    filters: "Filtry",
    country: "Kraj",
    season: "Sezon",
    role: "Rola",
    outcome: "Wynik",
    allRoles: "Wszystkie role",
    faithful: "Wierny",
    traitor: "Zdrajca",
    allOutcomes: "Wszystkie wyniki",
    winner: "Zwyciezca",
    finale: "Final",
    banishment: "Wygnanie",
    murder: "Morderstwo",
    quit: "Rezygnacja",
    removed: "Usuniety",
    tabMap: "🗺️ Mapa uczestnikow",
    tabLeaderboard: "📊 Ranking miast",
    tabVoting: "🎯 Analiza glosowania",
    tabTimeline: "⏳ Oś czasu gracza",
    tabGraph: "🕸️ Siec spoleczna",
    allSeasonsInCountry: "Wszystkie sezony w kraju",
    modeEnglish: "Angielski",
    modeCountry: "Kraj",
    languageModeLabel: "Jezyk",
    kitLabel: "Pakiet",
    localeLabel: "Ustawienia regionalne"
  },
  pt: {
    appSubtitle: "Geografia dos participantes por pais e temporada com dados canonicos e fontes.",
    filters: "Filtros",
    country: "Pais",
    season: "Temporada",
    role: "Papel",
    outcome: "Resultado",
    allRoles: "Todos os papeis",
    faithful: "Leal",
    traitor: "Traidor",
    allOutcomes: "Todos os resultados",
    winner: "Vencedor",
    finale: "Final",
    banishment: "Banimento",
    murder: "Assassinato",
    quit: "Desistiu",
    removed: "Removido",
    tabMap: "🗺️ Mapa de participantes",
    tabLeaderboard: "📊 Ranking de cidades",
    tabVoting: "🎯 Analise de votos",
    tabTimeline: "⏳ Linha do tempo do jogador",
    tabGraph: "🕸️ Rede social",
    allSeasonsInCountry: "Todas as temporadas no pais",
    modeEnglish: "Ingles",
    modeCountry: "Pais",
    languageModeLabel: "Idioma",
    kitLabel: "Kit",
    localeLabel: "Localidade"
  },
  ro: {
    appSubtitle: "Geografia concurentilor pe tari si sezoane cu date canonice si surse.",
    filters: "Filtre",
    country: "Tara",
    season: "Sezon",
    role: "Rol",
    outcome: "Rezultat",
    allRoles: "Toate rolurile",
    faithful: "Loial",
    traitor: "Tradator",
    allOutcomes: "Toate rezultatele",
    winner: "Castigator",
    finale: "Finala",
    banishment: "Alungare",
    murder: "Crima",
    quit: "Retragere",
    removed: "Eliminat",
    tabMap: "🗺️ Harta concurentilor",
    tabLeaderboard: "📊 Clasament orase",
    tabVoting: "🎯 Analiza votului",
    tabTimeline: "⏳ Cronologia jucatorului",
    tabGraph: "🕸️ Retea sociala",
    allSeasonsInCountry: "Toate sezoanele din tara",
    modeEnglish: "Engleza",
    modeCountry: "Tara",
    languageModeLabel: "Limba",
    kitLabel: "Kit",
    localeLabel: "Setare regionala"
  },
  es: {
    appSubtitle: "Geografia de concursantes por pais y temporada con datos canonicos y procedencia.",
    filters: "Filtros",
    country: "Pais",
    season: "Temporada",
    role: "Rol",
    outcome: "Resultado",
    allRoles: "Todos los roles",
    faithful: "Leal",
    traitor: "Traidor",
    allOutcomes: "Todos los resultados",
    winner: "Ganador",
    finale: "Final",
    banishment: "Destierro",
    murder: "Asesinato",
    quit: "Renuncio",
    removed: "Eliminado",
    tabMap: "🗺️ Mapa de concursantes",
    tabLeaderboard: "📊 Clasificacion de ciudades",
    tabVoting: "🎯 Analitica de votos",
    tabTimeline: "⏳ Linea temporal del jugador",
    tabGraph: "🕸️ Grafo social",
    allSeasonsInCountry: "Todas las temporadas del pais",
    modeEnglish: "Ingles",
    modeCountry: "Pais",
    languageModeLabel: "Idioma",
    kitLabel: "Kit",
    localeLabel: "Configuracion regional"
  },
  sv: {
    appSubtitle: "Deltagarnas geografi per land och säsong med kanoniska data och källor.",
    filters: "Filter",
    country: "Land",
    season: "Säsong",
    role: "Roll",
    outcome: "Utfall",
    allRoles: "Alla roller",
    faithful: "Trogen",
    traitor: "Förrädare",
    allOutcomes: "Alla utfall",
    winner: "Vinnare",
    finale: "Final",
    banishment: "Förvisning",
    murder: "Mord",
    quit: "Lämnade",
    removed: "Borttagen",
    tabMap: "🗺️ Deltagarkarta",
    tabLeaderboard: "📊 Stadsrankning",
    tabVoting: "🎯 Röstningsanalys",
    tabTimeline: "⏳ Spelartidslinje",
    tabGraph: "🕸️ Socialt nätverk",
    allSeasonsInCountry: "Alla säsonger i landet",
    modeEnglish: "Engelska",
    modeCountry: "Land",
    languageModeLabel: "Språk",
    kitLabel: "Paket",
    localeLabel: "Språkvariant"
  },
  uk: {
    appSubtitle: "Географія учасників за країною та сезоном на основі канонічних даних і джерел.",
    filters: "Фільтри",
    country: "Країна",
    season: "Сезон",
    role: "Роль",
    outcome: "Результат",
    allRoles: "Усі ролі",
    faithful: "Вірний",
    traitor: "Зрадник",
    allOutcomes: "Усі результати",
    winner: "Переможець",
    finale: "Фінал",
    banishment: "Вигнання",
    murder: "Убивство",
    quit: "Вийшов",
    removed: "Вилучено",
    tabMap: "🗺️ Карта учасників",
    tabLeaderboard: "📊 Рейтинг міст",
    tabVoting: "🎯 Аналіз голосування",
    tabTimeline: "⏳ Хронологія гравця",
    tabGraph: "🕸️ Соціальна мережа",
    allSeasonsInCountry: "Усі сезони в країні",
    modeEnglish: "Англійська",
    modeCountry: "Країна",
    languageModeLabel: "Мова",
    kitLabel: "Набір",
    localeLabel: "Регіон"
  }
};

const DYNAMIC_LABELS = {
  en: { franchises: "Franchises", seasons: "Seasons", contestants: "Contestants", traitors: "Traitors", faithfuls: "Faithfuls", winners: "Winners", cities: "Cities", countries: "Countries", host: "Host", location: "Location", unknown: "Unknown" },
  nl: { franchises: "Franchises", seasons: "Seizoenen", contestants: "Deelnemers", traitors: "Verraders", faithfuls: "Getrouwen", winners: "Winnaars", cities: "Steden", countries: "Landen", host: "Presentator", location: "Locatie", unknown: "Onbekend" },
  bg: { franchises: "Franchayzi", seasons: "Sezoni", contestants: "Uchastnitsi", traitors: "Predateli", faithfuls: "Loyalni", winners: "Pobediteli", cities: "Gradove", countries: "Darzhavi", host: "Vodest", location: "Myasto", unknown: "Neizvestno" },
  cs: { franchises: "Franšízy", seasons: "Série", contestants: "Soutěžící", traitors: "Zrádci", faithfuls: "Věrní", winners: "Vítězové", cities: "Města", countries: "Země", host: "Moderátor", location: "Místo", unknown: "Neznámé" },
  fi: { franchises: "Ohjelmat", seasons: "Kaudet", contestants: "Kilpailijat", traitors: "Petturit", faithfuls: "Uskolliset", winners: "Voittajat", cities: "Kaupungit", countries: "Maat", host: "Juontaja", location: "Sijainti", unknown: "Tuntematon" },
  da: { franchises: "Programmer", seasons: "Sæsoner", contestants: "Deltagere", traitors: "Forrædere", faithfuls: "Loyale", winners: "Vindere", cities: "Byer", countries: "Lande", host: "Vært", location: "Sted", unknown: "Ukendt" },
  el: { franchises: "Franchises", seasons: "Sezon", contestants: "Paiktes", traitors: "Prodotes", faithfuls: "Pistoi", winners: "Nikites", cities: "Poleis", countries: "Chores", host: "Parousiastis", location: "Topothesia", unknown: "Agnosto" },
  fr: { franchises: "Franchises", seasons: "Saisons", contestants: "Candidats", traitors: "Traîtres", faithfuls: "Fidèles", winners: "Gagnants", cities: "Villes", countries: "Pays", host: "Animateur", location: "Lieu", unknown: "Inconnu" },
  de: { franchises: "Formate", seasons: "Staffeln", contestants: "Kandidaten", traitors: "Verräter", faithfuls: "Getreue", winners: "Gewinner", cities: "Städte", countries: "Länder", host: "Moderator", location: "Ort", unknown: "Unbekannt" },
  hu: { franchises: "Franchise-ok", seasons: "Évadok", contestants: "Játékosok", traitors: "Árulók", faithfuls: "Hűségesek", winners: "Győztesek", cities: "Városok", countries: "Országok", host: "Műsorvezető", location: "Helyszín", unknown: "Ismeretlen" },
  hi: { franchises: "Franchise", seasons: "Season", contestants: "Pratiyogi", traitors: "Gaddar", faithfuls: "Wafadar", winners: "Vijeta", cities: "Shahar", countries: "Desh", host: "Host", location: "Sthan", unknown: "Agyat" },
  he: { franchises: "זיכיונות", seasons: "עונות", contestants: "מתמודדים", traitors: "בוגדים", faithfuls: "נאמנים", winners: "זוכים", cities: "ערים", countries: "מדינות", host: "מנחה", location: "מיקום", unknown: "לא ידוע" },
  it: { franchises: "Franchise", seasons: "Stagioni", contestants: "Concorrenti", traitors: "Traditori", faithfuls: "Leali", winners: "Vincitori", cities: "Città", countries: "Paesi", host: "Conduttore", location: "Luogo", unknown: "Sconosciuto" },
  nb: { franchises: "Programmer", seasons: "Sesonger", contestants: "Deltakere", traitors: "Forrædere", faithfuls: "Troende", winners: "Vinnere", cities: "Byer", countries: "Land", host: "Programleder", location: "Sted", unknown: "Ukjent" },
  pl: { franchises: "Franczyzy", seasons: "Sezony", contestants: "Uczestnicy", traitors: "Zdrajcy", faithfuls: "Wierni", winners: "Zwycięzcy", cities: "Miasta", countries: "Kraje", host: "Prowadzący", location: "Lokalizacja", unknown: "Nieznane" },
  pt: { franchises: "Franquias", seasons: "Temporadas", contestants: "Participantes", traitors: "Traidores", faithfuls: "Fiéis", winners: "Vencedores", cities: "Cidades", countries: "Países", host: "Apresentador", location: "Local", unknown: "Desconhecido" },
  ro: { franchises: "Francize", seasons: "Sezoane", contestants: "Concurenți", traitors: "Trădători", faithfuls: "Credincioși", winners: "Câștigători", cities: "Orașe", countries: "Țări", host: "Gazdă", location: "Locație", unknown: "Necunoscut" },
  es: { franchises: "Franquicias", seasons: "Temporadas", contestants: "Concursantes", traitors: "Traidores", faithfuls: "Fieles", winners: "Ganadores", cities: "Ciudades", countries: "Países", host: "Presentador", location: "Ubicación", unknown: "Desconocido" },
  sv: { franchises: "Franchiser", seasons: "Säsonger", contestants: "Deltagare", traitors: "Förrädare", faithfuls: "Trogna", winners: "Vinnare", cities: "Städer", countries: "Länder", host: "Programledare", location: "Plats", unknown: "Okänd" },
  uk: { franchises: "Франшизи", seasons: "Сезони", contestants: "Учасники", traitors: "Зрадники", faithfuls: "Вірні", winners: "Переможці", cities: "Міста", countries: "Країни", host: "Ведучий", location: "Місце", unknown: "Невідомо" }
};

const UI_LABELS = {
  en: { contestantGeography: "Contestant Geography", contestantProfile: "Contestant Profile", showSources: "Show Sources", reset: "Reset", moreAnalytics: "☰ More analytics", voting: "🎯 Voting Analytics", timeline: "⏳ Player Timeline", graph: "🕸️ Social Graph", outcomeFunnel: "📉 Outcome Funnel", outcomeFunnelTitle: "Outcome Funnel", outcomeFunnelHint: "Compare the filtered cast's starting roles, eliminations, finalists, and winners.", fullCast: "Filtered Cast", startingRoles: "Starting Roles", eliminations: "Eliminations", endgame: "Endgame", murdered: "Murdered", banished: "Banished", quit: "Quit", finalists: "Finalists", survival: "⌛ Role Survival", survivalTitle: "Role Survival Chart", survivalHint: "Median exit episode by starting role.", winRates: "🏆 Win Rates", winRatesTitle: "Win-Rate Breakdown", winRatesHint: "Winning percentage by starting role and franchise.", eliminationTimeline: "📅 Elimination Timeline", eliminationsTitle: "Elimination Timeline", eliminationsHint: "Exit outcomes by episode.", placements: "▥ Placement Distribution", placementsTitle: "Placement Distribution", placementsHint: "Finishing placements by starting role.", diversity: "◎ Geographic Diversity", diversityTitle: "Geographic Diversity", diversityHint: "Distinct contestant cities and regions by season.", citiesLabel: "Cities", regionsLabel: "Regions", medianEpisode: "Median episode" },
  nl: { contestantGeography: "Geografie van deelnemers", contestantProfile: "Deelnemersprofiel", showSources: "Toon bronnen", reset: "Herstellen", moreAnalytics: "☰ Meer analyses", voting: "🎯 Stemanalyse", timeline: "⏳ Tijdlijn speler", graph: "🕸️ Sociaal netwerk", outcomeFunnel: "📉 Resultatentrechter", outcomeFunnelTitle: "Resultatentrechter", outcomeFunnelHint: "Vergelijk startrollen, eliminaties, finalisten en winnaars van de gefilterde groep.", fullCast: "Gefilterde groep", startingRoles: "Startrollen", eliminations: "Eliminaties", endgame: "Eindspel", murdered: "Vermoord", banished: "Verbannen", quit: "Gestopt", finalists: "Finalisten", survival: "⌛ Roloverleving", survivalTitle: "Roloverleving", survivalHint: "Mediane exitaflevering per startrol.", winRates: "🏆 Winpercentages", winRatesTitle: "Winpercentages", winRatesHint: "Winstpercentage per startrol en franchise.", eliminationTimeline: "📅 Eliminatietijdlijn", eliminationsTitle: "Eliminatietijdlijn", eliminationsHint: "Uitkomsten per aflevering.", placements: "▥ Plaatsverdeling", placementsTitle: "Plaatsverdeling", placementsHint: "Eindplaatsen per startrol.", diversity: "◎ Geografische diversiteit", diversityTitle: "Geografische diversiteit", diversityHint: "Unieke steden en regio's per seizoen.", citiesLabel: "Steden", regionsLabel: "Regio's", medianEpisode: "Mediane aflevering", episode: "Aflevering" },
  bg: { contestantGeography: "Geografiya na uchastnitsite", contestantProfile: "Profil na uchastnik", showSources: "Pokazhi iztochnitsi", reset: "Nulirane", moreAnalytics: "☰ Oshte analizi", voting: "🎯 Analiz na glasuveneto", timeline: "⏳ Hronologiya na igracha", graph: "🕸️ Sotsialna mrezha", outcomeFunnel: "📉 Funiya na rezultatite", outcomeFunnelTitle: "Funiya na rezultatite", outcomeFunnelHint: "Sravnete nachalnite roli, eliminatsiite, finalistite i pobeditelite na filtriranata grupa.", fullCast: "Filtrirana grupa", startingRoles: "Nachalni roli", eliminations: "Eliminatsii", endgame: "Krayna igra", murdered: "Ubi­ti", banished: "Izgoneni", quit: "Napusnali", finalists: "Finalisti", survival: "⌛ Otsyalyavane po rolya", survivalTitle: "Otsyalyavane po rolya", survivalHint: "Medianen epizod na otpadane po nachalna rolya.", winRates: "🏆 Protsent pobedi", winRatesTitle: "Protsent pobedi", winRatesHint: "Protsent pobedi po nachalna rolya i franshiz.", eliminationTimeline: "📅 Hronologiya na eliminatsiite", eliminationsTitle: "Hronologiya na eliminatsiite", eliminationsHint: "Izhodi po epizod.", placements: "▥ Razpredelenie na mestata", placementsTitle: "Razpredelenie na mestata", placementsHint: "Krayni mesta po nachalna rolya.", diversity: "◎ Geografsko raznoobrazie", diversityTitle: "Geografsko raznoobrazie", diversityHint: "Unikalni gradove i regioni po sezon.", citiesLabel: "Gradove", regionsLabel: "Regioni", medianEpisode: "Medianen epizod", episode: "Epizod" },
  cs: { contestantGeography: "Geografie soutěžících", contestantProfile: "Profil soutěžícího", showSources: "Zobrazit zdroje", reset: "Obnovit", moreAnalytics: "☰ Další analýzy", voting: "🎯 Analýza hlasování", timeline: "⏳ Časová osa hráče", graph: "🕸️ Sociální síť", outcomeFunnel: "📉 Trychtýř výsledků", outcomeFunnelTitle: "Trychtýř výsledků", outcomeFunnelHint: "Porovnejte počáteční role, vyřazení, finalisty a vítěze filtrované skupiny.", fullCast: "Filtrovaná skupina", startingRoles: "Počáteční role", eliminations: "Vyřazení", endgame: "Závěr hry", murdered: "Zavražděni", banished: "Vyřazeni", quit: "Odstoupili", finalists: "Finalisté", survival: "⌛ Přežití rolí", survivalTitle: "Přežití rolí", survivalHint: "Medián epizody vyřazení podle počáteční role.", winRates: "🏆 Míra výher", winRatesTitle: "Míra výher", winRatesHint: "Procento výher podle počáteční role a franšízy.", eliminationTimeline: "📅 Časová osa vyřazení", eliminationsTitle: "Časová osa vyřazení", eliminationsHint: "Výsledky podle epizody.", placements: "▥ Rozdělení umístění", placementsTitle: "Rozdělení umístění", placementsHint: "Konečná umístění podle počáteční role.", diversity: "◎ Geografická rozmanitost", diversityTitle: "Geografická rozmanitost", diversityHint: "Jedinečná města a regiony podle série.", citiesLabel: "Města", regionsLabel: "Regiony", medianEpisode: "Medián epizody", episode: "Epizoda" },
  fi: { contestantGeography: "Kilpailijoiden maantiede", contestantProfile: "Kilpailijaprofiili", showSources: "Näytä lähteet", reset: "Nollaa", moreAnalytics: "☰ Lisää analyysejä", voting: "🎯 Äänestysanalytiikka", timeline: "⏳ Pelaajan aikajana", graph: "🕸️ Sosiaalinen verkko", outcomeFunnel: "📉 Tulossuppilo", outcomeFunnelTitle: "Tulossuppilo", outcomeFunnelHint: "Vertaa suodatetun ryhmän aloitusrooleja, pudotuksia, finalisteja ja voittajia.", fullCast: "Suodatettu ryhmä", startingRoles: "Aloitusroolit", eliminations: "Pudotukset", endgame: "Loppupeli", murdered: "Murhatut", banished: "Karkotetut", quit: "Keskeyttäneet", finalists: "Finalistit", survival: "⌛ Roolien selviytyminen", survivalTitle: "Roolien selviytyminen", survivalHint: "Putoamisjakson mediaani aloitusroolin mukaan.", winRates: "🏆 Voittoprosentit", winRatesTitle: "Voittoprosentit", winRatesHint: "Voittoprosentti aloitusroolin ja formaatin mukaan.", eliminationTimeline: "📅 Pudotusten aikajana", eliminationsTitle: "Pudotusten aikajana", eliminationsHint: "Lopputulokset jaksoittain.", placements: "▥ Sijoitusten jakauma", placementsTitle: "Sijoitusten jakauma", placementsHint: "Loppusijoitukset aloitusroolin mukaan.", diversity: "◎ Maantieteellinen monimuotoisuus", diversityTitle: "Maantieteellinen monimuotoisuus", diversityHint: "Yksilölliset kaupungit ja alueet kausittain.", citiesLabel: "Kaupungit", regionsLabel: "Alueet", medianEpisode: "Mediaanijakso", episode: "Jakso" },
  da: { contestantGeography: "Deltagergeografi", contestantProfile: "Deltagerprofil", showSources: "Vis kilder", reset: "Nulstil", moreAnalytics: "☰ Flere analyser", voting: "🎯 Afstemningsanalyse", timeline: "⏳ Spiller tidslinje", graph: "🕸️ Socialt netværk", outcomeFunnel: "📉 Resultattragt", outcomeFunnelTitle: "Resultattragt", outcomeFunnelHint: "Sammenlign den filtrerede gruppes startroller, elimineringer, finalister og vindere.", fullCast: "Filtreret gruppe", startingRoles: "Startroller", eliminations: "Elimineringer", endgame: "Slutspil", murdered: "Myrdede", banished: "Forvist", quit: "Forlod", finalists: "Finalister", survival: "⌛ Rolleoverlevelse", survivalTitle: "Rolleoverlevelse", survivalHint: "Median episode for exit efter startrolle.", winRates: "🏆 Vinderprocenter", winRatesTitle: "Vinderprocenter", winRatesHint: "Vinderprocent efter startrolle og franchise.", eliminationTimeline: "📅 Elimineringstidslinje", eliminationsTitle: "Elimineringstidslinje", eliminationsHint: "Udfald pr. episode.", placements: "▥ Placeringsfordeling", placementsTitle: "Placeringsfordeling", placementsHint: "Slutplaceringer efter startrolle.", diversity: "◎ Geografisk mangfoldighed", diversityTitle: "Geografisk mangfoldighed", diversityHint: "Unikke byer og regioner pr. sæson.", citiesLabel: "Byer", regionsLabel: "Regioner", medianEpisode: "Medianepisode", episode: "Episode" },
  el: { contestantGeography: "Geografia paikton", contestantProfile: "Profil paikti", showSources: "Emfanisi pigon", reset: "Epanafora", moreAnalytics: "☰ Perissoteres analyses", voting: "🎯 Analysi psifoforias", timeline: "⏳ Chronogrammi paixti", graph: "🕸️ Koinoniko diktyo", outcomeFunnel: "📉 Choni apotelesmaton", outcomeFunnelTitle: "Choni apotelesmaton", outcomeFunnelHint: "Sygrinete tous arxikous rolous, tis apomakrynseis, tous finalist kai tous nikites tis filtrarmenís omadas.", fullCast: "Filtrarismeni omada", startingRoles: "Arxikoi roloi", eliminations: "Apomakrynseis", endgame: "Teliko paichnidi", murdered: "Dolofonimenoi", banished: "Exoristoi", quit: "Apoxorisan", finalists: "Finalist", survival: "⌛ Epiviosi rolon", survivalTitle: "Epiviosi rolon", survivalHint: "Mesi epidosi exodou ana arxiko rolo.", winRates: "🏆 Pososta nikis", winRatesTitle: "Pososta nikis", winRatesHint: "Pososto nikis ana arxiko rolo kai franchise.", eliminationTimeline: "📅 Chronogrammi apomakrynseon", eliminationsTitle: "Chronogrammi apomakrynseon", eliminationsHint: "Apotelesmata ana epeisodio.", placements: "▥ Katonomi katataxis", placementsTitle: "Katonomi katataxis", placementsHint: "Telikes katataxeis ana arxiko rolo.", diversity: "◎ Geografiki poikilotita", diversityTitle: "Geografiki poikilotita", diversityHint: "Monadies poleis kai peripheries ana sezon.", citiesLabel: "Poleis", regionsLabel: "Peripheries", medianEpisode: "Mesi epeisodio", episode: "Epeisodio" },
  fr: { contestantGeography: "Géographie des candidats", contestantProfile: "Profil du candidat", showSources: "Afficher les sources", reset: "Réinitialiser", moreAnalytics: "☰ Plus d'analyses", voting: "🎯 Analyse des votes", timeline: "⏳ Chronologie du joueur", graph: "🕸️ Graphe social", outcomeFunnel: "📉 Entonnoir des résultats", outcomeFunnelTitle: "Entonnoir des résultats", outcomeFunnelHint: "Comparez les rôles initiaux, les éliminations, les finalistes et les gagnants du groupe filtré.", fullCast: "Groupe filtré", startingRoles: "Rôles initiaux", eliminations: "Éliminations", endgame: "Fin de partie", murdered: "Assassinés", banished: "Bannis", quit: "Abandon", finalists: "Finalistes", survival: "⌛ Survie par rôle", survivalTitle: "Survie par rôle", survivalHint: "Épisode de sortie médian selon le rôle initial.", winRates: "🏆 Taux de victoire", winRatesTitle: "Taux de victoire", winRatesHint: "Pourcentage de victoire par rôle initial et franchise.", eliminationTimeline: "📅 Chronologie des éliminations", eliminationsTitle: "Chronologie des éliminations", eliminationsHint: "Sorties par épisode.", placements: "▥ Répartition des places", placementsTitle: "Répartition des places", placementsHint: "Places finales selon le rôle initial.", diversity: "◎ Diversité géographique", diversityTitle: "Diversité géographique", diversityHint: "Villes et régions distinctes par saison.", citiesLabel: "Villes", regionsLabel: "Régions", medianEpisode: "Épisode médian" },
  de: { contestantGeography: "Geografie der Kandidaten", contestantProfile: "Kandidatenprofil", showSources: "Quellen anzeigen", reset: "Zurücksetzen", moreAnalytics: "☰ Weitere Analysen", voting: "🎯 Abstimmungsanalyse", timeline: "⏳ Spielerzeitachse", graph: "🕸️ Soziales Netzwerk", outcomeFunnel: "📉 Ergebnis-Trichter", outcomeFunnelTitle: "Ergebnis-Trichter", outcomeFunnelHint: "Vergleichen Sie Startrollen, Eliminierungen, Finalisten und Gewinner der gefilterten Gruppe.", fullCast: "Gefilterte Gruppe", startingRoles: "Startrollen", eliminations: "Eliminierungen", endgame: "Endspiel", murdered: "Ermordet", banished: "Verbannt", quit: "Ausgestiegen", finalists: "Finalisten", survival: "⌛ Rollenüberleben", survivalTitle: "Rollenüberleben", survivalHint: "Median der Exit-Episode nach Startrolle.", winRates: "🏆 Gewinnraten", winRatesTitle: "Gewinnraten", winRatesHint: "Gewinnprozentsatz nach Startrolle und Franchise.", eliminationTimeline: "📅 Eliminierungsverlauf", eliminationsTitle: "Eliminierungsverlauf", eliminationsHint: "Ausgänge nach Episode.", placements: "▥ Platzierungsverteilung", placementsTitle: "Platzierungsverteilung", placementsHint: "Endplatzierungen nach Startrolle.", diversity: "◎ Geografische Vielfalt", diversityTitle: "Geografische Vielfalt", diversityHint: "Einzigartige Städte und Regionen je Staffel.", citiesLabel: "Städte", regionsLabel: "Regionen", medianEpisode: "Medianepisode", episode: "Episode" },
  hu: { contestantGeography: "Játékosok földrajza", contestantProfile: "Játékosprofil", showSources: "Források megjelenítése", reset: "Visszaállítás", moreAnalytics: "☰ További elemzések", voting: "🎯 Szavazási elemzés", timeline: "⏳ Játékos idővonal", graph: "🕸️ Társas háló", outcomeFunnel: "📉 Eredménytölcsér", outcomeFunnelTitle: "Eredménytölcsér", outcomeFunnelHint: "Hasonlítsa össze a szűrt csoport kezdő szerepeit, kieséseit, döntőseit és győzteseit.", fullCast: "Szűrt csoport", startingRoles: "Kezdő szerepek", eliminations: "Kiesések", endgame: "Végjáték", murdered: "Meggyilkoltak", banished: "Kiszavazottak", quit: "Kiléptek", finalists: "Döntősök", survival: "⌛ Szerepek túlélése", survivalTitle: "Szerepek túlélése", survivalHint: "A kiesési epizód mediánja kezdő szerep szerint.", winRates: "🏆 Győzelmi arányok", winRatesTitle: "Győzelmi arányok", winRatesHint: "Győzelmi százalék kezdő szerep és franchise szerint.", eliminationTimeline: "📅 Kiesési idővonal", eliminationsTitle: "Kiesési idővonal", eliminationsHint: "Eredmények epizódonként.", placements: "▥ Helyezések eloszlása", placementsTitle: "Helyezések eloszlása", placementsHint: "Végső helyezések kezdő szerep szerint.", diversity: "◎ Földrajzi sokszínűség", diversityTitle: "Földrajzi sokszínűség", diversityHint: "Egyedi városok és régiók évadonként.", citiesLabel: "Városok", regionsLabel: "Régiók", medianEpisode: "Medián epizód", episode: "Epizód" },
  hi: { contestantGeography: "Pratiyogiyon ka bhugol", contestantProfile: "Pratiyogi profile", showSources: "Srot dikhaen", reset: "Reset", moreAnalytics: "☰ Aur vishleshan", voting: "🎯 Voting Analytics", timeline: "⏳ Player Timeline", graph: "🕸️ Social Graph", outcomeFunnel: "📉 Parinam funnel", outcomeFunnelTitle: "Parinam funnel", outcomeFunnelHint: "Filtered group ke shuruati role, elimination, finalist aur vijetaon ki tulna karein.", fullCast: "Filtered group", startingRoles: "Shuruati roles", eliminations: "Eliminations", endgame: "Antim charan", murdered: "Murdered", banished: "Banished", quit: "Quit", finalists: "Finalists", survival: "⌛ Role survival", survivalTitle: "Role survival", survivalHint: "Shuruati role ke anusaar median exit episode.", winRates: "🏆 Win rates", winRatesTitle: "Win rates", winRatesHint: "Shuruati role aur franchise ke anusaar winning percentage.", eliminationTimeline: "📅 Elimination timeline", eliminationsTitle: "Elimination timeline", eliminationsHint: "Episode ke anusaar outcomes.", placements: "▥ Placement distribution", placementsTitle: "Placement distribution", placementsHint: "Shuruati role ke anusaar final placements.", diversity: "◎ Geographic diversity", diversityTitle: "Geographic diversity", diversityHint: "Har season ke unique shahar aur region.", citiesLabel: "Shahar", regionsLabel: "Regions", medianEpisode: "Median episode", episode: "Episode" },
  he: { contestantGeography: "גאוגרפיית המתמודדים", contestantProfile: "פרופיל מתמודד", showSources: "הצג מקורות", reset: "איפוס", moreAnalytics: "☰ ניתוחים נוספים", voting: "🎯 ניתוח הצבעות", timeline: "⏳ ציר זמן לשחקן", graph: "🕸️ רשת חברתית", outcomeFunnel: "📉 משפך תוצאות", outcomeFunnelTitle: "משפך תוצאות", outcomeFunnelHint: "השווה תפקידי פתיחה, הדחות, פיינליסטים וזוכים בקבוצה המסוננת.", fullCast: "קבוצה מסוננת", startingRoles: "תפקידי פתיחה", eliminations: "הדחות", endgame: "משחק סיום", murdered: "נרצחו", banished: "הודחו", quit: "פרשו", finalists: "פיינליסטים", survival: "⌛ הישרדות תפקידים", survivalTitle: "הישרדות תפקידים", survivalHint: "חציון פרק יציאה לפי תפקיד פתיחה.", winRates: "🏆 שיעורי ניצחון", winRatesTitle: "שיעורי ניצחון", winRatesHint: "אחוז ניצחונות לפי תפקיד פתיחה וזיכיון.", eliminationTimeline: "📅 ציר זמן להדחות", eliminationsTitle: "ציר זמן להדחות", eliminationsHint: "תוצאות לפי פרק.", placements: "▥ התפלגות מיקומים", placementsTitle: "התפלגות מיקומים", placementsHint: "מיקומים סופיים לפי תפקיד פתיחה.", diversity: "◎ גיוון גאוגרפי", diversityTitle: "גיוון גאוגרפי", diversityHint: "ערים ואזורים ייחודיים לפי עונה.", citiesLabel: "ערים", regionsLabel: "אזורים", medianEpisode: "פרק חציוני", episode: "פרק" },
  it: { contestantGeography: "Geografia dei concorrenti", contestantProfile: "Profilo del concorrente", showSources: "Mostra fonti", reset: "Reimposta", moreAnalytics: "☰ Altre analisi", voting: "🎯 Analisi votazioni", timeline: "⏳ Timeline giocatore", graph: "🕸️ Rete sociale", outcomeFunnel: "📉 Imbuto dei risultati", outcomeFunnelTitle: "Imbuto dei risultati", outcomeFunnelHint: "Confronta ruoli iniziali, eliminazioni, finalisti e vincitori del gruppo filtrato.", fullCast: "Gruppo filtrato", startingRoles: "Ruoli iniziali", eliminations: "Eliminazioni", endgame: "Finale", murdered: "Assassinati", banished: "Eliminati", quit: "Ritirati", finalists: "Finalisti", survival: "⌛ Sopravvivenza dei ruoli", survivalTitle: "Sopravvivenza dei ruoli", survivalHint: "Episodio mediano di uscita per ruolo iniziale.", winRates: "🏆 Tassi di vittoria", winRatesTitle: "Tassi di vittoria", winRatesHint: "Percentuale di vittorie per ruolo iniziale e franchise.", eliminationTimeline: "📅 Cronologia eliminazioni", eliminationsTitle: "Cronologia eliminazioni", eliminationsHint: "Esiti per episodio.", placements: "▥ Distribuzione piazzamenti", placementsTitle: "Distribuzione piazzamenti", placementsHint: "Piazzamenti finali per ruolo iniziale.", diversity: "◎ Diversità geografica", diversityTitle: "Diversità geografica", diversityHint: "Città e regioni uniche per stagione.", citiesLabel: "Città", regionsLabel: "Regioni", medianEpisode: "Episodio mediano", episode: "Episodio" },
  nb: { contestantGeography: "Deltakergeografi", contestantProfile: "Deltakerprofil", showSources: "Vis kilder", reset: "Tilbakestill", moreAnalytics: "☰ Flere analyser", voting: "🎯 Stemmeanalyse", timeline: "⏳ Spillertidslinje", graph: "🕸️ Sosialt nettverk", outcomeFunnel: "📉 Resultattrakt", outcomeFunnelTitle: "Resultattrakt", outcomeFunnelHint: "Sammenlign startroller, elimineringer, finalister og vinnere i den filtrerte gruppen.", fullCast: "Filtrert gruppe", startingRoles: "Startroller", eliminations: "Elimineringer", endgame: "Sluttspill", murdered: "Myrdet", banished: "Forvist", quit: "Forlot", finalists: "Finalister", survival: "⌛ Rolleoverlevelse", survivalTitle: "Rolleoverlevelse", survivalHint: "Median exit-episode etter startrolle.", winRates: "🏆 Vinnersjanser", winRatesTitle: "Vinnersjanser", winRatesHint: "Vinnerprosent etter startrolle og franchise.", eliminationTimeline: "📅 Elimineringslinje", eliminationsTitle: "Elimineringslinje", eliminationsHint: "Utfall per episode.", placements: "▥ Plasseringsfordeling", placementsTitle: "Plasseringsfordeling", placementsHint: "Sluttplasseringer etter startrolle.", diversity: "◎ Geografisk mangfold", diversityTitle: "Geografisk mangfold", diversityHint: "Unike byer og regioner per sesong.", citiesLabel: "Byer", regionsLabel: "Regioner", medianEpisode: "Medianepisode", episode: "Episode" },
  pl: { contestantGeography: "Geografia uczestników", contestantProfile: "Profil uczestnika", showSources: "Pokaż źródła", reset: "Resetuj", moreAnalytics: "☰ Więcej analiz", voting: "🎯 Analiza głosowania", timeline: "⏳ Oś czasu gracza", graph: "🕸️ Sieć społeczna", outcomeFunnel: "📉 Lejek wyników", outcomeFunnelTitle: "Lejek wyników", outcomeFunnelHint: "Porównaj role początkowe, eliminacje, finalistów i zwycięzców filtrowanej grupy.", fullCast: "Filtrowana grupa", startingRoles: "Role początkowe", eliminations: "Eliminacje", endgame: "Końcowa gra", murdered: "Zamordowani", banished: "Wygnani", quit: "Odeszli", finalists: "Finaliści", survival: "⌛ Przetrwanie ról", survivalTitle: "Przetrwanie ról", survivalHint: "Mediana odcinka wyjścia według roli początkowej.", winRates: "🏆 Wskaźniki wygranych", winRatesTitle: "Wskaźniki wygranych", winRatesHint: "Procent wygranych według roli początkowej i franczyzy.", eliminationTimeline: "📅 Oś eliminacji", eliminationsTitle: "Oś eliminacji", eliminationsHint: "Wyniki według odcinka.", placements: "▥ Rozkład miejsc", placementsTitle: "Rozkład miejsc", placementsHint: "Końcowe miejsca według roli początkowej.", diversity: "◎ Różnorodność geograficzna", diversityTitle: "Różnorodność geograficzna", diversityHint: "Unikalne miasta i regiony według sezonu.", citiesLabel: "Miasta", regionsLabel: "Regiony", medianEpisode: "Mediana odcinka", episode: "Odcinek" },
  pt: { contestantGeography: "Geografia dos participantes", contestantProfile: "Perfil do participante", showSources: "Mostrar fontes", reset: "Redefinir", moreAnalytics: "☰ Mais análises", voting: "🎯 Análise de votos", timeline: "⏳ Linha do tempo do jogador", graph: "🕸️ Rede social", outcomeFunnel: "📉 Funil de resultados", outcomeFunnelTitle: "Funil de resultados", outcomeFunnelHint: "Compare os papéis iniciais, eliminações, finalistas e vencedores do grupo filtrado.", fullCast: "Grupo filtrado", startingRoles: "Papéis iniciais", eliminations: "Eliminações", endgame: "Jogo final", murdered: "Assassinados", banished: "Banidos", quit: "Desistiram", finalists: "Finalistas", survival: "⌛ Sobrevivência por papel", survivalTitle: "Sobrevivência por papel", survivalHint: "Episódio mediano de saída por papel inicial.", winRates: "🏆 Taxas de vitória", winRatesTitle: "Taxas de vitória", winRatesHint: "Percentual de vitória por papel inicial e franquia.", eliminationTimeline: "📅 Linha do tempo de eliminações", eliminationsTitle: "Linha do tempo de eliminações", eliminationsHint: "Resultados por episódio.", placements: "▥ Distribuição de posições", placementsTitle: "Distribuição de posições", placementsHint: "Posições finais por papel inicial.", diversity: "◎ Diversidade geográfica", diversityTitle: "Diversidade geográfica", diversityHint: "Cidades e regiões distintas por temporada.", citiesLabel: "Cidades", regionsLabel: "Regiões", medianEpisode: "Episódio mediano", episode: "Episódio" },
  ro: { contestantGeography: "Geografia concurenților", contestantProfile: "Profilul concurentului", showSources: "Arată sursele", reset: "Resetează", moreAnalytics: "☰ Mai multe analize", voting: "🎯 Analiza votului", timeline: "⏳ Cronologia jucătorului", graph: "🕸️ Rețea socială", outcomeFunnel: "📉 Pâlnia rezultatelor", outcomeFunnelTitle: "Pâlnia rezultatelor", outcomeFunnelHint: "Compară rolurile inițiale, eliminările, finaliștii și câștigătorii grupului filtrat.", fullCast: "Grup filtrat", startingRoles: "Roluri inițiale", eliminations: "Eliminări", endgame: "Final", murdered: "Uciși", banished: "Alungați", quit: "Retrasi", finalists: "Finaliști", survival: "⌛ Supraviețuirea rolurilor", survivalTitle: "Supraviețuirea rolurilor", survivalHint: "Episodul median de ieșire după rolul inițial.", winRates: "🏆 Rate de câștig", winRatesTitle: "Rate de câștig", winRatesHint: "Procentul de câștig după rolul inițial și franciză.", eliminationTimeline: "📅 Cronologia eliminărilor", eliminationsTitle: "Cronologia eliminărilor", eliminationsHint: "Rezultate pe episod.", placements: "▥ Distribuția locurilor", placementsTitle: "Distribuția locurilor", placementsHint: "Locuri finale după rolul inițial.", diversity: "◎ Diversitate geografică", diversityTitle: "Diversitate geografică", diversityHint: "Orașe și regiuni unice pe sezon.", citiesLabel: "Orașe", regionsLabel: "Regiuni", medianEpisode: "Episod median", episode: "Episod" },
  es: { contestantGeography: "Geografía de concursantes", contestantProfile: "Perfil del concursante", showSources: "Mostrar fuentes", reset: "Restablecer", moreAnalytics: "☰ Más análisis", voting: "🎯 Analítica de votos", timeline: "⏳ Línea temporal del jugador", graph: "🕸️ Grafo social", outcomeFunnel: "📉 Embudo de resultados", outcomeFunnelTitle: "Embudo de resultados", outcomeFunnelHint: "Compara los roles iniciales, eliminaciones, finalistas y ganadores del grupo filtrado.", fullCast: "Grupo filtrado", startingRoles: "Roles iniciales", eliminations: "Eliminaciones", endgame: "Final", murdered: "Asesinados", banished: "Desterrados", quit: "Abandonaron", finalists: "Finalistas", survival: "⌛ Supervivencia por rol", survivalTitle: "Supervivencia por rol", survivalHint: "Episodio de salida mediano por rol inicial.", winRates: "🏆 Tasas de victoria", winRatesTitle: "Tasas de victoria", winRatesHint: "Porcentaje de victoria por rol inicial y franquicia.", eliminationTimeline: "📅 Línea temporal de eliminaciones", eliminationsTitle: "Línea temporal de eliminaciones", eliminationsHint: "Resultados por episodio.", placements: "▥ Distribución de posiciones", placementsTitle: "Distribución de posiciones", placementsHint: "Posiciones finales por rol inicial.", diversity: "◎ Diversidad geográfica", diversityTitle: "Diversidad geográfica", diversityHint: "Ciudades y regiones únicas por temporada.", citiesLabel: "Ciudades", regionsLabel: "Regiones", medianEpisode: "Episodio mediano", episode: "Episodio" },
  sv: { contestantGeography: "Deltagargeografi", contestantProfile: "Deltagarprofil", showSources: "Visa källor", reset: "Återställ", moreAnalytics: "☰ Fler analyser", voting: "🎯 Röstningsanalys", timeline: "⏳ Spelartidslinje", graph: "🕸️ Socialt nätverk", outcomeFunnel: "📉 Resultattratt", outcomeFunnelTitle: "Resultattratt", outcomeFunnelHint: "Jämför den filtrerade gruppens startroller, elimineringar, finalister och vinnare.", fullCast: "Filtrerad grupp", startingRoles: "Startroller", eliminations: "Elimineringar", endgame: "Slutspel", murdered: "Mördade", banished: "Förvisade", quit: "Lämnade", finalists: "Finalister", survival: "⌛ Rollöverlevnad", survivalTitle: "Rollöverlevnad", survivalHint: "Median för utslagsavsnitt per startroll.", winRates: "🏆 Vinstfrekvens", winRatesTitle: "Vinstfrekvens", winRatesHint: "Vinstprocent per startroll och franchise.", eliminationTimeline: "📅 Elimineringslinje", eliminationsTitle: "Elimineringslinje", eliminationsHint: "Utslag per avsnitt.", placements: "▥ Placeringsfördelning", placementsTitle: "Placeringsfördelning", placementsHint: "Slutplaceringar per startroll.", diversity: "◎ Geografisk mångfald", diversityTitle: "Geografisk mångfald", diversityHint: "Unika deltagarstäder och regioner per säsong.", citiesLabel: "Städer", regionsLabel: "Regioner", medianEpisode: "Medianavsnitt", episode: "Avsnitt" },
  uk: { contestantGeography: "Географія учасників", contestantProfile: "Профіль учасника", showSources: "Показати джерела", reset: "Скинути", moreAnalytics: "☰ Більше аналітики", voting: "🎯 Аналіз голосування", timeline: "⏳ Хронологія гравця", graph: "🕸️ Соціальна мережа", outcomeFunnel: "📉 Воронка результатів", outcomeFunnelTitle: "Воронка результатів", outcomeFunnelHint: "Порівнюйте стартові ролі, вибуття, фіналістів і переможців у відфільтрованому складі.", fullCast: "Відфільтрований склад", startingRoles: "Початкові ролі", eliminations: "Вибуття", endgame: "Фінал", murdered: "Убиті", banished: "Вигнані", quit: "Вийшли", finalists: "Фіналісти", survival: "⌛ Виживання ролей", survivalTitle: "Виживання ролей", survivalHint: "Медіанний епізод вибуття за початковою роллю.", winRates: "🏆 Відсоток перемог", winRatesTitle: "Відсоток перемог", winRatesHint: "Відсоток перемог за початковою роллю і франшизою.", eliminationTimeline: "📅 Хронологія вибуттів", eliminationsTitle: "Хронологія вибуттів", eliminationsHint: "Результати вибуття за епізодами.", placements: "▥ Розподіл місць", placementsTitle: "Розподіл місць", placementsHint: "Фінальні місця за початковою роллю.", diversity: "◎ Географічна різноманітність", diversityTitle: "Географічна різноманітність", diversityHint: "Унікальні міста та регіони учасників за сезонами.", citiesLabel: "Міста", regionsLabel: "Регіони", medianEpisode: "Медіанний епізод" }
};

UI_LABELS.en.episode = "Episode";
UI_LABELS.fr.episode = "Épisode";
UI_LABELS.uk.episode = "Епізод";

const LANGUAGE_TO_LOCALE = {
  english: "en-US",
  french: "fr-FR",
  dutch: "nl-NL",
  bulgarian: "bg-BG",
  czech: "cs-CZ",
  finnish: "fi-FI",
  danish: "da-DK",
  greek: "el-GR",
  german: "de-DE",
  hungarian: "hu-HU",
  hindi: "hi-IN",
  hebrew: "he-IL",
  italian: "it-IT",
  norwegian: "nb-NO",
  polish: "pl-PL",
  portuguese: "pt-PT",
  romanian: "ro-RO",
  spanish: "es-ES",
  swedish: "sv-SE",
  ukrainian: "uk-UA"
};

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
const tabButtons = document.querySelectorAll(".tab-btn, .analytics-menu-list button");
const analyticsTabButtons = [...tabButtons].filter((button) => button.dataset.tab);
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetTab = btn.dataset.tab;
    if (!targetTab) return;
    if (activeTab === targetTab) return;

    tabButtons.forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((panel) => panel.classList.remove("active"));

    btn.classList.add("active");
    const activePanel = document.getElementById(targetTab);
    if (activePanel) activePanel.classList.add("active");

    activeTab = targetTab;
    if (analyticsMenu) analyticsMenu.hidden = true;
    if (analyticsMenuBtn) analyticsMenuBtn.setAttribute("aria-expanded", "false");
    handleTabActivation(targetTab);
  });
});

analyticsMenuBtn?.addEventListener("click", () => {
  const open = analyticsMenu.hidden;
  analyticsMenu.hidden = !open;
  analyticsMenuBtn.setAttribute("aria-expanded", String(open));
});

function updateResponsiveTabs() {
  if (!tabNav || !analyticsMenu || !analyticsMenuHost || !analyticsMenuBtn) return;

  analyticsTabButtons.forEach((button) => tabNav.insertBefore(button, analyticsMenuHost));
  analyticsMenu.replaceChildren();
  analyticsMenuHost.hidden = false;

  const gap = Number.parseFloat(getComputedStyle(tabNav).gap) || 0;
  const availableWidth = tabNav.clientWidth;
  const tabWidth = (buttons) => buttons.reduce((width, button) => width + button.offsetWidth, 0) + Math.max(0, buttons.length - 1) * gap;
  const allFit = tabWidth(analyticsTabButtons) <= availableWidth;

  if (allFit) {
    analyticsMenuHost.hidden = true;
    analyticsMenu.hidden = true;
    analyticsMenuBtn.setAttribute("aria-expanded", "false");
    return;
  }

  const visibleTabs = [];
  for (const button of analyticsTabButtons) {
    const candidateTabs = [...visibleTabs, button];
    const itemCount = candidateTabs.length + 1;
    if (tabWidth(candidateTabs) + analyticsMenuBtn.offsetWidth + itemCount * gap > availableWidth && visibleTabs.length) break;
    visibleTabs.push(button);
  }

  analyticsTabButtons.slice(visibleTabs.length).forEach((button) => analyticsMenu.appendChild(button));
  analyticsMenu.hidden = true;
  analyticsMenuBtn.setAttribute("aria-expanded", "false");
}

if (typeof ResizeObserver !== "undefined" && document.querySelector(".main-display")) {
  let resizeFrame;
  new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(updateResponsiveTabs);
  }).observe(document.querySelector(".main-display"));
}

function handleTabActivation(tabId) {
  if (tabId === "tab-map") {
    renderMap(currentContestants);
  } else if (tabId === "tab-leaderboard") {
    loadAndRenderLeaderboard();
  } else if (tabId === "tab-voting") {
    loadAndRenderVotingAnalytics();
  } else if (tabId === "tab-outcomes") {
    loadAndRenderOutcomeFunnel();
  } else if (["tab-survival", "tab-win-rates", "tab-eliminations", "tab-placements", "tab-diversity"].includes(tabId)) {
    loadAndRenderAdvancedAnalytics(tabId);
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

function tr(key) {
  const table = TRANSLATIONS[activeUiLanguage] || TRANSLATIONS.en;
  const dynamicLabels = DYNAMIC_LABELS[activeUiLanguage] || DYNAMIC_LABELS.en;
  const uiLabels = UI_LABELS[activeUiLanguage] || UI_LABELS.en;
  return table[key] || dynamicLabels[key] || uiLabels[key] || TRANSLATIONS.en[key] || DYNAMIC_LABELS.en[key] || UI_LABELS.en[key] || key;
}

function normalizeLanguageName(raw) {
  if (!raw) return "english";
  return String(raw)
    .split("(")[0]
    .trim()
    .toLowerCase();
}

function preferredKitLanguage(languages) {
  const normalized = (languages || []).map((entry) => ({ raw: entry, normalized: normalizeLanguageName(entry) }));
  const nonEnglish = normalized.find((entry) => entry.normalized !== "english");
  return (nonEnglish || normalized[0] || { raw: "English" }).raw;
}

function localeFromLanguage(language, country) {
  const normalized = normalizeLanguageName(language);
  const mapped = LANGUAGE_TO_LOCALE[normalized];
  if (!mapped) return COUNTRY_UI_LOCALE_FALLBACK[country] || "en-US";

  if (normalized === "french" && (country === "Canada" || country === "Canada (Québec)")) return "fr-CA";
  if (normalized === "dutch" && country === "Belgium (Flanders)") return "nl-BE";
  if (normalized === "french" && country === "Belgium (Wallonia)") return "fr-BE";
  return mapped;
}

function applyStaticTranslations() {
  const update = (id, value) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  };

  update("subtitleText", tr("appSubtitle"));
  update("filtersTitleText", tr("filters"));
  update("countryLabelText", tr("country"));
  update("seasonLabelText", tr("season"));
  update("roleLabelText", tr("role"));
  update("outcomeLabelText", tr("outcome"));
  update("roleOptionAllText", tr("allRoles"));
  update("roleOptionFaithfulText", tr("faithful"));
  update("roleOptionTraitorText", tr("traitor"));
  update("outcomeOptionAllText", tr("allOutcomes"));
  update("outcomeOptionWinnerText", tr("winner"));
  update("outcomeOptionFinaleText", tr("finale"));
  update("outcomeOptionBanishmentText", tr("banishment"));
  update("outcomeOptionMurderText", tr("murder"));
  update("outcomeOptionQuitText", tr("quit"));
  update("outcomeOptionRemovedText", tr("removed"));
  update("tabMapBtnText", tr("tabMap"));
  update("tabLeaderboardBtnText", tr("tabLeaderboard"));
  update("tabVotingBtnText", tr("tabVoting"));
  update("analyticsMenuBtn", tr("moreAnalytics"));
  update("tabVotingBtnText", tr("voting"));
  update("tabOutcomeBtnText", tr("outcomeFunnel"));
  update("tabSurvivalBtnText", tr("survival"));
  update("tabWinRatesBtnText", tr("winRates"));
  update("tabEliminationsBtnText", tr("eliminationTimeline"));
  update("tabPlacementsBtnText", tr("placements"));
  update("tabDiversityBtnText", tr("diversity"));
  update("tabTimelineBtnText", tr("timeline"));
  update("tabGraphBtnText", tr("graph"));
  update("tabTimelineBtnText", tr("tabTimeline"));
  update("tabGraphBtnText", tr("tabGraph"));
  update("contestantGeographyTitle", tr("contestantGeography"));
  update("contestantProfileTitle", tr("contestantProfile"));
  update("zoomResetBtn", tr("reset"));
  update("graphZoomResetBtn", tr("reset"));
  update("outcomeFunnelTitle", tr("outcomeFunnelTitle"));
  update("outcomeFunnelHint", tr("outcomeFunnelHint"));
  update("survivalTitle", tr("survivalTitle"));
  update("survivalHint", tr("survivalHint"));
  update("winRatesTitle", tr("winRatesTitle"));
  update("winRatesHint", tr("winRatesHint"));
  update("eliminationsTitle", tr("eliminationsTitle"));
  update("eliminationsHint", tr("eliminationsHint"));
  update("placementsTitle", tr("placementsTitle"));
  update("placementsHint", tr("placementsHint"));
  update("diversityTitle", tr("diversityTitle"));
  update("diversityHint", tr("diversityHint"));
  update("languageModeEnglishText", tr("modeEnglish"));
  update("languageModeCountryText", tr("modeCountry"));
  requestAnimationFrame(updateResponsiveTabs);
}

function humanizeLocationType(locationType) {
  if (!locationType) return "Unknown";
  return locationType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveLanguageKit(country) {
  const existing = languageKitsByCountry.get(country);
  if (existing) {
    return {
      country,
      languages: Array.isArray(existing.languages) && existing.languages.length ? existing.languages : ["English"],
      ui_locale: existing.ui_locale || COUNTRY_UI_LOCALE_FALLBACK[country] || "en-US"
    };
  }

  return {
    country,
    languages: ["English"],
    ui_locale: COUNTRY_UI_LOCALE_FALLBACK[country] || "en-US"
  };
}

function englishLocaleForCountry(country) {
  const fallback = COUNTRY_UI_LOCALE_FALLBACK[country] || "en-US";
  return String(fallback).startsWith("en-") ? fallback : "en-US";
}

function applyCountryLanguageKit(country) {
  const kit = resolveLanguageKit(country);
  const selectedLanguage = useCountryLanguageUi ? preferredKitLanguage(kit.languages) : "English";
  activeLocale = useCountryLanguageUi
    ? localeFromLanguage(selectedLanguage, country)
    : englishLocaleForCountry(country);
  activeCountryLanguages = kit.languages;
  const languagePrefix = String(activeLocale).split("-")[0].toLowerCase();
  activeUiLanguage = TRANSLATIONS[languagePrefix] ? languagePrefix : "en";
  document.documentElement.lang = String(activeLocale).split("-")[0];

  applyStaticTranslations();

  if (languageKitBadge) {
    const kitText = kit.languages.join(", ");
    const mode = useCountryLanguageUi ? tr("modeCountry") : tr("modeEnglish");
    languageKitBadge.textContent = `${tr("languageModeLabel")}: ${mode} | ${tr("kitLabel")}: ${kitText} | ${tr("localeLabel")}: ${activeLocale}`;
  }
}

function humanizeTimestamp(isoValue) {
  if (!isoValue) return "Unknown";
  const parsed = new Date(isoValue);
  if (Number.isNaN(parsed.getTime())) return isoValue;

  return new Intl.DateTimeFormat(activeLocale || undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(parsed);
}

async function jsonFetch(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (networkErr) {
    console.error(`jsonFetch network error for ${url}:`, networkErr);
    throw new Error("Unable to reach the server. Please check your connection and try again.");
  }

  if (!res.ok) {
    console.error(`jsonFetch failed for ${url}: ${res.status} ${res.statusText}`);
    throw new Error("Unable to retrieve data right now. Please try again shortly.");
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
  allOption.textContent = tr("allSeasonsInCountry");
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
    [tr("franchises"), stats.franchises],
    [tr("seasons"), stats.seasons],
    [tr("contestants"), stats.contestants],
    [tr("traitors"), stats.traitors],
    [tr("faithfuls"), stats.faithfuls],
    [tr("winners"), stats.winners],
    [tr("cities"), stats.cities],
    [tr("countries"), stats.countries]
  ];

  rows.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.innerHTML = `<strong>${label}:</strong> ${value}`;
    statsPanel.appendChild(row);
  });
}

function renderShowContext(context) {
  const hosts = context.hosts && context.hosts.length ? context.hosts.join(", ") : tr("unknown");
  const venues = context.venues && context.venues.length ? context.venues.join(", ") : tr("unknown");

  showContextPanel.innerHTML = `
    <div><strong>${tr("host")}:</strong> ${hosts}</div>
    <div><strong>${tr("location")}:</strong> ${venues}</div>
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
  if (!worldGeoJson || !Array.isArray(worldGeoJson.features)) {
    return null;
  }
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
    console.error("Failed to load leaderboard:", err);
    chartBox.innerHTML = "<div class='profile-empty'>Unable to load the leaderboard right now. Please try again later.</div>";
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
    console.error("Failed to load voting analytics:", err);
    summaryBox.innerHTML = "<div class='profile-empty'>Unable to load voting analytics right now. Please try again later.</div>";
  }
}

/* ===========================================================================
   TAB 4: Outcome Funnel
   =========================================================================== */
async function loadAndRenderOutcomeFunnel() {
  const root = document.getElementById("outcomeFunnelRoot");
  root.innerHTML = "<div class='profile-empty'>Loading outcome funnel...</div>";

  try {
    const funnel = await jsonFetch(`/api/outcome-funnel?${buildQueryString()}`);
    if (!funnel.total) {
      root.innerHTML = "<div class='profile-empty'>No contestants match the current filters.</div>";
      return;
    }

    const row = (label, value, type) => {
      const share = Math.round((value / funnel.total) * 100);
      return `
        <div class="funnel-row">
          <span>${label}</span><strong>${value}</strong>
          <div class="funnel-bar-track"><div class="funnel-bar ${type}" style="width: ${share}%"></div></div>
        </div>`;
    };

    root.innerHTML = `
      <section class="funnel-stage funnel-total"><h3>${tr("fullCast")}</h3><strong>${funnel.total}</strong></section>
      <section class="funnel-stage"><h3>${tr("startingRoles")}</h3>${row(tr("faithful"), funnel.starting_roles.faithful, "faithful")}${row(tr("traitor"), funnel.starting_roles.traitor, "traitor")}</section>
      <section class="funnel-stage"><h3>${tr("eliminations")}</h3>${row(tr("murdered"), funnel.outcomes.murder, "murder")}${row(tr("banished"), funnel.outcomes.banishment, "banishment")}${row(tr("quit"), funnel.outcomes.quit, "quit")}</section>
      <section class="funnel-stage"><h3>${tr("endgame")}</h3>${row(tr("finalists"), funnel.outcomes.finalists, "finalists")}${row(tr("winners"), funnel.outcomes.winners, "winners")}</section>
    `;
  } catch (err) {
    console.error("Failed to load outcome funnel:", err);
    root.innerHTML = "<div class='profile-empty'>Unable to load the outcome funnel right now. Please try again later.</div>";
  }
}

async function loadAndRenderAdvancedAnalytics(tabId) {
  const rootByTab = {
    "tab-survival": "survivalRoot",
    "tab-win-rates": "winRatesRoot",
    "tab-eliminations": "eliminationsRoot",
    "tab-placements": "placementsRoot",
    "tab-diversity": "diversityRoot"
  };
  const root = document.getElementById(rootByTab[tabId]);
  if (!root) return;
  root.innerHTML = "<div class='profile-empty'>Loading analytics...</div>";

  try {
    const data = await jsonFetch(`/api/advanced-analytics?${buildQueryString()}`);
    const bar = (label, value, max, type, suffix = "") => `
      <div class="analytics-bar-line"><span>${label}</span><div class="analytics-bar-track"><div class="analytics-bar ${type}" style="width: ${max ? Math.round((value / max) * 100) : 0}%"></div></div><strong>${value}${suffix}</strong></div>`;
    const section = (label, bars) => `<section class="analytics-chart-row"><div class="analytics-chart-label">${label}</div><div class="analytics-bars">${bars}</div></section>`;
    const empty = "<div class='profile-empty'>No data matches the current filters.</div>";

    if (tabId === "tab-survival") {
      const max = Math.max(1, ...data.survival.flatMap((row) => [row.faithful || 0, row.traitor || 0]));
      root.innerHTML = data.survival.length ? data.survival.map((row) => section(row.label, `${bar(tr("faithful"), row.faithful ?? 0, max, "faithful")}${bar(tr("traitor"), row.traitor ?? 0, max, "traitor")}`)).join("") : empty;
      return;
    }
    if (tabId === "tab-win-rates") {
      root.innerHTML = data.win_rates.length ? data.win_rates.map((row) => section(row.label, `${bar(tr("faithful"), row.faithful.rate, 100, "faithful", "%")}${bar(tr("traitor"), row.traitor.rate, 100, "traitor", "%")}`)).join("") : empty;
      return;
    }
    if (tabId === "tab-eliminations") {
      const max = Math.max(1, ...data.elimination_timeline.flatMap((row) => [row.murder, row.banishment, row.quit, row.finale]));
      root.innerHTML = data.elimination_timeline.length ? data.elimination_timeline.map((row) => section(`${tr("episode")} ${row.episode ?? "?"}`, `${bar(tr("murdered"), row.murder, max, "murder")}${bar(tr("banished"), row.banishment, max, "banishment")}${bar(tr("quit"), row.quit, max, "quit")}${bar(tr("finale"), row.finale, max, "finale")}`)).join("") : empty;
      return;
    }
    if (tabId === "tab-placements") {
      const max = Math.max(1, ...data.placements.flatMap((row) => [row.faithful, row.traitor]));
      root.innerHTML = data.placements.length ? data.placements.map((row) => section(row.placement ? `#${row.placement}` : tr("unknown"), `${bar(tr("faithful"), row.faithful, max, "faithful")}${bar(tr("traitor"), row.traitor, max, "traitor")}`)).join("") : empty;
      return;
    }
    const max = Math.max(1, ...data.diversity.flatMap((row) => [row.cities, row.regions]));
    root.innerHTML = data.diversity.length ? data.diversity.map((row) => section(row.label, `${bar(tr("citiesLabel"), row.cities, max, "cities")}${bar(tr("regionsLabel"), row.regions, max, "regions")}`)).join("") : empty;
  } catch (err) {
    console.error("Failed to load advanced analytics:", err);
    root.innerHTML = "<div class='profile-empty'>Unable to load analytics right now. Please try again later.</div>";
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
    console.error("Failed to load timeline:", err);
    container.innerHTML = "<div class='profile-empty'>Unable to load the timeline right now. Please try again later.</div>";
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
    console.error("Failed to load social graph:", err);
    root.innerHTML = "<div class='profile-empty'>Unable to load the social graph right now. Please try again later.</div>";
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
      return (a.country || "").localeCompare(b.country || "", activeLocale || undefined);
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
        ${tr("showSources")}
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
  applyCountryLanguageKit(countryFilter.value);
  await loadCountryScopedSeasons();
  await refresh();
});

if (languageModeToggle) {
  languageModeToggle.checked = useCountryLanguageUi;
  languageModeToggle.addEventListener("change", async () => {
    useCountryLanguageUi = Boolean(languageModeToggle.checked);
    applyCountryLanguageKit(countryFilter.value);
    await refresh();
  });
}

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
    const [countries, languageKitsPayload, geo] = await Promise.all([
      jsonFetch("/api/countries"),
      jsonFetch("/api/language-kits"),
      jsonFetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    ]);

    worldGeoJson = geo;
    const languageKits = Array.isArray(languageKitsPayload) ? languageKitsPayload : [];
    languageKits.forEach((kit) => {
      if (kit && kit.country) {
        languageKitsByCountry.set(kit.country, {
          languages: Array.isArray(kit.languages) ? kit.languages : ["English"],
          ui_locale: kit.ui_locale || COUNTRY_UI_LOCALE_FALLBACK[kit.country] || "en-US"
        });
      }
    });
    fillCountryFilter(countries);

    if (countries.length > 0) {
      countryFilter.value = countries[0];
      applyCountryLanguageKit(countryFilter.value);
    }

    await loadCountryScopedSeasons();
    await refresh();
  } catch (error) {
    console.error("Failed to initialize app:", error);
    profilePanel.innerHTML = "<div class=\"profile-empty\">Unable to load data right now. Please refresh the page or try again later.</div>";
  }
})();
