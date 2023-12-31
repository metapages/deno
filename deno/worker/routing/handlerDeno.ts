/**
 * Create request handler (incl websockets) for Deno Deploy
 */
export const createHandler = (
    handlerHttp: (request: Request) => Promise<Response | undefined>,
    handlerWs?: (socket: WebSocket, request: Request) => void
  ) => {
    const boundHandlerWs = handlerWs ? createHandlerWs(handlerWs) : undefined;
  
    return async (request: Request): Promise<Response> => {
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
        return new Response("i am not touching that", { status: 400 });
      } catch (e) {
        console.error(e.message);
        return new Response("i fell over", { status: 500 });
      }
    };
  };
  
  const createHandlerWs = (handler: (socket: WebSocket,
    request: Request) => void) => (request: Request): Response | undefined => {
    const upgrade = request.headers.get("Upgrade");
    if (upgrade === "websocket") {
      try {
  
        const { socket, response } = Deno.upgradeWebSocket(request);
  
        socket.addEventListener("open", () => {
          handler(socket, request);
        });
  
        return response;
      } catch (e) {
        console.error(e);
        return new Response(e.message, { status: 500 });
      }
    }
  };
  