import json
import os
import shlex
import subprocess
import sys
import threading
import time
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

from navigator_core import (
    APP_NAME,
    CHAT_STREAM_CHUNK_CHARS,
    CHAT_STREAM_CHUNK_DELAY_SECONDS,
    current_llm_model,
    get_env_value,
    get_groq_model,
    get_llm_provider,
    get_ollama_model,
    get_openai_model,
    strip_reasoning_text,
)


class MCPClientError(Exception):
    def __init__(self, message, status=500, payload=None):
        super().__init__(message)
        self.status = status
        self.payload = payload or {"error": message}


def parse_mcp_tool_result(result):
    if not isinstance(result, dict):
        return result
    if "structuredContent" in result:
        return result["structuredContent"]
    content = result.get("content")
    if isinstance(content, list) and content:
        text = str(content[0].get("text", ""))
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"text": text}
    return result


class StdioMCPClient:
    def __init__(self, command):
        self.command = command
        self.lock = threading.Lock()
        self.process = None
        self.next_id = 1

    def call_tool(self, name, arguments=None):
        with self.lock:
            self.ensure_started_locked()
            result = self.send_request_locked(
                "tools/call",
                {"name": name, "arguments": arguments or {}},
            )
            return parse_mcp_tool_result(result)

    def ensure_started_locked(self):
        if self.process and self.process.poll() is None:
            return
        self.process = subprocess.Popen(
            self.command,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=sys.stderr,
            text=True,
            bufsize=1,
            cwd=os.path.dirname(os.path.abspath(__file__)),
        )
        self.send_request_locked(
            "initialize",
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "imperial-http-adapter", "version": "1.0"},
            },
        )
        self.send_notification_locked("notifications/initialized", {})

    def send_notification_locked(self, method, params=None):
        request = {"jsonrpc": "2.0", "method": method, "params": params or {}}
        self.write_json_line_locked(request)

    def send_request_locked(self, method, params=None):
        request_id = self.next_id
        self.next_id += 1
        request = {"jsonrpc": "2.0", "id": request_id, "method": method, "params": params or {}}
        self.write_json_line_locked(request)
        line = self.process.stdout.readline() if self.process and self.process.stdout else ""
        if not line:
            raise MCPClientError("MCP server did not return a response.", status=503)
        try:
            response = json.loads(line)
        except json.JSONDecodeError as error:
            raise MCPClientError(f"MCP server returned invalid JSON: {error}", status=503)
        if response.get("id") != request_id:
            raise MCPClientError("MCP server returned an unexpected response id.", status=503)
        if response.get("error"):
            error = response["error"]
            data = error.get("data") if isinstance(error, dict) else {}
            payload = data.get("payload") if isinstance(data, dict) else None
            status = data.get("status", 500) if isinstance(data, dict) else 500
            message = error.get("message", "MCP tool call failed") if isinstance(error, dict) else "MCP tool call failed"
            raise MCPClientError(message, status=status, payload=payload)
        return response.get("result")

    def write_json_line_locked(self, payload):
        if not self.process or not self.process.stdin:
            raise MCPClientError("MCP server is not running.", status=503)
        try:
            self.process.stdin.write(json.dumps(payload, ensure_ascii=False) + "\n")
            self.process.stdin.flush()
        except BrokenPipeError:
            raise MCPClientError("MCP server pipe closed.", status=503)

    def close(self):
        if self.process and self.process.poll() is None:
            self.process.terminate()
            try:
                self.process.wait(timeout=2)
            except subprocess.TimeoutExpired:
                self.process.kill()


class HttpMCPClient:
    def __init__(self, endpoint):
        self.endpoint = endpoint
        self.lock = threading.Lock()
        self.next_id = 1

    def call_tool(self, name, arguments=None):
        with self.lock:
            request_id = self.next_id
            self.next_id += 1
        body = json.dumps(
            {
                "jsonrpc": "2.0",
                "id": request_id,
                "method": "tools/call",
                "params": {"name": name, "arguments": arguments or {}},
            },
            ensure_ascii=False,
        ).encode("utf-8")
        request = urllib.request.Request(
            self.endpoint,
            data=body,
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=90) as response:
            payload = json.loads(response.read().decode("utf-8", errors="replace"))
        if payload.get("error"):
            error = payload["error"]
            data = error.get("data") if isinstance(error, dict) else {}
            detail = data.get("payload") if isinstance(data, dict) else None
            status = data.get("status", 500) if isinstance(data, dict) else 500
            message = error.get("message", "Remote MCP tool call failed") if isinstance(error, dict) else "Remote MCP tool call failed"
            raise MCPClientError(message, status=status, payload=detail)
        return parse_mcp_tool_result(payload.get("result"))


MCP_CLIENT = None


def get_mcp_client():
    global MCP_CLIENT
    if MCP_CLIENT:
        return MCP_CLIENT

    endpoint = get_env_value("IMPERIAL_MCP_SERVER_URL") or get_env_value("MCP_SERVER_URL")
    if endpoint:
        MCP_CLIENT = HttpMCPClient(endpoint)
        return MCP_CLIENT

    command_text = get_env_value("IMPERIAL_MCP_COMMAND") or get_env_value("MCP_SERVER_COMMAND")
    command = shlex.split(command_text) if command_text else [sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), "mcp_server.py")]
    MCP_CLIENT = StdioMCPClient(command)
    return MCP_CLIENT


def mcp_call_tool(name, arguments=None):
    return get_mcp_client().call_tool(name, arguments or {})


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
            try:
                self.write_json(mcp_call_tool("health", {}))
            except MCPClientError as error:
                self.write_mcp_error(error)
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

        self.handle_chat()

    def handle_chat(self):
        try:
            payload = self.read_json()
            question = str(payload.get("question", "")).strip()
            if not question:
                self.write_json({"error": "请先输入一个问题。"}, status=400)
                return

            if should_stream_chat(payload):
                self.stream_chat_from_mcp(payload)
                return

            self.write_json(mcp_call_tool("chat_complete", {"payload": payload}))
        except MCPClientError as error:
            self.write_mcp_error(error)
        except Exception as error:
            self.write_json({"error": f"服务端错误：{error}"}, status=500)

    def handle_routes(self):
        try:
            self.write_json(mcp_call_tool("route_matrix", self.read_json()))
        except MCPClientError as error:
            self.write_mcp_error(error)
        except Exception as error:
            self.write_json({"error": f"Route calculation failed: {error}"}, status=500)

    def handle_intent(self):
        try:
            self.write_json(mcp_call_tool("classify_intent", self.read_json()))
        except MCPClientError as error:
            self.write_json({"mode": "study", "confidence": 0, "reason": f"Intent check failed: {error}"})
        except Exception as error:
            self.write_json({"mode": "study", "confidence": 0, "reason": f"Intent check failed: {error}"})

    def handle_navigate(self):
        try:
            self.write_json(mcp_call_tool("navigate", self.read_json()))
        except MCPClientError as error:
            self.write_mcp_error(error)
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

    def write_mcp_error(self, error):
        self.write_json(error.payload or {"error": str(error)}, status=error.status)

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", get_cors_origin(self.headers.get("Origin")))
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def stream_json(self, payload):
        line = json.dumps(payload, ensure_ascii=False).encode("utf-8") + b"\n"
        self.wfile.write(line)
        self.wfile.flush()

    def stream_chat_from_mcp(self, payload):
        self.send_response(200)
        self.send_header("Content-Type", "application/x-ndjson; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_cors_headers()
        self.end_headers()

        try:
            result = mcp_call_tool("chat_complete", {"payload": payload})
            answer = strip_reasoning_text(str(result.get("answer", "") if isinstance(result, dict) else result)).strip()
            if not answer:
                answer = "模型没有返回文本结果。"

            for chunk in iter_stream_chunks(answer):
                self.stream_json({"delta": chunk})
                if CHAT_STREAM_CHUNK_DELAY_SECONDS > 0:
                    time.sleep(CHAT_STREAM_CHUNK_DELAY_SECONDS)

            model_name = result.get("model", current_llm_model()) if isinstance(result, dict) else current_llm_model()
            provider_name = result.get("provider", get_llm_provider()) if isinstance(result, dict) else get_llm_provider()
            self.stream_json({"done": True, "model": model_name, "provider": provider_name})
        except BrokenPipeError:
            return
        except MCPClientError as error:
            message = (error.payload or {}).get("error") or str(error)
            self.stream_json({"error": message})
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


def should_stream_chat(payload):
    raw = payload.get("stream", True)
    if isinstance(raw, bool):
        return raw
    if isinstance(raw, str):
        return raw.strip().lower() not in {"0", "false", "no", "off"}
    return bool(raw)


def iter_stream_chunks(text, chunk_chars=CHAT_STREAM_CHUNK_CHARS):
    value = str(text or "")
    size = max(4, int(chunk_chars or 18))
    cursor = 0
    length = len(value)
    while cursor < length:
        end = min(length, cursor + size)
        while end < length and value[end] not in {" ", "\n", "\t", "，", "。", "!", "?", ",", ";", ":", "；", "："}:
            if end - cursor >= size + 10:
                break
            end += 1
        chunk = value[cursor:end]
        if chunk:
            yield chunk
        cursor = end


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
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        if MCP_CLIENT and hasattr(MCP_CLIENT, "close"):
            MCP_CLIENT.close()


if __name__ == "__main__":
    main()
