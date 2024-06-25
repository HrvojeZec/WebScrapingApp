import  { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { SearchPage } from "./views/SearchPage/SearchPage";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@mantine/carousel/styles.css";
import "@mantine/notifications/styles.css";
import { Notifications } from "@mantine/notifications";
import "aos/dist/aos.css";
import Aos from "aos";
import { ResultPage } from "./views/ResultPage/ResultPage";

function App() {
  useEffect(() => {
    Aos.init({ duration: 500, once: true });
  }, []);
  return (
    <MantineProvider>
      <Notifications position="top-right" zIndex={1000} />
      <Routes>
        <Route  path="/" element={<SearchPage />} />
        <Route path="/rezultati/:keyword" element={<ResultPage />} />
      </Routes>
    </MantineProvider>
  );
}

export default App;
