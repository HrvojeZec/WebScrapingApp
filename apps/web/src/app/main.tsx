import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/shared/assets/stylesheets/fonts.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
