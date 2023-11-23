import { useEffect, useState } from 'react'
import Verse from '../types/Verse'
import { listen} from '@tauri-apps/api/event'

type MonitorProps = {
    verseToDisplay : Verse
}

export default function Monitor(){

    const [verseToDisplay, setVerseToDisplay] = useState<Verse>();

    useEffect(()=>{
        console.log(verseToDisplay);
        },[verseToDisplay]);
    
    useEffect(()=>{
        listen('display_verse', (event) =>
        {   
            setVerseToDisplay(event.payload as Verse);
        });
    },[]);
    
    
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
