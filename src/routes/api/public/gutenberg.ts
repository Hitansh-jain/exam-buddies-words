import { createFileRoute } from "@tanstack/react-router";

// Public passthrough to Project Gutenberg for public-domain texts (Sherlock Holmes).
// We cache aggressively at the edge because these files never change.

export const Route = createFileRoute("/api/public/gutenberg")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const idParam = url.searchParams.get("id");
        const id = idParam ? Number(idParam) : NaN;
        if (!Number.isFinite(id) || id <= 0) {
          return new Response("bad id", { status: 400 });
        }

        // Try a few Gutenberg mirrors / naming patterns.
        const candidates = [
          `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
          `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
          `https://www.gutenberg.org/files/${id}/${id}.txt`,
        ];

        for (const src of candidates) {
          try {
            const res = await fetch(src, {
              headers: { "user-agent": "shabd-arena/1.0 (educational)" },
            });
            if (res.ok) {
              const text = await res.text();
              return new Response(text, {
                status: 200,
                headers: {
                  "content-type": "text/plain; charset=utf-8",
                  "cache-control": "public, max-age=86400, s-maxage=604800",
                },
              });
            }
          } catch {
            /* try next */
          }
        }
        return new Response("upstream unavailable", { status: 502 });
      },
    },
  },
});
