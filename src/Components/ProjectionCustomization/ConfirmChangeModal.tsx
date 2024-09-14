
import { motion } from 'framer-motion';

type BookmarkModalProps = {
   display: Boolean
   setDisplay: Function,
   //b: BookmarkType | undefined,
   confirmChange: Function,
   cancelChange: Function,
}

export default function ConfirmChangeModal({display, setDisplay, confirmChange, cancelChange} : BookmarkModalProps){
   
    function handleDeleteClick(){
        confirmChange();
        setDisplay(false);
    }
    function handleCancelClicked(){
        cancelChange();
        setDisplay(false);
    }

    return (
        <motion.div initial={{opacity:0}} animate={{opacity: display ? 1 : 0, display: display ? "block" : "none"}} exit={{opacity:0}} className={`p-5 absolute z-10 w-80 h-fit dark:bg-neutral-800
        rounded-md border border-neutral-700 shadow-2xl shadow-neutral-900 text-neutral-500 text-xs flex flex-col justify-start items-center origin-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 `}>
            You have unsaved changes, are you sure you want to discard them?
            <div className='mt-3 text-base italic dark:text-neutral-300 text-center'>
            {/* {b?.book} {b?.chapter}:{b?.verseStart} */}
            </div>

            <div className='mt-5 flex w-full justify-around items-center gap-5'>
                <motion.button className='bg-neutral-200 text-[#f3553c] rounded md text-xs w-20 h-8'
                whileHover={{backgroundColor:"#f3553c", color:"#d4d4d4"}} animate={{backgroundColor:"#525252", color: "#d4d4d4"}}
                onClick={handleDeleteClick}>
                    CONFIRM
                </motion.button>
                <motion.button className='dark:bg-neutral-800 border border-neutral-700 text-neutral-400 rounded md text-xs w-20 h-8'
                whileHover={{backgroundColor: "#404040", color:"#d4d4d4"}}
                onClick={handleCancelClicked}>
                    CANCEL
                </motion.button>
            </div>
        </motion.div>
    )
}
