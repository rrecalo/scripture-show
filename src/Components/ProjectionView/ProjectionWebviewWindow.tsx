import ProjectionDisplay from './ProjectionDisplay'
import { appWindow } from '@tauri-apps/api/window';
import { currentMonitor } from '@tauri-apps/api/window';

let monitor = currentMonitor();
monitor.then(res=> {
    if(res){
        appWindow.setPosition(res?.position);
        appWindow.setSize(res?.size);
    }

})

function ProjectionWebviewWindow() {
  return (
    <ProjectionDisplay audience={true}/>
  )
}

export default ProjectionWebviewWindow