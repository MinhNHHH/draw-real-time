const http = require('http');
const WebSocketServer = require('websocket').server;

const server = http.createServer();

const wsServer = new WebSocketServer({
  httpServer: server
});
const object_existed = [];
const clients = [];

wsServer.on('request', function (request) {
  const connection = request.accept(null, request.origin);
  clients.push(connection);

  connection.send(JSON.stringify({
    event : "connect",
    object_existed : object_existed
  }))

  connection.on('message', function (message) {
    const msg = JSON.parse(message['utf8Data']);
    if (msg['event'] === "add-objects-exist") {
      msg['message'].object.forEach(o => {
        if (!object_existed.includes(o)) {
          object_existed.push(o);
        };
      });
    };
    clients.forEach(function (client) {
      // client.send(JSON.stringify({
      //   event: msg.event,
      //   message: msg.message
      // }))
      if (client !== connection && client.readyState === WebSocketServer.OPEN) {
        client.send(JSON.stringify({
          event: msg.event,
          message: msg.message
        }));
      };
    });
  });
  connection.on('close', function (reasonCode, description) {
    console.log('Client has disconnected.');
  });
});
server.listen(8000);