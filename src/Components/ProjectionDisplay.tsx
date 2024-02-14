import { useEffect, useState } from 'react'
import Verse from '../types/Verse'
import { listen, emit } from '@tauri-apps/api/event'
import { getCurrent } from '@tauri-apps/api/window'
import ProjectionConfiguration from '../types/ProjectionConfiguration'
import { DisplayVerseEvent } from '../types/ProjectionConfiguration'
import { ProjectionFormatEvent } from '../types/ProjectionConfiguration'
import { appWindow } from '@tauri-apps/api/window'

type MonitorProps = {
    audience: boolean
}

export default function Monitor({audience} : MonitorProps) {

    const [versesToDisplay, setVersesToDisplay] = useState<Verse[]>();
    const [translatedVerses, setTranslatedVerses] = useState<Verse[]>();
    const [config, setConfig] = useState<ProjectionConfiguration>();
    const [mouseInWindow, setMouseInWindow] = useState<boolean>(false);

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

    useEffect(() =>{
        if(mouseInWindow) {
            const mouseTimeout = setTimeout(() => {
                setMouseInWindow(false);
            }, 2000);
            return ()=>{clearInterval(mouseTimeout);};
        }
    }, [mouseInWindow]);

    useEffect(()=>{
        if(config){
            let dyn_text = document.getElementById("dynamic_text");
            if(dyn_text){
                dyn_text.style.fontSize= `${config.fontSize}px`;
                dyn_text.style.color = `${config.textColor}`;
                dyn_text.style.fontWeight = `${config.verseInfoWeight}`;
            }
            let container = document.getElementById("container");
            if(container){
                container.style.backgroundColor = `${config.bgColor}`;
            }
            let verse_text = document.getElementById("verse_text");
            if(verse_text){
                verse_text.style.fontWeight = `${config.verseTextWeight}`;
            }
            let verse_num = document.getElementById("verse_num");
            if(verse_num){
                verse_num.style.fontWeight = `${config.verseNumberWeight}`;
            }
        }
    },[config]);    
    function renderVerses(){
        let verseStyling=`inline w-full whitespace-break leading-tight`;
        let verseNumStyling='text-[1rem] 2xl:text-[1.25rem]';

        return (
                <>
                    <div id="verse_text" className='flex flex-col justify-around items-start w-full h-full'> 
                        {
                        config?.translations.includes("esv") ?
                        <div>
                            {versesToDisplay?.map((verseToDisplay) =>
                            (
                                <p key={verseToDisplay.number} className={verseStyling}>
                                    <span id="verse_num" className={verseNumStyling}>{verseToDisplay?.number}</span>
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
                            <p key={verseToDisplay.number} className={verseStyling}>
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
            <div className="text-[1.5rem] 2xl:text-[2.5rem] mt-0">{eng_book_name || "" }
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

    function closeWindow(){
        let currentWindow = getCurrent();
        currentWindow.close();
    }


        return (
        <div id="container" className={`inter p-[2.5%] flex flex-col justify-around items-center w-screen h-screen`} onMouseOver={()=>{setMouseInWindow(true)}} 
        onMouseOut={()=>{setMouseInWindow(false)}}>
            <div id="dynamic_text" className={`w-full h-full flex flex-col justify-start items-end`}>
                {renderVerses()}
                {renderMetadata()}
                
            </div>
            { audience && mouseInWindow ?
                <div onClick={closeWindow} className='left-20 bottom-14 absolute px-8 py-4 bg-neutral-50 rounded-2xl text-neutral-800 font-bold text-lg text-center opacity-50'>close</div>
                : <></>
            }
        </div>
    )
}
