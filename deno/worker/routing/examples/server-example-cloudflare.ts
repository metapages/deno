import { createHandler } from '../handlerCloudflare.ts';

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

export const handler = createHandler(handlerHttp, handlerWs);

export default {
  fetch :handler,
};
