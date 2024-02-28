
import { motion } from 'framer-motion';
import { CustomScreen } from './ChooseMonitor';

type BookmarkModalProps = {
    shown: Boolean,
    s: CustomScreen | undefined,
    deleteScreen: Function,
    clearDeleteSelection: Function,
}

export default function ConfirmScreenDeletionModal({shown, s, deleteScreen, clearDeleteSelection} : BookmarkModalProps){
   
    function handleDelete(){
        deleteScreen(s?.customName);
    }
    function handleCancel(){
        clearDeleteSelection();
    }

    return (

        <motion.div initial={{opacity:0}} animate={{opacity: shown ? 1 : 0, display: shown ? 'block' : 'none'}} className={`p-5 absolute z-10 w-100 h-40 dark:bg-neutral-800
        rounded-md border border-neutral-700 shadow-2xl shadow-neutral-900 text-neutral-500 text-xs flex flex-col justify-start items-center origin-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 `}>
            Are you sure you want to delete this screen?
            <div className='mt-3 text-base italic dark:text-neutral-300 text-center'>
                {s?.customName} <span className='text-neutral-500 font-light text-xs ml-1'>{s?.screen.name}</span>
            </div>

            <div className='mt-5 flex w-full justify-around items-center gap-5'>
                <motion.button className='bg-neutral-200 text-[#f3553c] rounded md text-xs w-20 h-8'
                whileHover={{backgroundColor:"#f3553c", color:"#d4d4d4"}} animate={{backgroundColor:"#525252", color: "#d4d4d4"}}
                onClick={handleDelete}>
                    CONFIRM
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
