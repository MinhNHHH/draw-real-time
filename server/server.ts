// const { WebSocketServer } = require('ws');
import { WebSocket } from "ws";

// const PORT : any =  process.env.PORT || 3000
const PORT: any = 8000;
const wsServer = new WebSocket.Server({ port: PORT });

const list_room: Array<any> = [];

function update_dic(a: any, b: any) {
  for (let key in b) {
    a[key] = b[key];
  }
  return a;
}

interface Room {
  room_id: string;
  connections: Array<WebSocket>;
  object_draw: Array<any>;
}

interface message {
  event: string;
  message: { object: any; id: string };
}

class Room {
  constructor(room_id: any) {
    this.room_id = room_id;
    this.connections = [];
    this.object_draw = [];
  }

  addConnection(connection: WebSocket) {
    if (!this.connections.includes(connection)) {
      return this.connections.push(connection);
    }
  }

  addObject(object: object) {
    return this.object_draw.push(object);
  }

  handleMessage(message: message) {
    switch (message["event"]) {
      case "addObjectIntoDb":
        let temporary = message["message"]["object"];
        temporary["id"] = message["message"]["id"];
        if (!this.object_draw.find((o) => o.id === temporary.id)) {
          this.object_draw.push(temporary);
        }
        break;
      case "objectScalling":
        const objectUpdate = this.object_draw.find(
          (o) => o.id === message["message"].id
        );
        update_dic(objectUpdate, message["message"]);
        break;
      case "clearCanvas":
        this.object_draw.length = 0;
        break;
      case "deleteObjects":
        this.object_draw = this.object_draw.filter((object) => {
          return message["message"].id.indexOf(object.id) === -1;
        });
        break;
      case "changeAttribute":
        const objectChangeAttribute = this.object_draw.find(
          (o) => o.id === message["message"].id
        );
        update_dic(objectChangeAttribute, message["message"]);
        break;
    }
  }

  boardcastException(msg: message, connection: WebSocket) {
    this.connections.forEach(function (client) {
      if (client !== connection && client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            event: msg.event,
            message: msg.message,
          })
        );
      }
    });
  }

  handleDeleteConnection(connection: any) {
    this.connections.splice(connection, 1);
  }
}

wsServer.on("connection", (ws: WebSocket, request) => {
  // check room existed and create room and add connection
  let room: Room = list_room.find((r) => r.room_id === request.url);

  if (!room) {
    room = new Room(request.url);
    list_room.push(room);
  }
  // If room existed add another connection
  room.addConnection(ws);
  // send message to client when first connect
  ws.send(
    JSON.stringify({
      event: "connect",
      message: room.object_draw,
    })
  );

  ws.on("message", (message: Buffer) => {
    const msg = JSON.parse(message.toString("utf-8"));
    // handle message
    room.handleMessage(msg);
    // send message to client.
    room.boardcastException(msg, ws);
    console.log("room", room);
  });
  ws.on("close", () => {
    room.handleDeleteConnection(ws);
    console.log("Client has disconnected.");
  });
});
