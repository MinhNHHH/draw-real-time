import React, { useState } from 'react';
import StyleColorValue from './StyleColorValue';
import { ReactComponent as IconColor } from "../svg/coloricon.svg"

function StyleColor(props) {
    const [displayColorTabel, setDisplayColorTable] = useState(false)

    const handleChangeStateColorTable = () => {
        setDisplayColorTable(true)
    }

    const handleChangeColor = (e) => {
        props.setColor(e.target.value)
    }
    const listColor = ["black", "red", "blue", "green", "brown", "#7746f1"]

    const listColorMap = listColor.map(e => {
        return (
            <StyleColorValue
                key={e}
                value={e}
            />
        )
    })

    return (
        <div className='w-24 h-11 m-2 border-2 rounded-lg' onClick={handleChangeStateColorTable}>
            <div className=' flex m-2 justify-around'>
                <p>Styles</p>
                <div> <IconColor stroke={props.color} /> </div>
            </div>
            {displayColorTabel ?
                <div className='flex relative top-3 right-9 w-32 border-2 rounded-lg p-1'>
                    <span>Color</span>
                    <div className='flex flex-wrap h-16 justify-around' onChange={handleChangeColor}>
                        {listColorMap}
                    </div>
                </div>
                : null
            }


        </div>

    )
}


export default StyleColor;

