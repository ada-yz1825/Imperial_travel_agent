# Imperial Study Navigator

Imperial Study Navigator is a web app that helps Imperial College London students choose study spaces and plan routes. It combines a conversational LLM assistant, Imperial library/study-space recommendations, Google Maps route estimates, and an interactive map-based starting point picker. It answers in the same language as the user.


## GitHub Pages

Click The Link to visit the demo:

[View the live website](https://ada-yz1825.github.io/Imperial_travel_agent/)


## Features

- Conversational study assistant for Imperial libraries and study spaces.
- Study-space recommendations based on selected starting location, walking comfort limit, and study goal.
- Google Maps start-point picker, with campus presets as fallback.
- Navigation mode that compares public transport, walking, cycling, and driving when the user clearly asks for a route.
- Interactive route preview map with selectable transport modes.
- LLM intent classification, so general chat, study planning, and navigation use different behavior.
- Context-aware navigation, for example asking “Where is Oxford?” and then “navigate there”.
- Groq API support by default, with optional Ollama provider support.
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
- A Groq API key for the default hosted LLM mode
- Google Maps backend Routes key, plus a separate browser Maps key for the map display

The app is dependency-light and uses Python's built-in HTTP server stack. There is no npm install step.


## Optional Local Mode

If you want to experiment with a local model, you can run Ollama instead of Groq:

```bash
ollama run qwen3
export LLM_PROVIDER=ollama
export OLLAMA_MODEL=qwen3
PORT=8001 python3 server.py
```

## How It Works

The frontend sends user questions to the backend. The backend first classifies the request:

- Conversation: normal chat, no study or route tool required.
- Study planning: use local Imperial study-space data and LLM response generation.
- Navigation: use Google Routes only when the user clearly asks for travel, directions, distance, commute, or a route to a destination. An introduduction of destination will also be included.

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


## Troubleshooting

If the page cannot connect:

- Check that your deployed backend is reachable.
- Open the backend `/api/health` endpoint to confirm status.

If navigation says Google Maps is unavailable:

- Confirm `.env` contains both `GOOGLE_MAPS_API_KEY` and `GOOGLE_MAPS_BROWSER_KEY`.
- Confirm Routes API is enabled in Google Cloud.
- Restart `server.py` after changing `.env`.

If LLM answers are missing:

- Confirm `.env` or your hosting provider has `LLM_PROVIDER=groq` and `GROQ_API_KEY`.
- If using Ollama mode, make sure Ollama is running.
- Check `/api/health` for `llmConnected`.

If route or intent behavior feels wrong:

- The backend logic is in `server.py`.
- The frontend request flow is in `app.js`.
- The quick prompts and page text are in `index.html`.
