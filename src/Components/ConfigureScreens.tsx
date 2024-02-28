import { availableMonitors, Monitor, PhysicalPosition, PhysicalSize, primaryMonitor } from "@tauri-apps/api/window"
import { invoke } from "@tauri-apps/api/tauri";
import { listen, TauriEvent } from "@tauri-apps/api/event";
import { emit } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AiOutlinePlus } from "react-icons/ai";
import '../App.css';
import NewScreenModal from "./NewScreenModal";
import ScreenListItem from "./ScreenListItem";
import ConfirmScreenDeletionModal from "./ConfirmScreenDeletionModal";

export function ConvertMonitorNameToLabel(monitorName: any) {
    return monitorName.replace(" #", "_");
}

export function ConvertLabelToName(monitorName: any) {
    return monitorName.replace("_", " #");
}

export type Screen = {
    name: string,
    active: boolean,
    size: PhysicalSize,
    position: PhysicalPosition
    scaleFactor: number,
}

export type CustomScreen = {
    customName: string,
    screen: Screen,
}

export default function ConfigureScreens(){

    const [monitors, setMonitors] = useState<Monitor[]>();
    const [isEditingName, setIsEditingName] = useState<boolean>(false);
    const [shown, setShown] = useState<boolean>(false);
    const [primary, setPrimary] = useState<Monitor>();
    const [darkMode, setDarkMode] = useState<Boolean>();
    const [windows, setWindows] = useState<String[]>();
    const [availableDisplays, setAvailableDisplays] = useState<Screen[]>();
    const [screens, setScreens] = useState<CustomScreen[]>([]);
    const [screenToDelete, setScreenToDelete] = useState<CustomScreen>();
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);


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
                setAvailableDisplays(screens as Screen[]);
            });
        
        primaryMonitor().then((result : any) =>setPrimary(result));
    
        listen('theme_update', (event : any) =>{
            setDarkMode(event.payload);
            });
        
        emit("theme_request", "choose_output");
        emit("request_custom_screens");
        const unlisten = listen("send_screens", (event)=>{
            if(event?.payload?.screens){
                setScreens(event.payload?.screens);
            }
        });
        return ()=>{unlisten.then(f=>f());}
    },[]);

    useEffect(()=>{

        const unlisten_created_window = listen(TauriEvent.WINDOW_CREATED, ()=>{
            invoke("get_open_windows").then((result: any) => {
                setWindows(result.windows);
                refreshCustomScreens(result.windows);
            })
        });

        const unlisten_destroyed_window = listen(TauriEvent.WINDOW_DESTROYED, ()=>{
            invoke("get_open_windows").then((result: any) => {
                setWindows(result.windows);
                refreshCustomScreens(result.windows);
            });
        });

        return ()=>{unlisten_created_window.then(f=>f());
            unlisten_destroyed_window.then(f=>f());}
    }, [windows, monitors, screens]);

    useEffect(()=>{
        if(screens && screens.length > 0){
            emit("custom_screens_changed", {screens: screens});
        }
    }, [screens]);

    useEffect(()=>{
        screenToDelete ? setShowDeleteModal(true) : setShowDeleteModal(false);
    }, [screenToDelete])

    useEffect(()=>{
        if(isEditingName){
            setScreenToDelete(undefined);
        }
    }, [isEditingName])

    function refreshCustomScreens(windows: String[]){
        
        let screensToUpdate = screens;
        let newScreens: CustomScreen[] = [];
        screensToUpdate?.forEach((screen : CustomScreen)=>{
            windows?.includes(ConvertMonitorNameToLabel(screen.screen.name)) ?
            screen.screen.active = true
            :
            screen.screen.active = false;
            newScreens.push(screen);
        });
        if(screensToUpdate){
            setScreens(newScreens);
        }
     
    }

    function toggleScreen(screenName : String){
        let updatedScreens = screens;
        let screenToUpdate = updatedScreens?.find(screen => screen.screen.name === screenName);
        if(screenToUpdate){
            screenToUpdate.screen.active = !screenToUpdate?.screen.active;
            invoke("open_display_monitor", {monitorName: ConvertLabelToName(screenName)});
            setScreens(updatedScreens);
        }
    }

    function openScreenModal(){
        setShown(true);
    }

    function makeNewScreenObject(newScreenObject: CustomScreen){
        setScreens(screens=>[...screens as CustomScreen[], newScreenObject])
    }

    function deleteScreenObject(name: string){
        setScreens(screens=>screens.filter(s=> s.customName !== name));
        setScreenToDelete(undefined);
    }

    function renameScreenObject(screenToRename: CustomScreen, newName: string){
        setScreens(screens=>[...screens.filter(s=>s.customName!==screenToRename.customName), {...screenToRename, customName: newName}]);
        setIsEditingName(false);
    }

    return(
        <motion.div initial={{opacity:0.5}} animate={{opacity:1}} className={`select-none cursor-default overflow-y-hidden min-w-screen min-h-screen h-screen max-w-screen ${darkMode ? 'dark bg-neutral-800' : ''}`}>
            <div className="fixed top-0 h-6 w-full" data-tauri-drag-region></div>
            <NewScreenModal shown={shown} setShown={setShown} makeNewScreenObject={makeNewScreenObject} monitors={monitors} customScreens={screens}/>
            <ConfirmScreenDeletionModal shown={showDeleteModal} s={screenToDelete} clearDeleteSelection={()=>setScreenToDelete(undefined)} deleteScreen={deleteScreenObject}/>
            <div className="flex justify-start items-start w-full h-full">
                <div id="output_list" className="pt-6 flex flex-col justify-start items-start w-7/12 h-[100%] ps-4 border-r border-neutral-700">
                    <div className="flex w-full justify-between items-center pe-4">
                    <div className="text-neutral-200 text-sm h-1/10 font-bold mb-1 py-2">
                        Screens
                    </div>
                    <motion.div animate={{color:"#a3a3a3", scale:1}} whileHover={{color: "#f5f5f5", scale:1.1}} onClick={openScreenModal}>
                        <AiOutlinePlus />
                    </motion.div>
                    </div>
                    <div id="screen_list" className="flex flex-col justify-start items-start gap-2 w-full h-full overflow-y-scroll pe-2">
                    {screens?.map(s => <ScreenListItem key={s.customName} setScreenToDelete={setScreenToDelete} setIsEditing={setIsEditingName} renameCustomScreen={renameScreenObject} toggleScreen={toggleScreen} s={s} />)}
                    </div>
                </div>
                <div id="display_list" className="pt-6 flex flex-col justify-start items-start w-5/12 px-4 h-full">
                    <div className="text-neutral-200 text-sm h-1/10 font-bold mb-1 py-2">
                        Available Displays
                    </div>
                    <div className="w-full flex flex-col gap-2 h-[full] pb-2 pe-2 overflow-scroll overflow-x-clip">
                        {availableDisplays?.map((screen : Screen) =>
                        <div className="flex justify-center items-center gap-2">
                            <div className="ps-2 pe-5 py-2 text-sm w-full flex justify-between items-center h-fit bg-neutral-800 border border-neutral-700 rounded-md">
                                <div className="flex justify-start items-center align-middle gap-1">
                                   
                                    <div className="inline-block h-full">
                                        <span className="text-neutral-300">{ConvertLabelToName(screen.name)}</span>
                                        <span className="text-neutral-400"> {screen.size.width}x{screen.size.height} </span>
                                        {primary?.name === ConvertLabelToName(screen?.name) ? <span className="text-xs text-neutral-300">(Primary)</span> : <></>}
                                    </div>
                                </div>
                                {/* <div className="inline-block w-fit">
                                <motion.span className="border rounded-full border-neutral-500 inline-flex items-center cursor-pointer w-12 h-6 justify-start mt-2 mx-auto"
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
                                </div> */}
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>
            {/* {activeScreens?.map((screen : Screen) =>
            <div className="w-40 h-fit text-center">
                <div className="h-20 bg-neutral-800 rounded-lg p-2">
                    <div className='text-stone-100 font-light'>{ConvertLabelToName(screen.name)}</div>
                    <div className="text-stone-400">{screen.size.width}x{screen.size.height}</div>
                    {primary?.name === ConvertLabelToName(screen?.name) ? <div className="text-xs text-neutral-300">(Primary)</div> : <></>}
                </div>
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
            </div>)} */}
             
        </motion.div>
    )
}
