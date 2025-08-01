var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const username = url.searchParams.get("username");
    const password = url.searchParams.get("password");
    const expectedUsername = env.AUTH_USERNAME;
    const expectedPassword = env.AUTH_PASSWORD;
    if (username !== expectedUsername || password !== expectedPassword) {
     return new Response("Unauthorized: Invalid username or password", {
      status: 401,
       headers: { "X-Error-Type": "Authentication" }
     });
     }
    const dbName = url.searchParams.get("database");
    const db = getDatabaseBinding(env, dbName);
    if (!db) {
      return new Response(`Invalid database: ${db} ` + dbName, {
        status: 400,
        headers: { "X-Error-Type": "Database" }
      });
    }
    if (pathname === "/ws" && request.headers.get("Upgrade") === "websocket") {
      const [client, server] = Object.values(new WebSocketPair());
      server.accept();
      server.addEventListener("message", async (event) => {
        try {
          const { sql, params } = JSON.parse(event.data);
          const result = await db.prepare(sql).bind(...params || []).all();
          server.send(JSON.stringify({ result }));
        } catch (e) {
          server.send(JSON.stringify({ error: e.message }));
        }
      });
      return new Response(null, {
        status: 101,
        webSocket: client
      });
    }
    return new Response("D1 Multi-DB Worker Ready", { status: 200 });
  }
};
function getDatabaseBinding(env, dbName) {
  console.log("Requested database:", dbName);
  console.log("Available bindings:", Object.keys(env).filter((key) => key.startsWith("DB_")));
  const bindingKey = Object.keys(env).find(
    (key) => key.toLowerCase() === `db_${dbName}`.toLowerCase()
  );
  console.log("Selected binding:", bindingKey);
  return bindingKey ? env[bindingKey] : null;
}
__name(getDatabaseBinding, "getDatabaseBinding");
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
