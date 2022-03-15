import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import StyleColor from "../components/Tool/StyleColor";
import ToolBoard from "../components/Tool/ToolBoard";
import Loading from "./Loading";
import { ReactComponent as Delete } from "../icon/delete.svg";

import {
  getAbsLeft,
  getAbsTop,
  getAbsScaleX,
  getAbsScaleY,
} from "../components/HandleDraw/GetAbsCordinate";
import { handleDraw } from "../components/HandleDraw/HanleDraw";

import { messageCreateObject } from "../Type/TypeMessage";
import {
  eventMouse,
  eventWheel,
  eventKeyBoard,
  eventInput,
} from "../Type/TypeEvent";

declare var window: any;

function Board() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [option, setOption] = useState({
    pen: "mouse",
    isDrawing: false,
    color: "black",
    strokeWidth: 4,
    isDrangging: false,
    textEditing: false,
    displayColorTabel: false,
  });
  const [canvas, setCanvas] = useState<any>(null);
  const [coordinate, setCoordinates] = useState<any>(null);
  const [objectCopy, setObjectCopys] = useState<any>(null);
  const [idObject, setIdObject] = useState<string | null>(null);
  const { id } = useParams();
  const [connect, setConnect] = useState(false);
  useEffect(() => {
    const onSocket = new WebSocket(
      `wss://draw-realtime-socket.herokuapp.com/${id}`
    );
    setSocket(onSocket);
    onSocket.onopen = () => {
      console.log("WebSocket open");
    };
    const canvasElement = new window.fabric.Canvas("board");
    setCanvas(canvasElement);
  }, []);

  useEffect(() => {
    if (socket !== null) {
      socket.onmessage = (e) => {
        let dataFromServer = JSON.parse(e.data);
        handleDraw(dataFromServer, canvas, socket, setObjectCopys, objectCopy);
        setConnect(true);
      };
    }
  }, [canvas, objectCopy]);

  const handleDisplayColorTable = () => {
    setOption({ ...option, displayColorTabel: true });
  };
  // Create object draw ("rectangle, cycle, line ,...")
  const createObject = (event: eventMouse) => {
    let pointer = canvas.getPointer(event);
    let message: messageCreateObject = {
      pointer: pointer,
      option: {
        id: uuidv4(),
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        stroke: option.color,
        strokeWidth: option.strokeWidth,
        fill: "",
        type: option.pen,
        perPixelTargetFind: true,
      },
    };
    return message;
  };

  // HandleMouseDown event
  const handleMouseDown = (e: eventMouse) => {
    const object = createObject(e);
    switch (option.pen) {
      case "mouse":
        setOption({ ...option, displayColorTabel: false });
        // Use Pan
        if (e.e.altKey === true) {
          setOption({ ...option, isDrangging: true });
          canvas.set({
            selection: false,
          });
          setCoordinates(canvas.getPointer(e));
          return
        }
        // disable keydown
        setOption({ ...option, textEditing: true });
        break;
      default:
        let message = {
          event: "createObject",
          message: object,
        };
        setIdObject(object["option"].id);
        setCoordinates(object['pointer'])
        if (socket) {
          socket.send(JSON.stringify(message));
          handleDraw(message, canvas, socket, setObjectCopys, objectCopy);
          setOption({ ...option, isDrawing: true });
          canvas.set({
            selection: false,
          });
        }
        break;
    }
  };
  const handleMouseMove = (e: eventMouse) => {
    const objectActives = canvas.getActiveObjects();
    if (objectActives.length > 0) {
      return;
    }
    const pointer = canvas.getPointer(e);
    // Set coordinate for viewportTransforms. (Pan)
    if (option.isDrangging) {
      const vpt = canvas.viewportTransform;
      vpt[4] += pointer.x - coordinate.x;
      vpt[5] += pointer.y - coordinate.y;
      canvas.renderAll();
    }
    let message = {
      event: "setCoordinateObject",
      message: {
        pointerNew: pointer,
        pointerOrigin: coordinate,
        option: {
          type: option.pen,
          id: idObject,
        },
      },
    };
    if (socket && option.isDrawing) {
      handleDraw(message, canvas, socket, setObjectCopys, objectCopy);
      socket.send(JSON.stringify(message));
    }
  };
  const handleMouseUp = (e: eventMouse) => {
    // Add object into db on server
    const objectInCanvas = canvas.getObjects();
    const objectAddDb = objectInCanvas.find((object: any) => {
      return idObject === object.id;
    });
    if (objectAddDb && socket) {
      if (objectAddDb && socket) {
        socket.send(
          JSON.stringify({
            event: "addObjectIntoDb",
            message: {
              object: objectAddDb,
              id: objectAddDb.id,
            },
          })
        );
      }
      // Set textEditing when create object text.
      if (objectAddDb.type === "text") {
        canvas.setActiveObject(objectAddDb);
        objectAddDb.enterEditing();
      }
      setIdObject(null);
      setCoordinates(null)
    }
    // Set value to default
    setCoordinates(canvas.getPointer(e));
    canvas.setViewportTransform(canvas.viewportTransform);
    setOption({
      ...option,
      isDrawing: false,
      pen: "mouse",
      isDrangging: false,
      textEditing: false,
    });
    canvas.set({ selection: true });
  };
  // Scalling event.
  const handleScalling = () => {
    const objectSelected = canvas.getActiveObjects();
    objectSelected.forEach((object: any) => {
      object.set({
        perPixelTargetFind: true,
      });
      let message = {
        event: "objectScalling",
        message: {
          option: {
            id: object.id,
            top: getAbsTop(object),
            left: getAbsLeft(object),
            height: object.height,
            width: object.width,
            scaleX: getAbsScaleX(object),
            scaleY: getAbsScaleY(object),
            angle: object.angle,
          },
        },
      };
      if (socket) {
        socket.send(JSON.stringify(message));
      }
    });
  };
  // Change color and strokeWidth
  const handleChangeAttribute = (e: eventInput) => {
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
          option: {
            id: object.id,
            strokeWidth: !parseInt(strokeWidth)
              ? option.strokeWidth
              : parseInt(strokeWidth),
            stroke: !stroke ? option.color : stroke,
          },
        },
      };
      if (socket) {
        handleDraw(message, canvas, socket, setObjectCopys, objectCopy);
        socket.send(JSON.stringify(message));
      }
    });
  };

  const handleClear = () => {
    let message = { event: "clearCanvas" };
    if (socket) {
      handleDraw(message, canvas, socket, setObjectCopys, objectCopy);
      socket.send(JSON.stringify(message));
    }
  };

  const hanleCoppyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleKeyDown = (e: eventKeyBoard) => {
    let eventType;
    const objectsSelected = canvas.getActiveObjects();
    const id = !objectsSelected
      ? null
      : objectsSelected.map((object: any) => {
          return object.id;
        });
    // When Text object active disable keydown.
    if (!option.textEditing) {
      switch (e.keyCode) {
        case 8: // Backspace
          eventType = "deleteObjects";
          break;
        case 49: // 1
          setOption({ ...option, pen: "mouse" });
          break;
        case 50: // 2
          setOption({ ...option, pen: "pencil" });
          break;
        case 51: // 3
          setOption({ ...option, pen: "rectag" });
          break;
        case 52: // 4
          setOption({ ...option, pen: "cycle" });
          break;
        case 53: // 5
          setOption({ ...option, pen: "line" });
          break;
        case 54: // 6
          setOption({ ...option, pen: "eraser" });
          break;
        case 55: // 6
          setOption({ ...option, pen: "text" });
          break;
      }
      if ((e.ctrlKey || e.metaKey) && id !== null) {
        switch (e.keyCode) {
          case 86: // V
            eventType = "pasteObjects";
            break;
          case 67: // C
            eventType = "copyObjects";
            break;
        }
      }
    }
    let message = {
      event: eventType as string,
      message: {
        option: {
          id: id,
        },
      },
    };
    if (socket) {
      handleDraw(message, canvas, socket, setObjectCopys, objectCopy);
      socket.send(JSON.stringify(message));
    }
  };
  // Disable selected when create objects.
  const handleSelected = () => {
    const objectsSelecteds = canvas.getActiveObjects();
    objectsSelecteds.forEach((object: any) => {
      object.set({
        perPixelTargetFind: false,
      });
    });
  };

  const handleZoom = (event: eventWheel) => {
    let delta = event.e.deltaY;
    let zoom = canvas.getZoom(1);
    zoom *= 0.999 ** delta;
    // check zoom (10X , 0.5X)
    if (zoom > 10) zoom = 10;
    if (zoom < 0.5) zoom = 0.5;
    canvas.zoomToPoint({ x: event.e.offsetX, y: event.e.offsetY }, zoom);
    event.e.preventDefault();
    event.e.stopPropagation();
  };
  const handleReSize = () => {
    // Resize canvas.
    if (canvas.width != window.innerWidth) {
      let scaleMultiplier = window.innerWidth / canvas.width;

      const objects = canvas.getObjects();
      objects.forEach((object: any) => {
        object.scaleX = object.scaleX * scaleMultiplier;
        object.scaleY = object.scaleY * scaleMultiplier;
        object.left = object.left * scaleMultiplier;
        object.top = object.top * scaleMultiplier;
      });
      canvas.setWidth(canvas.getWidth() * scaleMultiplier);
      canvas.setHeight(canvas.getHeight() * scaleMultiplier);
      canvas.renderAll();
      canvas.calcOffset();
    }
  };
  const handleTextEdit = (e: any) => {
    setOption({ ...option, textEditing: true });
    const textChanging = canvas.getActiveObject();
    let message = {
      event: "textChange",
      message: {
        option: {
          id: textChanging.id,
          text: e.target.text,
        },
      },
    };
    if (socket) {
      socket.send(JSON.stringify(message));
    }
  };
  useEffect(() => {
    if (canvas !== null) {
      window.addEventListener("resize", handleReSize);
      document.addEventListener("keydown", handleKeyDown);
      canvas.on("mouse:down", handleMouseDown);
      canvas.on("mouse:move", handleMouseMove);
      canvas.on("mouse:up", handleMouseUp);
      canvas.on("object:scaling", handleScalling);
      canvas.on("object:rotating", handleScalling);
      canvas.on("object:moving", handleScalling);
      canvas.on("selection:created", handleSelected);
      canvas.on("mouse:wheel", handleZoom);
      canvas.on("text:changed", handleTextEdit);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("resize", handleReSize);
        canvas.off("mouse:down", handleMouseDown);
        canvas.off("mouse:move", handleMouseMove);
        canvas.off("mouse:up", handleMouseUp);
        canvas.off("object:scaling", handleScalling);
        canvas.off("object:rotating", handleScalling);
        canvas.off("object:moving", handleScalling);
        canvas.off("selection:created", handleSelected);
        canvas.off("mouse:wheel", handleZoom);
        canvas.off("text:changed", handleTextEdit);
      };
    }
  }, [canvas, handleMouseDown, handleKeyDown]);
  return (
    <>
      {connect === false && <Loading />}
      <canvas
        id="board"
        width={window.innerWidth}
        height={window.innerHeight}
      ></canvas>
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
          displayColorTabel={option.displayColorTabel}
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
