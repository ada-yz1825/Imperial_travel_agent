# Imperial Study Navigator

Imperial Study Navigator is a web app for Imperial College London students. It combines a conversational agent, study-space recommendations, route planning, and a map-based starting point picker. The interface supports general chat, study planning, and navigation, and responds in the same language as the user where possible.

## Demo

- Live website: https://ada-yz1825.github.io/Imperial_travel_agent/

- Fallback site: https://imperial-travel-agent-api.onrender.com/

## What the Page Includes

- A hero section with the main product name and short description.
- A starting-point picker using Google Maps plus campus presets.
- Study-space recommendations based on study goal and walking comfort limit.
- A conversational agent area for planning, exploration, and navigation.
- Route preview support with transport mode switching.
- Useful Imperial links.
- A footer disclaimer stating this is an independent project.

## Project Structure

```text
.
├── index.html          # Main page structure
├── styles.css          # Layout, styling, and animations
├── app.js              # Frontend logic and page behavior
├── server.py           # Static server and API backend
├── assets/             # Study-space and library images
├── image.jpg           # Background image
└── image_files/        # Logo and related image assets
```

## Requirements

- Python 3
- A Groq API key for the hosted LLM mode
- Google Maps keys for the browser map and routing features

The app is dependency-light and uses Python's built-in HTTP server stack. There is no npm install step.

## Optional Local Mode

To try a local model with Ollama:

```bash
ollama run qwen3
export LLM_PROVIDER=ollama
export OLLAMA_MODEL=qwen3
PORT=8001 python3 server.py
```

## How It Works

The frontend sends user questions to the backend. The backend classifies the request into one of three modes:

- Conversation: normal chat.
- Study planning: Imperial study-space recommendations.
- Navigation: route planning when the user clearly asks for travel or directions.

For navigation, the app uses the selected starting location when the user does not provide an explicit origin. It then compares travel modes, shows a route preview, can surface weather context when available, and can open Google Maps for the full route.

## API Endpoints

- `GET /api/health`  
  Returns LLM and Google Maps configuration status.

- `POST /api/intent`  
  Classifies a question as conversation, study planning, or navigation.

- `POST /api/chat`  
  Returns an LLM answer for general chat and study planning.

- `POST /api/navigate`  
  Parses a navigation request, calls Google Routes, and returns the answer plus route data.

- `POST /api/routes`  
  Updates study-space recommendation route estimates.

## Current Data Sources

- Imperial study-space data is maintained locally in `server.py`.
- Route times, distances, and route geometry come from Google Routes API.
- The LLM is used for intent recognition, natural-language answers, and route summaries.
- Crowding and comfort values are heuristic estimates rather than live occupancy data.

## Troubleshooting

If the page cannot connect:

- Check that the deployed backend is reachable.
- Open `/api/health` to confirm status.

If navigation says Google Maps is unavailable:

- Confirm your environment variables include the required Google Maps keys.
- Confirm Routes API is enabled in Google Cloud.
- Restart `server.py` after changing environment variables.

If LLM answers are missing:

- Confirm the LLM provider and API key are configured correctly.
- If using Ollama mode, make sure Ollama is running.
- Check `/api/health` for `llmConnected`.

If route or intent behavior feels wrong:

- Backend logic is in `server.py`.
- Frontend request flow is in `app.js`.
- UI copy and layout are in `index.html` and `styles.css`.
