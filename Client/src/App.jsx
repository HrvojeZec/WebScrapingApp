import React from "react";
import { Route, Routes } from "react-router-dom";
import { ScrapePage } from "./views/ScrapePage/ScrapePage";
import "@mantine/core/styles.css";

import {
  MantineProvider,
  DirectionProvider,
  localStorageColorSchemeManager,
} from "@mantine/core";
function App() {
  return (
    <MantineProvider>
      <Routes>
        <Route exact path="/" element={<ScrapePage />} />
      </Routes>
    </MantineProvider>
  );
}

export default App;
