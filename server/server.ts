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
  roomId: string;
  connections: Array<WebSocket>;
  objectDraws: Array<any>;
  temporaryObjects: Array<any>;
  temporaryAction: Array<any>;
}

interface message {
  event: string;
  message: any;
}

class Room {
  constructor(roomId: any) {
    this.roomId = roomId;
    this.connections = [];
    this.objectDraws = [];
  }

  addConnection(connection: WebSocket) {
    if (!this.connections.includes(connection)) {
      return this.connections.push(connection);
    }
  }

  addObject(object: object) {
    return this.objectDraws.push(object);
  }

  handleMessage(message: message) {
    switch (message["event"]) {
      case "addObjectIntoDb":
        let temporary = message["message"]["object"];
        temporary["id"] = message["message"]["id"];
        if (!this.objectDraws.find((o) => o.id === temporary.id)) {
          this.objectDraws.push(temporary);
          this.temporaryAction.push({
            event: "addObject",
            object: [temporary],
          });
        }
        break;
      case "objectScalling":
        const objectUpdate = this.objectDraws.find(
          (o) => o.id === message["message"]["option"].id
        );
        update_dic(objectUpdate, message["message"]["option"]);

        break;
      case "clearCanvas":
        this.objectDraws.length = 0;
        break;
      case "deleteObjects":
        const objectDeleted = this.objectDraws.filter((object) => {
          return message["message"]["option"].id.indexOf(object.id) !== -1;
        });
        this.objectDraws = this.objectDraws.filter((object) => {
          return message["message"]["option"].id.indexOf(object.id) === -1;
        });
        this.temporaryAction.push({
          event: "deleteObject",
          object: [...objectDeleted],
        });
        break;
      case "changeAttribute":
        const objectChangeAttribute = this.objectDraws.filter((object) => {
          return message["message"]["option"].id.indexOf(object.id) !== -1;
        });
        objectChangeAttribute.forEach((o: any) => {
          update_dic(o, message["message"]["option"]);
        });
        this.temporaryAction.push({
          event: "changeAttributeObject",
          object: [...objectChangeAttribute],
        });
        break;
      case "textChange":
        const objectChangingText = this.objectDraws.find(
          (o) => o.id === message["message"]["option"].id
        );
        update_dic(objectChangingText, message["message"]["option"]);
        break;
      // case "unDo":
      //   if (this.temporaryAction.length > 0) {
      //     const objectUndo = this.temporaryAction.pop();
      //     this.temporaryObjects.push(objectUndo);
      //     switch (objectUndo["event"]) {
      //       case "addObject":
      //         this.objectDraws = this.objectDraws.filter((object) => {
      //           objectUndo["object"].forEach((o: any) => {
      //             return o.id !== object.id;
      //           });
      //         });
      //         break;
      //       case "deleteObject":
      //         this.objectDraws.push(...objectUndo["object"]);
      //         break;
      //       case "changeAttributeObject":
      //         break;
      //     }
      //     this.connections.forEach((client) => {
      //       client.send(
      //         JSON.stringify({
      //           event: "actionUndo",
      //           message: objectUndo,
      //         })
      //       );
      //     });
      //   }
      //   break;
      // case "reDo":
      //   if (this.temporaryObjects.length > 0) {
      //     const objectRedo = this.temporaryObjects.pop();
      //     this.temporaryAction.push(objectRedo);
      //     switch (objectRedo["event"]) {
      //       case "addObject":
      //         this.objectDraws.push(...objectRedo["object"]);
      //         break;
      //       case "deleteObject":
      //         this.objectDraws = this.objectDraws.filter((object) => {
      //           objectRedo["object"].forEach((o: any) => {
      //             return o.id !== object.id;
      //           });
      //         });
      //         break;
      //       case "changeAttributeObject":
      //         break;
      //     }
      //     this.connections.forEach((client) => {
      //       client.send(
      //         JSON.stringify({
      //           event: "actionRedo",
      //           message: objectRedo,
      //         })
      //       );
      //     });
      //   }
      //   break;
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
  let room: Room = list_room.find((r) => r.roomId === request.url);
  if (!room) {
    room = new Room(request.url);
    list_room.push(room);
  }
  console.log(ws.readyState);
  // If room existed add another connection
  room.addConnection(ws);
  // send message to client when first connect
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        event: "connect",
        message: room.objectDraws,
      })
    );
  }
  ws.on("message", (message: Buffer) => {
    const msg = JSON.parse(message.toString("utf-8"));
    // handle message
    console.log(room);
    room.handleMessage(msg);
    // send message to client.
    room.boardcastException(msg, ws);
    // console.log("room", room);
  });
  ws.on("close", () => {
    room.handleDeleteConnection(ws);
    room.temporaryObjects = [];
    room.temporaryAction = [];
    console.log("Client has disconnected.");
  });
});
