import { availableMonitors, Monitor, primaryMonitor } from "@tauri-apps/api/window"
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { emit } from "@tauri-apps/api/event";
import { useEffect, useState } from "react"

export default function ChooseMonitor(){

    const [monitors, setMonitors] = useState<Monitor[]>();
    const [primary, setPrimary] = useState<Monitor>();
    const [darkMode, setDarkMode] = useState<Boolean>();

    useEffect(()=>{
        availableMonitors().then(result=>setMonitors(result));
        primaryMonitor().then((result : any) =>setPrimary(result));
    
        listen('theme_update', (event : any) =>{
            setDarkMode(event.payload);
            });
        
        emit("theme_request", "choose_output");
    },[]);

    useEffect(()=>{
    },[monitors]);

    function handleMonitorChoice(monitor: Monitor){
        console.log(monitor);
        invoke("open_display_monitor", {monitorName: monitor.name});
    }

    return(
        <div className={`flex flex-row justify-around items-center p-5 cursor-default min-w-screen min-h-screen h-full w-full ${darkMode ? 'dark bg-neutral-900' : ''}`}>
             {monitors?.map(monitor=>(
             <div className="bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-50 w-40 h-20 p-2 rounded-xl w-full h-full flex flex-col justify-center items-center border-neutral-300 dark:border-neutral-900 border dark:hover:bg-neutral-700 hover:bg-neutral-200 gap-1"
                onClick={()=>{handleMonitorChoice(monitor)}}>
                <div>
                {monitor.name === primary?.name ? "Primary Monitor" : "Monitor " + (monitors.indexOf(monitor)+1)} 
                </div>
                <div className="font-light">
                    {monitor.size.width}x{monitor.size.height}
                </div>
            </div>))}
        </div>
    )
}
