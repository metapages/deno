// deno run --allow-net --allow-read standard-library.ts
// Docs: https://deno.land/std/http
import { serve } from 'https://deno.land/std@0.188.0/http/server.ts';

import { createHandler } from '../handlerDeno.ts';

const port = parseInt(Deno.env.get("PORT") || "3000");
const APP_FQDN = Deno.env.get("APP_FQDN") || `http://localhost:${port}`;

const handlerWs = (
  socket: WebSocket,
  request: Request
) => {
  socket.send("hello from server");
}

const handlerHttp = async (
  request: Request
) => {
  return new Response("OK", {
    status: 200
  });
}

serve(createHandler(handlerHttp, handlerWs), {
  port,
  onError: (e: unknown) => {
    console.error(e);
    return Response.error();
  },
  onListen: () => {
    console.log(`🚀🌙 Listening on ${APP_FQDN}`);
  },
});
