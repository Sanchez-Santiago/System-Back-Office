
import { createRoot } from "react-dom/client";
import MainApp from "./MainApp.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <MainApp />
  </ErrorBoundary>
);
  