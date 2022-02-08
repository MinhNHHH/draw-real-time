const { WebSocket, WebSocketServer } = require('ws');
const PORT = process.env.PORT || 8000;
const wsServer = new WebSocketServer({ port: PORT });
const list_room = [];
function update_dic(a, b) {
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
          this.object_draw.push(temporary);
        }
        break;
      case ("modify-objects"):
        const objectUpdate = this.object_draw.find(o => o.id === message['message'].id);
        update_dic(objectUpdate, message['message']);
        break;
      case ("clear-canvas"):
        this.object_draw.length = 0;
        break;
      case ("remove-objects"):
        this.object_draw = this.object_draw.filter((object) => {
          return message['message'].id.indexOf(object.id) === -1;
        });
        break;
      case ("paste-objects"):
        console.log(message['message']);
        break;
      case ("change-attribute"):
        const objectChangeAttribute = this.object_draw.find(o => o.id === message['message'].id);
        update_dic(objectChangeAttribute, message['message']);
        break;
    };
  };

  boardcastException(msg, connection) {
    this.connections.forEach(function (client) {
      if (client !== connection && client.readyState === WebSocket.OPEN) {

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

wsServer.on('connection', (ws, request) => {
  // check room existed and create room and add connection
  let room = list_room.find(r => r.room_id === request.url);
  
  if (!room) {
    room = new Room(request.url);
    list_room.push(room);
  }
  // If room existed add another connection
  room.addConnection(ws);
  // send message to client when first connect
  ws.send(JSON.stringify({
    event: "connect",
    object_existed: room.object_draw
  }));
  ws.on('message', (message) => {
    const msg = JSON.parse(message.toString('utf-8'));
    // handle message 
    room.handleMessage(msg);
    // send message to client.
    room.boardcastException(msg, ws);
  })
  ws.on('close', () => {
    room.handleDeleteConnection(ws);
    console.log('Client has disconnected.');
  })
})
