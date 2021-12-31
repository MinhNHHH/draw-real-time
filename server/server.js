const http = require('http');
const WebSocketServer = require('websocket').server;

const server = http.createServer();

const wsServer = new WebSocketServer({
  httpServer: server
});
const clients = []
const id = Math.random()
wsServer.on('request', function (request) {
  console.log(request.origin)
  const connection = request.accept(null, request.origin);
  connection.id = id
  clients.push(connection)

  connection.on('message', function (message) {
    const msg = JSON.parse(message['utf8Data'])

    clients.forEach(function (client) {
      // client.send(JSON.stringify({
      //   event: msg.event,
      //   message: msg.message
      // }))
      if (client !== connection && client.readyState === WebSocketServer.OPEN){
        client.send(JSON.stringify({
          event: msg.event,
          message: msg.message
        }))
      };
    })
  });
  connection.on('close', function (reasonCode, description) {
    console.log('Client has disconnected.');
  });
});
server.listen(process.env.PORT ||8000);