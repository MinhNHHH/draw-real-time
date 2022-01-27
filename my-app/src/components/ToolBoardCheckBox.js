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
                    name="option"
                />
                <div className={checked === true ? " bg-blue-400 text-white" : "hover:text-blue-200"}>{props.icon}</div>
            </label>
        </>
    )
}

export default ToolBoardCheckBox;