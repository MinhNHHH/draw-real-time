import React, { useEffect, useState, useCallback } from 'react'
import ToolBoard from './ToolBoard'
import { v4 as uuidv4 } from 'uuid'

import { fabric } from "fabric"
import "./BoardDraw.css"


function BoardFabricNew(props) {
    const socket = props.socket
    const [pen, setPen] = useState("select")
    const [color, setColor] = useState("black")
    const [canvas, setCanvas] = useState(null)
    const [line, setLine] = useState(null)
    const [rect, setRect] = useState(null)
    const [cycle, setCycle] = useState(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [msg, setMsg] = useState(null)
    const [originCoor, setOriginCoor] = useState(null)
    useEffect(() => {
        const canvasElement = new fabric.Canvas('board')
        setCanvas(canvasElement)
    }, [])

    useEffect(() => {
        socket.current.onmessage = ((e) => {
            let dataFromServer = JSON.parse(e.data)
            handleDraw(dataFromServer)
            console.log(dataFromServer)
        })
    }, [canvas, pen, color, line, rect, cycle, originCoor])

    const make_object = (event) => {
        let pointer = canvas.getPointer(event.e)
        const origin_X = pointer.x
        const origin_Y = pointer.y

        if (pen === "line") {
            return {
                coordinate: [pointer.x, pointer.y, pointer.x, pointer.y],
                option: {
                    id: uuidv4(),
                    type: "line",
                    stroke: color,
                }
            }
        }
        if (pen === "rectag") {
            return {
                pointer: pointer,
                option: {
                    id: uuidv4(),
                    left: origin_X,
                    top: origin_Y,
                    width: pointer.x - origin_X,
                    height: pointer.y - origin_Y,
                    stroke: color,
                    fill: "white",
                    type: "rectag"
                }
            }
        }
        if (pen === "cycle") {
            return {
                pointer: pointer,
                option: {
                    id: uuidv4(),
                    left: pointer.x,
                    top: pointer.y,
                    radius: 1,
                    originX: 'center',
                    originY: 'center',
                    stroke: color,
                    type: "cycle"
                }
            }
        }
    }

    const handleDraw = (message) => {

        switch (message.event) {
            case ("add-objects"):
                if (message['message']['option'].type === "line") {
                    const line_objects = new fabric.Line(message['message'].coordinate, message['message']['option'])
                    setLine(line_objects)

                    //line_objects.setCoords()
                    canvas.add(line_objects)
                }
                else if (message['message']['option'].type === "rectag") {
                    const rect_objects = new fabric.Rect(message['message']['option'])

                    setRect(rect_objects)
                    setOriginCoor({
                        x: message['message']['pointer'].x,
                        y: message['message']['pointer'].y
                    })
                    canvas.add(rect_objects)
                }
                else if (message['message']['option'].type === "cycle") {
                    console.log("hello")
                    const cycle_objects = new fabric.Circle(message['message']['option'])
                    setCycle(cycle_objects)
                    setOriginCoor({
                        x: message['message']['pointer'].x,
                        y: message['message']['pointer'].y
                    })
                    canvas.add(cycle_objects)
                }
                break
            case ("set-coordinate"):
                if (message['message'].type === "line" && line !== null) {
                    line.set({
                        x2: message['message'].x2,
                        y2: message['message'].y2,
                    })
                    line.setCoords()
                }
                else if (message['message'].type === "rectag" && rect !== null && originCoor !== null) {
                    if (originCoor.x > message['message']['pointer'].x) {
                        rect.set({
                            left: Math.abs(message['message']['pointer'].x)
                        });
                    }
                    if (originCoor.y > message['message']['pointer'].y) {
                        rect.set({
                            top: Math.abs(message['message']['pointer'].y)
                        });
                    }
                    rect.set({
                        width: Math.abs(originCoor.x - message['message']['pointer'].x)
                    });
                    rect.set({
                        height: Math.abs(originCoor.y - message['message']['pointer'].y)
                    });
                    rect.setCoords()
                }
                else if (message['message'].type === "cycle" && cycle !== null && originCoor !== null) {
                    cycle.set({
                        radius: Math.abs(originCoor.x - message['message']['pointer'].x)
                    })
                    cycle.setCoords()
                }
                break
            case ("modify-objects"):
                const objects = canvas.getObjects()
                for (let i = 0; i < message['message'].length; i++) {
                    const selectedObjects = objects.filter(object => object.id == message['message'][i].id);
                    selectedObjects.forEach(object => {
                        object.set({
                            top: message['message'][i].top,
                            left: message['message'][i].left,
                            height: message['message'][i].height,
                            width: message['message'][i].width,
                            scaleX: message['message'][i].scaleX,
                            scaleY: message['message'][i].scaleY,
                            angle: message['message'][i].angle
                        })
                        object.setCoords()
                    }

                    )
                }
                break
        }
        canvas.renderAll()
    }

    const handleMouseDown = useCallback((event) => {
        const payload = make_object(event)
        if (pen === "select") {
            canvas.renderAll()
            return
        }
        socket.current.send(JSON.stringify({
            event: "add-objects",
            message: payload
        }))
        setMsg({
            event: "add-objects",
            message: payload
        })
        setIsDrawing(true)
    }, [canvas, pen, color, isDrawing])

    const handleMouseMove = useCallback((event) => {
        let pointer = canvas.getPointer(event.e)
        if (pen === "line" && isDrawing) {
            socket.current.send(JSON.stringify({
                event: "set-coordinate",
                message: {
                    type: "line",
                    x2: pointer.x,
                    y2: pointer.y
                }
            }))
            setMsg({
                event: "set-coordinate",
                message: {
                    type: "line",
                    x2: pointer.x,
                    y2: pointer.y
                }
            })
        }
        if (pen === "rectag" && isDrawing) {
            socket.current.send(JSON.stringify({
                event: "set-coordinate",
                message: {
                    type: "rectag",
                    pointer: pointer
                }
            }))
            setMsg({
                event: "set-coordinate",
                message: {
                    type: "rectag",
                    pointer: pointer
                }
            })
        }
        if (pen === "cycle" && isDrawing) {
            socket.current.send(JSON.stringify({
                event: "set-coordinate",
                message: {
                    type: "cycle",
                    pointer: pointer
                }
            }))
            setMsg({
                event: "set-coordinate",
                message: {
                    type: "cycle",
                    pointer: pointer
                }
            })
        }
    }, [canvas, pen, color, isDrawing])

    const handleMouseUp = useCallback(() => {
        setIsDrawing(false)
        setColor("black")
        setPen("select")
    }, [canvas, pen, color, isDrawing])

    const handleObjects = (list_object) => {
        if (list_object.length === 1) {
            return [{
                type: list_object[0].type,
                id: list_object[0].id,
                top: list_object[0].top,
                left: list_object[0].left,
                height: list_object[0].height,
                width: list_object[0].width,
                scaleX: list_object[0].scaleX,
                scaleY: list_object[0].scaleY,
                angle: list_object[0].angle
            }]
        }
        if (list_object.length > 1) {
            return list_object.map(object => {
                return {
                    type: object.type,
                    id: object.id,
                    top: object.top,
                    left: object.left,
                    height: object.height,
                    width: object.width,
                    scaleX: object.scaleX,
                    scaleY: object.scaleY,
                    angle: object.angle
                }
            })
        }
    }
    const handleScalling = useCallback(() => {
        const objects_selected = canvas.getActiveObjects()
        if (objects_selected.length >= 2 ){
            const selection = new fabric.ActiveSelection(objects_selected, {
                id : uuidv4(),
                canvas: canvas
              });
            canvas.setActiveObject(selection);
            console.log(selection)
        }
        // socket.current.send(JSON.stringify({
        //     event: "modify-objects",
        //     message: {
        //         type: objects_selected[0].type,
        //         id: objects_selected[0].id,
        //         top: objects_selected[0].top,
        //         left: objects_selected[0].left,
        //         height: objects_selected[0].height,
        //         width: objects_selected[0].width,
        //         scaleX: objects_selected[0].scaleX,
        //         scaleY: objects_selected[0].scaleY,
        //         angle: objects_selected[0].angle
        //     }
        // }))

    }, [canvas, pen, color, isDrawing])


    useEffect(() => {
        if (msg !== null) {
            handleDraw(msg)
        }
    }, [msg])
    useEffect(() => {
        if (canvas !== null) {

            canvas.on("mouse:down", handleMouseDown)

            canvas.on("mouse:move", handleMouseMove)

            canvas.on("mouse:up", handleMouseUp)

            canvas.on("object:scaling", handleScalling)

            canvas.on("object:rotating", handleScalling)

            canvas.on("object:moving", handleScalling)

            // canvas.on("selection:created", handleSelectCreate);

            // canvas.on("selection:updated", handleSelectUpdate);



            return () => {
                canvas.off("mouse:down", handleMouseDown)

                canvas.off("mouse:move", handleMouseMove)

                canvas.off("mouse:up", handleMouseUp)

                canvas.off("object:scaling", handleScalling)

                canvas.off("object:rotating", handleScalling)

                canvas.off("object:moving", handleScalling)

                // canvas.off("selection:created", handleSelectCreate);

                // canvas.off("selection:updated", handleSelectUpdate);
            }

        }
    }, [canvas, pen, color, isDrawing, line, rect, cycle, originCoor])

    return (
        <>
            <ToolBoard
                setPen={setPen}
                setColor={setColor}
                pen={pen}
                color={color}
            />
            <canvas id="board" width={1000} height={500} className="board-draw" />
        </>
    )
}

export default BoardFabricNew