import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Desktop entry point — platform is decided here, once, at startup.
// Electron's main.cjs always loads this via localhost:8085.
// App never needs to guess the platform.

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(<App platform="desktop" />);
