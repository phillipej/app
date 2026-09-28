// Servidor estático zero-dependência do GHW Dashboard.
// Lê o catálogo direto dos manifests em functions/*/manifest.json.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function listFunctions() {
  const dir = path.join(ROOT, "functions");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const manifestPath = path.join(dir, e.name, "manifest.json");
      if (!fs.existsSync(manifestPath)) return null;
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        return { pasta: e.name, ...manifest };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      const ordem = { pronta: 0, prevista: 1 };
      return (ordem[a.estado] ?? 9) - (ordem[b.estado] ?? 9) || a.nome.localeCompare(b.nome, "pt-BR");
    });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === "/api/functions") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(listFunctions()));
    return;
  }

  if (url.pathname === "/api/dados") {
    const file = path.join(ROOT, "data", "dados.json");
    if (!fs.existsSync(file)) {
      res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ erro: "data/dados.json não encontrado" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(fs.readFileSync(file, "utf-8"));
    return;
  }

  let rel = decodeURIComponent(url.pathname === "/" ? "index.html" : url.pathname.slice(1));
  if (rel.includes("..")) {
    res.writeHead(400);
    res.end("caminho inválido");
    return;
  }
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("não encontrado");
    return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `A porta ${PORT} já está em uso. Feche o outro processo ou rode com outra porta: PORT=3000 npm start`
    );
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`GHW Dashboard rodando em http://localhost:${PORT}`);
});
