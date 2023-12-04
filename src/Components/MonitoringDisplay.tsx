import { useEffect, useState } from 'react'
import Verse from '../types/Verse'
import { listen } from '@tauri-apps/api/event'
import { DisplayVerseEvent } from './ProjectionDisplay'

type DisplayMonitorProps = {
    verseToDisplay : Verse | undefined
}


export type ProjectionConfiguration = {
    verseCount : number | 1,
    fontSize: number,
    translations: string[],

}

export default function DisplayMonitor({verseToDisplay} : DisplayMonitorProps){

    const [versesToDisplay, setVersesToDisplay] = useState<Verse[]>();
    const [translatedVerses, setTranslatedVerses] = useState<Verse[]>();
    const [config, setConfig] = useState<ProjectionConfiguration>({
        verseCount: 1,
        fontSize: "40px",
        translations: ["eng", "ro"]
    } as ProjectionConfiguration);

    useEffect(()=>{
        listen('display_verse', (event : DisplayVerseEvent) =>
        {   
            if(event){
                setVersesToDisplay((event.payload.eng as Verse[]));
                setTranslatedVerses(event.payload.ro as Verse[]);
            }
        });

        },[]);

    function renderVerses(){

        let verseStyling="text-[0.75rem] 2xl:text-[1.5rem] inline font-light w-full whitespace-break leading-tight";

        return (
                <>
                    <div className='flex flex-col justify-around items-start w-full h-full'>
                        <div>
                            {versesToDisplay?.map((verseToDisplay) =>
                            (
                                <p className={verseStyling}>
                                    <span className='text-[0.25rem] font-bold'>{verseToDisplay?.number}</span>
                                    {verseToDisplay?.text}
                                </p>
                                )
                            )}
                        </div>
                        <div>
                            {translatedVerses?.map((verseToDisplay) =>
                            (
                            <p className={verseStyling}>
                                <span className='text-[0.25rem] font-bold'>{verseToDisplay?.number}</span>
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
            <div className="font-bold text-[0.75rem] mt-5 mt-0">{versesToDisplay?.[0]?.book_name || "" }{" | " + translatedVerses?.[0]?.book_name || ""}{" "}{(versesToDisplay?.at(0)?.chapter) + ":" + (versesToDisplay?.at(0)?.number)}
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
        <div className="bg-white p-10 w-full h-1/2 flex flex-col justify-around items-center">
            <div className='w-full h-full flex flex-col justify-start items-end'>
                {renderVerses()}
                {renderMetadata()}
                    </div>
                </div>
        </>
        : <></>
    )

}
