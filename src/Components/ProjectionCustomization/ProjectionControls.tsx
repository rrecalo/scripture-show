import { HexColorPicker } from "react-colorful";
import ProjectionConfiguration from "../../types/ProjectionConfiguration";
import { useState, useEffect } from "react";
import ReactSlider from 'react-slider';
import "./styles.css";
import { readDir, BaseDirectory, readBinaryFile } from "@tauri-apps/api/fs";
import { ThemeDir } from "./ProjectionCustomization";
import { MdArrowDropDown} from "react-icons/md";
import NewThemeModal from "./NewThemeModal";
import { emit, listen } from '@tauri-apps/api/event';
import { MdOutlineEditNote } from "react-icons/md";
import Dropdown from "./Dropdown";
import { motion } from "framer-motion";
import OptionSlider from "./OptionSlider";

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

export function removeExtension(themeName: string){
    return themeName.replace(".json", "");
}

export default function ProjectionControls({config, setConfig, themeFunctions} : ProjectionControlsProps){
    
    const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);
    const [expanded, setExpanded] = useState<boolean>(false);
    const [newThemeName, setNewThemeName] = useState<string>("");
    const [hideModal, setHideModal] = useState<boolean>(true); 
    const [lastTheme, setLastTheme] = useState<string>(); 
    const [themes, setThemes] = useState<Theme[]>([]);
    const [activeSelection, setActiveSelection] = useState<string>();
    const [translationCountWarning, setTranslationCountWarning] = useState<boolean>(false);
    const [fontLimitWarning, setFontLimitWarning] = useState<boolean>(false);
    const [verseLimitWarning, setVerseLimitWarning] = useState<boolean>(false);
    const [editedName, setEditedName] = useState<string>();
    const fontLowerLimit = 2;
    const fontUpperLimit = 4;

    useEffect(()=>{
        emit("last_theme_request");
        const unlisten = listen("load_last_theme", (event)=>{
            let lastTheme = event?.payload?.lastTheme;
            setLastTheme(lastTheme);
            if(event){
                getAllThemes().then(res=>{
                    setThemes(res as Theme[]);
                    setActiveSelection(lastTheme);
                });
            }
        });
        
        let root = document.getElementById("root");
        if(root){
            root.addEventListener("click", (event : MouseEvent)=>{
                if(event?.target?.id !== "file_menu" && event?.target?.id !== "file_dropdown" && event?.target?.id !== "theme_name_input"
                ){
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
            setActiveSelection(lastTheme || themes[0].name);
            setLastTheme(undefined);
            emit("last_theme", {lastTheme: lastTheme});
        }
    },[themes, lastTheme]);

    useEffect(()=>{
        let editBox = document.getElementById("edit_name");
        if (editBox){
            editBox.focus();
        }

        let root = document.getElementById("root");
        if(root){
            root.addEventListener("click", stopEditingName);
        }
        return () => {
            root?.removeEventListener("click", stopEditingName);
        }
    }, [editedName, activeSelection]);
    
    function stopEditingName(event: MouseEvent){
        if(event?.target?.id !== "edit_name" && event?.target?.id !== "rename_option")
        {
            if(editedName && activeSelection) {
                if(editedName !== removeExtension(activeSelection)){
                    let themeName = editedName + ".json";
                    setThemes((themes)=>[...themes.filter(t => t.name !== activeSelection), {name:themeName, lastUsed:false, theme:config} as Theme]);
                    setActiveSelection(themeName);
                    setEditedName(undefined);
                    themeFunctions[2](activeSelection);
                    themeFunctions[0](themeName);
                    setLastTheme(themeName);
                    setExpanded(false);
                }
            }
        }
    }

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


    
    function processEntries(entries: any, themeNames: string[]) {
        for (const entry of entries) {
            themeNames.push(entry.name);
            if (entry.children) {
                processEntries(entry.children, themeNames);
            }
        }
    }

    async function getAllThemes(){
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
        setLastTheme(themeName);
    }

    function handleNewClick(e: MouseEvent){
        e.preventDefault();
        e.stopPropagation();
        setHideModal(false);
        setShowThemeMenu(false);
    }

    function handleRename(){
        if(activeSelection){
            setEditedName(removeExtension(activeSelection));
        }
    }

    function handleEditingKeydown(e: KeyboardEvent) {
        if(e.key === "Enter"){
            e.preventDefault();
            e.stopPropagation();
            if(editedName && activeSelection) {
                if(editedName !== removeExtension(activeSelection)){
                    let themeName = editedName + ".json";
                    setThemes((themes)=>[...themes.filter(t => t.name !== activeSelection), {name:themeName, lastUsed:false, theme:config} as Theme]);
                    setActiveSelection(themeName);
                    themeFunctions[2](activeSelection);
                    themeFunctions[0](themeName);
                    setLastTheme(themeName);
                }
                setEditedName(undefined);
                setExpanded(false);
            }
        }
    }

    function handleDelete(){
        setThemes((themes)=>[...themes.filter(t => t.name !== activeSelection)]);
        themeFunctions[2](activeSelection);
        setActiveSelection(themes[0].name || undefined);
        setLastTheme(themes[0].name);
    }

    return (
        <div className="flex flex-col w-full h-full justify-start items-start select-none">
            
            <NewThemeModal newThemeName={newThemeName} setNewThemeName={setNewThemeName} hide={hideModal} setHide={setHideModal} initNewTheme={initNewTheme}/>
            <div className="flex flex-col justify-start items-start w-full px-4 py-2">
                <div className=" text-neutral-200 text-sm h-1/10 font-bold mb-1">
                    Themes
                </div>
                
                <div className='w-full h-fit pt-2 flex'>
                    <div className="relative min-w-[50%] max-w-[50%] w-fit rounded-md">
                    <Dropdown expanded={expanded} setExpanded={setExpanded} hidden={editedName !== undefined ? true : false} value={activeSelection} onChange={(e : string)=>{setActiveSelection(e)}} 
                    options={themes.map(theme=>theme.name)}
                    onMouseDown={()=>
                    setShowThemeMenu(false)}/>
                    {
                        editedName !== undefined ?
                    <input placeholder="name required..." autoCapitalize="off" autoComplete="off" autoCorrect="off"
                    id="edit_name" className="z-10 absolute left-0 w-full outline-none text-neutral-200 appearance-none pl-2 py-1 bg-transparent border border-neutral-700 rounded-md" value={editedName} onChange={(e)=>setEditedName(e.target.value)}
                    onKeyDown={handleEditingKeydown}/>
                    
                    : <></>
                    }
                    </div>
                    <div id="changes" className="inline-block text-red-500 text-base min-w-2 min-h-full ml-0.5">
                    {JSON.stringify(config) !== JSON.stringify(themes?.find(theme => theme.name === activeSelection)?.theme) ? 
                    '*' : ''}
                    </div>
                    <div id="file_dropdown" className="relative w-16 ml-2 pl-3 pe-2 py-1 rounded-md text-neutral-200 text-sm bg-neutral-800 border border-neutral-700 flex justify-between items-center align-middle" 
                    onClick={()=>setShowThemeMenu(!showThemeMenu)}>
                        File
                        <MdArrowDropDown id="file_dropdown" className="w-4 h-4"/>
                        <motion.div id="file_menu" animate={{opacity: showThemeMenu ? 1 : 0, display: showThemeMenu ? "block" : "none"}} className="absolute left-0 w-24 top-8 z-10 border border-neutral-700 rounded-md text-neutral-200">
                            <div className="bg-neutral-800 pl-2 w-full rounded-ss-md rounded-se-md border-b border-neutral-700"
                            onClick={handleNewClick}>
                                <div id="file_dropdown" className="w-full py-1 flex justify-between items-center align-middle pe-2">
                                    New
                                </div>
                            </div>
                            <div className="bg-neutral-800 pl-2 w-full border-b border-neutral-700"
                            onClick={()=>handleSave()}>
                                <div className="w-full py-1 ">Save</div>
                            </div>
                            <div className="bg-neutral-800 pl-2 w-full border-b border-neutral-700"
                            onClick={()=>themeFunctions[1](activeSelection)}>
                                <div className="w-full py-1 ">Load</div>
                            </div>
                            <div id="rename_option" className="bg-neutral-800 pl-2 w-full border-b border-neutral-700"
                            onClick={(e)=>{e.stopPropagation(); handleRename();}}>
                                <div id="rename_option" className="w-full py-1 ">Rename</div>
                            </div>
                            <div className="bg-neutral-800 pl-2 w-full border-b border-neutral-700 rounded-es-md rounded-ee-md"
                            onClick={handleDelete}>
                                <div className="w-full py-1 ">Delete</div>
                            </div>
                            
                        </motion.div>
                    </div>
                </div> 
                
            </div>
            <div className="flex flex-col justify-start items-start w-full px-4 py-2 border-t border-neutral-700">
                
                <div className="text-neutral-200 text-xs h-1/10 font-bold">
                    Typography
                </div>
                
                <OptionSlider range={[1, 9]} onChange={(e : number)=>handleVerseTextWeightChange(e*100)} 
                sliderLabel={"Verse Font Weight"} displayedValue={config?.verseTextWeight.toString()} calculatedValue={config?.verseTextWeight/100}/>
                
                <OptionSlider range={[1, 9]} onChange={(e : number)=>handleVerseNumberWeightChange(e*100)} 
                sliderLabel={"Verse Number Weight"} displayedValue={config?.verseNumberWeight.toString()} calculatedValue={config?.verseNumberWeight/100}/>

                <OptionSlider range={[1, 9]} onChange={(e : number)=>handleVerseInfoWeightChange(e*100)} 
                sliderLabel={"Verse Info Weight"} displayedValue={config?.verseInfoWeight.toString()} calculatedValue={config?.verseInfoWeight/100}/>

                <OptionSlider range={[1, (fontUpperLimit * 2) + 1]} onChange={(e)=>setFontSize((fontLowerLimit + ((e - 1) / 4)))} 
                sliderLabel={"Verse Font Size"} displayedValue={config?.fontSize + "vw"} calculatedValue={((config?.fontSize - fontLowerLimit) * 4) + 1}/>
                
            </div>

            <div className="flex flex-col justify-start items-start font-light w-full px-4 py-2 border-t border-neutral-700">
                <div className=" text-neutral-200 text-xs h-1/10 pb-2 font-bold">
                    Versions
                </div>
                <div className="flex flex-col justify-center items-start gap-2">
                    <div className="flex justify-center items-center">
                        <input className="w-4 h-4 accent-[#f3553c]" type="checkbox" value="esv" checked={config?.translations?.includes("esv")}
                        onChange={()=> handleToggleTranslation("esv")}/>
                        <label className="ps-2 dark:text-neutral-400">ESV</label>
                    </div>
                    <div className="flex justify-center items-center">
                        <input className="w-4 h-4 accent-[#f3553c]" type="checkbox" value="ro" checked={config?.translations?.includes("ro")}
                        onChange={()=> handleToggleTranslation("ro")}/>
                        <label className="ps-2 dark:text-neutral-400">RO</label>
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
                <div className="text-neutral-200 text-xs h-1/10 pb-1 font-bold">
                    Color
                </div>
                <div className="flex justify-between items-center w-full h-full gap-5">
                    <div className="w-1/2 color_picker">
                        <div className="dark:text-neutral-300 mb-1 text-xs">Background Color</div>
                        <input className="rounded-lg w-full mb-3 text-sm outline-none px-1 py-1 ps-2 h-full dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-700" autoComplete="off"
                        value={config?.bgColor} onChange={(e)=>handleBgColorChange(e.target.value)}/>
                        <HexColorPicker className="" color={config?.bgColor} onChange={handleBgColorChange} />
                    </div>
                    <div className="w-1/2 color_picker">
                        <div className="dark:text-neutral-300 mb-1 text-xs">Text Color</div>
                        <input className="rounded-lg w-full mb-3 text-sm outline-none px-1 py-1 ps-2 h-full dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-700" autoComplete="off"
                        value={config?.textColor} onChange={(e)=>handleTextColorChange(e.target.value)}/>
                        <HexColorPicker className="" color={config?.textColor} onChange={handleTextColorChange} />
                    </div>
                </div>
            </div>
            
        </div>
    )
}
