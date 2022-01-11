import React, { useEffect, useState, useCallback } from 'react'
import ToolBoard from './ToolBoard'
import { v4 as uuidv4 } from 'uuid'

import { fabric } from "fabric"
import "./BoardDraw.css"
import { useParams } from 'react-router-dom'

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

let object_draw, originCoordinate,msg

function BoardFabricNew() {
    const { id } = useParams()
    const [socket, setSocket] = useState(null)
    const [option, setOption] = useState({
        pen: "select",
        isDrawing: false,
        color: "black"
    })
    const [canvas, setCanvas] = useState(null)
    const [objectCopy, setObjectCopy] = useState(null)

    useEffect(() => {
        const canvasElement = new fabric.Canvas('board')
        const onSocket = new WebSocket("ws://localhost:8000/" + `${id}`)
        setCanvas(canvasElement)
        setSocket(onSocket)
    }, [])

    useEffect(() => {
        if (socket !== null) {
            socket.onopen = () => {
                console.log('WebSocket open')
            }
            socket.onmessage = ((e) => {
                let dataFromServer = JSON.parse(e.data)
                handleDraw(dataFromServer)
            })
        }
    }, [canvas,option,objectCopy])

    const make_object = (event) => {
        let pointer = canvas.getPointer(event.e)
        const origin_X = pointer.x
        const origin_Y = pointer.y

        if (option.pen === "line") {
            return {
                coordinate: [pointer.x, pointer.y, pointer.x, pointer.y],
                option: {
                    id: uuidv4(),
                    type: "line",
                    stroke: option.color,
                }
            }
        }
        if (option.pen === "rectag") {
            return {
                pointer: pointer,
                option: {
                    id: uuidv4(),
                    left: origin_X,
                    top: origin_Y,
                    width: pointer.x - origin_X,
                    height: pointer.y - origin_Y,
                    stroke: option.color,
                    fill: "white",
                    type: "rectag"
                }
            }
        }
        if (option.pen === "cycle") {
            return {
                pointer: pointer,
                option: {
                    id: uuidv4(),
                    left: pointer.x,
                    top: pointer.y,
                    radius: 1,
                    originX: 'center',
                    originY: 'center',
                    stroke: option.color,
                    type: "cycle"
                }
            }
        }
    }

    const handleDraw = (message) => {

        switch (message.event) {
            case ("add-objects"):
                if (message['message']['option'].type === "line") {
                    object_draw = new fabric.Line(message['message'].coordinate, message['message']['option'])
                }
                else if (message['message']['option'].type === "rectag") {
                    object_draw = new fabric.Rect(message['message']['option'])
                    originCoordinate = {
                        x: message['message']['pointer'].x,
                        y: message['message']['pointer'].y
                    }
                }
                else if (message['message']['option'].type === "cycle") {
                    object_draw = new fabric.Circle(message['message']['option'])
                    originCoordinate = {
                        x: message['message']['pointer'].x,
                        y: message['message']['pointer'].y
                    }
                }
                canvas.add(object_draw)
                break
            case ("set-coordinate"):
                if (message['message'].type === "line" && object_draw) {
                    object_draw.set({
                        x2: message['message']['pointer'].x,
                        y2: message['message']['pointer'].y,
                    })
                }
                else if (message['message'].type === "rectag" && object_draw && originCoordinate) {
                    if (originCoordinate.x > message['message']['pointer'].x) {
                        object_draw.set({
                            left: Math.abs(message['message']['pointer'].x)
                        })
                    }
                    if (originCoordinate.y > message['message']['pointer'].y) {
                        object_draw.set({
                            top: Math.abs(message['message']['pointer'].y)
                        })
                    }
                    object_draw.set({
                        width: Math.abs(originCoordinate.x - message['message']['pointer'].x)
                    })
                    object_draw.set({
                        height: Math.abs(originCoordinate.y - message['message']['pointer'].y)
                    })

                }
                else if (message['message'].type === "cycle" && object_draw && originCoordinate) {
                    object_draw.set({
                        radius: Math.abs(originCoordinate.x - message['message']['pointer'].x)
                    })
                }
                if (object_draw) {
                    object_draw.setCoords()
                }
                break
            case ("modify-objects"):
                const objects_modify = canvas.getObjects() // get all objects in canvas
                const selectedObjects = objects_modify.filter(object => object.id === message['message'].id)
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
                const selectedObjects_remove = objects_action.filter(object => object.id === message['message'].id)
                canvas.remove(selectedObjects_remove[0])
                break
            case ("copy-objects"):
                const object_sel = canvas.getObjects()
                const selectedObjects_copy = object_sel.filter(object => object.id === message['message'].id)
                setObjectCopy(selectedObjects_copy[0])
                break
            case ("paste-objects"):
                if (objectCopy !== null) {
                    objectCopy.clone((cloneObject) => {
                        cloneObject.set({
                            id: uuidv4(),
                            left: cloneObject.left + 20,
                            top: cloneObject.top + 20,
                        })
                        canvas.add(cloneObject)

                        objectCopy.top += 20
                        objectCopy.left += 20
                    })
                }
                break
            case ("clear-canvas"):
                canvas.clear()
                break
            case ("connect"):
                message['object_existed'].forEach(o => {
                    if (o.type === "line") {
                        object_draw = new fabric.Line([o.x1, o.y1, o.x2, o.y2], o)
                    }
                    else if (o.type === "rectag") {
                        object_draw = new fabric.Rect(o)
                    }
                    else if (o.type === "cycle") {
                        object_draw = new fabric.Circle(o)
                    }
                    canvas.add(object_draw)
                    object_draw.setCoords()
                })
                break
        }
        canvas.renderAll()
    }
    const handleMouseDown = useCallback((event) => {
        const payload = make_object(event)
        if (option.pen === "select") {
            object_draw = null
            return
        }
        msg = {
            event: "add-objects",
            message: payload
        }
        socket.send(JSON.stringify({
            event: "add-objects",
            message: payload
        }))
        handleDraw(msg)
        setOption({ ...option, isDrawing: true })
    }, [canvas, option])

    const handleMouseMove = useCallback((event) => {
        let pointer = canvas.getPointer(event.e)
        const object_active = canvas.getActiveObject()
        if (object_active) {
            return
        }
        msg = {
            event: "set-coordinate",
            message: {
                type: option.pen,
                pointer: pointer
            }
        }
        if (socket && option.isDrawing) {
            socket.send(JSON.stringify({
                event: "set-coordinate",
                message: {
                    type: option.pen,
                    pointer: pointer
                }
            }))
        }
        handleDraw(msg)
    }, [canvas, option])

    const handleMouseUp = () => {
        if (object_draw) {
            socket.send(JSON.stringify({
                event: "add-objects-exist",
                message: {
                    object: object_draw,
                    id: object_draw.id
                }
            }))
        }
        setOption({ ...option, isDrawing: false, pen: "select" })
    }

    const handleScalling = () => {
        const objects_selected = canvas.getActiveObjects()
        objects_selected.forEach(object => {
            socket.send(JSON.stringify({
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
    }

    const handleClear = () => {
        socket.send(JSON.stringify({
            event: "clear-canvas",
        }))
        handleDraw({ event: "clear-canvas" })
    }

    const handleKeyDown = (event) => {
        const vKey = 86
        const cKey = 67

        const objects_selected = canvas.getActiveObject()
        let id = !objects_selected ? null : objects_selected.id
        if ((event.ctrlKey || event.metaKey) && event.keyCode === 8) {
            socket.send(JSON.stringify({
                event: "remove-objects",
                message: {
                    id: id
                }
            }))
            msg = {
                event: "remove-objects",
                message: {
                    id: id
                }
            }
        }
        else if ((event.ctrlKey || event.metaKey) && event.keyCode === cKey) {

            socket.send(JSON.stringify({
                event: "copy-objects",
                message: {
                    id: id
                }
            }))
            msg = {
                event: "copy-objects",
                message: {
                    id: id
                }
            }
        }
        else if ((event.ctrlKey || event.metaKey) && event.keyCode === vKey) {
            socket.send(JSON.stringify({
                event: "paste-objects",
                message: {
                    id: id
                }
            }))
            msg = {
                event: "paste-objects",
                message: {
                    id: id
                }
            }
        }
        if(msg){
            handleDraw(msg)
        }

    }

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

                document.removeEventListener('keydown', handleKeyDown)
            }
        }
    }, [canvas, option, objectCopy])

    return (
        <>
            <div className='tool-board'>
                <ToolBoard
                    setPen={(e) => { setOption({ ...option, pen: e }) }}
                    setColor={(e) => { setOption({ ...option, color: e }) }}
                    pen={option.pen}
                    color={option.color}
                />
                <button onClick={handleClear}>Clear</button>
            </div>
            <canvas id="board" width={1000} height={500} className="board-draw" />
        </>
    )
}

export default BoardFabricNew