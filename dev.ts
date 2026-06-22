import { watch } from "fs";

const clients = new Set<ReadableStreamDefaultController>();

Bun.serve({
  port: 3000,
  idleTimeout: 255, // keep the live-reload SSE stream open (max allowed)
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/__reload") {
      let ctrl: ReadableStreamDefaultController;
      const stream = new ReadableStream({
        start(c) { ctrl = c; clients.add(c); },
        cancel(c) { clients.delete(c); },
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    let path = url.pathname === "/" ? "/index.html" : url.pathname;
    let file = Bun.file(`src${path}`);
    if (!(await file.exists())) {
      // try "<path>.html", then directory index "<path>/index.html"
      const htmlExt = path + ".html";
      const dirIndex = (path.endsWith("/") ? path : path + "/") + "index.html";
      if (await Bun.file(`src${htmlExt}`).exists()) path = htmlExt;
      else if (await Bun.file(`src${dirIndex}`).exists()) path = dirIndex;
      else return new Response("Not found", { status: 404 });
      file = Bun.file(`src${path}`);
    }

    let body = await file.text();
    if (path.endsWith(".html")) {
      body += `<script>new EventSource("/__reload").onmessage=()=>location.reload()</script>`;
    }
    return new Response(body, { headers: { "Content-Type": file.type } });
  },
});

watch("src", { recursive: true }, () => {
  for (const c of clients) {
    try { c.enqueue(`data: reload\n\n`); }
    catch { clients.delete(c); } // drop closed/stale controllers
  }
});

console.log("http://localhost:3000");
