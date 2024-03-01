import { HexColorPicker } from "react-colorful";
import ProjectionConfiguration from "../../types/ProjectionConfiguration";
import { useState, useEffect } from "react";
import "./styles.css";
import { readDir, BaseDirectory, readBinaryFile } from "@tauri-apps/api/fs";
import { ThemeDir } from "./ProjectionCustomization";
import NewThemeModal from "./NewThemeModal";
import { emit, listen } from '@tauri-apps/api/event';
import Dropdown from "./Dropdown";
import { motion } from "framer-motion";
import OptionSlider from "./OptionSlider";
import { BiEditAlt } from "react-icons/bi";
import { MdOutlineUploadFile, MdOutlineDownload, MdOutlineEdit, MdOutlineDelete, MdAdd } from "react-icons/md";

type ProjectionControlsProps = {
    config: ProjectionConfiguration,
    setConfig: Function,
    //0 = save, 1 = load, 2 = clear/delete
    themeFunctions: Function[]
}
export type Theme = { 
    name: string,
    theme: ProjectionConfiguration,
    lastUsed: boolean,
}

export function removeExtension(themeName: string){
    return themeName.replace(".json", "");
}

export async function getAllThemes(){
    return readDir('themes', { dir: BaseDirectory.AppData, recursive: true }).then(entries => {
        let themeNames: string[] = [];
        processEntries(entries, themeNames);

        return readThemeData(themeNames);

    })
    
}

export function processEntries(entries: any, themeNames: string[]) {
    for (const entry of entries) {
        themeNames.push(entry.name);
        if (entry.children) {
            processEntries(entry.children, themeNames);
        }
    }
}

export  async function readThemeData(themes: string[]){
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

export default function ProjectionControls({config, setConfig, themeFunctions} : ProjectionControlsProps){
    
    const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);
    const [shouldLoadTheme, setShouldLoadTheme] = useState<boolean>(false);
    const [themeSwitched, setThemeSwitched] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
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

    useEffect(() => {
        if(JSON.stringify(config) !== JSON.stringify(themes?.find(theme => theme.name === activeSelection)?.theme)){
            setHasChanges(true)
            //setThemeSwitched(true);
        }
        else {
            setHasChanges(false); 
            setThemeSwitched(false);
        }
    },[config, themes, activeSelection])   

    useEffect(()=>{
        if(activeSelection){
            setThemeSwitched(true);
            if(shouldLoadTheme){
                handleLoad();
                setShouldLoadTheme(false);
            }
        }
    }, [activeSelection, shouldLoadTheme]);

    useEffect(()=>{
        emit("last_theme_request");
        const unlisten = listen("load_last_theme", (event : any)=>{
            if(event){
                let lastTheme = event?.payload?.lastTheme;
                setLastTheme(lastTheme);
                setShouldLoadTheme(true);
                setActiveSelection(lastTheme);
                    getAllThemes().then(res=>{
                        setThemes(res as Theme[]);
                        //setActiveSelection(lastTheme);
                    });
                }
        });
        
        let root = document.getElementById("root");
        if(root){
            root.addEventListener("click", (event : MouseEvent)=>{
                if(event?.target?.id !== "file_menu" && event?.target?.id !== "file_icons" && event?.target?.id !== "theme_name_input" && event?.target?.id !== "file_dropdown" && event?.target?.id !== "new_theme_modal" 
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
            root.addEventListener("click", handleNonEditingClick);
        }
        return () => {
            root?.removeEventListener("click", handleNonEditingClick);
        }
    }, [editedName, activeSelection]);
    
    function stopEditingName(){
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
        }
    }

    function handleNonEditingClick(event: MouseEvent){
        event?.preventDefault();
        event?.stopPropagation();
        if(event?.target?.id !== "edit_name")
        {
            stopEditingName();
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
        console.log('cile1');
        if(config?.translations.length == 1 && config?.translations.includes(translation)){
            setTranslationCountWarning(true);
            return;
        }
        else setTranslationCountWarning(false);
        if(config?.translations.includes(translation)){
            console.log('has translation : ', translation);
            setConfig({...config, translations: config?.translations.filter(t => t !== translation)});
        }
        else {
            console.log('does NOT have translation : ', translation);
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


    
    

    function handleSave(){
        if(!hideModal || themes?.length === 0  || !hasChanges) return;
        themeFunctions[0](activeSelection);
        let t = themes;
        let savedTheme = t?.find(theme => theme.name === activeSelection);
        if(savedTheme){
            savedTheme.theme = config;
            setConfig(config);
            setThemes((old : Theme[])=>[...old.filter(theme => theme.name !== activeSelection), savedTheme] as Theme[]);
        }
    }

    function initNewTheme(){
        let themeName = newThemeName.trimEnd() + ".json";
        themeFunctions[0](themeName);
        setThemes((themes)=>[...themes, {name:themeName, lastUsed:false, theme:config} as Theme]);
        setActiveSelection(themeName);
        setNewThemeName("");
        setLastTheme(themeName);
    }

    function handleNewClick(e: MouseEvent){
        e.preventDefault();
        e.stopPropagation();
        setExpanded(false);
        setHideModal(false);
        setShowThemeMenu(false);
        let input = document.getElementById("theme_name_input");
        input ? input.focus() : {};
    }

    function handleRename(){
        setExpanded(false);
        if(editedName && editedName.length > 0){stopEditingName();};
        if(!hideModal || themes?.length === 0) return;
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
                    let themeName = editedName.trimEnd() + ".json";
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
        if(!hideModal || themes?.length === 0) return;
        setExpanded(false);
        setThemes((themes)=>[...themes.filter(t => t.name !== activeSelection)]);
        themeFunctions[2](activeSelection);
        setActiveSelection(themes[0].name || undefined);
        setLastTheme(themes.find(t => t.name !== activeSelection)?.name);
    }

    function handleLoad(){
        if(!hideModal || themes?.length === 0) return;
        themeFunctions[1](activeSelection);
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
                    options={themes.map(theme=>theme.name)}/>
                    {
                        editedName !== undefined ?
                    <div className="z-10 left-0 w-full flex justify-between items-center align-middle bg-transparent border border-neutral-700 rounded-md py-1 px-1 ps-2">
                        <input placeholder="name required..." autoCapitalize="off" autoComplete="off" autoCorrect="off"
                        id="edit_name" className="left-0 w-full outline-none text-neutral-200 appearance-none bg-transparent" value={editedName} onChange={(e)=>setEditedName(e.target.value.trimStart())}
                        onKeyDown={handleEditingKeydown as any}/>
                        <motion.div initial={{opacity:0, x:-10}} animate={{opacity:1, x:0, transition:{duration:0.3}}} className="text-xs">
                            <BiEditAlt className="w-3 h-3 text-neutral-200"/>
                        </motion.div>
                    </div>
                    : <></>
                    }
                    </div>
                    <div id="file_icons" className="ml-2 flex justify-around items-center align-middle gap-1">
                        <motion.div id="file_dropdown" onClick={handleNewClick} whileHover={{backgroundColor:'#404040'}}
                        className="p-1 border rounded-md" animate={{borderColor: themes.length === 0 ? '#a3a3a3' : '#404040', color: themes.length === 0 ? '#d4d4d4' : '#a3a3a3'}}>
                            <MdAdd id="file_dropdown" className="w-4 h-4"/>
                        </motion.div>
                        <motion.div id="save_option" onClick={()=>handleSave()} whileHover={themes.length !== 0 && hasChanges ? {backgroundColor: hasChanges ? '#fafafa' : '#404040', color: hasChanges ? '#f3553c' : '#525252'} : {}}
                        className="p-1 border border-neutral-700 rounded-md" animate={{backgroundColor: hasChanges && themes.length > 0 ? '#f3553c' : '#262626', color: hasChanges && themes.length > 0 ? '#d4d4d4': '#525252', transition:{duration:0.25}}}>
                            <MdOutlineUploadFile id="save_option" className="w-4 h-4"/>
                        </motion.div>
                        <motion.div id="load_option" className="p-1 border border-neutral-700 rounded-md" whileHover={themes.length !== 0 ? {backgroundColor: themeSwitched ? '#f3553c': '#404040', color: themeSwitched ? '#d4d4d4' : '#a3a3a3'} : {}}
                        onClick={handleLoad}
                        animate={{color: themes.length === 0 ? '#525252' : themeSwitched ? '#f3553c' : '#a3a3a3', backgroundColor: themeSwitched && themes.length > 0 ? '#fafafa' : '#262626'}}>
                            <MdOutlineDownload id="load_option" className="w-4 h-4"/>
                        </motion.div>

                        <motion.div id="rename_option" onClick={(e)=>{e.stopPropagation(); handleRename();}} whileHover={themes.length !== 0 ? {backgroundColor:'#404040'} : {}}
                        className="p-1 border border-neutral-700 rounded-md " animate={{color: themes.length > 0 ? '#a3a3a3' : '#525252'}}>
                            <MdOutlineEdit id="rename_option" className="w-4 h-4"/>
                        </motion.div>
                        <motion.div id="delete_option" onClick={handleDelete} animate={{color: themes.length > 0 ? '#a3a3a3' : '#525252'}} whileHover={themes.length !== 0 ? {backgroundColor:'#404040'} : {}}
                        className="p-1 border border-neutral-700 rounded-md text-neutral-300">
                            <MdOutlineDelete id="delete_option" className="w-4 h-4"/>
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
                        <input className="w-4 h-4 accent-[#f3553c]" key={Math.random()} type="checkbox" checked={config?.translations?.includes("esv")}
                        onChange={()=> handleToggleTranslation("esv")}/>
                        <label className="ps-2 dark:text-neutral-400">ESV</label>
                    </div>
                    <div className="flex justify-center items-center">
                        <input className="w-4 h-4 accent-[#f3553c]" key={Math.random()} type="checkbox" checked={config?.translations?.includes("ro")}
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
