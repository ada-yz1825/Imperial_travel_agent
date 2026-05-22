# Imperial Study Navigator

Imperial Study Navigator is a local web app that helps Imperial College London students choose study spaces and plan routes. It combines a conversational LLM assistant, Imperial library/study-space recommendations, Google Maps route estimates, and an interactive map-based starting point picker.

The app supports English and Chinese. It answers in the same language as the user.

## Features

- Conversational study assistant for Imperial libraries and study spaces.
- Study-space recommendations based on selected starting location, walking comfort limit, and study goal.
- Google Maps start-point picker, with campus presets as fallback.
- Navigation mode that compares public transport, walking, cycling, and driving when the user clearly asks for a route.
- Interactive route preview map with selectable transport modes.
- LLM intent classification, so general chat, study planning, and navigation use different behavior.
- Context-aware navigation, for example asking “Where is Oxford?” and then “navigate there”.
- Local Ollama support by default, with optional OpenAI provider support.
- Useful Imperial links and a chat modal for continuing the conversation.

## Project Structure

```text
.
├── index.html          # Main UI
├── styles.css          # Layout, styling, animations
├── app.js              # Frontend logic, map rendering, chat state
├── server.py           # Static server and API backend
├── assets/             # Library and study-space images
├── image.jpg           # Page background image
├── image_files/        # Logo/image assets
├── DEPLOYMENT.md       # Deployment notes
└── README.md
```

## Requirements

- Python 3
- Ollama, if using the default local LLM mode
- A local model installed in Ollama, default: `qwen3`
- Google Maps API key with the Routes API enabled

The app is dependency-light and uses Python's built-in HTTP server stack. There is no npm install step.

## GitHub Pages Mode

GitHub Pages can host only the static files in this repository. It cannot run `server.py`, Ollama, or private environment variables. The Pages version therefore keeps the frontend static and connects back to your local machine for the API.

1. On your laptop, keep Ollama running:

```bash
ollama run qwen3
```

2. Start the local API backend from this repository:

```bash
PORT=8001 python3 server.py
```

3. Open the GitHub Pages URL for this repository. When the page is not running on localhost, the frontend automatically calls:

```text
http://localhost:8001
```

If you use a different local port, add an API override to the Pages URL:

```text
https://ada-yz1825.github.io/Imperial_travel_agent/?api=http://localhost:8002
```

The override is saved in browser local storage for hosted Pages visits, so future hosted visits will keep using that API base until you open the page with another `?api=...` value or clear site data. Localhost development still uses same-origin `/api` calls.

`server.py` enables CORS for `/api/*` endpoints so the GitHub Pages origin can call your local backend. To restrict allowed origins, add this to `.env`:

```bash
CORS_ALLOWED_ORIGINS="https://ada-yz1825.github.io"
```

Your Google Maps key still lives in local `.env`; the backend exposes it to the browser only so Google Maps JavaScript can load. For a public Pages demo, restrict that key in Google Cloud by HTTP referrer and API scope.

## Setup

1. Install Ollama from <https://ollama.com/>.

2. Pull or run the default model:

```bash
ollama run qwen3
```

3. Create a `.env` file in the project root:

```bash
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
```

Make sure the Google Cloud project has the Routes API enabled. The same key is also exposed to the browser so the frontend can load Google Maps; restrict the key appropriately before public deployment.

For better separation, you can optionally use a second browser-only key:

```bash
GOOGLE_MAPS_BROWSER_KEY="your_maps_javascript_api_browser_key"
```

`GOOGLE_MAPS_API_KEY` is used by the local backend for Routes API calls. `GOOGLE_MAPS_BROWSER_KEY`, when present, is sent to the browser for Google Maps JavaScript. If `GOOGLE_MAPS_BROWSER_KEY` is empty, the app falls back to `GOOGLE_MAPS_API_KEY`.

## Run Locally

From the project folder:

```bash
PORT=8001 python3 server.py
```

Then open:

```text
http://localhost:8001/
```

If port `8001` is already in use, either stop the old process or choose another port:

```bash
PORT=8002 python3 server.py
```

## Optional OpenAI Mode

The default provider is Ollama. To use OpenAI instead:

```bash
export LLM_PROVIDER=openai
export OPENAI_API_KEY="your_openai_api_key"
export OPENAI_MODEL="gpt-5.2"
PORT=8001 python3 server.py
```

## How It Works

The frontend sends user questions to the backend. The backend first classifies the request:

- Conversation: normal chat, no study or route tool required.
- Study planning: use local Imperial study-space data and LLM response generation.
- Navigation: use Google Routes only when the user clearly asks for travel, directions, distance, commute, or a route to a destination.

For navigation, the backend extracts origin and destination from free text. If the user gives no explicit origin, the app uses the selected starting location from the map or campus dropdown. The backend then calls Google Routes, compares travel modes, and asks the LLM to summarize the result naturally.

## API Endpoints

- `GET /api/health`  
  Returns LLM and Google Maps configuration status.

- `POST /api/intent`  
  Classifies a question as conversation, study planning, or navigation.

- `POST /api/chat`  
  Streams or returns an LLM answer for general chat and study planning.

- `POST /api/navigate`  
  Parses a navigation request, calls Google Routes, and returns the answer plus route data.

- `POST /api/routes`  
  Updates study-space recommendation route estimates.

## Current Data Sources

- Imperial study-space data is maintained locally in `server.py`.
- Route times, distances, and route geometry come from Google Routes API.
- The LLM is used for intent recognition, natural-language answers, and route summaries.
- Crowding/comfort values are currently estimated heuristics, not live occupancy data.

## Notes on Deployment

This project can run locally, on GitHub Pages plus a local backend, or behind a temporary tunnel such as ngrok/Cloudflare Tunnel for demos. For a fully public deployment that does not require your laptop, use a hosted server or cloud platform and set environment variables securely.

Important deployment considerations:

- Do not commit real API keys.
- Restrict Google Maps keys by domain/IP and API scope.
- Ollama must be running wherever `server.py` runs if using local model mode.
- For a permanently available public app, deploy to a cloud VM or app platform rather than relying on a personal laptop.

See `DEPLOYMENT.md` for more deployment notes.

## Troubleshooting

If the page cannot connect:

- Check that the server is running on the expected port.
- Open `http://localhost:8001/api/health` to confirm backend status.

If navigation says Google Maps is unavailable:

- Confirm `.env` contains `GOOGLE_MAPS_API_KEY`.
- Confirm Routes API is enabled in Google Cloud.
- Restart `server.py` after changing `.env`.

If LLM answers are missing:

- Make sure Ollama is running.
- Run `ollama run qwen3`.
- Check `/api/health` for `llmConnected`.

If route or intent behavior feels wrong:

- The backend logic is in `server.py`.
- The frontend request flow is in `app.js`.
- The quick prompts and page text are in `index.html`.
