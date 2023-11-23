import { useEffect } from 'react'
import Verse from '../types/Verse'

type DisplayMonitorProps = {
    verseToDisplay : Verse
}

export default function DisplayMonitor({verseToDisplay} : DisplayMonitorProps){

    useEffect(()=>{
        console.log(verseToDisplay);
        },[verseToDisplay]);

    return (
        verseToDisplay ? 
        <>
        <div className="p-3">
            <div id="display" className="text-2xl">{verseToDisplay?.text}</div>
            <div className="font-bold text-sm">{verseToDisplay?.book_name || ""} 
            {" "}{(verseToDisplay?.chapter) + ":" + (verseToDisplay?.number)}</div>
        </div>
        </>
        : <></>
    )
}
