import React from "react";
import Tooltip from "@mui/material/Tooltip";
interface ParamTypeCheckBox {
  checked: boolean;
  name?: string;
  selected: string;
  hover: string;
  icon: any;
  value: number | string;
  type?: string;
  styles?: string;
  index?: number
}

function ToolBoardCheckBox(props: ParamTypeCheckBox) {
  const checked = props.checked;
  return (
    <>
      <Tooltip title={props.index ? `KeyPress ${props.index}` : ""} placement="top">
        <label className={props.styles}>
          <input
            value={props.value}
            style={{ display: "none" }}
            type="checkbox"
            name={props.name}
          />
          <div
            className={
              checked === true ? `${props.selected}` : `${props.hover}`
            }
          >
            {props.icon}
          </div>
        </label>
      </Tooltip>
    </>
  );
}

export default ToolBoardCheckBox;
