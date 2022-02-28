import React from "react";

interface ParamTypeCheckBox {
  checked: boolean;
  name?: string;
  selected: string;
  hover: string;
  icon: any;
  value: number | string;
  type ?: string;
  styles ?:string;
}

function ToolBoardCheckBox(props: ParamTypeCheckBox) {
  const checked = props.checked;
  return (
    <>
      <label className={props.styles}>
        <input
          value={props.value}
          style={{ display: "none" }}
          type="checkbox"
          name={props.name}
        />
        <div
          className={checked === true ? `${props.selected}` : `${props.hover}`}
        >
          {props.icon}
        </div>
      </label>
    </>
  );
}

export default ToolBoardCheckBox;
