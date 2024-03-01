import {listen} from '@tauri-apps/api/event';
import { Key, useEffect, useState } from 'react';
import Verse from '../types/Verse';
import { LayoutGroup, motion } from 'framer-motion';
import { DisplayVerseEvent } from '../types/ProjectionConfiguration';

type VerseHistoryProps = {

}


export default function VerseHistory({} : VerseHistoryProps){

    const [historyLength] = useState<number>(25);
    const [history, setHistory] = useState<Verse[]>();

    useEffect(()=>{
        const unlisten_verses = listen('display_verse', (event : DisplayVerseEvent) => {   
            if(event){
                let newVerses = event.payload.eng as Verse[];
                if(history !== undefined && history.length > 0){

                    let oldHistory = history;

                    if(history.findIndex(v=>v.text === newVerses[0].text)){
                        oldHistory = oldHistory.filter(v=>v.text !== newVerses[0].text);
                    }

                    if(history.length > historyLength){
                        oldHistory = oldHistory.slice(0, -1);
                    }
                    setHistory([...newVerses, ...oldHistory]);

                }
                else{
                    setHistory(newVerses);
                }
            }
        });

        return () => {
            unlisten_verses.then(f => f());
        }

    }, [history]);
    

    return (
        <LayoutGroup id="verse_history">
            {history?.map((item : Verse, index: number) =>
            <motion.div key={(item.text+index.toString()) as Key} layout layoutId={item.text+index.toString()}
            initial={{y:-1, opacity:0.9}} animate={{y:0, opacity:1}}
            className='ps-1 font-light text-sm w-full pe-4 whitespace-nowrap select-none cursor-default text-neutral-400 overflow-y-auto h-full overflow-x-hidden'
            >{item.book_name} {item.chapter}:{item.number}</motion.div>)}
        </LayoutGroup>
    )


}
