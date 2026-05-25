# Imperial Travel Agent

Imperial Travel Agent is an MCP-first web app for Imperial College London students (ALSO for others). The browser UI lets users ask natural-language questions about study spaces, routes, and weather, while the backend delegates the real work to MCP tools exposed by `mcp_server.py`.

## Demo

- Live website: https://ada-yz1825.github.io/Imperial_travel_agent/

- Backend / fallback site: https://imperial-travel-agent-api.onrender.com/

## What It Does

- Recommends study spaces based on study goal, comfort, and walking tolerance.
- Compares travel modes and returns live route data from Google Routes.
- Shows current weather for a start point or destination.
- Renders agent answers, route previews, and chat history in the browser.
- Uses the same MCP tool layer for both chat answers and navigation flows.

### Runtime Flow

1. `app.js` sends user input to `server.py`.
2. `server.py` forwards the request to MCP tools.
3. `mcp_server.py` decides whether to call `agent_answer`, `navigate`, `route_matrix`, `weather_current`, or another tool.
4. `navigator_core.py` performs the actual LLM and Google API work.
5. The frontend renders the response, tables, route preview, and chat history.

## Project Structure

```text
.
├── app.js              # Frontend logic, rendering, and API calls
├── index.html          # Page structure
├── styles.css          # Layout and visual styling
├── server.py           # HTTP adapter that talks to MCP
├── mcp_server.py       # MCP stdio/HTTP server and tool registry
├── navigator_core.py   # Shared LLM, routing, weather, and parsing logic
├── assets/             # Library images and other assets
├── image.jpg           # Hero background image
└── image_files/        # Additional legacy/static front-end assets
```

## MCP Tools

The MCP server currently exposes these tools:

- `agent_answer` - tool-calling LLM entrypoint for browser chat
- `chat_complete` - direct LLM completion helper
- `classify_intent` - classifies study vs navigation intent
- `route_matrix` - live Google Routes matrix for study-space comparisons
- `navigate` - parses navigation requests and returns route JSON
- `weather_current` - current weather lookup
- `health` - backend and integration status

## API Endpoints

The HTTP adapter in `server.py` keeps the browser API small and stable:

- `GET /api/health`
- `POST /api/chat`
- `POST /api/navigate`
- `POST /api/routes`
- `POST /api/intent`

## Requirements

- Python 3
- A configured LLM provider: `openai`, `groq`, `together`, or `ollama`
- Google Maps / Routes keys for routing features
- Google Weather access if you want live weather results

The project does not use npm packages. The backend and MCP layers are implemented with the Python standard library plus your configured API providers.

## Getting Started

### 1. Configure environment variables

At minimum, set the provider and the required keys for the features you want to use.

Example for hosted use:

```bash
export LLM_PROVIDER=together
export TOGETHER_API_KEY=your_together_key
export GOOGLE_MAPS_API_KEY=your_routes_key
export GOOGLE_MAPS_BROWSER_KEY=your_browser_maps_and_weather_key
```

### 2. Run the HTTP adapter

```bash
python3 server.py
```

By default, the server serves the frontend and talks to `mcp_server.py` over stdio. Open the app in the browser at the local server address shown in the terminal.

### 3. Optional: use a custom MCP server location

If you want `server.py` to talk to a remote MCP server instead of launching `mcp_server.py` locally, set one of these:

```bash
export IMPERIAL_MCP_SERVER_URL=http://localhost:8002/mcp
# or
export IMPERIAL_MCP_COMMAND="python3 /path/to/mcp_server.py"
```

## Optional Local LLM Mode

To use Ollama locally:

```bash
export LLM_PROVIDER=ollama
export OLLAMA_MODEL=qwen3
ollama run qwen3
python3 server.py
```

## Current Data Sources

- Imperial study-space metadata is defined locally in `navigator_core.py`.
- Live route times, distances, and polyline geometry come from Google Routes.
- Live weather comes from Google Weather.
- Chat responses and tool selection come from the configured LLM provider.
- Crowd/comfort scores are heuristic estimates, not live occupancy data.

## Troubleshooting

If the UI is blank or the backend is offline:

- Check `GET /api/health`.
- Make sure `server.py` is running.
- Confirm your LLM provider and Google keys are configured.

If route data is missing:

- Confirm `GOOGLE_MAPS_API_KEY` is set.
- Confirm Google Routes API is enabled in Google Cloud.
- Restart the server after changing environment variables.

If weather data is missing:

- Confirm `GOOGLE_MAPS_BROWSER_KEY` is set.
- Check the browser key referrer restrictions.

If you want to inspect the behavior:

- Frontend rendering and request flow are in `app.js`.
- The HTTP/MCP bridge is in `server.py`.
- Tool definitions and tool-calling behavior are in `mcp_server.py`.
- Shared LLM/Google logic is in `navigator_core.py`.

## Hosting Notes

For hosted deployments, keep the browser frontend pointed at the correct backend API base and set the same provider/Google variables in the deployment environment. The app is designed so the frontend stays thin while the MCP layer owns the actual reasoning, routing, and weather lookups.