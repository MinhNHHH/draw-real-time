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
  setObjectCopy: React.Dispatch<any>,
  objectCopy: any,
  listObject: Array<any>,
  setListObject: React.Dispatch<any>,
  tempObjectsInCanvas: Array<any>,
  setTempObjectsInCanvas: React.Dispatch<any>
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
      let objectDeleted = {
        event: "deleteObject",
        object: [...objectDelete],
      };
      setTempObjectsInCanvas([...tempObjectsInCanvas, objectDeleted]);
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
      // let objectChanged = {
      //   event: "changeAttribute",
      //   object: [...objectChange],
      // };
      // setTempObjectsInCanvas([...tempObjectsInCanvas, objectChanged]);
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
    case "unDo":
      if (tempObjectsInCanvas.length > 0) {
        const objectUndo = tempObjectsInCanvas.pop();
        switch (objectUndo.event) {
          case "addObject":
            setListObject([...listObject, objectUndo]);
            canvas.remove(...objectUndo.object);
            break;
          case "deleteObject":
            setListObject([...listObject, objectUndo]);
            canvas.add(...objectUndo.object);
            break;
          case "changeAttribute":
            setListObject([...listObject, objectUndo]);
            const objectOrigin = tempObjectsInCanvas.filter((objectTemp : any) => {
              return objectUndo.object.find((oUndo : any) => {
                return objectTemp.object.find((o : any) => {
                  return o.id === oUndo.id
                })
              })
            })
            canvas.remove(...objectUndo.object);
            canvas.add(...objectOrigin[0].object)
            break;
        }
      }
      break;
    case "reDo":
      if (listObject.length > 0) {
        const objectRedo = listObject.pop();
        switch (objectRedo.event) {
          case "addObject":
            setTempObjectsInCanvas([...tempObjectsInCanvas, objectRedo]);
            canvas.add(...objectRedo.object);
            break;
          case "deleteObject":
            setTempObjectsInCanvas([...tempObjectsInCanvas, objectRedo]);
            canvas.remove(...objectRedo.object);
            break;
        }
      }
      break;
    case "addObjectIntoDb":
      const objectAdded = objectInCanvas.filter((object: any) => {
        return object.id === message["message"].id;
      });
      if (!tempObjectsInCanvas.find((o: any) => o.id === objectAdded[0].id)) {
        let object = {
          event: "addObject",
          object: [...objectAdded],
        };
        console.log('zzzzz')
        setTempObjectsInCanvas([...tempObjectsInCanvas, object]);
      }
      break;
    case "clearCanvas":
      canvas.clear();
      break;
  }
  console.log("canvas",objectInCanvas)
  console.log("listObject",listObject)
  console.log("tempObjectsInCanvas",tempObjectsInCanvas)
  canvas.renderAll();
};

export { handleDraw };
