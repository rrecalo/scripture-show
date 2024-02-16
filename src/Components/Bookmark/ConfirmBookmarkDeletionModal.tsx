
import { motion } from 'framer-motion';
import {BookmarkType} from './Bookmark';

type BookmarkModalProps = {
   display: Boolean
   setDisplay: Function,
   b: BookmarkType | undefined,
   deleteBookmark: Function,
}

export default function ConfirmBookmarkDeletionModal({display, setDisplay, b, deleteBookmark} : BookmarkModalProps){
   
    function handleDeleteClick(){
        deleteBookmark(b);
    }
    function cancelClicked(){
        setDisplay(false);
    }

    return (
        <motion.div initial={{opacity:0, y:10}} animate={{opacity: display ? 1 : 0, y:0}} exit={{opacity:0}} className={`p-5 text-sm text-neutral-300 absolute z-10 w-100 h-40 dark:bg-neutral-900
        rounded-md border border-black shadow-2xl shadow-neutral-900 flex flex-col justify-start items-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 `}>
            Are you sure you want to delete this bookmark?
            <div className='mt-3 text-base italic dark:text-neutral-300'>
            {b?.book} {b?.chapter}:{b?.verseStart}-{b?.verseEnd}
            </div>

            <div className='mt-5 flex w-full justify-around items-center'>
                <button className='bg-[#f3553c] text-neutral-100 rounded md text-xs w-20 h-10'
                onClick={handleDeleteClick}>
                    CONFIRM
                </button>
                <button className='dark:bg-neutral-200 text-black rounded md text-xs w-20 h-10'
                onClick={cancelClicked}>
                    CANCEL
                </button>
            </div>
        </motion.div>
    )
}
