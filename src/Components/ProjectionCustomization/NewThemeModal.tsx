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


    useEffect(()=>{
        if(!hide){
            let root = document.getElementById("root");
            if(root){
                root.addEventListener("click", (event : MouseEvent)=>{
                    
                });
            }
            return ()=>{root?.removeEventListener("click", ()=>{});}
        }
    },[hide]);

    function handleCreate(){
        initNewTheme();
    }

    function handleCancel(){
        setHide(true);
        setNewThemeName("");
    }

  return (
    <motion.div id="new_theme_modal" initial={{opacity:0}} animate={{opacity: !hide ? 1 : 0}} exit={{opacity:0}} className={`p-5 text-sm text-neutral-300 absolute z-10 w-100 h-40 dark:bg-neutral-900
        rounded-md border border-black shadow-2xl shadow-neutral-900 flex flex-col justify-start items-center origin-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 `}>
            Enter a theme name
            <input id="theme_name_input" className="mt-2 rounded-md w-full outline-none ps-1 py-1 dark:bg-neutral-800 dark:text-neutral-200 "
            value={newThemeName} autoCorrect="off" autoComplete="off" autoCapitalize="off"
            onChange={(e)=>setNewThemeName(e.target.value)}/>
            <div className='mt-5 flex w-full justify-around items-center'>
                <button className='bg-[#f3553c] text-neutral-100 rounded md text-xs w-20 h-10'
                onClick={handleCreate}>
                    CREATE
                </button>
                <button className='dark:bg-neutral-200 text-black rounded md text-xs w-20 h-10'
                onClick={handleCancel}>
                    CANCEL
                </button>
            </div>
        </motion.div>
  )
}

export default NewThemeModal