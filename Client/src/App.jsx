import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { ScrapePage } from "./views/ScrapePage/ScrapePage";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@mantine/carousel/styles.css";
import "@mantine/notifications/styles.css";
import { Notifications } from "@mantine/notifications";
import "aos/dist/aos.css";
import Aos from "aos";

function App() {
  useEffect(() => {
    Aos.init({ duration: 1500 });
  }, []);
  return (
    <MantineProvider>
      <Notifications position="top-right" zIndex={1000} />
      <Routes>
        <Route exact path="/" element={<ScrapePage />} />
      </Routes>
    </MantineProvider>
  );
}

export default App;
