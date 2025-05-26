import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { CacheProvider } from "@emotion/react";
import { rtlCache } from "./theme/RTL.tsx";
import { CssBaseline } from "@mui/material";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CacheProvider value={rtlCache}>
      <BrowserRouter>
      <CssBaseline />
        <App />
      </BrowserRouter>
    </CacheProvider>
  </StrictMode>
);
