import { useEffect, useState } from 'react';
import { Theme, getAllThemes } from '../ProjectionCustomization/ProjectionControls';
import { emit } from '@tauri-apps/api/event';
import Dropdown from '../ProjectionCustomization/Dropdown';
import { motion } from 'framer-motion';
import { MdOutlineDownload } from 'react-icons/md';
import { readBinaryFile, BaseDirectory } from '@tauri-apps/api/fs';
import { ThemeDir } from '../ProjectionCustomization/ProjectionCustomization';

type Props = {
  lastTheme?: string,
  setProjectionConfig: Function
}

function ThemeChangeComponent({lastTheme} : Props) {

    const [expanded, setExpanded] = useState<boolean>(false);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [activeSelection, setActiveSelection] = useState<string>();
    const [themeSwitched, setThemeSwitched] = useState<boolean>(false);

    useEffect(()=>{
          getAllThemes().then(res=>{
            setThemes(res as Theme[]);
            setActiveSelection(lastTheme);
        });
        
    }, [lastTheme]);

    useEffect(()=>{
      handleLoad();
    }, [activeSelection])

    function handleLoad(){
      if(activeSelection){
        let themeName = activeSelection;
        const decoder = new TextDecoder();
        readBinaryFile(ThemeDir+"/"+themeName, {dir:BaseDirectory.AppConfig}).then(
        res => {
            if(res){
            const prefs = JSON.parse(decoder.decode(res));
                //setDarkMode(prefs.darkMode);
                //if default verse count is not found in the preferences, that means there probably aren't any preferences
                //in this case, set the preferences as the defaults
                //setProjectionConfig(prefs as ProjectionConfiguration);
                setThemeSwitched(false);
                emit('projection_format', prefs);
                emit('last_theme', {lastTheme: themeName});
                emit("load_last_theme",{lastTheme: themeName});
                //emit('projection_format', prefs as ProjectionConfiguration);
            }
        });
      }
  }

  function handleSelectionChange(e: string){
    setThemeSwitched(true);
    setActiveSelection(e)
  }

  return (
    <div className='flex justify-between items-center w-full h-fit pe-2 gap-2 text-sm'>
        <div className='w-full h-fit'>
          <Dropdown expanded={expanded} setExpanded={setExpanded} hidden={false} value={activeSelection} onChange={(e : string) => handleSelectionChange(e)} 
            options={themes?.map(theme=>theme.name)}/>
        </div>
    </div>
  )
}

export default ThemeChangeComponent