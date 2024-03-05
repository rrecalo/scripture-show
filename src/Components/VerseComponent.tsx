import { motion, useAnimationControls } from 'framer-motion';
import Verse from '../types/Verse';

type VerseComponentProps = {
    verse : Verse,
    selectVerse : Function,
    selectedVerse : Verse | undefined,
    id? : string,
}

export default function VerseComponent({verse, selectVerse, selectedVerse, id} : VerseComponentProps){

    const controls = useAnimationControls();

    const startHover = {
        color: selectedVerse === verse ? [] : ["#a3a3a3", "#d4d4d4"],
        transition:{duration:0.25}
    }

    const endHover = {
        color: selectedVerse === verse ? [] : ["#d4d4d4", "#a3a3a3"],
        transition:{duration:0.25}
    }

    return (
        <motion.div id={id} initial={{}} animate={controls} onHoverStart={()=>controls.start(startHover)} onHoverEnd={()=>{controls.start(endHover)}} className={`${verse?.text === selectedVerse?.text ? 'bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-50' : 'dark:bg-neutral-900 dark:text-neutral-400'} py-2 font-light select-none cursor-default flex flex-row justify-start items-center text-black`} onClick={()=>selectVerse(verse)}>
           <div className='w-1/12 max-w-[35px] border-black dark:border-neutral-700 border-r h-full flex justify-center items-center'>
                <div className='w-1/2 h-1/2 flex justify-center items-center text-sm'>
                {verse.number}
                </div>
            </div>
            <div className='w-11/12 px-2 text-sm'>
            {verse.text}
            </div>
        </motion.div>
    )

}
