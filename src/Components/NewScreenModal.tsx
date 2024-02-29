import { motion } from 'framer-motion'
import { useEffect, useState } from 'react';
import { CustomScreen, Screen } from './ConfigureScreens';
import Dropdown from './ProjectionCustomization/Dropdown';
import { Monitor } from '@tauri-apps/api/window';

type Props = {
    shown: boolean,
    setShown: Function,
    makeNewScreenObject: Function,
    monitors?: Monitor[],
    customScreens?: CustomScreen[],
}

function NewScreenModal({shown, setShown, makeNewScreenObject, monitors, customScreens} : Props) {

    const [screenName, setScreenName] = useState<string>("");
    const [selectedScreen, setSelectedScreen] = useState<string>();
    const [expanded, setExpanded] = useState<boolean>(false);

    function handleCreate(){
        if(selectedScreen && screenName){
            setSelectedScreen(undefined);
            setScreenName("");
            makeNewScreenObject({ customName: screenName, screen: (monitors?.filter(m => m.name === selectedScreen).at(0) as Screen) } as CustomScreen);
            setShown(false);
        }
    }

    function handleCancel(){
        setShown(false);
    }

  return (
    <motion.div id="new_theme_modal" initial={{opacity:0}} animate={{opacity: shown ? 1 : 0, display: shown ? 'block' : 'none'}} exit={{opacity:0}} className={`p-5 absolute z-10 w-100 h-40 dark:bg-neutral-800
        rounded-md border border-neutral-700 shadow-2xl shadow-neutral-900 text-neutral-500 text-xs flex flex-col justify-start items-center origin-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 `}>
                Choose an available display
            <Dropdown placeholderText='No unused displays'  value={selectedScreen} expanded={expanded} setExpanded={setExpanded} onChange={(e : string)=>{setSelectedScreen(e)}} onMouseDown={() => { } } hidden={false} options={monitors?.map(m=>m.name).filter(m=>!customScreens?.find(s=>s.screen.name === m))}/>

                {/* Enter a Screen name */}
            <input id="screen_name_input" placeholder='Audience-main...' className="mt-2 rounded-md w-full border border-neutral-700 outline-none ps-2 py-1 dark:bg-neutral-800 dark:text-neutral-200"
            value={screenName} autoCorrect="off" autoComplete="off" autoCapitalize="off" maxLength={20}
            onChange={(e)=>setScreenName(e.target.value.trimStart())}/>
            <div className='mt-5 flex w-full justify-around items-center gap-5'>
                <motion.button className='bg-neutral-200 text-[#f3553c] rounded md text-xs w-20 h-8' disabled={screenName.length < 1 ? true : false}
                whileHover={{backgroundColor:"#f3553c", color:"#d4d4d4"}} animate={screenName.length < 1 ? {backgroundColor:"#404040", color:"#737373"} : {backgroundColor:"#525252", color: "#d4d4d4"}}
                onClick={handleCreate}>
                    CREATE
                </motion.button>
                <motion.button className='dark:bg-neutral-800 border border-neutral-700 text-neutral-400 rounded md text-xs w-20 h-8'
                whileHover={{backgroundColor: "#404040", color:"#d4d4d4"}}
                onClick={handleCancel}>
                    CANCEL
                </motion.button>
            </div>
        </motion.div>
  )
}

export default NewScreenModal