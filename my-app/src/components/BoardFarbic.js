import React, { useEffect, useState, useCallback } from 'react'
import "./BoardFarbic.css"
import { fabric } from 'fabric'
import ToolBoard from './ToolBoard'



export default function BoardFarbic(props) {
    const socket = props.socket
    const [action, setAction] = useState(false)
    const [canvas, setCanvas] = useState(null)
    const [line, setLine] = useState(null)
    const [rect, setRect] = useState(null)
    const [cyc, setCyc] = useState(null)
    const [pen, setPen] = useState("select")
    console.log(pen)
    const [color, setColor] = useState("black")
    const [coordinate, setCoordinate] = useState(null)
    const [objectsLine, setObjectsLine] = useState(null)
    const [objectsRect, setObjectsRect] = useState(null)
    const [objectsCircle, setObjectsCircle] = useState(null)
    const [objectSelected, setObjectSelected] = useState(null)
    const user_id = window.location.pathname
    useEffect(() => {
        const canvasElement = new fabric.Canvas("c")
        setCanvas(canvasElement)
    }, [])
    useEffect(() => {
        socket.current.onmessage = ((e) => {
            let dataFromServer = JSON.parse(e.data)
            dataFromServer = dataFromServer['payload']
            let message = dataFromServer['message']
            let event = dataFromServer['event']
            console.log("me", message)

        })

    }, [canvas, objectsLine, objectsRect, objectsCircle])





    const handleObjectEdit = useCallback((event) => {
        const objects = canvas.getActiveObjects()
        console.log(objects)
        // const point1 = line.getPointByOrigin('center', 'bottom')
        // const point2 = line.getPointByOrigin('center', 'top')
        // //console.log(point1 ,point2 )

        socket.current.send(JSON.stringify({
            event: "scalling",
            message: {
                //x: pointer.x,
                //y: pointer.y,
                //id: !objects?._objects[0]?.id ? objects.id : objects._objects[0].id
            }
        }))
        canvas.renderAll()
    }, [canvas, line])

    const handleObjectSlected = useCallback((event) => {
        const objects = canvas.getActiveObject()
        console.log(objects.get('type'))
        //setObjectSelected(event.target.get('type'))
    }, [canvas])
    const handleMouseDown = useCallback((event) => {
        if (pen === "line") {
            const pointer = canvas.getPointer(event.e)
            const id = Math.random()
            const line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                id: id,
                stroke: color
            })
            setLine(line)
            canvas.add(line)
            socket.current.send(JSON.stringify({
                event: "mouseDown",
                message: {
                    coordinate: [pointer.x, pointer.y, pointer.x, pointer.y],
                    id: id,
                    stroke: color,
                    type: 'line',
                    //user : id_user
                }
            }))
        }
        else if (pen === "rectag") {
            const pointer = canvas.getPointer(event.e)
            const id = Math.random()
            const origX = pointer.x;
            const origY = pointer.y;
            const rect = new fabric.Rect({
                id: id,
                left: origX,
                top: origY,
                width: pointer.x - origX,
                height: pointer.y - origY,
                stroke: color,
                fill: "white"
            })
            setCoordinate({
                originX: origX,
                originY: origY
            })
            setRect(rect)
            canvas.add(rect)
            socket.current.send(JSON.stringify({
                event: "mouseDown",
                message: {
                    left: origX,
                    top: origY,
                    width: pointer.x - origX,
                    height: pointer.y - origY,
                    stroke: color,
                    fill: "white",
                    type: 'rect',
                    id: id
                }
            }))
        }
        else if (pen === "select") {
            canvas.renderAll()
        }
        else if (pen === "cycle") {
            const pointer = canvas.getPointer(event.e)
            const id = Math.random()
            const cycle = new fabric.Circle({
                id: id,
                left: pointer.x,
                top: pointer.y,
                radius: 1,
                originX: 'center',
                originY: 'center',
                stroke: color,
            })
            setCoordinate({
                originX: pointer.x,
                originY: pointer.y
            })
            socket.current.send(JSON.stringify({
                event: "mouseDown",
                message: {
                    left: pointer.x,
                    top: pointer.y,
                    radius: 1,
                    originX: 'center',
                    originY: 'center',
                    stroke: color,
                    fill: "white",
                    type: 'circle',
                    id: id
                }
            }))
            setCyc(cycle)
            canvas.add(cycle)
        }
        setAction(true)
        canvas.setCursor("crosshair")
    }, [canvas, action, pen, cyc, rect, line, setCoordinate, color, socket])

    const handleMouseMove = useCallback((event) => {

        if (action && pen === "line") {
            const pointer = canvas.getPointer(event.e)
            line.set({ x2: pointer.x, y2: pointer.y })
            socket.current.send(JSON.stringify({
                event: "mouseMove",
                message: { x2: pointer.x, y2: pointer.y, type: "line" },

            }))
            canvas.setCursor("crosshair")
            canvas.renderAll()
        }
        else if (action && pen === "select") {
            canvas.renderAll()
        }
        else if (action && pen === "rectag") {
            const pointer = canvas.getPointer(event.e)
            if (coordinate.originX > pointer.x) {
                rect.set({
                    left: Math.abs(pointer.x)
                });
            }
            if (coordinate.oringY > pointer.y) {
                rect.set({
                    top: Math.abs(pointer.y)
                });
            }
            rect.set({
                width: Math.abs(coordinate.originX - pointer.x)
            });
            rect.set({
                height: Math.abs(coordinate.originY - pointer.y)
            });
            socket.current.send(JSON.stringify({
                event: "mouseMove",
                message: {
                    originX: coordinate.originX,
                    originY: coordinate.originY,
                    pointer: pointer,
                    type: "rect"
                }
            }))
            canvas.setCursor("crosshair")
            canvas.renderAll()
        }
        else if (action && pen === "cycle") {
            const pointer = canvas.getPointer(event.e)
            cyc.set({
                radius: Math.abs(coordinate.originX - pointer.x)
            })
            socket.current.send(JSON.stringify({
                event: "mouseMove",
                message: {
                    radius: Math.abs(coordinate.originX - pointer.x),
                    type: "circle"
                }
            }))
            canvas.setCursor("crosshair")
            canvas.renderAll()
        }
    }, [canvas, action, pen, color, cyc, rect, line, setCoordinate, socket])
    const handleMouseUp = useCallback(() => {
        setPen("select")
        setColor("black")
        canvas.setCursor("default")
        setAction(false)
        canvas.renderAll()
        socket.current.send(JSON.stringify({
            event: "mouseUp",
            message: {
                canvas: canvas
            }
        }))
    }, [canvas])



    useEffect(() => {

        if (canvas != null) {
            canvas.on("mouse:down", handleMouseDown)

            canvas.on("mouse:move", handleMouseMove)

            canvas.on("mouse:up", handleMouseUp)

            canvas.on("object:scaling", handleObjectEdit)

            canvas.on('object:selected', handleObjectSlected)

            return () => {
                canvas.off("mouse:down", handleMouseDown)

                canvas.off("mouse:move", handleMouseMove)

                canvas.off("mouse:up", handleMouseUp)

                canvas.off("object:scaling", handleObjectEdit)

            }
        }
    }, [canvas, action, pen, handleMouseDown, handleMouseMove, handleMouseUp, cyc, rect, line, socket])

    return (
        <>
            <ToolBoard
                setPen={setPen}
                setColor={setColor}
                pen={pen}
                color={color}
            />
            <canvas width={1000} height={500} className="board-draw" id="c" />
        </>
    )
}
