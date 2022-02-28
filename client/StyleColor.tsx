import React from "react";
import ToolBoardCheckBox from "./ToolBoardCheckBox";
import { ReactComponent as IconColor } from "../../icon/coloricon.svg";
import { ReactComponent as SizeL } from "../../icon/sizeL.svg";
import { ReactComponent as SizeM } from "../../icon/sizeM.svg";
import { ReactComponent as SizeS } from "../../icon/sizeS.svg";

declare module "*.svg";
interface ParamType {
  strokeWidth: number;
  color: string;
  handleDisplayColorTable: () => void;
  displayColorTabel: boolean;
  setAttribute: (value : any) => void;
}
function StyleColor(props: ParamType) {
  const handleChangeAttribute = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setAttribute(e.target);
  };

  const listColor = ["black", "red", "blue", "green", "brown", "#7746f1"];

  const listSize = [
    {
      icon: <SizeS />,
      size: 4,
    },
    {
      icon: <SizeM />,
      size: 6,
    },
    {
      icon: <SizeL />,
      size: 10,
    },
  ];

  const listSizeMap = listSize.map((e) => {
    return (
      <ToolBoardCheckBox
        icon={e.icon}
        key={e.size}
        value={e.size}
        name={"strokeWidth"}
        selected={
          "bg-cyan-200 rounded-xl text-white relative m-0 p-1 flex align-middle justify-center w-10 h-10 border-4 border-white"
        }
        hover={
          "transform h-10 w-10 hover:bg-#e5e7eb rounded-xl  relative m-0 p-1 flex align-middle justify-center w-10 h-10 border-4 border-white transition duration-300 hover:scale-125"
        }
        checked={props.strokeWidth === e.size}
      />
    );
  });
  const listColorMap = listColor.map((e) => {
    return (
      <ToolBoardCheckBox
        icon={<IconColor stroke={e} />}
        key={e}
        value={e}
        name={"stroke"}
        selected={
          "bg-cyan-200 rounded-xl relative m-0 p-1 flex align-middle justify-center w-10 h-10 border-4 border-white"
        }
        hover={
          "transform h-10 w-10 hover:bg-#e5e7eb rounded-xl  relative m-0 p-1 flex align-middle justify-center w-10 h-10 border-4 border-white transition duration-300 hover:scale-125"
        }
        checked={props.color === e}
      />
    );
  });

  return (
    <div
      className="w-24 h-11 m-2 border-2 rounded-lg "
      onClick={props.handleDisplayColorTable}
    >
      <div className="flex m-2 justify-around ">
        <p>Styles</p>
        <div>
          <IconColor stroke={props.color} />
        </div>
      </div>
      {props.displayColorTabel ? (
        <div className=" absolute top-14 w-52 right-6% border-2 rounded-lg p-1">
          <div className="flex justify-around">
            <span className="mt-1">Color</span>
            <div
              className="grid grid-cols-3 gap-0 mr-2 ml-2"
              onChange={handleChangeAttribute}
            >
              {listColorMap}
            </div>
          </div>
          <div className="flex justify-around  ml-1 mr-1">
            <span className="mt-2">Size</span>
            <div
              className="grid grid-cols-3 gap-0"
              onChange={handleChangeAttribute}
            >
              {listSizeMap}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default StyleColor;
