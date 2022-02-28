import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import StyleColor from "../components/Tool/StyleColor";
import ToolBoard from "../components/Tool/ToolBoard";

import { ReactComponent as Delete } from "../icon/delete.svg";

import { v4 as uuidv4 } from "uuid";

import {
  getAbsLeft,
  getAbsTop,
  getAbsScaleX,
  getAbsScaleY,
} from "../components/HandleDraw/GetAbsCordinate";

declare var window: any;

type event = React.ChangeEvent<HTMLInputElement>;
type messageCreateObject = {
  pointer: { x: number; y: number };
  option: {
    id: string;
    stroke: string;
    strokeWidth: number;
    fill: "";
    type?: string;
    perPixelTargetFind: boolean;
    left?: number;
    top?: number;
    width?: number;
    height?: number;
  };
};
type messageHandleDraw = {
  event: string;
  message?: any;
};
function Board() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [option, setOption] = useState({
    pen: "mouse",
    isDrawing: false,
    color: "black",
    strokeWidth: 4,
  });
  const [displayColorTabel, setDisplayColorTable] = useState(false);
  const [canvas, setCanvas] = useState<any>(null);
  const [size, setSize] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });
  const [objectDraw, setObjectDraw] = useState<any>(null);
  const [coordinate, setCoordinate] = useState<any>(null);
  const [objectCopy, setObjectCopy] = useState<any>(null);
  const { id } = useParams();
  useEffect(() => {
    const canvasElement = new window.fabric.Canvas("board");
    setCanvas(canvasElement);
    // const onSocket = new WebSocket(
    //   `wss://draw-realtime-socket.herokuapp.com/${id}`
    // );
    const onSocket = new WebSocket(`ws://localhost:8000/${id}`);
    setSocket(onSocket);
  }, [id]);

  useEffect(() => {
    if (socket !== null) {
      setSize({
        ...size,
        height: window.innerHeight,
        width: window.innerWidth,
      });
      socket.onopen = () => {
        console.log("WebSocket open");
      };
      socket.onmessage = (e) => {
        let dataFromServer = JSON.parse(e.data);
        handleDraw(dataFromServer);
      };
    }
  }, [canvas, objectDraw, coordinate]);
  const handleDisplayColorTable = () => {
    setDisplayColorTable(true);
  };
  const createObject = (event: event) => {
    let pointer = canvas.getPointer(event);
    let message: messageCreateObject = {
      pointer: pointer,
      option: {
        id: uuidv4(),
        left: pointer.x,
        top: pointer.y,
        width: pointer.x - pointer.x,
        height: pointer.y - pointer.y,
        stroke: option.color,
        strokeWidth: option.strokeWidth,
        fill: "",
        type: option.pen,
        perPixelTargetFind: true,
      },
    };
    return message;
  };
  const handleDraw = (message: messageHandleDraw) => {
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
            objectDrawing = new window.fabric.Rect(
              message["message"]["option"]
            );
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
        }
        if (objectDrawing) {
          setObjectDraw(objectDrawing);
          setCoordinate(message["message"]["pointer"]);
          canvas.add(objectDrawing);
        }
        break;
      case "setCoordinateObject":
        if (objectDraw) {
          switch (message["message"].type) {
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
                height: Math.abs(
                  coordinate.y - message["message"]["pointer"].y
                ),
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
                rx:
                  Math.abs(coordinate.x - message["message"]["pointer"].x) / 2,
              });
              objectDraw.set({
                ry:
                  Math.abs(coordinate.y - message["message"]["pointer"].y) / 2,
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
          return message["message"].id.indexOf(object.id) !== -1;
        });
        canvas.discardActiveObject();
        canvas.remove(...objectDelete);
        break;
      case "changeAttribute":
        const objectChange = objectInCanvas.filter((object: any) => {
          return message["message"].id.indexOf(object.id) !== -1;
        });
        objectChange.forEach((object: any) => {
          object.set({
            stroke: message["message"].stroke,
            strokeWidth: parseInt(message["message"].strokeWidth),
          });
          object.setCoords();
        });
        break;
      case "copyObjects":
        const selectedObjectsCopy = objectInCanvas.filter(
          (object: any) => object.id === message["message"].id
        );
        setObjectCopy(selectedObjectsCopy[0]);
        break;
      case "pasteObjects":
        if (objectCopy !== null) {
          objectCopy.clone((cloneObject: any) => {
            cloneObject.set({
              id: uuidv4(),
              left: cloneObject.left + 20,
              top: cloneObject.top + 20,
            });
            canvas.add(cloneObject);
          });
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
  const handleMouseDown = (e: event) => {
    const object = createObject(e);
    switch (option.pen) {
      case "mouse":
        setDisplayColorTable(false);
        setObjectDraw(null);
        break;
      default:
        let message = {
          event: "createObject",
          message: object,
        };
        if (socket) {
          socket.send(JSON.stringify(message));
          handleDraw(message);
          setOption({ ...option, isDrawing: true });
          canvas.set({
            selection: false,
          });
        }
        break;
    }
  };
  const handleMouseMove = (e: event) => {
    const objectActives = canvas.getActiveObjects();
    if (objectActives.length > 0) {
      return;
    }
    const pointer = canvas.getPointer(e);
    let message = {
      event: "setCoordinateObject",
      message: {
        pointer: pointer,
        type: option.pen,
      },
    };
    if (socket && option.isDrawing) {
      handleDraw(message);
      socket.send(JSON.stringify(message));
    }
  };
  const handleMouseUp = (e: event) => {
    if (objectDraw && socket) {
      socket.send(
        JSON.stringify({
          event: "addObjectIntoDb",
          message: {
            object: objectDraw,
            id: objectDraw.id,
          },
        })
      );
    }
    canvas.isDrawingMode = false;
    setOption({ ...option, isDrawing: false, pen: "mouse" });
    canvas.set({
      selection: true,
    });
  };
  const handleScalling = (e: event) => {
    const objectSelected = canvas.getActiveObjects();
    objectSelected.forEach((object: any) => {
      object.set({
        perPixelTargetFind: true,
      });
      let message = {
        event: "objectScalling",
        message: {
          id: object.id,
          top: getAbsTop(object),
          left: getAbsLeft(object),
          height: object.height,
          width: object.width,
          scaleX: getAbsScaleX(object),
          scaleY: getAbsScaleY(object),
          angle: object.angle,
        },
      };
      if (socket) {
        socket.send(JSON.stringify(message));
      }
    });
  };
  const handleChangeAttribute = (e: any) => {
    const objectChanged = canvas.getActiveObjects();
    let strokeWidth: string;
    let stroke: string;
    switch (e.name) {
      case "strokeWidth":
        setOption({ ...option, strokeWidth: parseInt(e.value) });
        strokeWidth = e.value;
        break;
      case "stroke":
        setOption({ ...option, color: e.value });
        stroke = e.value;
    }
    objectChanged.forEach((object: any) => {
      let message = {
        event: "changeAttribute",
        message: {
          id: object.id,
          strokeWidth: !parseInt(strokeWidth)
            ? option.strokeWidth
            : parseInt(strokeWidth),
          stroke: !stroke ? option.color : stroke,
        },
      };
      if (socket) {
        handleDraw(message);
        socket.send(JSON.stringify(message));
      }
    });
  };
  const handleClear = () => {
    let message = { event: "clearCanvas" };
    if (socket) {
      handleDraw(message);
      socket.send(JSON.stringify(message));
    }
  };
  const hanleCoppyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };
  const handleKeyDown = (e: KeyboardEvent) => {
    let message: {
      event: string;
      message: {
        id: [string];
      };
    };
    let eventType: any;
    const objectsSelected = canvas.getActiveObjects();
    const id = !objectsSelected
      ? null
      : objectsSelected.map((object: any) => {
          return object.id;
        });
    switch (e.keyCode) {
      case 8: // Backspace
        eventType = "deleteObjects";
        break;
      case 49:
        setOption({ ...option, pen: "mouse" });
        break;
      case 50:
        setOption({ ...option, pen: "pencil" });
        break;
      case 51:
        setOption({ ...option, pen: "rectag" });
        break;
      case 52:
        setOption({ ...option, pen: "cycle" });
        break;
      case 53:
        setOption({ ...option, pen: "line" });
        break;
      case 54:
        setOption({ ...option, pen: "eraser" });
        break;
      
    }
    message = {
      event: eventType,
      message: {
        id: id,
      },
    };
    if (socket) {
      handleDraw(message);
      socket.send(JSON.stringify(message));
    }
  };
  const handleSelected = () => {
    const objectsSelecteds = canvas.getActiveObjects();
    objectsSelecteds.forEach((object: any) => {
      object.set({
        perPixelTargetFind: false,
      });
    });
  };
  const handleZoom = (event: any) => {
    let delta = event.deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.setZoom(zoom);
    event.e.preventDefault();
    event.e.stopPropagation();
  };
  useEffect(() => {
    if (canvas !== null) {
      document.addEventListener("keydown", handleKeyDown);
      canvas.on("mouse:down", handleMouseDown);
      canvas.on("mouse:move", handleMouseMove);
      canvas.on("mouse:up", handleMouseUp);
      canvas.on("object:scaling", handleScalling);
      canvas.on("object:rotating", handleScalling);
      canvas.on("object:moving", handleScalling);
      canvas.on("selection:created", handleSelected);
      canvas.on("mouse:wheel", handleZoom);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        canvas.off("mouse:down", handleMouseDown);
        canvas.off("mouse:move", handleMouseMove);
        canvas.off("mouse:up", handleMouseUp);
        canvas.off("object:scaling", handleScalling);
        canvas.off("object:rotating", handleScalling);
        canvas.off("object:moving", handleScalling);
        canvas.off("selection:created", handleSelected);
        canvas.off("mouse:wheel", handleZoom);
      };
    }
  }, [canvas, handleMouseDown]);
  return (
    <>
      <canvas id="board" width={size.width} height={size.height}></canvas>
      <div
        onClick={hanleCoppyLink}
        className="hover:bg-blue-300 absolute h-24 w-36 border-2 rounded-tr-full rounded-bl-full top-12"
      >
        <div className="text-ellipsis overflow-hidden w-16 relative top-8 left-10 whitespace-nowrap">
          Room {id}
        </div>
      </div>
      <div className="fixed right-0 top-0">
        <StyleColor
          setAttribute={handleChangeAttribute}
          color={option.color}
          strokeWidth={option.strokeWidth}
          displayColorTabel={displayColorTabel}
          handleDisplayColorTable={handleDisplayColorTable}
        />
      </div>
      <div className="fixed flex justify-center bottom-3 w-full">
        <ToolBoard
          setPen={(valueOption: string) => {
            setOption({ ...option, pen: valueOption });
          }}
          type={option.pen}
        />
        <button
          className="transform hover:bg-#e5e7eb rounded-xl  relative m-0 p-3 flex align-middle justify-center border-2 border-white transition duration-300 hover:scale-125"
          onClick={handleClear}
        >
          <Delete />
        </button>
      </div>
    </>
  );
}

export default Board;
