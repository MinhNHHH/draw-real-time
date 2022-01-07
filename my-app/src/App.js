import React from 'react';
import BoardFabricNew from './components/BoardFabricNew';
import { BrowserRouter, Route, Routes } from 'react-router-dom';


//'ws://' + '127.0.0.1:8000' + '/ws/websocket/'
function App() {
  // const webSocket = useRef(null)
  // webSocket.current = new WebSocket("ws://localhost:8000/")

  // webSocket.current.onopen = () => {
  //   console.log('WebSocket open');
  // }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:id" element={<BoardFabricNew />} />
      </Routes>
    </BrowserRouter>
    // <div className="App">

    //   <BoardFabricNew socket = {webSocket}/>
    // </div>

  );
}

export default App;
