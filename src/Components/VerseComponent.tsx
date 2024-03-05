import { motion } from 'framer-motion';
import Verse from '../types/Verse';

type VerseComponentProps = {
    verse : Verse,
    selectVerse : Function,
    selectedVerse : Verse | undefined,
    id? : string,
}

export default function VerseComponent({verse, selectVerse, selectedVerse, id} : VerseComponentProps){

    const selectedAnim = {
        color: "#f3553c",
        backgroundColor:"#262626",
    }

    const unselectedAnim = {
        color: "#a3a3a3",
        backgroundColor:"#171717",
    }
    
    const unselectedHover = {
        color: ["#a3a3a3", "#d4d4d4"],
        transition:{duration:0.25}
    }

    return (
        <motion.div id={id} initial={{}} animate={verse.text === selectedVerse?.text ? selectedAnim : unselectedAnim} 
        whileHover={verse.text === selectedVerse?.text ? {} : unselectedHover}
        className={` py-2 font-light select-none cursor-default flex flex-row justify-start items-center text-black`} onClick={()=>selectVerse(verse)}>
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
