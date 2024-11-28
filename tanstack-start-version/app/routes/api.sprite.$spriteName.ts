import { createAPIFileRoute } from '@tanstack/start/api'
import { setHeaders } from 'vinxi/http';

export const APIRoute = createAPIFileRoute('/api/sprite/$spriteName')({
  GET: async ({ params }) => {
    const { spriteName } = await params;

    // Make sure spritename matches format {id}.png (use a regex)
    if (!/^\d+\.png$/.test(spriteName)) {
      return new Response("Not found", { status: 404 });
    }
  
    const dexId = parseInt(spriteName.split(".")[0]!);
  
    if (isNaN(dexId) || dexId < 1 || dexId > 1025) {
      return new Response("Not found", { status: 404 });
    }

    const spriteFromGithub = await fetch(
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexId}.png`
    );

    setHeaders({
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      "CDN-Cache-Control": "public, max-age=31536000, immutable",
      "Vercel-CDN-Cache-Control": "public, max-age=31536000, immutable",
    });
  
    return new Response(spriteFromGithub.body);
  },
})
