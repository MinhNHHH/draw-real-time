const http = require('http');
const WebSocketServer = require('websocket').server;

const server = http.createServer();

const wsServer = new WebSocketServer({
  httpServer: server
});
const object_existed = [];
const clients = [];

function update_dic(a, b) {
  for (key in b) {
    a[key] = b[key]
  }
  return a;
}

wsServer.on('request', function (request) {
  const connection = request.accept(null, request.origin);
  clients.push(connection);

  connection.send(JSON.stringify({
    event: "connect",
    object_existed: object_existed
  }))

  connection.on('message', function (message) {
    const msg = JSON.parse(message['utf8Data']);
    if (msg['event'] === "add-objects-exist") {
      let temporary = msg['message']['object'];
      temporary['id'] = msg['message']['id'];
      if (!object_existed.some(o => o.id === temporary.id)){
        object_existed.push(temporary)
      };
      object_existed.forEach(o => {
        if (o.id === temporary.id){
          update_dic(o,temporary)
        }
      })
    }
    else if(msg['event'] === "clear-canvas"){
      return object_existed.length = 0
    }
    else if(msg['event'] === "remove-objects"){
      const object_removed = object_existed.find(o => o.id === msg['message'].id)
      object_existed.splice(object_removed,1)
    };
    clients.forEach(function (client) {
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