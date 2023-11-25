import { availableMonitors, Monitor, primaryMonitor } from "@tauri-apps/api/window"
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react"

export default function ChooseMonitor(){

    const [monitors, setMonitors] = useState<Monitor[]>();
    const [primary, setPrimary] = useState<Monitor>();

    useEffect(()=>{
        availableMonitors().then(result=>setMonitors(result));
        primaryMonitor().then(result=>setPrimary(result));
    },[]);

    useEffect(()=>{
    },[monitors]);

    function handleMonitorChoice(monitor: Monitor){
        console.log(monitor);
        invoke("open_display_monitor", {monitorName: monitor.name});
    }

    return(
        <div className="flex flex-row justify-around items-center p-5 cursor-default">
             {monitors?.map(monitor=>(
             <div className="bg-neutral-100 w-40 h-20 p-2 rounded-xl w-full h-full flex flex-col justify-center items-center border-neutral-300 border hover:bg-neutral-200 gap-1"
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
