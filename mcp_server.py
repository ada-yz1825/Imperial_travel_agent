import json
import sys
import urllib.error

from navigator_core import (
    APP_NAME,
    GOOGLE_TRAVEL_MODE,
    apply_context_start,
    attach_route_geometry,
    build_navigation_answer,
    call_google_matrix_route,
    call_google_route_matrix,
    call_groq,
    call_ollama_stream,
    call_openai,
    check_llm_health,
    classify_agent_intent,
    current_llm_model,
    get_google_maps_api_key,
    get_google_maps_browser_key,
    get_groq_api_key,
    get_groq_model,
    get_llm_provider,
    get_ollama_model,
    get_openai_api_key,
    get_openai_model,
    mode_label,
    navigation_mode_candidates,
    parse_navigation_query,
    public_place_payload,
    read_http_error,
    valid_lat_lng,
)


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
        "mcpTools": ["chat_complete", "classify_intent", "route_matrix", "navigate"],
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
            answer = build_navigation_answer(query, route_request, [], route_errors)
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
        answer = build_navigation_answer(query, route_request, route_options, route_errors)
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
        "health": mcp_tool_health,
        "chat_complete": mcp_tool_chat_complete,
        "classify_intent": mcp_tool_classify_intent,
        "route_matrix": mcp_tool_route_matrix,
        "navigate": mcp_tool_navigate,
    }


def mcp_tool_descriptions():
    return [
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
