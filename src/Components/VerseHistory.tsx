import {listen} from '@tauri-apps/api/event';
import { Key, useEffect, useState } from 'react';
import { LayoutGroup, motion } from 'framer-motion';

type VerseHistoryProps = {

}

type HistoryItem = {
    book : string,
    chapter: number,
    verseStart: number,
}

function uniqueHistoryString(item: HistoryItem){
    return item.book+item.chapter+item.verseStart;
}

export default function VerseHistory({} : VerseHistoryProps){

    const [historyLength] = useState<number>(25);
    const [history, setHistory] = useState<HistoryItem[]>();

    useEffect(()=>{
        const unlisten_verses = listen('search_result', (event : any) => {   
            if(event){
                let searchResult = event.payload as HistoryItem;
                if(history !== undefined && history.length > 0){

                    let oldHistory = history;

                    if(history.findIndex(v=>uniqueHistoryString(v) === uniqueHistoryString(searchResult))){
                        oldHistory = oldHistory.filter(v=>uniqueHistoryString(v) !== uniqueHistoryString(searchResult));
                    }

                    if(history.length > historyLength){
                        oldHistory = oldHistory.slice(0, -1);
                    }
                    setHistory([searchResult, ...oldHistory]);

                }
                else{
                    setHistory([searchResult]);
                }
            }
        });

        return () => {
            unlisten_verses.then(f => f());
        }

    }, [history]);
    

    return (
        <LayoutGroup id="verse_history">
            {history?.map((item : HistoryItem) =>
            <motion.div key={uniqueHistoryString(item) as Key} layout layoutId={uniqueHistoryString(item)}
            initial={{y:-1, opacity:0.9}} animate={{y:0, opacity:1}}
            className='ps-1 font-light text-sm w-full pe-4 whitespace-nowrap select-none cursor-default text-neutral-400 overflow-y-auto h-full overflow-x-hidden'
            >{item.book} {item.chapter}:{item.verseStart}</motion.div>)}
        </LayoutGroup>
    )


}
