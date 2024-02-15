import { availableMonitors, Monitor, PhysicalPosition, PhysicalSize, primaryMonitor } from "@tauri-apps/api/window"
import { invoke } from "@tauri-apps/api/tauri";
import { listen, TauriEvent } from "@tauri-apps/api/event";
import { emit } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function ConvertMonitorNameToLabel(monitorName: any) {
    return monitorName.replace(" #", "_");
}

function ConvertLabelToName(monitorName: any) {
    return monitorName.replace("_", " #");
}

type Screen = {
    name: string,
    active: boolean,
    size: PhysicalSize,
    position: PhysicalPosition
    scaleFactor: number,
}


export default function ChooseMonitor(){

    const [monitors, setMonitors] = useState<Monitor[]>();
    const [primary, setPrimary] = useState<Monitor>();
    const [darkMode, setDarkMode] = useState<Boolean>();
    const [windows, setWindows] = useState<String[]>();
    const [activeScreens, setActiveScreens] = useState<Screen[]>();


    useEffect(()=>{
        availableMonitors().then(result =>
            {
                let screens = [] as Screen[];
                invoke("get_open_windows").then((result2: any) => {
                
                result.forEach((monitor : Monitor) => {
                    let convertedName = ConvertMonitorNameToLabel(monitor.name);
                    screens.push({name: convertedName, active: result2.windows.includes(convertedName), 
                        size: monitor.size, position: monitor.position, scaleFactor: monitor.scaleFactor} as Screen);
                })
                setMonitors(result);
                setWindows(result2.windows);
                });
                setActiveScreens(screens as Screen[]);
            });
        
        primaryMonitor().then((result : any) =>setPrimary(result));
    
        listen('theme_update', (event : any) =>{
            setDarkMode(event.payload);
            });
        
        emit("theme_request", "choose_output");

    },[]);

    useEffect(()=>{

        const unlisten_created_window = listen(TauriEvent.WINDOW_CREATED, ()=>{
            invoke("get_open_windows").then((result: any) => {
                setWindows(result.windows);
                refreshActiveScreens(result.windows, activeScreens);
            })
        });

        const unlisten_destroyed_window = listen(TauriEvent.WINDOW_DESTROYED, ()=>{
            invoke("get_open_windows").then((result: any) => {
                setWindows(result.windows);
                refreshActiveScreens(result.windows, activeScreens);
            });
        });

        return ()=>{unlisten_created_window.then(f=>f());
            unlisten_destroyed_window.then(f=>f());}
    }, [windows, monitors]);

    function handleMonitorChoice(monitor: Monitor){
        invoke("open_display_monitor", {monitorName: monitor.name});
    }

    function refreshActiveScreens(windows: String[], allScreens: Screen[] | undefined){
        let screens = allScreens;
        activeScreens?.forEach((screen : Screen) => {
            if(windows?.includes(screen.name)){
                screen.active = true;
            }
            else screen.active= false;
        });
        setActiveScreens(screens);
    }

    function toggleScreen(screenName : String){
        let screens = activeScreens;
        let screenToUpdate = screens?.find(screen => screen.name === screenName);
        if(screenToUpdate){
            screenToUpdate.active = !screenToUpdate?.active;
            invoke("open_display_monitor", {monitorName: ConvertLabelToName(screenName)});
            setActiveScreens(screens); //
        }


    }

    return(
        <div className={`flex flex-row justify-center items-center gap-5 cursor-default min-w-screen min-h-screen h-full max-w-screen ${darkMode ? 'dark bg-neutral-900' : ''}`}>
            <div className="fixed top-0 h-6 w-full" data-tauri-drag-region></div>

            {activeScreens?.map((screen : Screen) =>
            <div className="w-40 h-fit text-center">
                <div className="h-20 bg-neutral-800 rounded-lg p-2">
                    <div className='text-stone-100 font-light'>{ConvertLabelToName(screen.name)}</div>
                    <div className="text-stone-400">{screen.size.width}x{screen.size.height}</div>
                    {primary?.name === ConvertLabelToName(screen?.name) ? <div className="text-xs text-neutral-300">(Primary)</div> : <></>}
                </div>
                {/* screen.position.toLogical(screen.scaleFactor).x} {screen.position.toLogical(screen.scaleFactor).y */}
                <motion.span className="border rounded-full border-neutral-500 flex items-center cursor-pointer w-11 h-6 justify-start mt-2 mx-auto"
                onClick={()=>toggleScreen(screen.name)}
                initial={{background: screen.active ? "#f3553c" : ""}}
                animate={{background: screen.active ? "#f3553c" : ""}}
                transition={{delay:0.15, duration:0}}
                layout="preserve-aspect"
                >

                    <motion.span className="rounded-full size-5 bg-neutral-50 shadow" 
                    initial={{x: screen.active ? "100%" : "0%"}}
                    animate={{x: screen.active ? "100%" : "0%"}}
                    transition={{duration:0.15, ease:"linear"}}/>
                </motion.span>
            </div>)}
             
        </div>
    )
}
