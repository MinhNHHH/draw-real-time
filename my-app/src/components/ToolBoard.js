import React, { useState, useEffect } from 'react';
import { ReactComponent as Mouse } from "../svg/mouse.svg";
import { ReactComponent as Pencil } from "../svg/pencil.svg";
import { ReactComponent as Eraser } from "../svg/eraser.svg";
import { ReactComponent as Rectangle } from "../svg/rectangle.svg";
import { ReactComponent as Cycle } from "../svg/cycle.svg";
import { ReactComponent as Line } from "../svg/line.svg";


import ToolBoardCheckBox from './ToolBoardCheckBox';
export default function ToolBoard(props) {
    console.log(props.type)
    
    const [displaySubObjects, setDisplaySubObjects] = useState(false)
    const [listOptions, setListOptions] = useState([
        {
            type: "mouse",
            icon: <Mouse />
        },
        {
            type: "pencil",
            icon: <Pencil />
        },
        {
            type: "rectag",
            icon: <Rectangle />
        },
        {
            type: "eraser",
            icon: <Eraser />
        },
    ])

    const subOption = [
        {
            type: "rectag",
            icon: <Rectangle />
        },
        {
            type: "cycle",
            icon: <Cycle />
        },
        {
            type: "line",
            icon: <Line />
        },
    ]
    let tempListOption = [...listOptions]
    
    const updateListOption = (templist, subOption) => {
        const indexTempListOption = templist.findIndex(x => x.type === 'rectag' || x.type === 'cycle'|| x.type === 'line')
        const indexSubListOption = subOption.findIndex(x => x.type === props.type)
        if (indexSubListOption !== -1){
            templist[indexTempListOption].icon = subOption[indexSubListOption].icon
            templist[indexTempListOption].type = subOption[indexSubListOption].type
        }
        return templist
    }
    useEffect(() => {
        const newList = updateListOption(tempListOption,subOption)
        setListOptions(newList)
    },[displaySubObjects])

    const displayOption = listOptions.map(e => {
        return <ToolBoardCheckBox
            key={e.type}
            styles="w-9 h-9 mr-1 ml-1 mt-0.125"
            value={e.type}
            checked={props.type === e.type}
            value={e.type}
            icon={e.icon}
        />
    })

    const displaySubObject = subOption.map(e => {
        return <ToolBoardCheckBox
            key={e.type}
            styles="w-9 h-9 mr-1 ml-1 mt-0.125"
            value={e.type}
            checked={props.type === e.type}
            value={e.type}
            icon={e.icon}
        />
    })

    const handleChangePen = (e) => {
        if (e.target.value === 'rectag' || e.target.value === 'line' || e.target.value === 'cycle') {
            setDisplaySubObjects(true)
        }
        props.setPen(e.target.value)
    }
    const handleChangeColor = (e) => {
        props.setColor(e.target.value)
    }
    return (
        <>
            <div className='absolute bottom-14 left-47/100'>
                {displaySubObjects && (props.type === "rectag" || props.type === "cycle" || props.type === "line") ?
                    <div className='flex border-2 border-black h-11 w-46 rounded-lg' onChange={(e) => {
                        handleChangePen(e)
                        setDisplaySubObjects(false)
                    }}>
                        {displaySubObject}
                    </div>
                    : null
                }
            </div>
            <div className="flex border-2 border-black h-11 w-46 rounded-lg" onChange={handleChangePen}>
                {displayOption}
            </div >
        </>
    )
}
