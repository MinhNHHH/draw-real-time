import { messageHandleDraw } from "../../Type/TypeMessage";
import { v4 as uuidv4 } from "uuid";
import {
  getAbsLeft,
  getAbsTop,
} from "../../components/HandleDraw/GetAbsCordinate";
declare var window: any;

const handleDraw = (
  message: messageHandleDraw,
  canvas: any,
  socket: WebSocket,
  setObjectDraw: React.Dispatch<any>,
  setCoordinate: React.Dispatch<any>,
  setObjectCopy: React.Dispatch<any>,
  objectDraw: any,
  coordinate: any,
  objectCopy: any
) => {
  const objectInCanvas = canvas.getObjects();
  switch (message.event) {
    case "connect":
      let objectInit: any;
      message["message"].forEach((o: any) => {
        switch (o.type) {
          case "line":
            objectInit = new window.fabric.Line([o.x1, o.y1, o.x2, o.y2], {
              ...o,
              perPixelTargetFind: true,
            });
            break;
          case "cycle":
            objectInit = new window.fabric.Ellipse({
              ...o,
              perPixelTargetFind: true,
            });
            break;
          case "rectag":
            objectInit = new window.fabric.Rect({
              ...o,
              perPixelTargetFind: true,
            });
            break;
          case "pencil":
            objectInit = new window.fabric.Polyline(o.points, {
              ...o,
              perPixelTargetFind: true,
            });
            break;
          case "text":
            objectInit = new window.fabric.IText(o.text, {
              ...o,
              perPixelTargetFind: true,
            });
            break;
        }
        canvas.add(objectInit);
        objectInit.setCoords();
      });
      break;
    case "createObject":
      let objectDrawing;
      switch (message["message"]["option"].type) {
        case "line":
          objectDrawing = new window.fabric.Line(
            [
              message["message"]["pointer"].x,
              message["message"]["pointer"].y,
              message["message"]["pointer"].x,
              message["message"]["pointer"].y,
            ],
            message["message"]["option"]
          );
          break;
        case "rectag":
          objectDrawing = new window.fabric.Rect(message["message"]["option"]);
          break;
        case "cycle":
          objectDrawing = new window.fabric.Ellipse(
            message["message"]["option"]
          );
          break;
        case "pencil":
          objectDrawing = new window.fabric.Polyline(
            [
              {
                x: message["message"]["pointer"].x,
                y: message["message"]["pointer"].y,
              },
            ],
            { ...message["message"]["option"], fill: "transparent" }
          );
          break;
        case "text":
          objectDrawing = new window.fabric.IText("", {
            ...message["message"]["option"],
            fontWeight: "normal",
            fontSize: 32,
          });
      }
      if (objectDrawing) {
        setObjectDraw(objectDrawing);
        setCoordinate(message["message"]["pointer"]);
        if (objectDrawing.type === "text") {
          canvas.add(objectDrawing).setActiveObject(objectDrawing);
        }
        canvas.add(objectDrawing);
      }
      break;
    case "textChange":
      if (objectDraw) {
        const textChanging = objectInCanvas.filter((object: any) => {
          return message["message"]["option"].id.indexOf(object.id) !== -1;
        });
        textChanging.forEach((o: any) => {
          o.set({
            text: message["message"]["option"].text,
          });
        });
        canvas.discardActiveObject();
      }
      break;
    case "setCoordinateObject":
      if (objectDraw) {
        switch (message["message"]["option"].type) {
          case "line":
            objectDraw.set({
              x2: message["message"]["pointer"].x,
              y2: message["message"]["pointer"].y,
            });
            break;
          case "rectag":
            if (coordinate.x > message["message"]["pointer"].x) {
              objectDraw.set({
                left: Math.abs(message["message"]["pointer"].x),
              });
            }
            if (coordinate.y > message["message"]["pointer"].y) {
              objectDraw.set({
                top: Math.abs(message["message"]["pointer"].y),
              });
            }
            objectDraw.set({
              width: Math.abs(coordinate.x - message["message"]["pointer"].x),
            });
            objectDraw.set({
              height: Math.abs(coordinate.y - message["message"]["pointer"].y),
            });
            break;
          case "cycle":
            if (coordinate.x > message["message"]["pointer"].x) {
              objectDraw.set({
                left: Math.abs(message["message"]["pointer"].x),
              });
            }
            if (coordinate.y > message["message"]["pointer"].y) {
              objectDraw.set({
                top: Math.abs(message["message"]["pointer"].y),
              });
            }
            objectDraw.set({
              rx: Math.abs(coordinate.x - message["message"]["pointer"].x) / 2,
            });
            objectDraw.set({
              ry: Math.abs(coordinate.y - message["message"]["pointer"].y) / 2,
            });
            break;
          case "pencil":
            const dim = objectDraw._calcDimensions();
            objectDraw.points.push(
              new window.fabric.Point(
                message["message"]["pointer"].x,
                message["message"]["pointer"].y
              )
            );
            objectDraw.set({
              left: dim.left,
              top: dim.top,
              width: dim.width,
              height: dim.height,
              dirty: true,
              pathOffset: new window.fabric.Point(
                dim.left + dim.width / 2,
                dim.top + dim.height / 2
              ),
            });
            break;
        }
      }
      break;
    case "deleteObjects":
      const objectDelete = objectInCanvas.filter((object: any) => {
        return message["message"]["option"].id.indexOf(object.id) !== -1;
      });
      canvas.discardActiveObject();
      canvas.remove(...objectDelete);
      break;
    case "changeAttribute":
      const objectChange = objectInCanvas.filter((object: any) => {
        return message["message"]["option"].id.indexOf(object.id) !== -1;
      });
      objectChange.forEach((object: any) => {
        object.set({
          stroke: message["message"]["option"].stroke,
          strokeWidth: parseInt(message["message"]["option"].strokeWidth),
        });
        object.setCoords();
      });
      break;
    case "objectScalling":
      const selectedObjects = objectInCanvas.filter(
        (object: any) => object.id === message["message"]["option"].id
      );
      selectedObjects.forEach((object: any) => {
        object.set({
          top: message["message"]["option"].top,
          left: message["message"]["option"].left,
          height: message["message"]["option"].height,
          width: message["message"]["option"].width,
          scaleX: message["message"]["option"].scaleX,
          scaleY: message["message"]["option"].scaleY,
          angle: message["message"]["option"].angle,
        });
        canvas.setActiveObject(object);
        object.setCoords();
      });
      break;
    case "copyObjects":
      const selectedObjectsCopy = objectInCanvas.filter((object: any) =>
        message["message"]["option"].id.includes(object.id)
      );
      setObjectCopy(selectedObjectsCopy);
      break;
    case "pasteObjects":
      if (objectCopy !== null && socket !== null) {
        objectCopy.forEach((object: any) => {
          object.clone((cloneObject: any) => {
            cloneObject.set({
              id: uuidv4(),
              left: getAbsLeft(object) + 20,
              top: getAbsTop(object) + 20,
            });
            canvas.add(cloneObject);
            socket.send(
              JSON.stringify({
                event: "addObjectIntoDb",
                message: {
                  object: cloneObject,
                  id: cloneObject.id,
                },
              })
            );
          });
        });
        setObjectCopy(null);
      }
      break;
    case "clearCanvas":
      canvas.clear();
      break;
  }
  if (objectDraw) {
    objectDraw.setCoords();
  }

  canvas.renderAll();
};

export { handleDraw };
