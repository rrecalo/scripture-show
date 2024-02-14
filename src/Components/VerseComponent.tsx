import Verse from '../types/Verse';


type VerseComponentProps = {
    verse : Verse,
    selectVerse : Function,
    selectedVerse : Verse | undefined,
}

export default function VerseComponent({verse, selectVerse, selectedVerse} : VerseComponentProps){


    return (
        <div className={`${verse?.text === selectedVerse?.text ? 'bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-50' : 'dark:bg-neutral-900 dark:text-neutral-400'} select-none cursor-default flex flex-row justify-start items-center text-black rounded-md`} onClick={()=>selectVerse(verse)}>
           <div className='w-1/12 max-w-[35px] border-black dark:border-neutral-700 border-r h-full flex justify-center items-center'>
                <div className='w-1/2 h-1/2 flex justify-center items-center text-sm'>
                {verse.number}
                </div>
            </div>
            <div className='w-11/12 ps-2 py-0.5 text-base'>
            {verse.text}
            </div>
        </div>
    )

}
