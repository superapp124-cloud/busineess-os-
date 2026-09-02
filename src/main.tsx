import { createRoot } from "react-dom/client";
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-sans/700.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';
import App from "./App";
import "./index.css";
import { AuthProvider } from "./services/AuthProvider";
import { bootKernel } from "./core/runtime/boot";
import { DesignSystemProvider } from "./contexts/DesignSystemContext";

console.log("🚀 [Main] Starting React mount...");
const rootElement = document.getElementById("root");

if (!rootElement) {
 console.error("❌ [Main] Root element not found!");
 throw new Error("Root element not found");
}

console.log("🚀 [Main] Root element found, rendering App...");
// Only boot the enterprise kernel when outside /auth to guarantee sub-300ms load
if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
  bootKernel().catch(err => console.error("❌ [Main] Kernel Boot Error:", err));
}
createRoot(rootElement).render(
 <DesignSystemProvider>
 <App />
 </DesignSystemProvider>
);
console.log("🚀 [Main] Render call completed");
