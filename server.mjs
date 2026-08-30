import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { handleApiRequest } from "./server/api.mjs";

const root = resolve(fileURLToPath(new URL("./dist", import.meta.url)));
const port = Number(process.env.PORT || 8080);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

function serveFile(response, path) {
  response.writeHead(200, {
    "Content-Type": contentTypes[extname(path)] || "application/octet-stream",
    "Cache-Control": extname(path) === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
  });
  createReadStream(path).pipe(response);
}

const server = createServer(async (request, response) => {
  if (await handleApiRequest(request, response, process.env)) return;

  const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  const requestedPath = resolve(join(root, normalize(pathname)));
  const safePath = requestedPath.startsWith(root) ? requestedPath : root;
  const assetPath = existsSync(safePath) && statSync(safePath).isFile()
    ? safePath
    : join(root, "index.html");

  if (!existsSync(assetPath)) {
    response.writeHead(503, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Build not found. Run npm run build first.");
    return;
  }

  serveFile(response, assetPath);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Phuturai is listening on http://localhost:${port}`);
});
