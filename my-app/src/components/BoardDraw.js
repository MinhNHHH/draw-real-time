import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux';
import "./BoardDraw.css"
import ToolBoard from './ToolBoard';


function BoardDraw(props) {
    const state = useSelector((state) => state.pen)
    const websocket = props.socket
    const [isDrawing, setIsDrawing] = useState(false);
    const [startCoordinate, setStartCoordinate] = useState({})
    const [lineCoordinate, setLineCoordinate] = useState({})
    const canvas = useRef(null)
    const context = useRef(null)
    const [existLine, setExistLine] = useState([])
    const [existRect, setExistRect] = useState([])
    const [existCyc, setExistCyc] = useState([])
    useEffect(() => {
        // dynamically assign the width and height to canvas
        const canvasEle = canvas.current;
        canvasEle.width = canvasEle.clientWidth;
        canvasEle.height = canvasEle.clientHeight;
        const contextEle = canvasEle.getContext('2d')
        context.current = contextEle
    }, []);
    websocket.current.onmessage = ((e) => {
        let dataFromServer = JSON.parse(e.data)
        dataFromServer = dataFromServer['payload']
        let message = dataFromServer['message']
        let event = dataFromServer['event']
        switch (event) {
            case ("mousemove"):
                if (message.isDrawing) {
                    clearCanvas()
                    if (message.draw === "line") {
                        draw_line(message.startX, message.startY, message.endX, message.endY, message.isDrawing, message.color)
                        draw_rect()
                        draw_cyc()
                    }
                    else if (message.draw === "rectag") {
                        draw_rect(message.startX, message.startY, message.endX, message.endY, message.isDrawing, message.color)
                        draw_cyc()
                        draw_line()
                    }
                    else if (message.draw === "cycle") {
                        draw_cyc(message.startX, message.startY, message.endX, message.endY, message.isDrawing, message.color)
                        draw_line()
                        draw_rect()
                    }
                }
                break
            case ("mouseup"):
                if (message.draw === "line") {
                    setExistLine([...existLine, {
                        startCoordinateX: message.startCoordinateX,
                        startCoordinateY: message.startCoordinateY,
                        lineCoordinateX: message.lineCoordinateX,
                        lineCoordinateY: message.lineCoordinateY,
                        color: message.color
                    }])
                }
                else if (message.draw === "rectag") {
                    setExistRect([...existRect, {
                        startCoordinateX: message.startCoordinateX,
                        startCoordinateY: message.startCoordinateY,
                        lineCoordinateX: message.lineCoordinateX,
                        lineCoordinateY: message.lineCoordinateY,
                        color: message.color
                    }])
                }
                else if (message.draw === "cycle") {
                    setExistCyc([...existCyc, {
                        startCoordinateX: message.startCoordinateX,
                        startCoordinateY: message.startCoordinateY,
                        lineCoordinateX: message.lineCoordinateX,
                        lineCoordinateY: message.lineCoordinateY,
                        color: message.color
                    }])
                }
                draw_line()
                draw_rect()
                draw_cyc()
                break
            case ("clearboard"):
                clearCanvas()
                setExistCyc([])
                setExistLine([])
                setExistRect([])
                break
            default:
                console.log("Error")
        }
    })
    const draw_line = (startX, startY, endX, endY, isDrawing, color) => {
        // Draw exsit line
        for (var i = 0; i < existLine.length; ++i) {
            context.current.beginPath();
            var line = existLine[i];
            context.current.strokeStyle = line.color
            context.current.moveTo(line.startCoordinateX, line.startCoordinateY);
            context.current.lineTo(line.lineCoordinateX, line.lineCoordinateY);
            context.current.stroke();
        }
        if (isDrawing) {
            context.current.strokeStyle = color
            context.current.beginPath()
            context.current.moveTo(startX, startY)
            context.current.lineTo(endX, endY)
            context.current.stroke()
        }
    }
    const draw_rect = (startX, startY, endX, endY, isDrawing, color) => {
        existRect.forEach(element => {
            context.current.beginPath()
            context.current.strokeStyle = element.color
            context.current.rect(element.startCoordinateX, element.startCoordinateY, element.lineCoordinateX - element.startCoordinateX, element.lineCoordinateY - element.startCoordinateY)
            context.current.stroke()
        })
        if (isDrawing) {
            context.current.beginPath()
            context.current.strokeStyle = color
            context.current.rect(startX, startY, endX - startX, endY - startY)
            context.current.stroke()
        }
    }
    const draw_cyc = (startX, startY, endX, endY, isDrawing, color) => {

        existCyc.forEach(element => {
            context.current.beginPath()
            context.current.strokeStyle = element.color
            const R = Math.sqrt(Math.pow((element.startCoordinateX - element.lineCoordinateX), 2) + Math.pow((element.startCoordinateY - element.lineCoordinateY), 2))
            context.current.arc(element.startCoordinateX, element.startCoordinateY, R, 0, 2 * Math.PI)
            context.current.stroke()
        })
        if (isDrawing) {
            context.current.beginPath()
            context.current.strokeStyle = color
            const R = Math.sqrt(Math.pow((startX - endX), 2) + Math.pow((startY - endY), 2))
            context.current.arc(startX, startY, R, 0, 2 * Math.PI);
            context.current.stroke()
        }
    }

    const clearCanvas = () => {
        context.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
    }

    const clearBoard = () => {
        websocket.current.send(JSON.stringify({
            event: "clearboard",
        }))
        context.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
        setExistLine([])
        setExistRect([])
        setExistCyc([])
    }

    const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

    const nearPoint = (x, y, x1, y1, position) => {
        return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? position : null
    }

    const onLine = (x1, y1, x2, y2, x, y, maxDistance = 1) => {
        const A = { x: x1, y: y1 }
        const B = { x: x2, y: y2 }
        const C = { x: x, y: y }
        const offset = distance(A, B) - (distance(A, C) + distance(B, C));
        return Math.abs(offset) < maxDistance ? "inside" : null;
    }

    const positionWithinElement = (x, y, element) => {
        const { startCoordinateX, lineCoordinateX, startCoordinateY, lineCoordinateY } = element
        // switch (type) {
        // case "line":
        const on = onLine(startCoordinateX, startCoordinateY, lineCoordinateX, lineCoordinateY, x, y);
        const start = nearPoint(x, y, startCoordinateX, startCoordinateY, "start");
        const end = nearPoint(x, y, lineCoordinateX, lineCoordinateY, "end");
        return start || end || on;
        // case "rectag":
        //     const topLeft = nearPoint(x, y, x1, y1, "tl");
        //     const topRight = nearPoint(x, y, x2, y1, "tr");
        //     const bottomLeft = nearPoint(x, y, x1, y2, "bl");
        //     const bottomRight = nearPoint(x, y, x2, y2, "br");
        //     const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
        //     return topLeft || topRight || bottomLeft || bottomRight || inside;
        // }
    }
    const getElementAtPosition = (x, y, elements) => {
        return elements.map(element => ({ ...element, position: positionWithinElement(x, y, element) }))
            .find(element => element.position !== null);
    };

    const handleMouseDown = ({ nativeEvent }) => {

        const element = getElementAtPosition(nativeEvent.offsetX, nativeEvent.offsetY, existLine)
        
        setStartCoordinate({
            x: nativeEvent.offsetX,
            y: nativeEvent.offsetY
        })
        setIsDrawing(true)
    }
    const handleMouseMove = ({ nativeEvent }) => {
        if (isDrawing) {
            setLineCoordinate({
                x: nativeEvent.offsetX,
                y: nativeEvent.offsetY
            })
            websocket.current.send(JSON.stringify({
                event: "mousemove",
                message: {
                    startX: startCoordinate.x,
                    startY: startCoordinate.y,
                    endX: lineCoordinate.x,
                    endY: lineCoordinate.y,
                    isDrawing: isDrawing,
                    draw: state.pen,
                    color: state.color
                }
            }))
        }
    }
    const handleMouseUp = () => {
        if (isDrawing) {
            websocket.current.send(JSON.stringify({
                event: "mouseup",
                message: {
                    startCoordinateX: startCoordinate.x,
                    startCoordinateY: startCoordinate.y,
                    lineCoordinateX: lineCoordinate.x,
                    lineCoordinateY: lineCoordinate.y,
                    draw: state.pen,
                    color: state.color
                }
            }))
        }
        setLineCoordinate({})
        setIsDrawing(false)
    }
    return (
        <>
            <div className="tool-board">
                <button onClick={clearBoard}>Clear</button>
                <ToolBoard />
            </div>
            <canvas ref={canvas} className="board-draw"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />
        </>

    )
}

export default BoardDraw


