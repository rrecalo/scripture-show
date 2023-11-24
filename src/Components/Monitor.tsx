import { useEffect, useState } from 'react'
import Verse from '../types/Verse'
import { listen} from '@tauri-apps/api/event'

type MonitorProps = {
    versesToDisplay : Verse
}

export default function Monitor(){

    const [versesToDisplay, setVersesToDisplay] = useState<Verse[]>();
    const [translatedVerses, setTranslatedVerses] = useState<Verse[]>();

    useEffect(()=>{
        console.log(versesToDisplay);
        },[versesToDisplay]);
    
    useEffect(()=>{
        listen('display_verse', (event) =>
        {   
            setVersesToDisplay(event?.payload?.eng as Verse[]);
            setTranslatedVerses(event?.payload?.ro as Verse[]);
        });
    },[]);
    
    
        return (
        versesToDisplay ? 
        <>
        <div className="p-10 w-full h-[100vh] flex flex-col justify-around items-center">
            <div className=''>
                {versesToDisplay.map(verseToDisplay => (
                <>
                <p className="text-6xl inline pe-6">
                    <span className='text-xs font-light'>{verseToDisplay?.number}</span>
                    {verseToDisplay?.text}</p>
                </>
                ))}
                <div className="font-bold text-lg mt-5">{versesToDisplay?.at(0)?.book_name || "" }{" "}{(versesToDisplay?.at(0)?.chapter) + ":" + (versesToDisplay?.at(0)?.number)}
                {versesToDisplay.at(versesToDisplay.length-1) ?
                <>
                {"-"}{versesToDisplay?.at(versesToDisplay.length-1)?.number}
                </>
                 : <></>
                }
                </div>
            </div>
            <div className=''>
                {translatedVerses?.map(verseToDisplay => (
                <>
                <p className="text-6xl inline pe-6">
                    <span className='text-xs font-light'>{verseToDisplay?.number}</span>
                    {verseToDisplay?.text}</p>
                </>
                ))}
                <div className="font-bold text-lg mt-5">{translatedVerses?.at(0)?.book_name || "" }{" "}{(translatedVerses?.at(0)?.chapter) + ":" + (translatedVerses?.at(0)?.number)}
                {translatedVerses?.at(translatedVerses.length-1) ?
                <>
                {"-"}{translatedVerses?.at(translatedVerses.length-1)?.number}
                </>
                 : <></>
                }
                </div>
            </div>
        </div>
        </>
        : <></>
    )
}
