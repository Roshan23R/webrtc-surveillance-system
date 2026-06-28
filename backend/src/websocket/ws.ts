const clients = new Set<WebSocket>();

export function addClient(ws: WebSocket) {
  clients.add(ws);
}

export function removeClient(ws: WebSocket) {
  clients.delete(ws);
}

export function broadcast(data: unknown) {
  const message = JSON.stringify(data);

  for (const client of clients) {
    client.send(message);
  }
}