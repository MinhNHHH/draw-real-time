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
        <div className="toolboard">
            <div onChange={handleChangePen}>
                <label htmlFor="pen"></label>
                <select name="pen" value = {props.pen}>
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
            </div>
        </div>
    )
}
