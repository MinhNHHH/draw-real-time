import React from "react";

function Disconnect(props: { id: string | undefined }) {
  const handleConnect = () => {
    window.location.replace(`/${props.id}`);
  };
  return (
    <div className=" absolute w-80 h-28 border-2 block ml-auto mr-auto top-48 left-0 right-0">
      <div className=" text-center p-3">Websocket disconnected.</div>
      <div className="w-full text-center">
        <button
          onClick={handleConnect}
          className="text-center w-24 h-12 border bg-blue-400 text-white"
        >
          Reconnect
        </button>
      </div>
    </div>
  );
}

export default Disconnect;
