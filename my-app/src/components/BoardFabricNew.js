import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fabric } from "fabric"

import { v4 as uuidv4 } from 'uuid'

import ToolBoard from './ToolBoard'
import StyleColor from './StyleColor'
import { ReactComponent as Delete } from "../svg/delete.svg";

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

function BoardFabricNew() {
    const { id } = useParams()
    const [socket, setSocket] = useState(null)
    const [option, setOption] = useState({
        pen: "mouse",
        isDrawing: false,
        color: "black",
        strokeWidth: 4
    })
    const [displayColorTabel, setDisplayColorTable] = useState(false)
    const [objectDraw, setObjectDraw] = useState(null)
    const [originCoordinate, setOriginCoordinate] = useState(null)
    const [canvas, setCanvas] = useState(null)
    const [objectCopy, setObjectCopy] = useState(null)
    useEffect(() => {
        const canvasElement = new fabric.Canvas('board')
        // const onSocket = new WebSocket(`wss://draw-realtime-socket.herokuapp.com/${id}`)
        const onSocket = new WebSocket(`ws://localhost:8000/${id}`)
        setCanvas(canvasElement)
        setSocket(onSocket)
    }, [id])

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
    }, [canvas, objectDraw, originCoordinate, objectCopy])
    const handleDisplayColorTable = () => {
        setDisplayColorTable(true)
    }
    const handleCloseColorTable = () => {
        setDisplayColorTable(false)
    }
    const make_object = (event) => {
        let pointer = canvas.getPointer(event.e)
        const origin_X = pointer.x
        const origin_Y = pointer.y
        switch (option.pen) {
            case ('line'):
                return {
                    coordinate: [pointer.x, pointer.y, pointer.x, pointer.y],
                    option: {
                        id: uuidv4(),
                        type: "line",
                        stroke: option.color,
                        strokeWidth: option.strokeWidth,
                        perPixelTargetFind: true
                    }
                };
            case ('rectag'):
                return {
                    pointer: pointer,
                    option: {
                        id: uuidv4(),
                        left: origin_X,
                        top: origin_Y,
                        width: pointer.x - origin_X,
                        height: pointer.y - origin_Y,
                        stroke: option.color,
                        strokeWidth: option.strokeWidth,
                        fill: "",
                        type: "rectag",
                        perPixelTargetFind: true
                        
                    }
                };
            case ('cycle'):
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
                        strokeWidth: option.strokeWidth,
                        fill: "",
                        type: "cycle",
                        perPixelTargetFind: true
                        
                    }
                };
            case ('pencil'):
                return {
                    pointer: pointer,
                    option: {
                        id: uuidv4(),
                        stroke: option.color,
                        strokeWidth: option.strokeWidth,
                        type: "pencil",
                        perPixelTargetFind: true
                    }
                };
            default:
                break;
        };
    };

    const handleDraw = (message) => {
        const objectInCanvas = canvas.getObjects()
        switch (message.event) {
            case ("add-objects"):
                let objectDrawing
                let originCoordinateUpdating
                switch (message['message']['option'].type) {
                    case 'line':
                        objectDrawing = new fabric.Line(message['message'].coordinate, ...message['message']['option']);
                        break;
                    case 'rectag':
                        objectDrawing = new fabric.Rect(message['message']['option']);
                        originCoordinateUpdating = {
                            x: message['message']['pointer'].x,
                            y: message['message']['pointer'].y
                        };
                        break;
                    case 'cycle':
                        objectDrawing = new fabric.Circle(message['message']['option']);
                        originCoordinateUpdating = {
                            x: message['message']['pointer'].x,
                            y: message['message']['pointer'].y
                        };
                        break;
                    case 'pencil':
                        objectDrawing = new fabric.Polyline([{ x: message['message']['pointer'].x, y: message['message']['pointer'].y }], { ...message['message']['option'], fill: 'transparent' })
                        break;
                    default:
                        break;
                };
                if (objectDrawing) {
                    setObjectDraw(objectDrawing);
                    setOriginCoordinate(originCoordinateUpdating);
                    canvas.add(objectDrawing);
                }
                break;
            case ("set-coordinate"):
                if (objectDraw) {
                    switch (message['message'].type) {
                        case 'line':
                            objectDraw.set({
                                x2: message['message']['pointer'].x,
                                y2: message['message']['pointer'].y,
                            });
                            break;
                        case 'rectag':
                            if (originCoordinate.x > message['message']['pointer'].x) {
                                objectDraw.set({
                                    left: Math.abs(message['message']['pointer'].x)
                                })
                            }
                            if (originCoordinate.y > message['message']['pointer'].y) {
                                objectDraw.set({
                                    top: Math.abs(message['message']['pointer'].y)
                                })
                            }
                            objectDraw.set({
                                width: Math.abs(originCoordinate.x - message['message']['pointer'].x)
                            })
                            objectDraw.set({
                                height: Math.abs(originCoordinate.y - message['message']['pointer'].y)
                            })
                            break;
                        case 'cycle':
                            objectDraw.set({
                                radius: Math.abs(originCoordinate.x - message['message']['pointer'].x)
                            })
                            break;
                        case 'pencil':
                            const dim = objectDraw._calcDimensions()
                            objectDraw.points.push(new fabric.Point(message['message']['pointer'].x, message['message']['pointer'].y))
                            objectDraw.set({
                                left: dim.left,
                                top: dim.top,
                                width: dim.width,
                                height: dim.height,
                                dirty: true,
                                pathOffset: new fabric.Point(dim.left + dim.width / 2, dim.top + dim.height / 2)
                            })
                            break;
                        default:
                            break;
                    }
                }
                break;

            case ("modify-objects"):
                const selectedObjects = objectInCanvas.filter(object => object.id === message['message'].id)
                selectedObjects.forEach(object => {
                    object.set({
                        top: message['message'].top,
                        left: message['message'].left,
                        height: message['message'].height,
                        width: message['message'].width,
                        scaleX: message['message'].scaleX,
                        scaleY: message['message'].scaleY,
                        angle: message['message'].angle,
                    })
                    object.setCoords()
                })
                break
            case ("remove-objects"):
                const objectActions = objectInCanvas.filter(object => { return message['message'].id.indexOf(object.id) !== -1 })
                canvas.discardActiveObject();
                canvas.remove(...objectActions);
                break
            case ("copy-objects"):
                const selectedObjects_copy = objectInCanvas.filter(object => object.id === message['message'].id)
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
                    })
                }
                break
            case ("clear-canvas"):
                canvas.clear()
                break
            case ("connect"):
                let objectInit
                message['object_existed'].forEach(o => {
                    switch (o.type) {
                        case ("line"):
                            objectInit = new fabric.Line([o.x1, o.y1, o.x2, o.y2], {...o , perPixelTargetFind: true})
                            break
                        case ("cycle"):
                            objectInit = new fabric.Circle({...o , perPixelTargetFind: true})
                            break
                        case ("rectag"):
                            objectInit = new fabric.Rect({...o,perPixelTargetFind: true})
                            break;
                        case ("pencil"):
                            objectInit = new fabric.Polyline(o.points, {...o , perPixelTargetFind: true})
                        default:
                            break;
                    }
                    canvas.add(objectInit)
                    objectInit.setCoords()
                })
                break;
            case ("change-attribute"):
                const objectChange = objectInCanvas.filter(object => { return message['message'].id.indexOf(object.id) !== -1 })
                objectChange.forEach(object => {
                    canvas.setActiveObject(object)
                    object.set({
                        stroke: message['message'].stroke,
                        strokeWidth: parseInt(message['message'].strokeWidth)
                    })
                    object.setCoords()
                })
                break;

            default:
                break;
        }
        if (objectDraw) {
            objectDraw.setCoords()
        }
        canvas.renderAll()
    }

    const handleMouseDown = (event) => {
        const payload = make_object(event)
        const objectActives = canvas.getActiveObjects()
        let msg
        switch (option.pen) {
            case ('mouse'):
                handleCloseColorTable()
                setObjectDraw(null)
                break;
            default:
                if (objectActives.length > 0) {
                    setOption({ ...option, isDrawing: false })
                    return
                }
                msg = {
                    event: "add-objects",
                    message: payload
                }
                break;
        }
        if (socket && msg) {
            socket.send(JSON.stringify(msg))
            handleDraw(msg)
            setOption({ ...option, isDrawing: true })
            canvas.set({
                selection : false
            })
        }
    }

    const handleMouseMove = (event) => {
        let pointer = canvas.getPointer(event.e)
        let msg = {
            event: "set-coordinate",
            message: {
                type: option.pen,
                pointer: pointer
            }
        }
        if (socket && option.isDrawing) {
            socket.send(JSON.stringify(msg))
            handleDraw(msg)

        }
    }

    const handleMouseUp = () => {
        if (objectDraw) {
            socket.send(JSON.stringify({
                event: "add-objects-exist",
                message: {
                    object: objectDraw,
                    id: objectDraw.id
                }
            }))
        }
        setOption({ ...option, isDrawing: false })
        canvas.set({
            selection : true
        })
        
    }

    const handleScalling = () => {
        const objects_selected = canvas.getActiveObjects()
        
        objects_selected.forEach(object => {
            object.set({
                perPixelTargetFind: true
            })
            let msg = {
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
            }
            
            socket.send(JSON.stringify(msg))
        })
    }

    const handleClear = () => {
        let msg = { event: "clear-canvas" }
        socket.send(JSON.stringify(msg))
        handleDraw(msg)
    }

    const handleKeyDown = (event) => {
        const vKey = 86
        const cKey = 67
        const objects_selected = canvas.getActiveObjects()
        let id = !objects_selected ? null : objects_selected.map(e => { return e.id })
        let eventType = null;
        let msg = null;
        if ((event.ctrlKey || event.metaKey) && id !== null) {
            switch (event.keyCode) {
                case vKey:
                    eventType = "paste-objects"
                    break
                case cKey:
                    eventType = "copy-objects"
                    break
                default:
                    break;
            }
        }
        else if (event.keyCode === 8) {
            eventType = "remove-objects"
        }
        msg = {
            event: eventType,
            message: {
                id: id
            }
        }
        socket.send(JSON.stringify(msg))
        handleDraw(msg)
    }

    const handleChangeAttribute = (e) => {
        const objectActives = canvas.getActiveObjects()
        let msg = null
        let stroke = null
        let strokeWidth
        switch (e.name) {
            case ("strokeWidth"):
                setOption({ ...option, strokeWidth: parseInt(e.value) })
                strokeWidth = e.value
                break;
            case ("stroke"):
                setOption({ ...option, color: e.value })
                stroke = e.value
                break;
            default:
                break;
        }
        objectActives.forEach(object => {
            msg = {
                event: "change-attribute",
                message: {
                    id: object.id,
                    strokeWidth: !parseInt(strokeWidth) ? option.strokeWidth : parseInt(strokeWidth),
                    stroke: !stroke ? option.color : stroke
                }
            }
            socket.send(JSON.stringify(msg))
            handleDraw(msg)
        })
    }

    const handleZoom = (event) => {
        let delta = event.e.deltaY;
        let zoom = canvas.getZoom();

        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        canvas.setZoom(zoom);
        event.e.preventDefault();
        event.e.stopPropagation();
    }

    const handleSelected = (e) =>{
        const objectActivess = canvas.getActiveObjects()
        console.log(objectActivess)
        objectActivess.forEach(object => {
            object.set({
                perPixelTargetFind: false
            })
        })
    }
    useEffect(() => {
        if (canvas !== null) {
            document.addEventListener('keydown', handleKeyDown)

            canvas.on("mouse:down", handleMouseDown)

            canvas.on("mouse:move", handleMouseMove)

            canvas.on("mouse:up", handleMouseUp)

            canvas.on('mouse:wheel', handleZoom)

            canvas.on("object:scaling", handleScalling)

            canvas.on("object:rotating", handleScalling)

            canvas.on("object:moving", handleScalling)

            canvas.on("selection:created" , handleSelected)


            return () => {
                canvas.off('mouse:wheel', handleZoom)

                canvas.off("mouse:down", handleMouseDown)

                canvas.off("mouse:move", handleMouseMove)

                canvas.off("mouse:up", handleMouseUp)

                canvas.off("object:scaling", handleScalling)

                canvas.off("object:rotating", handleScalling)

                canvas.off("object:moving", handleScalling)

                canvas.off("selection:created" , handleSelected)

                document.removeEventListener('keydown', handleKeyDown)

            }
        }
    }, [canvas, handleMouseDown])

    return (
        <>
            <canvas id="board" width={window.innerWidth} height={window.innerHeight} className=' border-2 border-black' />
            <div className='fixed right-0 top-0'>
                <StyleColor
                    setAttribute={handleChangeAttribute}
                    color={option.color}
                    strokeWidth={option.strokeWidth}
                    displayColorTabel={displayColorTabel}
                    handleDisplayColorTable={handleDisplayColorTable}
                />
            </div>
            <div className='fixed flex justify-center top-86/100 left-4/10'>
                <ToolBoard
                    setPen={(e) => {
                        setOption({ ...option, pen: e })
                        // canvas.discardActiveObject();
                    }}
                    type={option.pen}
                />
                <button onClick={handleClear}><Delete /></button>
            </div>
        </>
    )
}

export default BoardFabricNew