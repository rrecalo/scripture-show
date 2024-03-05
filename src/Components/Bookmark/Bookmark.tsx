import { emit } from '@tauri-apps/api/event';
import { motion, useAnimationControls } from 'framer-motion';
import { useState } from 'react';
import {AiOutlineDelete} from 'react-icons/ai';


export type BookmarkType = {
    id: string,
    book: String,
    chapter: number,
    verseStart: number,
}

type BookmarkProps = {
    bookmark: BookmarkType,
    selectBookmark: Function,
    deleteBookmark: Function,

}

export default function Bookmark({bookmark, selectBookmark, deleteBookmark} : BookmarkProps){

    const [isHover, setHover] = useState<boolean>(false);
    const controls = useAnimationControls();

    const hoverBookmark = {
        color: ["#a3a3a3", "#d4d4d4"],
        transition:{duration:0.25}
    }

    const endHover = {
        color: ["#d4d4d4", "#a3a3a3"],
        transition:{duration:0.25}
    }

    function handleClick(e: any, bookmark : BookmarkType){
        controls.start({x:[0, 5, 0], transition:{duration:0.25}})
        selectBookmark(e, bookmark);
        emit("search_result", {book: bookmark.book, chapter: bookmark.chapter, verseStart: bookmark.verseStart});
    }

    return(
        <motion.div onClick={(e:any) => handleClick(e, bookmark)} onMouseOver={()=>{setHover(true);}} onMouseOut={()=>setHover(false)}
        animate={controls}  onHoverStart={()=>controls.start(hoverBookmark)} onHoverEnd={()=>{controls.start(endHover)}}
        className={`flex justify-between items-baseline ps-1 font-light text-sm w-full pe-4 whitespace-nowrap select-none cursor-default text-neutral-400 overflow-y-clip`}>
            {bookmark.book + " " + bookmark.chapter+":"+bookmark.verseStart}
            <motion.div className="w-3 h-3 text-[#f3553c] overflow-y-clip" initial={{opacity:0}} animate={{ opacity: isHover ? 1 : 0}} transition={{duration:0.25}}
            >
                <AiOutlineDelete className="overflow-clip" onClick={(e: MouseEvent) => deleteBookmark(e, bookmark)}/>
            </motion.div>
        </motion.div>
    )

}
