import { messageHandleDraw } from "../../Type/TypeMessage";
import { v4 as uuidv4 } from "uuid";
import {
  getAbsLeft,
  getAbsTop,
} from "../../components/HandleDraw/GetAbsCordinate";
declare var window: any;

const initialObject = (listObject: Array<any>, canvas: any) => {
  let objectInit: any;
  listObject.forEach((o: any) => {
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
  });
};

const handleDraw = (
  message: messageHandleDraw,
  canvas: any,
  socket: WebSocket,
  setObjectCopy: React.Dispatch<any>,
  objectCopy: any
) => {
  const objectInCanvas = canvas.getObjects();
  switch (message.event) {
    case "connect":
      initialObject(message["message"], canvas);
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
            strokeWidth: 1,
            fontSize: parseInt(message["message"]["option"].strokeWidth) * 10,
            fill: "black",
          });
          break;
      }
      if (objectDrawing) {
        canvas.add(objectDrawing);
      }
      break;
    case "textChange":
      const textChanging = objectInCanvas.find((object: any) => {
        return message["message"]["option"].id.indexOf(object.id) !== -1;
      });
      textChanging.set({
        text: message["message"]["option"].text,
      });
      break;
    case "setCoordinateObject":
      const objectDraw = objectInCanvas.find((object: any) => {
        return object.id === message["message"]["option"].id;
      });
      if (objectDraw) {
        switch (message["message"]["option"].type) {
          case "line":
            objectDraw.set({
              x2: message["message"]["pointerNew"].x,
              y2: message["message"]["pointerNew"].y,
            });
            break;
          case "rectag":
            if (
              message["message"]["pointerOrigin"].x >
              message["message"]["pointerNew"].x
            ) {
              objectDraw.set({
                left: Math.abs(message["message"]["pointerNew"].x),
              });
            }
            if (
              message["message"]["pointerOrigin"].y >
              message["message"]["pointerNew"].y
            ) {
              objectDraw.set({
                top: Math.abs(message["message"]["pointerNew"].y),
              });
            }
            objectDraw.set({
              width: Math.abs(
                message["message"]["pointerOrigin"].x -
                  message["message"]["pointerNew"].x
              ),
            });
            objectDraw.set({
              height: Math.abs(
                message["message"]["pointerOrigin"].y -
                  message["message"]["pointerNew"].y
              ),
            });
            break;
          case "cycle":
            if (
              message["message"]["pointerOrigin"].x >
              message["message"]["pointerNew"].x
            ) {
              objectDraw.set({
                left: Math.abs(message["message"]["pointerNew"].x),
              });
            }
            if (
              message["message"]["pointerOrigin"].y >
              message["message"]["pointerNew"].y
            ) {
              objectDraw.set({
                top: Math.abs(message["message"]["pointerNew"].y),
              });
            }
            objectDraw.set({
              rx:
                Math.abs(
                  message["message"]["pointerOrigin"].x -
                    message["message"]["pointerNew"].x
                ) / 2,
            });
            objectDraw.set({
              ry:
                Math.abs(
                  message["message"]["pointerOrigin"].y -
                    message["message"]["pointerNew"].y
                ) / 2,
            });
            break;
          case "pencil":
            const dim = objectDraw._calcDimensions();
            objectDraw.points.push(
              new window.fabric.Point(
                message["message"]["pointerNew"].x,
                message["message"]["pointerNew"].y
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
        if (object.type === "text") {
          object.set({
            stroke: message["message"]["option"].stroke,
            fontSize: parseInt(message["message"]["option"].strokeWidth) * 10,
            strokeWidth: 1,
          });
        } else {
          object.set({
            stroke: message["message"]["option"].stroke,
            strokeWidth: parseInt(message["message"]["option"].strokeWidth),
          });
        }
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
    case "actionUndo":
      switch (message["message"]["event"]) {
        case "addObject":
          const objectAdded = objectInCanvas.filter((object: any) => {
            return message["message"]["object"].find((o: any) => {
              return o.id === object.id;
            });
          });
          canvas.remove(...objectAdded);
          break;
        case "deleteObject":
          initialObject(message["message"]["object"], canvas);
          break;
        case "changeAttributeObject":
          console.log(message)
          break;
      }
      break;
    case "actionRedo":
      switch (message["message"]["event"]) {
        case "addObject":
          initialObject(message["message"]["object"], canvas);
          break;
        case "deleteObject":
          const objectDeleted = objectInCanvas.filter((object: any) => {
            return message["message"]["object"].find((o: any) => {
              return o.id === object.id;
            });
          });
          canvas.remove(...objectDeleted);
          break;
      }
      break;
    case "clearCanvas":
      canvas.clear();
      break;
  }

  canvas.renderAll();
};

export { handleDraw };
