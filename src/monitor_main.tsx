import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import DisplayMonitor from "./Components/DisplayMonitor";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <DisplayMonitor verseToDisplay={undefined} />
);
