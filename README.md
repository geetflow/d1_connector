## 📄 `d1_connector` – WebSocket D1 SQL Proxy

This project exposes a **WebSocket-based SQL connector** for Cloudflare D1 databases, with **username/password authentication** and **multi-database support** using environment bindings.

---

### 🛠️ Features

* 🔐 Authenticated WebSocket access (via query params)
* 🗃️ Multi-database support via `?database=...`
* ⚡ Real-time SQL execution over WebSocket
* 🧱 Easy integration with Python and other clients
* 🌐 Secure credentials via `wrangler secrets` or `vars`

---

## 📦 Setup

### 1. **Install Wrangler**

```bash
npm install -g wrangler
```

---

### 2. **`wrangler.toml` Example**

```toml
name = "d1_connector"
main = "worker.js"
compatibility_date = "2024-08-01"
workers_dev = true

[vars]
AUTH_USERNAME = "root"         # Or use `wrangler secret`
AUTH_PASSWORD = "rootPasword"

[[d1_databases]]
binding = "DB_name"
database_name = "name"
database_id = "<your-database-id>"

[[d1_databases]]
binding = "DB_name2"
database_name = "name2"
database_id = "<your-database-id>"
```

> Replace `<your-database-id>` with the real ID from your D1 instance.

---

### 3. **Deploy Worker**

```bash
wrangler publish
```

---

## 🔐 Auth

Authentication is done via query parameters:

```
?username=<USERNAME>&password=<PASSWORD>&database=<DBNAME>
```

The credentials are checked against `env.AUTH_USERNAME` and `env.AUTH_PASSWORD`.

---

## 🔌 WebSocket Usage

### ✅ Supported route

```
/ws
```

### 💡 Example WebSocket URL

```
wss://<your-worker>.workers.dev/ws?username=root&password=rootPasword&database=name
```

---

### 📤 Client Request Format

```json
{
  "sql": "SELECT * FROM tracks WHERE artist = ?",
  "params": ["arijit"]
}
```

### 📥 Server Response Format

```json
{
  "result": {
    "results": [
      { "id": 1, "title": "Tum Hi Ho" },
      ...
    ]
  }
}
```

### 🔥 Error Response Format

```json
{
  "error": "Invalid SQL query" 
}
```

---

## 🐍 Python Client Example

```python
import asyncio
import websockets
import json

async def query_d1():
    url = "wss://<your-worker>.workers.dev/ws?username=root&password=rootPasword&database=name"
    async with websockets.connect(url) as ws:
        await ws.send(json.dumps({
            "sql": "SELECT * FROM tracks LIMIT 10",
            "params": []
        }))
        response = await ws.recv()
        print("Response:", json.loads(response))

asyncio.run(query_d1())
```

---

## 🧪 Testing

You can test HTTP or WebSocket routes:

```bash
# HTTP Check
curl "https://<your-worker>.workers.dev/?username=root&password=rootPasword&database=name"

# WebSocket Check (via wscat)
wscat -c "wss://<your-worker>.workers.dev/ws?username=root&password=rootPasword&database=name"
```

---

## 🧩 Worker Code Breakdown

* `/ws`: WebSocket route for executing SQL
* Authentication: Validates against env vars
* Multi-DB: Picks correct binding like `DB_music` from query `?database=music`
* JSON-based messaging

---

## 🛡️ Security Tips

* Use `wrangler secret` for storing `AUTH_USERNAME` and `AUTH_PASSWORD`
* Rate-limit or IP-filter access via Cloudflare rules if needed
* Use HTTPS/WSS always (Cloudflare enforces it)

---

Let me know if you want this exported as a file (`README.md`) or want to include more languages or advanced features like API tokens.
