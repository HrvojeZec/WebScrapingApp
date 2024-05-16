import React from "react";
import { Route, Routes } from "react-router-dom";
import { ScrapePage } from "./views/ScrapePage/ScrapePage";
function App() {
  return (
    <Routes>
      <Route exact path="/" element={<ScrapePage />} />
    </Routes>
  );
}

export default App;
