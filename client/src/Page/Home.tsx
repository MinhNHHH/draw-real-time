import  { useState } from "react";
import { ReactComponent as Github } from "../icon/github.svg";
import { ReactComponent as Pencil } from "../icon/pencil.svg";
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
    <div className="bg-cover bg-center h-screen bg-orange-100">
      <div className="absolute place-items-center h-fit w-378px left-39% top-29% rounded-3xl">
        <div className="text-center text-5xl font-bold top-5 text-black flex">
          <div>
            <Pencil width={50} height={50}/>
          </div>
          <p>Draw Real Time</p>
        </div>
        <div className=" mt-8 text-3xl p-4 text-black">
          <label htmlFor="roomId">Room ID</label>
        </div>
        <form className="p-4 flex" onSubmit={joinFunction}>
          <input
            type="text"
            name="roomId"
            className=" w-full h-12 border-solid p-4 border-2"
            placeholder="Please enter room id"
            onChange={onChangeIdRoom}
          />
          <button
            type="submit"
            className="text-center w-full h-12  bg-cyan-400 text-black text-2xl"
            onClick={joinFunction}
          >
            Join
          </button>
        </form>
        <a href="https://github.com/hoangminh981/draw-real-time">
          <Github className=" w-12 text-center ml-42%"/>
        </a>
      </div>
    </div>
  );
}

export default Home;
