import React from 'react';

function ToolBoardCheckBox(props) {
    const checked = props.checked
    return (
        <>
            <label className={props.styles}>
                <input
                    value = {props.value}
                    style={{ display: 'none' }}
                    type="checkbox"
                    name= {props.name}
                />
                <div className={checked === true ?  `${props.selected}` : `${props.hover}`}>{props.icon}</div>
            </label>
        </>
    )
}

export default ToolBoardCheckBox;