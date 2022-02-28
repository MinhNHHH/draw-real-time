import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Board from "./Page/Board";
import Home from "./Page/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:id" element={<Board />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
