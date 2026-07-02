import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 [Main] Starting React mount...");
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ [Main] Root element not found!");
  throw new Error("Root element not found");
}

console.log("🚀 [Main] Root element found, rendering App...");
createRoot(rootElement).render(<App />);
console.log("🚀 [Main] Render call completed");
