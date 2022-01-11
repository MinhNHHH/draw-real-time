const http = require('http');
const WebSocketServer = require('websocket').server;
//const { uuid } = require('uuidv4');

const server = http.createServer();

const wsServer = new WebSocketServer({
  httpServer: server
});
const list_room = [];
function update_dic(a, b) {
  console.log(b)
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
    if (!this.connections.includes(connection)) {
      return this.connections.push(connection)
    }
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
          console.log("add object draw")
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
        const index_object = this.object_draw.indexOf(object_removed)
        this.object_draw.splice(index_object, 1);
        break
      case ("paste-objects"):
        console.log(message['message'])
    };
  };

  boardcastException(msg, connection) {
    this.connections.forEach(function (client) {
      if (client !== connection && client.readyState === WebSocketServer.OPEN) {
        client.send(JSON.stringify({
          event: msg.event,
          message: msg.message
        }));
      };
    });
  };

  handleDeleteConnection(connection) {
    this.connections.splice(connection, 1)
  };
};


wsServer.on('request', function (request) {
  const connection = request.accept(null, request.origin);
  // check room existed and create room and add connection
  let room = list_room.find(r => r.room_id === request.resourceURL['path'])
  if (!room) {
    room = new Room(request.resourceURL['path'])
    list_room.push(room)
  }
  // If room existed add another connection
  room.addConnection(connection)
  // send message to client when first connect
  connection.send(JSON.stringify({
    event: "connect",
    object_existed: room.object_draw
  }));
  connection.on('message', function (message) {
    const msg = JSON.parse(message['utf8Data']);
    // handle message
    room.handleMessage(msg)
    // send message to client.
    room.boardcastException(msg, connection)

  });

  connection.on('close', function (reasonCode, description) {
    room.handleDeleteConnection(connection)
    console.log('Client has disconnected.');
  });

});
server.listen(8000);