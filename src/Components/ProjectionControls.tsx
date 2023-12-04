import { ProjectionConfiguration } from "./MonitoringDisplay";
import { useState, useEffect } from "react";

type ProjectionControlsProps = {
    config: ProjectionConfiguration,
    setConfig: Function
}

export default function ProjectionControls({config, setConfig} : ProjectionControlsProps){

    const [translationCountWarning, setTranslationCountWarning] = useState<boolean>(false);
    const [fontLimitWarning, setFontLimitWarning] = useState<boolean>(false);
    const [verseLimitWarning, setVerseLimitWarning] = useState<boolean>(false);
    const fontLowerLimit = 20;
    const fontUpperLimit = 80;

    useEffect(()=>{
        if(translationCountWarning){
            const disableWarning = setTimeout(()=>{
               setTranslationCountWarning(false);
            }, 1000);
            return () => {clearInterval(disableWarning)};
        }
    }, [translationCountWarning]);

    useEffect(()=>{
        if(fontLimitWarning){
            const disableWarning = setTimeout(()=>{
                setFontLimitWarning(false);
            }, 1000);
            return () => {clearInterval(disableWarning)};
        }
    }, [fontLimitWarning]);

    useEffect(()=>{
        if(verseLimitWarning){
            const disableWarning = setTimeout(()=>{
                setVerseLimitWarning(false);
            }, 1000);
            return () => {clearInterval(disableWarning)};
        }
    }, [verseLimitWarning]);

    function handleToggleTranslation(translation: string){
        if(config.translations.length == 1 && config.translations.includes(translation)){
            setTranslationCountWarning(true);
            return;
        }
        else setTranslationCountWarning(false);
        if(config.translations.includes(translation)){
            setConfig({...config, translations: config.translations.filter(t => t !== translation)});
        }
        else {
            setConfig({...config, translations: [...config.translations, translation]});
        }
    }

    function changeVerseCount(change: number){
        if((config.verseCount == 1 && change == -1) || (config.verseCount == 3 && change == 1)){
            setVerseLimitWarning(true);
            return;
        }
        else if(config.verseCount >= 1 && config.verseCount < 3){
            setConfig({...config, verseCount: config.verseCount + change});
        }
        else if(config.verseCount == 3 && change == -1){
            setConfig({...config, verseCount: config.verseCount + change});
        }
        
    }

    function changeFontSize(change: number){
        if((config.fontSize <= fontLowerLimit && change < 0) || (config.fontSize == fontUpperLimit && change > 1)){
            setFontLimitWarning(true);
            return;
        }
        else if(config.fontSize >= fontLowerLimit && config.fontSize < fontUpperLimit){
            setConfig({...config, fontSize: config.fontSize+change});
        }
        else if(config.fontSize == fontUpperLimit && change < 0){
            setConfig({...config, fontSize: config.fontSize+change}); 
        }
    }

    return (
        <div className="flex flex-col w-full h-full justify-start items-start select-none">
            <div className="flex flex-col justify-start items-start w-full">
            <div className="flex flex-row justify-start items-center dark:text-neutral-100 pe-5">
            <div className="pe-2">
            Verse Count 
            </div>
                <div className="flex flex-row justify-between items-center gap-1">
                 <button className="font-bold p-1.5" onClick={()=> changeVerseCount(-1)}>-</button>
                 <div className="dark:bg-neutral-950 dark:text-neutral-50 px-2.5">{config.verseCount}</div>
                 <button className="font-bold p-1.5" onClick={()=> changeVerseCount(1)}>+</button>
                </div>
                {
                    verseLimitWarning ? 
                    <div className="text-red-500 text-xs font-light">Limit reached</div>
                    :<></>
                }
            </div>
            <div className="flex flex-row justify-start items-center dark:text-neutral-100 pe-5">
            <div className="pe-2">
            Font Size
            </div>
                <div className="flex flex-row justify-between items-center gap-1">
                 <button className="font-bold p-1.5" onClick={()=> changeFontSize(-4)}>-</button>
                 <div className="dark:bg-neutral-950 dark:text-neutral-50 px-2.5">{config.fontSize+"px"}</div>
                 <button className="font-bold p-1.5" onClick={()=> changeFontSize(4)}>+</button>
                </div>
                {
                    fontLimitWarning ? 
                    <div className="text-red-500 text-xs font-light">Limit reached</div>
                    :<></>
                }
            </div>

            <div className="flex justify-start items-center">
            <div className="flex flex-col justify-center items-start gap-2">
                <div className="flex justify-center items-center">
                <input className="w-4 h-4 accent-blue-600" type="checkbox" value="esv" checked={config.translations.includes("esv")}
                onChange={()=> handleToggleTranslation("esv")}/>
                <label className="ps-2 dark:text-neutral-100">ESV</label>
                </div>
                <div className="flex justify-center items-center">
                <input className="w-4 h-4 accent-blue-600" type="checkbox" value="ro" checked={config.translations.includes("ro")}
                onChange={()=> handleToggleTranslation("ro")}/>
                <label className="ps-2 dark:text-neutral-100">RO</label>
                </div>
            </div>
            {
                translationCountWarning ?
            <div className="text-red-500 text-xs font-light">
                1 Translation needed
            </div>
            : <></>
            }
            </div>

            </div>
        </div>
    )
}
