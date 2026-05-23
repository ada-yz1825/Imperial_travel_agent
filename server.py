import json
import math
import os
import re
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

try:
    from zoneinfo import ZoneInfo
except ImportError:
    ZoneInfo = None


APP_NAME = "Imperial Study Navigator"
OPENAI_API_URL = "https://api.openai.com/v1/responses"
GROQ_API_URL = os.environ.get("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")
GOOGLE_ROUTES_API_URL = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix"
GOOGLE_COMPUTE_ROUTES_API_URL = "https://routes.googleapis.com/directions/v2:computeRoutes"
OLLAMA_API_URL = os.environ.get("OLLAMA_API_URL", "http://localhost:11434/api/chat")
LLM_PROVIDER = os.environ.get("LLM_PROVIDER", "ollama").lower()
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-5.2")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "qwen/qwen3-32b")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen3")
OLLAMA_NUM_PREDICT = int(os.environ.get("OLLAMA_NUM_PREDICT", "240"))
CHAT_HISTORY_LIMIT = int(os.environ.get("CHAT_HISTORY_LIMIT", "6"))
GROQ_MAX_COMPLETION_TOKENS = int(os.environ.get("GROQ_MAX_COMPLETION_TOKENS", "750"))
GROQ_JSON_MAX_COMPLETION_TOKENS = int(os.environ.get("GROQ_JSON_MAX_COMPLETION_TOKENS", "1500"))
GROQ_NAVIGATION_MAX_COMPLETION_TOKENS = int(os.environ.get("GROQ_NAVIGATION_MAX_COMPLETION_TOKENS", "1500"))
GOOGLE_TRAVEL_MODE = os.environ.get("GOOGLE_TRAVEL_MODE", "TRANSIT")
IMPERIAL_SHUTTLE_URL = "https://www.imperial.ac.uk/admin-services/property/travel/shuttle-bus/"
IMPERIAL_SHUTTLE_CAMPUSES = {
    "south kensington": "South Kensington",
    "white city": "White City",
    "hammersmith": "Hammersmith",
}
COMMAND_PLACE_TEXTS = {
    "导航",
    "路线",
    "怎么去",
    "怎么走",
    "如何去",
    "去",
    "到",
    "我要",
    "我想",
    "请",
    "please",
    "navigate",
    "directions",
    "route",
    "go",
    "get",
    "travel",
    "head",
}
CONTEXTUAL_PLACE_TEXTS = {"这里", "这儿", "那里", "那儿", "这个地方", "那个地方", "here", "there", "this place", "that place"}


def get_env_value(name):
    value = os.environ.get(name)
    if value:
        return value.strip()

    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        return ""

    with open(env_path, "r", encoding="utf-8") as env_file:
        for line in env_file:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, raw_value = line.split("=", 1)
            if key.strip() == name:
                return raw_value.strip().strip('"').strip("'")
    return ""


def get_google_maps_api_key():
    return get_env_value("GOOGLE_MAPS_API_KEY")


def get_google_maps_browser_key():
    return get_env_value("GOOGLE_MAPS_BROWSER_KEY")


def get_llm_provider():
    return (get_env_value("LLM_PROVIDER") or LLM_PROVIDER or "ollama").lower()


def get_openai_api_key():
    return get_env_value("OPENAI_API_KEY")


def get_groq_api_key():
    return get_env_value("GROQ_API_KEY")


def get_openai_model():
    return get_env_value("OPENAI_MODEL") or OPENAI_MODEL


def get_groq_model():
    return get_env_value("GROQ_MODEL") or GROQ_MODEL


def get_ollama_model():
    return get_env_value("OLLAMA_MODEL") or OLLAMA_MODEL


def current_llm_model():
    provider = get_llm_provider()
    if provider == "openai":
        return get_openai_model()
    if provider == "groq":
        return get_groq_model()
    return get_ollama_model()


def check_llm_health():
    provider = get_llm_provider()
    if provider == "openai":
        configured = bool(get_openai_api_key())
        return {
            "connected": configured,
            "label": f"OpenAI {get_openai_model()}" if configured else "OpenAI key missing",
        }

    if provider == "groq":
        configured = bool(get_groq_api_key())
        return {
            "connected": configured,
            "label": get_groq_model() if configured else "Groq key missing",
        }

    try:
        request = urllib.request.Request(OLLAMA_API_URL.replace("/api/chat", "/api/tags"), method="GET")
        with urllib.request.urlopen(request, timeout=1.5):
            pass
        return {"connected": True, "label": f"Ollama {get_ollama_model()}"}
    except Exception:
        return {"connected": False, "label": "Ollama offline"}


KNOWN_LOCATIONS = {
    "south kensington": {"name": "South Kensington Campus", "lat": 51.498356, "lng": -0.176894},
    "south kensington campus": {"name": "South Kensington Campus", "lat": 51.498356, "lng": -0.176894},
    "南肯": {"name": "South Kensington Campus", "lat": 51.498356, "lng": -0.176894},
    "南肯辛顿": {"name": "South Kensington Campus", "lat": 51.498356, "lng": -0.176894},
    "南肯辛顿校区": {"name": "South Kensington Campus", "lat": 51.498356, "lng": -0.176894},
    "imperial": {"name": "South Kensington Campus", "lat": 51.498356, "lng": -0.176894},
    "imperial college": {"name": "South Kensington Campus", "lat": 51.498356, "lng": -0.176894},
    "abdus salam": {"name": "Abdus Salam Library", "lat": 51.498356, "lng": -0.176894},
    "abdus salam library": {"name": "Abdus Salam Library", "lat": 51.498356, "lng": -0.176894},
    "主图书馆": {"name": "Abdus Salam Library", "lat": 51.498356, "lng": -0.176894},
    "中央图书馆": {"name": "Abdus Salam Library", "lat": 51.498356, "lng": -0.176894},
    "central library": {"name": "Abdus Salam Library", "lat": 51.498356, "lng": -0.176894},
    "gostudy": {"name": "GoStudy and Student Space", "lat": 51.4984, "lng": -0.1752},
    "student space": {"name": "GoStudy and Student Space", "lat": 51.4984, "lng": -0.1752},
    "white city": {"name": "White City Campus", "lat": 51.515768, "lng": -0.224009},
    "white city campus": {"name": "White City Campus", "lat": 51.515768, "lng": -0.224009},
    "白城": {"name": "White City Campus", "lat": 51.515768, "lng": -0.224009},
    "白城校区": {"name": "White City Campus", "lat": 51.515768, "lng": -0.224009},
    "hammersmith": {"name": "Hammersmith Campus", "lat": 51.517420, "lng": -0.234721},
    "hammersmith campus": {"name": "Hammersmith Campus", "lat": 51.517420, "lng": -0.234721},
    "hammersmith hospital": {"name": "Hammersmith Campus", "lat": 51.517420, "lng": -0.234721},
    "哈默史密斯": {"name": "Hammersmith Campus", "lat": 51.517420, "lng": -0.234721},
    "哈默史密斯校区": {"name": "Hammersmith Campus", "lat": 51.517420, "lng": -0.234721},
    "st mary's": {"name": "St Mary's Campus", "lat": 51.517403, "lng": -0.174169},
    "st marys": {"name": "St Mary's Campus", "lat": 51.517403, "lng": -0.174169},
    "st mary's campus": {"name": "St Mary's Campus", "lat": 51.517403, "lng": -0.174169},
    "st marys campus": {"name": "St Mary's Campus", "lat": 51.517403, "lng": -0.174169},
    "圣玛丽": {"name": "St Mary's Campus", "lat": 51.517403, "lng": -0.174169},
    "圣玛丽校区": {"name": "St Mary's Campus", "lat": 51.517403, "lng": -0.174169},
    "charing cross": {"name": "Charing Cross Campus Library", "lat": 51.4872, "lng": -0.2197},
    "charing cross campus": {"name": "Charing Cross Campus Library", "lat": 51.4872, "lng": -0.2197},
    "chelsea and westminster": {"name": "Chelsea and Westminster Campus Library", "lat": 51.4846, "lng": -0.1819},
    "royal brompton": {"name": "Royal Brompton Campus Library", "lat": 51.4892, "lng": -0.1708},
    "silwood park": {"name": "Silwood Park Campus Library", "lat": 51.4113, "lng": -0.6415},
    "british library": {"name": "British Library", "lat": 51.529972, "lng": -0.127675},
    "大英图书馆": {"name": "British Library", "lat": 51.529972, "lng": -0.127675},
    "wellcome collection": {"name": "Wellcome Collection Library", "lat": 51.525900, "lng": -0.134000},
    "wellcome collection library": {"name": "Wellcome Collection Library", "lat": 51.525900, "lng": -0.134000},
    "wellcome library": {"name": "Wellcome Collection Library", "lat": 51.525900, "lng": -0.134000},
    "惠康图书馆": {"name": "Wellcome Collection Library", "lat": 51.525900, "lng": -0.134000},
    "barbican": {"name": "Barbican Library", "lat": 51.519811, "lng": -0.093919},
    "barbican library": {"name": "Barbican Library", "lat": 51.519811, "lng": -0.093919},
    "巴比肯图书馆": {"name": "Barbican Library", "lat": 51.519811, "lng": -0.093919},
    "idea store whitechapel": {"name": "Idea Store Whitechapel", "lat": 51.519853, "lng": -0.057958},
    "whitechapel idea store": {"name": "Idea Store Whitechapel", "lat": 51.519853, "lng": -0.057958},
    "idea store": {"name": "Idea Store Whitechapel", "lat": 51.519853, "lng": -0.057958},
    "白教堂学习中心": {"name": "Idea Store Whitechapel", "lat": 51.519853, "lng": -0.057958},
}

STUDY_PLACES = [
    {
        "name": "Abdus Salam Library",
        "type": "main campus library",
        "lat": 51.498356,
        "lng": -0.176894,
        "tags": ["quiet study", "science resources", "central campus"],
    },
    {
        "name": "GoStudy and Student Space",
        "type": "study space",
        "lat": 51.4984,
        "lng": -0.1752,
        "tags": ["group study", "student workspace", "South Kensington"],
    },
    {
        "name": "Hammersmith Campus Library",
        "type": "medical library",
        "lat": 51.517420,
        "lng": -0.234721,
        "tags": ["medicine", "quiet study", "Hammersmith"],
    },
    {
        "name": "St Mary's Campus Library",
        "type": "medical library",
        "lat": 51.517403,
        "lng": -0.174169,
        "tags": ["medicine", "campus library", "Paddington"],
    },
    {
        "name": "Charing Cross Campus Library",
        "type": "medical library",
        "lat": 51.4872,
        "lng": -0.2197,
        "tags": ["medicine", "quiet study", "Charing Cross"],
    },
    {
        "name": "Chelsea and Westminster Campus Library",
        "type": "medical library",
        "lat": 51.4846,
        "lng": -0.1819,
        "tags": ["medicine", "Chelsea", "campus library"],
    },
    {
        "name": "Royal Brompton Campus Library",
        "type": "medical library",
        "lat": 51.4892,
        "lng": -0.1708,
        "tags": ["medicine", "quiet study", "South Kensington nearby"],
    },
    {
        "name": "Silwood Park Campus Library",
        "type": "campus library",
        "lat": 51.4113,
        "lng": -0.6415,
        "tags": ["green setting", "quiet study", "Silwood Park"],
    },
    {
        "name": "British Library",
        "type": "national library",
        "lat": 51.529972,
        "lng": -0.127675,
        "tags": ["public study space", "reading rooms", "research", "free wifi"],
    },
    {
        "name": "Wellcome Collection Library",
        "type": "public research library",
        "lat": 51.525900,
        "lng": -0.134000,
        "tags": ["public study space", "quiet study", "medicine", "research"],
    },
    {
        "name": "Barbican Library",
        "type": "public library",
        "lat": 51.519811,
        "lng": -0.093919,
        "tags": ["public library", "study space", "free wifi", "arts"],
    },
    {
        "name": "Idea Store Whitechapel",
        "type": "public library and learning centre",
        "lat": 51.519853,
        "lng": -0.057958,
        "tags": ["public library", "learning centre", "study space", "community"],
    },
]


class ImperialNavigatorHandler(SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        if self.path.startswith("/api/"):
            self.send_response(204)
            self.send_cors_headers()
            self.send_header("Access-Control-Max-Age", "86400")
            self.end_headers()
            return

        self.send_error(404, "Not found")

    def do_GET(self):
        if self.path == "/api/health":
            llm_status = check_llm_health()
            self.write_json(
                {
                    "ok": True,
                    "app": APP_NAME,
                    "provider": get_llm_provider(),
                    "model": current_llm_model(),
                    "streaming": get_llm_provider() == "ollama",
                    "llmConnected": llm_status["connected"],
                    "llmStatus": llm_status["label"],
                    "googleMapsConfigured": bool(get_google_maps_api_key()),
                    "googleMapsBrowserConfigured": bool(get_google_maps_browser_key()),
                    "googleMapsBrowserKey": get_google_maps_browser_key(),
                }
            )
            return

        super().do_GET()

    def do_POST(self):
        if self.path == "/api/routes":
            self.handle_routes()
            return

        if self.path == "/api/navigate":
            self.handle_navigate()
            return

        if self.path == "/api/intent":
            self.handle_intent()
            return

        if self.path != "/api/chat":
            self.send_error(404, "Not found")
            return

        try:
            payload = self.read_json()
            question = str(payload.get("question", "")).strip()
            if not question:
                self.write_json({"error": "请先输入一个问题。"}, status=400)
                return

            provider = get_llm_provider()
            if provider == "openai":
                api_key = get_openai_api_key()
                if not api_key:
                    self.write_json(
                        {
                            "error": "未配置 OPENAI_API_KEY。请在启动服务前设置环境变量，然后重新提问。",
                            "setup": "LLM_PROVIDER=openai OPENAI_API_KEY=你的密钥 python3 server.py",
                        },
                        status=500,
                    )
                    return

                answer = call_openai(api_key, payload)
                self.write_json({"answer": answer, "model": get_openai_model(), "provider": "openai"})
                return

            if provider == "groq":
                api_key = get_groq_api_key()
                if not api_key:
                    self.write_json(
                        {
                            "error": "未配置 GROQ_API_KEY。请在启动服务前设置环境变量，然后重新提问。",
                            "setup": "LLM_PROVIDER=groq GROQ_API_KEY=你的密钥 python3 server.py",
                        },
                        status=500,
                    )
                    return

                answer = call_groq(api_key, payload)
                self.write_json({"answer": answer, "model": get_groq_model(), "provider": "groq"})
                return

            self.stream_ollama(payload)
        except urllib.error.HTTPError as error:
            message = error.read().decode("utf-8", errors="replace")
            self.write_json({"error": format_model_http_error(message)}, status=error.code)
        except urllib.error.URLError:
            self.write_json(
                {
                    "error": "无法连接本地 Ollama 服务。请确认 Ollama 已安装并正在运行。",
                    "setup": f"ollama run {get_ollama_model()}",
                },
                status=503,
            )
        except Exception as error:
            self.write_json({"error": f"服务端错误：{error}"}, status=500)

    def handle_routes(self):
        try:
            api_key = get_google_maps_api_key()
            if not api_key:
                self.write_json({"error": "GOOGLE_MAPS_API_KEY is not configured."}, status=500)
                return

            payload = self.read_json()
            start = payload.get("start", {})
            destinations = payload.get("destinations", [])
            if not valid_lat_lng(start) or not destinations:
                self.write_json({"error": "Route request requires a start point and destinations."}, status=400)
                return

            routes = call_google_route_matrix(api_key, start, destinations)
            self.write_json({"routes": routes, "provider": "google_routes", "travelMode": GOOGLE_TRAVEL_MODE})
        except urllib.error.HTTPError as error:
            message = error.read().decode("utf-8", errors="replace")
            self.write_json({"error": f"Google Routes API failed: {message}"}, status=error.code)
        except Exception as error:
            self.write_json({"error": f"Route calculation failed: {error}"}, status=500)

    def handle_intent(self):
        try:
            payload = self.read_json()
            question = str(payload.get("question", "")).strip()
            if not question:
                self.write_json({"mode": "study", "confidence": 0, "reason": "empty question"})
                return

            decision = classify_agent_intent(question, payload.get("contextStart"), payload.get("history", []))
            self.write_json(decision)
        except Exception as error:
            self.write_json({"mode": "study", "confidence": 0, "reason": f"Intent check failed: {error}"})

    def handle_navigate(self):
        try:
            api_key = get_google_maps_api_key()
            if not api_key:
                self.write_json({"error": "GOOGLE_MAPS_API_KEY is not configured."}, status=500)
                return

            payload = self.read_json()
            query = str(payload.get("query", "")).strip()
            route_request = parse_navigation_query(query, payload.get("history", []))
            apply_context_start(route_request, payload.get("contextStart"))
            if not route_request.get("origin") or not route_request.get("destination"):
                self.write_json(
                    {
                        "error": "Please ask with an origin and destination, for example: from South Kensington to Hammersmith Campus.",
                    },
                    status=400,
                )
                return

            modes = navigation_mode_candidates(route_request.get("mode"))
            route_options = []
            route_errors = []
            for mode in modes:
                try:
                    route = call_google_matrix_route(
                        api_key,
                        route_request["origin"],
                        route_request["destination"],
                        mode,
                        route_request["departureTime"],
                    )
                    if route:
                        route_options.append(route)
                    else:
                        route_errors.append(f"{mode_label(mode)}: Google returned no route element.")
                except urllib.error.HTTPError as error:
                    route_errors.append(f"{mode_label(mode)}: {read_http_error(error)}")
                except urllib.error.URLError as error:
                    route_errors.append(f"{mode_label(mode)}: {error.reason}")

            if not route_options:
                answer = build_navigation_answer(query, route_request, [], route_errors)
                self.write_json(
                    {
                        "answer": answer,
                        "origin": route_request["origin"]["name"],
                        "destination": route_request["destination"]["name"],
                        "recommended": None,
                        "alternatives": [],
                        "provider": "google_routes",
                        "details": route_errors[:4],
                    }
                )
                return

            requested_mode = route_request.get("mode")
            if requested_mode:
                route_options.sort(key=lambda item: (0 if item["mode"] == requested_mode else 1, item["durationMinutes"]))
            else:
                route_options.sort(key=lambda item: item["durationMinutes"])
            for route in route_options:
                attach_route_geometry(api_key, route_request, route)
            answer = build_navigation_answer(query, route_request, route_options, route_errors)
            self.write_json(
                {
                    "answer": answer,
                    "origin": route_request["origin"]["name"],
                    "destination": route_request["destination"]["name"],
                    "recommended": route_options[0],
                    "mapRoute": route_options[0],
                    "alternatives": route_options[1:],
                    "provider": "google_routes",
                }
            )
        except urllib.error.HTTPError as error:
            message = error.read().decode("utf-8", errors="replace")
            self.write_json({"error": f"Google Routes API failed: {message}"}, status=error.code)
        except Exception as error:
            self.write_json({"error": f"Navigation failed: {error}"}, status=500)

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))

    def write_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_cors_headers()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", get_cors_origin(self.headers.get("Origin")))
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def stream_json(self, payload):
        line = json.dumps(payload, ensure_ascii=False).encode("utf-8") + b"\n"
        self.wfile.write(line)
        self.wfile.flush()

    def stream_ollama(self, payload):
        self.send_response(200)
        self.send_header("Content-Type", "application/x-ndjson; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_cors_headers()
        self.end_headers()

        try:
            streamed_any = False
            for delta in call_ollama_stream(payload):
                streamed_any = True
                self.stream_json({"delta": delta})
            if not streamed_any:
                self.stream_json({"delta": "本地模型返回为空。可以尝试换用 qwen2.5:3b 或进一步降低 OLLAMA_NUM_PREDICT。"})
            self.stream_json({"done": True, "model": OLLAMA_MODEL, "provider": "ollama"})
        except BrokenPipeError:
            return
        except urllib.error.URLError:
            self.stream_json({"error": "无法连接本地 Ollama 服务。请确认 Ollama 已安装并正在运行。"})
        except Exception as error:
            self.stream_json({"error": f"服务端错误：{error}"})


def get_cors_origin(request_origin):
    if not request_origin:
        return "*"

    allowed_origins = get_env_value("CORS_ALLOWED_ORIGINS")
    if allowed_origins == "*":
        return "*"

    origins = {origin.strip() for origin in allowed_origins.split(",") if origin.strip()} or default_cors_origins()
    if request_origin in origins:
        return request_origin

    return "null"


def default_cors_origins():
    return {
        "https://ada-yz1825.github.io",
        "http://localhost:8000",
        "http://localhost:8001",
        "http://localhost:8002",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8001",
        "http://127.0.0.1:8002",
    }


def call_google_route_matrix(api_key, start, destinations):
    request_body = json.dumps(
        {
            "origins": [{"waypoint": {"location": {"latLng": lat_lng(start)}}}],
            "destinations": [
                {"waypoint": {"location": {"latLng": lat_lng(destination)}}}
                for destination in destinations
                if valid_lat_lng(destination)
            ],
            "travelMode": GOOGLE_TRAVEL_MODE,
            "departureTime": current_departure_time(),
            "units": "METRIC",
        },
        ensure_ascii=False,
    ).encode("utf-8")

    request = urllib.request.Request(
        GOOGLE_ROUTES_API_URL,
        data=request_body,
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": "originIndex,destinationIndex,duration,distanceMeters,status,condition",
        },
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        raw = response.read().decode("utf-8", errors="replace")

    elements = parse_google_matrix_response(raw)
    routes = {}
    valid_destinations = [destination for destination in destinations if valid_lat_lng(destination)]
    for element in elements:
        destination_index = element.get("destinationIndex")
        if destination_index is None or destination_index >= len(valid_destinations):
            continue
        destination = valid_destinations[destination_index]
        duration_seconds = parse_duration_seconds(element.get("duration", ""))
        distance_meters = element.get("distanceMeters")
        routes[destination["name"]] = {
            "name": destination["name"],
            "transitMinutes": max(1, round(duration_seconds / 60)) if duration_seconds else None,
            "distanceKm": round(distance_meters / 1000, 2) if isinstance(distance_meters, (int, float)) else None,
            "status": element.get("status", {}),
            "condition": element.get("condition"),
        }

    return routes


def call_google_matrix_route(api_key, origin, destination, mode, departure_time):
    body = {
        "origins": [{"waypoint": waypoint(origin)}],
        "destinations": [{"waypoint": waypoint(destination)}],
        "travelMode": mode,
        "units": "METRIC",
    }
    if mode in {"TRANSIT", "DRIVE"}:
        body["departureTime"] = departure_time
    if mode == "DRIVE":
        body["routingPreference"] = "TRAFFIC_AWARE"

    request = urllib.request.Request(
        GOOGLE_ROUTES_API_URL,
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": "originIndex,destinationIndex,duration,distanceMeters,status,condition",
        },
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        raw = response.read().decode("utf-8", errors="replace")

    elements = parse_google_matrix_response(raw)
    if not elements:
        return None

    element = elements[0]
    duration_seconds = parse_duration_seconds(element.get("duration", ""))
    distance_meters = element.get("distanceMeters")
    condition = element.get("condition")
    if condition and condition != "ROUTE_EXISTS":
        return None
    if not duration_seconds:
        return None

    return {
        "mode": mode,
        "modeLabel": mode_label(mode),
        "durationMinutes": max(1, round(duration_seconds / 60)),
        "distanceKm": round(distance_meters / 1000, 2) if isinstance(distance_meters, (int, float)) else None,
        "condition": condition,
        "status": element.get("status", {}),
    }


def call_google_compute_route(api_key, origin, destination, mode, departure_time):
    body = {
        "origin": waypoint(origin),
        "destination": waypoint(destination),
        "travelMode": mode,
        "computeAlternativeRoutes": False,
        "languageCode": "en-GB",
        "units": "METRIC",
    }
    if mode in {"TRANSIT", "DRIVE"}:
        body["departureTime"] = departure_time
    if mode == "DRIVE":
        body["routingPreference"] = "TRAFFIC_AWARE"

    request = urllib.request.Request(
        GOOGLE_COMPUTE_ROUTES_API_URL,
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.description,routes.localizedValues,routes.polyline.encodedPolyline",
        },
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        data = json.loads(response.read().decode("utf-8", errors="replace"))

    routes = data.get("routes", [])
    if not routes:
        return None

    route = routes[0]
    duration_seconds = parse_duration_seconds(route.get("duration", ""))
    distance_meters = route.get("distanceMeters")
    return {
        "mode": mode,
        "modeLabel": mode_label(mode),
        "durationMinutes": max(1, round(duration_seconds / 60)) if duration_seconds else None,
        "distanceKm": round(distance_meters / 1000, 2) if isinstance(distance_meters, (int, float)) else None,
        "description": route.get("description", ""),
        "polyline": route.get("polyline", {}).get("encodedPolyline", ""),
    }


def attach_route_geometry(api_key, route_request, route):
    try:
        geometry = call_google_compute_route(
            api_key,
            route_request["origin"],
            route_request["destination"],
            route["mode"],
            route_request.get("departureTime"),
        )
    except Exception:
        return

    if not geometry or not geometry.get("polyline"):
        return

    route["polyline"] = geometry["polyline"]
    if geometry.get("description"):
        route["description"] = geometry["description"]


def parse_navigation_query(query, history=None):
    language = detect_response_language(query)
    if is_destination_information_query(query):
        return {
            "language": language,
            "origin": None,
            "destination": None,
            "origin_source": None,
            "mode": None,
            "departureTime": parse_departure_time(query),
            "_llm_is_navigation": False,
            "_llm_reason": "destination information / attractions question",
        }
    llm_request = extract_navigation_request_with_llm(query, history or [])
    llm_says_not_navigation = llm_request and not llm_request.get("is_navigation")
    origin_text = None if llm_says_not_navigation else (llm_request.get("origin") if llm_request else None)
    destination_text = None if llm_says_not_navigation else (llm_request.get("destination") if llm_request else None)

    if not llm_says_not_navigation and not origin_text and not destination_text:
        origin_text, destination_text = extract_origin_destination(query)
        if not destination_text:
            destination_text = extract_destination_only(query)

    if not llm_says_not_navigation and llm_request and llm_request.get("origin_is_context"):
        origin_text = None
    if not llm_says_not_navigation and llm_request and llm_request.get("destination_is_context"):
        destination_text = infer_recent_place_from_history(history or [])
    if is_command_place_text(origin_text):
        origin_text = None
    if is_command_place_text(destination_text):
        destination_text = None
    if is_contextual_place_text(origin_text):
        origin_text = None
    if is_contextual_place_text(destination_text):
        destination_text = infer_recent_place_from_history(history or [])
    mode = normalize_travel_mode(llm_request.get("mode")) if llm_request else None
    if not mode:
        mode = detect_travel_mode(query)
    departure_time = parse_departure_time(query)
    route_request = {
        "language": language,
        "origin": resolve_location(origin_text) if origin_text else None,
        "destination": resolve_location(destination_text) if destination_text else None,
        "origin_source": "query" if origin_text else None,
        "mode": mode,
        "departureTime": departure_time,
    }
    if llm_request:
        route_request["_llm_is_navigation"] = bool(llm_request.get("is_navigation"))
        route_request["_llm_reason"] = str(llm_request.get("reason") or "")[:160]
    return route_request


def extract_navigation_request_with_llm(query, history=None):
    prompt = build_navigation_extraction_prompt(query, history or [])
    try:
        provider = get_llm_provider()
        if provider == "openai":
            api_key = get_openai_api_key()
            if not api_key:
                return None
            raw = call_openai_json(
                api_key,
                "Extract navigation intent and route endpoints. Return JSON only.",
                prompt,
                max_output_tokens=220,
            )
        elif provider == "groq":
            api_key = get_groq_api_key()
            if not api_key:
                return None
            raw = call_groq_json(
                api_key,
                "Extract navigation intent and route endpoints. Return JSON only.",
                prompt,
                max_completion_tokens=GROQ_JSON_MAX_COMPLETION_TOKENS,
            )
        else:
            raw = call_ollama_once(
                [
                    {
                        "role": "system",
                        "content": (
                            "You extract navigation intent and route endpoints. "
                            "Return compact JSON only, with no markdown and no explanations."
                        ),
                    },
                    {"role": "user", "content": f"/no_think\n{prompt}"},
                ]
            )
        data = parse_json_object(raw)
    except Exception:
        return None

    if not isinstance(data, dict):
        return None

    return {
        "is_navigation": bool(data.get("is_navigation")),
        "origin": clean_llm_place_text(data.get("origin")),
        "destination": clean_llm_place_text(data.get("destination")),
        "origin_is_context": bool(data.get("origin_is_context")),
        "destination_is_context": bool(data.get("destination_is_context")),
        "mode": normalize_travel_mode(data.get("mode")),
        "reason": str(data.get("reason") or "")[:160],
    }


def build_navigation_extraction_prompt(query, history):
    recent_history = []
    for item in (history or [])[-6:]:
        if not isinstance(item, dict):
            continue
        role = "assistant" if item.get("role") == "assistant" else "user"
        content = str(item.get("content") or "").strip()
        if content:
            recent_history.append({"role": role, "content": content[:220]})

    payload = {
        "user_message": query,
        "recent_conversation": recent_history,
        "known_alias_examples": [
            "South Kensington / 南肯",
            "White City / 白城",
            "Hammersmith / 哈默史密斯",
            "Oxford / 牛津",
        ],
        "task": (
            "Decide whether this message asks for navigation, directions, travel time, route comparison, or distance. "
            "Extract origin and destination only when the user actually states them or clearly refers to a previous place."
        ),
        "output_json_schema": {
            "is_navigation": "boolean",
            "origin": "string or null",
            "destination": "string or null",
            "origin_is_context": "boolean, true for here/这里/selected place/current location",
            "destination_is_context": "boolean, true for there/这里/这个地方/it when it means a place from recent conversation",
            "mode": "TRANSIT, WALK, BICYCLE, DRIVE, or null",
            "reason": "short string",
        },
        "rules": [
            "Never invent locations. Do not use example places unless the user mentioned them.",
            "Do not treat command words as places: 导航, 路线, 怎么去, navigate, route, directions, go, get, travel.",
            "If the user is asking for an introduction, attractions, sightseeing, what to see, what to do, or interesting places in a city, set is_navigation false.",
            "Examples that are not navigation: 介绍牛津, 牛津有哪些好玩的景点, tell me about Oxford, what to see in Paris, what to do in Cambridge.",
            "For '导航去牛津' or 'go to Oxford', origin is null and destination is 牛津/Oxford.",
            "For '那帮我导航去这里', '然后帮我导航去那里', or similar, words before the route command are conversational filler, not an origin.",
            "For '从南肯到白城' or 'from South Kensington to White City', extract both places.",
            "For '导航去这里', set destination to null and destination_is_context to true.",
            "For '从这里去白城', set origin to null, origin_is_context to true, destination to 白城.",
            "For '介绍牛津', '牛津是哪里', 'where is Oxford', or 'tell me about Oxford', set is_navigation false even though a place is mentioned.",
            "For 'Which Imperial library is nearby from my selected starting point?' or similar nearby-library recommendation questions, set is_navigation false unless the user asks how to travel to a named destination.",
            "If the message is about studying, food, chat, or general advice without travel intent, set is_navigation false.",
            "Return JSON only.",
        ],
    }
    return json.dumps(payload, ensure_ascii=False)


def extract_destination_only(query):
    text = " ".join(str(query or "").strip().split())
    english = re.search(r"\b(?:go|get|travel|head|navigate|directions?)\s+(?:to|towards)\s+(.+?)(?:[?.!。？]|$)", text, re.IGNORECASE)
    if english:
        candidate = clean_place_text(english.group(1))
        return None if is_command_place_text(candidate) else candidate

    chinese_nav = re.search(r"(?:导航|路线|怎么走|怎么去|如何去)\s*(?:去|到)?\s*(.+?)(?:[，。？！?]|$)", text)
    if chinese_nav:
        candidate = clean_place_text(chinese_nav.group(1))
        return None if is_command_place_text(candidate) else candidate

    chinese = re.search(r"(?:想|要|准备|打算|我要|我想)?\s*(?:去|到)\s*(.+?)(?:怎么去|怎么走|如何去|路线|导航|要多久|多久|多远|[，。？！?]|$)", text)
    if chinese:
        candidate = clean_place_text(chinese.group(1))
        return None if is_command_place_text(candidate) else candidate

    return None


def classify_agent_intent(question, context_start=None, history=None):
    if is_destination_information_query(question):
        empty_route_request = {"origin": None, "destination": None, "mode": None}
        return intent_payload("study", 0.94, "destination information / attractions question", empty_route_request)
    route_request = parse_navigation_query(question, history or [])
    apply_context_start(route_request, context_start)
    has_route_points = bool(route_request.get("origin") and route_request.get("destination"))
    has_destination_only = bool(route_request.get("destination") and valid_lat_lng(context_start or {}))
    route_words = has_navigation_language(question)
    study_words = has_study_language(question)
    llm_is_navigation = route_request.get("_llm_is_navigation")

    if is_nearby_study_recommendation_without_route_goal(question):
        return intent_payload("study", 0.9, "nearby study-space recommendation without explicit travel destination", route_request)
    if llm_is_navigation and (has_route_points or has_destination_only):
        return intent_payload("navigation", 0.93, route_request.get("_llm_reason") or "llm route extraction", route_request)
    if llm_is_navigation is False:
        return intent_payload("study", 0.75, route_request.get("_llm_reason") or "llm says no route request", route_request)
    if has_route_points and route_words:
        return intent_payload("navigation", 0.95, "origin, destination and route wording found", route_request)
    if has_destination_only and route_words:
        return intent_payload("navigation", 0.88, "destination and selected start context found", route_request)
    if study_words and not route_words:
        return intent_payload("study", 0.8, "study planning wording found", route_request)

    llm_decision = classify_agent_intent_with_llm(question, route_request)
    if llm_decision:
        return llm_decision

    return intent_payload("study", 0.45, "fallback to study planning", route_request)


def apply_context_start(route_request, context_start):
    if route_request.get("origin") or not route_request.get("destination"):
        return
    if not valid_lat_lng(context_start):
        return
    name = str(context_start.get("name") or "Selected start point").strip()
    source = str(context_start.get("source") or "").strip()
    route_request["origin"] = {
        "name": name if source != "map" else f"{name} on map",
        "lat": context_start["lat"],
        "lng": context_start["lng"],
    }
    route_request["origin_source"] = "context"


def intent_payload(mode, confidence, reason, route_request):
    return {
        "mode": mode,
        "confidence": confidence,
        "reason": reason,
        "origin": route_request.get("origin", {}).get("name") if route_request.get("origin") else None,
        "destination": route_request.get("destination", {}).get("name") if route_request.get("destination") else None,
        "travelMode": route_request.get("mode"),
    }


def classify_agent_intent_with_llm(question, route_request):
    prompt = json.dumps(
        {
            "question": question,
            "parsed_origin": route_request.get("origin"),
            "parsed_destination": route_request.get("destination"),
            "task": (
                "Classify whether the assistant should call a navigation/routes tool or answer as a study-space planner. "
                "Return only JSON: {\"mode\":\"navigation\"|\"study\", \"confidence\":0-1, \"reason\":\"short\"}. "
                "Choose navigation when the user asks how to get somewhere, travel time, route comparison, commute, distance between two places, or moving from A to B. "
                "Choose study when the user asks where to study, quiet places, library choice, crowding, facilities, comfort, or preferences without a route request. "
                "If the user asks which/what Imperial library is nearby from a selected start point, choose study unless they clearly ask how to travel to a named destination."
            ),
        },
        ensure_ascii=False,
    )
    try:
        provider = get_llm_provider()
        if provider == "openai":
            api_key = get_openai_api_key()
            if not api_key:
                return None
            raw = call_openai_navigation(api_key, prompt)
        elif provider == "groq":
            api_key = get_groq_api_key()
            if not api_key:
                return None
            raw = call_groq_messages(
                api_key,
                [
                    {"role": "system", "content": "You are an intent classifier. Return compact JSON only, with no markdown."},
                    {"role": "user", "content": prompt},
                ],
                max_completion_tokens=GROQ_JSON_MAX_COMPLETION_TOKENS,
                temperature=0,
            )
        else:
            raw = call_ollama_once(
                [
                    {
                        "role": "system",
                        "content": "You are an intent classifier. Return compact JSON only, with no markdown.",
                    },
                    {"role": "user", "content": f"/no_think\n{prompt}"},
                ]
            )
        data = parse_json_object(raw)
        mode = "navigation" if data.get("mode") == "navigation" else "study"
        confidence = float(data.get("confidence", 0.6))
        reason = str(data.get("reason", "llm intent classifier"))[:160]
        return intent_payload(mode, max(0, min(1, confidence)), reason, route_request)
    except Exception:
        return None


def parse_json_object(text):
    raw = str(text or "").strip()
    match = re.search(r"\{.*\}", raw, flags=re.DOTALL)
    if match:
        raw = match.group(0)
    return json.loads(raw)


def has_navigation_language(question):
    text = str(question or "").lower()
    route_patterns = [
        r"\bfrom\s+.+\s+to\s+.+",
        r"\bhow\s+(?:do|can|should)\s+i\s+get\b",
        r"\btravel\s+time\b",
        r"\broute\b",
        r"\bdirections?\b",
        r"\bnavigate\b",
        r"\bcommute\b",
        r"\bwalk(?:ing)?\b",
        r"\bcycle|cycling|bike\b",
        r"\bdrive|driving\b",
    ]
    chinese_terms = ["怎么去", "怎么走", "路线", "导航", "通勤", "从", "到", "去", "之间", "走过去", "坐车", "地铁", "公交", "骑车", "开车", "多久", "多远", "比较快", "最快"]
    return any(re.search(pattern, text) for pattern in route_patterns) or any(term in question for term in chinese_terms)


def is_nearby_study_recommendation_without_route_goal(question):
    text = str(question or "").lower()
    study_targets = [
        "library",
        "libraries",
        "study space",
        "study spaces",
        "workspace",
        "seat",
        "图书馆",
        "学习空间",
        "自习室",
        "座位",
    ]
    nearby_or_choice = [
        "nearby",
        "nearest",
        "closest",
        "near me",
        "selected starting point",
        "selected start",
        "current selected",
        "which",
        "what",
        "where",
        "recommend",
        "附近",
        "最近",
        "周边",
        "哪个",
        "哪些",
        "哪里",
        "推荐",
        "有什么",
    ]
    if not any(term in text for term in study_targets):
        return False
    if not any(term in text for term in nearby_or_choice):
        return False
    return not has_explicit_route_goal(question)


def has_explicit_route_goal(question):
    text = str(question or "").lower()
    english_patterns = [
        r"\bfrom\s+.+\s+to\s+.+",
        r"\bhow\s+(?:do|can|should)\s+i\s+get\s+to\b",
        r"\b(?:navigate|directions?|route|travel|go|get|head)\s+(?:to|towards)\b",
        r"\btravel\s+time\s+to\b",
    ]
    chinese_patterns = [
        r"从.+(?:到|去).+",
        r"(?:导航|路线|怎么去|怎么走|如何去)\s*(?:去|到)?\s*.+",
        r"(?:去|到).+(?:怎么去|怎么走|路线|导航|要多久|多久|多远)",
    ]
    return any(re.search(pattern, text, flags=re.IGNORECASE) for pattern in english_patterns) or any(
        re.search(pattern, str(question or "")) for pattern in chinese_patterns
    )


def has_study_language(question):
    text = str(question or "").lower()
    terms = [
        "study",
        "library",
        "quiet",
        "crowded",
        "seat",
        "focus",
        "group",
        "revision",
        "where should i study",
        "学习",
        "图书馆",
        "安静",
        "拥挤",
        "座位",
        "自习",
        "复习",
        "小组",
        "推荐",
        "适合",
    ]
    return any(term in text for term in terms)


def is_destination_information_query(question):
    text = str(question or "").strip().lower()
    if not text:
        return False

    route_markers = [
        "怎么去",
        "怎么走",
        "导航",
        "路线",
        "route",
        "directions",
        "go to",
        "get to",
        "travel to",
        "how do i get",
        "how can i get",
        "from ",
        " to ",
    ]
    if any(marker in text for marker in route_markers):
        return False

    attraction_markers = [
        "有什么好玩",
        "好玩的景点",
        "好玩",
        "景点",
        "旅游",
        "游玩",
        "玩什么",
        "值得去",
        "值得看",
        "介绍",
        "有哪些",
        "what to see",
        "things to do",
        "attractions",
        "sights",
        "tourist",
        "visit",
        "explore",
        "tell me about",
        "what to do",
    ]
    if not any(marker in text for marker in attraction_markers):
        return False

    has_place_name = bool(re.search(r"[\u4e00-\u9fff]{2,}|[A-Za-z][A-Za-z\s.'-]{1,40}", text))
    return has_place_name


def navigation_mode_candidates(requested_mode):
    modes = ["TRANSIT", "WALK", "BICYCLE", "DRIVE"]
    if requested_mode in modes:
        return [requested_mode] + [mode for mode in modes if mode != requested_mode]
    return modes


def extract_origin_destination(query):
    text = " ".join(str(query or "").strip().split())
    english = re.search(r"\bfrom\s+(.+?)\s+to\s+(.+?)(?:\s+(?:by|via|at|around|leaving|departing)\b|[?.!。？]|$)", text, re.IGNORECASE)
    if english:
        return clean_place_text(english.group(1)), clean_place_text(english.group(2))

    chinese = re.search(r"从\s*(.+?)\s*(?:到|去)\s*(.+?)(?:怎么去|怎么走|如何去|路线|导航|[，。？！?]|$)", text)
    if chinese:
        return clean_place_text(chinese.group(1)), clean_place_text(chinese.group(2))

    chinese_at = re.search(r"(?:我)?(?:在|从)\s*(.+?)[，,\s]*(?:想|要|准备|打算)?\s*(?:去|到)\s*(.+?)(?:怎么去|怎么走|如何去|路线|导航|要多久|多久|多远|[，。？！?]|$)", text)
    if chinese_at:
        return clean_place_text(chinese_at.group(1)), clean_place_text(chinese_at.group(2))

    chinese_short = re.search(r"(.+?)\s*(?:到|去)\s*(.+?)(?:怎么去|怎么走|如何去|路线|导航|要多久|多久|多远|[，。？！?]|$)", text)
    if chinese_short and any("\u4e00" <= char <= "\u9fff" for char in text):
        return clean_place_text(chinese_short.group(1)), clean_place_text(chinese_short.group(2))

    known_origin, known_destination = extract_known_location_pair(text)
    if known_origin and known_destination:
        return known_origin, known_destination

    return None, None


def extract_known_location_pair(text):
    key_text = str(text or "").lower().replace("’", "'")
    matches = []
    for alias in sorted(KNOWN_LOCATIONS, key=len, reverse=True):
        alias_key = alias.lower().replace("’", "'")
        index = key_text.find(alias_key)
        if index < 0:
            continue
        location_name = KNOWN_LOCATIONS[alias]["name"]
        if any(existing["name"] == location_name for existing in matches):
            continue
        matches.append({"alias": alias, "name": location_name, "index": index})

    if len(matches) < 2:
        return None, None
    matches.sort(key=lambda item: item["index"])
    return matches[0]["alias"], matches[1]["alias"]


def clean_place_text(value):
    value = str(value or "")
    value = re.sub(r"^(我|俺|本人)?\s*(在|从|想|要|准备|打算)\s*", "", value)
    value = re.sub(
        r"^(那|然后|接着|再|那么|所以|可以|能不能)?\s*(请|帮我|帮忙|给我|麻烦你?)?\s*(导航|路线|怎么去|怎么走|如何去)\s*(去|到)?\s*",
        "",
        value,
    )
    value = re.sub(
        r"\s*(那|然后|接着|再|那么|所以|可以|能不能)?\s*(请|帮我|帮忙|给我|麻烦你?)?\s*(导航|路线|怎么去|怎么走|如何去)\s*$",
        "",
        value,
    )
    value = re.sub(r"\s*(想|要|准备|打算)$", "", value)
    value = re.sub(r"\b(by|via|at|around|leaving|departing)\b.*$", "", value, flags=re.IGNORECASE)
    value = re.sub(r"(坐地铁|坐公交|公交|地铁|步行|走路|骑车|开车|驾车).*$", "", value)
    return value.strip(" ,，。?？!！")


def clean_llm_place_text(value):
    if value is None:
        return None
    text = clean_place_text(value)
    if not text or is_command_place_text(text) or is_contextual_place_text(text):
        return None
    lowered = text.lower().replace("’", "'")
    nullish = {"none", "null", "n/a", "unknown", "not specified", "unspecified", "未指定", "无", "没有"}
    if lowered in nullish:
        return None
    return text[:120]


def normalize_travel_mode(value):
    text = str(value or "").strip().upper()
    aliases = {
        "TRANSIT": "TRANSIT",
        "PUBLIC_TRANSPORT": "TRANSIT",
        "PUBLIC TRANSPORT": "TRANSIT",
        "TUBE": "TRANSIT",
        "BUS": "TRANSIT",
        "TRAIN": "TRANSIT",
        "WALK": "WALK",
        "WALKING": "WALK",
        "BICYCLE": "BICYCLE",
        "BIKE": "BICYCLE",
        "CYCLING": "BICYCLE",
        "DRIVE": "DRIVE",
        "DRIVING": "DRIVE",
        "CAR": "DRIVE",
        "公共交通": "TRANSIT",
        "地铁": "TRANSIT",
        "公交": "TRANSIT",
        "步行": "WALK",
        "走路": "WALK",
        "骑行": "BICYCLE",
        "骑车": "BICYCLE",
        "开车": "DRIVE",
        "驾车": "DRIVE",
    }
    return aliases.get(text)


def is_command_place_text(value):
    text = clean_place_text(value).lower().replace("’", "'")
    return not text or text in COMMAND_PLACE_TEXTS


def is_contextual_place_text(value):
    text = clean_place_text(value).lower().replace("’", "'")
    return text in CONTEXTUAL_PLACE_TEXTS


def infer_recent_place_from_history(history):
    for item in reversed(history[-8:]):
        content = str(item.get("content", "") if isinstance(item, dict) else "")
        candidate = extract_recent_place_from_text(content)
        if candidate:
            return candidate
    return None


def extract_recent_place_from_text(text):
    text = " ".join(str(text or "").strip().split())
    if not text:
        return None

    for alias in sorted(KNOWN_LOCATIONS, key=len, reverse=True):
        alias_key = alias.lower().replace("’", "'")
        if alias_key in text.lower().replace("’", "'"):
            return alias

    patterns = [
        r"(.{1,24}?)(?:是哪里|在哪(?:里)?|是什么地方|在哪里|在哪儿)",
        r"(?:where is|what is|tell me about)\s+([A-Za-z][A-Za-z\s.'-]{1,60})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if not match:
            continue
        candidate = clean_place_text(match.group(1))
        candidate = re.sub(r"^(你知道|请问|想问|我想问)\s*", "", candidate)
        if candidate and not is_command_place_text(candidate) and not is_contextual_place_text(candidate):
            return candidate
    return None


def resolve_location(text):
    raw = clean_place_text(text)
    key = raw.lower().replace("’", "'")
    if key in KNOWN_LOCATIONS:
        return KNOWN_LOCATIONS[key]
    for alias, location in sorted(KNOWN_LOCATIONS.items(), key=lambda item: len(item[0]), reverse=True):
        if alias in key:
            return location
    return {"name": raw, "address": raw}


def detect_travel_mode(query):
    text = str(query or "").lower()
    if any(word in text for word in ["walk", "walking", "步行", "走路", "走过去"]):
        return "WALK"
    if any(word in text for word in ["bike", "cycle", "cycling", "bicycle", "骑车", "自行车"]):
        return "BICYCLE"
    if any(word in text for word in ["drive", "driving", "car", "开车", "驾车"]):
        return "DRIVE"
    if any(word in text for word in ["transit", "tube", "underground", "bus", "train", "地铁", "公交", "公共交通", "坐车", "搭车", "换乘"]):
        return "TRANSIT"
    return None


def parse_departure_time(query):
    london = ZoneInfo("Europe/London") if ZoneInfo else timezone.utc
    now = datetime.now(london)
    text = str(query or "").lower()
    day_offset = 1 if "tomorrow" in text or "明天" in text else 0
    match = re.search(r"\b(?:at\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b", text)
    zh_match = re.search(r"(\d{1,2})点(?:(\d{1,2})分?)?", text)

    if match or zh_match:
        if match:
            hour = int(match.group(1))
            minute = int(match.group(2) or 0)
            marker = match.group(3)
            if marker == "pm" and hour < 12:
                hour += 12
            if marker == "am" and hour == 12:
                hour = 0
        else:
            hour = int(zh_match.group(1))
            minute = int(zh_match.group(2) or 0)
            if ("下午" in text or "晚上" in text) and hour < 12:
                hour += 12

        departure = now.replace(hour=hour, minute=minute, second=0, microsecond=0) + timedelta(days=day_offset)
        if departure < now:
            departure += timedelta(days=1)
    else:
        departure = now

    return departure.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def current_departure_time():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def waypoint(value):
    if valid_lat_lng(value):
        return {"location": {"latLng": lat_lng(value)}}
    return {"address": value.get("address") or value.get("name")}


def mode_label(mode):
    labels = {
        "TRANSIT": "public transport",
        "WALK": "walking",
        "BICYCLE": "cycling",
        "DRIVE": "driving",
    }
    return labels.get(mode, mode.lower())


def format_navigation_answer(query, route_request, routes):
    recommended = routes[0]
    origin = route_request["origin"]["name"]
    destination = route_request["destination"]["name"]
    language = route_request["language"]
    alternatives = routes[1:3]

    if language == "Chinese":
        lines = [
            f"**推荐路线**：从 {origin} 到 {destination}，建议使用 **{recommended['modeLabel']}**。",
            f"预计时间：**{recommended['durationMinutes']} 分钟**；距离：**{recommended['distanceKm']} km**。",
        ]
        if alternatives:
            alt_text = "；".join(f"{item['modeLabel']} 约 {item['durationMinutes']} 分钟" for item in alternatives)
            lines.append(f"备选：{alt_text}。")
        lines.append("时间和距离来自 Google Routes API，按当前或你指定的出发时间计算。")
        return "\n".join(lines)

    lines = [
        f"**Recommended route**: from {origin} to {destination}, use **{recommended['modeLabel']}**.",
        f"Estimated time: **{recommended['durationMinutes']} min**; distance: **{recommended['distanceKm']} km**.",
    ]
    if alternatives:
        alt_text = "; ".join(f"{item['modeLabel']} about {item['durationMinutes']} min" for item in alternatives)
        lines.append(f"Alternatives: {alt_text}.")
    lines.append("Time and distance come from Google Routes API for now or your specified departure time.")
    return "\n".join(lines)


def build_navigation_answer(query, route_request, routes, errors=None):
    study_options = nearby_study_places(route_request.get("destination"), max_distance_km=2.5)
    try:
        answer = call_navigation_llm(query, route_request, routes, errors or [], study_options)
        if answer and navigation_answer_uses_tool_data(answer, routes, route_request):
            return finalize_navigation_answer(answer, route_request, routes, study_options)
    except Exception:
        pass

    if routes:
        return finalize_navigation_answer(format_natural_navigation_answer(route_request, routes), route_request, routes, study_options)
    return format_navigation_failure(route_request, errors or [])


def call_navigation_llm(query, route_request, routes, errors, study_options):
    prompt = navigation_prompt(query, route_request, routes, errors, study_options)
    provider = get_llm_provider()
    if provider == "openai":
        api_key = get_openai_api_key()
        if not api_key:
            return ""
        return call_openai_navigation(api_key, prompt)
    if provider == "groq":
        api_key = get_groq_api_key()
        if not api_key:
            return ""
        return call_groq_messages(
            api_key,
            [
                {
                    "role": "system",
                    "content": (
                        "You are Imperial Study Navigator. You receive route tool results from Google Routes API. "
                        "Use the tool data as facts, compare available transport modes naturally, and give a practical recommendation. "
                        "Match the user's language exactly. Do not invent route data, line names, prices or step-by-step directions."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            max_completion_tokens=GROQ_NAVIGATION_MAX_COMPLETION_TOKENS,
            temperature=0.15,
        )
    return call_ollama_once(
        [
            {
                "role": "system",
                "content": (
                    "You are Imperial Study Navigator. You receive route tool results from Google Routes API. "
                    "Use the tool data as facts, compare available transport modes naturally, and give a practical recommendation. "
                    "Match the user's language exactly. If the user writes Chinese, answer in Chinese. "
            "Do not sound like a rigid template. Keep the answer concise and warm. "
                    "Do not invent route data, line names, prices or step-by-step directions that are not provided. "
                    "Use the exact duration numbers from the tool results. "
                    "Never introduce origin or destination names that are not in the provided route request. "
                    "Do not invent Imperial campuses, libraries, or study spaces. "
                    "After route advice, add one short study-place suggestion only when near_destination_study_options is not empty."
                ),
            },
            {"role": "user", "content": prompt},
        ]
    )


def navigation_prompt(query, route_request, routes, errors, study_options):
    response_language = route_request.get("language", detect_response_language(query))
    requested_mode = route_request.get("mode")
    payload = {
        "response_language": response_language,
        "user_question": query,
        "tool_called": "Google Routes API",
        "origin": route_request["origin"],
        "destination": route_request["destination"],
        "origin_source": route_request.get("origin_source"),
        "requested_mode": mode_label(requested_mode) if requested_mode else None,
        "departure_time_utc": route_request.get("departureTime"),
        "available_routes": routes,
        "route_summary": summarize_routes_for_prompt(routes, response_language),
        "near_destination_study_options": study_options,
        "imperial_weekday_shuttle": imperial_shuttle_context(route_request),
        "route_errors": errors[:4],
        "instructions": [
            "Answer in response_language.",
            "Use the route_summary numbers directly when comparing options.",
            "Compare each available mode using the exact duration and distance in route_summary.",
            "If you mention origin and destination in the first sentence, use exactly the origin and destination fields from this payload. If that would sound uncertain, skip the origin-destination opening and start directly with the route recommendation.",
            "Never use sample or unrelated places such as 清华大学, 帝国理工学院, London, Oxford, or White City unless they appear in the origin/destination fields or the user's question.",
            "If the requested mode is available, discuss it first even if another mode is faster.",
            "Recommend the best practical option, not only the shortest number.",
            "Do not add a destination introduction in this answer; a separate follow-up will handle that.",
            "If near_destination_study_options is not empty and relevant, you may mention one nearby Imperial library or study space, but do not make that the only possible closing.",
            "If near_destination_study_options is empty, simply skip Imperial-specific study-space comments.",
            "If origin_source is 'context', avoid explicitly naming the origin; refer to it as the selected start point or omit it, focusing on the destination.",
            "If the user's query contains only one place, treat that place as the destination and phrase the answer as travel to that destination (do not invent or name an origin).",
            f"If imperial_weekday_shuttle.applies is true, mention briefly that Imperial runs a weekday shuttle between the relevant campuses, and include this clickable Markdown link for the timetable: [Imperial shuttle]({IMPERIAL_SHUTTLE_URL}).",
            "If no routes are available, apologize gently, mention the origin/destination understood, and suggest checking Google Maps directly or trying a more specific place name.",
            "Use a natural conversational style. Avoid a fixed report template.",
            "Produce a complete, self-contained answer; do not end mid-sentence or insert a fixed source sentence."
        ],
    }
    return "/no_think\nWrite the final answer only.\n" + json.dumps(payload, ensure_ascii=False)


def summarize_routes_for_prompt(routes, language):
    if not routes:
        return []
    if language == "Chinese":
        return [
            f"{mode_label_for_language(route['mode'], language)}：{route['durationMinutes']} 分钟，{route.get('distanceKm')} km"
            for route in routes
        ]
    return [
        f"{mode_label_for_language(route['mode'], language)}: {route['durationMinutes']} min, {route.get('distanceKm')} km"
        for route in routes
    ]


def navigation_answer_uses_tool_data(answer, routes, route_request=None):
    if not routes:
        return True
    durations = {str(route.get("durationMinutes")) for route in routes if route.get("durationMinutes") is not None}
    mentioned_durations = set(re.findall(r"(\d+)\s*(?:分钟|min)", answer, flags=re.IGNORECASE))
    if not mentioned_durations:
        return False
    if not mentioned_durations.issubset(durations):
        return False
    if route_request and answer_has_wrong_route_opening(answer, route_request):
        return False
    return not includes_unknown_imperial_study_place(answer)


def includes_unknown_imperial_study_place(answer):
    text = str(answer or "")
    allowed = {place["name"] for place in STUDY_PLACES}
    mentions_imperial_place = re.search(r"Imperial[^。.\n]*(?:Library|Campus|study|space)|帝国理工[^。.\n]*(?:图书馆|校区|学习|自习)", text, flags=re.IGNORECASE)
    if not mentions_imperial_place:
        return False
    return not any(name in text for name in allowed)


def answer_has_wrong_route_opening(answer, route_request):
    first = first_sentence(answer)
    if not first:
        return False
    if not re.search(r"(从.+到|from\s+.+\s+to\s+)", first, flags=re.IGNORECASE):
        return False
    return not route_opening_matches_request(first, route_request)


def remove_bad_route_opening(answer, route_request):
    if not answer_has_wrong_route_opening(answer, route_request):
        return answer
    first = first_sentence(answer)
    return answer[len(first):].lstrip(" \n，,。.!！?")


def first_sentence(answer):
    text = str(answer or "").lstrip()
    match = re.match(r".+?[。！？.!?](?:\s|$)", text, flags=re.DOTALL)
    if match:
        return match.group(0).strip()
    return text.split("\n", 1)[0].strip()


def route_opening_matches_request(opening, route_request):
    destination = route_request.get("destination") or {}
    origin = route_request.get("origin") or {}
    destination_names = location_match_terms(destination)
    origin_names = location_match_terms(origin)
    normalized_opening = normalize_place_match_text(opening)
    has_destination = any(term and term in normalized_opening for term in destination_names)
    if route_request.get("origin_source") == "context":
        return has_destination
    has_origin = any(term and term in normalized_opening for term in origin_names)
    return has_destination and has_origin


def location_match_terms(location):
    terms = []
    for value in [location.get("name"), location.get("address")]:
        normalized = normalize_place_match_text(value)
        if normalized:
            terms.append(normalized)

    name = str(location.get("name") or "").lower().replace("’", "'")
    for alias, known in KNOWN_LOCATIONS.items():
        if known.get("name", "").lower().replace("’", "'") == name:
            normalized = normalize_place_match_text(alias)
            if normalized:
                terms.append(normalized)
    return set(terms)


def normalize_place_match_text(value):
    text = str(value or "").lower().replace("’", "'")
    return re.sub(r"[\s,，。.!！?？:：;；()（）-]+", "", text)


def finalize_navigation_answer(answer, route_request, routes, study_options):
    answer = strip_reasoning_text(answer)
    answer = remove_bad_route_opening(answer, route_request)
    if not study_options:
        answer = remove_unavailable_study_note(answer)
    with_source_note = append_navigation_source_note(answer, route_request, routes)
    with_destination_context = append_destination_context_note(with_source_note, route_request)
    return strip_reasoning_text(append_imperial_shuttle_note(with_destination_context, route_request))


def append_destination_context_note(answer, route_request):
    destination = route_request.get("destination") or {}
    destination_name = str(destination.get("name", "")).strip()
    if not destination_name:
        return answer

    if destination_context_already_mentioned(answer, destination_name):
        return answer

    language = route_request.get("language")
    note = generate_destination_context_note(route_request, destination_name, language)
    if not note:
        note = destination_context_fallback(destination_name, language)
    note = strip_reasoning_text(note)
    if not note:
        return answer

    return f"{answer.rstrip()}\n\n{note}"


def destination_context_already_mentioned(answer, destination_name):
    normalized_answer = normalize_text_for_match(answer)
    normalized_destination = normalize_text_for_match(destination_name)
    if normalized_destination and normalized_destination in normalized_answer:
        context_markers = [
            r"famous for",
            r"known for",
            r"worth exploring",
            r"historic",
            r"大学城",
            r"闻名",
            r"值得",
            r"可逛",
        ]
        return any(re.search(pattern, str(answer), flags=re.IGNORECASE) for pattern in context_markers)
    return False


def generate_destination_context_note(route_request, destination_name, language):
    provider = get_llm_provider()
    prompt = build_destination_context_prompt(destination_name, language)
    developer_text = (
        "You are a travel assistant. Write a short, free-form introduction to the destination as a place to visit. "
        "You may mention what it is known for, its atmosphere, a landmark, history, or a traveler-facing overview. "
        "Do not mention routes, transport times, maps, Imperial, or the fact that this was generated as a follow-up. "
        "Answer in the same language as the user. Do not output hidden reasoning, analysis, scratchpad text, or <think> tags."
    )

    try:
        if provider == "openai":
            api_key = get_openai_api_key()
            if not api_key:
                return ""
            return call_openai_text(api_key, developer_text, prompt, max_output_tokens=260, temperature=0.7)
        if provider == "groq":
            api_key = get_groq_api_key()
            if not api_key:
                return ""
            return call_groq_text(api_key, developer_text, prompt, max_completion_tokens=260, temperature=0.7)
        return call_ollama_once(
            [
                {"role": "system", "content": developer_text},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            num_predict=260,
        )
    except Exception:
        return ""


def build_destination_context_prompt(destination_name, language):
    if language == "Chinese":
        return (
            f"请用中文写一段 2 到 4 句的自由介绍，介绍 {destination_name} 这个地方。"
            "你可以提到它的气质、著名地标、历史背景、当地氛围，或者为什么值得去。"
            "不要提路线、交通时间、地图、Imperial，也不要说这是补充说明。"
            "尽量像真人给朋友介绍目的地一样自然。"
        )

    return (
        f"Write a 2 to 4 sentence free-form introduction to {destination_name} as a place to visit. "
        "You can mention its atmosphere, notable landmarks, history, local character, or why people go there. "
        "Do not mention routes, travel time, maps, Imperial, or that this is a follow-up. "
        "Sound natural, like a human recommending the place to a friend."
    )


def destination_context_fallback(destination_name, language):
    if language == "Chinese":
        return f"到达后也可以顺便花一点时间了解一下 {destination_name} 的当地环境和周边街区。"
    return f"Once you arrive, you can also take a little time to get to know {destination_name} and the surrounding area."


def normalize_text_for_match(value):
    return re.sub(r"\s+", " ", str(value or "").lower().replace("’", "'")).strip()


def imperial_shuttle_context(route_request):
    origin_campus = campus_for_shuttle_place(route_request.get("origin"))
    destination_campus = campus_for_shuttle_place(route_request.get("destination"))
    applies = bool(origin_campus and destination_campus and origin_campus != destination_campus)
    return {
        "applies": applies,
        "operates": "weekdays",
        "campuses": ["South Kensington", "White City", "Hammersmith"],
        "origin_campus": origin_campus,
        "destination_campus": destination_campus,
        "schedule_link_label": "Imperial shuttle",
        "schedule_url": IMPERIAL_SHUTTLE_URL,
    }


def campus_for_shuttle_place(place):
    if not place:
        return None
    name = str(place.get("name", "")).lower()
    for key, label in IMPERIAL_SHUTTLE_CAMPUSES.items():
        if key in name:
            return label
    return None


def append_imperial_shuttle_note(answer, route_request):
    context = imperial_shuttle_context(route_request)
    if not context["applies"]:
        return answer
    if re.search(r"\bshuttle\b|班车|穿梭巴士|校车", answer, flags=re.IGNORECASE):
        return answer

    if route_request.get("language") == "Chinese":
        note = (
            "另外，Imperial 在工作日运营连接 South Kensington、White City 和 Hammersmith 的班车；"
            f"如果你需要，可以使用下方链接查看具体时间表：[Imperial shuttle]({IMPERIAL_SHUTTLE_URL})。"
        )
    else:
        note = (
            "Also, Imperial runs a weekday shuttle connecting South Kensington, White City and Hammersmith; "
            f"use [Imperial shuttle]({IMPERIAL_SHUTTLE_URL}) to check the timetable."
        )
    return f"{answer.rstrip()}\n\n{note}"


def remove_unavailable_study_note(answer):
    patterns = [
        r"[^。！？\n]*(?:没有|暂无|未找到)[^。！？\n]*Imperial[^。！？\n]*(?:学习空间|图书馆|校区|推荐)[^。！？\n]*[。！？]?",
        r"[^。！？\n]*(?:没有|暂无|未找到)[^。！？\n]*Imperial[^。！？\n]*(?:学习|学术|资源|地点|推荐)[^。！？\n]*[。！？]?",
        r"[^.!?\n]*(?:no|not|without)[^.!?\n]*Imperial[^.!?\n]*(?:study|library|campus|space|recommendation)[^.!?\n]*[.!?]?",
        r"[^.!?\n]*(?:no|not|without)[^.!?\n]*Imperial[^.!?\n]*(?:academic|resource|place|recommendation)[^.!?\n]*[.!?]?",
    ]
    cleaned = answer
    for pattern in patterns:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)
    return re.sub(r"\n{3,}", "\n\n", cleaned).strip()


def localize_study_tag(tag, language):
    if language != "Chinese":
        return tag
    labels = {
        "quiet study": "安静学习",
        "science resources": "理工科资源",
        "central campus": "主校区学习",
        "group study": "小组学习",
        "student workspace": "学生自习",
        "South Kensington": "南肯辛顿",
        "White City": "白城校区",
        "campus support": "校区学习支持",
        "study access": "学习空间",
        "medicine": "医学资源",
        "Hammersmith": "哈默史密斯",
        "campus library": "校区图书馆",
        "Paddington": "帕丁顿附近",
        "Charing Cross": "查令十字",
        "Chelsea": "切尔西",
        "South Kensington nearby": "南肯辛顿附近",
        "green setting": "安静绿地环境",
        "Silwood Park": "Silwood Park",
    }
    return labels.get(tag, tag)


def append_navigation_source_note(answer, route_request, routes):
    if not routes:
        return answer
    if route_request.get("language") == "Chinese":
        note = "路线用时和距离由 Google Maps 实时计算得出。"
        cleaned = remove_source_note_sentence(answer, r"Google\s*(?:Maps|地图)", r"实时|live")
    else:
        note = "Route time and distance are calculated live by Google Maps."
        cleaned = remove_source_note_sentence(answer, r"Google\s*(?:Maps|map)", r"live|calculated|real[- ]?time")
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    if note in cleaned:
        return cleaned
    return insert_navigation_source_note(cleaned, note, route_request.get("language"))


def insert_navigation_source_note(answer, note, language):
    paragraphs = re.split(r"\n\s*\n", str(answer or "").strip())
    paragraphs = [paragraph.strip() for paragraph in paragraphs if paragraph.strip()]
    if not paragraphs:
        return note

    insert_before = next(
        (index for index, paragraph in enumerate(paragraphs) if is_study_context_paragraph(paragraph, language)),
        None,
    )
    target_index = max(0, insert_before - 1) if insert_before is not None else len(paragraphs) - 1
    joiner = "" if language == "Chinese" else " "
    paragraphs[target_index] = f"{paragraphs[target_index].rstrip()}{joiner}{note}"
    return "\n\n".join(paragraphs)


def is_study_context_paragraph(paragraph, language):
    text = str(paragraph or "")
    if language == "Chinese":
        return bool(
            re.search(r"(此外|另外|附近|周边).{0,40}(图书馆|学习空间|自习|安静学习|Hammersmith Campus Library|Abdus Salam Library|GoStudy)", text)
            or re.search(r"(Imperial|帝国理工).{0,40}(图书馆|学习空间|library|study)", text, flags=re.IGNORECASE)
        )
    return bool(
        re.search(r"\b(nearby|also|additionally|once you arrive)\b.{0,80}\b(library|study space|study option|quiet study)\b", text, flags=re.IGNORECASE)
        or re.search(r"\bImperial\b.{0,80}\b(library|study|campus)\b", text, flags=re.IGNORECASE)
    )


def nearby_study_places(destination, limit=2, max_distance_km=None):
    if not valid_lat_lng(destination):
        return []
    ranked = []
    for place in STUDY_PLACES:
        distance = direct_distance_km(destination, place)
        if max_distance_km is not None and distance > max_distance_km:
            continue
        ranked.append(
            {
                "name": place["name"],
                "type": place["type"],
                "distanceKm": round(distance, 2),
                "tags": place["tags"],
            }
        )
    ranked.sort(key=lambda item: item["distanceKm"])
    return ranked[:limit]


def direct_distance_km(origin, destination):
    lat1 = origin["lat"]
    lng1 = origin["lng"]
    lat2 = destination["lat"]
    lng2 = destination["lng"]
    radius_km = 6371
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    start_lat = math.radians(lat1)
    end_lat = math.radians(lat2)
    haversine = math.sin(delta_lat / 2) ** 2 + math.cos(start_lat) * math.cos(end_lat) * math.sin(delta_lng / 2) ** 2
    return radius_km * 2 * math.atan2(math.sqrt(haversine), math.sqrt(1 - haversine))


def remove_source_note_sentence(answer, google_pattern, source_pattern):
    parts = re.findall(r"[^。！？.!?\n]+[。！？.!?]?|\n+", answer)
    kept = []
    for part in parts:
        has_google = re.search(google_pattern, part, flags=re.IGNORECASE)
        has_source = re.search(source_pattern, part, flags=re.IGNORECASE)
        if has_google and has_source:
            continue
        kept.append(part)
    return "".join(kept)


def format_natural_navigation_answer(route_request, routes):
    origin = route_request["origin"]["name"]
    destination = route_request["destination"]["name"]
    language = route_request["language"]
    requested_mode = route_request.get("mode")
    recommended = routes[0]
    alternatives = routes[1:3]
    fastest = min(routes, key=lambda item: item["durationMinutes"])
    origin_source = route_request.get("origin_source")

    if language == "Chinese":
        requested_text = ""
        if requested_mode and recommended["mode"] == requested_mode:
            requested_text = "你指定的方式可以走，"
        if origin_source == "context":
            opening = (
                f"我查了一下 Google Routes：去 {destination}，"
                f"{requested_text}{mode_label_for_language(recommended['mode'], language)}大约 {recommended['durationMinutes']} 分钟"
            )
        else:
            opening = (
                f"我查了一下 Google Routes：从 {origin} 到 {destination}，"
                f"{requested_text}{mode_label_for_language(recommended['mode'], language)}大约 {recommended['durationMinutes']} 分钟"
            )
        if recommended.get("distanceKm") is not None:
            opening += f"，距离约 {recommended['distanceKm']} km"
        opening += "。"

        if alternatives:
            comparison = "其他选择里，" + "；".join(
                f"{mode_label_for_language(item['mode'], language)}约 {item['durationMinutes']} 分钟"
                for item in alternatives
            ) + "。"
        else:
            comparison = ""

        if fastest["mode"] != recommended["mode"]:
            advice = (
                f"如果你优先按刚才指定的方式出行，就选{mode_label_for_language(recommended['mode'], language)}；"
                f"如果更赶时间，{mode_label_for_language(fastest['mode'], language)}会更快一些。"
            )
        else:
            advice = f"综合时间和可行性，我会优先建议{mode_label_for_language(recommended['mode'], language)}。"

        return "\n".join(part for part in [opening, comparison, advice] if part)

    if origin_source == "context":
        opening = (
            f"I checked Google Routes for travel to {destination}. "
            f"{mode_label_for_language(recommended['mode'], language)} is about {recommended['durationMinutes']} min"
        )
    else:
        opening = (
            f"I checked Google Routes for {origin} to {destination}. "
            f"{mode_label_for_language(recommended['mode'], language)} is about {recommended['durationMinutes']} min"
        )
    if recommended.get("distanceKm") is not None:
        opening += f" over {recommended['distanceKm']} km"
    opening += "."

    if alternatives:
        comparison = "For comparison, " + "; ".join(
            f"{mode_label_for_language(item['mode'], language)} is about {item['durationMinutes']} min"
            for item in alternatives
        ) + "."
    else:
        comparison = ""

    if fastest["mode"] != recommended["mode"]:
        advice = (
            f"If you want to stick with your requested mode, use {mode_label_for_language(recommended['mode'], language)}; "
            f"if speed matters more, {mode_label_for_language(fastest['mode'], language)} is quicker."
        )
    else:
        advice = f"I would choose {mode_label_for_language(recommended['mode'], language)} here."

    return "\n".join(part for part in [opening, comparison, advice] if part)


def mode_label_for_language(mode, language):
    if language == "Chinese":
        labels = {
            "TRANSIT": "公共交通",
            "WALK": "步行",
            "BICYCLE": "骑行",
            "DRIVE": "驾车",
        }
        return labels.get(mode, mode_label(mode))
    return mode_label(mode)


def call_openai_navigation(api_key, prompt):
    request_body = json.dumps(
        {
            "model": OPENAI_MODEL,
            "input": [
                {
                    "role": "developer",
                    "content": [
                        {
                            "type": "input_text",
                            "text": (
                                "You are Imperial Study Navigator. Use Google route tool results as facts. "
                                "Match the user's language and answer naturally."
                            ),
                        }
                    ],
                },
                {"role": "user", "content": [{"type": "input_text", "text": prompt}]},
            ],
            "max_output_tokens": 520,
        },
        ensure_ascii=False,
    ).encode("utf-8")

    request = urllib.request.Request(
        OPENAI_API_URL,
        data=request_body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": f"{APP_NAME}/1.0",
        },
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=45) as response:
        data = json.loads(response.read().decode("utf-8"))
    return extract_openai_text(data)


def call_openai_json(api_key, developer_text, prompt, max_output_tokens=220):
    request_body = json.dumps(
        {
            "model": OPENAI_MODEL,
            "input": [
                {
                    "role": "developer",
                    "content": [{"type": "input_text", "text": developer_text}],
                },
                {"role": "user", "content": [{"type": "input_text", "text": prompt}]},
            ],
            "max_output_tokens": max_output_tokens,
        },
        ensure_ascii=False,
    ).encode("utf-8")

    request = urllib.request.Request(
        OPENAI_API_URL,
        data=request_body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": f"{APP_NAME}/1.0",
        },
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=45) as response:
        data = json.loads(response.read().decode("utf-8"))
    return extract_openai_text(data)


def call_openai_text(api_key, developer_text, prompt, max_output_tokens=220, temperature=0.7):
    request_body = json.dumps(
        {
            "model": OPENAI_MODEL,
            "input": [
                {
                    "role": "developer",
                    "content": [{"type": "input_text", "text": developer_text}],
                },
                {"role": "user", "content": [{"type": "input_text", "text": prompt}]},
            ],
            "max_output_tokens": max_output_tokens,
            "temperature": temperature,
        },
        ensure_ascii=False,
    ).encode("utf-8")

    request = urllib.request.Request(
        OPENAI_API_URL,
        data=request_body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": f"{APP_NAME}/1.0",
        },
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=45) as response:
        data = json.loads(response.read().decode("utf-8"))
    return extract_openai_text(data)

def call_groq_json(api_key, developer_text, prompt, max_completion_tokens=GROQ_MAX_COMPLETION_TOKENS):
    return call_groq_messages(
        api_key,
        [
            {"role": "system", "content": developer_text},
            {"role": "user", "content": prompt},
        ],
        max_completion_tokens=max_completion_tokens,
        temperature=0,
    )


def call_groq_text(api_key, developer_text, prompt, max_completion_tokens=220, temperature=0.7):
    return call_groq_messages(
        api_key,
        [
            {"role": "system", "content": developer_text},
            {"role": "user", "content": prompt},
        ],
        max_completion_tokens=max_completion_tokens,
        temperature=temperature,
    )

def call_groq(api_key, payload):
    prompt = build_agent_prompt(payload)
    history = payload.get("history", [])[-CHAT_HISTORY_LIMIT:]
    messages = [{"role": "system", "content": system_prompt(payload)}]

    for item in history:
        role = "assistant" if item.get("role") == "assistant" else "user"
        content = str(item.get("content", ""))[:700]
        if content:
            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": prompt})
    return call_groq_messages(api_key, messages, max_completion_tokens=GROQ_MAX_COMPLETION_TOKENS, temperature=0.2)


def call_groq_messages(api_key, messages, max_completion_tokens=GROQ_MAX_COMPLETION_TOKENS, temperature=0.2):
    request_body = json.dumps(
        {
            "model": get_groq_model(),
            "messages": messages,
            "temperature": temperature,
            "max_completion_tokens": max_completion_tokens,
        },
        ensure_ascii=False,
    ).encode("utf-8")

    request = urllib.request.Request(
        GROQ_API_URL,
        data=request_body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": f"{APP_NAME}/1.0",
        },
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=45) as response:
        data = json.loads(response.read().decode("utf-8"))
    return extract_groq_text(data)


def extract_groq_text(data):
    choices = data.get("choices", [])
    if choices:
        message = choices[0].get("message", {})
        content = message.get("content")
        if isinstance(content, str) and content.strip():
            return strip_reasoning_text(content)
    return "模型没有返回文本结果。"


def strip_reasoning_text(text):
    cleaned = strip_thinking(str(text or ""))
    cleaned = re.sub(
        r"(?is)^\s*(?:reasoning|thinking|thought process|思考过程|推理过程)\s*[:：].*?(?:\n\s*\n|(?=final answer\s*[:：])|(?=最终答案\s*[:：])|$)",
        "",
        cleaned,
    )
    cleaned = re.sub(
        r"(?is)^\s*(?:analysis|scratchpad|chain of thought|思路|分析)\s*[:：].*?(?:\n\s*\n|(?=final answer\s*[:：])|(?=最终答案\s*[:：])|$)",
        "",
        cleaned,
    )
    cleaned = re.sub(r"(?is)^\s*(?:final answer|最终答案)\s*[:：]\s*", "", cleaned)
    return cleaned.strip()


def format_navigation_failure(route_request, errors):
    origin = route_request["origin"]["name"]
    destination = route_request["destination"]["name"]
    if route_request.get("language") == "Chinese":
        return (
            f"我理解你想从 {origin} 去 {destination}，但这次 Google Routes 没有返回可用路线。"
            "可以试着把地点写得更具体一点，或者直接在 Google Maps 里确认实时路线。"
        )
    return (
        f"I understood the trip as {origin} to {destination}, but Google Routes did not return a usable route this time. "
        "Try a more specific place name, or check Google Maps directly for the live route."
    )


def read_http_error(error):
    message = error.read().decode("utf-8", errors="replace").strip()
    if not message:
        return f"HTTP {error.code}"
    try:
        data = json.loads(message)
        if not isinstance(data, dict):
            return message[:500]
        api_message = data.get("error", {}).get("message")
        api_status = data.get("error", {}).get("status")
        if api_message and api_status:
            return f"{api_status}: {api_message}"
        if api_message:
            return api_message
    except json.JSONDecodeError:
        pass
    return message[:500]


def parse_google_matrix_response(raw):
    try:
        data = json.loads(raw)
        return flatten_matrix_elements(data)
    except json.JSONDecodeError:
        elements = []
        for line in raw.splitlines():
            if not line.strip():
                continue
            elements.extend(flatten_matrix_elements(json.loads(line)))
        return elements


def flatten_matrix_elements(data):
    if isinstance(data, list):
        elements = []
        for item in data:
            elements.extend(flatten_matrix_elements(item))
        return elements
    if isinstance(data, dict):
        if isinstance(data.get("elements"), list):
            return flatten_matrix_elements(data["elements"])
        return [data]
    return []


def parse_duration_seconds(value):
    if not isinstance(value, str) or not value.endswith("s"):
        return 0
    try:
        return float(value[:-1])
    except ValueError:
        return 0


def valid_lat_lng(value):
    return isinstance(value, dict) and isinstance(value.get("lat"), (int, float)) and isinstance(value.get("lng"), (int, float))


def lat_lng(value):
    return {"latitude": value["lat"], "longitude": value["lng"]}


def call_openai(api_key, payload):
    prompt = build_agent_prompt(payload)
    history = payload.get("history", [])[-CHAT_HISTORY_LIMIT:]

    model_input = [
        {
            "role": "developer",
            "content": [{"type": "input_text", "text": system_prompt(payload)}],
        }
    ]

    for item in history:
        role = "assistant" if item.get("role") == "assistant" else "user"
        content = str(item.get("content", ""))[:700]
        if content:
            model_input.append({"role": role, "content": [{"type": "input_text", "text": content}]})

    model_input.append({"role": "user", "content": [{"type": "input_text", "text": prompt}]})

    request_body = json.dumps(
        {
            "model": OPENAI_MODEL,
            "input": model_input,
            "max_output_tokens": 800,
        },
        ensure_ascii=False,
    ).encode("utf-8")

    request = urllib.request.Request(
        OPENAI_API_URL,
        data=request_body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=45) as response:
        data = json.loads(response.read().decode("utf-8"))

    return extract_openai_text(data)


def call_ollama_stream(payload):
    history = payload.get("history", [])[-CHAT_HISTORY_LIMIT:]
    messages = [{"role": "system", "content": system_prompt(payload)}]

    for item in history:
        role = "assistant" if item.get("role") == "assistant" else "user"
        content = str(item.get("content", ""))[:700]
        if content:
            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": build_agent_prompt(payload, no_think=True)})

    request_body = json.dumps(
        {
            "model": OLLAMA_MODEL,
            "messages": messages,
            "stream": True,
            "think": False,
            "keep_alive": "10m",
            "options": {
                "temperature": 0.15,
                "num_predict": OLLAMA_NUM_PREDICT,
                "num_ctx": 2048,
            },
        },
        ensure_ascii=False,
    ).encode("utf-8")

    request = urllib.request.Request(
        OLLAMA_API_URL,
        data=request_body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    buffer = ""
    emitted = ""
    with urllib.request.urlopen(request, timeout=120) as response:
        for raw_line in response:
            line = raw_line.decode("utf-8", errors="replace").strip()
            if not line:
                continue
            data = json.loads(line)
            buffer += str(data.get("message", {}).get("content", ""))
            cleaned = strip_reasoning_text(buffer)
            if len(cleaned) > len(emitted):
                delta = cleaned[len(emitted):]
                emitted = cleaned
                if delta:
                    yield delta
            if data.get("done"):
                break


def call_ollama_once(messages, temperature=0.15, num_predict=OLLAMA_NUM_PREDICT):
    request_body = json.dumps(
        {
            "model": OLLAMA_MODEL,
            "messages": messages,
            "stream": False,
            "think": False,
            "keep_alive": "10m",
            "options": {
                "temperature": temperature,
                "num_predict": num_predict,
                "num_ctx": 2048,
            },
        },
        ensure_ascii=False,
    ).encode("utf-8")

    request = urllib.request.Request(
        OLLAMA_API_URL,
        data=request_body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=90) as response:
        data = json.loads(response.read().decode("utf-8", errors="replace"))
    return extract_ollama_text(data)


def extract_ollama_text(data):
    message = data.get("message", {})
    candidates = [
        message.get("content"),
        data.get("response"),
        data.get("content"),
        data.get("output"),
    ]
    for candidate in candidates:
        text = str(candidate or "").strip()
        if text:
            return strip_thinking(text)
    return ""


def build_agent_prompt(payload, no_think=False):
    context = payload.get("context", {})
    ranked = payload.get("ranked", [])
    question = payload.get("question", "")
    mode = detect_mode(question)
    domain = detect_domain(question)
    response_language = detect_response_language(question)

    prompt = json.dumps(
        {
            "response_language": response_language,
            "answer_mode": mode,
            "domain": domain,
            "user_question": question,
            "current_context": context,
            "candidate_recommendations": ranked if domain == "study" else [],
            "instructions": (
                "Answer strictly in response_language. "
                "If domain is general, answer the user's actual question normally and do not mention study spaces, libraries, campuses, candidate places, or Imperial recommendations unless the user asks for them. "
                "If domain is study and answer_mode is decision, use candidate_recommendations to make a concrete study-space decision. "
                "If domain is study and answer_mode is chat, you may use the study context lightly, but keep the reply conversational."
            ),
        },
        ensure_ascii=False,
    )
    if no_think:
        return f"/no_think\nGive the final answer directly. Follow response_language exactly.\n{prompt}"
    return prompt


def system_prompt(payload=None):
    question = (payload or {}).get("question", "")
    mode = detect_mode(question)
    domain = detect_domain(question)
    response_language = detect_response_language(question)
    return (
        "You are Imperial Study Navigator, a conversational study-space and route planning assistant for Imperial College London. "
        "Match the user's language exactly: if the user writes in Chinese, answer in Chinese; otherwise answer in English. "
        "Do not mix languages unless the user does. "
        "By default, chat naturally and helpfully without forcing a report format. "
        "The user may ask ordinary life questions such as food, errands, greetings, opinions or general advice. Answer those directly and do not steer them back to libraries or study spaces. "
        "Only mention Imperial libraries, study spaces, candidate places, crowding, comfort scores or study recommendations when the user explicitly asks about studying, libraries, places to work, campus study planning, or a route whose destination is an Imperial study/campus context. "
        "For study decision questions, be concise and include a clear first choice and backup when useful. "
        "For casual chat, explanations or product discussion, answer normally and do not force a place recommendation. "
        "Do not invent live data that was not provided; if data is estimated, say so when relevant. "
        "Do not output hidden reasoning or <think> tags. "
        f"Detected answer_mode={mode}; domain={domain}; response_language={response_language}."
    )


def detect_response_language(question):
    text = str(question or "")
    has_chinese = any("\u4e00" <= char <= "\u9fff" for char in text)
    return "Chinese" if has_chinese else "English"


def detect_mode(question):
    text = str(question or "").lower()
    if not is_study_related_question(text):
        return "chat"

    study_decision_words = [
        "去哪",
        "哪里",
        "适合",
        "要不要",
        "能不能",
        "拥挤",
        "不挤",
        "预算",
        "便宜",
        "距离",
        "推荐",
        "安排",
        "where",
        "recommend",
        "suitable",
        "fit",
        "crowded",
        "quiet",
        "budget",
        "distance",
        "compare",
        "plan",
    ]
    return "decision" if any(word in text for word in study_decision_words) else "chat"


def detect_domain(question):
    return "study" if is_study_related_question(question) else "general"


def is_study_related_question(question):
    text = str(question or "").lower()
    study_terms = [
        "study",
        "studying",
        "library",
        "libraries",
        "workspace",
        "study space",
        "seat",
        "quiet",
        "focus",
        "revision",
        "revise",
        "group study",
        "campus library",
        "abdus salam",
        "gostudy",
        "学习",
        "自习",
        "复习",
        "图书馆",
        "座位",
        "安静",
        "小组学习",
        "学习空间",
        "学习地点",
        "学习规划",
    ]
    return any(term in text for term in study_terms)


def strip_thinking(text):
    cleaned = str(text or "")
    cleaned = re.sub(r"(?is)<think\b[^>]*>.*?</think>", "", cleaned)
    cleaned = re.sub(r"(?is)<think\b[^>]*>.*$", "", cleaned)
    cleaned = re.sub(r"(?is)^.*?</think>", "", cleaned)
    return cleaned.strip()


def extract_openai_text(data):
    if data.get("output_text"):
        return data["output_text"]

    parts = []
    for item in data.get("output", []):
        for content in item.get("content", []):
            if content.get("type") in {"output_text", "text"} and content.get("text"):
                parts.append(content["text"])

    return "\n".join(parts).strip() or "模型没有返回文本结果。"


def main():
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer(("", port), ImperialNavigatorHandler)
    provider = get_llm_provider()
    if provider == "openai":
        print(f"{APP_NAME} server running at http://localhost:{port} with OpenAI model {get_openai_model()}")
    elif provider == "groq":
        print(f"{APP_NAME} server running at http://localhost:{port} with Groq model {get_groq_model()}")
    else:
        print(f"{APP_NAME} server running at http://localhost:{port} with Ollama model {get_ollama_model()}")
    server.serve_forever()


if __name__ == "__main__":
    main()
