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
const MAINLAND_CHINA_WARNING_TEXT = [
  "由于 Google Map 数据覆盖范围的限制，中国大陆地区的天气和交通信息可能不准确或无法获取。为获取更好的体验，请您选取港澳台或海外地区使用。",
  "Due to Google Maps data coverage limitations, weather and traffic information in mainland China may be inaccurate or unavailable. For a better experience, please select Hong Kong, Macao, Taiwan, or an overseas region.",
].join("\n\n");
const MAINLAND_CHINA_POLYGONS = [
  [
    [73.5, 39.5], [74.8, 37.2], [78, 35], [78.5, 32], [80.3, 30], [79.5, 27],
    [81.5, 25], [85, 27], [88, 27], [91, 28], [94, 29], [96, 28], [98, 25],
    [100, 21.5], [103, 22], [106, 21.5], [109, 18.2], [111, 19.5], [112, 21.5],
    [115, 21.8], [118, 23.5], [119.5, 25], [121.8, 29.5], [122, 31.5],
    [121, 33], [122, 37], [124, 39], [124, 40.5], [126, 41], [128, 42],
    [130.5, 42.4], [132, 45], [134.8, 48.4], [131, 48.8], [127, 49.5],
    [123, 53.5], [120, 53.2], [116, 49], [112, 49], [108, 45], [103, 42],
    [96, 44], [91, 46.5], [88, 48], [85, 47], [82, 45], [80, 43], [76, 41],
    [73.5, 39.5],
  ],
  [
    [108.5, 18], [111.2, 18], [111.2, 20.3], [108.5, 20.3], [108.5, 18],
  ],
];

const $ = (id) => document.getElementById(id);
const LANGUAGE_STORAGE_KEY = "imperialNavigatorLanguage";
let currentLanguage = "en";
try {
  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (storedLanguage === "zh") currentLanguage = "zh";
} catch (error) {
  // Ignore storage errors so the app can still boot in private browsing modes.
}

const I18N = {
  en: {
    languageToggle: "中文",
    pageTitle: "Imperial Travel Agent",
    heroTitle: "Start Planning your next journey",
    heroText: "Choose your starting point, ask the agent anything, and get study-space recommendations or live route plans.",
    llmLabel: "LLM",
    llmSwitchHint: "Tap to switch",
    apiKeys: "API Keys",
    chooseStart: "Choose where to start",
    startingLocation: "Click on map or use your current location",
    loadingGoogleMap: "Loading Google Map...",
    selectCampus: "or select campus",
    mapSelection: "Map selection",
    useCurrentLocation: "Or use current location",
    shuttleTitle: "Campus shuttle",
    shuttleFrom: "From campus",
    shuttleTo: "To campus",
    shuttleNext: "Next shuttle",
    shuttleChecking: "Checking timetable...",
    shuttleWeekdayHint: "Weekday service between South Kensington, White City and Hammersmith.",
    shuttleSource: "Timetable from Imperial College London.",
    shuttleWeekend: "No service at weekends.",
    shuttleSameCampus: "Choose two different campuses.",
    shuttleNoMoreToday: "No more shuttle departures today.",
    shuttleNextWeekday: "Next weekday service starts at {time}.",
    shuttleNextDeparture: "{time}",
    shuttleDetail: "{direction} from {from} towards {to}. Approximate departure from {from}.",
    shuttleEastbound: "Eastbound",
    shuttleWestbound: "Westbound",
    studySpaces: "Study & work spaces",
    preference: "Preference",
    quietSpace: "Quiet space",
    groupWork: "Group work",
    lateNightWork: "Late night work",
    nearestSeat: "Nearest seat",
    walkingComfortLimit: "Walking comfort limit",
    updateRecommendations: "Update recommendations",
    loadMoreStudySpaces: "Load more spaces",
    collapseStudySpaces: "Collapse spaces",
    studySpacesTooFar: "No nearby study spaces are shown because the closest listed library is more than {distance} km away.",
    travelAgent: "Travel agent",
    summaryTitle: "Ask to plan, explore, or navigate",
    agentModeTools: "Agent mode or tools",
    askAgent: "Ask the Agent",
    questionPlaceholder: "Where are you going? Ask about routes, weather, or anything else.",
    ask: "Ask",
    thinking: "Thinking",
    quickWhiteCity: "Go to White City",
    quickLibrary: "Nearby library",
    quickWeather: "Current weather",
    quickTfl: "TfL status",
    quickWhiteCityQuestion: "How do I get to White City Campus from my current selected start point?",
    quickLibraryQuestion: "Which library is nearby from my selected starting point?",
    quickWeatherQuestion: "What's the current weather at my selected start point right now?",
    quickTflQuestion: "What's the current TfL status, and are any lines disrupted right now?",
    agentPlaceholder: "Ready when you are. Ask the agent a question to get started.",
    routeMap: "Route map",
    routeMapButton: "Close to view route map",
    weatherDestinationRequired: "Please ask the agent for a navigation route first, then update weather at the parsed destination.",
    start: "Start",
    destination: "Destination",
    transportMode: "Transport mode",
    update: "Update",
    fullScreen: "Full screen",
    exitFullScreen: "Exit full screen",
    openGoogleMaps: "Open Google Maps for route",
    continueChat: "Continue in chat window",
    expandIntro: "Expand introductions to the agent",
    collapseIntro: "Collapse introductions to the agent",
    howItWorks: "How it works?",
    how1Title: "1. Start with where you are",
    how1Body: "Choose a starting point on the map, use your current location, or select a campus preset. This gives the agent the context it needs to recommend places, compare routes, or check conditions around you.",
    how2Title: "2. Ask naturally",
    how2Body: "Type your question in everyday language. You can ask where to study, how to get somewhere, what the weather is like, or whether live travel information is needed. The agent will decide which tools to use based on your request.",
    how3Title: "3. Get actionable results",
    how3Body: "The agent combines your location, route data, weather, and other live information when available to give clear, actionable suggestions. For navigation requests, you’ll also see an interactive route preview with transport details.",
    weather: "Weather",
    atYour: "At your",
    startPoint: "start point",
    currentLocation: "current location",
    updateWeatherAt: "Update weather data at",
    destinationButton: "Destination",
    today: "Today",
    weatherNotLoaded: "Weather not loaded",
    weatherHint: "Use your selected start point, current location, or navigation destination.",
    aiSummary: "AI summary",
    waitingWeather: "Waiting for weather data.",
    feelsLike: "Feels like",
    humidity: "Humidity",
    wind: "Wind",
    uv: "UV",
    precipitation: "Precipitation %",
    tflStatus: "TfL status",
    londonLinesNow: "London lines right now",
    refresh: "Refresh",
    tflMeta: "Live status from Transport for London.",
    conversation: "Conversation",
    agentChat: "Agent chat",
    close: "Close",
    modalPlaceholder: "Continue the conversation...",
    send: "Send",
    answerModelLabel: "Answered with {model}",
    chatModelSectionTitle: "Conversation model",
    chatModelSectionBody: "Switch the main chat model for this page. Tool choice and the final answer will follow your selection.",
    chatModelCurrent: "Current chat model: {model}",
    chatModelHelper: "GLM-5 is the higher-capability option.",
    chatModelRetryHint: "You can try switching to the other model and retrying.",
    chatModelSwitchUnavailable: "Model switching is currently unavailable.",
    externalConfirmTitle: "Open external link",
    externalConfirm: "You are about to leave this page and open a new tab. Continue?",
    startupWaitTitle: "Waking up the server",
    openNewTab: "Open in new tab",
    cancel: "Cancel",
    mapPoint: "Map point {lat}, {lng}",
    mapPointSelected: "{label} selected",
    mapGuidance: "Click the map, drag the marker, or use your current location.",
    locationRequiresHttps: "Location requires HTTPS or localhost.",
    locationUnavailable: "Could not read your current location.",
    locationDenied: "Location permission was denied.",
    locationUnavailableCurrent: "Current location is unavailable.",
    locationTimedOut: "Location request timed out.",
    locationUnsupported: "This browser does not support current location.",
    locationBlockedSettings: "Location permission is blocked. Enable it in your browser site settings.",
    locationPromptWaiting: "Waiting for browser location permission...",
    locationReading: "Reading your current location...",
    locationHighAccuracy: "High-accuracy location is slow; trying a faster approximate location...",
    locationCached: "Trying the browser's cached location...",
    locationUsingLastKnown: "Live location is slow; using your last known location.",
    locationUsingCurrent: "Using your current location.",
    locationUsingLastKnownShort: "Using your last known location.",
    locationAccuracyAbout: "Accuracy about {meters} m.",
    locationButtonLocating: "Locating...",
    usefulLinks: "Useful links",
    footerNote: "This is an independent project and is not an official Imperial College London service. This agent can be used in most regions and performs best in London. Due to data limitations, weather and traffic may be inaccurate or unavailable in some regions, e.g., China mainland.",
    checking: "Checking",
    pending: "Pending",
    connected: "Connected",
    offline: "Offline",
    keysReady: "Keys Ready",
    browserKeyReady: "Browser key ready",
    browserKeyMissing: "Browser key missing",
    routesKeyMissing: "Routes key missing",
    localApiOffline: "Local API offline",
    distanceLabel: "Distance",
    walkEstimateLabel: "Walk est.",
    minuteUnitShort: "min",
    usingTool: "Using {tool} tool",
    understandingRequest: "Understanding your request",
  },
  zh: {
    languageToggle: "English",
    pageTitle: "Imperial 出行助手",
    heroTitle: "使用 Agent 规划行程",
    heroText: "首先选择你的位置，再向 Agent 提出需求，即可获取附近的工作学习空间推荐、实时路线规划、路线交互式地图、交通情况与天气辅助建议。",
    llmLabel: "大语言模型",
    llmSwitchHint: "点击切换",
    apiKeys: "外部 API",
    chooseStart: "选择出发地点",
    startingLocation: "点击地图、拖动标记，或使用当前位置。",
    loadingGoogleMap: "正在加载 Google 地图...",
    selectCampus: "或选择校区",
    mapSelection: "地图选点",
    useCurrentLocation: "使用当前位置",
    shuttleTitle: "实时校车",
    shuttleFrom: "出发校区",
    shuttleTo: "到达校区",
    shuttleNext: "下一班校车",
    shuttleChecking: "正在查询时刻表...",
    shuttleWeekdayHint: "工作日往返于 South Kensington、White City 与 Hammersmith。",
    shuttleSource: "时刻表来源：Imperial College London。",
    shuttleWeekend: "Imperial 校车周末不运营。",
    shuttleSameCampus: "请选择两个不同的校区。",
    shuttleNoMoreToday: "今天已经没有后续校车班次。",
    shuttleNextWeekday: "下一个工作日首班为 {time}。",
    shuttleNextDeparture: "{time}",
    shuttleDetail: "{direction}，从 {from} 开往 {to} 方向。此为 {from} 的预计发车时间。",
    shuttleEastbound: "东行",
    shuttleWestbound: "西行",
    studySpaces: "学习与办公空间",
    preference: "偏好",
    quietSpace: "安静空间",
    groupWork: "小组讨论",
    lateNightWork: "夜间学习",
    nearestSeat: "就近找座",
    walkingComfortLimit: "步行舒适上限",
    updateRecommendations: "更新推荐",
    loadMoreStudySpaces: "查看更多空间",
    collapseStudySpaces: "收起更多空间",
    studySpacesTooFar: "由于最近的图书馆也超过 {distance} 公里，这里暂不显示推荐；我们只推荐 50 公里内的图书馆。",
    travelAgent: "出行智能体",
    summaryTitle: "获取路线导航、天气、或出行建议",
    agentModeTools: "Agent 使用的工具",
    askAgent: "向 Agent 提问",
    questionPlaceholder: "想去哪？可以尝试询问路线、天气或其他出行问题",
    ask: "发送",
    thinking: "思考中",
    quickWhiteCity: "去白城校区",
    quickLibrary: "附近图书馆",
    quickWeather: "当前天气",
    quickTfl: "伦敦地铁实时状态",
    quickWhiteCityQuestion: "从我当前选择的出发点怎么去 White City Campus？",
    quickLibraryQuestion: "从我当前选择的出发点附近有哪些图书馆？",
    quickWeatherQuestion: "我当前选择的出发点现在天气怎么样？",
    quickTflQuestion: "现在 TfL 线路状态如何？有没有线路延误或中断？",
    agentPlaceholder: "向 Agent 提问后答案会在此处显示，交互式地图将在导航工具被调用后显示。",
    routeMap: "路线地图",
    routeMapButton: "关闭以查看路线图",
    weatherDestinationRequired: "请先向 Agent 提问以生成一条导航路线，然后再更新目的地天气。",
    start: "起点",
    destination: "目的地",
    transportMode: "交通方式",
    update: "更新",
    fullScreen: "全屏地图",
    exitFullScreen: "退出全屏",
    openGoogleMaps: "在 Google Maps 中查看更多路线",
    continueChat: "打开聊天窗口继续对话",
    expandIntro: "展开 Agent 使用指南",
    collapseIntro: "收起 Agent 使用指南",
    howItWorks: "「 使用指南 」",
    how1Title: "1. 选择你的出发位置",
    how1Body: "你可以在地图上选择起点、使用当前位置，或直接选择一个校区预设。这样 Agent 就能理解你的行程从哪里开始，并据此推荐学习空间、比较路线或查询周边信息。如果你不想选择，直接告诉 Agent 你在哪里也可以。",
    how2Title: "2. 用自然语言提问",
    how2Body: "直接用自然语言输入你的问题即可。你可以询问哪里适合学习办公、如何前往某个地点、当前天气如何、前往多个地点的路程比较等等，或是否需要查看实时交通信息。Agent 会根据你的问题判断是否需要调用，以及调用哪些工具。",
    how3Title: "3. 得到可执行建议",
    how3Body: "Agent 会结合你的起点、路线、天气和其他可用实时信息给出实用建议。涉及导航时，页面还会显示交互式路线预览，并在可用时提供站点、线路和交通方式等细节。请注意由于 Google Maps 的数据限制，路线预览功能<strong class=\"how-inline-emphasis\">在中国大陆可能无法使用</strong>。",
    weather: "天气",
    atYour: "目前显示的天气位置为",
    startPoint: "图选位置",
    currentLocation: "当前位置",
    updateWeatherAt: "更新天气位置",
    destinationButton: "目的地",
    today: "今天",
    weatherNotLoaded: "天气尚未加载",
    weatherHint: "可使用出发点、当前位置或导航目的地获取天气。",
    aiSummary: "AI 简报",
    waitingWeather: "等待天气数据。",
    feelsLike: "体感温度",
    humidity: "湿度",
    wind: "风速",
    uv: "紫外线",
    precipitation: "降水概率",
    tflStatus: "TFL 运营状况",
    londonLinesNow: "伦敦线路实时状态",
    refresh: "刷新",
    tflMeta: "数据来自 Transport for London 实时状态。",
    conversation: "对话",
    agentChat: "Agent",
    close: "关闭",
    modalPlaceholder: "继续对话...",
    send: "发送",
    answerModelLabel: "本次回答模型：{model}",
    chatModelSectionTitle: "对话模型",
    chatModelSectionBody: "切换当前页面主对话所使用的模型。",
    chatModelCurrent: "当前对话模型：{model}",
    chatModelHelper: "GLM-5 是更高级的模型。",
    chatModelRetryHint: "你可以尝试切换到另一个模型后重试。",
    chatModelSwitchUnavailable: "当前暂时无法切换模型。",
    externalConfirmTitle: "打开外部链接",
    externalConfirm: "即将离开当前页面并打开新标签页，是否继续？",
    startupWaitTitle: "正在唤醒服务器",
    openNewTab: "打开新标签页",
    cancel: "取消",
    mapPoint: "地图点位 {lat}, {lng}",
    mapPointSelected: "已选择 {label}",
    mapGuidance: "点击地图、拖动标记，或使用当前位置。",
    locationRequiresHttps: "定位需要 HTTPS 或 localhost 环境。",
    locationUnavailable: "无法读取当前位置。",
    locationDenied: "定位权限已被拒绝。",
    locationUnavailableCurrent: "当前位置信息不可用。",
    locationTimedOut: "定位请求超时。",
    locationUnsupported: "当前浏览器不支持定位。",
    locationBlockedSettings: "定位权限已被阻止，请在浏览器站点设置中启用。",
    locationPromptWaiting: "正在等待浏览器定位权限...",
    locationReading: "正在读取当前位置...",
    locationHighAccuracy: "高精度定位较慢，正在尝试更快的近似定位...",
    locationCached: "正在尝试浏览器缓存的定位...",
    locationUsingLastKnown: "实时定位较慢，正在使用上次已知位置。",
    locationUsingCurrent: "正在使用当前位置。",
    locationUsingLastKnownShort: "正在使用上次已知位置。",
    locationAccuracyAbout: "精度约 {meters} 米。",
    locationButtonLocating: "定位中...",
    usefulLinks: "相关链接",
    footerNote: "本网页为个人项目，而非帝国理工学院的官方服务。本 Agent 可在全球大多数地区使用，在伦敦地区表现最佳。由于数据覆盖范围的限制，中国大陆地区的天气和交通信息可能不准确或无法获取，请您选取港澳台或海外地区使用。",
    pending: "暂未使用",
    connected: "已连接",
    offline: "离线",
    keysReady: "服务已连接",
    browserKeyReady: "浏览器已连接",
    browserKeyMissing: "缺少浏览器密钥",
    routesKeyMissing: "缺少路线密钥",
    localApiOffline: "本地 API 离线",
    distanceLabel: "距离",
    walkEstimateLabel: "步行预估",
    minuteUnitShort: "分钟",
    usingTool: "正在使用{tool}工具",
    understandingRequest: "正在理解您的请求",
  },
};

function t(key, replacements = {}) {
  const template = I18N[currentLanguage]?.[key] ?? I18N.en[key] ?? key;
  return Object.entries(replacements).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), template);
}

function setLanguage(language) {
  currentLanguage = language === "zh" ? "zh" : "en";
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
  } catch (error) {
    // Ignore storage errors so language switching still works in restricted modes.
  }
  applyLanguage();
  render();
  if (latestWeatherData && latestWeatherStart) {
    renderWeatherData(latestWeatherData, latestWeatherStart);
  }
  if (latestTflStatusData) {
    renderTflStatus(latestTflStatusData);
  }
  if (activeRoutePreview) renderRoutePreview(activeRoutePreview);
  playLanguageSwitchAnimation();
}

function playLanguageSwitchAnimation() {
  animateClass(document.querySelector(".app-shell"), "language-switch-reveal");
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  document.title = t("pageTitle");
  const languageToggle = $("languageToggle");
  if (languageToggle) {
    languageToggle.textContent = t("languageToggle");
    languageToggle.setAttribute("aria-label", currentLanguage === "zh" ? "Switch to English" : "切换到中文");
  }

  const textMap = [
    [".hero-panel .eyebrow", "pageTitle"],
    [".hero-panel h1", "heroTitle"],
    [".hero-text", "heroText"],
    ["#llmSignalTile span", "llmLabel"],
    ["#llmSignalAction", "llmSwitchHint"],
    ["#routesSignalTile span", "apiKeys"],
    [".start-module .left-section-title", "chooseStart"],
    ["label[for='startPoint']", "startingLocation"],
    [".select-note", "selectCampus"],
    ["#useCurrentLocation", "useCurrentLocation"],
    [".shuttle-module .left-section-title", "shuttleTitle"],
    ["label[for='shuttleFrom']", "shuttleFrom"],
    ["label[for='shuttleTo']", "shuttleTo"],
    [".shuttle-result span", "shuttleNext"],
    ["#shuttleSource", "shuttleSource"],
    [".recommendation-module .left-section-title", "studySpaces"],
    ["label[for='scenario']", "preference"],
    [".field-row span", "walkingComfortLimit"],
    ["#updateRecommendations", "updateRecommendations"],
    [".agent-module .left-section-title", "travelAgent"],
    ["#summaryTitle", "summaryTitle"],
    ["#agentToolsTile span", "agentModeTools"],
    ["label[for='userQuestion']", "askAgent"],
    ["#askButton", "ask"],
    ["#routePreviewTitle", "routeMap"],
    [".route-endpoints div:first-child span", "start"],
    [".route-endpoints div:last-child span", "destination"],
    ["label[for='routeModeSelect']", "transportMode"],
    ["#routeUpdateButton", "update"],
    ["#routeFullscreenButton", routeMapFullscreen ? "exitFullScreen" : "fullScreen"],
    ["#googleMapsLink", "openGoogleMaps"],
    ["#openChatButton", "continueChat"],
    [".how-it-works .eyebrow", "howItWorks"],
    [".how-grid div:nth-child(1) strong", "how1Title"],
    [".how-grid div:nth-child(1) span", "how1Body"],
    [".how-grid div:nth-child(2) strong", "how2Title"],
    [".how-grid div:nth-child(2) span", "how2Body"],
    [".how-grid div:nth-child(3) strong", "how3Title"],
    [".weather-module .eyebrow", "weather"],
    [".weather-action-label", "updateWeatherAt"],
    ["#updateWeatherCurrentButton", "currentLocation"],
    ["#updateWeatherMapButton", "mapSelection"],
    ["#updateWeatherDestinationButton", "destinationButton"],
    [".weather-summary-label", "aiSummary"],
    [".weather-metric-card[data-weather-metric='feelsLike'] span", "feelsLike"],
    [".weather-metric-card[data-weather-metric='humidity'] span", "humidity"],
    [".weather-metric-card[data-weather-metric='wind'] span", "wind"],
    [".weather-metric-card[data-weather-metric='uv'] span", "uv"],
    [".weather-metric-card[data-weather-metric='precipitation'] span", "precipitation"],
    [".tfl-module .eyebrow", "tflStatus"],
    ["#refreshTflStatus", "refresh"],
    [".chat-modal-header .eyebrow", "conversation"],
    ["#chatModalTitle", "agentChat"],
    ["#closeChatButton", "close"],
    ["#modalAskButton", "send"],
    ["#confirmOpenLink", "openNewTab"],
    ["#cancelOpenLink", "cancel"],
    ["#externalConfirmTitle", "externalConfirmTitle"],
    ["#startupWaitText .modal-info-title", "startupWaitTitle"],
    ["#closeToolInfo", "close"],
    [".footer-useful-links-title", "usefulLinks"],
    [".sig-note", "footerNote"],
  ];
  textMap.forEach(([selector, key]) => setElementText(selector, t(key)));

  const how3Body = document.querySelector(".how-grid div:nth-child(3) span");
  if (how3Body) {
    how3Body.innerHTML = t("how3Body");
  }

  setElementText("#weatherScopePrefix", t("atYour"));
  const questionInput = $("userQuestion");
  if (questionInput) questionInput.placeholder = t("questionPlaceholder");
  const modalInput = $("modalUserQuestion");
  if (modalInput) modalInput.placeholder = t("modalPlaceholder");
  $("walkDecrease")?.setAttribute("aria-label", currentLanguage === "zh" ? "减少步行舒适上限" : "Decrease walking comfort limit");
  $("walkIncrease")?.setAttribute("aria-label", currentLanguage === "zh" ? "增加步行舒适上限" : "Increase walking comfort limit");
  document.querySelector(".walk-stepper")?.setAttribute("aria-label", t("walkingComfortLimit"));
  updateLlmModelHint();
  refreshActiveToolInfo();

  const startOptions = {
    mapSelection: t("mapSelection"),
    southKensington: "South Kensington",
    whiteCity: "White City",
    hammersmith: "Hammersmith",
    stMarys: "St Mary's",
  };
  document.querySelectorAll("#startPoint option").forEach((option) => {
    option.textContent = startOptions[option.value] || option.textContent;
  });
  document.querySelectorAll("#shuttleFrom option, #shuttleTo option").forEach((option) => {
    option.textContent = startOptions[option.value] || option.textContent;
  });
  const scenarioOptions = {
    focus: t("quietSpace"),
    group: t("groupWork"),
    late: t("lateNightWork"),
    nearest: t("nearestSeat"),
  };
  document.querySelectorAll("#scenario option").forEach((option) => {
    option.textContent = scenarioOptions[option.value] || option.textContent;
  });

  const quickPrompts = [
    ["quickWhiteCity", "quickWhiteCityQuestion"],
    ["quickLibrary", "quickLibraryQuestion"],
    ["quickWeather", "quickWeatherQuestion"],
    ["quickTfl", "quickTflQuestion"],
  ];
  document.querySelectorAll(".quick-prompts button").forEach((button, index) => {
    const config = quickPrompts[index];
    if (!config) return;
    button.textContent = t(config[0]);
    button.dataset.question = t(config[1]);
  });

  const placeholder = document.querySelector(".agent-answer-placeholder-text");
  if (placeholder) placeholder.textContent = t("agentPlaceholder");
  if ($("weatherTemperature")?.textContent === "Weather not loaded" || $("weatherTemperature")?.textContent === "天气尚未加载") {
    $("weatherTemperature").textContent = t("weatherNotLoaded");
  }
  if ($("weatherDay")?.textContent === "Today" || $("weatherDay")?.textContent === "今天") {
    $("weatherDay").textContent = t("today");
  }
  if ($("weatherDescription")?.textContent) {
    const current = $("weatherDescription").textContent;
    if (current.includes("Use your selected") || current.includes("可使用")) $("weatherDescription").textContent = t("weatherHint");
  }
  if ($("weatherSummary")?.textContent.includes("Waiting") || $("weatherSummary")?.textContent.includes("等待")) {
    $("weatherSummary").textContent = t("waitingWeather");
  }
  if ($("weatherMeta")?.textContent.includes("Waiting") || $("weatherMeta")?.textContent.includes("等待")) {
    $("weatherMeta").textContent = t("waitingWeather");
  }
  updateHowItWorksToggle();
  updateRecommendationLoadMoreButton();
  updateOutputs();
  setWeatherScope(lastWeatherScope, lastWeatherScopeLocation);
  updateAgentModeSignal(integrationStatus.tools, false);
}

function setElementText(selector, text) {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
}

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

  if (isLocalPage()) {
    if (window.location.port && window.location.port !== "8001") {
      return "http://localhost:8001";
    }
    return "";
  }

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

function formatModelDisplayName(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text === "Qwen/Qwen3-235B-A22B-Instruct-2507-tput") return "Qwen3 235B";
  if (text === "Qwen 235B") return "Qwen3 235B";
  if (text === "zai-org/GLM-5") return "GLM-5";
  const slashIndex = text.indexOf("/");
  return slashIndex >= 0 ? text.slice(slashIndex + 1) || text : text;
}

function normalizeChatModelOption(option) {
  if (!option || typeof option !== "object") return null;
  const id = String(option.id || "").trim();
  const model = String(option.model || "").trim();
  if (!id || !model) return null;
  return {
    id,
    label: formatModelDisplayName(String(option.label || "").trim() || model),
    description: String(option.description || "").trim(),
    model,
    available: option.available !== false,
  };
}

function getChatModelOptions() {
  return chatModelOptions.filter((option) => option.available !== false);
}

function getChatModelOptionById(modelId = selectedChatModelId) {
  return getChatModelOptions().find((option) => option.id === modelId) || null;
}

function getActiveChatModelOption() {
  return getChatModelOptionById(selectedChatModelId)
    || getChatModelOptionById(defaultChatModelId)
    || getChatModelOptions()[0]
    || null;
}

function getRequestedChatModelId() {
  return getActiveChatModelOption()?.id || "";
}

function updateLlmModelHint() {
  const activeModel = getActiveChatModelOption();
  if (activeModel) {
    integrationStatus.llm = activeModel.label;
  }
}

function setSelectedChatModel(modelId, options = {}) {
  const nextModel = getChatModelOptionById(modelId);
  if (!nextModel) return;
  selectedChatModelId = nextModel.id;
  updateLlmModelHint();
  render();
  if (options.refreshModal !== false) refreshActiveToolInfo();
}

function clearLatestAnswerModelLabel() {
  latestAnswerModelLabel = "";
}

function setLatestAnswerModelLabel(value) {
  latestAnswerModelLabel = formatModelDisplayName(value);
}

function renderAnswerWithModelMeta(markdownHtml) {
  const metaHtml = latestAnswerModelLabel
    ? `<div class="agent-answer-model-note">${escapeHtml(t("answerModelLabel", { model: latestAnswerModelLabel }))}</div>`
    : "";
  return `<div class="agent-answer-output">${markdownHtml}</div>${metaHtml}`;
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
  walkDecrease: $("walkDecrease"),
  walkIncrease: $("walkIncrease"),
  shuttleFrom: $("shuttleFrom"),
  shuttleTo: $("shuttleTo"),
};

const SHUTTLE_CAMPUS_ORDER = {
  eastbound: ["hammersmith", "whiteCity", "southKensington"],
  westbound: ["southKensington", "whiteCity", "hammersmith"],
};
const SHUTTLE_CAMPUSES = ["southKensington", "whiteCity", "hammersmith"];
const SHUTTLE_CAMPUS_SYNC_RADIUS_KM = 2;

const SHUTTLE_TIMETABLE = {
  eastbound: {
    hammersmith: [
      "07:30", "08:00", "08:30", "09:00", "09:30", "10:00",
      "10:30", "11:00", "11:30", "12:00", "12:30", "13:00",
      "13:30", "14:00", "14:30", "15:00", "15:30", "16:00",
      "16:30",
    ],
    whiteCity: [
      "07:40", "08:10", "08:40", "09:10", "09:40", "10:10",
      "10:40", "11:10", "11:40", "12:10", "12:40", "13:10",
      "13:40", "14:10", "14:40", "15:10", "15:40", "16:10",
      "16:40", "17:30", "18:15",
    ],
  },
  westbound: {
    southKensington: [
      "08:15", "08:45", "09:15", "09:45", "10:15", "10:45",
      "11:15", "11:55", "12:25", "12:55", "13:15", "13:45",
      "14:15", "14:45", "15:15", "15:45", "16:15", "16:45",
      "17:15", "18:00",
    ],
    whiteCity: [
      "08:50", "09:20", "09:50", "10:20", "10:50", "11:20",
      "11:50", "12:20", "12:50", "13:20", "13:50", "14:20",
      "14:50", "15:20", "15:50", "16:20", "16:50", "17:20",
    ],
  },
};

const preferenceWeights = {
  speed: 70,
  calm: 65,
  comfort: 75,
  budget: 45,
};

const RECOMMENDATION_DISTANCE_LIMIT_KM = 50;
const RECOMMENDATION_COLLAPSED_LIMIT = 2;
const RECOMMENDATION_EXPANDED_LIMIT = 5;
let latestRanked = [];
let latestAvailableRecommendations = [];
let recommendationDisplayLimit = RECOMMENDATION_COLLAPSED_LIMIT;
let routeRequestId = 0;
let routeStatus = "Routes on demand";
let routeUpdatedAt = "Estimate";
let integrationStatus = {
  llm: "Checking",
  routes: "Checking",
  maps: "Checking",
  mcp: "Checking",
  tools: "Pending",
};
let chatModelOptions = [];
let defaultChatModelId = "";
let selectedChatModelId = "";
let activeToolInfoKind = "";
let activeToolInfoOverrideContent = "";
let latestAnswerModelLabel = "";
let startMap = null;
let startMarker = null;
let routeMap = null;
let routePolylines = [];
let routeMarkers = [];
let routeStopOverlay = null;
let routeStopOverlayCloseTimer = null;
let pendingRoutePreview = null;
let activeRoutePreview = null;
let routeMapFullscreen = false;
let routeMapPlaceholder = null;
let googleMapsLoading = false;
let routesKeyConfigured = false;
let googleMapsBrowserKey = "";
let weatherRequestId = 0;
let weatherUpdatedForKey = "";
let weatherSummaryRequestId = 0;
let weatherSummaryUpdatedForKey = "";
let lastWeatherScope = "current location";
let lastWeatherScopeLocation = "";
let latestWeatherData = null;
let latestWeatherStart = null;
// When true, selecting or setting a start point will auto-refresh weather.
// Set to false to require the user to click the "Update weather data at" buttons.
let autoRefreshWeatherOnSelect = true;
let tflStatusRequestId = 0;
let latestTflStatusData = null;
let latestNavigationData = null;
const chatHistory = [];
let lastAnimatedChatMessageKey = "";
let startupWaitModalShown = false;
let startupWaitModalTimer = null;
const INTEGRATION_RETRY_BASE_MS = 1500;
const INTEGRATION_RETRY_MAX_MS = 12000;
let integrationRetryDelayMs = INTEGRATION_RETRY_BASE_MS;
let integrationRetryTimer = null;
let weatherAutoRefreshRequested = false;
// Streamed answers render on animation frames so text flows continuously instead
// of popping in as visibly separate chunks.
const STREAM_RENDER_FRAME_DELAY_MS = 16;
const STREAM_RENDER_BASE_CPS = 130;
const STREAM_RENDER_MAX_FRAME_CHARS = 18;
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

  const speedScore = 96 - normalise(adjustedTransit, 10, 62) * 0.78;
  const calmScore = place.tags.includes("quiet") ? 90 : 66;
  const comfortScore = Math.max(34, Math.min(94, place.comfort - rainPenalty - walkingPenalty + matchScore));
  const budgetScore = Math.max(50, Math.min(85, 60 + (place.budget - 45) * 0.4));

  const weightedTotal =
    speedScore * weights.speed +
    calmScore * weights.calm +
    comfortScore * weights.comfort +
    budgetScore * weights.budget;
  const normalisedTotal = Math.max(0, Math.min(100, weightedTotal));
  const total = 100 * Math.pow(normalisedTotal / 100, 1.25);

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
  if (rainPenalty > 10) return { label: currentLanguage === "zh" ? "天气风险" : "Weather risk", className: "warning" };
  if (transit > 48) return { label: currentLanguage === "zh" ? "路程较远" : "Long journey", className: "caution" };
  if (walkingPenalty > 0) return { label: currentLanguage === "zh" ? "超过步行上限" : "Over walk limit", className: "caution" };
  if (place.budget < 62) return { label: currentLanguage === "zh" ? "费用权衡" : "Cost trade-off", className: "caution" };
  return { label: currentLanguage === "zh" ? "匹配度高" : "Good fit", className: "ok" };
}

function getDecision(place, context, transit, rainPenalty) {
  if (rainPenalty > 10 && place.tags.includes("outdoor")) {
    return currentLanguage === "zh" ? "雨天不太理想。" : "Less ideal in wet weather.";
  }
  if (transit < 26 && place.comfort > 80) {
    return currentLanguage === "zh" ? "距离近，舒适度高。" : "Short trip, high comfort.";
  }
  if (transit < 20) {
    return currentLanguage === "zh" ? "路程短，整体匹配。" : "A solid match with short travel.";
  }
  return currentLanguage === "zh" ? "附近较合适的选择。" : "A solid match nearby.";
}

function render() {
  updateOutputs();

  const context = getContext();

  $("llmSignal").textContent = translateStatusText(integrationStatus.llm);
  $("routesSignal").textContent = translateStatusText(integrationStatus.routes);
  const mapsSig = $("mapsSignal"); if (mapsSig) mapsSig.textContent = translateStatusText(integrationStatus.maps);
  const mcpSig = $("mcpSignal"); if (mcpSig) mcpSig.textContent = translateStatusText(integrationStatus.mcp);
  updateAgentModeSignal(integrationStatus.tools, false);
  maybeShowStartupWaitModal();

  latestAvailableRecommendations = places
    .map((place) => scorePlace(place, context))
    .sort((a, b) => b.total - a.total)
    .filter((place) => place.adjustedDistance <= RECOMMENDATION_DISTANCE_LIMIT_KM);
  latestRanked = latestAvailableRecommendations.slice(0, recommendationDisplayLimit);

  $("recommendations").innerHTML = latestRanked.length
    ? latestRanked.map(renderCard).join("")
    : renderRecommendationEmptyState();
  updateRecommendationLoadMoreButton();
}

function updateRecommendationLoadMoreButton() {
  const button = $("loadMoreStudySpaces");
  if (!button) return;
  const hasMoreRecommendations = latestAvailableRecommendations.length > latestRanked.length;
  button.hidden = !hasMoreRecommendations;
  if (!hasMoreRecommendations) {
    button.setAttribute("aria-expanded", String(recommendationDisplayLimit > RECOMMENDATION_COLLAPSED_LIMIT));
    return;
  }
  if (recommendationDisplayLimit > RECOMMENDATION_COLLAPSED_LIMIT) {
    button.textContent = t("collapseStudySpaces");
    button.setAttribute("aria-expanded", "true");
    button.disabled = false;
    return;
  }
  button.textContent = t("loadMoreStudySpaces");
  button.setAttribute("aria-expanded", "false");
  button.disabled = false;
}

function renderRecommendationEmptyState() {
  return `
    <p class="recommendation-empty" role="status">${t("studySpacesTooFar", { distance: RECOMMENDATION_DISTANCE_LIMIT_KM })}</p>
  `;
}

function collapseHowItWorks() {
  const section = $("howItWorks");
  const button = $("expandHowItWorks");
  if (!section || !button) return;
  section.hidden = true;
  button.hidden = false;
  updateHowItWorksToggle();
}

function updateHowItWorksToggle() {
  const section = $("howItWorks");
  const button = $("expandHowItWorks");
  if (!section || !button) return;
  const isExpanded = !section.hidden;
  button.textContent = isExpanded ? t("collapseIntro") : t("expandIntro");
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
  integrationStatus.maps = browserReady ? "Browser key ready" : "Browser key missing";
  integrationStatus.routes = formatApiKeysStatus(browserReady, routesReady);
  const routesEl = $("routesSignal");
  if (routesEl) routesEl.textContent = translateStatusText(integrationStatus.routes);
  const mapsEl = $("mapsSignal"); if (mapsEl) mapsEl.textContent = translateStatusText(integrationStatus.maps);
}

function formatApiKeysStatus(browserReady, routesReady) {
  const missing = [];
  if (!browserReady) missing.push("Browser key missing");
  if (!routesReady) missing.push("Routes key missing");
  return missing.length ? missing.join(" · ") : "Keys Ready";
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
  const zh = currentLanguage === "zh";
  if (type.includes("THUNDER")) return zh ? "雷暴" : "Stormy";
  if (type.includes("RAIN") || type.includes("DRIZZLE")) return zh ? "有雨" : "Rainy";
  if (type.includes("SNOW") || type.includes("ICE")) return zh ? "降雪" : "Snowy";
  if (type.includes("FOG") || type.includes("HAZE") || type.includes("MIST")) return zh ? "低能见度" : "Foggy";
  if (type.includes("CLOUD")) return zh ? "多云" : "Cloudy";
  return isDaytime === false ? (zh ? "夜间" : "Night") : (zh ? "晴朗" : "Sunny");
}

function setWeatherLoading(message = currentLanguage === "zh" ? "正在加载天气数据..." : "Loading weather data...") {
  weatherSummaryRequestId += 1;
  [$("updateWeatherCurrentButton"), $("updateWeatherMapButton"), $("updateWeatherDestinationButton")].forEach((button) => {
    if (!button) return;
    button.disabled = true;
  });
  $("weatherTemperature").textContent = "--";
  $("weatherDescription").textContent = "";
  $("weatherDescription").hidden = true;
  setWeatherSummaryLoading("");
  $("weatherMeta").textContent = currentLanguage === "zh" ? "正在从 Google Weather API 获取当前天气。" : "Fetching current conditions from Google Weather API.";
}

function setWeatherButtonReady() {
  const currentButton = $("updateWeatherCurrentButton");
  const mapButton = $("updateWeatherMapButton");
  const destinationButton = $("updateWeatherDestinationButton");
  if (currentButton) {
    currentButton.disabled = false;
    currentButton.textContent = t("currentLocation");
  }
  if (mapButton) {
    mapButton.disabled = false;
    mapButton.textContent = t("mapSelection");
  }
  if (destinationButton) {
    destinationButton.disabled = false;
    destinationButton.textContent = t("destinationButton");
  }
}

function setWeatherScope(scope = "start point", locationName = "") {
  const label = $("weatherScopeLabel");
  if (!label) return;
  lastWeatherScope = scope;
  lastWeatherScopeLocation = locationName;
  const isDestination = scope === "destination";
  const isCurrentLocation = scope === "current location";
  const cleanLocationName = String(locationName || "").trim();
  label.textContent = isDestination && cleanLocationName
    ? `${t("destination").toLowerCase()}: ${cleanLocationName}`
    : (isDestination ? t("destination").toLowerCase() : (isCurrentLocation ? t("currentLocation") : t("startPoint")));
  label.classList.toggle("destination", isDestination);
  $("updateWeatherCurrentButton")?.classList.toggle("is-active", isCurrentLocation);
  $("updateWeatherMapButton")?.classList.toggle("is-active", scope === "start point");
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
  latestWeatherData = data;
  latestWeatherStart = start;
  const weatherScope = ["current location", "destination", "start point"].includes(start?.weatherScope)
    ? start.weatherScope
    : "start point";
  setWeatherScope(weatherScope, start?.label);
  const weatherCard = $("weatherCard");
  if (weatherCard) {
    weatherCard.classList.remove("weather-card--loading");
    animateClass(weatherCard, "weather-card--reveal");
  }
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
  const time = data?.currentTime ? new Date(data.currentTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : (currentLanguage === "zh" ? "刚刚" : "just now");
  $("weatherMeta").textContent = currentLanguage === "zh"
    ? `${start.label || "已选出发点"} · ${start.lat.toFixed(4)}, ${start.lng.toFixed(4)} · 更新于 ${time}`
    : `${start.label || "Selected start point"} · ${start.lat.toFixed(4)}, ${start.lng.toFixed(4)} · Updated ${time}`;
  setWeatherSummaryLoading(currentLanguage === "zh" ? "正在生成天气简报" : "Generating a short weather summary");
  void refreshWeatherSummary(data, start);
}

function renderWeatherError(message) {
  weatherSummaryRequestId += 1;
  const weatherCard = $("weatherCard");
  if (weatherCard) {
    weatherCard.classList.remove("weather-card--loading");
    animateClass(weatherCard, "weather-card--reveal");
  }
  const fallbackSummary = buildWeatherFallbackSummary(null, null, message);
  $("weatherDay").textContent = t("today");
  $("weatherIcon").textContent = "--";
  $("weatherTemperature").textContent = currentLanguage === "zh" ? "天气不可用" : "Weather unavailable";
  $("weatherDescription").textContent = message;
  $("weatherDescription").hidden = false;
  $("weatherFeelsLike").textContent = "--";
  $("weatherHumidity").textContent = "--";
  $("weatherWind").textContent = "--";
  $("weatherUv").textContent = "--";
  $("weatherPrecipitation").textContent = "--";
  setWeatherSummary(fallbackSummary);
  $("weatherMeta").textContent = currentLanguage === "zh" ? "请确认 Google Maps 浏览器密钥已启用 Weather API。" : "Check that Weather API is enabled for your Google Maps browser key.";
}

function buildWeatherFallbackSummary(data, start, errorMessage = "") {
  const zh = currentLanguage === "zh";
  if (errorMessage) return zh ? "当前天气详情暂不可用，应用会稍后再次尝试获取。" : "Weather details are currently unavailable, but the app will try again shortly.";
  const condition = String(data?.weatherCondition?.description?.text || "weather").toLowerCase();
  const temp = Number(data?.temperature?.degrees);
  const feelsLike = Number(data?.feelsLikeTemperature?.degrees);
  const windSpeed = Number(data?.wind?.speed?.value);
  const pieces = [];

  if (condition.includes("rain") || condition.includes("drizzle")) pieces.push(zh ? "有雨，路面可能湿滑" : "Wet conditions");
  else if (condition.includes("cloud")) pieces.push(zh ? "云量较多" : "Cloudy skies");
  else if (condition.includes("sun") || condition.includes("clear")) pieces.push(zh ? "天气明亮" : "Bright weather");
  else if (condition.includes("snow")) pieces.push(zh ? "天气寒冷并可能有雪" : "Cold, wintry weather");
  else if (condition.includes("fog") || condition.includes("mist") || condition.includes("haze")) pieces.push(zh ? "能见度偏低" : "Low visibility");
  else pieces.push(zh ? "当前天气状况" : "Current conditions");

  if (Number.isFinite(temp)) pieces.push(zh ? `约 ${Math.round(temp)}°C` : `around ${Math.round(temp)}°C`);
  if (Number.isFinite(feelsLike) && Math.abs(feelsLike - temp) >= 2) pieces.push(zh ? `体感 ${Math.round(feelsLike)}°C` : `feels like ${Math.round(feelsLike)}°C`);
  if (Number.isFinite(windSpeed)) pieces.push(zh ? `风速约 ${Math.round(windSpeed)} km/h` : `with a ${Math.round(windSpeed)} km/h breeze`);

  const location = start?.label ? (zh ? `，位置在 ${start.label} 附近` : ` near ${start.label}`) : "";
  return zh ? `${pieces.join("，")}${location}。` : `${pieces.join(", ")}${location}.`;
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
  const summaryEl = $("weatherSummary");
  if (!summaryEl) return;
  summaryEl.innerHTML = renderWeatherSummaryMarkdown(value);
  animateClass(summaryEl, "weather-summary--reveal");
}

function setWeatherSummaryLoading(message = "Generating a short weather summary") {
  const label = String(message || "").trim();
  $("weatherSummary").innerHTML = `
    <span class="weather-summary-loading" role="status" aria-live="polite">
      ${label ? `<span class="weather-summary-loading-text">${escapeHtml(label)}</span>` : ""}
      <span class="weather-summary-loading-dots" aria-hidden="true"><span></span><span></span><span></span></span>
    </span>
  `;
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
  const summaryKey = `${currentLanguage}:${start?.lat?.toFixed?.(5) || ""},${start?.lng?.toFixed?.(5) || ""}:${data?.currentTime || ""}:${data?.weatherCondition?.description?.text || ""}`;
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
        question: currentLanguage === "zh"
          ? "请用自然、简短的中文为天气卡片写 1-2 句话天气简报。不要使用 Markdown 标题。"
          : "Write a short, natural weather summary for the weather card in 1-2 sentences. Do not use Markdown headings.",
        context: {
          task: "weather_summary",
          language: currentLanguage === "zh" ? "Chinese" : "English",
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
  animateClass($("weatherCard"), "weather-card--loading");
  setWeatherLoading(currentLanguage === "zh"
    ? `正在查询天气...`
    : `Checking weather...`);
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

function tflStatusClass(severity) {
  if (Number(severity) >= 10) return "is-good";
  if (Number(severity) >= 8) return "is-warning";
  return "is-disrupted";
}

function tflLineColor(id) {
  const colors = {
    bakerloo: "#B36305",
    central: "#E32017",
    circle: "#FFD300",
    district: "#00782A",
    dlr: "#00A4A7",
    elizabeth: "#6950A1",
    "hammersmith-city": "#F3A9BB",
    jubilee: "#A0A5A9",
    liberty: "#61686B",
    lioness: "#FFA600",
    metropolitan: "#9B0056",
    mildmay: "#006FE6",
    northern: "#000000",
    piccadilly: "#003688",
    suffragette: "#18A95D",
    tram: "#84B817",
    victoria: "#0098D4",
    "waterloo-city": "#95CDBA",
    weaver: "#9B1B30",
    windrush: "#E2231A",
  };
  return colors[id] || "#2767a8";
}

function sortTflLines(lines) {
  const order = [
    "bakerloo",
    "central",
    "circle",
    "district",
    "hammersmith-city",
    "jubilee",
    "metropolitan",
    "northern",
    "piccadilly",
    "victoria",
    "waterloo-city",
    "elizabeth",
    "dlr",
    "liberty",
    "lioness",
    "mildmay",
    "suffragette",
    "weaver",
    "windrush",
    "tram",
  ];
  const index = new Map(order.map((id, position) => [id, position]));
  return [...lines].sort((first, second) => {
    const firstIsGood = Number(first.severity) >= 10;
    const secondIsGood = Number(second.severity) >= 10;
    if (firstIsGood !== secondIsGood) return firstIsGood ? 1 : -1;

    const firstIndex = index.has(first.id) ? index.get(first.id) : 999;
    const secondIndex = index.has(second.id) ? index.get(second.id) : 999;
    return firstIndex - secondIndex || String(first.name || "").localeCompare(String(second.name || ""));
  });
}

function formatTflMode(mode) {
  const labels = currentLanguage === "zh" ? {
    "elizabeth-line": "伊丽莎白线",
    dlr: "DLR",
    overground: "地上铁",
    tram: "有轨电车",
    tube: "地铁",
  } : {
    "elizabeth-line": "Elizabeth line",
    dlr: "DLR",
    overground: "Overground",
    tram: "Tram",
    tube: "Tube",
  };
  return labels[mode] || mode || "TfL";
}

function translateTflStatus(status) {
  const text = String(status || "Unknown").trim();
  if (currentLanguage !== "zh") return text;
  const labels = {
    "Good Service": "正常运营",
    "Minor Delays": "轻微延误",
    "Severe Delays": "严重延误",
    "Part Closure": "部分关闭",
    "Part Closed": "部分关闭",
    "Planned Closure": "计划关闭",
    "Suspended": "暂停运营",
    "Part Suspended": "部分暂停",
    "Service Closed": "服务关闭",
    "Reduced Service": "班次减少",
    "Special Service": "特殊运营",
    "Bus Service": "巴士服务",
    "No Step Free Access": "无无障碍通行",
    "Information": "运营信息",
    "Closure": "关闭",
    "Unknown": "未知状态",
  };
  return labels[text] || text;
}

function translateTflReason(reason) {
  const original = String(reason || "").trim();
  if (!original || currentLanguage !== "zh") return original;
  const exact = {
    "Good service": "正常运营。",
    "Good Service": "正常运营。",
    "Part Closure": "部分关闭。",
    "Part closure": "部分关闭。",
    "Minor Delays": "轻微延误。",
    "Severe Delays": "严重延误。",
  };
  if (exact[original]) return exact[original];
  const structured = translateStructuredTflReason(original);
  if (structured) return structured;
  return translateTflGeneralReason(original)
    .replace(/\s+([，。：；,.])/g, "$1")
    .replace(/([，。：；])\s+/g, "$1");
}

function translateTflGeneralReason(reason) {
  return String(reason || "")
    .replace(/\bGood service\b/gi, "正常运营")
    .replace(/\bPart Closure\b/gi, "部分关闭")
    .replace(/\bPart closure\b/gi, "部分关闭")
    .replace(/\bMinor Delays\b/gi, "轻微延误")
    .replace(/\bSevere Delays\b/gi, "严重延误")
    .replace(/\bSuspended\b/gi, "暂停运营")
    .replace(/\bReduced Service\b/gi, "班次减少")
    .replace(/\bservice operates\b/gi, "服务运行时间为")
    .replace(/\bservices? operate(?:s)?\b/gi, "服务运行")
    .replace(/\bThere is no service\b/gi, "没有服务")
    .replace(/\bThere will be no service\b/gi, "将没有服务")
    .replace(/\bThere will also be no\b/gi, "也将没有")
    .replace(/\bNo service\b/gi, "无服务")
    .replace(/\bPlanned closure\b/gi, "计划关闭")
    .replace(/\bThere is\b/gi, "有")
    .replace(/\bThere are\b/gi, "有")
    .replace(/\ban earlier points failure\b/gi, "早前发生的道岔故障")
    .replace(/\bpoints failure\b/gi, "道岔故障")
    .replace(/\bearlier points failure\b/gi, "早前发生的道岔故障")
    .replace(/\bplanned engineering works?\b/gi, "计划性工程维护")
    .replace(/\bengineering works?\b/gi, "工程维护")
    .replace(/\btrack fault\b/gi, "轨道故障")
    .replace(/\bsignal failure\b/gi, "信号故障")
    .replace(/\bsignal system failure\b/gi, "信号系统故障")
    .replace(/\btrain cancellations?\b/gi, "列车取消")
    .replace(/\bshortage of trains?\b/gi, "列车不足")
    .replace(/\bshortage of train crew\b/gi, "列车工作人员不足")
    .replace(/\bfaulty train\b/gi, "列车故障")
    .replace(/\bcustomer incident\b/gi, "乘客事件")
    .replace(/\bpassenger incident\b/gi, "乘客事件")
    .replace(/\boperational restrictions?\b/gi, "运营限制")
    .replace(/\bemergency services deal with a casualty on the track\b/gi, "应急服务正在处理轨道上的伤亡事件")
    .replace(/\ba casualty on the track\b/gi, "轨道上的伤亡事件")
    .replace(/\bon the rest of the line\b/gi, "其余区段")
    .replace(/\bMonday to Friday only\b/gi, "仅限周一至周五")
    .replace(/\bMonday to Thursday\b/gi, "周一至周四")
    .replace(/\bMonday to Friday\b/gi, "周一至周五")
    .replace(/\bSaturday and Sunday\b/gi, "周六和周日")
    .replace(/\bSaturdays and Sundays\b/gi, "周六和周日")
    .replace(/\bSaturdays\b/gi, "周六")
    .replace(/\bSundays\b/gi, "周日")
    .replace(/\bbank\/public holidays\b/gi, "银行假日和公共假日")
    .replace(/\bbank holidays\b/gi, "银行假日")
    .replace(/\bpublic holidays\b/gi, "公共假日")
    .replace(/\bweekdays\b/gi, "工作日")
    .replace(/\bweekends\b/gi, "周末")
    .replace(/\bservices instead\b/gi, "服务")
    .replace(/\bservices\b/gi, "服务")
    .replace(/\bservice\b/gi, "服务")
    .replace(/\bcontinue to serve\b/gi, "继续服务")
    .replace(/\bwill continue\b/gi, "将继续")
    .replace(/\bPlease use\b/gi, "请改用")
    .replace(/\bUse local bus routes\b/gi, "请改用当地公交线路")
    .replace(/\bwhile\b/gi, "期间")
    .replace(/\bwith be\b/gi, "将在")
    .replace(/\bwill be\b/gi, "将在")
    .replace(/\bnext southbound train\b/gi, "下一班南行列车")
    .replace(/\bdeparture\b/gi, "发车")
    .replace(/\bfrom\b/gi, "从")
    .replace(/\bto\b/gi, "至")
    .replace(/\bon\b/gi, "在")
    .replace(/\bbetween\b/gi, "在")
    .replace(/\band\b/gi, "和")
    .replace(/\bdue to\b/gi, "原因：")
    .replace(/\bbecause of\b/gi, "原因：")
    .replace(/\buntil\b/gi, "持续至");
}

function translateStructuredTflReason(reason) {
  const statusPattern = "(Good service|Minor delays|Severe delays|Part closure|Part Closure|Planned closure|No service|Suspended|Part suspended|Reduced service)";
  const serviceHoursMatch = reason.match(/^([^:]+Line):\s*service operates\s+(.+?)\s+(?:to|until)\s+(.+?),\s*(Monday to Friday only)\.\s*There is no service on\s+(.+?)\.$/i);
  if (serviceHoursMatch) {
    const [, lineName, fromTime, toTime, days, noServiceDays] = serviceHoursMatch;
    return `${lineName}：服务运行时间为 ${fromTime} 至 ${toTime}，${translateTflGeneralReason(days)}。${translateTflDayList(noServiceDays)}没有服务。`;
  }

  const datedClosureMatch = reason.match(/^([^:]+):\s*(.+?),\s*no service between\s+(.+?)\s+and\s+(.+?)\.\s*(.*)$/i);
  if (datedClosureMatch) {
    const [, lineName, dateText, from, to, rest] = datedClosureMatch;
    const parts = [`${lineName}：${translateTflDateText(dateText)}，${from} 至 ${to} 之间无服务。`];
    const translatedRest = translateTflServiceSentences(rest);
    if (translatedRest) parts.push(translatedRest);
    return parts.join("");
  }

  const multipleMinorMatch = reason.match(/^([^:]+Line):\s*Minor delays between\s+(.+?)\s+and\s+(.+?)\s+and\s+MINOR DELAYS between\s+(.+?)\s+and\s+(.+?)\s+due to\s+(.+?)\.\s*(?:GOOD SERVICE on the rest of the line\.?)?$/i);
  if (multipleMinorMatch) {
    const [, lineName, fromA, toA, fromB, toB, cause] = multipleMinorMatch;
    const restText = /good service\s+on\s+the\s+rest\s+of\s+the\s+line/i.test(reason) ? "其余区段正常运营。" : "";
    return `${lineName}：${fromA} 至 ${toA} 之间轻微延误，${fromB} 至 ${toB} 之间也有轻微延误，原因是${translateTflCause(cause)}。${restText}`;
  }

  const noServiceWhileMatch = reason.match(/^([^:]+Line):\s*No service between\s+(.+?)\s+and\s+(.+?)\s+while\s+(.+?)\.\s*(.*)$/i);
  if (noServiceWhileMatch) {
    const [, lineName, from, to, cause, rest] = noServiceWhileMatch;
    const translatedRest = translateTflServiceSentences(rest);
    return `${lineName}：${from} 至 ${to} 之间无服务，原因是${translateTflGeneralReason(cause)}。${translatedRest}`;
  }

  const trainGapMatch = reason.match(/^([^:]+Line):\s*Minor delays between\s+(.+?)\s+and\s+(.+?)\s+due to train cancellations\.\s*After the\s+(.+?)\s+departure from\s+(.+?)\s+the next southbound train (?:with be|will be) at\s+(.+?)\.?\s*(?:GOOD SERVICE on the rest of the line\.?)?$/i);
  if (trainGapMatch) {
    const [, lineName, from, to, departureTime, departureStation, nextTime] = trainGapMatch;
    const restText = /good service\s+on\s+the\s+rest\s+of\s+the\s+line/i.test(reason) ? "其余区段正常运营。" : "";
    return `${lineName}：${from} 至 ${to} 之间轻微延误，原因是列车取消。${departureTime} 从 ${departureStation} 发车后，下一班南行列车将在 ${nextTime} 发车。${restText}`;
  }

  const betweenPattern = new RegExp(`^([^:]+Line):\\s*${statusPattern}\\s+between\\s+(.+?)\\s+and\\s+(.+?)(?:\\s+due to\\s+(.+?))?\\.?(?:\\s+(?:GOOD SERVICE|Good service)\\s+on\\s+the\\s+rest\\s+of\\s+the\\s+line\\.?)?$`, "i");
  const betweenMatch = reason.match(betweenPattern);
  if (betweenMatch) {
    const [, lineName, status, from, to, cause] = betweenMatch;
    const causeText = cause ? `，原因是${translateTflCause(cause)}` : "";
    const restText = /good service\s+on\s+the\s+rest\s+of\s+the\s+line/i.test(reason) ? "。其余区段正常运营。" : "。";
    return `${lineName}：${from} 至 ${to} 之间${translateTflInlineStatus(status)}${causeText}${restText}`;
  }

  const simplePattern = new RegExp(`^([^:]+Line):\\s*${statusPattern}\\.?$`, "i");
  const simpleMatch = reason.match(simplePattern);
  if (simpleMatch) {
    const [, lineName, status] = simpleMatch;
    return `${lineName}：${translateTflInlineStatus(status)}。`;
  }

  const causePattern = new RegExp(`^([^:]+Line):\\s*${statusPattern}\\s+due to\\s+(.+?)\\.?$`, "i");
  const causeMatch = reason.match(causePattern);
  if (causeMatch) {
    const [, lineName, status, cause] = causeMatch;
    return `${lineName}：${translateTflInlineStatus(status)}，原因是${translateTflCause(cause)}。`;
  }

  const restOnlyMatch = reason.match(/^(?:GOOD SERVICE|Good service)\s+on\s+the\s+rest\s+of\s+the\s+line\.?$/i);
  if (restOnlyMatch) return "其余区段正常运营。";

  return "";
}

function translateTflServiceSentences(text) {
  const sentences = String(text || "")
    .split(/(?<=\.)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return sentences.map(translateTflServiceSentence).filter(Boolean).join("");
}

function translateTflServiceSentence(sentence) {
  const clean = String(sentence || "").trim().replace(/\.$/, "");
  if (!clean) return "";

  if (/^(?:GOOD SERVICE|Good service)\s+on\s+the\s+rest\s+of\s+the\s+line$/i.test(clean)) {
    return "其余区段正常运营。";
  }

  let match = clean.match(/^There will also be no\s+(.+?)\s+service between\s+(.+?)\s+and\s+(.+)$/i);
  if (match) {
    const [, lineName, from, to] = match;
    return `${lineName} 在 ${from} 至 ${to} 之间也将没有服务。`;
  }

  match = clean.match(/^There will be no\s+(.+?)\s+service between\s+(.+?)\s+and\s+(.+)$/i);
  if (match) {
    const [, lineName, from, to] = match;
    return `${lineName} 在 ${from} 至 ${to} 之间将没有服务。`;
  }

  match = clean.match(/^A very limited\s+(.+?)\s+service will continue to serve\s+(.+)$/i);
  if (match) {
    const [, operator, place] = match;
    const cleanPlace = place.replace(/\s+early\s+a$/i, "");
    return `${operator} 将继续提供非常有限的服务，停靠 ${cleanPlace}${/[a-z]\s+a$/i.test(clean) ? "（原始信息不完整）" : ""}。`;
  }

  match = clean.match(/^Use local bus routes$/i);
  if (match) return "请改用当地公交线路。";

  match = clean.match(/^Please use\s+(.+?)\s+services instead$/i);
  if (match) return `请改用 ${match[1]} 服务。`;

  match = clean.match(/^Tickets are being accepted on\s+(.+)$/i);
  if (match) return `可使用相关车票乘坐 ${match[1]}。`;

  match = clean.match(/^After the\s+(.+?)\s+departure from\s+(.+?)\s+the next southbound train (?:with be|will be) at\s+(.+)$/i);
  if (match) {
    const [, time, from, nextTime] = match;
    return `${time} 从 ${from} 发车后，下一班南行列车将在 ${nextTime} 发车。`;
  }

  return `${translateTflGeneralReason(clean)}。`;
}

function translateTflDateText(value) {
  return String(value || "")
    .replace(/\bMonday\b/gi, "周一")
    .replace(/\bTuesday\b/gi, "周二")
    .replace(/\bWednesday\b/gi, "周三")
    .replace(/\bThursday\b/gi, "周四")
    .replace(/\bFriday\b/gi, "周五")
    .replace(/\bSaturday\b/gi, "周六")
    .replace(/\bSunday\b/gi, "周日")
    .replace(/\bJanuary\b/gi, "1月")
    .replace(/\bFebruary\b/gi, "2月")
    .replace(/\bMarch\b/gi, "3月")
    .replace(/\bApril\b/gi, "4月")
    .replace(/\bMay\b/gi, "5月")
    .replace(/\bJune\b/gi, "6月")
    .replace(/\bJuly\b/gi, "7月")
    .replace(/\bAugust\b/gi, "8月")
    .replace(/\bSeptember\b/gi, "9月")
    .replace(/\bOctober\b/gi, "10月")
    .replace(/\bNovember\b/gi, "11月")
    .replace(/\bDecember\b/gi, "12月")
    .replace(/\band\b/gi, "和")
    .replace(/,\s*/g, "、");
}

function translateTflInlineStatus(status) {
  const labels = {
    "good service": "正常运营",
    "minor delays": "轻微延误",
    "severe delays": "严重延误",
    "part closure": "部分关闭",
    "planned closure": "计划关闭",
    "no service": "无服务",
    "suspended": "暂停运营",
    "part suspended": "部分暂停",
    "reduced service": "班次减少",
  };
  return labels[String(status || "").trim().toLowerCase()] || translateTflStatus(status);
}

function translateTflDayList(value) {
  return translateTflGeneralReason(value)
    .replace(/,\s*/g, "、")
    .replace(/\s*和\s*在\s*/g, "和")
    .replace(/\s*和\s*/g, "和")
    .replace(/^在\s*/, "")
    .trim();
}

function translateTflCause(cause) {
  let text = String(cause || "").trim().replace(/\.$/, "");
  const atMatch = text.match(/^(?:an?\s+)?(?:earlier\s+)?(.+?)\s+at\s+(.+)$/i);
  if (atMatch) {
    const [, event, place] = atMatch;
    return `${place} ${translateTflCauseEvent(event, true)}`;
  }
  return translateTflCauseEvent(text, false);
}

function translateTflCauseEvent(event, withOccurred = false) {
  const clean = String(event || "").trim().toLowerCase();
  const labels = [
    [/^train cancellations? and an earlier signal system failure$/, "列车取消和早前发生的信号系统故障"],
    [/^points failure$/, "道岔故障"],
    [/^track fault$/, "轨道故障"],
    [/^signal system failure$/, "信号系统故障"],
    [/^signal failure$/, "信号故障"],
    [/^faulty train$/, "列车故障"],
    [/^customer incident$/, "乘客事件"],
    [/^passenger incident$/, "乘客事件"],
    [/^planned engineering works?$/, "计划性工程维护"],
    [/^engineering works?$/, "工程维护"],
    [/^train cancellations?$/, "列车取消"],
    [/^shortage of trains?$/, "列车不足"],
    [/^shortage of train crew$/, "列车工作人员不足"],
    [/^operational restrictions?$/, "运营限制"],
  ];
  const match = labels.find(([pattern]) => pattern.test(clean));
  const translated = match ? match[1] : String(event || "").trim();
  return withOccurred ? `发生${translated}` : translated;
}

function displayTflLineName(line) {
  const names = {
    "hammersmith-city": "H'smith & City",
    "waterloo-city": "Waterloo & City",
  };
  return names[line.id] || line.name || "Unknown line";
}

function setTflStatusLoading() {
  lockTflLinesHeight();
  if (!latestTflStatusData) {
    $("tflStatusTitle").textContent = currentLanguage === "zh" ? "伦敦线路实时状态：正在加载..." : "London lines right now: loading status...";
  }
  hideTflTooltip();
  $("tflStatusMeta").textContent = currentLanguage === "zh" ? "正在刷新 TfL 状态..." : "Refreshing TfL status...";
  const button = $("refreshTflStatus");
  if (button) button.disabled = true;
}

function lockTflLinesHeight() {
  const linesEl = $("tflLines");
  if (!linesEl || !linesEl.children.length) return;
  linesEl.style.minHeight = `${Math.ceil(linesEl.getBoundingClientRect().height)}px`;
}

function unlockTflLinesHeight() {
  const linesEl = $("tflLines");
  if (!linesEl) return;
  window.setTimeout(() => {
    linesEl.style.minHeight = "";
  }, 260);
}

function renderTflStatusError(message) {
  $("tflStatusTitle").textContent = currentLanguage === "zh" ? "伦敦线路实时状态：暂不可用" : "London lines right now: status unavailable";
  if (!latestTflStatusData) $("tflLines").innerHTML = "";
  $("tflStatusMeta").textContent = message || (currentLanguage === "zh" ? "请稍后刷新重试。" : "Try refreshing in a moment.");
  unlockTflLinesHeight();
}

function renderTflStatus(data) {
  const shouldAnimateLines = !latestTflStatusData;
  latestTflStatusData = data;
  const lines = sortTflLines(Array.isArray(data?.lines) ? data.lines : []);
  const summary = data?.summary || {};
  const disrupted = Number(summary.disrupted || 0);
  const total = Number(summary.total || lines.length || 0);
  const statusText = disrupted
    ? (currentLanguage === "zh" ? `${total} 条 TfL 线路中有 ${disrupted} 条报告了非正常运营` : `${disrupted} of ${total} TfL lines reporting disruption.`)
    : (currentLanguage === "zh" ? `${total} 条 TfL 线路均显示正常服务。` : `${total} TfL lines reporting good service.`);
  $("tflStatusTitle").textContent = currentLanguage === "zh"
    ? `${t("londonLinesNow")}：${statusText}`
    : `${t("londonLinesNow")}: ${statusText}`;

  $("tflLines").innerHTML = lines.map((line, index) => {
    const reason = translateTflReason(line.reason || "");
    const tooltipReason = String(line.reason || "").trim();
    const status = translateTflStatus(line.status);
    const color = tflLineColor(line.id);
    const revealClass = shouldAnimateLines ? "" : " scroll-reveal scroll-reveal--visible";
    const reasonAttributes = tooltipReason
      ? ` data-tooltip-title="${escapeHtml(status)}" data-reason="${escapeHtml(tooltipReason)}" aria-label="${escapeHtml(`${status}: ${tooltipReason}`)}"`
      : "";
    return `
      <div class="tfl-line ${tflStatusClass(line.severity)}${revealClass}" style="--line-color: ${escapeHtml(color)}; --line-index: ${index}">
        <div class="tfl-line-copy">
          <div class="tfl-line-name" title="${escapeHtml(line.name || "Unknown line")}">${escapeHtml(displayTflLineName(line))}</div>
          <span class="tfl-line-mode">${escapeHtml(formatTflMode(line.mode))}</span>
        </div>
        <span class="tfl-line-status"${reasonAttributes} tabindex="${reason ? "0" : "-1"}">${escapeHtml(status)}</span>
      </div>
    `;
  }).join("");

  const updated = data?.updatedAt ? new Date(data.updatedAt) : null;
  const updatedText = updated && !Number.isNaN(updated.getTime())
    ? updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : (currentLanguage === "zh" ? "刚刚" : "just now");
  $("tflStatusMeta").textContent = currentLanguage === "zh"
    ? `数据来自 Transport for London · 更新于 ${updatedText}`
    : `Live status from Transport for London · Updated ${updatedText}`;
  unlockTflLinesHeight();
}

function ensureTflTooltip() {
  let tooltip = document.getElementById("tflTooltip");
  if (tooltip) return tooltip;
  tooltip = document.createElement("div");
  tooltip.id = "tflTooltip";
  tooltip.className = "tfl-tooltip";
  tooltip.hidden = true;
  document.body.appendChild(tooltip);
  return tooltip;
}

function showTflTooltip(target) {
  const reason = target?.dataset?.reason;
  if (!reason) return;
  const title = target?.dataset?.tooltipTitle || (currentLanguage === "zh" ? "线路提示" : "Line notice");
  const tooltip = ensureTflTooltip();
  tooltip.innerHTML = `
    <strong class="tfl-tooltip-title">${escapeHtml(title)}</strong>
    <span class="tfl-tooltip-body">${escapeHtml(reason)}</span>
  `;
  tooltip.hidden = false;
  tooltip.classList.remove("is-hiding");
  tooltip.classList.add("is-visible");
  const targetRect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const gap = 10;
  const minLeft = 12;
  const maxLeft = window.innerWidth - tooltipRect.width - 12;
  const idealLeft = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
  const left = Math.max(minLeft, Math.min(maxLeft, idealLeft));
  const top = Math.max(12, targetRect.top - tooltipRect.height - gap);
  const tailLeft = targetRect.left + (targetRect.width / 2) - left;
  tooltip.style.left = `${left + window.scrollX}px`;
  tooltip.style.top = `${top + window.scrollY}px`;
  tooltip.style.setProperty("--tooltip-tail-left", `${tailLeft}px`);
}

function hideTflTooltip() {
  const tooltip = document.getElementById("tflTooltip");
  if (!tooltip || tooltip.hidden) return;
  tooltip.classList.remove("is-visible");
  tooltip.classList.add("is-hiding");
  window.setTimeout(() => {
    if (tooltip.classList.contains("is-hiding")) {
      tooltip.hidden = true;
      tooltip.classList.remove("is-hiding");
    }
  }, 160);
}

async function refreshTflStatus() {
  const requestId = ++tflStatusRequestId;
  setTflStatusLoading();
  try {
    const response = await apiFetch("/api/tfl-status");
    const data = await response.json();
    if (requestId !== tflStatusRequestId) return;
    if (!response.ok) throw new Error(data.error || "TfL status request failed");
    renderTflStatus(data);
  } catch (error) {
    if (requestId === tflStatusRequestId) {
      renderTflStatusError(error.message || "TfL line status is currently unavailable.");
    }
  } finally {
    if (requestId === tflStatusRequestId) {
      const button = $("refreshTflStatus");
      if (button) button.disabled = false;
    }
  }
}

function isStartupCheckingState() {
  return integrationStatus.llm === "Checking" && integrationStatus.routes === "Checking";
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
          <div class="metric"><span>${t("distanceLabel")}</span><strong>${place.adjustedDistance} km</strong></div>
          <div class="metric"><span>${t("walkEstimateLabel")}</span><strong>${place.estimatedWalkMinutes} ${t("minuteUnitShort")}</strong></div>
        </div>
      </div>
    </article>
  `;
}

function tagLabel(tag) {
  const labels = currentLanguage === "zh" ? {
    quiet: "安静",
    wifi: "Wi-Fi",
    indoor: "室内",
    view: "景观",
    "low-cost": "免费开放",
    "24h": "24 小时",
    science: "理工资源",
    central: "主图书馆",
    campus: "帝国理工",
    "study-space": "学习空间",
    group: "小组学习",
    services: "服务设施",
    food: "附近餐饮",
    transit: "交通便利",
    outdoor: "户外",
    green: "绿地环境",
    calm: "安静舒适",
  } : {
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

function campusDisplayName(value) {
  const names = {
    southKensington: "South Kensington",
    whiteCity: "White City",
    hammersmith: "Hammersmith",
  };
  return names[value] || value;
}

function isShuttleCampus(value) {
  return SHUTTLE_CAMPUSES.includes(value);
}

function defaultShuttleDestination(from) {
  return from === "southKensington" ? "whiteCity" : "southKensington";
}

function syncShuttleDestinationIfSame() {
  if (!controls.shuttleFrom || !controls.shuttleTo) return;
  const from = controls.shuttleFrom.value;
  if (!isShuttleCampus(from) || controls.shuttleTo.value !== from) return;
  controls.shuttleTo.value = defaultShuttleDestination(from);
}

function setShuttleFromCampus(campusKey) {
  if (!isShuttleCampus(campusKey) || !controls.shuttleFrom) return false;
  const changed = controls.shuttleFrom.value !== campusKey;
  controls.shuttleFrom.value = campusKey;
  syncShuttleDestinationIfSame();
  return changed;
}

function nearestShuttleCampusWithinRadius(point, radiusKm = SHUTTLE_CAMPUS_SYNC_RADIUS_KM) {
  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return "";
  return SHUTTLE_CAMPUSES
    .map((key) => ({ key, distance: distanceBetweenKm(point, startOffsets[key]) }))
    .filter(({ distance }) => Number.isFinite(distance) && distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)[0]?.key || "";
}

function parseClockMinutes(value) {
  const [hours, minutes] = String(value).split(":").map(Number);
  return hours * 60 + minutes;
}

function formatClockForDisplay(value) {
  const [hours, minutes] = String(value).split(":").map(Number);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function isWeekday(date = new Date()) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

function shuttleDirectionForRoute(from, to) {
  for (const [direction, stops] of Object.entries(SHUTTLE_CAMPUS_ORDER)) {
    if (stops.indexOf(from) >= 0 && stops.indexOf(to) > stops.indexOf(from)) return direction;
  }
  return "";
}

function nextShuttleForRoute(from, to, date = new Date()) {
  if (!from || !to || from === to) {
    return { status: "same" };
  }
  const direction = shuttleDirectionForRoute(from, to);
  const times = direction ? SHUTTLE_TIMETABLE[direction]?.[from] || [] : [];
  if (!direction || !times.length) {
    return { status: "unsupported" };
  }
  if (!isWeekday(date)) {
    return { status: "weekend", direction, firstTime: times[0] };
  }
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const nextTime = times.find((time) => parseClockMinutes(time) >= nowMinutes);
  if (!nextTime) {
    return { status: "finished", direction, firstTime: times[0] };
  }
  return { status: "available", direction, time: nextTime };
}

function renderShuttleLookup() {
  const from = controls.shuttleFrom?.value;
  const to = controls.shuttleTo?.value;
  const resultEl = $("shuttleResult");
  const nextTimeEl = $("shuttleNextTime");
  const detailEl = $("shuttleDetail");
  if (!nextTimeEl || !detailEl) return;

  const setShuttleHeadlineMode = (isTime) => {
    nextTimeEl.classList.toggle("is-time", Boolean(isTime));
    nextTimeEl.classList.toggle("is-message", !isTime);
  };

  const finishShuttleRender = () => {
    if (!resultEl) return;
    const contentKey = `${from}:${to}:${nextTimeEl.textContent}:${detailEl.textContent}`;
    const previousKey = resultEl.dataset.shuttleContentKey;
    resultEl.dataset.shuttleContentKey = contentKey;
    if (previousKey && previousKey !== contentKey) {
      animateClass(resultEl, "shuttle-result--reveal");
    }
  };

  const result = nextShuttleForRoute(from, to);
  const fromName = campusDisplayName(from);
  const toName = campusDisplayName(to);
  const directionLabel = result.direction === "eastbound" ? t("shuttleEastbound") : t("shuttleWestbound");

  if (result.status === "same") {
    setShuttleHeadlineMode(false);
    nextTimeEl.textContent = t("shuttleSameCampus");
    detailEl.textContent = t("shuttleWeekdayHint");
    finishShuttleRender();
    return;
  }
  if (result.status === "weekend") {
    setShuttleHeadlineMode(false);
    nextTimeEl.textContent = t("shuttleWeekend");
    detailEl.textContent = t("shuttleNextWeekday", { time: formatClockForDisplay(result.firstTime) });
    finishShuttleRender();
    return;
  }
  if (result.status === "finished") {
    setShuttleHeadlineMode(false);
    nextTimeEl.textContent = t("shuttleNoMoreToday");
    detailEl.textContent = t("shuttleNextWeekday", { time: formatClockForDisplay(result.firstTime) });
    finishShuttleRender();
    return;
  }
  if (result.status !== "available") {
    setShuttleHeadlineMode(false);
    nextTimeEl.textContent = t("shuttleChecking");
    detailEl.textContent = t("shuttleWeekdayHint");
    finishShuttleRender();
    return;
  }

  setShuttleHeadlineMode(true);
  nextTimeEl.textContent = t("shuttleNextDeparture", { time: formatClockForDisplay(result.time) });
  detailEl.textContent = t("shuttleDetail", {
    direction: directionLabel,
    from: fromName,
    to: toName,
  });
  finishShuttleRender();
}

function updateOutputs() {
  const walkValue = Number(controls.walkTolerance.value);
  const stepperValue = $("walkStepperValue");
  const stepperUnit = $("walkStepperUnit");
  if (stepperValue) stepperValue.textContent = String(walkValue);
  if (stepperUnit) stepperUnit.textContent = currentLanguage === "zh" ? "分钟" : "min";
  if (controls.walkDecrease) controls.walkDecrease.disabled = walkValue <= 5;
  if (controls.walkIncrease) controls.walkIncrease.disabled = walkValue >= 35;
  renderShuttleLookup();
}

function setWalkTolerance(value) {
  const nextValue = Math.max(5, Math.min(35, Number(value)));
  controls.walkTolerance.value = String(nextValue);
  updateOutputs();
  render();
  if (controls.scenario.value === "nearest") refreshRoutes();
}

async function answerQuestion(question, options = {}) {
  const cleaned = question.trim();
  if (!cleaned) {
    clearLatestAnswerModelLabel();
    $("agentAnswer").textContent = currentLanguage === "zh"
      ? "可以这样问：从 South Kensington 坐公共交通去 Hammersmith Campus。"
      : "Ask something like: from South Kensington to Hammersmith Campus by transit.";
    return;
  }

  collapseHowItWorks();
  setAgentMode("Pending");
  renderLoadingAnswer(t("understandingRequest"));
  const minLoadingReadyAt = Date.now() + MIN_LOADING_MS;
  setAsking(true);
  const loadingSessionId = renderLoadingAnswer(t("understandingRequest"));

  clearRoutePreview();
  clearLatestAnswerModelLabel();
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
        chatModelId: getRequestedChatModelId(),
        question: cleaned,
        contextStart: currentStartContext(),
        context: buildAgentContext(context),
        ranked: shouldExposeStudyRecommendations(cleaned) ? latestRanked.slice(0, 2).map(toModelPlace) : [],
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
    const contentType = response.headers.get("Content-Type") || "";
    const isStreamingResponse = contentType.includes("application/x-ndjson");
    if (!isStreamingResponse) await waitForMinimumLoading(minLoadingReadyAt);
    const agentResult = isStreamingResponse
      ? await readStreamingAnswer(response, { loadingSessionId })
      : await readJsonAnswer(response);
    const answer = sanitizeModelOutput(agentResult.answer || "");
    setLatestAnswerModelLabel(agentResult.model || "");
    if (agentResult.chatModelId) {
      setSelectedChatModel(agentResult.chatModelId, { refreshModal: false });
    }
    $("agentAnswer").innerHTML = renderAnswerWithModelMeta(renderMarkdown(answer));
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
    collapseHowItWorks();
  } catch (error) {
    await waitForMinimumLoading(minLoadingReadyAt);
    cancelAnswerRender();
    hideAgentActions();
    clearLatestAnswerModelLabel();
    const errorMessage = formatAgentError(error);
    $("agentAnswer").innerHTML = `
      <div class="agent-answer-output agent-answer-output--error">${renderMarkdown(errorMessage)}</div>
    `;
    if (options.skipUserPush) {
      chatHistory.push({ role: "assistant", content: errorMessage });
      trimChatHistory();
      renderChatModalHistory();
    }
  } finally {
    setAsking(false);
  }
}

function shouldExposeStudyRecommendations(question) {
  const text = String(question || "").toLowerCase();
  return [
    "study",
    "studying",
    "library",
    "libraries",
    "workspace",
    "work space",
    "study space",
    "seat",
    "quiet",
    "focus",
    "revise",
    "revision",
    "gostudy",
    "abdus salam",
    "学习",
    "自习",
    "复习",
    "图书馆",
    "座位",
    "安静",
    "学习空间",
    "学习地点",
  ].some((term) => text.includes(term));
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

async function readStreamingAnswer(response, options = {}) {
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
        updateLoadingAnswer(options.loadingSessionId, formatLoadingTools(toolsUsed));
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
  const answerEl = $("agentAnswer");
  if (answerEl) {
    answerEl.classList.add("agent-answer--streaming");
    answerEl.classList.remove("agent-answer--chunk");
  }
  const state = {
    sessionId: ++answerRenderSessionId,
    queue: "",
    rendered: "",
    completed: false,
    hasShownFirstChunk: false,
    timer: null,
    frame: null,
    lastFrameAt: 0,
    charCarry: 0,
    outputEl: null,
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
    scheduleAnswerRenderStep(state, STREAM_RENDER_FRAME_DELAY_MS);
  }
}

function closeAnswerRender(state) {
  if (!state || state.sessionId !== answerRenderSessionId) return;
  state.completed = true;
  if (!state.timer && !state.frame && !state.queue) {
    state.resolve();
  }
}

function waitForAnswerRender(state) {
  if (!state || state.sessionId !== answerRenderSessionId) return Promise.resolve();
  return state.finished;
}

function scheduleAnswerRenderStep(state, delayMs = STREAM_RENDER_FRAME_DELAY_MS) {
  state.timer = window.setTimeout(() => {
    state.timer = null;
    state.frame = window.requestAnimationFrame((now) => {
      state.frame = null;
      stepAnswerRender(state, now);
    });
  }, delayMs);
}

function stepAnswerRender(state, now = performance.now()) {
  if (!state || state.sessionId !== answerRenderSessionId) return;

  if (!state.queue) {
    if (state.completed) {
      const answerEl = $("agentAnswer");
      if (answerEl) {
        answerEl.innerHTML = state.rendered
          ? renderAnswerWithModelMeta(renderMarkdown(state.rendered))
          : "";
        answerEl.classList.remove("agent-answer--streaming");
        answerEl.classList.remove("agent-answer--chunk");
      }
      state.resolve();
      return;
    }
    scheduleAnswerRenderStep(state);
    return;
  }

  const chunk = state.queue.slice(0, answerRenderChunkSize(state, now));
  state.queue = state.queue.slice(chunk.length);
  state.rendered += chunk;
  const answerEl = $("agentAnswer");
  if (answerEl) {
    if (shouldRenderStreamingMarkdown(state.rendered)) {
      const revealClass = state.hasShownFirstChunk ? "" : " agent-answer-output--reveal";
      answerEl.innerHTML = `<div class="agent-answer-output agent-answer-output--live${revealClass}">${renderMarkdown(state.rendered)}</div>`;
      state.outputEl = null;
    } else {
      if (!state.outputEl || !answerEl.contains(state.outputEl)) {
        const revealClass = state.hasShownFirstChunk ? "" : " agent-answer-output--reveal";
        answerEl.innerHTML = `<div class="agent-answer-output agent-answer-output--live agent-answer-output--stream-text${revealClass}"></div>`;
        state.outputEl = answerEl.querySelector(".agent-answer-output");
      }
      const piece = document.createElement("span");
      piece.className = "agent-answer-fade-piece";
      piece.textContent = chunk;
      state.outputEl.appendChild(piece);
    }
    state.hasShownFirstChunk = true;
  }

  const punctuationDelay = /[。！？!?\n]$/.test(chunk) ? 28 : 0;
  scheduleAnswerRenderStep(state, STREAM_RENDER_FRAME_DELAY_MS + punctuationDelay);
}

function answerRenderChunkSize(state, now) {
  const queueLength = state.queue.length;
  const elapsedMs = state.lastFrameAt ? Math.min(80, Math.max(12, now - state.lastFrameAt)) : STREAM_RENDER_FRAME_DELAY_MS;
  state.lastFrameAt = now;
  const speedMultiplier = queueLength > 800 ? 2.7 : queueLength > 300 ? 2.05 : queueLength > 120 ? 1.45 : 1;
  state.charCarry += (elapsedMs / 1000) * STREAM_RENDER_BASE_CPS * speedMultiplier;
  const frameChars = Math.max(2, Math.floor(state.charCarry));
  const cappedChars = Math.min(frameChars, STREAM_RENDER_MAX_FRAME_CHARS, queueLength);
  state.charCarry = Math.max(0, state.charCarry - cappedChars);
  return cappedChars;
}

function shouldRenderStreamingMarkdown(value) {
  const lines = String(value || "").replace(/\r\n/g, "\n").split("\n");
  for (let index = 0; index < lines.length - 1; index += 1) {
    const current = lines[index].trim();
    const next = lines[index + 1].trim();
    const currentLooksTable = current.includes("|") && !/^[\s|:-]+$/.test(current);
    const nextLooksSeparator = /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/.test(next);
    if (currentLooksTable && nextLooksSeparator) return true;
  }
  return false;
}

function cancelAnswerRender() {
  answerRenderSessionId += 1;
}

function formatAgentError(error) {
  const message = sanitizeModelOutput(error?.message || "").trim();
  const normalized = message.toLowerCase();
  const retryHint = t("chatModelRetryHint");
  const withRetryHint = (base) => String(base || "").includes(retryHint) ? String(base || "").trim() : `${base} ${retryHint}`.trim();
  if (/(429|rate limit|too many requests|quota|usage limit|resource exhausted|billing|overloaded)/i.test(message)) {
    return withRetryHint(currentLanguage === "zh"
      ? "AI 服务当前触发了速率限制或额度限制，请稍后再试。"
      : "The AI service is currently rate-limited or out of quota. Please try again in a minute.");
  }
  if (/(timeout|timed out|deadline|abort)/i.test(message)) {
    return withRetryHint(currentLanguage === "zh"
      ? "AI 服务响应时间过长，请重试。"
      : "The AI service took too long to respond. Please try again.");
  }
  if (/(network|failed to fetch|connection|offline)/i.test(message)) {
    return withRetryHint(currentLanguage === "zh"
      ? "AI 服务当前无法连接，请检查网络后重试。"
      : "The AI service could not be reached. Please check the connection and try again.");
  }
  if (/(500|502|503|504|server error|bad gateway|service unavailable|gateway timeout)/i.test(message)) {
    return withRetryHint(currentLanguage === "zh"
      ? "AI 服务暂时不可用，请稍后重试。"
      : "The AI service is temporarily unavailable. Please try again shortly.");
  }
  if (containsCjkText(message)) {
    return withRetryHint(message || "The agent could not finish that request. Please try again.");
  }
  if (normalized) return withRetryHint(message);
  return withRetryHint(currentLanguage === "zh"
    ? "Agent 暂时无法完成这次请求，请重试。"
    : "The agent could not finish that request. Please try again.");
}

function containsCjkText(value) {
  return /[\u3400-\u9fff\uf900-\ufaff]/.test(String(value || ""));
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
  clearLatestAnswerModelLabel();
  const loadingSessionId = ++loadingRenderSessionId;
  const answerEl = $("agentAnswer");
  if (answerEl) {
    answerEl.classList.remove("agent-answer--streaming");
    answerEl.classList.remove("agent-answer--chunk");
  }
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

function animateClass(element, className) {
  if (!element) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
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
  const text = sanitizeModelOutput(value).replace(/\r\n/g, "\n").trim();
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
  const isEmptyPipeLine = (line) => /^\s*\|(?:\s*\|)+\s*$/.test(line);
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

    if (isEmptyPipeLine(line)) {
      flushBlocks();
      continue;
    }

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
  const shuttleFrom = controls.shuttleFrom?.value;
  const shuttleTo = controls.shuttleTo?.value;
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
    imperialWeekdayShuttle: {
      available: true,
      operates: "weekdays",
      campuses: SHUTTLE_CAMPUSES.map(campusDisplayName),
      reminder: "For routes between South Kensington, White City, and Hammersmith, mention that Imperial runs a weekday campus shuttle and suggest checking the timetable.",
      timetableUrl: "https://www.imperial.ac.uk/admin-services/property/travel/shuttle-bus/",
      selectedRoute: isShuttleCampus(shuttleFrom) && isShuttleCampus(shuttleTo) && shuttleFrom !== shuttleTo
        ? {
            from: campusDisplayName(shuttleFrom),
            to: campusDisplayName(shuttleTo),
            direction: shuttleDirectionForRoute(shuttleFrom, shuttleTo) || null,
          }
        : null,
    },
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
  $("askButton").textContent = isAsking ? t("thinking") : t("ask");
}

function setAgentMode(mode) {
  integrationStatus.tools = mode;
  updateAgentModeSignal(mode);
  render();
}

function formatAgentTools(tools = []) {
  const labels = {
    navigate: currentLanguage === "zh" ? "导航" : "Navigation",
    route_matrix: currentLanguage === "zh" ? "路线对比" : "Route Comparison",
    weather_current: currentLanguage === "zh" ? "天气" : "Weather",
    web_search: currentLanguage === "zh" ? "联网搜索" : "Web Search",
    tfl_status: currentLanguage === "zh" ? "TfL 状态" : "TfL Status",
  };
  const normalized = [...new Set((tools || []).filter(Boolean))];
  if (!normalized.length) return t("pending");
  return normalized.map((tool) => labels[tool] || tool).join(" + ");
}

function formatLoadingTools(tools = []) {
  const labels = {
    navigate: currentLanguage === "zh" ? "导航" : "Navigation",
    route_matrix: currentLanguage === "zh" ? "路线对比" : "Route Comparison",
    weather_current: currentLanguage === "zh" ? "天气" : "Weather",
    web_search: currentLanguage === "zh" ? "联网搜索" : "Web Search",
    tfl_status: currentLanguage === "zh" ? "TfL 状态" : "TfL Status",
  };
  const normalized = [...new Set((tools || []).filter(Boolean))];
  const latestTool = normalized[normalized.length - 1];
  if (!latestTool) return t("generatingResults");
  return t("usingTool", { tool: labels[latestTool] || latestTool });
}

function hasNavigationResult(result) {
  return Boolean(result?.recommended || result?.mapRoute || result?.navigation?.recommended || result?.navigation?.mapRoute);
}

function translateStatusText(value) {
  const text = String(value || "");
  const exact = {
    Checking: t("checking"),
    Pending: t("pending"),
    Connected: t("connected"),
    Offline: t("offline"),
    "Keys Ready": t("keysReady"),
    "Browser key ready": t("browserKeyReady"),
    "Browser key missing": t("browserKeyMissing"),
    "Routes key missing": t("routesKeyMissing"),
    "Local API offline": t("localApiOffline"),
  };
  if (exact[text]) return exact[text];
  return text
    .replaceAll("Browser key missing", t("browserKeyMissing"))
    .replaceAll("Routes key missing", t("routesKeyMissing"));
}

function updateAgentModeSignal(mode, animate = true) {
  const signal = $("airSignal");
  if (!signal) return;
  const displayMode = translateStatusText(mode);
  const changed = signal.textContent !== displayMode;
  signal.textContent = displayMode;
  signal.dataset.mode = mode.toLowerCase().replace(/\s+/g, "-");
  if (!animate || !changed) return;
  signal.classList.remove("mode-changed");
  void signal.offsetWidth;
  signal.classList.add("mode-changed");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
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
  if (!latestWeatherData) {
    void refreshWeatherForStart(
      {
        ...getStartPoint(),
        weatherScope: "start point",
      },
      true,
      { preserveOnError: true },
    );
  }
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
      // Only show transport mode in the select (no duration/distance)
      const label = routeModeDisplayLabel(route);
      return `<option value="${route.mode}" ${route.mode === selectedMode ? "selected" : ""}>${escapeHtml(label)}</option>`;
    })
    .join("");
  $("routeUpdateButton").disabled = routes.length < 2;
}

function routeModeDisplayLabel(route) {
  const raw = String(route?.modeLabel || route?.mode || "");
  if (currentLanguage !== "zh") return raw;
  const mode = String(route?.mode || "").toUpperCase();
  const labels = {
    TRANSIT: "公共交通",
    WALK: "步行",
    BICYCLE: "骑行",
    TWO_WHEELER: "骑行",
    DRIVE: "驾车",
    DRIVING: "驾车",
  };
  return labels[mode] || raw
    .replace(/public transport/i, "公共交通")
    .replace(/walking/i, "步行")
    .replace(/cycling/i, "骑行")
    .replace(/driving/i, "驾车");
}

function drawSelectedRoutePreview() {
  if (!activeRoutePreview) return;
  const routes = routeOptionsForPreview(activeRoutePreview);
  const selectedMode = $("routeModeSelect").value;
  const route = routes.find((item) => item.mode === selectedMode) || routes[0];
  drawRoutePreview(activeRoutePreview, route);
  updateGoogleMapsLink(activeRoutePreview, route);
}

function setRouteMapFullscreen(enabled) {
  const shell = $("routeMapShell");
  const mapElement = $("routeMap");
  const button = $("routeFullscreenButton");
  if (!shell || !button) return;
  routeMapFullscreen = Boolean(enabled);
  if (routeMapFullscreen && !routeMapPlaceholder) {
    routeMapPlaceholder = document.createComment("route-map-shell-placeholder");
    shell.parentNode.insertBefore(routeMapPlaceholder, shell);
    document.body.appendChild(shell);
  } else if (!routeMapFullscreen && routeMapPlaceholder?.parentNode) {
    routeMapPlaceholder.parentNode.insertBefore(shell, routeMapPlaceholder);
    routeMapPlaceholder.remove();
    routeMapPlaceholder = null;
  }
  shell.classList.toggle("is-fullscreen", routeMapFullscreen);
  document.body.classList.toggle("route-map-fullscreen-open", routeMapFullscreen);
  button.textContent = routeMapFullscreen ? t("exitFullScreen") : t("fullScreen");
  button.setAttribute("aria-label", routeMapFullscreen ? t("exitFullScreen") : t("fullScreen"));
  if (mapElement) {
    mapElement.style.height = routeMapFullscreen ? "100%" : "360px";
    mapElement.style.minHeight = routeMapFullscreen ? "100%" : "360px";
  }
  window.setTimeout(() => {
    if (routeMap && window.google?.maps) {
      google.maps.event.trigger(routeMap, "resize");
    }
  }, 80);
}

function toggleRouteMapFullscreen() {
  setRouteMapFullscreen(!routeMapFullscreen);
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
  $("routePreviewTitle").textContent = `${t("routeMap")}: ${routeModeDisplayLabel(recommended) || (currentLanguage === "zh" ? "路线" : "route")}`;
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
    routeMap.addListener("click", () => closeRouteStopInfo());
    routeMap.addListener("dragstart", () => closeRouteStopInfo());
  }

  routePolylines.forEach((polyline) => polyline.setMap(null));
  routePolylines = [];
  routeMarkers.forEach((marker) => marker.setMap(null));
  routeMarkers = [];
  closeRouteStopInfo({ immediate: true });

  routePolylines = drawRoutePolylines(recommended, path);

  routeMarkers = [
    new google.maps.Marker({ map: routeMap, position: path[0], label: "A", title: data.origin || "Origin" }),
    new google.maps.Marker({ map: routeMap, position: path[path.length - 1], label: "B", title: data.destination || "Destination" }),
    ...routeStopMarkersForRoute(recommended),
  ];

  const bounds = new google.maps.LatLngBounds();
  path.forEach((point) => bounds.extend(point));
  routeMap.fitBounds(bounds, 32);
}

function drawRoutePolylines(route, fallbackPath) {
  const segments = Array.isArray(route?.routeSegments) ? route.routeSegments : [];
  const segmentPolylines = segments
    .map((segment) => drawRouteSegment(segment))
    .filter(Boolean);
  if (segmentPolylines.length) return segmentPolylines;
  return [
    new google.maps.Polyline({
      path: fallbackPath,
      geodesic: true,
      strokeColor: "#2767a8",
      strokeOpacity: 0.95,
      strokeWeight: 5,
      map: routeMap,
    }),
  ];
}

function drawRouteSegment(segment) {
  const path = decodePolyline(segment?.polyline || "");
  if (!path.length) return null;
  const style = routeSegmentStyle(segment);
  return new google.maps.Polyline({
    path,
    geodesic: true,
    strokeColor: style.color,
    strokeOpacity: style.opacity,
    strokeWeight: style.weight,
    icons: style.icons,
    map: routeMap,
  });
}

function routeSegmentStyle(segment) {
  const mode = String(segment?.travelMode || "").toUpperCase();
  if (mode === "WALK") {
    return {
      color: "#6f7c8f",
      opacity: 0,
      weight: 4,
      icons: [{
        icon: { path: "M 0,-1 0,1", strokeOpacity: 0.8, strokeWeight: 3, strokeColor: "#6f7c8f", scale: 3 },
        offset: "0",
        repeat: "12px",
      }],
    };
  }
  return {
    color: routeTransitColor(segment),
    opacity: 0.95,
    weight: mode === "TRANSIT" ? 6 : 5,
    icons: undefined,
  };
}

function routeTransitColor(segment) {
  if (isHexColor(segment?.lineColor)) return segment.lineColor;
  const key = canonicalTransitColorKey(segment?.statusQuery || segment?.lineShortName || segment?.lineName);
  if (/^\d+[a-z]?$/.test(key)) return "#D12027";
  return tflLineColor(key) || "#2767a8";
}

function isHexColor(value) {
  return /^#[0-9a-fA-F]{6}$/.test(String(value || ""));
}

function canonicalTransitColorKey(value) {
  const text = String(value || "").toLowerCase().replace(/&/g, "and");
  const compact = text.replace(/\b(line|london|underground|tube|rail|service)\b/g, "").trim();
  return compact.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function transferMarkersForRoute(route) {
  const segments = Array.isArray(route?.routeSegments) ? route.routeSegments : [];
  const markers = [];
  for (let index = 1; index < segments.length; index += 1) {
    const previousPath = decodePolyline(segments[index - 1]?.polyline || "");
    const currentPath = decodePolyline(segments[index]?.polyline || "");
    const position = currentPath[0] || previousPath[previousPath.length - 1];
    if (!position) continue;
    markers.push(new google.maps.Marker({
      map: routeMap,
      position,
      title: transferMarkerTitle(segments[index]),
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 5,
        fillColor: "#ffffff",
        fillOpacity: 1,
        strokeColor: transferMarkerColor(segments[index]),
        strokeOpacity: 1,
        strokeWeight: 3,
      },
      zIndex: 3,
    }));
  }
  return markers;
}

function routeStopMarkersForRoute(route) {
  const stops = Array.isArray(route?.routeStops) ? route.routeStops : [];
  if (!stops.length) return transferMarkersForRoute(route);
  return stops
    .map((stop) => {
      const position = stop?.location;
      if (!isLatLngPlace(position)) return null;
      const marker = new google.maps.Marker({
        map: routeMap,
        position,
        title: routeStopTitle(stop),
        icon: routeStopIcon(stop),
        zIndex: routeStopZIndex(stop),
      });
      marker.addListener("mouseover", () => openRouteStopInfo(marker, stop));
      marker.addListener("click", () => openRouteStopInfo(marker, stop));
      return marker;
    })
    .filter(Boolean);
}

function routeStopIcon(stop) {
  const color = routeStopColor(stop);
  const isTransitStop = stop?.role === "board" || stop?.role === "alight" || stop?.role === "transfer";
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: isTransitStop ? 8 : 6,
    fillColor: "#ffffff",
    fillOpacity: 1,
    strokeColor: color,
    strokeOpacity: 1,
    strokeWeight: isTransitStop ? 4 : 3,
  };
}

function routeStopColor(stop) {
  const lines = Array.isArray(stop?.routeLines) && stop.routeLines.length
    ? stop.routeLines
    : [stop?.routeLine].filter(Boolean);
  const line = lines[0] || {};
  return routeTransitColor({
    lineColor: line.color,
    statusQuery: line.statusQuery,
    lineShortName: line.shortName,
    lineName: line.name,
    travelMode: stop?.vehicleType ? "TRANSIT" : "WALK",
  });
}

function routeStopZIndex(stop) {
  const roles = { transfer: 6, board: 5, alight: 5 };
  return roles[stop?.role] || 4;
}

function routeStopTitle(stop) {
  const label = routeStopRoleLabel(stop?.role);
  return `${label}: ${stop?.name || "Stop"}`;
}

function routeStopRoleLabel(role) {
  const labels = {
    board: "Board",
    alight: "Alight",
    transfer: "Transfer",
  };
  return labels[role] || "Stop";
}

function openRouteStopInfo(marker, stop) {
  if (!routeMap || !marker?.getPosition) return;
  if (!routeStopOverlay) routeStopOverlay = createRouteStopOverlay();
  routeStopOverlay.open(marker.getPosition(), routeStopInfoHtml(stop));
}

function closeRouteStopInfo(options = {}) {
  if (routeStopOverlayCloseTimer) {
    window.clearTimeout(routeStopOverlayCloseTimer);
    routeStopOverlayCloseTimer = null;
  }
  if (!routeStopOverlay) return;
  routeStopOverlay.close(Boolean(options.immediate));
}

function createRouteStopOverlay() {
  const overlay = new google.maps.OverlayView();
  overlay.position = null;
  overlay.container = null;
  overlay.contentHtml = "";
  overlay.isOpen = false;
  overlay.panRequestId = 0;

  overlay.onAdd = function onAdd() {
    const container = document.createElement("div");
    container.className = "route-stop-popup";
    container.addEventListener("mousedown", (event) => event.stopPropagation());
    container.addEventListener("click", (event) => {
      const closeButton = event.target.closest(".route-stop-popup-close");
      if (closeButton) {
        event.preventDefault();
        closeRouteStopInfo();
      }
      event.stopPropagation();
    });
    this.container = container;
    this.getPanes().floatPane.appendChild(container);
    if (this.contentHtml) {
      this.renderContent();
      window.requestAnimationFrame(() => {
        if (this.container) this.container.classList.add("route-stop-popup--open");
      });
    }
  };

  overlay.draw = function draw() {
    if (!this.container || !this.position) return;
    const projection = this.getProjection();
    if (!projection) return;
    const point = projection.fromLatLngToDivPixel(this.position);
    if (!point) return;
    this.container.style.left = `${point.x}px`;
    this.container.style.top = `${point.y}px`;
  };

  overlay.onRemove = function onRemove() {
    if (this.container?.parentNode) this.container.parentNode.removeChild(this.container);
    this.container = null;
  };

  overlay.open = function open(position, html) {
    if (routeStopOverlayCloseTimer) {
      window.clearTimeout(routeStopOverlayCloseTimer);
      routeStopOverlayCloseTimer = null;
    }
    this.position = position;
    this.contentHtml = html;
    this.isOpen = true;
    if (!this.getMap()) this.setMap(routeMap);
    if (this.container) {
      this.renderContent(true);
    }
    this.draw();
    this.schedulePanIntoView();
  };

  overlay.renderContent = function renderContent(animate = false) {
    if (!this.container) return;
    this.container.innerHTML = routeStopPopupHtml(this.contentHtml);
    this.container.classList.remove("route-stop-popup--closing");
    this.container.classList.remove("route-stop-popup--open");
    if (animate) void this.container.offsetWidth;
    this.container.classList.add("route-stop-popup--open");
  };

  overlay.schedulePanIntoView = function schedulePanIntoView() {
    const requestId = ++this.panRequestId;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (requestId !== this.panRequestId || !this.isOpen || !this.container || !routeMap) return;
        this.panIntoView();
      });
    });
  };

  overlay.panIntoView = function panIntoView() {
    const mapDiv = routeMap?.getDiv?.();
    if (!mapDiv || !this.container) return;
    const popupRect = this.container.getBoundingClientRect();
    const mapRect = mapDiv.getBoundingClientRect();
    if (!popupRect.width || !popupRect.height || !mapRect.width || !mapRect.height) return;

    const padding = routeMapFullscreen ? 24 : 18;
    let panX = 0;
    let panY = 0;
    const minLeft = mapRect.left + padding;
    const maxRight = mapRect.right - padding;
    const minTop = mapRect.top + padding;
    const maxBottom = mapRect.bottom - padding;

    if (popupRect.left < minLeft) {
      panX = popupRect.left - minLeft;
    } else if (popupRect.right > maxRight) {
      panX = popupRect.right - maxRight;
    }

    if (popupRect.top < minTop) {
      panY = popupRect.top - minTop;
    } else if (popupRect.bottom > maxBottom) {
      panY = popupRect.bottom - maxBottom;
    }

    if (Math.abs(panX) > 1 || Math.abs(panY) > 1) {
      routeMap.panBy(Math.round(panX), Math.round(panY));
    }
  };

  overlay.close = function close(immediate = false) {
    if (!this.getMap()) return;
    this.panRequestId += 1;
    if (immediate || !this.container) {
      this.isOpen = false;
      this.setMap(null);
      return;
    }
    this.container.classList.remove("route-stop-popup--open");
    this.container.classList.add("route-stop-popup--closing");
    routeStopOverlayCloseTimer = window.setTimeout(() => {
      routeStopOverlayCloseTimer = null;
      this.isOpen = false;
      this.setMap(null);
    }, 190);
  };

  return overlay;
}

function routeStopPopupHtml(contentHtml) {
  return `
    <div class="route-stop-popup-bubble" role="dialog" aria-label="Station details">
      <button class="route-stop-popup-close" type="button" aria-label="Close station details">×</button>
      ${contentHtml}
    </div>
  `;
}

function routeStopInfoHtml(stop) {
  const stationName = stop?.tflName || stop?.name || "Stop";
  const routeLines = routeStopRouteLines(stop);
  const servedLines = routeStopServedLines(stop);
  return `
    <div class="route-stop-info">
      <div class="route-stop-role">${escapeHtml(routeStopRoleLabel(stop?.role))}</div>
      <div class="route-stop-name">${escapeHtml(stationName)}</div>
      ${routeLines.length ? `<div class="route-stop-section"><span>Route</span>${routeLineChipsHtml(routeLines, 4)}</div>` : ""}
      ${servedLines.length ? `<div class="route-stop-section route-stop-section--other"><span>Other lines here</span>${routeLineChipsHtml(servedLines, 12)}</div>` : `<div class="route-stop-empty">TfL line list unavailable for this stop.</div>`}
    </div>
  `;
}

function routeStopRouteLines(stop) {
  const lines = Array.isArray(stop?.routeLines) && stop.routeLines.length
    ? stop.routeLines
    : [stop?.routeLine].filter(Boolean);
  return lines.map((line) => ({
    id: line.statusQuery || line.shortName || line.name,
    name: line.shortName || line.name,
    mode: line.vehicleType,
    color: line.color,
  })).filter((line) => line.name);
}

function routeStopServedLines(stop) {
  const lines = Array.isArray(stop?.servedLines) ? stop.servedLines : [];
  const seen = new Set();
  return lines
    .map((line) => ({
      id: line.id || line.name,
      name: line.name || line.id,
      mode: line.mode,
      color: tflLineColor(canonicalTransitColorKey(line.id || line.name)),
    }))
    .filter((line) => {
      const key = `${line.id}:${line.mode}`;
      if (!line.name || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function routeLineChipsHtml(lines, limit) {
  const visible = lines.slice(0, limit);
  const more = lines.length - visible.length;
  const chips = visible.map((line) => {
    const color = isHexColor(line.color) ? line.color : tflLineColor(canonicalTransitColorKey(line.id || line.name));
    return `<span class="route-stop-chip" style="--chip-color: ${escapeHtml(color)}">${escapeHtml(String(line.name || line.id))}</span>`;
  }).join("");
  return `${chips}${more > 0 ? `<span class="route-stop-more">+${more} more</span>` : ""}`;
}

function transferMarkerColor(segment) {
  return String(segment?.travelMode || "").toUpperCase() === "WALK" ? "#6f7c8f" : routeTransitColor(segment);
}

function transferMarkerTitle(segment) {
  const line = segment?.lineShortName || segment?.lineName;
  if (line) return `Transfer to ${line}`;
  return "Transfer";
}

function clearRoutePreview() {
  pendingRoutePreview = null;
  activeRoutePreview = null;
  const preview = $("routePreview");
  if (preview) {
    preview.classList.remove("route-preview--pop");
    preview.hidden = true;
  }
  setRouteMapFullscreen(false);
  routePolylines.forEach((polyline) => polyline.setMap(null));
  routePolylines = [];
  routeMarkers.forEach((marker) => marker.setMap(null));
  routeMarkers = [];
  closeRouteStopInfo({ immediate: true });
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
  return `<button class="chat-route-map-button" type="button" data-chat-route-map="true">${t("routeMapButton")}</button>`;
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

function isPointInPolygon(lat, lng, polygon) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [lngA, latA] = polygon[index];
    const [lngB, latB] = polygon[previous];
    const intersects = ((latA > lat) !== (latB > lat))
      && (lng < ((lngB - lngA) * (lat - latA)) / (latB - latA) + lngA);
    if (intersects) inside = !inside;
  }
  return inside;
}

function isWithinBox(lat, lng, box) {
  return lat >= box.minLat && lat <= box.maxLat && lng >= box.minLng && lng <= box.maxLng;
}

function isMainlandChinaCoordinate(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  const excludedRegions = [
    { minLat: 22.13, maxLat: 22.58, minLng: 113.8, maxLng: 114.5 }, // Hong Kong
    { minLat: 22.03, maxLat: 22.25, minLng: 113.5, maxLng: 113.65 }, // Macao
    { minLat: 21.8, maxLat: 25.4, minLng: 119.3, maxLng: 122.1 }, // Taiwan
  ];
  if (excludedRegions.some((box) => isWithinBox(lat, lng, box))) return false;
  return MAINLAND_CHINA_POLYGONS.some((polygon) => isPointInPolygon(lat, lng, polygon));
}

function maybeShowMainlandChinaCoverageWarning(lat, lng) {
  if (!isMainlandChinaCoordinate(lat, lng)) return;
  showToolInfo("mainlandChinaCoverage", MAINLAND_CHINA_WARNING_TEXT);
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
  setShuttleFromCampus(nearestShuttleCampusWithinRadius({ lat, lng }));
  updateStartMapStatus(statusMessage);
  render();
  maybeShowMainlandChinaCoverageWarning(lat, lng);
  if (autoRefreshWeatherOnSelect) void refreshWeatherForStart(getStartPoint(), true);
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
  setShuttleFromCampus(key);
  updateStartMapStatus();
  render();
  if (autoRefreshWeatherOnSelect) void refreshWeatherForStart(getStartPoint(), true);
  if (controls.scenario.value === "nearest") refreshRoutes();
}

function updateStartMapStatus(statusMessage = "") {
  $("startMapStatus").textContent = statusMessage;
}

function geolocationErrorMessage(error) {
  if (!window.isSecureContext) {
    return t("locationRequiresHttps");
  }
  if (!error) return t("locationUnavailable");
  if (error.code === error.PERMISSION_DENIED) return t("locationDenied");
  if (error.code === error.POSITION_UNAVAILABLE) return t("locationUnavailableCurrent");
  if (error.code === error.TIMEOUT) return t("locationTimedOut");
  return error.message || t("locationUnavailable");
}

function setLocationButtonLoading(isLoading) {
  const button = $("useCurrentLocation");
  if (!button) return;
  button.disabled = isLoading;
  button.textContent = isLoading ? t("locationButtonLocating") : t("useCurrentLocation");
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
      message: t("locationReading"),
      options: { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
      timeoutMs: 14000,
    },
    {
      message: t("locationHighAccuracy"),
      options: { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 },
      timeoutMs: 14000,
    },
    {
      message: t("locationCached"),
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
    statusCallback(t("locationUsingLastKnown"));
    return cached;
  }

  throw lastError || new Error(t("locationUnavailable"));
}

async function requestCurrentLocation() {
  if (!navigator.geolocation) {
    $("startMapStatus").textContent = t("locationUnsupported");
    return;
  }

  setLocationButtonLoading(true);
  const permissionState = await readGeolocationPermissionState();
  if (permissionState === "denied") {
    $("startMapStatus").textContent = t("locationBlockedSettings");
    setLocationButtonLoading(false);
    return;
  }

  $("startMapStatus").textContent = permissionState === "prompt"
    ? t("locationPromptWaiting")
    : t("locationReading");

  try {
    const position = await resolveCurrentPosition((message) => {
      $("startMapStatus").textContent = message;
    });
    const { latitude, longitude, accuracy } = position.coords;
    const accuracyText = Number.isFinite(accuracy) ? ` ${t("locationAccuracyAbout", { meters: Math.round(accuracy) })}` : "";
    const sourceText = position.source === "last known" ? t("locationUsingLastKnownShort") : t("locationUsingCurrent");
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
    throw new Error(t("weatherDestinationRequired"));
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
    showWeatherDestinationAlert(error.message || t("weatherDestinationRequired"));
  }
}

async function updateWeatherAtMapSelection() {
  try {
    await refreshWeatherForStart(
      {
        ...getStartPoint(),
        weatherScope: "start point",
      },
      true,
      { preserveOnError: true, throwOnError: true },
    );
  } catch (error) {
    showWeatherLocationAlert(error.message || "Weather data is unavailable for the selected map point.");
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
        label: t("currentLocation"),
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

async function refreshDefaultWeatherScope() {
  const start = getStartPoint();
  setWeatherScope("start point", start?.label);
  await refreshWeatherForStart(
    {
      ...start,
      weatherScope: "start point",
    },
    true,
    { preserveOnError: true },
  );
}

function clearIntegrationRetry() {
  integrationRetryDelayMs = INTEGRATION_RETRY_BASE_MS;
  if (!integrationRetryTimer) return;
  window.clearTimeout(integrationRetryTimer);
  integrationRetryTimer = null;
}

function scheduleIntegrationRetry() {
  if (integrationRetryTimer) return;
  integrationRetryTimer = window.setTimeout(() => {
    integrationRetryTimer = null;
    integrationRetryDelayMs = Math.min(INTEGRATION_RETRY_MAX_MS, Math.round(integrationRetryDelayMs * 1.6));
    void refreshIntegrationStatus();
  }, integrationRetryDelayMs);
}

async function refreshIntegrationStatus() {
  try {
    const response = await apiFetch("/api/health");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Health check failed");
    chatModelOptions = Array.isArray(data.chatModels)
      ? data.chatModels.map(normalizeChatModelOption).filter(Boolean)
      : [];
    defaultChatModelId = String(data.defaultChatModelId || "").trim();
    if (getChatModelOptionById(selectedChatModelId)) {
      setSelectedChatModel(selectedChatModelId, { refreshModal: false });
    } else if (getChatModelOptionById(defaultChatModelId)) {
      setSelectedChatModel(defaultChatModelId, { refreshModal: false });
    } else if (getChatModelOptions()[0]) {
      setSelectedChatModel(getChatModelOptions()[0].id, { refreshModal: false });
    } else {
      selectedChatModelId = "";
    }
    integrationStatus = {
      llm: getActiveChatModelOption()?.label || (data.llmConnected ? formatModelDisplayName(data.llmStatus || "Connected") : formatModelDisplayName(data.llmStatus || "Offline")),
      routes: integrationStatus.routes || "Checking",
      maps: integrationStatus.maps || "Checking",
      mcp: data.mcpConnected ? "Connected" : "Offline",
      tools: integrationStatus.tools || "Pending",
    };
    setGoogleMapsStatus(Boolean(data.googleMapsBrowserConfigured), Boolean(data.googleMapsConfigured));
    if (data.googleMapsBrowserKey) {
      googleMapsBrowserKey = data.googleMapsBrowserKey;
      loadGoogleStartMap(data.googleMapsBrowserKey);
      clearIntegrationRetry();
      if (!weatherAutoRefreshRequested) {
        weatherAutoRefreshRequested = true;
        void refreshDefaultWeatherScope();
      }
    } else {
      $("startMapStatus").textContent = "Google Maps browser key missing; use the campus selector below.";
      renderWeatherError("Google Maps browser key missing.");
      scheduleIntegrationRetry();
    }
  } catch (error) {
    chatModelOptions = [];
    defaultChatModelId = "";
    selectedChatModelId = "";
    integrationStatus = {
      llm: "Local API offline",
      routes: "Local API offline",
      maps: "Local API offline",
      mcp: "Local API offline",
      tools: integrationStatus.tools || "Pending",
    };
    $("startMapStatus").innerHTML = `Local API not connected. Run <code>PORT=8001 python3 server.py</code>, or open this page with <code>?api=http://localhost:8001</code> if you use another port.`;
    renderWeatherError("Local API is not connected, so the browser key is not available.");
    scheduleIntegrationRetry();
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
  if (!control || control === controls.walkDecrease || control === controls.walkIncrease) return;
  const handleControlUpdate = () => {
    if (control === controls.walkTolerance) {
      updateOutputs();
      return;
    }
    if (control === controls.startPoint && controls.startPoint.value !== "mapSelection") {
      selectCampusStart(controls.startPoint.value);
      return;
    }
    if (control === controls.shuttleFrom) {
      syncShuttleDestinationIfSame();
    }
    render();
    if (controls.scenario.value === "nearest") refreshRoutes();
  };
  control.addEventListener("input", handleControlUpdate);
  control.addEventListener("change", handleControlUpdate);
});
controls.walkDecrease?.addEventListener("click", () => setWalkTolerance(Number(controls.walkTolerance.value) - 5));
controls.walkIncrease?.addEventListener("click", () => setWalkTolerance(Number(controls.walkTolerance.value) + 5));
$("updateRecommendations").addEventListener("click", () => {
  render();
  if (controls.scenario.value === "nearest") refreshRoutes();
});
$("loadMoreStudySpaces").addEventListener("click", () => {
  recommendationDisplayLimit = recommendationDisplayLimit >= RECOMMENDATION_EXPANDED_LIMIT
    ? RECOMMENDATION_COLLAPSED_LIMIT
    : RECOMMENDATION_EXPANDED_LIMIT;
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
$("updateWeatherMapButton").addEventListener("click", updateWeatherAtMapSelection);
$("updateWeatherDestinationButton").addEventListener("click", updateWeatherAtDestination);
$("refreshTflStatus").addEventListener("click", refreshTflStatus);
$("tflLines").addEventListener("mouseover", (event) => {
  const target = event.target.closest(".tfl-line-status[data-reason]");
  if (target) showTflTooltip(target);
});
$("tflLines").addEventListener("mouseout", (event) => {
  if (event.target.closest(".tfl-line-status[data-reason]")) hideTflTooltip();
});
$("tflLines").addEventListener("focusin", (event) => {
  const target = event.target.closest(".tfl-line-status[data-reason]");
  if (target) showTflTooltip(target);
});
$("tflLines").addEventListener("focusout", hideTflTooltip);
$("tflLines").addEventListener("scroll", hideTflTooltip);
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
// Auto-update the route preview when the user changes transport mode
const routeModeSelectEl = $("routeModeSelect");
if (routeModeSelectEl) {
  routeModeSelectEl.addEventListener("change", () => {
    // update immediately without requiring the Update button
    drawSelectedRoutePreview();
  });
}
$("routeFullscreenButton").addEventListener("click", toggleRouteMapFullscreen);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && routeMapFullscreen) setRouteMapFullscreen(false);
});
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
  routes: {
    title: "Live data and API keys",
    body: "API Keys power the live-data layer of the app.\n\nThe Google Maps browser key loads the map, geocodes places, and enables weather lookups. The Google Routes key provides live travel time, distance, and route geometry when the agent enters navigation mode, and supports route comparison across public transport, walking, cycling, and driving.\n\nThe Weather API returns current conditions for your selected start point or navigation destination. The TfL Status API reports live London line disruptions so route previews and status cards can surface service issues. When all configured keys and services are available, this tile shows Keys Ready.",
    zhTitle: "实时数据与 API 密钥",
    zhBody: "API 密钥支撑应用中的实时数据能力。\n\nGoogle Maps 浏览器密钥用于加载地图、地理编码地点和天气查询。Google Routes 密钥用于在导航模式下提供实时出行时间、距离和路线几何，并支持公共交通、步行、骑行和驾车之间的比较。\n\nWeather API 返回所选出发点或导航目的地的当前天气；TfL Status API 返回伦敦线路实时运营状态。当密钥和服务均可用时，这里会显示“服务已连接”。",
  },
  llm: {
    title: "Language model status",
    body: "The LLM handles conversation, intent understanding, synthesizing gathered information, and providing answers. When tool calls are needed, the LLM automatically decides which tools to use to get more accurate results.",
    zhTitle: "语言模型状态",
    zhBody: "LLM 负责对话、理解意图，总结获得的信息并提供答案。需要调用工具时，LLM 会自动决定使用什么工具，以获得更准确的结果。",
  },
  agent: {
    title: "Agent tools",
    body: "The model now chooses tools itself. The top signal shows the tool currently used by the model, or Pending when no tool is used.",
    zhTitle: "Agent 工具",
    zhBody: "模型会在回答时自行选择工具。顶部状态会显示当前使用的工具；不需要工具时显示待命。",
  },
  weatherLocation: {
    title: "Current-location weather",
    body: "Current-location weather requires browser location permission.",
    zhTitle: "当前位置天气",
    zhBody: "当前位置天气需要浏览器位置权限。",
  },
  weatherDestination: {
    title: "Destination weather",
    body: "Please ask the agent for a navigation route first, then update weather at the parsed destination.",
    zhTitle: "目的地天气",
    zhBody: "请先让助手生成一条导航路线，然后再更新目的地天气。",
  },
  mainlandChinaCoverage: {
    title: "Coverage limitation",
    body: MAINLAND_CHINA_WARNING_TEXT,
    zhTitle: "数据覆盖限制",
    zhBody: MAINLAND_CHINA_WARNING_TEXT,
  },
};

const WEATHER_METRIC_INFO = {
  feelsLike: {
    title: "Feels like temperature",
    body: "This combines air temperature with factors such as wind and humidity to estimate thermal comfort. It is usually more useful than raw temperature when deciding clothing, walking comfort, and whether a route may feel exposed.",
    note: "Use it as the practical comfort reading for your journey.",
    zhTitle: "体感温度",
    zhBody: "体感温度会综合气温、湿度、风等因素，估计人体实际感受到的冷热程度。相比单纯气温，它更适合用来判断穿衣、步行舒适度和路线是否暴露。",
    zhNote: "出行时可把它作为实际舒适度的主要参考。",
  },
  humidity: {
    title: "Relative humidity",
    body: "Relative humidity measures how close the air is to saturation at the current temperature. Higher values reduce evaporative cooling, so warm weather can feel heavier and indoor spaces may feel less comfortable.",
    note: "Around 40-60% is typically comfortable for most indoor activity.",
    zhTitle: "相对湿度",
    zhBody: "相对湿度表示当前温度下空气接近饱和的程度。湿度较高时，人体散热效率下降，暖天会更闷，室内空间也可能更不舒适。",
    zhNote: "一般来说，40-60% 对多数室内活动较为舒适。",
  },
  wind: {
    title: "Wind speed",
    body: "Wind speed indicates how strongly air is moving near the surface. Stronger wind increases heat loss in cool weather, can make cycling less efficient, and may make open walking routes feel more exposed.",
    note: "For route planning, wind matters most on bridges, open roads, and cycling segments.",
    zhTitle: "风速",
    zhBody: "风速表示近地面空气流动的强弱。风较大时，冷天体感会更低，骑行更费力，开放路段步行也会更受影响。",
    zhNote: "规划路线时，桥梁、开阔道路和骑行路段尤其需要关注风速。",
  },
  uv: {
    title: "UV index",
    body: "The UV index estimates the intensity of sunburn-producing ultraviolet radiation. It is not a temperature measure: UV can be high even when the air feels mild.",
    note: "At 3 or above, consider sunscreen or shade for longer outdoor journeys.",
    zhTitle: "紫外线指数",
    zhBody: "紫外线指数衡量可能导致晒伤的紫外线强度。它不是温度指标，即使气温不高，紫外线也可能较强。",
    zhNote: "指数达到 3 或以上时，较长户外行程建议考虑防晒或选择阴凉路线。",
  },
  precipitation: {
    title: "Precipitation probability",
    body: "This is the estimated chance of measurable rain or other precipitation during the forecast period. It describes likelihood, not intensity, so a high value does not necessarily mean heavy rain.",
    note: "For commuting, combine this with sky condition and wind before choosing walking or cycling.",
    zhTitle: "降水概率",
    zhBody: "降水概率表示预报时段内出现可测量降雨或其他降水的可能性。它描述的是概率，不代表雨量大小，因此高概率不一定等于大雨。",
    zhNote: "通勤时建议结合天空状况和风速，再决定是否步行或骑行。",
  },
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
document.querySelectorAll('.useful-links a.link-cta, .footer-useful-links a.footer-useful-link').forEach((el) => {
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
  const title = $("externalConfirmTitle");
  if (title) title.textContent = t("externalConfirmTitle");
  const txt = $("externalConfirmText");
  if (txt) txt.textContent = t("externalConfirm");
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
  activeToolInfoKind = kind;
  activeToolInfoOverrideContent = overrideContent;
  toolInfoTextEl.innerHTML = renderToolInfoContent(kind, overrideContent);
  toolInfoModalEl.hidden = false;
  void toolInfoModalEl.offsetWidth;
  toolInfoModalEl.classList.remove("closing");
  toolInfoModalEl.classList.add("visible");
}

function refreshActiveToolInfo() {
  if (!toolInfoModalEl || !toolInfoTextEl || toolInfoModalEl.hidden || !activeToolInfoKind) return;
  toolInfoTextEl.innerHTML = renderToolInfoContent(activeToolInfoKind, activeToolInfoOverrideContent);
}

function renderToolInfoContent(kind, overrideContent = "") {
  if (kind === "llm") return renderLlmToolInfo();
  if (kind === "agent") return renderAgentToolInfo();
  if (WEATHER_METRIC_INFO[kind]) return renderWeatherMetricInfo(kind);
  return renderGenericToolInfo(kind, overrideContent);
}

function toolInfoCopy(kind, overrideContent = "") {
  const fallback = TOOL_INFO_COPY.llm;
  const info = TOOL_INFO_COPY[kind] || fallback;
  const title = currentLanguage === "zh" ? (info.zhTitle || info.title) : info.title;
  const defaultBody = currentLanguage === "zh" ? (info.zhBody || info.body) : info.body;
  return {
    title,
    body: String(overrideContent || defaultBody || ""),
  };
}

function renderGenericToolInfo(kind, overrideContent = "") {
  const info = toolInfoCopy(kind, overrideContent);
  const paragraphs = info.body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
  return `
    <section class="modal-copy">
      <h3>${escapeHtml(info.title)}</h3>
      <div class="modal-copy-body">${paragraphs}</div>
    </section>
  `;
}

function renderLlmToolInfo() {
  const activeModel = getActiveChatModelOption();
  const currentLabel = activeModel?.label || formatModelDisplayName(integrationStatus.llm) || t("chatModelSwitchUnavailable");
  const modelButtons = getChatModelOptions().length
    ? `
      <div class="chat-model-switcher" role="group" aria-label="${escapeHtml(t("chatModelSectionTitle"))}">
        ${getChatModelOptions().map((option) => `
          <button
            type="button"
            class="chat-model-option${option.id === activeModel?.id ? " is-active" : ""}"
            data-chat-model-id="${escapeHtml(option.id)}"
            aria-pressed="${option.id === activeModel?.id ? "true" : "false"}"
          >
            <strong>${escapeHtml(option.label)}</strong>
            ${option.description ? `<span>${escapeHtml(option.description)}</span>` : ""}
          </button>
        `).join("")}
      </div>
    `
    : `<p class="chat-model-unavailable">${escapeHtml(t("chatModelSwitchUnavailable"))}</p>`;
  return `
    <section class="modal-copy">
      <h3>${escapeHtml(currentLanguage === "zh" ? TOOL_INFO_COPY.llm.zhTitle : TOOL_INFO_COPY.llm.title)}</h3>
      <div class="modal-copy-body">
        <p>${escapeHtml(currentLanguage === "zh" ? TOOL_INFO_COPY.llm.zhBody : TOOL_INFO_COPY.llm.body)}</p>
      </div>
      <div class="chat-model-panel">
        <div class="chat-model-panel-header">
          <strong>${escapeHtml(t("chatModelSectionTitle"))}</strong>
          <span>${escapeHtml(t("chatModelCurrent", { model: currentLabel }))}</span>
        </div>
        <div class="modal-copy-body modal-copy-body--compact">
          <p>${escapeHtml(t("chatModelSectionBody"))}</p>
        </div>
        ${modelButtons}
        <p class="chat-model-helper">${escapeHtml(t("chatModelHelper"))}</p>
      </div>
    </section>
  `;
}

function renderAgentToolInfo() {
  if (currentLanguage === "zh") {
    return `
      <section class="modal-copy">
        <h3>Agent 工具</h3>
        <div class="modal-copy-body">
          <p>模型会在回答时自行选择工具；以下是目前支持的工具列表：</p>
        </div>
        <div class="tool-info-list">
          <div class="tool-info-item"><strong>导航</strong>：使用谷歌地图路线 API 获取实时出行时间、距离和路线。</div>
          <div class="tool-info-item"><strong>路线对比</strong>： 用于比较不同目的地或交通方式的出行估计。</div>
          <div class="tool-info-item"><strong>天气</strong>：使用谷歌天气 API 获取出发点或目的地的当前天气。</div>
          <div class="tool-info-item"><strong>TfL 状态</strong>： 查询路线涉及的伦敦线路是否有延误或中断。</div>
          <div class="tool-info-item"><strong>联网搜索</strong>： 用于百科类和公共事实类问题，并提供来源链接。</div>
        </div>
        <div class="modal-copy-body">
          <p>模型开始调用工具时，这个状态会立即更新。</p>
        </div>
      </section>
    `;
  }
  return `
    <section class="modal-copy">
      <h3>Agent tools</h3>
      <div class="modal-copy-body">
        <p>The model chooses tools itself while answering. If no tool is needed, the signal stays Pending.</p>
      </div>
      <div class="tool-info-list">
        <div class="tool-info-item"><strong>Navigation</strong> uses Google Routes for live travel time, distance, and route geometry.</div>
        <div class="tool-info-item"><strong>Route Comparison</strong> compares travel estimates to destinations based on candidates.</div>
        <div class="tool-info-item"><strong>Weather</strong> uses Google Weather API for current conditions at a start point or destination.</div>
        <div class="tool-info-item"><strong>TfL Status</strong> checks live disruption status for London lines used by a route.</div>
        <div class="tool-info-item"><strong>Web Search</strong> looks up encyclopedia-style and public factual questions with source links.</div>
      </div>
      <div class="modal-copy-body">
        <p>The signal updates as soon as the model starts a tool call.</p>
      </div>
    </section>
  `;
}

function renderWeatherMetricInfo(kind) {
  const info = WEATHER_METRIC_INFO[kind];
  if (!info) return "";
  const title = currentLanguage === "zh" ? info.zhTitle : info.title;
  const body = currentLanguage === "zh" ? info.zhBody : info.body;
  const note = currentLanguage === "zh" ? info.zhNote : info.note;
  return `
    <section class="modal-copy weather-metric-info">
      <h3>${escapeHtml(title)}</h3>
      <div class="modal-copy-body">
        <p>${escapeHtml(body)}</p>
        <p><strong>${currentLanguage === "zh" ? "出行提示：" : "Planning note:"}</strong> ${escapeHtml(note)}</p>
      </div>
    </section>
  `;
}

function hideToolInfo() {
  if (!toolInfoModalEl || toolInfoModalEl.hidden) return;
  activeToolInfoKind = "";
  activeToolInfoOverrideContent = "";
  toolInfoModalEl.classList.remove("visible");
  toolInfoModalEl.classList.add("closing");
  toolInfoModalEl.addEventListener("animationend", function handler() {
    toolInfoModalEl.hidden = true;
    toolInfoModalEl.classList.remove("closing");
    toolInfoModalEl.removeEventListener("animationend", handler);
  });
}

const startupWaitModalEl = $("startupWaitModal");

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

document.querySelectorAll(".weather-metric-card[data-weather-metric]").forEach((card) => {
  const metric = card.dataset.weatherMetric;
  card.addEventListener("click", () => showToolInfo(metric));
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    showToolInfo(metric);
  });
});

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
    const modelButton = event.target.closest("[data-chat-model-id]");
    if (modelButton) {
      setSelectedChatModel(modelButton.dataset.chatModelId);
      return;
    }
    if (event.target === toolInfoModalEl) hideToolInfo();
  });
}
const languageToggleBtn = $("languageToggle");
if (languageToggleBtn) {
  languageToggleBtn.addEventListener("click", () => setLanguage(currentLanguage === "zh" ? "en" : "zh"));
}

function initFooterReveal() {
  const footer = document.querySelector(".footer-reveal");
  if (!footer) return;

  const reveal = () => {
    footer.classList.remove("footer-reveal--pending");
    footer.classList.add("footer-reveal--visible");
  };

  if (!("IntersectionObserver" in window)) {
    reveal();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    reveal();
    observer.disconnect();
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -8% 0px",
  });

  observer.observe(footer);
}

const SCROLL_REVEAL_SELECTOR = [
  ".signal-tile",
  ".agent-tools",
  ".quick-prompts button",
  ".recommendation-module",
  ".weather-module",
  ".weather-metric-card",
  ".tfl-module",
  ".tfl-line",
  ".place-card",
  ".how-grid > div",
].join(", ");

let scrollRevealObserver = null;
let earlyModuleRevealScheduled = false;

function shouldRevealScrollElement(entry) {
  const earlyModuleReveal = entry.target.matches?.(".recommendation-module, .weather-module, .tfl-module");
  return earlyModuleReveal ? entry.intersectionRatio >= 0.08 : entry.intersectionRatio >= 0.14;
}

function revealScrollElement(element) {
  element.classList.remove("scroll-reveal--pending");
  element.classList.add("scroll-reveal--visible");
}

function observeScrollRevealElement(element) {
  if (!(element instanceof HTMLElement)) return;
  if (element.dataset.scrollRevealRegistered === "true") return;
  element.dataset.scrollRevealRegistered = "true";
  element.classList.add("scroll-reveal");
  if (!element.classList.contains("scroll-reveal--visible")) {
    element.classList.add("scroll-reveal--pending");
  }
  if (!scrollRevealObserver) {
    revealScrollElement(element);
    return;
  }
  scrollRevealObserver.observe(element);
}

function registerScrollRevealElements(root = document) {
  if (root instanceof HTMLElement && root.matches(SCROLL_REVEAL_SELECTOR)) {
    observeScrollRevealElement(root);
  }
  root.querySelectorAll?.(SCROLL_REVEAL_SELECTOR).forEach(observeScrollRevealElement);
}

function revealPeekingModules() {
  document.querySelectorAll(".recommendation-module.scroll-reveal--pending, .weather-module.scroll-reveal--pending, .tfl-module.scroll-reveal--pending").forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80 && rect.bottom > 0) {
      revealScrollElement(element);
      scrollRevealObserver?.unobserve(element);
    }
  });
}

function schedulePeekingModuleReveal() {
  if (earlyModuleRevealScheduled) return;
  earlyModuleRevealScheduled = true;
  window.requestAnimationFrame(() => {
    earlyModuleRevealScheduled = false;
    revealPeekingModules();
  });
}

function initScrollReveal() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".scroll-reveal--pending").forEach(revealScrollElement);
    registerScrollRevealElements();
    return;
  }

  scrollRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!shouldRevealScrollElement(entry)) return;
      revealScrollElement(entry.target);
      scrollRevealObserver.unobserve(entry.target);
    });
  }, {
    threshold: [0.08, 0.14],
    rootMargin: "0px 0px -7% 0px",
  });

  registerScrollRevealElements();
  revealPeekingModules();
  window.addEventListener("scroll", schedulePeekingModuleReveal, { passive: true });
  window.addEventListener("resize", schedulePeekingModuleReveal);

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) registerScrollRevealElements(node);
      });
    });
    schedulePeekingModuleReveal();
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
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

applyLanguage();
render();
initScrollReveal();
initFooterReveal();
refreshIntegrationStatus();
refreshTflStatus();
window.setInterval(renderShuttleLookup, 60000);
