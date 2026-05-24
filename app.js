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
    distance: 0.2,
    transitMinutes: 4,
    walkMinutes: 3,
    crowd: 72,
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
    distance: 0.4,
    transitMinutes: 6,
    walkMinutes: 5,
    crowd: 54,
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
    distance: 6.2,
    transitMinutes: 28,
    walkMinutes: 8,
    crowd: 42,
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
    distance: 3.0,
    transitMinutes: 18,
    walkMinutes: 9,
    crowd: 36,
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
    distance: 6.6,
    transitMinutes: 31,
    walkMinutes: 7,
    crowd: 40,
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
    distance: 1.7,
    transitMinutes: 15,
    walkMinutes: 14,
    crowd: 34,
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
    distance: 5.2,
    transitMinutes: 27,
    walkMinutes: 6,
    crowd: 44,
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
    distance: 42.0,
    transitMinutes: 78,
    walkMinutes: 5,
    crowd: 18,
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
    distance: 6.8,
    transitMinutes: 26,
    walkMinutes: 8,
    crowd: 62,
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
    distance: 6.2,
    transitMinutes: 24,
    walkMinutes: 6,
    crowd: 48,
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
    distance: 8.2,
    transitMinutes: 32,
    walkMinutes: 7,
    crowd: 52,
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
    distance: 9.8,
    transitMinutes: 38,
    walkMinutes: 5,
    crowd: 56,
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
let routeRequestId = 0;
let routeStatus = "Routes on demand";
let routeUpdatedAt = "Estimate";
let integrationStatus = {
  llm: "Checking",
  google: "Checking",
  tools: "Conversation",
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
let latestNavigationData = null;
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
let answerRenderSessionId = 0;

function normalise(value, min, max) {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

function distanceBetweenKm(origin, destination) {
  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) return destination.distance;
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
  const adjustedCrowd = place.crowd;
  const walkingPenalty = estimatedWalkMinutes > context.walkTolerance ? (estimatedWalkMinutes - context.walkTolerance) * 1.8 : 0;
  const rainPenalty = 0;
  const matchedTags = profile.wanted.filter((tag) => place.tags.includes(tag));
  const missingTags = profile.wanted.length - matchedTags.length;
  const matchScore = matchedTags.length * 12 - missingTags * 10;
  const weights = getPreferenceWeights(profile);

  const speedScore = 100 - normalise(adjustedTransit, 10, 62);
  const calmScore = 100 - adjustedCrowd;
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
    adjustedCrowd,
    total: Math.round(Math.max(0, Math.min(100, total))),
    risk: getRisk(place, adjustedCrowd, adjustedTransit, rainPenalty, walkingPenalty),
    decision: getDecision(place, context, adjustedTransit, adjustedCrowd, rainPenalty),
  };
}

function getRisk(place, crowd, transit, rainPenalty, walkingPenalty) {
  if (rainPenalty > 10) return { label: "Weather risk", className: "warning" };
  if (crowd > 70) return { label: "Likely busy", className: "caution" };
  if (transit > 48) return { label: "Long journey", className: "caution" };
  if (walkingPenalty > 0) return { label: "Walk limit exceeded", className: "caution" };
  if (place.budget < 62) return { label: "Cost trade-off", className: "caution" };
  return { label: "Good fit", className: "ok" };
}

function getDecision(place, context, transit, crowd, rainPenalty) {
  if (rainPenalty > 10 && place.tags.includes("outdoor")) {
    return "Less ideal in wet weather.";
  }
  if (crowd > 70) {
    return "Strong match, likely busy.";
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
    .slice(0, 4);

  $("recommendations").innerHTML = latestRanked.map(renderCard).join("");
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
    .slice(0, 3);
  const tagLabels = visibleTags
    .map((tag) => `<span class="tag">${tagLabel(tag)}</span>`)
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
        <div class="tags">${tagLabels}<span class="tag ${place.risk.className}">${place.risk.label}</span></div>
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
    medicine: "Medical resources",
    campus: "Campus library",
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
  const intent = await classifyIntent(cleaned);
  if (intent.mode === "navigation") {
    setAgentMode("Navigation");
    await answerNavigationQuestion(cleaned, { ...options, minLoadingReadyAt });
    return;
  }

  const isStudyPlanning = isStudyPlanningQuestion(cleaned);
  setAgentMode(isStudyPlanning ? "Study planning" : "Conversation");
  clearRoutePreview();
  applyQuestionIntent(cleaned);
  if (shouldUseRoutesForStudyQuestion(cleaned) || controls.scenario.value === "nearest") {
    await refreshRoutes();
  }
  render();

  const context = getContext();
  setAsking(true);
  renderLoadingAnswer("Generating results");

  try {
    const response = await apiFetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stream: true,
        question: cleaned,
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
    const answer = sanitizeModelOutput(contentType.includes("application/x-ndjson")
      ? await readStreamingAnswer(response)
      : await readJsonAnswer(response));

    chatHistory.push({ role: "assistant", content: answer });
    trimChatHistory();
    latestNavigationData = null;
    renderAgentActions();
    renderChatModalHistory();
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
    setAsking(false);
  }
}

async function classifyIntent(question) {
  try {
    const response = await apiFetch("/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, contextStart: currentStartContext(), history: chatHistory.slice(-6) }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Intent request failed");
    return {
      mode: data.mode === "navigation" ? "navigation" : "study",
      confidence: data.confidence || 0,
      reason: data.reason || "",
    };
  } catch (error) {
    if (isNavigationQuery(question)) {
      return { mode: "navigation", confidence: 0.65, reason: "local route fallback" };
    }
    return { mode: "study", confidence: 0, reason: error.message };
  }
}

async function answerNavigationQuestion(question, options = {}) {
  const minLoadingReadyAt = Number.isFinite(options.minLoadingReadyAt)
    ? options.minLoadingReadyAt
    : Date.now() + MIN_LOADING_MS;
  setAsking(true);
  renderLoadingAnswer("Checking Google Routes for accurate navigation");
  const ROUTE_SUMMARY_DELAY_MS = 4000;

  const routeSummaryTimer = window.setTimeout(() => {
    renderLoadingAnswer("Generating routes to your destination");
  }, ROUTE_SUMMARY_DELAY_MS);

  try {
    const response = await apiFetch("/api/navigate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: question, contextStart: currentStartContext(), history: chatHistory.slice(-6) }),
    });
    const data = await response.json();
    window.clearTimeout(routeSummaryTimer);
    if (!response.ok) {
      const details = Array.isArray(data.details) && data.details.length
        ? `\n${data.details.join("\n")}`
        : "";
      throw new Error(`${data.error || "Navigation request failed"}${details}`);
    }

    if (!options.skipUserPush) {
      chatHistory.push({ role: "user", content: question });
      renderChatModalHistory();
    }
    await waitForMinimumLoading(minLoadingReadyAt);
    const answer = sanitizeModelOutput(data.answer);
    chatHistory.push({ role: "assistant", content: answer });
    trimChatHistory();
    latestNavigationData = { ...data, answer };
    await renderAnswerWithPacing(answer);
    renderRoutePreview(data);
    renderAgentActions(data, data.recommended);
    renderChatModalHistory();
  } catch (error) {
    await waitForMinimumLoading(minLoadingReadyAt);
    cancelAnswerRender();
    hideAgentActions();
    clearRoutePreview();
    $("agentAnswer").innerHTML = `
      <strong>Navigation is not available yet</strong>
      <br />${escapeHtml(error.message)}
      <br />Check that <code>GOOGLE_MAPS_BROWSER_KEY</code> is set for the map display and <code>GOOGLE_MAPS_API_KEY</code> is set for Routes API.
      <br />Current API endpoint: <code>${escapeHtml(apiBaseLabel())}</code>
    `;
  } finally {
    window.clearTimeout(routeSummaryTimer);
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

function isNavigationQuery(question) {
  const text = question.toLowerCase();
  return (
    /\bfrom\s+.+\s+to\s+.+/.test(text) ||
    /从.+到.+/.test(question) ||
    /从.+去.+/.test(question) ||
    /.+到.+怎么走/.test(question) ||
    text.includes("directions") ||
    text.includes("navigate") ||
    text.includes("route to") ||
    question.includes("怎么去") ||
    question.includes("怎么走") ||
    question.includes("路线") ||
    question.includes("导航")
  );
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

function isStudyPlanningQuestion(question) {
  const text = question.toLowerCase();
  return (
    text.includes("study") ||
    text.includes("library") ||
    text.includes("campus") ||
    text.includes("quiet") ||
    text.includes("group") ||
    text.includes("revise") ||
    text.includes("revision") ||
    text.includes("focus") ||
    text.includes("seat") ||
    text.includes("nearest") ||
    text.includes("nearby") ||
    text.includes("study space") ||
    question.includes("图书馆") ||
    question.includes("学习") ||
    question.includes("自习") ||
    question.includes("安静") ||
    question.includes("附近")
  );
}

async function readJsonAnswer(response) {
  const data = await response.json();
  const answer = data.answer || "";
  await renderAnswerWithPacing(answer);
  return answer;
}

async function readStreamingAnswer(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";
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
      if (event.delta) {
        answer += event.delta;
        enqueueAnswerRender(streamState, event.delta);
      }
    }
  }

  closeAnswerRender(streamState);
  await waitForAnswerRender(streamState);

  return answer.trim();
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
  const text = sanitizeModelOutput(state.rendered);
  $("agentAnswer").innerHTML = text ? renderMarkdown(text) : "";

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
  enqueueAnswerRender(state, clean);
  closeAnswerRender(state);
  await waitForAnswerRender(state);
}

function renderLoadingAnswer(message) {
  cancelAnswerRender();
  clearRoutePreview();
  hideAgentActions();
  $("agentAnswer").innerHTML = `
    <div class="thinking-panel" role="status" aria-live="polite">
      <div class="thinking-header">
        <span class="thinking-orbit" aria-hidden="true"></span>
        <strong>${escapeHtml(message)}</strong>
        <span class="thinking-dots" aria-hidden="true"><span></span><span></span><span></span></span>
      </div>
      <div class="thinking-bar" aria-hidden="true"><span></span></div>
    </div>
  `;
}

function renderMarkdown(value) {
  return escapeHtml(sanitizeModelOutput(value))
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^\s*[-*]\s+(.+)$/gm, "• $1")
    .replace(/\n/g, "<br />");
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
    dataNote: "Library names come from Imperial College London Library Services' Our libraries page. Travel time and distance use Google Routes API when available; crowding and comfort are prototype estimates.",
  };
}

function toModelPlace(place) {
  return {
    name: place.name,
    type: place.type,
    score: place.total,
    decision: place.decision,
    risk: place.risk.label,
    transitMinutes: place.adjustedTransit,
    distanceKm: place.adjustedDistance,
    routeSource: place.hasLiveRoute ? "Google Routes API" : "prototype estimate",
    walkMinutes: place.estimatedWalkMinutes,
    crowd: place.adjustedCrowd,
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
      return `<div class="chat-message ${role}${popClass}">${renderMarkdown(item.content)}${routeMapButton}<span class="chat-bubble-tail" aria-hidden="true"></span></div>`;
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
  return "Could not read your current location.";
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
    let position;
    try {
      position = await getCurrentPositionWithTimeout(
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 30000,
        },
        10000,
      );
    } catch (firstError) {
      $("startMapStatus").textContent = "High-accuracy location is slow; trying a faster approximate location...";
      position = await getCurrentPositionWithTimeout(
        {
          enableHighAccuracy: false,
          timeout: 7000,
          maximumAge: 300000,
        },
        9000,
      );
    }

    const { latitude, longitude, accuracy } = position.coords;
    const accuracyText = Number.isFinite(accuracy) ? ` Accuracy about ${Math.round(accuracy)} m.` : "";
    setMapStartCoordinates(latitude, longitude, `Using your current location.${accuracyText}`);
  } catch (error) {
    $("startMapStatus").textContent = geolocationErrorMessage(error);
  } finally {
    setLocationButtonLoading(false);
  }
}

async function refreshIntegrationStatus() {
  try {
    const response = await apiFetch("/api/health");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Health check failed");
    integrationStatus = {
      llm: data.llmConnected ? data.llmStatus || "Connected" : data.llmStatus || "Offline",
      google: integrationStatus.google,
      tools: integrationStatus.tools || "Conversation",
    };
    setGoogleMapsStatus(Boolean(data.googleMapsBrowserConfigured), Boolean(data.googleMapsConfigured));
    if (data.googleMapsBrowserKey) {
      loadGoogleStartMap(data.googleMapsBrowserKey);
    } else {
      $("startMapStatus").textContent = "Google Maps browser key missing; use the campus selector below.";
    }
  } catch (error) {
    integrationStatus = {
      llm: "Local API offline",
      google: "Local API offline",
      tools: integrationStatus.tools || "Conversation",
    };
    $("startMapStatus").innerHTML = `Local API not connected. Run <code>PORT=8001 python3 server.py</code>, or open this page with <code>?api=http://localhost:8002</code> if you use another port.`;
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
  agent: "When your question involves studying, libraries, campus facilities, or travel directions, the agent can switch mode automatically:\n\n• Study Planning — recommends Imperial study spaces based on your goal and selected starting point.\n• Navigation — calls Google Routes to calculate travel time, distance, and route geometry.\n• Conversation — answers general questions without using external route tools.\n\nThe mode updates automatically after each question.",
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

function showToolInfo(kind) {
  if (!toolInfoModalEl || !toolInfoTextEl) return;
  const content = String(TOOL_INFO_COPY[kind] || TOOL_INFO_COPY.llm);
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
    <p>When your question involves studying, libraries, campus facilities, or travel directions, the agent can switch mode automatically:</p>
    <div class="tool-info-list">
      <div class="tool-info-item"><strong>Study Planning</strong> recommends Imperial study spaces based on your goal and selected starting point.</div>
      <div class="tool-info-item"><strong>Navigation</strong> calls Google Routes to calculate travel time, distance, and route geometry.</div>
      <div class="tool-info-item"><strong>Conversation</strong> answers general questions without using external route tools.</div>
    </div>
    <p>The mode updates automatically after each question.</p>
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
