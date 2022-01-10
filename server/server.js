const http = require('http');
const WebSocketServer = require('websocket').server;
//const { uuid } = require('uuidv4');

const server = http.createServer();

const wsServer = new WebSocketServer({
  httpServer: server
});

const room = [];

function update_dic(a, b) {
  for (key in b) {
    a[key] = b[key]
  };
  return a;
};

wsServer.on('request', function (request) {

  const connection = request.accept(null, request.origin);
  if (!room.some(r => r.id === request.resourceURL['path'])) {
    let temp = {};
    let client = [];
    client.push(connection);
    temp.id = request.resourceURL['path'];
    temp.connection = client;
    temp.object_draw = [];
    room.push(temp);
  }
  else {
    const room_exist = room.find(r => r.id === request.resourceURL['path'])
    // room_exist.connection.forEach(client => {
    //   if (client !== connection) {
    //     room_exist.connection.push(connection);
    //   };
    // });
    if(!room_exist.connection.includes(connection)){
      console.log('add new connection')
      room_exist.connection.push(connection);
    };
  };
  //clients.push(connection);
  const room_id = room.find(r =>
    r.connection.includes(connection)
  )
  connection.send(JSON.stringify({
    event: "connect",
    object_existed: room_id.object_draw
  }));

  connection.on('message', function (message) {
    // console.log("room",room)
    const msg = JSON.parse(message['utf8Data']);
    const room_id = room.find(r =>
      r.connection.includes(connection)
    )
    if (msg['event'] === "add-objects-exist") {
      let temporary = msg['message']['object'];
      temporary['id'] = msg['message']['id'];
      if (!room_id.object_draw.some(o => o.id === temporary.id)) {
        room_id.object_draw.push(temporary);
      }
    }
    else if (msg['event'] === "modify-objects"){
      const object_update = room_id.object_draw.find(o => o.id === msg['message'].id);
      update_dic(object_update, msg['message']);
    }
    else if (msg['event'] === "clear-canvas") {
      room_id.object_draw.length = 0;
    }
    else if (msg['event'] === "remove-objects") {
      const object_removed = room_id.object_draw.find(o => o.id === msg['message'].id);
      room_id.object_draw.splice(object_removed, 1);
    };
    console.log(room)
    room_id.connection.forEach(function (client) {
      if (client !== connection && client.readyState === WebSocketServer.OPEN) {
        client.send(JSON.stringify({
          event: msg.event,
          message: msg.message
        }));
      };
    });
  });

  connection.on('close', function (reasonCode, description) {
    room_id.connection.splice(connection, 1);
    console.log('Client has disconnected.');
  });
});
server.listen(8000);