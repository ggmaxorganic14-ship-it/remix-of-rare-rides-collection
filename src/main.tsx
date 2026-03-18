import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("[v0] App starting...");
console.log("[v0] Root element:", document.getElementById("root"));

createRoot(document.getElementById("root")!).render(<App />);

console.log("[v0] App rendered");
