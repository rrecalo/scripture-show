import {useEffect, useState} from 'react';
import {listen, emit} from '@tauri-apps/api/event';
import PreviewDisplay from './PreviewDisplay';
import ProjectionControls from './ProjectionControls';
import ProjectionConfiguration from '../../types/ProjectionConfiguration';
import './styles.css';
import ProjectionDisplay from '../ProjectionDisplay';

type ProjectionCustomizationProps = { }

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


    return (
    <div className={`${darkMode ? 'dark ' : ''} w-screen h-screen overflow-clip`}>
        <div className="fixed top-0 h-6 w-full" data-tauri-drag-region></div>

        <div className='w-full h-full flex justify-start items-center text-sm border-r border-neutral-700'>
          
            <div className='pt-6 w-1/2 h-full dark:bg-neutral-800 border-r dark:border-neutral-700'>

                <div className='w-full h-full pt-0'>
                    <ProjectionControls config={projectionConfig} setConfig={setProjectionConfig}/>
                </div>
            </div>

            <div className="h-full w-1/2 mx-auto flex justify-center items-center bg-neutral-900 aspect-video">
                <div className="h-fit scale-[0.49] aspect-video">
                    <ProjectionDisplay />
                </div>
            </div>

            
        </div>
    </div>

    )

}
