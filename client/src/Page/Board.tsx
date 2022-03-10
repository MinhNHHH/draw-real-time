import { useCallback, useEffect, useMemo, useState } from "react";
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
  });
  const [displayColorTabel, setDisplayColorTable] = useState(false);
  const [canvas, setCanvas] = useState<any>(null);
  const [objectDraw, setObjectDraws] = useState<any>(null);
  const [coordinate, setCoordinates] = useState<any>(null);
  const [objectCopy, setObjectCopys] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const { id } = useParams();
  useEffect(() => {
    const onSocket = new WebSocket(
      `wss://draw-realtime-socket.herokuapp.com/${id}`
    );
    setSocket(onSocket);
  }, []);
  useEffect(() => {
    if (socket) {
      const canvasElement = new window.fabric.Canvas("board");
      setCanvas(canvasElement);
    }
  }, [socket]);
  useEffect(() => {
    if (socket !== null) {
      socket.onopen = () => {
        console.log("WebSocket open");
      };
      socket.onmessage = (e) => {
        let dataFromServer = JSON.parse(e.data);
        console.log(dataFromServer);
        handleDraw(
          dataFromServer,
          canvas,
          socket,
          setObjectDraws,
          setCoordinates,
          setObjectCopys,
          objectDraw,
          coordinate,
          objectCopy
        );
      };
    }
  }, [canvas, objectDraw, coordinate, objectCopy]);
  const handleDisplayColorTable = () => {
    setDisplayColorTable(true);
  };
  const createObject = (event: eventMouse) => {
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

  const handleMouseDown = (e: eventMouse) => {
    const object = createObject(e);
    switch (option.pen) {
      case "mouse":
        setDisplayColorTable(false);
        setObjectDraws(null);
        if (e.e.altKey === true) {
          setOption({ ...option, isDrangging: true });
          canvas.set({
            selection: false,
          });
          setCoordinates(canvas.getPointer(e));
        }
        setEditing(false);
        break;
      default:
        let message = {
          event: "createObject",
          message: object,
        };
        if (socket) {
          socket.send(JSON.stringify(message));
          handleDraw(
            message,
            canvas,
            socket,
            setObjectDraws,
            setCoordinates,
            setObjectCopys,
            objectDraw,
            coordinate,
            objectCopy
          );
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
    if (option.isDrangging) {
      const vpt = canvas.viewportTransform;
      vpt[4] += pointer.x - coordinate.x;
      vpt[5] += pointer.y - coordinate.y;
      canvas.renderAll();
    }
    let message = {
      event: "setCoordinateObject",
      message: {
        pointer: pointer,
        option: {
          type: option.pen,
        },
      },
    };
    if (socket && option.isDrawing) {
      handleDraw(
        message,
        canvas,
        socket,
        setObjectDraws,
        setCoordinates,
        setObjectCopys,
        objectDraw,
        coordinate,
        objectCopy
      );
      socket.send(JSON.stringify(message));
    }
  };
  const handleMouseUp = (e: eventMouse) => {
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
    setCoordinates(canvas.getPointer(e));
    canvas.setViewportTransform(canvas.viewportTransform);
    setOption({
      ...option,
      isDrawing: false,
      pen: "mouse",
      isDrangging: false,
    });
    canvas.set({ selection: true });
  };
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
        handleDraw(
          message,
          canvas,
          socket,
          setObjectDraws,
          setCoordinates,
          setObjectCopys,
          objectDraw,
          coordinate,
          objectCopy
        );
        socket.send(JSON.stringify(message));
      }
    });
  };
  const handleClear = () => {
    let message = { event: "clearCanvas" };
    if (socket) {
      handleDraw(
        message,
        canvas,
        socket,
        setObjectDraws,
        setCoordinates,
        setObjectCopys,
        objectDraw,
        coordinate,
        objectCopy
      );
      socket.send(JSON.stringify(message));
    }
  };
  const hanleCoppyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };
  const handleKeyDown = (e: eventKeyBoard) => {
    let eventType: any;
    const objectsSelected = canvas.getActiveObjects();
    const id = !objectsSelected
      ? null
      : objectsSelected.map((object: any) => {
          return object.id;
        });
    if (!editing) {
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
          eventType = "deleteObjects";
          break;
        case 55: // 6
          setOption({ ...option, pen: "text" });
          break;
      }
      if ((e.ctrlKey || e.metaKey) && id !== null) {
        switch (e.keyCode) {
          case 86:
            eventType = "pasteObjects";
            break;
          case 67:
            eventType = "copyObjects";
            break;
        }
      }
    }
    let message = {
      event: eventType,
      message: {
        option: {
          id: id,
        },
      },
    };
    if (socket) {
      handleDraw(
        message,
        canvas,
        socket,
        setObjectDraws,
        setCoordinates,
        setObjectCopys,
        objectDraw,
        coordinate,
        objectCopy
      );
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
  const handleZoom = (event: eventWheel) => {
    let delta = event.e.deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.zoomToPoint({ x: event.e.offsetX, y: event.e.offsetY }, zoom);
    event.e.preventDefault();
    event.e.stopPropagation();
  };
  const handleReSize = () => {
    if (canvas.width != window.innerWidth) {
      canvas.setWidth(window.innerWidth);
      canvas.setHeight(window.innerHeight);
      canvas.renderAll();
      canvas.calcOffset();
    }
  };

  const objectAdded = (e: any) => {
    console.log(e);
  };
  const handleTextEdit = (e: any) => {
    setEditing(true);
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
        canvas.off("object:added", objectAdded);
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
  }, [canvas, handleMouseDown]);
  return (
    <>
      {socket !== null ? (
        <div>
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
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
}

export default Board;
