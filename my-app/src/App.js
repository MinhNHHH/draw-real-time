import React, { useRef } from 'react';
import BoardFabricNew from './components/BoardFabricNew';
//import BoardDraw from './components/BoardDraw';
//import BoardFarbic from './components/BoardFarbic';


//'ws://' + '127.0.0.1:8000' + '/ws/websocket/'
function App() {
  const webSocket = useRef(null)
  webSocket.current = new WebSocket("ws://" + "localhost:8000" + "/")

  webSocket.current.onopen = () => {
    console.log('WebSocket open');
  }
  
  return (

    <div className="App">
      <BoardFabricNew socket = {webSocket}/>
    </div>

  );
}

export default App;
