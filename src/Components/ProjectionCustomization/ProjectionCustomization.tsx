import {useEffect, useState} from 'react';
import {listen, emit} from '@tauri-apps/api/event';
import ProjectionControls from './ProjectionControls';
import ProjectionConfiguration from '../../types/ProjectionConfiguration';
import './styles.css';
import ProjectionDisplay from '../ProjectionView/ProjectionDisplay';
import { motion } from 'framer-motion';
import { fs } from '@tauri-apps/api';
import { BaseDirectory, createDir, readBinaryFile, writeBinaryFile } from '@tauri-apps/api/fs';

type ProjectionCustomizationProps = { }
export let ThemeDir = "themes"

export default function ProjectionCustomization({} : ProjectionCustomizationProps){

    const [darkMode, setDarkMode] = useState<Boolean>();
    const [projectionConfig, setProjectionConfig] = useState<ProjectionConfiguration>();

    useEffect(()=>{

        const unlisten_theme_update = listen('theme_update', (event : any) =>{
            setDarkMode(event.payload);
            });
        
        emit("theme_request", "projection_customization");

        emit("projection_customization_request", "projection_customization");

        const unlisten_projection_customization = listen("load_projection_customization", (event: any) => {
            setProjectionConfig(event.payload);
        });


        return () => {

            unlisten_theme_update.then(f=>f());
            unlisten_projection_customization.then(f=>f());
        }

    },[]);

    useEffect(()=>{
        if(projectionConfig){
            emit('projection_format', projectionConfig);
            const unlisten = listen('request_format', (_)=>{
                emit('projection_format', projectionConfig);
            });
            
            return () => {
                unlisten.then(f => f());
            }
        };
    },[projectionConfig]);


    function deleteTheme(themeName: string){
        fs.removeFile(ThemeDir+"/"+themeName, {dir: BaseDirectory.AppConfig});
    }

    function saveTheme(themeName: string){
        const encoder = new TextEncoder();
        const prefsString = JSON.stringify(projectionConfig);
        const encodedPrefs = encoder.encode(prefsString);
        fs.exists(ThemeDir, {dir: BaseDirectory.AppConfig}).then(exists =>
            {
            if(!exists){
                createDir(ThemeDir, {dir: BaseDirectory.AppConfig, recursive:true }, );
            }
            
            writeBinaryFile(ThemeDir+"/"+themeName, encodedPrefs, {dir: BaseDirectory.AppConfig});
            });
    }

    function loadTheme(themeName: string){
        const decoder = new TextDecoder();
        readBinaryFile(ThemeDir+"/"+themeName, {dir:BaseDirectory.AppConfig}).then(
        res => {
            if(res){
            const prefs = JSON.parse(decoder.decode(res));
                //setDarkMode(prefs.darkMode);
                //if default verse count is not found in the preferences, that means there probably aren't any preferences
                //in this case, set the preferences as the defaults
                setProjectionConfig(prefs as ProjectionConfiguration);
                emit('last_theme', {lastTheme: themeName});
                //emit('projection_format', prefs as ProjectionConfiguration);
            }
        });
    }

    return (
    <motion.div initial={{opacity:0.5}} animate={{opacity:1}} className={`${darkMode ? 'dark ' : ''} w-screen h-screen overflow-clip select-none`}>
        <div className="fixed top-0 h-6 w-full" data-tauri-drag-region></div>

        <div className='w-full h-full flex justify-start items-center text-sm border-r border-neutral-700'>
          
            <div className='pt-6 w-1/2 h-full dark:bg-neutral-800 border-r dark:border-neutral-700'>

                <div className='w-full h-full pt-0'>
                    <ProjectionControls config={projectionConfig} setConfig={setProjectionConfig} themeFunctions={[saveTheme, loadTheme, deleteTheme]}/>
                </div>
            </div>

            <div className="h-full w-1/2 mx-auto flex justify-center items-center bg-neutral-900 aspect-video">
                <div className="h-fit scale-[0.49] aspect-video">
                    <ProjectionDisplay audience={false}/>
                </div>
            </div>


            
        </div>
    </motion.div>

    )

}
