import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fabric } from "fabric"

import { v4 as uuidv4 } from 'uuid'

import ToolBoard from './ToolBoard'

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
      color: "black"
   })
   const [objectDraw, setObjectDraw] = useState(null)
   const [originCoordinate, setOriginCoordinate] = useState(null)
   const [canvas, setCanvas] = useState(null)
   const [objectCopy, setObjectCopy] = useState(null)
   useEffect(() => {
      const canvasElement = new fabric.Canvas('board')
      canvasElement.set({
         width: window.innerWidth,
         height: window.innerHeight - 200
      })
      const onSocket = new WebSocket(`wss://draw-realtime-socket.herokuapp.com/` + `${id}`)
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
            console.log(dataFromServer)
            handleDraw(dataFromServer)
         })
      }
   }, [canvas, objectDraw, originCoordinate, objectCopy])

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
               }
            }
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
                  fill: "white",
                  type: "rectag"
               }
            }
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
                  type: "cycle"
               }
            }
         case ('pencil'):
            return {
               pointer: pointer,
               option: {
                  id: uuidv4(),
                  stroke: option.color,
                  type: "pencil"
               }
            }
      }
   }

   const handleDraw = (message) => {

      switch (message.event) {
         case ("add-objects"):
            let objectDrawing
            let originCoordinateUpdating
            if (message['message']['option'].type === "line") {
               objectDrawing = new fabric.Line(message['message'].coordinate, message['message']['option'])
            }
            else if (message['message']['option'].type === "rectag") {
               objectDrawing = new fabric.Rect(message['message']['option'])
               originCoordinateUpdating = {
                  x: message['message']['pointer'].x,
                  y: message['message']['pointer'].y
               }
            }
            else if (message['message']['option'].type === "cycle") {
               objectDrawing = new fabric.Circle(message['message']['option'])
               originCoordinateUpdating = {
                  x: message['message']['pointer'].x,
                  y: message['message']['pointer'].y
               }
            }
            else if (message['message']['option'].type === "pencil") {
               objectDrawing = new fabric.PencilBrush(message['message']['option']);
            }
            setObjectDraw(objectDrawing)
            setOriginCoordinate(originCoordinateUpdating)
            canvas.add(objectDrawing)
            break
         case ("set-coordinate"):
            if (message['message'].type === "line" && objectDraw) {
               objectDraw.set({
                  x2: message['message']['pointer'].x,
                  y2: message['message']['pointer'].y,
               })
            }
            else if (message['message'].type === "rectag" && objectDraw && originCoordinate) {
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

            }
            else if (message['message'].type === "cycle" && objectDraw && originCoordinate) {
               objectDraw.set({
                  radius: Math.abs(originCoordinate.x - message['message']['pointer'].x)
               })
            }
            else if (message['message'].type === "pencil") {
               objectDraw.isDrawingMode = true;
            }
            if (objectDraw) {
               objectDraw.setCoords()
            }
            break
         case ("modify-objects"):
            // get all objects in canvas
            const objects_modify = canvas.getObjects()
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
                     objectInit = new fabric.Line([o.x1, o.y1, o.x2, o.y2], o)
                     break
                  case ("cycle"):
                     objectInit = new fabric.Circle(o)
                     break
                  case ("rectag"):
                     objectInit = new fabric.Rect(o)
               }
               canvas.add(objectInit)
               objectInit.setCoords()
            })
            break
      }
      canvas.renderAll()
   }
   const handleMouseDown = (event) => {
      const payload = make_object(event)
      if (option.pen === "mouse") {
         setObjectDraw(null)
         return
      }
      let msg = {
         event: "add-objects",
         message: payload
      }
      socket.send(JSON.stringify(msg))
      handleDraw(msg)
      setOption({ ...option, isDrawing: true })
   }

   const handleMouseMove = (event) => {
      let pointer = canvas.getPointer(event.e)
      const object_active = canvas.getActiveObject()
      if (object_active) {
         return
      }
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
      setOption({ ...option, isDrawing: false, pen: "mouse" })
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
      let msg = { event: "clear-canvas" }
      socket.send(JSON.stringify(msg))
      handleDraw(msg)
   }

   const handleKeyDown = (event) => {
      const vKey = 86
      const cKey = 67
      const objects_selected = canvas.getActiveObject()
      let id = !objects_selected ? null : objects_selected.id
      let eventType = null;
      let msg = null;
      if (event.ctrlKey || event.metaKey) {
         switch (event.keyCode) {
            case 8:
               eventType = "remove-objects"
               break
            case vKey:
               eventType = "paste-objects"
               break
            case cKey:
               eventType = "copy-objects"
               break
         }
         msg = {
            event: eventType,
            message: {
               id: id
            }
         }
         console.log(msg)
         socket.send(JSON.stringify(msg))
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
   }, [canvas, handleMouseDown])

   return (
      <>

         <canvas id="board" width={window.innerWidth} height={window.innerHeight* 0.78} className=' border-2 border-black'/>
         <div className='fixed flex justify-center top-86/100 left-4/10'>
            <ToolBoard
               setPen={(e) => { setOption({ ...option, pen: e }) }}
               setColor={(e) => { setOption({ ...option, color: e }) }}
               type={option.pen}
               color={option.color}
            />
            <button onClick={handleClear}><Delete /></button>
         </div>
      </>
   )
}

export default BoardFabricNew