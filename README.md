# Imperial Travel Agent

Imperial Travel Agent is an MCP-first travel and study-space assistant for Imperial College London students and visitors. The web app combines a tool-calling LLM, Google Routes, Google Weather, TfL live status data, and local Imperial study-space metadata so users can ask natural-language questions, compare routes, check disruption risk, and find suitable places to study or work.

## Demo

- Live website: https://ada-yz1825.github.io/Imperial_travel_agent/
- Backend / fallback site: https://imperial-travel-agent-api.onrender.com/
- Project guide: [Imperial Travel Agent Project Guide](Imperial_Travel_Agent_Project_Guide_EN.pdf)

## Highlights

- Bilingual interface with English and Chinese switching.
- Tool-calling agent for navigation, route comparison, live weather, TfL status, and web search.
- Study-space recommendations based on goal, comfort score, and walking tolerance.
- Public transport routing with Google Routes transit steps, line names, stops, and transfer details.
- Interactive route map with line-colored transit segments and station hover popups.
- Live TfL status panel with disruption badges, translated Chinese status details, and official-style line colors.
- Weather module with current conditions, localized labels, AI-generated 1-2 sentence summaries, and metric explanations.
- Smooth streaming answer rendering, Markdown table support, and mobile-optimized layout.
- GitHub Pages-compatible static frontend with a separate backend API adapter.

## What It Does

### Travel Agent

The agent accepts natural-language questions such as:

- "How do I get from South Kensington Campus to White City?"
- "Will the Tube delay affect this route?"
- "What's the weather at my destination?"
- "Search the web for information about a place or topic."

When a route needs live data, the agent uses tools instead of guessing. For public transport, `navigate` returns transit lines and steps from Google Routes. If the route involves TfL lines, the agent can then call `tfl_status` and include live disruption information in the answer.

### Study & Work Spaces

The app ranks Imperial-related libraries and study spaces using local metadata, walking tolerance, study scenario, and comfort heuristics. It can suggest quiet spaces, group-work spaces, late-night options, or nearby seats.

### Weather

The weather module can update conditions for:

- the selected start point,
- the browser's current location,
- the parsed destination from a navigation result.

It shows temperature, feels-like temperature, humidity, wind, UV index, and precipitation probability. The AI summary is regenerated in the active language and constrained to short, practical guidance.

### TfL Status

The TfL module shows live London line status using the TfL Unified API. Each line uses its recognizable color, a compact status badge, and a hover tooltip for detailed disruption information. In Chinese mode, service states and common disruption details are translated while line and station names are preserved.

### Route Map

For public transport routes, the map can show:

- route segments colored by transit line,
- walking and transit transfer sections,
- start and destination markers,
- station hover popups with station name, board/transfer/alight role, route line, and other available lines.

## Runtime Flow

1. `app.js` handles UI state, streaming output, map rendering, language switching, and API calls.
2. `server.py` serves the frontend and exposes a small HTTP API for the browser.
3. `mcp_server.py` owns the MCP tool registry and tool-calling behavior.
4. `navigator_core.py` performs shared LLM, Google Routes, weather, parsing, and route-normalization work.
5. The frontend renders Markdown, route previews, weather cards, TfL status, chat history, and map interactions.

## Project Structure

```text
.
├── app.js                    # Frontend logic, rendering, streaming, maps, i18n
├── index.html                # Page structure and GitHub Pages entrypoint
├── styles.css                # Layout, animations, responsive design, visual styling
├── favicon.svg               # GitHub Pages-compatible browser tab icon
├── server.py                 # HTTP adapter that talks to MCP
├── mcp_server.py             # MCP stdio/HTTP server and tool registry
├── navigator_core.py         # Shared LLM, routing, weather, and parsing logic
├── assets/                   # Study-space/library images
├── image_files/image.jpg     # High-resolution page background image
└── .github/workflows/        # GitHub Pages deployment workflow
```

## MCP Tools

The MCP server exposes these main tools:

- `agent_answer` - tool-calling LLM entrypoint for browser chat.
- `chat_complete` - direct LLM completion helper.
- `classify_intent` - classifies study-space vs navigation intent.
- `route_matrix` - live Google Routes matrix for study-space comparisons.
- `navigate` - parses navigation requests and returns route JSON, transit steps, transit lines, route segments, and route stops.
- `weather_current` - current weather lookup.
- `tfl_status` - live TfL line status lookup, optionally filtered to route-relevant lines.
- `web_search` - web search for public factual or encyclopedia-style questions.
- `health` - backend and integration status.

## Browser API Endpoints

The HTTP adapter in `server.py` keeps the browser API small and stable:

- `GET /api/health`
- `POST /api/chat`
- `POST /api/navigate`
- `POST /api/routes`
- `POST /api/intent`
- `GET /api/tfl-status`

## Requirements

- Python 3
- A configured LLM provider: `openai`, `groq`, `together`, or `ollama`
- Google Maps browser key for map, geocoding, and weather features
- Google Routes key for route planning and route comparison
- Google Weather access if you want live weather results
- Network access to TfL Unified API for live London line status

The project does not use npm packages. The backend and MCP layers are implemented with Python and the configured external API providers.

## Getting Started

### 1. Configure environment variables

At minimum, set the provider and the keys for the features you want to use.

```bash
export LLM_PROVIDER=together
export TOGETHER_API_KEY=your_together_key
export TOGETHER_MODEL=Qwen/Qwen3-235B-A22B-Instruct-2507-tput
export TOGETHER_CHAT_MODELS_JSON='[{"id":"qwen235b","label":"Qwen3 235B","model":"Qwen/Qwen3-235B-A22B-Instruct-2507-tput","description":"Current default model"},{"id":"glm52","label":"GLM-5.2","model":"zai-org/GLM-5.2","description":"Higher-capability model"}]'
export WEATHER_SUMMARY_TOGETHER_MODEL=Qwen/Qwen2.5-7B-Instruct-Turbo
export GOOGLE_MAPS_API_KEY=your_routes_key
export GOOGLE_MAPS_BROWSER_KEY=your_browser_maps_and_weather_key
```

For a browser frontend hosted separately from the backend, set an API base if needed:

```bash
export IMPERIAL_MCP_SERVER_URL=http://localhost:8002/mcp
# or
export IMPERIAL_MCP_COMMAND="python3 /path/to/mcp_server.py"
```

### 2. Run locally

```bash
python3 server.py
```

The server serves the frontend and starts `mcp_server.py` over stdio by default. Open the local address shown in the terminal.

To use a specific port:

```bash
PORT=8002 python3 server.py
```

To validate the dual-model switcher locally with the static page on `8768` and the backend on `8001`:

```bash
PORT=8001 python3 server.py
python3 -m http.server 8768
```

Then open:

```text
http://localhost:8768/?api=http://localhost:8001
```

### 3. Optional local LLM mode

```bash
export LLM_PROVIDER=ollama
export OLLAMA_MODEL=qwen3
ollama run qwen3
python3 server.py
```

## Data Sources

- Imperial study-space metadata is defined locally in `navigator_core.py`.
- Study-space images live in `assets/library-images/`.
- The page background image lives at `image_files/image.jpg`.
- Live routes, transit steps, stop locations, and route geometry come from Google Routes.
- Live weather comes from Google Weather.
- Live London line status comes from the TfL Unified API.
- Agent answers and tool selection come from the configured LLM provider.
- Crowd and comfort scores are heuristic estimates, not live occupancy data.

## GitHub Pages Deployment

The static frontend is deployed with `.github/workflows/pages.yml`.

The workflow copies:

```text
index.html
app.js
styles.css
favicon.svg
assets/
image_files/image.jpg
```

Important notes:

- The background image is `image_files/image.jpg`, not a root-level `image.jpg`.
- Keep `favicon.svg` at the repository root so the relative icon path works on GitHub Pages.
- The frontend can be hosted statically, but live agent features still require the backend API.
- If GitHub Pages is served from a project subpath, keep frontend asset paths relative, such as `./styles.css` and `./favicon.svg`.

## Troubleshooting

If the UI is blank or the backend is offline:

- Check `GET /api/health`.
- Make sure `server.py` is running.
- Confirm your LLM provider and Google keys are configured.
- Check the frontend API base if using a hosted static page with a remote backend.

If route data is missing:

- Confirm `GOOGLE_MAPS_API_KEY` is set.
- Confirm Google Routes API is enabled in Google Cloud.
- Restart the server after changing environment variables.

If weather data is missing:

- Confirm `GOOGLE_MAPS_BROWSER_KEY` is set.
- Confirm Weather API is enabled for the browser key.
- Check browser key referrer restrictions.

If maps do not render on a custom port:

- Add that local origin or deployed domain to the Google Maps browser key allowlist.

If GitHub Pages fails during build:

- Make sure the workflow does not reference removed root assets such as `image.jpg`.
- Confirm `image_files/image.jpg` and `favicon.svg` exist and are committed.

## Development Notes

- Frontend rendering and request flow are in `app.js`.
- HTTP routing and static serving are in `server.py`.
- Tool definitions and tool-calling behavior are in `mcp_server.py`.
- Shared LLM and Google API logic is in `navigator_core.py`.
- Styling, responsive behavior, and UI animation are in `styles.css`.

## Limitations

- Study-space occupancy is not live.
- TfL disruption reason translation is rule-based; line and station names are preserved.
- Routes, weather, and transport status depend on external API availability.
- The app performs best for London and Imperial-related journeys.
