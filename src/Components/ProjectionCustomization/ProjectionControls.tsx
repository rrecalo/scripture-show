import { HexColorPicker } from "react-colorful";
import ProjectionConfiguration from "../../types/ProjectionConfiguration";
import { useState, useEffect } from "react";
import ReactSlider from 'react-slider';
import "./styles.css";
import { readDir, BaseDirectory, readBinaryFile } from "@tauri-apps/api/fs";
import { ThemeDir } from "./ProjectionCustomization";
import { MdArrowDropDown, MdArrowRight } from "react-icons/md";
import NewThemeModal from "./NewThemeModal";
import { emit, listen } from '@tauri-apps/api/event';

type ProjectionControlsProps = {
    config: ProjectionConfiguration,
    setConfig: Function,
    //0 = save, 1 = load, 2 = clear/delete
    themeFunctions: Function[]
}
type Theme = { 
    name: string,
    theme: ProjectionConfiguration,
    lastUsed: boolean,
}

export default function ProjectionControls({config, setConfig, themeFunctions} : ProjectionControlsProps){
    
    const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);
    const [newThemeName, setNewThemeName] = useState<string>("");
    const [hideModal, setHideModal] = useState<boolean>(true); 
    const [lastTheme, setLastTheme] = useState<string>(); 
    const [themes, setThemes] = useState<Theme[]>([]);
    const [activeSelection, setActiveSelection] = useState<string>();
    const [translationCountWarning, setTranslationCountWarning] = useState<boolean>(false);
    const [fontLimitWarning, setFontLimitWarning] = useState<boolean>(false);
    const [verseLimitWarning, setVerseLimitWarning] = useState<boolean>(false);
    const fontLowerLimit = 2;
    const fontUpperLimit = 4;

    useEffect(()=>{
        emit("last_theme_request");
        const unlisten = listen("load_last_theme", (event)=>{
            let lastTheme = event?.payload?.lastTheme;
            setLastTheme(lastTheme);
            if(event){
                getAllThemes(lastTheme).then(res=>{
                    setThemes(res);
                    setActiveSelection(lastTheme);
                });
            }
        });
        
        let root = document.getElementById("root");
        if(root){
            root.addEventListener("click", (event : MouseEvent)=>{
                if(event?.target?.id !== "file_menu" && event?.target?.id !== "file_dropdown" && event?.target?.id !== "theme_name_input"){
                    setShowThemeMenu(false);
                    setHideModal(true);
                }
            });
        }
        return () => {
            root?.removeEventListener("click", ()=>{});
            unlisten.then(f=>f());
        }
    }, []);

    useEffect(()=>{
        if(themes && lastTheme){
            setActiveSelection(lastTheme);
            setLastTheme(undefined);
        }
    },[themes, lastTheme]);

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

    function setFontSize(e:any){
        setConfig({...config, fontSize: e});
    }

    function removeExtension(themeName: string){
        return themeName.replace(".json", "");
    }
    
    function processEntries(entries: any, themeNames: string[]) {
        for (const entry of entries) {
            themeNames.push(entry.name);
            if (entry.children) {
                processEntries(entry.children, themeNames);
            }
        }
        }

    async function getAllThemes(initialTheme: string | undefined){
        return readDir('themes', { dir: BaseDirectory.AppData, recursive: true }).then(entries => {
            let themeNames: string[] = [];
            processEntries(entries, themeNames);

            return readThemeData(themeNames);

        })
        
    }

    async function readThemeData(themes: string[]){
        let themeData: Theme[] = [];
        const decoder = new TextDecoder();
        themes.forEach(theme =>{
            readBinaryFile(ThemeDir+'/'+theme, {dir:BaseDirectory.AppConfig}).then(
                res => {
                    if(res){
                    const prefs = JSON.parse(decoder.decode(res));
                        themeData.push({name: theme, theme: prefs, lastUsed: false} as Theme);
                    }
                });
        });
        if (themeData){
            return themeData as Theme[];
        }


    }

    function changeActiveSelection(e: any){
        setActiveSelection(e.target.value);
    }

    async function handleSave(){
        themeFunctions[0](activeSelection);
        let t = themes;
        let savedTheme = t?.find(theme => theme.name === activeSelection);
        if(savedTheme){
            savedTheme.theme = config;
        }
        setConfig(config);
        setThemes(t);
        //themeFunctions[1](activeSelection);

        /*
        let load = document.getElementById("changes");
        if(load){
            load.innerHTML = "";
        }
        */
    }

    function initNewTheme(){
        let themeName = newThemeName + ".json";
        themeFunctions[0](themeName);
        setThemes((themes)=>[...themes, {name:themeName, lastUsed:false, theme:config} as Theme]);
        setActiveSelection(themeName);
        setNewThemeName("");
    }

    function handleNewClick(e: MouseEvent){
        e.preventDefault();
        e.stopPropagation();
        setHideModal(false);
        setShowThemeMenu(false);
    }

    return (
        <div className="flex flex-col w-full h-full justify-start items-start select-none">
            
            <NewThemeModal newThemeName={newThemeName} setNewThemeName={setNewThemeName} hide={hideModal} setHide={setHideModal} initNewTheme={initNewTheme}/>
            <div className="flex flex-col justify-start items-start w-full px-4 py-2">
                <div className=" text-neutral-200 text-sm h-1/10 font-bold">
                    Save/Load Theme
                </div>
                <div className='w-full h-fit pt-2 flex'>
                    <select onChange={(e)=>setActiveSelection(e.target.value)} value={activeSelection} onMouseDown={()=>{
                        setShowThemeMenu(false);
                    }}
                    className="bg-neutral-900 min-w-[25%] max-w-[50%] outline-none text-neutral-200 appearance-none pl-2 py-1">
                        {themes?.map(theme=>(<option value={theme.name}>{removeExtension(theme.name)}</option>))}
                    </select>
                    <div id="changes" className="inline-block text-red-500 text-base min-w-2 min-h-full">
                    {JSON.stringify(config) !== JSON.stringify(themes?.find(theme => theme.name === activeSelection)?.theme) ? 
                    '*' : ''}
                    </div>
                    <div id="file_dropdown" className="relative w-16 ml-2 pl-3 pe-2 py-1 rounded-md text-neutral-100 text-sm bg-neutral-900 flex justify-between items-center align-middle" 
                    onClick={()=>setShowThemeMenu(!showThemeMenu)}>
                        File
                        <MdArrowDropDown id="file_dropdown" className="w-4 h-4"/>
                        <div id="file_menu" className="absolute left-0 w-24 top-8 z-10" hidden={!showThemeMenu}>
                            <div className="bg-neutral-900 pl-2 w-full rounded-ss-md rounded-se-md border-b border-neutral-700"
                            onClick={handleNewClick}>
                                <div id="file_dropdown" className="w-full py-1 flex justify-between items-center align-middle pe-2">
                                    New
                                </div>
                            </div>
                            <div className="bg-neutral-900 pl-2 w-full border-b border-neutral-700"
                            onClick={()=>handleSave()}>
                                <div className="w-full py-1 ">Save</div>
                            </div>
                            <div className="bg-neutral-900 pl-2 w-full border-b border-neutral-700"
                            onClick={()=>themeFunctions[1](activeSelection)}>
                                <div className="w-full py-1 ">Load</div>
                            </div>
                            
                        </div>
                    </div>
                    {/* <button id="save" className="ml-2 px-4 py-1 dark:bg-neutral-900 rounded-md text-neutral-200 text-sm" onClick={()=>handleSave()}>save</button>
                    <button id="load" className="ml-2 px-4 py-1 dark:bg-neutral-900 rounded-md text-neutral-200 text-sm" onClick={()=>themeFunctions[1](activeSelection)}>load</button> */}
                </div>
            </div>
            <div className="flex flex-col justify-start items-start w-full px-4 py-2 border-t border-neutral-700">
                
                
                <div className=" text-neutral-200 text-sm h-1/10 font-bold">
                    Typography
                </div>
                
                <div className="dark:text-neutral-50 w-full flex justify-start items-center gap-3 h-[30px]">
                    <div className="w-1/2 h-1/2 my-auto dark:text-neutral-300">
                        Verse Font Weight                     
                    </div>
                    <div className="dark:text-neutral-50 w-1/6 h-1/2 my-auto">
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
                            renderThumb={(props) => <div {...props}></div>}
                        />
                    </div>
                </div>
                
                <div className="dark:text-neutral-50 w-full flex justify-start items-center gap-3 h-[30px]">
                    <div className="w-1/2 h-1/2 my-auto dark:text-neutral-300">
                        Verse Number Weight
                    </div>
                    <div className="dark:text-neutral-50 w-1/6 h-1/2 my-auto">
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
                        renderThumb={(props) => <div {...props}></div>}
                        />
                    </div>
                </div>
                
                <div className="dark:text-neutral-50 w-full flex justify-start items-center gap-3 h-[30px]">
                    <div className="w-1/2 h-1/2 my-auto dark:text-neutral-300">
                        Verse Info Weight
                    </div>
                    <div className="dark:text-neutral-50 w-1/6 h-1/2 my-auto">
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
                        renderThumb={(props) => <div {...props}></div>}
                        />
                    </div>
                </div>

                <div className="dark:text-neutral-50 w-full flex justify-start items-center gap-3 h-[30px]">
                    <div className="w-1/2 h-1/2 my-auto dark:text-neutral-300">
                        Verse Font Size
                    </div>
                    <div className="dark:text-neutral-50 w-1/6 h-1/2 my-auto">
                        {config?.fontSize}vw
                    </div>

                    <div className="w-1/2 h-1/2 dark:text-black">
                        <ReactSlider
                        marks min={1} max={(fontUpperLimit * 2) + 1}
                        value={((config?.fontSize - fontLowerLimit) * 4) + 1}
                        onChange={(e)=>setFontSize((fontLowerLimit + ((e - 1) / 4)))}
                        className="customSlider" 
                        thumbClassName="customSlider-thumb"
                        trackClassName="customSlider-track"
                        markClassName="customSlider-mark"
                        renderThumb={(props) => <div {...props}></div>}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-start items-start font-light w-full px-4 py-2 border-t border-neutral-700">
                <div className=" text-neutral-200 text-sm h-1/10 pb-2 font-bold">
                    Versions
                </div>
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
                
            <div className="w-full px-4 py-2 border-t border-neutral-700">
                <div className="text-neutral-200 text-sm h-1/10 pb-1 font-bold">
                    Color
                </div>
                <div className="flex justify-between items-center w-full h-full gap-5">
                    <div className="w-1/2 color_picker">
                        <div className="dark:text-neutral-200 mb-1">Background Color</div>
                        <input className="rounded-lg w-full mb-3 text-base outline-none px-1 py-1 ps-2 h-full dark:bg-neutral-900 dark:text-neutral-200" autoComplete="off"
                        value={config?.bgColor} onChange={(e)=>handleBgColorChange(e.target.value)}/>
                        <HexColorPicker className="" color={config?.bgColor} onChange={handleBgColorChange} />
                    </div>
                    <div className="w-1/2 color_picker">
                        <div className="dark:text-neutral-200 mb-1">Text Color</div>
                        <input className="rounded-lg w-full mb-3 text-base outline-none px-1 py-1 ps-2 h-full dark:bg-neutral-900 dark:text-neutral-200" autoComplete="off"
                        value={config?.textColor} onChange={(e)=>handleTextColorChange(e.target.value)}/>
                        <HexColorPicker className="" color={config?.textColor} onChange={handleTextColorChange} />
                    </div>
                </div>
            </div>
            
        </div>
    )
}
