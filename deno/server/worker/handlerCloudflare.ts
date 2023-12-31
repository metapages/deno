import {
  IncomingRequestCf,
  WebSocketPair,
} from 'https:/raw.githubusercontent.com/skymethod/denoflare/v0.5.11/common/cloudflare_workers_types.d.ts';

// For _worker.ts scripts, the asset fetcher is passed
  interface Env {
    // ASSETS: Fetcher;
    ASSETS: {
      fetch: (request: Request) => Promise<Response>;
    };
    NHOST_ADMIN_SECRET: string;
    NHOST_GRAPHQL_URL: string;
  }
  
  
  export const createHandler = (
    handlerHttp: (request: Request) => Promise<Response | undefined>,
    handlerWs?: (socket: WebSocket, request: Request) => void
  ) => {
    const boundHandlerWs = handlerWs ? createHandlerWs(handlerWs) : undefined;
  
    return async (request: IncomingRequestCf, env?: Env): Promise<Response> => {
      try {
        let response: Response | undefined;
        if (boundHandlerWs) {
          response = boundHandlerWs(request);
          if (response) {
            return response;
          }
        }
  
        response = await handlerHttp(request);
        if (response) {
          return response;
        }
        
        if (env) {
          // Otherwise, serve the static assets.
          // Without this, the Worker will error and no assets will be served.
          return env.ASSETS.fetch(request);
        }
        
        return new Response("i am not touching that", { status: 400 });
      } catch (e) {
        console.error(e.message);
        return new Response("i fell over", { status: 500 });
      }
    };
  };
  
  const createHandlerWs =
    (handler: (socket: WebSocket, request: Request) => void) =>
    (request: Request): Response | undefined => {
      const upgrade = request.headers.get("Upgrade");
      if (upgrade === "websocket") {
        // @ts-ignore
        const wsp = new WebSocketPair();
        const pair = wsp as WebSocketPair;
        const client = pair[0];
        const server = pair[1];
  
        server.accept();
  
        handler(server, request);
  
        return new Response(null, {
          status: 101,
          // @ts-ignore
          webSocket: client,
        });
      }
    };
  