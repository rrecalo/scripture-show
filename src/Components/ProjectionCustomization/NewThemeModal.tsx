import { motion } from 'framer-motion'
import { useEffect } from 'react';

type Props = {
    hide: boolean,
    newThemeName: string,
    setNewThemeName: Function,
    setHide: Function,
    initNewTheme: Function,

}

function NewThemeModal({hide, setHide, newThemeName, setNewThemeName, initNewTheme} : Props) {

    function handleCreate(){
        initNewTheme();
    }

    function handleCancel(){
        if(newThemeName === undefined && newThemeName.length > 0){
            setHide(true);
            setNewThemeName("");
        }
    }

  return (
    <motion.div id="new_theme_modal" initial={{opacity:0}} animate={{opacity: !hide ? 1 : 0}} exit={{opacity:0}} className={`p-5 absolute z-10 w-100 h-40 dark:bg-neutral-800
        rounded-md border border-neutral-700 shadow-2xl shadow-neutral-900 text-neutral-500 text-xs flex flex-col justify-start items-center origin-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 `}>
                Enter a theme name
            <input id="theme_name_input" placeholder='Student Night...' className="mt-2 rounded-md w-full border border-neutral-700 outline-none ps-2 py-1 dark:bg-neutral-800 dark:text-neutral-200 "
            value={newThemeName} autoCorrect="off" autoComplete="off" autoCapitalize="off"
            onChange={(e)=>setNewThemeName(e.target.value)}/>
            <div className='mt-5 flex w-full justify-around items-center gap-5'>
                <motion.button className='bg-neutral-200 text-[#f3553c] rounded md text-xs w-20 h-8' disabled={newThemeName.length < 1 ? true : false}
                whileHover={{backgroundColor:"#f3553c", color:"#d4d4d4"}} animate={newThemeName.length < 1 ? {backgroundColor:"#404040", color:"#737373"} : {backgroundColor:"#525252", color: "#d4d4d4"}}
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

export default NewThemeModal