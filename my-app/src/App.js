import React from 'react';
import BoardFabricNew from './components/BoardFabricNew';
import Home from './components/Home'
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:id" element={<BoardFabricNew />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
