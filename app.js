const cityState = {
  morning: {
    weather: "Light rain 13°C",
    traffic: "Peak delays",
    air: "Good",
    rainPenalty: 18,
    trafficPenalty: 22,
    crowdBias: 8,
  },
  noon: {
    weather: "Cloudy 18°C",
    air: "Excellent",
    rainPenalty: 0,
    trafficPenalty: 6,
    crowdBias: 0,
  },
  evening: {
    weather: "Showers 15°C",
    traffic: "Moderate delays",
    air: "Good",
    rainPenalty: 14,
    trafficPenalty: 17,
    crowdBias: 12,
  },
  night: {
    weather: "Clear 11°C",
    traffic: "Low delays",
    air: "Moderate",
    rainPenalty: 0,
    trafficPenalty: 4,
    crowdBias: -5,
  },
};

const scenarioProfiles = {
  focus: {
    label: "Quiet study",
    wanted: ["quiet", "wifi", "indoor"],
    baseWeights: { speed: 0.24, calm: 0.3, comfort: 0.32, budget: 0.14 },
  },
  group: {
    label: "Group study",
    wanted: ["group", "study-space", "wifi"],
    baseWeights: { speed: 0.25, calm: 0.16, comfort: 0.36, budget: 0.23 },
  },
  medicine: {
    label: "Medical resources",
    wanted: ["medicine", "quiet", "indoor"],
    baseWeights: { speed: 0.22, calm: 0.22, comfort: 0.34, budget: 0.22 },
  },
  late: {
    label: "Late study",
    wanted: ["24h", "quiet", "indoor"],
    baseWeights: { speed: 0.2, calm: 0.3, comfort: 0.36, budget: 0.14 },
  },
  nearest: {
    label: "Nearest seat",
    wanted: ["wifi", "indoor", "campus"],
    baseWeights: { speed: 0.48, calm: 0.16, comfort: 0.2, budget: 0.16 },
  },
};

const startOffsets = {
  mapSelection: {
    label: "Map selection",
    lat: 51.498356,
    lng: -0.176894,
    modifier: 0,
  },
  southKensington: {
    label: "South Kensington",
    lat: 51.498356,
    lng: -0.176894,
    modifier: 0,
    southKensington: -4,
    charingCross: 16,
    chelseaWestminster: 9,
    hammersmith: 18,
    whiteCity: 22,
    royalBrompton: 8,
    stMarys: 17,
    silwoodPark: 62,
    britishLibrary: 0,
    wellcomeCollection: 0,
    barbican: 0,
    whitechapel: 0,
  },
  whiteCity: {
    label: "White City",
    lat: 51.515768,
    lng: -0.224009,
    modifier: 0,
    southKensington: 20,
    charingCross: 24,
    chelseaWestminster: 19,
    hammersmith: 12,
    whiteCity: -4,
    royalBrompton: 21,
    stMarys: 18,
    silwoodPark: 58,
    britishLibrary: 8,
    wellcomeCollection: 7,
    barbican: 11,
    whitechapel: 12,
  },
  hammersmith: {
    label: "Hammersmith",
    lat: 51.51742,
    lng: -0.234721,
    modifier: 0,
    southKensington: 18,
    charingCross: 15,
    chelseaWestminster: 16,
    hammersmith: -4,
    whiteCity: 12,
    royalBrompton: 17,
    stMarys: 20,
    silwoodPark: 61,
    britishLibrary: 8,
    wellcomeCollection: 8,
    barbican: 12,
    whitechapel: 14,
  },
  stMarys: {
    label: "St Mary's",
    lat: 51.517403,
    lng: -0.174169,
    modifier: 0,
    southKensington: 18,
    charingCross: 26,
    chelseaWestminster: 20,
    hammersmith: 22,
    whiteCity: 18,
    royalBrompton: 18,
    stMarys: -4,
    silwoodPark: 58,
    britishLibrary: -4,
    wellcomeCollection: -5,
    barbican: 7,
    whitechapel: 10,
  },
};

const places = [
  {
    name: "Abdus Salam Library",
    zone: "southKensington",
    type: "Main campus library",
    lat: 51.498356,
    lng: -0.176894,
    image: "./assets/library-images/abdus-salam-library.jpg",
    website: "https://www.imperial.ac.uk/admin-services/library/use-the-library/our-libraries/abdus-salam-library/",
    transitMinutes: 4,
    comfort: 88,
    budget: 100,
    tags: ["quiet", "wifi", "indoor", "24h", "science", "central"],
  },
  {
    name: "GoStudy and Student Space",
    zone: "southKensington",
    type: "Study space",
    lat: 51.4984,
    lng: -0.1752,
    image: "./assets/library-images/gostudy-student-space.jpg",
    website: "https://www.imperial.ac.uk/admin-services/library/use-the-library/our-libraries/gostudy/",
    transitMinutes: 6,
    comfort: 80,
    budget: 100,
    tags: ["wifi", "indoor", "study-space", "group", "low-cost"],
  },
  {
    name: "Charing Cross Campus Library",
    zone: "charingCross",
    type: "Medical library",
    lat: 51.4872,
    lng: -0.2197,
    image: "./assets/library-images/charing-cross-library.jpg",
    website: "https://www.imperial.ac.uk/admin-services/library/use-the-library/our-libraries/charing-cross-campus-library/",
    transitMinutes: 28,
    comfort: 78,
    budget: 100,
    tags: ["quiet", "wifi", "indoor", "medicine", "campus"],
  },
  {
    name: "Chelsea and Westminster Campus Library",
    zone: "chelseaWestminster",
    type: "Medical library",
    lat: 51.4846,
    lng: -0.1819,
    image: "./assets/library-images/chelsea-westminster-library.jpg",
    website: "https://www.imperial.ac.uk/admin-services/library/use-the-library/our-libraries/chelsea-and-westminster-campus-library/",
    transitMinutes: 18,
    comfort: 76,
    budget: 100,
    tags: ["quiet", "wifi", "indoor", "medicine", "calm"],
  },
  {
    name: "Hammersmith Campus Library",
    zone: "hammersmith",
    type: "Medical library",
    lat: 51.51742,
    lng: -0.234721,
    image: "./assets/library-images/hammersmith-library.jpg",
    website: "https://www.imperial.ac.uk/admin-services/library/use-the-library/our-libraries/hammersmith-campus-library/",
    transitMinutes: 31,
    comfort: 79,
    budget: 100,
    tags: ["quiet", "wifi", "indoor", "medicine", "campus"],
  },
  {
    name: "Royal Brompton Campus Library",
    zone: "royalBrompton",
    type: "Medical library",
    lat: 51.4892,
    lng: -0.1708,
    image: "./assets/library-images/royal-brompton-library.jpg",
    website: "https://www.imperial.ac.uk/admin-services/library/use-the-library/our-libraries/royal-brompton-campus-library/",
    transitMinutes: 15,
    comfort: 75,
    budget: 100,
    tags: ["quiet", "wifi", "indoor", "medicine", "calm"],
  },
  {
    name: "St Mary's Campus Library",
    zone: "stMarys",
    type: "Medical library",
    lat: 51.517403,
    lng: -0.174169,
    image: "./assets/library-images/st-marys-library.jpg",
    website: "https://www.imperial.ac.uk/admin-services/library/use-the-library/our-libraries/st-marys-campus-library/",
    transitMinutes: 27,
    comfort: 78,
    budget: 100,
    tags: ["quiet", "wifi", "indoor", "medicine", "campus"],
  },
  {
    name: "Silwood Park Campus Library",
    zone: "silwoodPark",
    type: "Campus library",
    lat: 51.4113,
    lng: -0.6415,
    image: "./assets/library-images/silwood-park-library.jpg",
    website: "https://www.imperial.ac.uk/admin-services/library/use-the-library/our-libraries/silwood-park-campus-library/",
    transitMinutes: 78,
    comfort: 82,
    budget: 100,
    tags: ["quiet", "wifi", "indoor", "green", "calm"],
  },
  {
    name: "British Library",
    zone: "britishLibrary",
    type: "National library",
    lat: 51.529972,
    lng: -0.127675,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/British%20Library%20%2B%20St%20Pancras%207527-31hug.jpg?width=900",
    website: "https://www.bl.uk/visit",
    transitMinutes: 26,
    comfort: 86,
    budget: 100,
    tags: ["quiet", "wifi", "indoor", "public", "research", "central"],
  },
  {
    name: "Wellcome Collection Library",
    zone: "wellcomeCollection",
    type: "Public research library",
    lat: 51.5259,
    lng: -0.134,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/View%20of%20the%20Wellcome%20library%2C%20ground%20floor%20Wellcome%20M0013088.jpg?width=900",
    website: "https://wellcomecollection.org/visit-us/the-library",
    transitMinutes: 24,
    comfort: 84,
    budget: 100,
    tags: ["quiet", "wifi", "indoor", "public", "medicine", "research"],
  },
  {
    name: "Barbican Library",
    zone: "barbican",
    type: "Public library",
    lat: 51.519811,
    lng: -0.093919,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Barbican%20library%20%287049041697%29.jpg?width=900",
    website: "https://www.cityoflondon.gov.uk/services/libraries/barbican-library",
    transitMinutes: 32,
    comfort: 78,
    budget: 100,
    tags: ["wifi", "indoor", "public", "study-space", "arts", "group"],
  },
  {
    name: "Idea Store Whitechapel",
    zone: "whitechapel",
    type: "Public library and learning centre",
    lat: 51.519853,
    lng: -0.057958,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ideas%20Store%20Whitechapel%20%2832550032767%29.jpg?width=900",
    website: "https://ideastore.towerhamlets.gov.uk/digital-content/idea-stores/whitechapel",
    transitMinutes: 38,
    comfort: 76,
    budget: 100,
    tags: ["wifi", "indoor", "public", "study-space", "learning", "community"],
  },
];

const API_BASE_STORAGE_KEY = "imperialNavigatorApiBase";
const DEFAULT_REMOTE_API_BASE = "https://imperial-travel-agent-api.onrender.com";

const $ = (id) => document.getElementById(id);

function normalizeApiBase(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function isLocalPage() {
  return ["", "localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function getConfiguredApiBase() {
  const params = new URLSearchParams(window.location.search);
  const explicitApiBase = normalizeApiBase(params.get("api") || params.get("apiBase"));
  if (explicitApiBase) {
    window.localStorage.setItem(API_BASE_STORAGE_KEY, explicitApiBase);
    return explicitApiBase;
  }

  if (isLocalPage()) return "";

  const storedApiBase = normalizeApiBase(window.localStorage.getItem(API_BASE_STORAGE_KEY));
  if (storedApiBase) return storedApiBase;

  return DEFAULT_REMOTE_API_BASE;
}

const apiBase = getConfiguredApiBase();

function apiUrl(path) {
  return `${apiBase}${path}`;
}

function apiFetch(path, options) {
  return fetch(apiUrl(path), options);
}

function apiBaseLabel() {
  return apiBase || window.location.origin;
}

function formatModelDisplayName(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text === "Qwen/Qwen3-235B-A22B-Instruct-2507-tput") {
    return "Qwen3-235B-A22B";
  }
  const slashIndex = text.indexOf("/");
  return slashIndex >= 0 ? text.slice(slashIndex + 1) || text : text;
}

function weatherApiUrl(start, apiKey) {
  const params = new URLSearchParams({
    key: apiKey,
    "location.latitude": String(start.lat),
    "location.longitude": String(start.lng),
    unitsSystem: "METRIC",
    languageCode: "en",
  });
  return `https://weather.googleapis.com/v1/currentConditions:lookup?${params.toString()}`;
}

const controls = {
  scenario: $("scenario"),
  startPoint: $("startPoint"),
  walkTolerance: $("walkTolerance"),
};

const preferenceWeights = {
  speed: 70,
  calm: 65,
  comfort: 75,
  budget: 45,
};

let latestRanked = [];
let recommendationDisplayLimit = 3;
let routeRequestId = 0;
let routeStatus = "Routes on demand";
let routeUpdatedAt = "Estimate";
let integrationStatus = {
  llm: "Checking",
  google: "Checking",
  tools: "Pending",
};
let startMap = null;
let startMarker = null;
let routeMap = null;
let routePolyline = null;
let routeMarkers = [];
let pendingRoutePreview = null;
let activeRoutePreview = null;
let googleMapsLoading = false;
let routesKeyConfigured = false;
let googleMapsBrowserKey = "";
let weatherRequestId = 0;
let weatherUpdatedForKey = "";
let weatherSummaryRequestId = 0;
let weatherSummaryUpdatedForKey = "";
let latestNavigationData = null;
let hasCollapsedHowItWorksAfterFirstAnswer = false;
const chatHistory = [];
let lastAnimatedChatMessageKey = "";
let startupWaitModalShown = false;
let startupWaitModalTimer = null;
// Base ms between render steps — lower for snappier updates
const STREAM_RENDER_BASE_DELAY_MS = 8;
// How many characters to render per step — increase to show more text at once
const STREAM_RENDER_CHUNK_SIZE = 8;
// Minimum loading duration gating (ms). Lower to reduce perceived wait time.
const MIN_LOADING_MS = 1500;
const GEOLOCATION_CACHE_KEY = "imperialNavigatorLastLocation";
let answerRenderSessionId = 0;
let loadingRenderSessionId = 0;

function normalise(value, min, max) {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

function distanceBetweenKm(origin, destination) {
  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) return 0;
  const earthRadiusKm = 6371;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const deltaLat = toRadians(destination.lat - origin.lat);
  const deltaLng = toRadians(destination.lng - origin.lng);
  const startLat = toRadians(origin.lat);
  const endLat = toRadians(destination.lat);
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function getRouteForStart(place, startKey) {
  return place.liveRoutes?.[startKey] || null;
}

function getStartPoint() {
  return startOffsets[controls.startPoint.value] || startOffsets.southKensington;
}

function getStartCacheKey() {
  const start = getStartPoint();
  if (controls.startPoint.value !== "mapSelection") return controls.startPoint.value;
  return `map:${start.lat.toFixed(5)},${start.lng.toFixed(5)}`;
}

function getPreferenceWeights(profile) {
  const raw = {
    speed: preferenceWeights.speed * profile.baseWeights.speed,
    calm: preferenceWeights.calm * profile.baseWeights.calm,
    comfort: preferenceWeights.comfort * profile.baseWeights.comfort,
    budget: preferenceWeights.budget * profile.baseWeights.budget,
  };
  const total = Object.values(raw).reduce((sum, value) => sum + value, 0);
  return Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, value / total]));
}

function scorePlace(place, context) {
  const profile = scenarioProfiles[context.scenario];
  const start = context.start;
  const zoneOffset = start[place.zone] ?? start.modifier;
  const fallbackDistance = distanceBetweenKm(start, place);
  const liveRoute = getRouteForStart(place, context.startCacheKey);
  const hasLiveRoute = Number.isFinite(liveRoute?.transitMinutes);
  const estimatedTransit = controls.startPoint.value === "mapSelection"
    ? Math.round(fallbackDistance * 8 + 5)
    : place.transitMinutes + zoneOffset;
  const baseTransit = hasLiveRoute ? liveRoute.transitMinutes : Math.max(3, estimatedTransit);
  const trafficImpact = 0;
  const adjustedTransit = Math.round(baseTransit + trafficImpact);
  const adjustedDistance = Number((Number.isFinite(liveRoute?.distanceKm) ? liveRoute.distanceKm : fallbackDistance).toFixed(2));
  const estimatedWalkMinutes = Math.max(1, Math.round((adjustedDistance / 5) * 60));
  const walkingPenalty = estimatedWalkMinutes > context.walkTolerance ? (estimatedWalkMinutes - context.walkTolerance) * 1.8 : 0;
  const rainPenalty = 0;
  const matchedTags = profile.wanted.filter((tag) => place.tags.includes(tag));
  const missingTags = profile.wanted.length - matchedTags.length;
  const matchScore = matchedTags.length * 12 - missingTags * 10;
  const weights = getPreferenceWeights(profile);

  const speedScore = 100 - normalise(adjustedTransit, 10, 62);
  const calmScore = place.tags.includes("quiet") ? 100 : 72;
  const comfortScore = place.comfort - rainPenalty - walkingPenalty + matchScore;
  const budgetScore = place.budget;

  const total =
    speedScore * weights.speed +
    calmScore * weights.calm +
    comfortScore * weights.comfort +
    budgetScore * weights.budget;

  return {
    ...place,
    adjustedTransit,
    adjustedDistance,
    estimatedWalkMinutes,
    hasLiveRoute,
    total: Math.round(Math.max(0, Math.min(100, total))),
    risk: getRisk(place, adjustedTransit, rainPenalty, walkingPenalty),
    decision: getDecision(place, context, adjustedTransit, rainPenalty),
  };
}

function getRisk(place, transit, rainPenalty, walkingPenalty) {
  if (rainPenalty > 10) return { label: "Weather risk", className: "warning" };
  if (transit > 48) return { label: "Long journey", className: "caution" };
  if (walkingPenalty > 0) return { label: "Over walk limit", className: "caution" };
  if (place.budget < 62) return { label: "Cost trade-off", className: "caution" };
  return { label: "Good fit", className: "ok" };
}

function getDecision(place, context, transit, rainPenalty) {
  if (rainPenalty > 10 && place.tags.includes("outdoor")) {
    return "Less ideal in wet weather.";
  }
  if (transit < 26 && place.comfort > 80) {
    return "Short trip, high comfort.";
  }
  if (transit < 20) {
    return "A solid match with short travel.";
  }
  return "A solid match nearby.";
}

function render() {
  updateOutputs();

  const context = getContext();

  $("weatherSignal").textContent = integrationStatus.llm;
  $("trafficSignal").textContent = integrationStatus.google;
  updateAgentModeSignal(integrationStatus.tools, false);
  maybeShowStartupWaitModal();

  latestRanked = places
    .map((place) => scorePlace(place, context))
    .sort((a, b) => b.total - a.total)
    .slice(0, recommendationDisplayLimit);

  $("recommendations").innerHTML = latestRanked.map(renderCard).join("");
  updateRecommendationLoadMoreButton();
}

function updateRecommendationLoadMoreButton() {
  const button = $("loadMoreStudySpaces");
  if (!button) return;
  if (recommendationDisplayLimit >= 6) {
    button.textContent = "Collapse study spaces";
    button.setAttribute("aria-expanded", "true");
    button.disabled = false;
    return;
  }
  button.textContent = "Load more study spaces";
  button.setAttribute("aria-expanded", "false");
  button.disabled = false;
}

function collapseHowItWorksAfterFirstAnswer() {
  if (hasCollapsedHowItWorksAfterFirstAnswer) return;
  const section = $("howItWorks");
  const button = $("expandHowItWorks");
  if (!section || !button) return;
  hasCollapsedHowItWorksAfterFirstAnswer = true;
  section.hidden = true;
  button.hidden = false;
  updateHowItWorksToggle();
}

function updateHowItWorksToggle() {
  const section = $("howItWorks");
  const button = $("expandHowItWorks");
  if (!section || !button) return;
  const isExpanded = !section.hidden;
  button.textContent = isExpanded ? "Collapse introductions to the agent" : "Expand introductions to the agent";
  button.setAttribute("aria-expanded", String(isExpanded));
}

function toggleHowItWorks() {
  const section = $("howItWorks");
  const button = $("expandHowItWorks");
  if (!section || !button) return;
  const shouldExpand = section.hidden;
  section.hidden = !shouldExpand;
  if (shouldExpand) {
    section.classList.remove("how-it-works--pop");
    void section.offsetWidth;
    section.classList.add("how-it-works--pop");
  } else {
    section.classList.remove("how-it-works--pop");
  }
  button.hidden = false;
  updateHowItWorksToggle();
}

function setGoogleMapsStatus(browserReady, routesReady) {
  routesKeyConfigured = routesReady;
  if (browserReady && routesReady) {
    integrationStatus.google = "Keys ready";
  } else {
    const browserStatus = browserReady ? "Browser key ready" : "Browser key missing";
    const routesStatus = routesReady ? "Routes key ready" : "Routes key missing";
    integrationStatus.google = `${browserStatus} · ${routesStatus}`;
  }
  $("trafficSignal").textContent = integrationStatus.google;
}

function formatTemperature(value) {
  const degrees = Number(value?.degrees);
  if (!Number.isFinite(degrees)) return "--";
  return `${Math.round(degrees)}°C`;
}

function formatWind(value) {
  const speed = Number(value?.speed?.value);
  if (!Number.isFinite(speed)) return "--";
  const unit = value?.speed?.unit === "KILOMETERS_PER_HOUR" ? "km/h" : "";
  return `${Math.round(speed)} ${unit}`.trim();
}

function formatPrecipitationProbability(data) {
  const percent = Number(
    data?.precipitation?.probability?.percent ??
    data?.precipitationProbability?.percent ??
    data?.precipitationProbability ??
    data?.probabilityOfPrecipitation?.percent ??
    data?.rainProbability?.percent
  );
  if (!Number.isFinite(percent)) return "--";
  return `${Math.round(percent)}%`;
}

function weatherIconEmoji(conditionType, isDaytime) {
  const type = String(conditionType || "").toUpperCase();
  if (type.includes("THUNDER")) return "⛈️";
  if (type.includes("RAIN") || type.includes("DRIZZLE")) return "🌧️";
  if (type.includes("SNOW") || type.includes("ICE")) return "🌨️";
  if (type.includes("FOG") || type.includes("HAZE") || type.includes("MIST")) return "🌫️";
  if (type.includes("CLOUD")) return "☁️";
  return isDaytime === false ? "🌙" : "☀️";
}

function weatherConditionLabel(conditionType, isDaytime) {
  const type = String(conditionType || "").toUpperCase();
  if (type.includes("THUNDER")) return "Stormy";
  if (type.includes("RAIN") || type.includes("DRIZZLE")) return "Rainy";
  if (type.includes("SNOW") || type.includes("ICE")) return "Snowy";
  if (type.includes("FOG") || type.includes("HAZE") || type.includes("MIST")) return "Foggy";
  if (type.includes("CLOUD")) return "Cloudy";
  return isDaytime === false ? "Night" : "Sunny";
}

function weatherConditionSummary(conditionType, isDaytime) {
  const type = String(conditionType || "").toUpperCase();
  if (type.includes("THUNDER")) return "Stormy conditions";
  if (type.includes("RAIN") || type.includes("DRIZZLE")) return "Rain expected";
  if (type.includes("SNOW") || type.includes("ICE")) return "Snowy conditions";
  if (type.includes("FOG") || type.includes("HAZE") || type.includes("MIST")) return "Low visibility";
  if (type.includes("CLOUD")) return "Cloud cover";
  return isDaytime === false ? "Night conditions" : "Sunny weather";
}

function formatWeatherDay(currentTime) {
  if (!currentTime) return "Today";
  try {
    return new Date(currentTime).toLocaleDateString([], { weekday: "long" });
  } catch (error) {
    return "Today";
  }
}

function setWeatherLoading(message = "Loading weather data...") {
  weatherSummaryRequestId += 1;
  [$("updateWeatherCurrentButton"), $("updateWeatherDestinationButton")].forEach((button) => {
    if (!button) return;
    button.disabled = true;
  });
  $("weatherTemperature").textContent = "Loading...";
  $("weatherDescription").textContent = message;
  $("weatherDescription").hidden = false;
  setWeatherSummary("Waiting for the LLM summary...");
  $("weatherMeta").textContent = "Fetching current conditions from Google Weather API.";
}

function setWeatherButtonReady() {
  const currentButton = $("updateWeatherCurrentButton");
  const destinationButton = $("updateWeatherDestinationButton");
  if (currentButton) {
    currentButton.disabled = false;
    currentButton.textContent = "Current location";
  }
  if (destinationButton) {
    destinationButton.disabled = false;
    destinationButton.textContent = "Destination";
  }
}

function setWeatherScope(scope = "start point", locationName = "") {
  const label = $("weatherScopeLabel");
  if (!label) return;
  const isDestination = scope === "destination";
  const isCurrentLocation = scope === "current location" || scope === "start point";
  const cleanLocationName = String(locationName || "").trim();
  label.textContent = isDestination && cleanLocationName
    ? `destination: ${cleanLocationName}`
    : (isDestination ? "destination" : (isCurrentLocation ? "current location" : "start point"));
  label.classList.toggle("destination", isDestination);
  $("updateWeatherCurrentButton")?.classList.toggle("is-active", isCurrentLocation);
  $("updateWeatherDestinationButton")?.classList.toggle("is-active", isDestination);
}

function captureWeatherState() {
  const ids = [
    "weatherDay",
    "weatherIcon",
    "weatherTemperature",
    "weatherDescription",
    "weatherFeelsLike",
    "weatherHumidity",
    "weatherWind",
    "weatherUv",
    "weatherPrecipitation",
    "weatherSummary",
    "weatherMeta",
    "weatherScopeLabel",
  ];
  return ids.reduce((state, id) => {
    const element = $(id);
    if (!element) return state;
    state[id] = {
      textContent: element.textContent,
      htmlContent: id === "weatherSummary" ? element.innerHTML : undefined,
      hidden: element.hidden,
      className: element.className,
    };
    return state;
  }, {});
}

function restoreWeatherState(state) {
  Object.entries(state || {}).forEach(([id, value]) => {
    const element = $(id);
    if (!element || !value) return;
    if (id === "weatherSummary" && value.htmlContent !== undefined) {
      element.innerHTML = value.htmlContent;
    } else {
      element.textContent = value.textContent;
    }
    element.hidden = value.hidden;
    element.className = value.className;
  });
}

function renderWeatherData(data, start) {
  setWeatherScope(start?.weatherScope === "destination" ? "destination" : "start point", start?.label);
  $("weatherDay").textContent = weatherConditionLabel(data?.weatherCondition?.type, data?.isDaytime);
  $("weatherIcon").textContent = weatherIconEmoji(data?.weatherCondition?.type, data?.isDaytime);
  $("weatherIcon").removeAttribute("title");
  $("weatherTemperature").textContent = formatTemperature(data?.temperature);
  $("weatherDescription").textContent = "";
  $("weatherDescription").hidden = true;
  $("weatherFeelsLike").textContent = formatTemperature(data?.feelsLikeTemperature);
  $("weatherHumidity").textContent = Number.isFinite(data?.relativeHumidity) ? `${data.relativeHumidity}%` : "--";
  $("weatherWind").textContent = formatWind(data?.wind);
  $("weatherUv").textContent = Number.isFinite(data?.uvIndex) ? String(data.uvIndex) : "--";
  $("weatherPrecipitation").textContent = formatPrecipitationProbability(data);
  const time = data?.currentTime ? new Date(data.currentTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "just now";
  $("weatherMeta").textContent = `${start.label || "Selected start point"} · ${start.lat.toFixed(4)}, ${start.lng.toFixed(4)} · Updated ${time}`;
  setWeatherSummary("Generating a short weather summary...");
  void refreshWeatherSummary(data, start);
}

function renderWeatherError(message) {
  weatherSummaryRequestId += 1;
  const fallbackSummary = buildWeatherFallbackSummary(null, null, message);
  $("weatherDay").textContent = "Today";
  $("weatherIcon").textContent = "--";
  $("weatherTemperature").textContent = "Weather unavailable";
  $("weatherDescription").textContent = message;
  $("weatherDescription").hidden = false;
  $("weatherFeelsLike").textContent = "--";
  $("weatherHumidity").textContent = "--";
  $("weatherWind").textContent = "--";
  $("weatherUv").textContent = "--";
  $("weatherPrecipitation").textContent = "--";
  setWeatherSummary(fallbackSummary);
  $("weatherMeta").textContent = "Check that Weather API is enabled for your Google Maps browser key.";
}

function buildWeatherFallbackSummary(data, start, errorMessage = "") {
  if (errorMessage) return "Weather details are currently unavailable, but the app will try again shortly.";
  const condition = String(data?.weatherCondition?.description?.text || "weather").toLowerCase();
  const temp = Number(data?.temperature?.degrees);
  const feelsLike = Number(data?.feelsLikeTemperature?.degrees);
  const windSpeed = Number(data?.wind?.speed?.value);
  const pieces = [];

  if (condition.includes("rain") || condition.includes("drizzle")) pieces.push("Wet conditions");
  else if (condition.includes("cloud")) pieces.push("Cloudy skies");
  else if (condition.includes("sun") || condition.includes("clear")) pieces.push("Bright weather");
  else if (condition.includes("snow")) pieces.push("Cold, wintry weather");
  else if (condition.includes("fog") || condition.includes("mist") || condition.includes("haze")) pieces.push("Low visibility");
  else pieces.push("Current conditions");

  if (Number.isFinite(temp)) pieces.push(`around ${Math.round(temp)}°C`);
  if (Number.isFinite(feelsLike) && Math.abs(feelsLike - temp) >= 2) pieces.push(`feels like ${Math.round(feelsLike)}°C`);
  if (Number.isFinite(windSpeed)) pieces.push(`with a ${Math.round(windSpeed)} km/h breeze`);

  const location = start?.label ? ` near ${start.label}` : "";
  return `${pieces.join(", ")}${location}.`;
}

function normalizeWeatherSummary(value) {
  const clean = sanitizeModelOutput(value).replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const sentences = clean.match(/[^.!?。！？]+[.!?。！？]?/g) || [];
  if (sentences.length <= 2) return clean;
  return sentences.slice(0, 2).join(" ").trim();
}

function renderWeatherSummaryMarkdown(value) {
  const text = normalizeWeatherSummary(value);
  if (!text) return "";
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function isUsableWeatherSummary(value) {
  const text = normalizeWeatherSummary(value);
  if (!text) return false;
  const lower = text.toLowerCase();
  return ![
    "模型没有返回文本结果",
    "本地模型返回为空",
    "model did not return",
    "empty response",
  ].some((phrase) => lower.includes(phrase));
}

function setWeatherSummary(value) {
  $("weatherSummary").innerHTML = renderWeatherSummaryMarkdown(value);
}

function compactWeatherContext(data, start) {
  return {
    location: start?.label || "Selected location",
    scope: start?.weatherScope || "start point",
    coordinates: start?.lat && start?.lng ? {
      lat: Number(start.lat.toFixed(5)),
      lng: Number(start.lng.toFixed(5)),
    } : null,
    currentTime: data?.currentTime || null,
    condition: data?.weatherCondition?.description?.text || data?.weatherCondition?.type || null,
    conditionType: data?.weatherCondition?.type || null,
    isDaytime: data?.isDaytime,
    temperatureC: data?.temperature?.degrees ?? null,
    feelsLikeC: data?.feelsLikeTemperature?.degrees ?? null,
    humidityPercent: data?.relativeHumidity ?? null,
    wind: data?.wind || null,
    uvIndex: data?.uvIndex ?? null,
    precipitation: data?.precipitation || null,
    precipitationProbability: formatPrecipitationProbability(data),
  };
}

async function refreshWeatherSummary(data, start) {
  const summaryKey = `${start?.lat?.toFixed?.(5) || ""},${start?.lng?.toFixed?.(5) || ""}:${data?.currentTime || ""}:${data?.weatherCondition?.description?.text || ""}`;
  if (summaryKey === weatherSummaryUpdatedForKey) return;
  weatherSummaryUpdatedForKey = summaryKey;
  const requestId = ++weatherSummaryRequestId;
  const fallbackSummary = buildWeatherFallbackSummary(data, start);

  try {
    const response = await apiFetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stream: false,
        question: "Write a short, natural weather summary for the weather card.",
        context: {
          task: "weather_summary",
          weather: compactWeatherContext(data, start),
        },
        history: [],
        ranked: [],
      }),
    });
    if (!response.ok) throw new Error("Weather summary request failed");
    const result = await response.json();
    if (requestId !== weatherSummaryRequestId) return;
    const summary = normalizeWeatherSummary(result?.answer || "");
    setWeatherSummary(isUsableWeatherSummary(summary) ? summary : fallbackSummary);
  } catch (error) {
    if (requestId === weatherSummaryRequestId) {
      setWeatherSummary(fallbackSummary);
    }
  }
}

async function refreshWeatherForStart(start = getStartPoint(), force = false, options = {}) {
  if (!start?.lat || !start?.lng) return;
  const weatherKey = `${start.lat.toFixed(5)},${start.lng.toFixed(5)}`;
  if (!force && weatherUpdatedForKey === weatherKey) return;
  if (!googleMapsBrowserKey) {
    if (options.throwOnError) throw new Error("Google Maps browser key is not available yet.");
    renderWeatherError("Google Maps browser key is not available yet.");
    return;
  }

  const requestId = ++weatherRequestId;
  const previousState = options.preserveOnError ? captureWeatherState() : null;
  weatherUpdatedForKey = weatherKey;
  setWeatherLoading(`Checking weather near ${start.label || "your selected start point"}...`);
  try {
    const response = await fetch(weatherApiUrl(start, googleMapsBrowserKey));
    const data = await response.json();
    if (requestId !== weatherRequestId) return;
    if (!response.ok) {
      throw new Error(data?.error?.message || "Weather API request failed");
    }
    renderWeatherData(data, start);
  } catch (error) {
    if (requestId !== weatherRequestId) return;
    weatherUpdatedForKey = "";
    if (previousState) {
      restoreWeatherState(previousState);
    } else {
      renderWeatherError(error.message || "Weather API request failed.");
    }
    if (options.throwOnError) throw error;
  } finally {
    if (requestId === weatherRequestId) setWeatherButtonReady();
  }
}

function isStartupCheckingState() {
  return integrationStatus.llm === "Checking" && integrationStatus.google === "Checking";
}

function maybeShowStartupWaitModal() {
  if (!isStartupCheckingState()) {
    if (startupWaitModalTimer) {
      window.clearTimeout(startupWaitModalTimer);
      startupWaitModalTimer = null;
    }
    if (startupWaitModalEl && !startupWaitModalEl.hidden) hideStartupWaitModal();
    return;
  }
  if (startupWaitModalShown) return;
  if (startupWaitModalTimer) return;
  startupWaitModalTimer = window.setTimeout(() => {
    startupWaitModalTimer = null;
    if (!isStartupCheckingState() || startupWaitModalShown) return;
    startupWaitModalShown = true;
    showStartupWaitModal();
  }, 1000);
}

function getContext() {
  const start = getStartPoint();
  return {
    scenario: controls.scenario.value,
    startPoint: controls.startPoint.value,
    start,
    startCacheKey: getStartCacheKey(),
    walkTolerance: Number(controls.walkTolerance.value),
  };
}

function renderCard(place, index) {
  const hiddenTags = new Set(["medicine", "wifi", "indoor", "study-space", "group"]);
  const lowPriorityTags = new Set(["quiet", "science", "services"]);
  const visibleTags = place.tags
    .filter((tag) => !hiddenTags.has(tag))
    .sort((first, second) => Number(lowPriorityTags.has(first)) - Number(lowPriorityTags.has(second)))
    .slice(0, 2);
  const badges = visibleTags
    .map((tag) => `<span class="tag">${tagLabel(tag)}</span>`)
    .concat(`<span class="tag ${place.risk.className}">${place.risk.label}</span>`)
    .slice(0, 3)
    .join("");
  const websiteAttributes = place.website
    ? ` data-website="${escapeHtml(place.website)}" role="link" tabindex="0" aria-label="Open ${escapeHtml(place.name)} official website"`
    : "";
  return `
    <article class="place-card"${websiteAttributes}>
      <div class="place-image" style="background-image: url('${place.image}')"></div>
      <div class="place-body">
        <div class="place-heading">
          <span class="rank">${index + 1}</span>
          <h3>${place.name}</h3>
        </div>
        <p class="decision"><span class="score-badge">${place.total}</span>${place.decision}</p>
        <div class="tags">${badges}</div>
        <div class="metrics">
          <div class="metric"><span>Distance</span><strong>${place.adjustedDistance} km</strong></div>
          <div class="metric"><span>Walk est.</span><strong>${place.estimatedWalkMinutes} min</strong></div>
        </div>
      </div>
    </article>
  `;
}

function tagLabel(tag) {
  const labels = {
    quiet: "Quiet",
    wifi: "Wi-Fi",
    indoor: "Indoor",
    view: "View",
    "low-cost": "Free access",
    "24h": "24 hours",
    science: "STEM resources",
    central: "Main library",
    campus: "Imperial",
    "study-space": "Study space",
    group: "Group study",
    services: "Services",
    food: "Food nearby",
    transit: "Transit access",
    outdoor: "Outdoor",
    green: "Green setting",
    calm: "Calm",
  };
  return labels[tag] ?? tag;
}

function openPlaceWebsiteFromCard(card) {
  const website = card?.dataset?.website;
  if (!website) return;
  showExternalConfirm(website);
}

function updateOutputs() {
  $("walkOutput").textContent = `${controls.walkTolerance.value} min`;
}

async function answerQuestion(question, options = {}) {
  const cleaned = question.trim();
  if (!cleaned) {
    $("agentAnswer").textContent = "Ask something like: from South Kensington to Hammersmith Campus by transit.";
    return;
  }

  setAgentMode("Pending");
  renderLoadingAnswer("Understanding your request");
  const minLoadingReadyAt = Date.now() + MIN_LOADING_MS;
  setAsking(true);
  const loadingSessionId = renderLoadingAnswer("Generating results");
  const slowToolMessageTimer = window.setTimeout(() => {
    updateLoadingAnswer(loadingSessionId, "Tools are being used, it may take a while.");
  }, 8000);

  clearRoutePreview();
  applyQuestionIntent(cleaned);
  if (shouldUseRoutesForStudyQuestion(cleaned) || controls.scenario.value === "nearest") {
    await refreshRoutes();
  }
  render();

  const context = getContext();

  try {
    const response = await apiFetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stream: true,
        question: cleaned,
        contextStart: currentStartContext(),
        context: buildAgentContext(context),
        ranked: latestRanked.slice(0, 2).map(toModelPlace),
        history: chatHistory.slice(-6),
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Model request failed");
    }

    if (!options.skipUserPush) {
      chatHistory.push({ role: "user", content: cleaned });
      renderChatModalHistory();
    }
    await waitForMinimumLoading(minLoadingReadyAt);
    const contentType = response.headers.get("Content-Type") || "";
    const agentResult = contentType.includes("application/x-ndjson")
      ? await readStreamingAnswer(response)
      : await readJsonAnswer(response);
    const answer = sanitizeModelOutput(agentResult.answer || "");
    setAgentMode(formatAgentTools(agentResult.toolsUsed || []));

    chatHistory.push({ role: "assistant", content: answer });
    trimChatHistory();
    if (hasNavigationResult(agentResult)) {
      latestNavigationData = { ...agentResult, answer };
      renderRoutePreview(latestNavigationData);
      renderAgentActions(latestNavigationData, latestNavigationData.recommended);
    } else {
      latestNavigationData = null;
      clearRoutePreview();
      renderAgentActions();
    }
    renderChatModalHistory();
    collapseHowItWorksAfterFirstAnswer();
  } catch (error) {
    await waitForMinimumLoading(minLoadingReadyAt);
    cancelAnswerRender();
    hideAgentActions();
    const errorMessage = "Looks like the AI quota hit rush hour. Please try again in a minute, or send a shorter question.";
    const errorHtml = `
      <strong>${escapeHtml(errorMessage)}</strong>
      <br />Current API endpoint: <code>${escapeHtml(apiBaseLabel())}</code>
    `;
    $("agentAnswer").innerHTML = errorHtml;
    if (options.skipUserPush) {
      chatHistory.push({ role: "assistant", content: errorMessage });
      trimChatHistory();
      renderChatModalHistory();
    }
  } finally {
    window.clearTimeout(slowToolMessageTimer);
    setAsking(false);
  }
}

function currentStartContext() {
  const start = getStartPoint();
  return {
    name: start.label,
    lat: start.lat,
    lng: start.lng,
    source: controls.startPoint.value === "mapSelection" ? "map" : "campus",
  };
}

function shouldUseRoutesForStudyQuestion(question) {
  const text = question.toLowerCase();
  return (
    text.includes("nearest") ||
    text.includes("closest") ||
    text.includes("fastest") ||
    text.includes("travel time") ||
    text.includes("how long") ||
    text.includes("commute") ||
    text.includes("nearby") ||
    question.includes("最近") ||
    question.includes("最快") ||
    question.includes("多远") ||
    question.includes("多久") ||
    question.includes("通勤")
  );
}

async function readJsonAnswer(response) {
  const data = await response.json();
  console.debug("[agent] raw JSON answer:", data.answer);
  await renderAnswerWithPacing(data.answer || "");
  const answer = sanitizeModelOutput(data.answer || "");
  return { ...data, answer };
}

async function readStreamingAnswer(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";
  let finalResult = {};
  const toolsUsed = [];
  const streamState = beginAnswerRender();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line);
      if (event.error) throw new Error(event.error);
      if (event.tool) {
        if (!toolsUsed.includes(event.tool)) toolsUsed.push(event.tool);
        setAgentMode(formatAgentTools(toolsUsed));
      }
      if (event.delta) {
        answer += event.delta;
        enqueueAnswerRender(streamState, event.delta);
      }
      if (event.done) {
        finalResult = event.result || {};
        const finalTools = event.toolsUsed || finalResult.toolsUsed || [];
        finalTools.forEach((tool) => {
          if (!toolsUsed.includes(tool)) toolsUsed.push(tool);
        });
      }
    }
  }

  closeAnswerRender(streamState);
  await waitForAnswerRender(streamState);

  console.debug("[agent] raw streaming answer:", answer);

  return {
    ...finalResult,
    answer: answer.trim(),
    toolsUsed: finalResult.toolsUsed || toolsUsed,
  };
}

function beginAnswerRender() {
  cancelAnswerRender();
  const state = {
    sessionId: ++answerRenderSessionId,
    queue: "",
    rendered: "",
    completed: false,
    timer: null,
    resolve: null,
  };
  state.finished = new Promise((resolve) => {
    state.resolve = resolve;
  });
  return state;
}

function enqueueAnswerRender(state, delta) {
  if (!state || state.sessionId !== answerRenderSessionId || !delta) return;
  state.queue += delta;
  if (!state.timer) {
    scheduleAnswerRenderStep(state, STREAM_RENDER_BASE_DELAY_MS);
  }
}

function closeAnswerRender(state) {
  if (!state || state.sessionId !== answerRenderSessionId) return;
  state.completed = true;
  if (!state.timer && !state.queue) {
    state.resolve();
  }
}

function waitForAnswerRender(state) {
  if (!state || state.sessionId !== answerRenderSessionId) return Promise.resolve();
  return state.finished;
}

function scheduleAnswerRenderStep(state, delayMs) {
  state.timer = window.setTimeout(() => {
    state.timer = null;
    stepAnswerRender(state);
  }, delayMs);
}

function stepAnswerRender(state) {
  if (!state || state.sessionId !== answerRenderSessionId) return;

  if (!state.queue) {
    if (state.completed) {
      state.resolve();
      return;
    }
    scheduleAnswerRenderStep(state, STREAM_RENDER_BASE_DELAY_MS);
    return;
  }

  const chunk = state.queue.slice(0, STREAM_RENDER_CHUNK_SIZE);
  state.queue = state.queue.slice(chunk.length);
  state.rendered += chunk;
  $("agentAnswer").innerHTML = state.rendered ? renderMarkdown(state.rendered) : "";

  const punctuationDelay = /[。！？!?\n]$/.test(chunk) ? 72 : 0;
  scheduleAnswerRenderStep(state, STREAM_RENDER_BASE_DELAY_MS + punctuationDelay);
}

function cancelAnswerRender() {
  answerRenderSessionId += 1;
}

async function waitForMinimumLoading(minLoadingReadyAt) {
  const waitMs = Number(minLoadingReadyAt) - Date.now();
  if (waitMs > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, waitMs));
  }
}

async function renderAnswerWithPacing(answer) {
  const clean = sanitizeModelOutput(answer);
  if (!clean) {
    renderLoadingAnswer("Generating answer");
    return;
  }
  const state = beginAnswerRender();
  // Pass the raw model answer (not the sanitized 'clean') so we preserve
  // original blank lines and spacing produced by the model while rendering.
  enqueueAnswerRender(state, answer);
  closeAnswerRender(state);
  await waitForAnswerRender(state);
}

function renderLoadingAnswer(message) {
  cancelAnswerRender();
  clearRoutePreview();
  hideAgentActions();
  const loadingSessionId = ++loadingRenderSessionId;
  $("agentAnswer").innerHTML = `
    <div class="thinking-panel" role="status" aria-live="polite" data-loading-session="${loadingSessionId}">
      <div class="thinking-header">
        <span class="thinking-orbit" aria-hidden="true"></span>
        <strong class="thinking-message">${escapeHtml(message)}</strong>
        <span class="thinking-dots" aria-hidden="true"><span></span><span></span><span></span></span>
      </div>
      <div class="thinking-bar" aria-hidden="true"><span></span></div>
    </div>
  `;
  return loadingSessionId;
}

function updateLoadingAnswer(loadingSessionId, message) {
  const panel = $("agentAnswer")?.querySelector(".thinking-panel");
  if (!panel || panel.dataset.loadingSession !== String(loadingSessionId)) return false;
  const label = panel.querySelector(".thinking-message");
  if (!label) return false;
  label.textContent = message;
  return true;
}

function renderMarkdown(value) {
  const text = sanitizeModelOutput(value).replace(/\r\n/g, "\n");
  if (!text) return "";

  const lines = text.split("\n");
  const output = [];
  let paragraphLines = [];
  let listItems = [];
  let pendingBlankLineRuns = 0;

  const renderInlineMarkdown = (input) =>
    escapeHtml(String(input || ""))
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  const isSeparatorLine = (line) => /^[-*_]{3,}$/.test(line) || /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/.test(line);
  const isTableLine = (line) => line.includes("|") && !/^[\s|:-]+$/.test(line);
  const parseTableRow = (line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  const isValidTableSeparator = (line) => /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/.test(line);
  const isBlankLine = (line) => !line.trim() || /^\s*(?:&nbsp;|&#160;|\u00a0)\s*$/i.test(line);

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    const paragraph = paragraphLines.map((line) => renderInlineMarkdown(line.trim())).join("<br />");
    output.push(`<p>${paragraph}</p>`);
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    output.push(`<ul>${listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  const flushBlocks = () => {
    flushParagraph();
    flushList();
  };

  const flushBlankLineRuns = () => {
    pendingBlankLineRuns = 0;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trim();
    if (isBlankLine(rawLine)) {
      flushBlocks();
      pendingBlankLineRuns += 1;
      continue;
    }

    flushBlankLineRuns();

    if (/^#{1,6}\s+/.test(line)) {
      flushBlocks();
      output.push(`<h4>${renderInlineMarkdown(line.replace(/^#{1,6}\s+/, ""))}</h4>`);
      continue;
    }

    if (isSeparatorLine(line)) {
      flushBlocks();
      continue;
    }

    if (isTableLine(line)) {
      flushBlocks();
      const tableRows = [];
      while (index < lines.length) {
        const current = lines[index].trim();
        if (!current) break;
        if (isValidTableSeparator(current)) {
          index += 1;
          continue;
        }
        if (!isTableLine(current)) break;
        tableRows.push(parseTableRow(current));
        index += 1;
      }
      index -= 1;
      const columnCount = tableRows[0]?.length || 0;
      const hasConsistentColumns = columnCount >= 2 && tableRows.every((row) => row.length === columnCount);
      if (tableRows.length < 2 || !hasConsistentColumns) {
        paragraphLines.push(line);
        continue;
      }

      const header = tableRows[0];
      const bodyRows = tableRows.slice(1);
      const headerHtml = header
        ? `<thead><tr>${header.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join("")}</tr></thead>`
        : "";
      const bodyHtml = bodyRows.length
        ? `<tbody>${bodyRows.map((row) => `<tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`
        : "";
      output.push(`
        <div class="model-output-table-wrap">
          <table class="model-output-table">${headerHtml}${bodyHtml}</table>
        </div>
      `.replace(/\s+\n/g, "").replace(/\n\s+/g, ""));
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushBlocks();
      output.push(`<blockquote>${renderInlineMarkdown(line.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      listItems.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushBlocks();
  flushBlankLineRuns();
  return output.join("");
}

function renderChatMessageContent(role, content) {
  const text = String(content || "").replace(/\r\n/g, "\n").trim();
  if (!text) return "";
  if (role === "user") {
    return escapeHtml(text).replace(/\n+/g, "<br />");
  }
  return renderMarkdown(text);
}

function sanitizeModelOutput(value) {
  return String(value || "")
    .replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, "")
    .replace(/<think\b[^>]*>[\s\S]*$/gi, "")
    .replace(/^[\s\S]*?<\/think>/gi, "")
    .replace(/^\s*(reasoning|thinking|thought process|analysis|scratchpad|chain of thought|思考过程|推理过程|思路|分析)\s*[:：][\s\S]*?(?:\n\s*\n|(?=final answer\s*[:：])|(?=最终答案\s*[:：])|$)/i, "")
    .replace(/^\s*(final answer|最终答案)\s*[:：]\s*/i, "")
    .trim();
}

function trimChatHistory() {
  if (chatHistory.length > 6) {
    chatHistory.splice(0, chatHistory.length - 6);
  }
}

function applyQuestionIntent(question) {
  const text = question.toLowerCase();
  const intentRules = [
    { value: "late", words: ["tonight", "night", "late", "24h", "24 hours", "evening"] },
    { value: "medicine", words: ["medical", "medicine", "hospital", "clinical", "nhs"] },
    { value: "group", words: ["group", "discussion", "collaborate", "team"] },
    { value: "focus", words: ["nearest", "nearby", "closest", "quick", "seat"] },
    { value: "focus", words: ["study", "quiet", "focus", "revise", "revision", "write"] },
  ];
  const matched = intentRules.find((rule) => rule.words.some((word) => text.includes(word)));
  if (matched) controls.scenario.value = matched.value;
}

function buildAgentContext(context) {
  return {
    scenario: scenarioProfiles[context.scenario].label,
    startPoint: context.start.label,
    startCoordinates: {
      lat: Number(context.start.lat.toFixed(6)),
      lng: Number(context.start.lng.toFixed(6)),
    },
    walkTolerance: `${context.walkTolerance} min`,
    preferences: {
      speed: preferenceWeights.speed,
      calm: preferenceWeights.calm,
      comfort: preferenceWeights.comfort,
      budget: preferenceWeights.budget,
    },
    routeStatus,
    routeUpdatedAt,
    dataNote: "Library names come from Imperial College London Library Services' Our libraries page. Travel time and distance use Google Routes API when available; comfort is a prototype estimate.",
  };
}

function toModelPlace(place) {
  return {
    name: place.name,
    type: place.type,
    lat: place.lat,
    lng: place.lng,
    score: place.total,
    decision: place.decision,
    risk: place.risk.label,
    transitMinutes: place.adjustedTransit,
    distanceKm: place.adjustedDistance,
    routeSource: place.hasLiveRoute ? "Google Routes API" : "prototype estimate",
    comfort: place.comfort,
    budget: place.budget,
    tags: place.tags.map(tagLabel),
  };
}

function setAsking(isAsking) {
  $("askButton").disabled = isAsking;
  $("askButton").textContent = isAsking ? "Thinking" : "Ask";
}

function setAgentMode(mode) {
  integrationStatus.tools = mode;
  updateAgentModeSignal(mode);
  render();
}

function formatAgentTools(tools = []) {
  const labels = {
    navigate: "Navigation",
    route_matrix: "Google Routes",
    weather_current: "Weather",
  };
  const normalized = [...new Set((tools || []).filter(Boolean))];
  if (!normalized.length) return "Pending";
  return normalized.map((tool) => labels[tool] || tool).join(" + ");
}

function hasNavigationResult(result) {
  return Boolean(result?.recommended || result?.mapRoute || result?.navigation?.recommended || result?.navigation?.mapRoute);
}

function updateAgentModeSignal(mode, animate = true) {
  const signal = $("airSignal");
  if (!signal) return;
  const changed = signal.textContent !== mode;
  signal.textContent = mode;
  signal.dataset.mode = mode.toLowerCase().replace(/\s+/g, "-");
  if (!animate || !changed) return;
  signal.classList.remove("mode-changed");
  void signal.offsetWidth;
  signal.classList.add("mode-changed");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return entities[char];
  });
}

function loadGoogleStartMap(apiKey) {
  if (startMap || googleMapsLoading) return;
  googleMapsLoading = true;
  window.initStartPickerMap = initStartPickerMap;

  const script = document.createElement("script");
  const params = new URLSearchParams({
    key: apiKey,
    callback: "initStartPickerMap",
    loading: "async",
    auth_referrer_policy: "origin",
  });
  script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    googleMapsLoading = false;
    $("startMapStatus").textContent = "Google Maps did not load; check the browser key referrer restrictions, Maps JavaScript API activation, and billing settings.";
  };
  document.head.appendChild(script);
}

function initStartPickerMap() {
  const mapElement = $("startMap");
  const initial = getStartPoint();
  const position = { lat: initial.lat, lng: initial.lng };

  startMap = new google.maps.Map(mapElement, {
    center: position,
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });

  startMarker = new google.maps.Marker({
    map: startMap,
    position,
    draggable: true,
    title: "Starting point",
  });

  startMap.addListener("click", (event) => {
    setMapStartPoint(event.latLng);
  });

  startMarker.addListener("dragend", (event) => {
    setMapStartPoint(event.latLng);
  });

  updateStartMapStatus();
  setGoogleMapsStatus(true, routesKeyConfigured);
  if (pendingRoutePreview) renderRoutePreview(pendingRoutePreview);
}

function renderRoutePreview(data) {
  const routes = routeOptionsForPreview(data);
  const recommended = routes.find((route) => route.mode === data?.recommended?.mode) || routes[0];
  activeRoutePreview = data;
  renderRouteModeOptions(routes, recommended?.mode);
  drawRoutePreview(data, recommended);
}

function routeOptionsForPreview(data) {
  return [data?.recommended, ...(data?.alternatives || [])].filter((route) => route?.polyline);
}

function renderRouteModeOptions(routes, selectedMode) {
  const select = $("routeModeSelect");
  select.innerHTML = routes
    .map((route) => {
      const distance = Number.isFinite(route.distanceKm) ? `, ${route.distanceKm} km` : "";
      const label = `${route.modeLabel || route.mode} · ${route.durationMinutes} min${distance}`;
      return `<option value="${route.mode}" ${route.mode === selectedMode ? "selected" : ""}>${escapeHtml(label)}</option>`;
    })
    .join("");
  $("routeUpdateButton").disabled = routes.length < 2;
}

function drawSelectedRoutePreview() {
  if (!activeRoutePreview) return;
  const routes = routeOptionsForPreview(activeRoutePreview);
  const selectedMode = $("routeModeSelect").value;
  const route = routes.find((item) => item.mode === selectedMode) || routes[0];
  drawRoutePreview(activeRoutePreview, route);
  updateGoogleMapsLink(activeRoutePreview, route);
}

function drawRoutePreview(data, recommended) {
  const encodedPolyline = recommended?.polyline;
  if (!encodedPolyline) {
    clearRoutePreview();
    return;
  }

  const path = decodePolyline(encodedPolyline);
  if (!path.length) {
    clearRoutePreview();
    return;
  }

  pendingRoutePreview = data;
  const preview = $("routePreview");
  preview.hidden = false;
  preview.classList.remove("route-preview--pop");
  void preview.offsetWidth;
  preview.classList.add("route-preview--pop");
  $("routePreviewTitle").textContent = `Route map: ${recommended.modeLabel || recommended.mode || "route"}`;
  const distance = Number.isFinite(recommended.distanceKm) ? `, ${recommended.distanceKm} km` : "";
  $("routePreviewMeta").textContent = `${recommended.durationMinutes} min${distance}`;
  $("routeOriginLabel").textContent = data.origin || "Origin";
  $("routeDestinationLabel").textContent = data.destination || "Destination";
  updateGoogleMapsLink(data, recommended);

  if (!window.google?.maps) return;

  const mapElement = $("routeMap");
  mapElement.style.minHeight = "360px";
  mapElement.style.height = "360px";
  if (!routeMap) {
    routeMap = new google.maps.Map(mapElement, {
      center: path[0],
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
  }

  if (routePolyline) routePolyline.setMap(null);
  routeMarkers.forEach((marker) => marker.setMap(null));
  routeMarkers = [];

  routePolyline = new google.maps.Polyline({
    path,
    geodesic: true,
    strokeColor: "#2767a8",
    strokeOpacity: 0.95,
    strokeWeight: 5,
    map: routeMap,
  });

  routeMarkers = [
    new google.maps.Marker({ map: routeMap, position: path[0], label: "A", title: data.origin || "Origin" }),
    new google.maps.Marker({ map: routeMap, position: path[path.length - 1], label: "B", title: data.destination || "Destination" }),
  ];

  const bounds = new google.maps.LatLngBounds();
  path.forEach((point) => bounds.extend(point));
  routeMap.fitBounds(bounds, 32);
}

function clearRoutePreview() {
  pendingRoutePreview = null;
  activeRoutePreview = null;
  const preview = $("routePreview");
  if (preview) {
    preview.classList.remove("route-preview--pop");
    preview.hidden = true;
  }
  if (routePolyline) {
    routePolyline.setMap(null);
    routePolyline = null;
  }
  routeMarkers.forEach((marker) => marker.setMap(null));
  routeMarkers = [];
}

function renderAgentActions(data = null, route = data?.recommended) {
  const actions = $("agentActions");
  const googleLink = $("googleMapsLink");
  actions.hidden = false;
  const hasRoute = Boolean(data?.origin && data?.destination);
  googleLink.hidden = !hasRoute;
  if (hasRoute) updateGoogleMapsLink(data, route);
}

function hideAgentActions() {
  $("agentActions").hidden = true;
}

function updateGoogleMapsLink(data = latestNavigationData, route = data?.recommended) {
  const link = $("googleMapsLink");
  if (!data?.origin || !data?.destination) {
    link.hidden = true;
    return;
  }

  link.hidden = false;
  const params = new URLSearchParams({
    api: "1",
    origin: data.origin,
    destination: data.destination,
    travelmode: googleMapsTravelMode(route?.mode),
  });
  link.href = `https://www.google.com/maps/dir/?${params.toString()}`;
}

function googleMapsTravelMode(mode) {
  const modes = {
    TRANSIT: "transit",
    WALK: "walking",
    BICYCLE: "bicycling",
    DRIVE: "driving",
  };
  return modes[mode] || "transit";
}

function openChatModal() {
  const modal = $("chatModal");
  modal.hidden = false;
  // trigger animation
  void modal.offsetWidth;
  modal.classList.remove("closing");
  modal.classList.add("visible");
  renderChatModalHistory();
  $("modalUserQuestion").focus();
}

function closeChatModal() {
  const modal = $("chatModal");
  if (modal.hidden) return;
  modal.classList.remove("visible");
  modal.classList.add("closing");
  modal.addEventListener("animationend", function handler() {
    modal.hidden = true;
    modal.classList.remove("closing");
    modal.removeEventListener("animationend", handler);
  });
}

function shouldShowRouteMapButton(item, index) {
  return (
    item.role === "assistant" &&
    index === chatHistory.length - 1 &&
    Boolean(latestNavigationData?.origin && latestNavigationData?.destination) &&
    !$("routePreview").hidden
  );
}

function routeMapButtonHtml() {
  return `<button class="chat-route-map-button" type="button" data-chat-route-map="true">Close to view route map</button>`;
}

function renderChatModalHistory(isLoading = false) {
  const history = $("chatModalHistory");
  if (!history) return;
  if (!chatHistory.length) {
    lastAnimatedChatMessageKey = "";
    history.innerHTML = `<div class="chat-message assistant">No conversation yet. Ask the agent something to start.<span class="chat-bubble-tail" aria-hidden="true"></span></div>`;
    return;
  }

  const lastIndex = chatHistory.length - 1;
  let nextAnimatedMessageKey = "";
  const messages = chatHistory
    .map((item, index) => {
      const role = item.role === "user" ? "user" : "assistant";
      const messageKey = `${index}:${role}:${item.content}`;
      const shouldPop = index === lastIndex && messageKey !== lastAnimatedChatMessageKey;
      if (shouldPop) nextAnimatedMessageKey = messageKey;
      const popClass = shouldPop ? " chat-message--pop" : "";
      const routeMapButton = shouldShowRouteMapButton(item, index) ? routeMapButtonHtml() : "";
      return `<div class="chat-message ${role}${popClass}">${renderChatMessageContent(role, item.content)}${routeMapButton}<span class="chat-bubble-tail" aria-hidden="true"></span></div>`;
    })
    .join("");
  const loading = isLoading
    ? `<div class="chat-message assistant typing"><span></span><span></span><span></span></div>`
    : "";
  history.innerHTML = messages + loading;
  if (nextAnimatedMessageKey) lastAnimatedChatMessageKey = nextAnimatedMessageKey;
  history.scrollTop = history.scrollHeight;
}

function showRouteMapFromChat() {
  closeChatModal();
  window.setTimeout(() => {
    $("routePreview")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 220);
}

function decodePolyline(encoded) {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates = [];

  while (index < encoded.length) {
    const latResult = decodePolylineValue(encoded, index);
    lat += latResult.delta;
    index = latResult.nextIndex;

    const lngResult = decodePolylineValue(encoded, index);
    lng += lngResult.delta;
    index = lngResult.nextIndex;

    coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return coordinates;
}

function decodePolylineValue(encoded, startIndex) {
  let result = 0;
  let shift = 0;
  let index = startIndex;
  let byte;

  do {
    byte = encoded.charCodeAt(index) - 63;
    index += 1;
    result |= (byte & 0x1f) << shift;
    shift += 5;
  } while (byte >= 0x20 && index < encoded.length);

  const delta = result & 1 ? ~(result >> 1) : result >> 1;
  return { delta, nextIndex: index };
}

function setMapStartPoint(latLng) {
  setMapStartCoordinates(latLng.lat(), latLng.lng());
}

function setMapStartCoordinates(lat, lng, statusMessage = "") {
  startOffsets.mapSelection = {
    label: "Map selection",
    lat,
    lng,
    modifier: 0,
  };
  controls.startPoint.value = "mapSelection";
  if (startMarker) startMarker.setPosition({ lat, lng });
  if (startMap) startMap.panTo({ lat, lng });
  updateStartMapStatus(statusMessage);
  render();
  void refreshWeatherForStart(getStartPoint(), true);
  if (controls.scenario.value === "nearest") refreshRoutes();
}

function selectCampusStart(key) {
  const campus = startOffsets[key];
  if (!campus) return;
  if (startMarker) startMarker.setPosition({ lat: campus.lat, lng: campus.lng });
  if (startMap) {
    startMap.panTo({ lat: campus.lat, lng: campus.lng });
    startMap.setZoom(13);
  }
  updateStartMapStatus();
  render();
  void refreshWeatherForStart(getStartPoint(), true);
  if (controls.scenario.value === "nearest") refreshRoutes();
}

function updateStartMapStatus(statusMessage = "") {
  const start = getStartPoint();
  const label = controls.startPoint.value === "mapSelection"
    ? `Map point ${start.lat.toFixed(5)}, ${start.lng.toFixed(5)}`
    : `${start.label} selected`;
  const guidance = statusMessage || "Click the map, drag the marker, or use your current location.";
  $("startMapStatus").textContent = `${label}. ${guidance}`;
}

function geolocationErrorMessage(error) {
  if (!window.isSecureContext) {
    return "Location requires HTTPS or localhost.";
  }
  if (!error) return "Could not read your current location.";
  if (error.code === error.PERMISSION_DENIED) return "Location permission was denied.";
  if (error.code === error.POSITION_UNAVAILABLE) return "Current location is unavailable.";
  if (error.code === error.TIMEOUT) return "Location request timed out.";
  return error.message || "Could not read your current location.";
}

function setLocationButtonLoading(isLoading) {
  const button = $("useCurrentLocation");
  if (!button) return;
  button.disabled = isLoading;
  button.textContent = isLoading ? "Locating..." : "Or use current location";
}

function getCurrentPositionWithTimeout(options, timeoutMs) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject({ code: 3, message: "Location request timed out." });
    }, timeoutMs);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve(position);
      },
      (error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        reject(error);
      },
      options,
    );
  });
}

async function readGeolocationPermissionState() {
  if (!navigator.permissions?.query) return "";
  try {
    const permission = await navigator.permissions.query({ name: "geolocation" });
    return permission.state || "";
  } catch (error) {
    return "";
  }
}

function isPermissionDeniedError(error) {
  return error?.code === error?.PERMISSION_DENIED || error?.code === 1;
}

function normalizePosition(position, source = "live") {
  const coords = position?.coords || position || {};
  const latitude = Number(coords.latitude);
  const longitude = Number(coords.longitude);
  const accuracy = Number(coords.accuracy);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    coords: {
      latitude,
      longitude,
      accuracy: Number.isFinite(accuracy) ? accuracy : null,
    },
    timestamp: Number(position?.timestamp) || Date.now(),
    source,
  };
}

function cacheCurrentPosition(position) {
  const normalized = normalizePosition(position, "cache");
  if (!normalized) return;
  try {
    window.localStorage.setItem(GEOLOCATION_CACHE_KEY, JSON.stringify(normalized));
  } catch (error) {
    // Storage can be unavailable in private browsing; location still works without it.
  }
}

function readCachedCurrentPosition(maxAgeMs = 24 * 60 * 60 * 1000) {
  try {
    const cached = JSON.parse(window.localStorage.getItem(GEOLOCATION_CACHE_KEY) || "null");
    const normalized = normalizePosition(cached, "last known");
    if (!normalized) return null;
    if (Date.now() - normalized.timestamp > maxAgeMs) return null;
    return normalized;
  } catch (error) {
    return null;
  }
}

async function resolveCurrentPosition(statusCallback = () => {}) {
  const attempts = [
    {
      message: "Reading your current location...",
      options: { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
      timeoutMs: 14000,
    },
    {
      message: "High-accuracy location is slow; trying a faster approximate location...",
      options: { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 },
      timeoutMs: 14000,
    },
    {
      message: "Trying the browser's cached location...",
      options: { enableHighAccuracy: false, timeout: 5000, maximumAge: 24 * 60 * 60 * 1000 },
      timeoutMs: 6000,
    },
  ];

  let lastError = null;
  for (const attempt of attempts) {
    statusCallback(attempt.message);
    try {
      const position = await getCurrentPositionWithTimeout(attempt.options, attempt.timeoutMs);
      const normalized = normalizePosition(position);
      if (normalized) {
        cacheCurrentPosition(normalized);
        return normalized;
      }
    } catch (error) {
      lastError = error;
      if (isPermissionDeniedError(error)) throw error;
    }
  }

  const cached = readCachedCurrentPosition();
  if (cached) {
    statusCallback("Live location is slow; using your last known location.");
    return cached;
  }

  throw lastError || new Error("Could not read your current location.");
}

async function requestCurrentLocation() {
  if (!navigator.geolocation) {
    $("startMapStatus").textContent = "This browser does not support current location.";
    return;
  }

  setLocationButtonLoading(true);
  const permissionState = await readGeolocationPermissionState();
  if (permissionState === "denied") {
    $("startMapStatus").textContent = "Location permission is blocked. Enable it in your browser site settings.";
    setLocationButtonLoading(false);
    return;
  }

  $("startMapStatus").textContent = permissionState === "prompt"
    ? "Waiting for browser location permission..."
    : "Reading your current location...";

  try {
    const position = await resolveCurrentPosition((message) => {
      $("startMapStatus").textContent = message;
    });
    const { latitude, longitude, accuracy } = position.coords;
    const accuracyText = Number.isFinite(accuracy) ? ` Accuracy about ${Math.round(accuracy)} m.` : "";
    const sourceText = position.source === "last known" ? "Using your last known location." : "Using your current location.";
    setMapStartCoordinates(latitude, longitude, `${sourceText}${accuracyText}`);
  } catch (error) {
    $("startMapStatus").textContent = geolocationErrorMessage(error);
  } finally {
    setLocationButtonLoading(false);
  }
}

function showWeatherDestinationAlert(message) {
  showToolInfo("weatherDestination", message);
}

function showWeatherLocationAlert(message) {
  showToolInfo("weatherLocation", message);
}

function isLatLngPlace(place) {
  return Boolean(place && Number.isFinite(place.lat) && Number.isFinite(place.lng));
}

function browserGeocodePlaceText(placeText) {
  const address = String(placeText || "").trim();
  if (!address) {
    return Promise.reject(new Error("The navigation destination is missing."));
  }
  if (!window.google?.maps?.Geocoder) {
    return Promise.reject(new Error("Google Maps is not ready for destination lookup yet."));
  }

  const geocoder = new google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      const result = Array.isArray(results) ? results[0] : null;
      const location = result?.geometry?.location;
      if (status !== "OK" || !location) {
        reject(new Error(`Could not find weather coordinates for ${address}.`));
        return;
      }
      resolve({
        name: result.formatted_address || address,
        lat: location.lat(),
        lng: location.lng(),
      });
    });
  });
}

async function resolveWeatherDestination() {
  if (!latestNavigationData?.destination) {
    throw new Error("Please ask the agent for a navigation route first, then update weather at the parsed destination.");
  }

  if (isLatLngPlace(latestNavigationData.destinationPlace)) {
    return latestNavigationData.destinationPlace;
  }

  const encodedRoute = latestNavigationData.mapRoute?.polyline || latestNavigationData.recommended?.polyline || "";
  if (encodedRoute) {
    const path = decodePolyline(encodedRoute);
    const routeEnd = path[path.length - 1];
    if (isLatLngPlace(routeEnd)) {
      const destination = {
        name: latestNavigationData.destination || "Navigation destination",
        lat: routeEnd.lat,
        lng: routeEnd.lng,
      };
      latestNavigationData.destinationPlace = destination;
      return destination;
    }
  }

  const geocoded = await browserGeocodePlaceText(latestNavigationData.destination);
  latestNavigationData.destinationPlace = geocoded;
  return geocoded;
}

async function updateWeatherAtDestination() {
  try {
    const destination = await resolveWeatherDestination();
    await refreshWeatherForStart(
      {
        label: destination.name || latestNavigationData.destination || "Navigation destination",
        lat: destination.lat,
        lng: destination.lng,
        weatherScope: "destination",
      },
      true,
      { preserveOnError: true, throwOnError: true },
    );
  } catch (error) {
    showWeatherDestinationAlert(error.message || "Weather data at the destination could not be updated.");
  }
}

async function updateWeatherAtCurrentLocation() {
  if (!navigator.geolocation) {
    showWeatherLocationAlert("This browser does not support current location.");
    return;
  }

  const permissionState = await readGeolocationPermissionState();
  if (permissionState === "denied") {
    showWeatherLocationAlert("Location permission is blocked. Enable it in your browser site settings.");
    return;
  }

  try {
    const position = await resolveCurrentPosition();
    const { latitude, longitude } = position.coords;
    await refreshWeatherForStart(
      {
        label: "Current location",
        lat: latitude,
        lng: longitude,
        weatherScope: "current location",
      },
      true,
      { preserveOnError: true, throwOnError: true },
    );
  } catch (error) {
    showWeatherLocationAlert(error.message || geolocationErrorMessage(error));
  }
}

async function refreshIntegrationStatus() {
  try {
    const response = await apiFetch("/api/health");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Health check failed");
    integrationStatus = {
      llm: data.llmConnected ? formatModelDisplayName(data.llmStatus || "Connected") : formatModelDisplayName(data.llmStatus || "Offline"),
      google: integrationStatus.google,
      tools: integrationStatus.tools || "Pending",
    };
    setGoogleMapsStatus(Boolean(data.googleMapsBrowserConfigured), Boolean(data.googleMapsConfigured));
    if (data.googleMapsBrowserKey) {
      googleMapsBrowserKey = data.googleMapsBrowserKey;
      loadGoogleStartMap(data.googleMapsBrowserKey);
      void refreshWeatherForStart(getStartPoint(), true);
    } else {
      $("startMapStatus").textContent = "Google Maps browser key missing; use the campus selector below.";
      renderWeatherError("Google Maps browser key missing.");
    }
  } catch (error) {
    integrationStatus = {
      llm: "Local API offline",
      google: "Local API offline",
      tools: integrationStatus.tools || "Pending",
    };
    $("startMapStatus").innerHTML = `Local API not connected. Run <code>PORT=8001 python3 server.py</code>, or open this page with <code>?api=http://localhost:8002</code> if you use another port.`;
    renderWeatherError("Local API is not connected, so the browser key is not available.");
  }
  render();
}

async function refreshRoutes() {
  const requestId = ++routeRequestId;
  const start = getStartPoint();
  const startCacheKey = getStartCacheKey();
  if (!start?.lat || !start?.lng) return;

  routeStatus = "Loading live routes...";
  render();

  try {
    const response = await apiFetch("/api/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: { name: start.label, lat: start.lat, lng: start.lng },
        destinations: places.map((place) => ({
          name: place.name,
          lat: place.lat,
          lng: place.lng,
        })),
      }),
    });
    const data = await response.json();
    if (requestId !== routeRequestId) return;
    if (!response.ok) throw new Error(data.error || "Google route request failed");

    places.forEach((place) => {
      const route = data.routes?.[place.name];
      if (!route?.transitMinutes) return;
      place.liveRoutes = place.liveRoutes || {};
      place.liveRoutes[startCacheKey] = {
        transitMinutes: route.transitMinutes,
        distanceKm: route.distanceKm,
      };
    });
    routeStatus = "Google Routes live";
    routeUpdatedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (error) {
    console.warn(error);
    routeStatus = "Routes on demand";
    routeUpdatedAt = "Estimate";
  }

  render();
}

Object.values(controls).forEach((control) => {
  control.addEventListener("input", () => {
    if (control === controls.walkTolerance) {
      updateOutputs();
      return;
    }
    if (control === controls.startPoint && controls.startPoint.value !== "mapSelection") {
      selectCampusStart(controls.startPoint.value);
      return;
    }
    render();
    if (controls.scenario.value === "nearest") refreshRoutes();
  });
});
$("updateRecommendations").addEventListener("click", () => {
  render();
  if (controls.scenario.value === "nearest") refreshRoutes();
});
$("loadMoreStudySpaces").addEventListener("click", () => {
  recommendationDisplayLimit = recommendationDisplayLimit >= 6 ? 3 : 6;
  render();
});
$("expandHowItWorks").addEventListener("click", toggleHowItWorks);
$("recommendations").addEventListener("click", (event) => {
  const card = event.target.closest(".place-card[data-website]");
  if (!card) return;
  openPlaceWebsiteFromCard(card);
});
$("recommendations").addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key)) return;
  const card = event.target.closest(".place-card[data-website]");
  if (!card) return;
  event.preventDefault();
  openPlaceWebsiteFromCard(card);
});
$("useCurrentLocation").addEventListener("click", requestCurrentLocation);
$("updateWeatherCurrentButton").addEventListener("click", updateWeatherAtCurrentLocation);
$("updateWeatherDestinationButton").addEventListener("click", updateWeatherAtDestination);
$("questionForm").addEventListener("submit", (event) => {
  event.preventDefault();
  answerQuestion($("userQuestion").value);
});
document.querySelectorAll("[data-question]").forEach((button) => {
  button.addEventListener("click", () => {
    $("userQuestion").value = button.dataset.question;
    answerQuestion(button.dataset.question);
  });
});
$("routeUpdateButton").addEventListener("click", drawSelectedRoutePreview);
$("openChatButton").addEventListener("click", openChatModal);
$("closeChatButton").addEventListener("click", closeChatModal);
$("chatModal").addEventListener("click", (event) => {
  if (event.target === $("chatModal")) closeChatModal();
  if (event.target?.matches("[data-chat-route-map]")) showRouteMapFromChat();
});
// External Google Maps link: show confirm modal before leaving
const externalConfirmModalEl = $("externalConfirmModal");
const confirmOpenLinkBtn = $("confirmOpenLink");
const cancelOpenLinkBtn = $("cancelOpenLink");
const toolInfoModalEl = $("toolInfoModal");
const toolInfoTextEl = $("toolInfoText");
const closeToolInfoBtn = $("closeToolInfo");
const llmSignalTile = $("llmSignalTile");
const routesSignalTile = $("routesSignalTile");
const agentToolsTile = $("agentToolsTile");
let pendingExternalHref = null;

const TOOL_INFO_COPY = {
  routes: "Google Routes provides live travel time, distance, and route geometry when the agent enters navigation mode.\n\nIt supports route comparison across public transport, walking, cycling, and driving, and powers the route preview map.",
  llm: "The LLM handles conversation, intent understanding, and study-space recommendations. When route planning is needed, it uses Google Routes data rather than guessing travel time.",
  agent: "The model now chooses tools itself. The top signal shows the tool currently used by the model, or Pending when no tool is used.",
  weatherLocation: "Current-location weather requires browser location permission.",
  weatherDestination: "Please ask the agent for a navigation route first, then update weather at the parsed destination.",
};

const googleLinkEl = $("googleMapsLink");
if (googleLinkEl) {
  googleLinkEl.addEventListener("click", (e) => {
    const href = e.currentTarget && e.currentTarget.href;
    if (!href) return;
    e.preventDefault();
    showExternalConfirm(href);
  });
}

// Intercept clicks on Useful links so we show the same external-confirm modal
document.querySelectorAll('.useful-links a.link-cta').forEach((el) => {
  el.addEventListener('click', (e) => {
    const href = e.currentTarget && e.currentTarget.href;
    if (!href) return;
    e.preventDefault();
    showExternalConfirm(href);
  });
});

function showExternalConfirm(href) {
  pendingExternalHref = href;
  if (!externalConfirmModalEl) return;
  externalConfirmModalEl.hidden = false;
  void externalConfirmModalEl.offsetWidth;
  externalConfirmModalEl.classList.remove("closing");
  externalConfirmModalEl.classList.add("visible");
  const txt = $("externalConfirmText");
  if (txt) txt.textContent = "You are about to leave this page and open a new tab. Continue?";
}

function hideExternalConfirm() {
  if (!externalConfirmModalEl || externalConfirmModalEl.hidden) return;
  externalConfirmModalEl.classList.remove("visible");
  externalConfirmModalEl.classList.add("closing");
  externalConfirmModalEl.addEventListener("animationend", function handler() {
    externalConfirmModalEl.hidden = true;
    externalConfirmModalEl.classList.remove("closing");
    externalConfirmModalEl.removeEventListener("animationend", handler);
  });
  pendingExternalHref = null;
}

function showToolInfo(kind, overrideContent = "") {
  if (!toolInfoModalEl || !toolInfoTextEl) return;
  const content = String(overrideContent || TOOL_INFO_COPY[kind] || TOOL_INFO_COPY.llm);
  toolInfoTextEl.innerHTML = kind === "agent"
    ? renderAgentToolInfo()
    : escapeHtml(content).replace(/\n/g, "<br />");
  toolInfoModalEl.hidden = false;
  void toolInfoModalEl.offsetWidth;
  toolInfoModalEl.classList.remove("closing");
  toolInfoModalEl.classList.add("visible");
}

function renderAgentToolInfo() {
  return `
    <p>The model chooses tools itself while answering. If no tool is needed, the signal stays Pending.</p>
    <div class="tool-info-list">
      <div class="tool-info-item"><strong>Navigation</strong> uses Google Routes for live travel time, distance, and route geometry.</div>
      <div class="tool-info-item"><strong>Google Routes</strong> compares travel estimates to study-space candidates.</div>
      <div class="tool-info-item"><strong>Weather</strong> uses Google Weather API for current conditions at a start point or destination.</div>
    </div>
    <p>The signal updates to the model-selected tool after each answer starts streaming.</p>
  `;
}

function hideToolInfo() {
  if (!toolInfoModalEl || toolInfoModalEl.hidden) return;
  toolInfoModalEl.classList.remove("visible");
  toolInfoModalEl.classList.add("closing");
  toolInfoModalEl.addEventListener("animationend", function handler() {
    toolInfoModalEl.hidden = true;
    toolInfoModalEl.classList.remove("closing");
    toolInfoModalEl.removeEventListener("animationend", handler);
  });
}

const startupWaitModalEl = $("startupWaitModal");
const closeStartupWaitBtn = $("closeStartupWait");

function showStartupWaitModal() {
  if (!startupWaitModalEl) return;
  startupWaitModalEl.hidden = false;
  void startupWaitModalEl.offsetWidth;
  startupWaitModalEl.classList.remove("closing");
  startupWaitModalEl.classList.add("visible");
}

function hideStartupWaitModal() {
  if (!startupWaitModalEl || startupWaitModalEl.hidden) return;
  startupWaitModalEl.classList.remove("visible");
  startupWaitModalEl.classList.add("closing");
  startupWaitModalEl.addEventListener("animationend", function handler() {
    startupWaitModalEl.hidden = true;
    startupWaitModalEl.classList.remove("closing");
    startupWaitModalEl.removeEventListener("animationend", handler);
  });
}

function bindSignalTileInfo(tile, kind) {
  if (!tile) return;
  tile.addEventListener("click", () => showToolInfo(kind));
  tile.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    showToolInfo(kind);
  });
}

if (confirmOpenLinkBtn) {
  confirmOpenLinkBtn.addEventListener("click", () => {
    if (pendingExternalHref) window.open(pendingExternalHref, "_blank");
    hideExternalConfirm();
  });
}
if (cancelOpenLinkBtn) {
  cancelOpenLinkBtn.addEventListener("click", hideExternalConfirm);
}

bindSignalTileInfo(llmSignalTile, "llm");
bindSignalTileInfo(routesSignalTile, "routes");
bindSignalTileInfo(agentToolsTile, "agent");

// Fallback delegated handlers in case tiles are re-rendered or late-mounted.
document.addEventListener("click", (event) => {
  const tile = event.target.closest("#llmSignalTile, #routesSignalTile, #agentToolsTile");
  if (!tile) return;
  const kind = tile.id === "routesSignalTile"
    ? "routes"
    : tile.id === "agentToolsTile"
      ? "agent"
      : "llm";
  showToolInfo(kind);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const tile = event.target.closest("#llmSignalTile, #routesSignalTile, #agentToolsTile");
  if (!tile) return;
  event.preventDefault();
  const kind = tile.id === "routesSignalTile"
    ? "routes"
    : tile.id === "agentToolsTile"
      ? "agent"
      : "llm";
  showToolInfo(kind);
});

if (closeToolInfoBtn) {
  closeToolInfoBtn.addEventListener("click", hideToolInfo);
}
if (toolInfoModalEl) {
  toolInfoModalEl.addEventListener("click", (event) => {
    if (event.target === toolInfoModalEl) hideToolInfo();
  });
}
if (closeStartupWaitBtn) {
  closeStartupWaitBtn.addEventListener("click", hideStartupWaitModal);
}
if (startupWaitModalEl) {
  startupWaitModalEl.addEventListener("click", (event) => {
    if (event.target === startupWaitModalEl) hideStartupWaitModal();
  });
}

$("modalChatForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = $("modalUserQuestion");
  const question = input.value.trim();
  if (!question) return;
  $("userQuestion").value = question;
  input.value = "";
  chatHistory.push({ role: "user", content: question });
  renderChatModalHistory(true);
  $("modalAskButton").disabled = true;
  try {
    await answerQuestion(question, { skipUserPush: true });
  } finally {
    $("modalAskButton").disabled = false;
    input.focus();
  }
});

render();
refreshIntegrationStatus();
