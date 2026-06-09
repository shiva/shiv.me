import { watch } from "fs";

const clients = new Set<ReadableStreamDefaultController>();

Bun.serve({
  port: 3000,
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
    let file = Bun.file(`htdocs${path}`);
    if (!(await file.exists())) {
      file = Bun.file(`htdocs${path}.html`);
      if (await file.exists()) path = path + ".html";
      else return new Response("Not found", { status: 404 });
    }

    let body = await file.text();
    if (path.endsWith(".html")) {
      body += `<script>new EventSource("/__reload").onmessage=()=>location.reload()</script>`;
    }
    return new Response(body, { headers: { "Content-Type": file.type } });
  },
});

watch("htdocs", { recursive: true }, () => {
  for (const c of clients) c.enqueue(`data: reload\n\n`);
});

console.log("http://localhost:3000");
