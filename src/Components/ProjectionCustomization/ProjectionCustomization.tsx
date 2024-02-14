import {useEffect, useState} from 'react';
import {listen, emit} from '@tauri-apps/api/event';
import PreviewDisplay from './PreviewDisplay';
import ProjectionControls from './ProjectionControls';
import ProjectionConfiguration from '../../types/ProjectionConfiguration';
import './styles.css';

type ProjectionCustomizationProps = { }

export default function ProjectionCustomization({} : ProjectionCustomizationProps){

    const [darkMode, setDarkMode] = useState<Boolean>();
    const [projectionConfig, setProjectionConfig] = useState<ProjectionConfiguration>();

    useEffect(()=>{

        const unlisten_theme_update = listen('theme_update', (event : any) =>{
            setDarkMode(event.payload);
            });
        emit("theme_request", "projection_customization");

        const unlisten_projection_customization = listen("load_projection_customization", (event: any) => {
            setProjectionConfig(event.payload);
        });
        emit("projection_customization_request", "projection_customization");

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
    <div className={`${darkMode ? 'dark' : ''} w-screen h-screen`}>
        <div className="fixed top-0 h-6 w-full" data-tauri-drag-region></div>

        <div className='pt-6 w-full h-full flex flex-col justify-start items-center text-sm bg-neutral-100 dark:bg-neutral-900'>
          
            <div className="h-full w-1/2 mx-auto flex justify-center items-center bg-neutral-800 aspect-video">
                <div className="h-fit scale-[0.5] aspect-video">
                    
                    <PreviewDisplay />
                    
                </div>
            </div>

            <div className='mt-2 w-full h-[60%] border-t-4 border-neutral-800'>
                <div className="pt-1 pl-1 pb-1 text-neutral-400 dark:bg-neutral-900">
                Projection Configuration
                </div>
                <div className='px-5 pt-2 dark:bg-neutral-800'>
                    
                    <ProjectionControls config={projectionConfig} setConfig={setProjectionConfig}/>
                    
                </div>
            </div>
        </div>
    </div>

    )

}
