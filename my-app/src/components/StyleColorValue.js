import React from 'react';
import { ReactComponent as IconColor } from "../svg/coloricon.svg"


export default function StyleColorValue(props) {
    return (
        <>
            <label className={props.styles}>
                <input
                    value={props.value}
                    style={{ display: 'none' }}
                    type="checkbox"
                    name="option"
                />
                <div><IconColor stroke = {props.value}/></div>
            </label>
        </>
    );
}
