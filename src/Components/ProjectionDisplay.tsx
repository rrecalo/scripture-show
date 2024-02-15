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
                dyn_text.style.fontSize= `${config.fontSize}vw`;
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
            let verse_nums = document.getElementsByClassName("verse_num");
            if(verse_nums.length > 0){
                for(let i = 0; i < verse_nums.length; i++) {
                    verse_nums[i].style.fontWeight = `${config.verseNumberWeight}`;
                }
            }

            const sourceDiv = document.getElementById('verse_text');

            if(sourceDiv){
                //take the fontSize from config, and if the container is overflowing, do some big brain math
                //to reduce the fontSize and apply the newly calculated (smaller) fontSize
                //text only scales down!
                let newSize = config.fontSize
                const computedStyle = window.getComputedStyle(sourceDiv);
                const sourceHeight = parseFloat(computedStyle.height);

                if (sourceDiv.scrollHeight + 25 > sourceHeight) {

                    newSize *= sourceHeight / (sourceDiv.scrollHeight + 25);

                    if(dyn_text){
                        dyn_text.style.fontSize= `${newSize}vw`;
                    }
                }
            }
        }
        
    },[config, versesToDisplay]);

    function renderVerses(){
        let verseStyling=`inline w-full whitespace-break leading-tight`;
        let verseNumStyling='text-[1rem] 2xl:text-[1.25rem] verse_num';

        return (
                <>
                    <div id="verse_text" className='flex flex-col justify-around items-start w-full h-[90%] max-h-[90%] gap-5'> 
                        {
                        config?.translations.includes("esv") ?
                        <div id="esv_text">
                            {versesToDisplay?.map((verseToDisplay) =>
                            (
                                <p key={verseToDisplay.number} className={verseStyling}>
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
                        <div id="ro_text">
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
            <div id="verse_info" className="text-[2.5vw] mt-0 h-[50px] pe-5">{eng_book_name || "" }
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
        <div id="container" className={`inter p-5 flex flex-col justify-between items-center w-screen aspect-video h-full overflow-clip ${audience ? 'h-screen' : ''}`} onMouseOver={()=>{setMouseInWindow(true)}} 
        onMouseOut={()=>{setMouseInWindow(false)}}>
            <div id="dynamic_text" className={`w-full h-full max-h-full flex flex-col justify-between items-end py-1`}>
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
