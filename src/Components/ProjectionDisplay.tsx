import { useEffect, useState } from 'react'
import Verse from '../types/Verse'
import { listen, emit } from '@tauri-apps/api/event'
import { ProjectionConfiguration } from './MonitoringDisplay'

export type DisplayVerseEvent = {
    payload: {
        eng: Verse[],
        ro: Verse[]
    }
}

export type ProjectionFormatEvent = {
    payload: ProjectionConfiguration
}

export default function Monitor(){

    const [versesToDisplay, setVersesToDisplay] = useState<Verse[]>();
    const [translatedVerses, setTranslatedVerses] = useState<Verse[]>();
    const [config, setConfig] = useState<ProjectionConfiguration>();

    useEffect(()=>{
        const unlisten_verses = listen('display_verse', (event : DisplayVerseEvent) => {   
            if(event){ 
                setVersesToDisplay(event.payload.eng as Verse[]);
                setTranslatedVerses(event.payload.ro as Verse[]);
            }
        });

        const unlisten_format = listen('projection_format', (event: ProjectionFormatEvent) => {
            if(event){
                setConfig(event.payload);
            }
        });
        emit('request_format');
        emit('request_verses');
        return ()=>{
            unlisten_verses.then(f => f());
            unlisten_format.then(f => f());
        }
    },[]);

    useEffect(()=>{
        if(config){
            let dyn_text = document.getElementById("dynamic_text");
            if(dyn_text){
                dyn_text.style.fontSize= `${config.fontSize}px`;
            }
        }
    },[config]);
    
    function renderVerses(){
        let verseStyling=`inline font-light w-full whitespace-break leading-tight`;
        let verseNumStyling='text-[0.25rem] 2xl:text-[1.25rem] font-bold';

        return (
                <>
                    <div className='flex flex-col justify-around items-start w-full h-full'> 
                        {
                        config.translations.includes("esv") ?
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
                        : <></>
                        }
                        {
                        config?.translations.includes("ro") ?
                        <div>
                            {translatedVerses?.map((verseToDisplay) =>
                            (
                            <p className={verseStyling}>
                                <span className={verseNumStyling}>{verseToDisplay?.number}</span>
                                {verseToDisplay?.text}
                            </p>)
                            )}
                        </div>
                        : <></>
                        }
                    </div>
                </>
        ) 
        
    }
    function renderMetadata(){
        
        let eng_book_name = config?.translations.includes("esv") ? versesToDisplay?.[0]?.book_name : ""; 
        let ro_book_name = config?.translations.includes("ro") ? translatedVerses?.[0]?.book_name : "";

        if(versesToDisplay){
        return (
            <div className="font-bold text-[1rem] 2xl:text-[2.5rem] mt-0">{eng_book_name || "" }
            {config?.translations.length == 1 ? "" : " | "}
            {ro_book_name}{" "}{config?.translations.length == 2 ? " " : " | "}
            {(versesToDisplay?.at(0)?.chapter) + ":" + (versesToDisplay?.at(0)?.number)}
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
        <div className="bg-white p-10 w-screen h-screen flex flex-col justify-around items-center">
            <div id="dynamic_text" className={`w-full h-full flex flex-col justify-start items-end`}>
                {renderVerses()}
                {renderMetadata()}
            </div>
        </div>
    )
}
