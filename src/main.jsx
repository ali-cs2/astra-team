import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { ObservationProvider } from "./components/ObservationProvider";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/noto-sans-arabic/arabic-400.css";
import "@fontsource/noto-sans-arabic/arabic-500.css";
import "./astra.css";
import "./refinements.css";
import "./space-hero.css";
import "./real-data.css";
import "./liquid-glass.css";
import "./crescent-story.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ObservationProvider>
      <App />
    </ObservationProvider>
  </React.StrictMode>,
);
