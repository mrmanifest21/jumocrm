import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type App = Hono<{ Bindings: HttpBindings }>;

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(__dirname, "../../dist/public");

  app.use("/assets/*", serveStatic({ root: path.relative(process.cwd(), distPath) || "." }));

  app.get("*", (c) => {
    const accept = c.req.header("accept") ?? "";
    const isApi = c.req.path.startsWith("/api/");
    if (isApi) {
      return c.json({ error: "Not Found" }, 404);
    }
    if (!accept.includes("text/html") && c.req.path !== "/") {
      return c.json({ error: "Not Found" }, 404);
    }
    try {
      const indexPath = path.resolve(distPath, "index.html");
      const content = fs.readFileSync(indexPath, "utf-8");
      return c.html(content);
    } catch {
      return c.json({ error: "index.html not found" }, 500);
    }
  });
}
