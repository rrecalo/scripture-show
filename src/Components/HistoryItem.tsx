import { useAnimationControls, motion } from 'framer-motion';
import React, { Key, useState } from 'react'
import { HistoryItemType, uniqueHistoryString } from './VerseHistory';

type Props = {
    selectHistoryItem: Function,
    item: HistoryItemType,
}

function HistoryItem({selectHistoryItem, item} : Props) {

    const controls = useAnimationControls();

    const hoverBookmark = {
        color: ["#a3a3a3", "#d4d4d4"],
        transition:{duration:0.25}
    }

    const endHover = {
        color: ["#d4d4d4", "#a3a3a3"],
        transition:{duration:0.25}
    }
  return (
    <motion.div 
    animate={controls}  onHoverStart={()=>controls.start(hoverBookmark)} onHoverEnd={()=>{controls.start(endHover)}}
    onClick={()=>selectHistoryItem(item)} key={uniqueHistoryString(item) as Key} layout layoutId={uniqueHistoryString(item)}
    className='ps-1 font-light text-sm w-full pe-4 whitespace-nowrap select-none cursor-default text-neutral-400 overflow-y-auto h-full overflow-x-hidden'
    >
        {item.book} {item.chapter}:{item.verseStart}
    </motion.div>
  )
}

export default HistoryItem