import { motion, useAnimationControls } from "framer-motion"
import { useEffect, useState } from "react";
import { BookmarkType } from "./Bookmark/Bookmark";

type BookSelectionProps = {
    bookName: String,
    activeBookName: String,
    openBook: Function
}

export default function BookSelection({bookName, activeBookName, openBook} : BookSelectionProps){

    const controls = useAnimationControls();

    const anim = {
        backgroundColor: activeBookName === bookName ? "#404040" : "#262626",
        color: activeBookName === bookName ? "#fafafa" : "#a3a3a3"
    }

    const startHover = {
        color: activeBookName === bookName ? [] : ["#a3a3a3", "#d4d4d4"],
        transition:{duration:0.25}
    }

    const endHover = {
        color: activeBookName === bookName ? [] : ["#d4d4d4", "#a3a3a3"],
        transition:{duration:0.25}
    }

    useEffect(()=>{
        controls.start(anim);
    }, [activeBookName, bookName])

    return (
        <motion.div 
        initial={{}} animate={controls} onHoverStart={()=>controls.start(startHover)} onHoverEnd={()=>{controls.start(endHover)}}
        className={`ps-2 font-light text-sm w-full pe-8 whitespace-nowrap select-none cursor-default rounded-sm `}
        onClick={()=>{bookName.startsWith("Song") ? openBook("song", true) : openBook(bookName, true);
        controls.start({x:[0, 2.5, 0], transition:{duration:0.25}})}}
        >{bookName}</motion.div>
    )
}

//${activeBookName === bookName ? 'bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-50' : 'dark:bg-neutral-800 dark:text-neutral-400'}
