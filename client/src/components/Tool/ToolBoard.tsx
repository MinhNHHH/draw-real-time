import React, { useState, useEffect } from "react";
import { ReactComponent as Mouse } from "../../icon/mouse.svg";
import { ReactComponent as Pencil } from "../../icon/pencil.svg";
import { ReactComponent as Rectangle } from "../../icon/rectangle.svg";
import { ReactComponent as Cycle } from "../../icon/cycle.svg";
import { ReactComponent as Line } from "../../icon/line.svg";
import { ReactComponent as Text } from "../../icon/text.svg";
import ToolBoardCheckBox from "./ToolBoardCheckBox";

interface ParamTypeToolBoard {
  type: string;
  setPen: (value : string) => void;
}
type listObject = Array<{ type: string; icon: JSX.Element }>;

export default function ToolBoard(props: ParamTypeToolBoard) {
  const [displaySubObjects, setDisplaySubObjects] = useState(false);
  const [listOptions, setListOptions] = useState([
    {
      type: "mouse",
      icon: <Mouse />,
    },
    {
      type: "polyline",
      icon: <Pencil />,
    },
    {
      type: "rect",
      icon: <Rectangle />,
    },
    {
      type: "itext",
      icon: <Text />
    },
  ]);

  const subOption = [
    {
      type: "rect",
      icon: <Rectangle />,
    },
    {
      type: "ellipse",
      icon: <Cycle />,
    },
    {
      type: "line",
      icon: <Line />,
    },
  ];
  let tempListOption = [...listOptions];

  const updateListOption = (templist: listObject, subOption: listObject) => {
    const indexTempListOption = templist.findIndex(
      (x) => x.type === "rect" || x.type === "ellipse" || x.type === "line"
    );
    const indexSubListOption = subOption.findIndex(
      (x) => x.type === props.type
    );
    if (indexSubListOption !== -1) {
      templist[indexTempListOption].icon = subOption[indexSubListOption].icon;
      templist[indexTempListOption].type = subOption[indexSubListOption].type;
    }
    return templist;
  };
  useEffect(() => {
    const newList = updateListOption(tempListOption, subOption);
    setListOptions(newList);
  }, [displaySubObjects, props.type]);

  const displayOption = listOptions.map((item) => {
    return (
      <ToolBoardCheckBox
        selected={"bg-blue-400 text-white w-full h-full rounded-lg p-2"}
        hover={
          "transform w-full h-full hover:bg-#e5e7eb rounded-xl  relative m-0 p-1 flex align-middle justify-center w-full h-full border-4 border-white transition duration-300 hover:scale-125"
        }
        key={item.type}
        styles="w-9 h-9 mr-1 ml-1 mt-0.125"
        value={item.type}
        checked={props.type === item.type}
        icon={item.icon}
      />
    );
  });

  const displaySubObject = subOption.map((item) => {
    return (
      <ToolBoardCheckBox
        selected={"bg-blue-400 text-white w-full h-full rounded-lg p-2"}
        hover={
          "transform w-full h-full hover:bg-#e5e7eb rounded-xl  relative m-0 p-1 flex align-middle justify-center w-full h-full border-4 border-white transition duration-300 hover:scale-125"
        }
        key={item.type}
        styles="w-9 h-9 mr-1 ml-1 mt-0.125"
        value={item.type}
        checked={props.type === item.type}
        icon={item.icon}
      />
    );
  });

  const handleChangePen = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.value === "rect" ||
      e.target.value === "line" ||
      e.target.value === "ellipse"
    ) {
      setDisplaySubObjects(true);
    }
    props.setPen(e.target.value);
  };

  return (
    <>
      <div className="absolute bottom-14 ">
        {displaySubObjects &&
        (props.type === "rect" ||
          props.type === "ellipse" ||
          props.type === "line") ? (
          <div
            className="flex p-1 rounded-xl border border-black"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChangePen(e);
              setDisplaySubObjects(false);
            }}
          >
            {displaySubObject}
          </div>
        ) : null}
      </div>
      <div
        className="flex p-1 rounded-xl border border-black"
        onChange={handleChangePen}
      >
        {displayOption}
      </div>
    </>
  );
}
