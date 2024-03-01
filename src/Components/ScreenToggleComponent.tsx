import { useEffect } from 'react';
import { ConvertMonitorNameToLabel, CustomScreen, Screen } from './ConfigureScreens'
import { Monitor, availableMonitors } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api';
import { motion } from 'framer-motion';
import { listen, TauriEvent } from '@tauri-apps/api/event';

type Props = {
    customScreens: CustomScreen[] | undefined,
    setCustomScreens: Function,
    
}

function ScreenToggleComponent({customScreens, setCustomScreens} : Props) {

    useEffect(() => {
        availableMonitors().then(result =>
            {
                let screens = [] as Screen[];
                invoke("get_open_windows").then((result2: any) => {
                
                result.forEach((monitor : Monitor) => {
                    let convertedName = ConvertMonitorNameToLabel(monitor.name);
                    screens.push({name: convertedName, active: result2.windows.includes(convertedName),
                        size: monitor.size, position: monitor.position, scaleFactor: monitor.scaleFactor} as Screen);
                })
                });
        });
    },[]);

    useEffect(()=>{

        const unlisten_created_window = listen(TauriEvent.WINDOW_CREATED, ()=>{
            invoke("get_open_windows").then((result: any) => {
                refreshActiveScreens(result.windows);
            })
        });

        const unlisten_destroyed_window = listen(TauriEvent.WINDOW_DESTROYED, ()=>{
            invoke("get_open_windows").then((result: any) => {
                refreshActiveScreens(result.windows);
            });
        });

        return ()=>{unlisten_created_window.then(f=>f());
            unlisten_destroyed_window.then(f=>f());}
    }, [customScreens]);

    function refreshActiveScreens(windows: String[]){
        
        let screensToUpdate = customScreens;
        let newScreens: CustomScreen[] = [];
        screensToUpdate?.forEach((screen : CustomScreen)=>{
            windows?.includes(ConvertMonitorNameToLabel(screen.screen.name)) ?
            screen.screen.active = true
            :
            screen.screen.active = false;
            newScreens.push(screen);
        });
        if(screensToUpdate){
            setCustomScreens(newScreens);
        }
     
    }

    function toggleScreen(screenName : String){
        let screens = customScreens;
        let screenToUpdate = screens?.find(screen => screen.screen.name === screenName);
        if(screenToUpdate){
            screenToUpdate.screen.active = !screenToUpdate?.screen.active;
            invoke("open_display_monitor", {monitorName: screenName});
            setCustomScreens(screens);
        }
    }

  return (
    <div className="max-h-full w-full pe-2 flex flex-col gap-1 overflow-hidden">
        {
            customScreens?.map(s=>
                {
                return(
                <motion.div key={s.customName} layout initial={{opacity:0, x:10}} animate={{opacity:1, x:0, y:0}} className="w-full py-0.5 ps-2 pe-3 border border-neutral-700 rounded-md text-neutral-200 text-sm flex justify-between items-center">
                    {s.customName}
                    <motion.div className="w-fit h-fit mb-1">
                        <motion.div className="border rounded-full border-neutral-500 inline-flex items-center cursor-pointer w-11 h-6 justify-start mt-2 mx-auto"
                        onClick={()=>toggleScreen(s.screen.name)}
                        initial={{background: s.screen.active ? "#f3553c" : ""}}
                        animate={{background: s.screen.active ? "#f3553c" : ""}}
                        transition={{delay:0.15, duration:0}}>
                            <motion.span className="rounded-full size-5 bg-neutral-50 shadow" 
                            initial={{x: s.screen.active ? "100%" : "0%"}}
                            animate={{x: s.screen.active ? "100%" : "0%"}}
                            transition={{duration:0.15, ease:"linear"}}/>
                        </motion.div>
                    </motion.div>
                </motion.div>)
                }
            )
        }
    </div>
  )
}

export default ScreenToggleComponent