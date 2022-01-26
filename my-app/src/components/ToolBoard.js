import React from 'react'
import "./ToolBoard.css"

export default function ToolBoard(props) {

    const handleChangePen = (e) => {
        props.setPen(e.target.value)
    }
    const handleChangeColor = (e) => {
        props.setColor(e.target.value)
    }

    return (
        <div className="flex border-2 border-black h-10  w-3/12 rounded-lg">
            <div className=' w-10 h-10  border-black border-2 '>
                Select
            </div>
            <div className=' w-10 h-10  border-black border-2'>
                Pen
            </div>
            <div className=' w-10 h-10  border-black border-2'>
                Tay
            </div>
            <div className=' w-10 h-10  border-black border-2'>
                Chon Hinh
            </div>
            {/* <div onChange={handleChangePen}>
                <label htmlFor="pen"></label>
                <select name="pen" value = {props.pen}>
                <option value="pencil">Pencil</option>
                    <option value="select">Select</option>
                    <option value="line">Line</option>
                    <option value="rectag">Rectag</option>
                    <option value="cycle">Cycle</option>
                </select>
            </div>
            <div onChange={handleChangeColor}>
                <label htmlFor="color"></label>
                <select name="color" value = {props.color}>
                    <option value="black">Black</option>
                    <option value="red">Red</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                </select>
            </div> */}

        </div >
    )
}
