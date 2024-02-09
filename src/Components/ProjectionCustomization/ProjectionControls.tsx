import { HexColorPicker } from "react-colorful";
import ProjectionConfiguration from "../../types/ProjectionConfiguration";
import { useState, useEffect } from "react";
import ReactSlider from 'react-slider';
import "./styles.css";

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
        if(config?.translations.length == 1 && config?.translations.includes(translation)){
            setTranslationCountWarning(true);
            return;
        }
        else setTranslationCountWarning(false);
        if(config?.translations.includes(translation)){
            setConfig({...config, translations: config?.translations.filter(t => t !== translation)});
        }
        else {
            setConfig({...config, translations: [...config.translations, translation]});
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

    function handleBgColorChange(e:any){
        setConfig({...config, bgColor: e});
    }

    function handleTextColorChange(e:any){
        setConfig({...config, textColor: e});
    }

    function handleVerseTextWeightChange(e:any){
        setConfig({...config, verseTextWeight: e});
    }

    function handleVerseNumberWeightChange(e:any){
        setConfig({...config, verseNumberWeight: e});
    }

    function handleVerseInfoWeightChange(e:any){
        setConfig({...config, verseInfoWeight: e});
    }

    return (
        <div className="flex flex-row w-full h-full justify-start items-start select-none">
            


            <div className="flex flex-col justify-start items-start w-full">

                <div className="dark:text-neutral-50 w-full flex justify-start items-center gap-5 h-[30px]">
                    <div className="w-1/2 h-1/2 dark:text-neutral-400">
                        Verse Font Weight                     
                    </div>
                    <div className="dark:text-neutral-50">
                        {config?.verseTextWeight}
                    </div>

                    <div className="w-1/2 h-1/2 dark:text-black">
                    <ReactSlider
                        marks min={1} max={9}
                        value={config?.verseTextWeight/100}
                        onChange={(e)=>handleVerseTextWeightChange(e*100)}
                        className="customSlider" 
                        thumbClassName="customSlider-thumb"
                        trackClassName="customSlider-track"
                        markClassName="customSlider-mark"
                        renderThumb={(props) => <div {...props}>
                        <div className="slider-value">
                        </div>
                        </div>}
                    />
                    </div>
                </div>
                
                <div className="dark:text-neutral-50 w-full flex justify-start items-center gap-5 h-[30px]">
                    <div className="w-1/2 h-1/2 dark:text-neutral-400">
                        Verse Number Weight
                    </div>
                    <div className="dark:text-neutral-50">
                        {config?.verseNumberWeight}
                    </div>

                    <div className="w-1/2 h-1/2 dark:text-black">
                    <ReactSlider
                        marks min={1} max={9}
                        value={config?.verseNumberWeight/100}
                        onChange={(e)=>handleVerseNumberWeightChange(e*100)}
                        className="customSlider" 
                        thumbClassName="customSlider-thumb"
                        trackClassName="customSlider-track"
                        markClassName="customSlider-mark"
                        renderThumb={(props) => <div {...props}>
                        <div className="slider-value">
                        </div>
                        </div>}
                    />
                    </div>
                </div>
                
                <div className="dark:text-neutral-50 w-full flex justify-start items-center gap-5 h-[30px]">
                    <div className="w-1/2 h-1/2 dark:text-neutral-400">
                        Verse Info Weight
                    </div>
                    <div className="dark:text-neutral-50">
                        {config?.verseInfoWeight}
                    </div>

                    <div className="w-1/2 h-1/2 dark:text-black">
                    <ReactSlider
                        marks min={1} max={9}
                        value={config?.verseInfoWeight/100}
                        onChange={(e)=>handleVerseInfoWeightChange(e*100)}
                        className="customSlider" 
                        thumbClassName="customSlider-thumb"
                        trackClassName="customSlider-track"
                        markClassName="customSlider-mark"
                        renderThumb={(props) => <div {...props}>
                        <div className="slider-value">
                        </div>
                        </div>}
                    />
                    </div>
                </div>
 

                <div className="flex flex-row justify-start items-center dark:text-neutral-100 pe-5">
                    <div className="pe-2 font-light">
                        Font Size
                    </div>

                    <div className="flex flex-row justify-between items-center gap-1">
                        <button className="font-bold p-1.5" onClick={()=> changeFontSize(-4)}>-</button>
                        <div className="dark:bg-neutral-950 dark:text-neutral-50 px-2.5">
                            {config?.fontSize+"px"}
                        </div>
                        <button className="font-bold p-1.5" onClick={()=> changeFontSize(4)}>+</button>        
                    </div>

                    {
                        fontLimitWarning ? 
                        <div className="text-red-500 text-xs font-light">Limit reached</div>
                        :<></>
                    }
                </div>

                <div className="flex justify-start items-center font-light">
                <div className="flex flex-col justify-center items-start gap-2">
                    <div className="flex justify-center items-center">
                    <input className="w-4 h-4 accent-blue-600" type="checkbox" value="esv" checked={config?.translations?.includes("esv")}
                    onChange={()=> handleToggleTranslation("esv")}/>
                    <label className="ps-2 dark:text-neutral-100">ESV</label>
                    </div>
                    <div className="flex justify-center items-center">
                    <input className="w-4 h-4 accent-blue-600" type="checkbox" value="ro" checked={config?.translations?.includes("ro")}
                    onChange={()=> handleToggleTranslation("ro")}/>
                    <label className="ps-2 dark:text-neutral-100">RO</label>
                    </div>
                </div>
                {
                    translationCountWarning ?
                <div className="text-red-500 text-xs font-light pl-3">
                    1 version needed
                </div>
                : <></>
                }
                </div>

            </div>
                
            <div className="flex justify-betwen items-center w-full h-full gap-5 px-2">
            <div className="w-1/2 color_picker">
                <div className="dark:text-neutral-200 mb-1">Background Color</div>
                <input className="rounded-md w-full mb-3 text-base outline-none px-1 py-1 h-full dark:bg-neutral-800 dark:text-neutral-200" autoComplete="off"
                value={config?.bgColor} onChange={(e)=>handleBgColorChange(e.target.value)}/>
                <HexColorPicker className="" color={config?.bgColor} onChange={handleBgColorChange} />
            </div>
            
            <div className="w-1/2 color_picker">
                <div className="dark:text-neutral-200 mb-1">Text Color</div>
                <input className="rounded-md w-full mb-3 text-base outline-none px-1 py-1 h-full dark:bg-neutral-800 dark:text-neutral-200" autoComplete="off"
                value={config?.textColor} onChange={(e)=>handleTextColorChange(e.target.value)}/>
                <HexColorPicker className="" color={config?.textColor} onChange={handleTextColorChange} />
            </div>
            </div>

        </div>
    )
}
