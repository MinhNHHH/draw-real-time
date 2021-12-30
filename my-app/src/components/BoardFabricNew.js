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
    const [ctrlDown, setCrtlDown] = useState(false)
    const [objectCopy, setObjectCopy] = useState(null)
    useEffect(() => {
        const canvasElement = new fabric.Canvas('board')
        setCanvas(canvasElement)
    }, [])

    useEffect(() => {
        socket.current.onmessage = ((e) => {
            let dataFromServer = JSON.parse(e.data)
            handleDraw(dataFromServer)
        })
    }, [canvas, pen, color, line, rect, cycle, originCoor, socket])

    const getAbsLeft = (objects) => {
        if (objects.group) {
            return objects.left + objects.group.left + (objects.group.width / 2)
        }
        return objects.left
    }
    const getAbsTop = (objects) => {
        if (objects.group) {
            return objects.top + objects.group.top + (objects.group.height / 2)
        }
        return objects.top
    }
    const getAbsScaleX = (objects) => {
        if (objects.group) {
            return objects.scaleX * objects.group.scaleX
        }
        return objects.scaleX
    }
    const getAbsScaleY = (objects) => {
        if (objects.group) {
            return objects.scaleY * objects.group.scaleY
        }
        return objects.scaleY
    }

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
                const objects = canvas.getObjects() // get all objects in canvas
                const selectedObjects = objects.filter(object => object.id === message['message'].id);
                selectedObjects.forEach(object => {
                    object.set({
                        top: message['message'].top,
                        left: message['message'].left,
                        height: message['message'].height,
                        width: message['message'].width,
                        scaleX: message['message'].scaleX,
                        scaleY: message['message'].scaleY,
                        angle: message['message'].angle
                    })
                    object.setCoords()
                })
                break
            case ("remove-objects"):
                const objects_action = canvas.getObjects()
                const selectedObjects_remove = objects_action.filter(object => object.id === message['message'].id);
                canvas.remove(selectedObjects_remove[0])
                break
            case ("copy-objects"):
                const object_sel = canvas.getObjects()
                const selectedObjects_copy = object_sel.filter(object => object.id === message['message'].id);
                selectedObjects_copy[0].clone((cloned) => {
                    setObjectCopy(cloned)
                })
                break
            // case ("paste-objects"):
            //     if (objectCopy !== null) {
            //         objectCopy.clone((cloneObject) => {
            //             canvas.discardActiveObject();
            //             cloneObject.set({
            //                 left: cloneObject.left + 10,
            //                 top: cloneObject.top + 10,
            //                 evented: true,
            //             });
            //             if (cloneObject.type === 'activeSelection') {
            //                 // active selection needs a reference to the canvas.
            //                 cloneObject.canvas = canvas;
            //                 cloneObject.forEachObject(function (obj) {
            //                     canvas.add(obj);
            //                 });
            //                 // this should solve the unselectability
            //                 cloneObject.setCoords();
            //             } else {
            //                 canvas.add(cloneObject);
            //             }
            //             objectCopy.top += 10;
            //             objectCopy.left += 10;
            //             canvas.setActiveObject(cloneObject);
            //             canvas.requestRenderAll();

            //         })
            //     }
            //     break
            case ("clear-canvas"):
                canvas.clear()
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
    }, [canvas, pen, socket])

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
    }, [canvas, pen, isDrawing, socket])


    const handleMouseUp = useCallback(() => {
        setIsDrawing(false)
        setColor("black")
        setPen("select")
    }, [])

    const handleScalling = useCallback(() => {
        const objects_selected = canvas.getActiveObjects()
        objects_selected.forEach(object => {
            socket.current.send(JSON.stringify({
                event: "modify-objects",
                message: {
                    id: object.id,
                    top: getAbsTop(object),
                    left: getAbsLeft(object),
                    height: object.height,
                    width: object.width,
                    scaleX: getAbsScaleX(object),
                    scaleY: getAbsScaleY(object),
                    angle: object.angle
                }
            }))

        })
    }, [canvas, socket])

    const handleClear = () => {
        socket.current.send(JSON.stringify({
            event: "clear-canvas",
        }))
        setMsg({
            event: "clear-canvas",
        })
    }

    const handleKeyDown = (event) => {
        const ctrlKey = 17;
        const cmdKey = 91;
        const vKey = 86;
        const cKey = 67;
        const objects_selected = canvas.getActiveObject()
        let id = !objects_selected ? null : objects_selected.id
        if (event.keyCode == ctrlKey || event.keyCode == cmdKey) {
            setCrtlDown(true);
        }
        if (ctrlDown && event.keyCode === 8) {
            socket.current.send(JSON.stringify({
                event: "remove-objects",
                message: {
                    id: id
                }
            }))
            setMsg({
                event: "remove-objects",
                message: {
                    id: id
                }
            })
        }
        if (ctrlDown && (event.keyCode === cKey)) {
            socket.current.send(JSON.stringify({
                event: "copy-objects",
                message: {
                    id: id
                }
            }))
            setMsg({
                event: "copy-objects",
                message: {
                    id: id
                }
            })
            setCrtlDown(false)
        }
        if (ctrlDown && (event.keyCode === vKey)) {
            socket.current.send(JSON.stringify({
                event: "paste-objects",
                message: {
                    id: id
                }
            }))
            setMsg({
                event: "paste-objects",
                message: {
                    id: id
                }
            })
        }
    }

    useEffect(() => {
        if (msg !== null) {
            handleDraw(msg)
        }
    }, [msg])


    useEffect(() => {
        if (canvas !== null) {

            document.addEventListener('keydown', handleKeyDown)

            canvas.on("mouse:down", handleMouseDown)

            canvas.on("mouse:move", handleMouseMove)

            canvas.on("mouse:up", handleMouseUp)

            canvas.on("object:scaling", handleScalling)

            canvas.on("object:rotating", handleScalling)

            canvas.on("object:moving", handleScalling)


            return () => {
                canvas.off("mouse:down", handleMouseDown)

                canvas.off("mouse:move", handleMouseMove)

                canvas.off("mouse:up", handleMouseUp)

                canvas.off("object:scaling", handleScalling)

                canvas.off("object:rotating", handleScalling)

                canvas.off("object:moving", handleScalling)

            }

        }
    }, [canvas, pen, color, isDrawing, line, rect, cycle, originCoor, ctrlDown])

    return (
        <>
            <div className='tool-board'>
                <ToolBoard
                    setPen={setPen}
                    setColor={setColor}
                    pen={pen}
                    color={color}
                />
                <button onClick={handleClear}>Clear</button>
            </div>
            <canvas id="board" width={1000} height={500} className="board-draw" />
        </>
    )
}

export default BoardFabricNew