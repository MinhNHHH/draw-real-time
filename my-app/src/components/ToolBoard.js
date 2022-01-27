import React from 'react';
import { ReactComponent as Mouse } from "../svg/mouse.svg";
import { ReactComponent as Pencil } from "../svg/pencil.svg";
import { ReactComponent as Eraser } from "../svg/eraser.svg";
import { ReactComponent as Rectangle } from "../svg/rectangle.svg";
import { ReactComponent as Cycle } from "../svg/cycle.svg";
import { ReactComponent as Line } from "../svg/line.svg";
// import { ReactComponent as Rectangle } from "../svg/rectangle.svg";

import ToolBoardCheckBox from './ToolBoardCheckBox';
export default function ToolBoard(props) {
    const listOption = [
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
    ]
    const subObject = [
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
    const displayOption = listOption.map(e => {
        return <ToolBoardCheckBox
            key={e.type}
            styles="w-9 h-9 mr-1 ml-1 mt-0.125"
            value={e.type}
            checked={props.type === e.type}
            value={e.type}
            icon={e.icon}
        />
    })
    const displayObject = subObject.map(e => {
        if (e.type === props.type) {
            return <ToolBoardCheckBox
                key={e.type}
                styles="w-9 h-9 mr-1 ml-1 mt-0.125"
                value={e.type}
                checked={props.type === e.type}
                value={e.type}
                icon={e.icon}
            />
        }
    })
    const displaySubObject = subObject.map(e => {
        return <ToolBoardCheckBox
            key={e.type}
            styles="w-7 h-7 mr-1 ml-1 mt-0.125"
            value={e.type}
            checked={props.type === e.type}
            value={e.type}
            icon={e.icon}
        />
    })
    const handleChangePen = (e) => {
        props.setPen(e.target.value)
    }
    const handleChangeColor = (e) => {
        props.setColor(e.target.value)
    }
    return (
        <>
            <div className='absolute bottom-14 left-47/100'>
                {props.type === "rectag" || props.type === "cycle" || props.type === "line" ?
                    <div className='flex border-2 border-black h-9 w-46 rounded-lg' onChange={handleChangePen}>
                        {displaySubObject}

                    </div>
                    : null
                }
            </div>
            <div className="flex border-2 border-black h-11 w-46 rounded-lg" onChange={handleChangePen}>
                {displayOption}
                {displayObject}
            </div >
        </>
    )
}
