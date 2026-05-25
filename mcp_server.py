import json
import sys
import urllib.error
import urllib.parse
import urllib.request

from navigator_core import (
    APP_NAME,
    GROQ_API_URL,
    GOOGLE_TRAVEL_MODE,
    LLM_MAX_COMPLETION_TOKENS,
    TOGETHER_API_URL,
    TOGETHER_MAX_COMPLETION_TOKENS,
    apply_context_start,
    attach_route_geometry,
    build_navigation_answer,
    call_google_matrix_route,
    call_google_route_matrix,
    call_groq,
    call_ollama_stream,
    call_openai,
    call_together,
    check_llm_health,
    classify_agent_intent,
    current_llm_model,
    get_google_maps_api_key,
    get_google_maps_browser_key,
    get_groq_api_key,
    get_groq_model,
    get_env_value,
    get_llm_provider,
    get_ollama_model,
    get_openai_api_key,
    get_openai_model,
    get_together_api_key,
    get_together_model,
    mode_label,
    navigation_mode_candidates,
    parse_navigation_query,
    public_place_payload,
    read_http_error,
    resolve_location,
    strip_reasoning_text,
    valid_lat_lng,
)

OPENAI_CHAT_COMPLETIONS_API_URL = "https://api.openai.com/v1/chat/completions"
AGENT_TOOL_CALL_LIMIT = int(get_env_value("AGENT_TOOL_CALL_LIMIT") or "7")
AGENT_MAX_COMPLETION_TOKENS = int(get_env_value("AGENT_MAX_COMPLETION_TOKENS") or str(LLM_MAX_COMPLETION_TOKENS))


class MCPToolError(Exception):
    def __init__(self, message, status=500, payload=None):
        super().__init__(message)
        self.status = status
        self.payload = payload or {"error": message}


def format_model_http_error(raw_message):
    message = str(raw_message or "").strip()
    if message:
        try:
            data = json.loads(message)
            error = data.get("error") if isinstance(data, dict) else None
            if isinstance(error, dict) and error.get("message"):
                return f"模型服务返回错误：{error['message']}"
            if isinstance(error, str) and error:
                return f"模型服务返回错误：{error}"
        except json.JSONDecodeError:
            pass
        return f"模型服务返回错误：{message[:500]}"
    return "模型服务返回 HTTP 错误。"


def compact_json(value, limit=5000):
    text = json.dumps(value, ensure_ascii=False)
    if len(text) <= limit:
        return text
    return text[:limit] + "...[truncated]"


def agent_observation_payload(name, result):
    if name == "navigate" and isinstance(result, dict):
        summary = {
            "origin": result.get("origin"),
            "destination": result.get("destination"),
            "destinationPlace": result.get("destinationPlace"),
            "recommended": summarize_route_option(result.get("recommended")),
            "alternatives": [summarize_route_option(route) for route in result.get("alternatives", [])],
            "provider": result.get("provider"),
        }
        if result.get("details"):
            summary["details"] = result.get("details")
        return summary
    if name == "route_matrix" and isinstance(result, dict):
        return result
    if name == "weather_current" and isinstance(result, dict):
        return result
    return result


def summarize_route_option(route):
    if not isinstance(route, dict):
        return route
    return {
        "mode": route.get("mode"),
        "modeLabel": route.get("modeLabel"),
        "durationMinutes": route.get("durationMinutes"),
        "distanceKm": route.get("distanceKm"),
        "description": route.get("description"),
        "condition": route.get("condition"),
    }


def agent_tool_schema_definitions():
    return [
        {
            "type": "function",
            "function": {
                "name": "navigate",
                "description": "Calculate live travel routes, durations, distances, route geometry, and destination context using Google Routes.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The user's route request, including origin/destination/mode when present.",
                        },
                        "contextStart": {
                            "type": "object",
                            "description": "Selected browser start point with name, lat, lng. Use when the user gives only a destination.",
                        },
                        "history": {"type": "array"},
                    },
                    "required": ["query"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "route_matrix",
                "description": "Get live Google Routes travel estimates from one start point to multiple study-space destinations.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "start": {"type": "object", "description": "Start point with name, lat, lng."},
                        "destinations": {
                            "type": "array",
                            "description": "Destination places with name, lat, lng.",
                            "items": {"type": "object"},
                        },
                    },
                    "required": ["start", "destinations"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "weather_current",
                "description": "Look up current weather at a start point, destination, or named place using Google Weather API.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "object",
                            "description": "Location with optional name/label and either lat/lng coordinates or a place/query string.",
                            "properties": {
                                "name": {"type": "string"},
                                "label": {"type": "string"},
                                "query": {"type": "string"},
                                "place": {"type": "string"},
                                "lat": {"type": "number"},
                                "lng": {"type": "number"},
                            },
                        }
                    },
                    "required": ["location"],
                },
            },
        },
    ]


def agent_tool_names():
    return [tool["function"]["name"] for tool in agent_tool_schema_definitions()]


def agent_system_prompt():
    return (
        "You are Imperial Study Navigator. The browser gives you the user's question, selected start point, "
        "candidate study spaces, and recent chat history. Decide for yourself whether a tool is needed. "
        "Use tools when they materially improve factual accuracy: navigate for routes/directions, route_matrix for live "
        "travel estimates to study spaces, and weather_current for current weather. "
        "You may call multiple tools in sequence, observe the result, then decide whether another tool is needed. "
        "If no tool is needed, answer directly. Match the user's language. Use at most one blank line between "
        "distinct paragraphs or before and after lists, and avoid consecutive blank lines. For short answers, prefer "
        "no blank lines unless a section break is genuinely helpful. When comparing multiple transport modes, prefer "
        "Do not reveal hidden reasoning, scratchpad, analysis, or <think> tags. Keep answers concise but useful."
    )


def agent_user_prompt(payload):
    safe_payload = {
        "question": payload.get("question", ""),
        "contextStart": payload.get("contextStart"),
        "context": payload.get("context"),
        "ranked": payload.get("ranked", []),
        "history": payload.get("history", [])[-6:],
    }
    return (
        "Handle this browser request. Use the provided selected start point as contextStart when a route/weather request "
        "has no explicit origin. If the user asks about weather at the destination after a route tool call, use the "
        "destinationPlace from the route result.\n"
        f"{compact_json(safe_payload, limit=6500)}"
    )


def call_tool_choice_model(messages, tools):
    provider = get_llm_provider()
    if provider == "groq":
        api_key = get_groq_api_key()
        if not api_key:
            raise MCPToolError("未配置 GROQ_API_KEY。", status=500, payload={"error": "未配置 GROQ_API_KEY。"})
        return call_chat_completion_tools(
            GROQ_API_URL,
            api_key,
            get_groq_model(),
            messages,
            tools,
            provider="groq",
        )
    if provider == "together":
        api_key = get_together_api_key()
        if not api_key:
            raise MCPToolError("未配置 TOGETHER_API_KEY。", status=500, payload={"error": "未配置 TOGETHER_API_KEY。"})
        return call_chat_completion_tools(
            TOGETHER_API_URL,
            api_key,
            get_together_model(),
            messages,
            tools,
            provider="together",
        )
    if provider == "openai":
        api_key = get_openai_api_key()
        if not api_key:
            raise MCPToolError("未配置 OPENAI_API_KEY。", status=500, payload={"error": "未配置 OPENAI_API_KEY。"})
        return call_chat_completion_tools(
            OPENAI_CHAT_COMPLETIONS_API_URL,
            api_key,
            get_openai_model(),
            messages,
            tools,
            provider="openai",
        )
    return None


def call_chat_completion_tools(url, api_key, model, messages, tools, provider):
    body = {
        "model": model,
        "messages": messages,
        "tools": tools,
        "tool_choice": "auto",
    }
    if provider == "groq":
        body["temperature"] = 0.2
        body["max_completion_tokens"] = AGENT_MAX_COMPLETION_TOKENS
    elif provider == "together":
        body["temperature"] = 0.2
        body["max_tokens"] = AGENT_MAX_COMPLETION_TOKENS
    else:
        body["max_completion_tokens"] = AGENT_MAX_COMPLETION_TOKENS

    request = urllib.request.Request(
        url,
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": f"{APP_NAME}/1.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        data = json.loads(response.read().decode("utf-8", errors="replace"))
    choices = data.get("choices") or []
    if not choices:
        return {"role": "assistant", "content": "模型没有返回文本结果。"}
    return choices[0].get("message") or {"role": "assistant", "content": ""}


def parse_tool_arguments(raw_arguments):
    if isinstance(raw_arguments, dict):
        return raw_arguments
    if not raw_arguments:
        return {}
    try:
        value = json.loads(raw_arguments)
        return value if isinstance(value, dict) else {}
    except json.JSONDecodeError:
        return {}


def normalize_agent_tool_arguments(name, arguments, payload):
    normalized = dict(arguments or {})
    if name == "navigate":
        normalized.setdefault("query", payload.get("question", ""))
        normalized.setdefault("contextStart", payload.get("contextStart"))
        normalized.setdefault("history", payload.get("history", [])[-6:])
        normalized["_agentTool"] = True
    elif name == "route_matrix":
        context_start = payload.get("contextStart") or {}
        context = payload.get("context") or {}
        start_coords = context.get("startCoordinates") if isinstance(context, dict) else None
        normalized.setdefault(
            "start",
            {
                "name": context_start.get("name") or context_start.get("label") or context.get("startPoint") or "Selected start point",
                "lat": context_start.get("lat") or (start_coords or {}).get("lat"),
                "lng": context_start.get("lng") or (start_coords or {}).get("lng"),
            },
        )
        if not normalized.get("destinations"):
            normalized["destinations"] = [
                {"name": place.get("name"), "lat": place.get("lat"), "lng": place.get("lng")}
                for place in payload.get("ranked", [])
                if valid_lat_lng(place)
            ]
    elif name == "weather_current":
        location = normalized.get("location")
        if not isinstance(location, dict):
            location = {}
        if not location:
            context_start = payload.get("contextStart") or {}
            if valid_lat_lng(context_start):
                location = {
                    "name": context_start.get("name") or context_start.get("label") or "Selected start point",
                    "lat": context_start["lat"],
                    "lng": context_start["lng"],
                }
        normalized["location"] = location
    return normalized


def execute_agent_tool(name, arguments, payload):
    arguments = normalize_agent_tool_arguments(name, arguments, payload)
    if name == "navigate":
        return mcp_tool_navigate(arguments)
    if name == "route_matrix":
        return mcp_tool_route_matrix(arguments)
    if name == "weather_current":
        return mcp_tool_weather_current(arguments)
    raise MCPToolError(f"Unknown agent tool: {name}", status=404, payload={"error": f"Unknown agent tool: {name}"})


def extract_agent_result_fields(tool_calls):
    result = {}
    for item in tool_calls:
        if item.get("status") != "ok":
            continue
        payload = item.get("_fullResult") or item.get("result")
        if not isinstance(payload, dict):
            continue
        if item.get("name") == "navigate":
            public_payload = {key: value for key, value in payload.items() if key not in {"answer", "provider"}}
            result.update(public_payload)
            result["navigation"] = payload
        elif item.get("name") == "weather_current":
            result["weather"] = payload
    return result


def public_tool_trace(tool_trace):
    public_items = []
    for item in tool_trace:
        public_item = {
            "name": item.get("name"),
            "arguments": item.get("arguments"),
            "status": item.get("status"),
        }
        if item.get("error"):
            public_item["error"] = item.get("error")
        if item.get("result") is not None:
            public_item["result"] = item.get("result")
        public_items.append(public_item)
    return public_items


def mcp_tool_agent_answer(arguments):
    payload = (arguments or {}).get("payload") or {}
    context = payload.get("context") or {}
    if isinstance(context, dict) and context.get("task") == "weather_summary":
        result = mcp_tool_chat_complete({"payload": payload})
        result.setdefault("toolsUsed", [])
        result.setdefault("toolCalls", [])
        return result

    provider = get_llm_provider()
    if provider not in {"groq", "openai", "together"}:
        result = mcp_tool_chat_complete({"payload": payload})
        result.setdefault("toolsUsed", [])
        result.setdefault("toolCalls", [])
        return result

    messages = [
        {"role": "system", "content": agent_system_prompt()},
        {"role": "user", "content": agent_user_prompt(payload)},
    ]
    tools = agent_tool_schema_definitions()
    tool_trace = []

    try:
        for _ in range(AGENT_TOOL_CALL_LIMIT):
            message = call_tool_choice_model(messages, tools)
            tool_calls = message.get("tool_calls") or []
            if not tool_calls:
                answer = strip_reasoning_text(message.get("content") or "").strip()
                if not answer:
                    fallback = mcp_tool_chat_complete({"payload": payload})
                    answer = fallback.get("answer", "") if isinstance(fallback, dict) else str(fallback or "")
                result = {
                    "answer": answer,
                    "model": current_llm_model(),
                    "provider": provider,
                    "toolsUsed": [item["name"] for item in tool_trace if item.get("status") == "ok"],
                    "toolCalls": public_tool_trace(tool_trace),
                }
                result.update(extract_agent_result_fields(tool_trace))
                return result

            assistant_message = {
                "role": "assistant",
                "content": message.get("content") or "",
                "tool_calls": tool_calls,
            }
            messages.append(assistant_message)

            for call in tool_calls:
                function = call.get("function") or {}
                name = function.get("name")
                raw_arguments = function.get("arguments")
                parsed_arguments = parse_tool_arguments(raw_arguments)
                trace_item = {"name": name, "arguments": parsed_arguments, "status": "ok"}
                try:
                    if name not in agent_tool_names():
                        raise MCPToolError(f"Tool is not available to the agent: {name}", status=404)
                    tool_result = execute_agent_tool(name, parsed_arguments, payload)
                    trace_item["_fullResult"] = tool_result
                    trace_item["result"] = agent_observation_payload(name, tool_result)
                    messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": call.get("id"),
                            "name": name,
                            "content": compact_json(trace_item["result"], limit=2800),
                        }
                    )
                except Exception as error:
                    trace_item["status"] = "error"
                    trace_item["error"] = str(error)
                    messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": call.get("id"),
                            "name": name or "unknown",
                            "content": compact_json({"error": str(error)}, limit=2000),
                        }
                    )
                tool_trace.append(trace_item)

        final = mcp_tool_chat_complete({"payload": payload})
        answer = final.get("answer", "") if isinstance(final, dict) else str(final or "")
        result = {
            "answer": answer,
            "model": current_llm_model(),
            "provider": provider,
            "toolsUsed": [item["name"] for item in tool_trace if item.get("status") == "ok"],
            "toolCalls": public_tool_trace(tool_trace),
        }
        result.update(extract_agent_result_fields(tool_trace))
        return result
    except urllib.error.HTTPError as error:
        message = error.read().decode("utf-8", errors="replace")
        raise MCPToolError(format_model_http_error(message), status=error.code, payload={"error": format_model_http_error(message)})
    except urllib.error.URLError:
        raise MCPToolError("模型服务连接失败，请稍后重试。", status=503, payload={"error": "模型服务连接失败，请稍后重试。"})


def mcp_tool_health(arguments):
    llm_status = check_llm_health()
    return {
        "ok": True,
        "app": APP_NAME,
        "provider": get_llm_provider(),
        "model": current_llm_model(),
        "streaming": True,
        "llmConnected": llm_status["connected"],
        "llmStatus": llm_status["label"],
        "googleMapsConfigured": bool(get_google_maps_api_key()),
        "googleMapsBrowserConfigured": bool(get_google_maps_browser_key()),
        "googleMapsBrowserKey": get_google_maps_browser_key(),
        "mcpConnected": True,
        "mcpTools": ["agent_answer", "chat_complete", "classify_intent", "route_matrix", "navigate", "weather_current"],
    }


def mcp_tool_chat_complete(arguments):
    payload = (arguments or {}).get("payload") or {}
    provider = get_llm_provider()
    try:
        if provider == "openai":
            api_key = get_openai_api_key()
            if not api_key:
                raise MCPToolError(
                    "未配置 OPENAI_API_KEY。请在启动服务前设置环境变量，然后重新提问。",
                    status=500,
                    payload={
                        "error": "未配置 OPENAI_API_KEY。请在启动服务前设置环境变量，然后重新提问。",
                        "setup": "LLM_PROVIDER=openai OPENAI_API_KEY=你的密钥 python3 server.py",
                    },
                )
            return {"answer": call_openai(api_key, payload), "model": get_openai_model(), "provider": "openai"}

        if provider == "groq":
            api_key = get_groq_api_key()
            if not api_key:
                raise MCPToolError(
                    "未配置 GROQ_API_KEY。请在启动服务前设置环境变量，然后重新提问。",
                    status=500,
                    payload={
                        "error": "未配置 GROQ_API_KEY。请在启动服务前设置环境变量，然后重新提问。",
                        "setup": "LLM_PROVIDER=groq GROQ_API_KEY=你的密钥 python3 server.py",
                    },
                )
            return {"answer": call_groq(api_key, payload), "model": get_groq_model(), "provider": "groq"}

        if provider == "together":
            api_key = get_together_api_key()
            if not api_key:
                raise MCPToolError(
                    "未配置 TOGETHER_API_KEY。请在启动服务前设置环境变量，然后重新提问。",
                    status=500,
                    payload={
                        "error": "未配置 TOGETHER_API_KEY。请在启动服务前设置环境变量，然后重新提问。",
                        "setup": "LLM_PROVIDER=together TOGETHER_API_KEY=你的密钥 python3 server.py",
                    },
                )
            return {"answer": call_together(api_key, payload), "model": get_together_model(), "provider": "together"}

        answer = "".join(call_ollama_stream(payload)).strip()
        if not answer:
            answer = "本地模型返回为空。可以尝试换用 qwen2.5:3b 或进一步降低 OLLAMA_NUM_PREDICT。"
        return {"answer": answer, "model": get_ollama_model(), "provider": "ollama"}
    except MCPToolError:
        raise
    except urllib.error.HTTPError as error:
        message = error.read().decode("utf-8", errors="replace")
        raise MCPToolError(format_model_http_error(message), status=error.code, payload={"error": format_model_http_error(message)})
    except urllib.error.URLError:
        if provider == "ollama":
            raise MCPToolError(
                "无法连接本地 Ollama 服务。请确认 Ollama 已安装并正在运行。",
                status=503,
                payload={
                    "error": "无法连接本地 Ollama 服务。请确认 Ollama 已安装并正在运行。",
                    "setup": f"ollama run {get_ollama_model()}",
                },
            )
        raise MCPToolError("模型服务连接失败，请稍后重试。", status=503, payload={"error": "模型服务连接失败，请稍后重试。"})


def mcp_tool_classify_intent(arguments):
    try:
        question = str((arguments or {}).get("question", "")).strip()
        if not question:
            return {"mode": "study", "confidence": 0, "reason": "empty question"}
        return classify_agent_intent(question, (arguments or {}).get("contextStart"), (arguments or {}).get("history", []))
    except Exception as error:
        return {"mode": "study", "confidence": 0, "reason": f"Intent check failed: {error}"}


def mcp_tool_route_matrix(arguments):
    api_key = get_google_maps_api_key()
    if not api_key:
        raise MCPToolError(
            "GOOGLE_MAPS_API_KEY is not configured.",
            status=500,
            payload={"error": "GOOGLE_MAPS_API_KEY is not configured."},
        )

    start = (arguments or {}).get("start", {})
    destinations = (arguments or {}).get("destinations", [])
    if not valid_lat_lng(start) or not destinations:
        raise MCPToolError(
            "Route request requires a start point and destinations.",
            status=400,
            payload={"error": "Route request requires a start point and destinations."},
        )

    try:
        routes = call_google_route_matrix(api_key, start, destinations)
        return {"routes": routes, "provider": "google_routes", "travelMode": GOOGLE_TRAVEL_MODE}
    except urllib.error.HTTPError as error:
        message = error.read().decode("utf-8", errors="replace")
        raise MCPToolError(f"Google Routes API failed: {message}", status=error.code, payload={"error": f"Google Routes API failed: {message}"})


def weather_location_from_arguments(arguments):
    location = (arguments or {}).get("location") or {}
    if not isinstance(location, dict):
        location = {"query": str(location)}
    if valid_lat_lng(location):
        return {
            "name": location.get("name") or location.get("label") or "Selected location",
            "lat": location["lat"],
            "lng": location["lng"],
        }

    place_text = (
        location.get("query")
        or location.get("place")
        or location.get("name")
        or location.get("label")
        or (arguments or {}).get("query")
        or (arguments or {}).get("place")
    )
    resolved = resolve_location(place_text)
    if valid_lat_lng(resolved):
        return {
            "name": resolved.get("name") or str(place_text or "Selected location"),
            "lat": resolved["lat"],
            "lng": resolved["lng"],
        }
    return None


def weather_api_url(location, api_key):
    params = urllib.parse.urlencode(
        {
            "key": api_key,
            "location.latitude": str(location["lat"]),
            "location.longitude": str(location["lng"]),
            "unitsSystem": "METRIC",
            "languageCode": "en",
        }
    )
    return f"https://weather.googleapis.com/v1/currentConditions:lookup?{params}"


def mcp_tool_weather_current(arguments):
    api_key = get_google_maps_browser_key() or get_google_maps_api_key()
    if not api_key:
        raise MCPToolError(
            "Google Weather API key is not configured.",
            status=500,
            payload={"error": "Google Weather API key is not configured."},
        )
    location = weather_location_from_arguments(arguments)
    if not location:
        raise MCPToolError(
            "Weather request requires a location with coordinates or a resolvable place name.",
            status=400,
            payload={"error": "Weather request requires a location with coordinates or a resolvable place name."},
        )

    request = urllib.request.Request(
        weather_api_url(location, api_key),
        headers={
            "Accept": "application/json",
            "User-Agent": f"{APP_NAME}/1.0",
            "Referer": get_env_value("GOOGLE_WEATHER_REFERER") or "https://ada-yz1825.github.io/",
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8", errors="replace"))
    except urllib.error.HTTPError as error:
        message = error.read().decode("utf-8", errors="replace")
        raise MCPToolError(f"Google Weather API failed: {message}", status=error.code, payload={"error": f"Google Weather API failed: {message}"})
    except urllib.error.URLError as error:
        raise MCPToolError(f"Google Weather API connection failed: {error.reason}", status=503, payload={"error": f"Google Weather API connection failed: {error.reason}"})

    return {
        "location": location,
        "provider": "google_weather",
        "current": {
            "time": data.get("currentTime"),
            "condition": data.get("weatherCondition", {}).get("description", {}).get("text")
            or data.get("weatherCondition", {}).get("type"),
            "conditionType": data.get("weatherCondition", {}).get("type"),
            "isDaytime": data.get("isDaytime"),
            "temperatureC": data.get("temperature", {}).get("degrees"),
            "feelsLikeC": data.get("feelsLikeTemperature", {}).get("degrees"),
            "humidityPercent": data.get("relativeHumidity"),
            "wind": data.get("wind"),
            "uvIndex": data.get("uvIndex"),
            "precipitation": data.get("precipitation"),
        },
    }


def mcp_tool_navigate(arguments):
    api_key = get_google_maps_api_key()
    if not api_key:
        raise MCPToolError(
            "GOOGLE_MAPS_API_KEY is not configured.",
            status=500,
            payload={"error": "GOOGLE_MAPS_API_KEY is not configured."},
        )

    try:
        query = str((arguments or {}).get("query", "")).strip()
        agent_tool_mode = bool((arguments or {}).get("_agentTool"))
        route_request = parse_navigation_query(query, (arguments or {}).get("history", []))
        apply_context_start(route_request, (arguments or {}).get("contextStart"))
        if not route_request.get("origin") or not route_request.get("destination"):
            raise MCPToolError(
                "Please ask with an origin and destination, for example: from South Kensington to Hammersmith Campus.",
                status=400,
                payload={
                    "error": "Please ask with an origin and destination, for example: from South Kensington to Hammersmith Campus.",
                },
            )

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
            answer = "" if agent_tool_mode else build_navigation_answer(query, route_request, [], route_errors)
            return {
                "answer": answer,
                "origin": route_request["origin"]["name"],
                "destination": route_request["destination"]["name"],
                "destinationPlace": public_place_payload(route_request["destination"]),
                "recommended": None,
                "alternatives": [],
                "provider": "google_routes",
                "details": route_errors[:4],
            }

        requested_mode = route_request.get("mode")
        if requested_mode:
            route_options.sort(key=lambda item: (0 if item["mode"] == requested_mode else 1, item["durationMinutes"]))
        else:
            route_options.sort(key=lambda item: item["durationMinutes"])
        for route in route_options:
            attach_route_geometry(api_key, route_request, route)
        answer = "" if agent_tool_mode else build_navigation_answer(query, route_request, route_options, route_errors)
        return {
            "answer": answer,
            "origin": route_request["origin"]["name"],
            "destination": route_request["destination"]["name"],
            "destinationPlace": public_place_payload(route_request["destination"]),
            "recommended": route_options[0],
            "mapRoute": route_options[0],
            "alternatives": route_options[1:],
            "provider": "google_routes",
        }
    except MCPToolError:
        raise
    except urllib.error.HTTPError as error:
        message = error.read().decode("utf-8", errors="replace")
        raise MCPToolError(f"Google Routes API failed: {message}", status=error.code, payload={"error": f"Google Routes API failed: {message}"})


def mcp_tool_registry():
    return {
        "agent_answer": mcp_tool_agent_answer,
        "health": mcp_tool_health,
        "chat_complete": mcp_tool_chat_complete,
        "classify_intent": mcp_tool_classify_intent,
        "route_matrix": mcp_tool_route_matrix,
        "navigate": mcp_tool_navigate,
        "weather_current": mcp_tool_weather_current,
    }


def mcp_tool_descriptions():
    return [
        {
            "name": "agent_answer",
            "description": "Let a tool-calling LLM choose and call MCP tools, then return the final browser answer.",
            "inputSchema": {"type": "object", "properties": {"payload": {"type": "object"}}},
        },
        {
            "name": "health",
            "description": "Return backend, LLM, Google key, and MCP tool status for the browser adapter.",
            "inputSchema": {"type": "object", "properties": {}},
        },
        {
            "name": "chat_complete",
            "description": "Call the configured LLM provider and return a cleaned assistant answer.",
            "inputSchema": {"type": "object", "properties": {"payload": {"type": "object"}}},
        },
        {
            "name": "classify_intent",
            "description": "Classify whether a browser question should use study planning, conversation, or navigation.",
            "inputSchema": {"type": "object", "properties": {"question": {"type": "string"}}},
        },
        {
            "name": "route_matrix",
            "description": "Call Google Routes matrix for study-space travel estimates.",
            "inputSchema": {"type": "object", "properties": {"start": {"type": "object"}, "destinations": {"type": "array"}}},
        },
        {
            "name": "navigate",
            "description": "Parse a navigation request, call Google Routes tools, and return the browser navigation JSON.",
            "inputSchema": {"type": "object", "properties": {"query": {"type": "string"}, "contextStart": {"type": "object"}, "history": {"type": "array"}}},
        },
        {
            "name": "weather_current",
            "description": "Call Google Weather API for current conditions at a coordinate or named place.",
            "inputSchema": {"type": "object", "properties": {"location": {"type": "object"}}},
        },
    ]


def make_mcp_tool_result(payload):
    return {
        "content": [{"type": "text", "text": json.dumps(payload, ensure_ascii=False)}],
        "structuredContent": payload,
    }


def handle_mcp_request(message):
    method = message.get("method")
    params = message.get("params") or {}
    if method == "initialize":
        return {
            "protocolVersion": "2024-11-05",
            "capabilities": {"tools": {}},
            "serverInfo": {"name": "imperial-study-navigator-mcp", "version": "1.0"},
        }
    if method == "tools/list":
        return {"tools": mcp_tool_descriptions()}
    if method == "tools/call":
        name = params.get("name")
        arguments = params.get("arguments") or {}
        registry = mcp_tool_registry()
        if name not in registry:
            raise MCPToolError(f"Unknown MCP tool: {name}", status=404, payload={"error": f"Unknown MCP tool: {name}"})
        return make_mcp_tool_result(registry[name](arguments))
    if method == "ping":
        return {}
    raise MCPToolError(f"Unsupported MCP method: {method}", status=400, payload={"error": f"Unsupported MCP method: {method}"})


def run_mcp_server():
    for raw_line in sys.stdin:
        line = raw_line.strip()
        if not line:
            continue
        request_id = None
        try:
            message = json.loads(line)
            request_id = message.get("id")
            if request_id is None:
                continue
            result = handle_mcp_request(message)
            response = {"jsonrpc": "2.0", "id": request_id, "result": result}
        except MCPToolError as error:
            response = {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {
                    "code": -32000,
                    "message": str(error),
                    "data": {"status": error.status, "payload": error.payload},
                },
            }
        except Exception as error:
            response = {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {
                    "code": -32603,
                    "message": str(error),
                    "data": {"status": 500, "payload": {"error": str(error)}},
                },
            }
        sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
        sys.stdout.flush()


def main():
    try:
        run_mcp_server()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
