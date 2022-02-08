import React, { useState } from 'react';
import StyleColorValue from './StyleColorValue';
import { ReactComponent as IconColor } from "../svg/coloricon.svg"
import { ReactComponent as SizeL } from "../svg/sizeL.svg"
import { ReactComponent as SizeM } from "../svg/sizeM.svg"
import { ReactComponent as SizeS } from "../svg/sizeS.svg"

function StyleColor(props) {
    const [displayColorTabel, setDisplayColorTable] = useState(false)

    const handleChangeStateColorTable = () => {
        setDisplayColorTable(true)
    }

    const handleChangeColor = (e) => {
        props.setColor(e.target.value)
    }
    const listColor = ["black", "red", "blue", "green", "brown", "#7746f1"]

    const listSize = [
        {
            icon: <SizeS />,
            size: 2
        },
        {
            icon: <SizeL />,
            size: 10
        },
        {
            icon: <SizeM />,
            size: 5
        }
    ]

    const listSizeMap = listSize.map(e => {
        return (
            <StyleColorValue
                icon={e.icon}
                key={e.size}
                value={e.size}
            />)
    })
    const listColorMap = listColor.map(e => {
        return (
            <StyleColorValue
                icon={<IconColor stroke={e} />}
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
                <div>
                    <div className='flex relative top-3 right-9 w-32 border-2 rounded-lg p-1'>
                        <span>Color</span>
                        <div className='flex flex-wrap h-16 justify-around' onChange={handleChangeColor}>
                            {listColorMap}
                        </div>
                    </div>
                    <div className='flex relative top-3 right-9 w-32 border-2 rounded-lg p-1'>
                        <span>Size</span>
                        <div className='flex flex-wrap h-6 justify-around' onChange={handleChangeColor}>
                            {listSizeMap}
                        </div>
                    </div>
                </div>
                : null
            }


        </div>

    )
}


export default StyleColor;

