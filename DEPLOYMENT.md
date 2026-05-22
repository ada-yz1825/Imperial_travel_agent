# 让别人使用 CityWise

这个项目包含前端页面和一个 Python 后端。别人访问时必须访问后端服务，而不是直接打开 `index.html`，因为聊天需要调用 `/api/chat`。

## 方案一：同一个 Wi-Fi 或局域网

适合演示、课堂、办公室内试用。

1. 在你的电脑上启动 Ollama 模型：

```bash
ollama run qwen3
```

2. 在项目目录启动服务：

```bash
cd "/Users/yz1825/Travel Agent"
PORT=8001 python3 server.py
```

3. 查你的局域网 IP：

```bash
ipconfig getifaddr en0
```

如果你用的是有线网络，可能需要：

```bash
ipconfig getifaddr en1
```

4. 让别人访问：

```text
http://你的局域网IP:8001
```

例如：

```text
http://192.168.1.23:8001
```

如果别人打不开，检查 macOS 是否弹出防火墙提示，并允许 Python 接收网络连接。

## 方案二：公网部署，使用 OpenAI API

适合让不在同一网络的人访问。这个方式部署最轻，因为云服务器不需要跑本地大模型。

在云服务器上：

```bash
export LLM_PROVIDER="openai"
export OPENAI_API_KEY="你的密钥"
export OPENAI_MODEL="gpt-5.2"
PORT=8001 python3 server.py
```

然后把服务器的域名或公网 IP 指向这个服务。正式发布时建议放在 Nginx、Caddy 或其他反向代理后面，并启用 HTTPS。

## 方案三：公网部署，使用 Ollama

适合坚持免费本地模型，但需要一台有足够内存和算力的机器。

在服务器上：

```bash
ollama run qwen3
PORT=8001 python3 server.py
```

小机器建议换更快模型：

```bash
ollama run qwen2.5:3b
OLLAMA_MODEL="qwen2.5:3b" PORT=8001 python3 server.py
```

## 检查服务状态

服务启动后访问：

```text
http://localhost:8001/api/health
```

正常会返回类似：

```json
{"ok": true, "provider": "ollama", "model": "qwen3", "streaming": true}
```

## 注意

- 不要把 `OPENAI_API_KEY` 写进前端代码或提交到公开仓库。
- 如果用 Ollama，模型运行在启动 `server.py` 的那台机器上，访问者不需要安装 Ollama。
- 当前天气、交通、拥挤和地点数据仍是模拟数据，正式给别人用前建议接入真实数据源。
