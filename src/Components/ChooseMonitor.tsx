import { availableMonitors, Monitor, primaryMonitor } from "@tauri-apps/api/window"
import { invoke } from "@tauri-apps/api/tauri";
import { listen, TauriEvent } from "@tauri-apps/api/event";
import { emit } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";

function ConvertMonitorNameToLabel(monitorName: any) {

    return monitorName.replace(" #", "_");
}


export default function ChooseMonitor(){

    const [monitors, setMonitors] = useState<Monitor[]>();
    const [primary, setPrimary] = useState<Monitor>();
    const [darkMode, setDarkMode] = useState<Boolean>();
    const [windows, setWindows] = useState<String[]>();



    useEffect(()=>{
        availableMonitors().then(result=>
            {
                setMonitors(result);
            });
        
        primaryMonitor().then((result : any) =>setPrimary(result));
    
        listen('theme_update', (event : any) =>{
            setDarkMode(event.payload);
            });
        

        invoke("get_open_windows").then((result: any) => {
            setWindows(result.windows);
        })

        emit("theme_request", "choose_output");

        const unlisten_created_window = listen(TauriEvent.WINDOW_CREATED, ()=>{
            invoke("get_open_windows").then((result: any) => {
                setWindows(result.windows);
            })
        });
        const unlisten_destroyed_window = listen(TauriEvent.WINDOW_DESTROYED, ()=>{
            invoke("get_open_windows").then((result: any) => {
                setWindows(result.windows);
            })
        });
        return ()=>{unlisten_created_window.then(f=>f());
            unlisten_destroyed_window.then(f=>f());}

    },[]);

    useEffect(()=>{
        if(windows && monitors){
            RepaintMonitorStatus(monitors, windows);
        }
        const unlisten_created_window = listen(TauriEvent.WINDOW_CREATED, ()=>{
            invoke("get_open_windows").then((result: any) => {
                setWindows(result.windows);
            })
        });
        const unlisten_destroyed_window = listen(TauriEvent.WINDOW_DESTROYED, ()=>{
            invoke("get_open_windows").then((result: any) => {
                setWindows(result.windows);
            })
        });
        return ()=>{unlisten_created_window.then(f=>f());
            unlisten_destroyed_window.then(f=>f());}
    }, [windows, monitors]);

    function RepaintMonitorStatus(monitors: Monitor[], windows: String[]){
        monitors?.forEach((monitor : Monitor) =>{
            let panel = document.getElementById(ConvertMonitorNameToLabel(monitor.name));
            if(panel){
                if(windows.includes(ConvertMonitorNameToLabel(monitor.name))){
                    panel.style.backgroundColor = "green";
                }
                else panel.style.backgroundColor = "red";
            }
        })
    }

    function handleMonitorChoice(monitor: Monitor){
        invoke("open_display_monitor", {monitorName: monitor.name});
    }


    return(
        <div className={`flex flex-row justify-around items-center p-5 cursor-default min-w-screen min-h-screen h-full w-full ${darkMode ? 'dark bg-neutral-900' : ''}`}>
            <div className="fixed top-0 h-6 w-full" data-tauri-drag-region></div>
            {monitors?.map(monitor=>(
             <div key={ConvertMonitorNameToLabel(monitor.name)} id={ConvertMonitorNameToLabel(monitor.name) || ""} className={` dark:text-neutral-50 w-40 h-24
              p-2 rounded-xl flex flex-col justify-center items-center border-neutral-300 dark:border-neutral-900 border dark:hover:bg-neutral-700 hover:bg-neutral-200 gap-1`}
                onClick={()=>{handleMonitorChoice(monitor)}}>
                <div>
                {monitor.name} 
                </div>
                <div className="font-light">
                    {monitor.size.width}x{monitor.size.height}
                </div>
                <div className="text-xs">
                {monitor.name === primary?.name ? "Primary" : ""}
                </div>
            </div>))}
        </div>
    )
}
