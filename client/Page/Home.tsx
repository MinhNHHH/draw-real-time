import React, { useState } from "react";
import Github from "../icon/github.svg";
function Home() {
  const [idRoom, setIdRoom] = useState(null);

  const onChangeIdRoom = (e: any) => {
    setIdRoom(e.target.value);
  };
  const joinFunction = (e: any) => {
    e.preventDefault();
    if (idRoom === null) {
      return;
    }
    window.location.replace(`/${idRoom}`);
  };

  return (
    <div className="bg-cover bg-center bg-gray-600 h-screen">
      <div className="absolute place-items-center h-2/5 w-378px left-39% bg-cyan-300 top-29% rounded-3xl">
        <p className="text-center text-3xl top-5 m-7  text-black ">
          Draw Real Time
        </p>
        <div className=" mt-8 text-3xl p-4 text-black">
          <label htmlFor="roomId">Room ID</label>
        </div>
        <form className="p-4" onSubmit={joinFunction}>
          <input
            type="text"
            name="roomId"
            className=" w-full h-12 rounded-full border-solid p-4"
            placeholder="Please enter room id"
            onChange={onChangeIdRoom}
          />
          <button
            type="submit"
            className="text-center w-full mt-5 h-12 rounded-full bg-white text-black text-2xl"
            onClick={joinFunction}
          >
            Join
          </button>
        </form>
        <a href="https://github.com/hoangminh981/draw-real-time">
          <img src={Github} className=" w-12 text-center ml-42%" alt="logo" />
        </a>
      </div>
    </div>
  );
}

export default Home;
