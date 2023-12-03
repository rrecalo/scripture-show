import { useEffect, useState } from 'react'
import Verse from '../types/Verse'
import { listen} from '@tauri-apps/api/event'

export type DisplayVerseEvent = {
    payload: {
        eng: Verse[],
        ro: Verse[]
    }
}

export default function Monitor(){

    const [versesToDisplay, setVersesToDisplay] = useState<Verse[]>();
    const [translatedVerses, setTranslatedVerses] = useState<Verse[]>();

    useEffect(()=>{
        console.log(versesToDisplay);
        },[versesToDisplay]);
    
    useEffect(()=>{
        listen('display_verse', (event : DisplayVerseEvent) =>
        {   
            if(event){
                setVersesToDisplay(event.payload.eng as Verse[]);
                setTranslatedVerses(event.payload.ro as Verse[]);
            }
        });
    },[]);
    
    function renderVerses(){

        let verseStyling="text-[3rem] 2xl:text-[4rem] 2xl:text-[68px] inline font-light w-full whitespace-break leading-tight";
        let verseNumStyling='text-[0.25rem] 2xl:text-[1.25rem] font-bold';

        return (
                <>
                    <div className='flex flex-col justify-around items-start w-full h-full'>
                        <div>
                            {versesToDisplay?.map((verseToDisplay) =>
                            (
                                <p className={verseStyling}>
                                    <span className={verseNumStyling}>{verseToDisplay?.number}</span>
                                    {verseToDisplay?.text}
                                </p>
                                )
                            )}
                        </div>
                        <div>
                            {translatedVerses?.map((verseToDisplay) =>
                            (
                            <p className={verseStyling}>
                                <span className={verseNumStyling}>{verseToDisplay?.number}</span>
                                {verseToDisplay?.text}
                            </p>)
                            )}
                        </div>
                    </div>
                </>
        ) 
        
    }
    function renderMetadata(){
        
        if(versesToDisplay){
        return (
            <div className="font-bold text-[1rem] 2xl:text-[2.5rem] mt-0">{versesToDisplay?.[0]?.book_name || "" }{" | " + translatedVerses?.[0]?.book_name || ""}{" "}{(versesToDisplay?.at(0)?.chapter) + ":" + (versesToDisplay?.at(0)?.number)}
                {versesToDisplay?.[versesToDisplay.length-1] ?
                <>
                {
                versesToDisplay.length > 1 ?
                "-"+versesToDisplay?.[versesToDisplay.length-1]?.number
                : ""
                }
                </>
                 : <></>
                }
            </div>
        )
        }

    }
        return (
        versesToDisplay ? 
        <>
        <div className="bg-white p-10 w-screen h-screen flex flex-col justify-around items-center">
            <div className='w-full h-full flex flex-col justify-start items-end'>
                {renderVerses()}
                {renderMetadata()}
            </div>
        </div>
        </>
        : <></>

    )
}
