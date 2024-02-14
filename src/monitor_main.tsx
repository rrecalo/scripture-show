import ReactDOM from "react-dom/client";
import "./styles.css";
import ProjectionDisplay from './Components/ProjectionDisplay';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <ProjectionDisplay audience={true}/>
);
