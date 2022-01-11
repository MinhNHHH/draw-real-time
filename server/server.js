const http = require('http');
const WebSocketServer = require('websocket').server;
//const { uuid } = require('uuidv4');

const server = http.createServer();

const wsServer = new WebSocketServer({
  httpServer: server
});

const list_room = [];

function update_dic(a, b) {
  // b.forEach(key => {
  //   a[key] = b[key]
  // })
  for (key in b) {
    a[key] = b[key]
  };
  return a;
};

class Room {
  constructor(room_id) {
    this.room_id = room_id;
    this.connections = [];
    this.object_draw = [];
  }

  addConnection(connection) {
    return this.connections.push(connection)
  }

  addObject(object) {
    return this.object_draw.push(object)
  }

  handleMessage(message) {
    switch (message['event']) {
      case ("add-objects-exist"):
        let temporary = message['message']['object'];
        temporary['id'] = message['message']['id'];
        if (!this.object_draw.find(o => o.id === temporary.id)) {
          this.object_draw.push(temporary);
        }
        break
      case ("modify-objects"):
        const object_update = this.object_draw.find(o => o.id === message['message'].id);
        update_dic(object_update, message['message']);
        break
      case ("clear-canvas"):
        this.object_draw.length = 0;
        break
      case ("remove-objects"):
        const object_removed = this.object_draw.find(o => o.id === message['message'].id);
        this.object_draw.splice(object_removed, 1);
        break
    }
  }
};


wsServer.on('request', function (request) {

  const connection = request.accept(null, request.origin);
  // check room existed and create room and add connection
  const existed_room = list_room.find(r => r.room_id === request.resourceURL['path'])
  if (!existed_room) {
    const new_room = new Room(request.resourceURL['path']);
    new_room.addConnection(connection)
    list_room.push(new_room);
  }
  // If room existed add another connection
  else {
    if (!existed_room.connections.includes(connection)) {
      console.log('add new connection')
      existed_room.connections.push(connection);
    };
  };
  // room contain connection
  const room_contain_connection = list_room.find(r =>
    r.connections.includes(connection)
  );
  // send message to client when first connect
  connection.send(JSON.stringify({
    event: "connect",
    object_existed: room_contain_connection.object_draw
  }));

  connection.on('message', function (message) {
    const msg = JSON.parse(message['utf8Data']);
    // handle message
    room_contain_connection.handleMessage(msg)
    // send message to client.
    room_contain_connection.connections.forEach(function (client) {
      if (client !== connection && client.readyState === WebSocketServer.OPEN) {
        client.send(JSON.stringify({
          event: msg.event,
          message: msg.message
        }));
      };
    });
  });

  connection.on('close', function (reasonCode, description) {
    room_contain_connection.connections.splice(connection, 1);
    console.log('Client has disconnected.');
  });
  console.log("room", list_room)
});
server.listen(8000);