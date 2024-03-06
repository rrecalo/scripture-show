import {listen} from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import { LayoutGroup } from 'framer-motion';
import HistoryItem from './HistoryItem';

type VerseHistoryProps = {
    selectHistoryItem: Function
}

export type HistoryItemType = {
    book : string,
    chapter: number,
    verseStart: number,
}

export function uniqueHistoryString(item: HistoryItemType){
    return item.book+" "+item.chapter+":"+item.verseStart;
}

export default function VerseHistory({selectHistoryItem} : VerseHistoryProps){

    const [historyLength] = useState<number>(25);
    const [history, setHistory] = useState<HistoryItemType[]>();


    useEffect(()=>{
        const unlisten_verses = listen('search_result', (event : any) => {   
            if(event){
                let searchResult = event.payload as HistoryItemType;

                if(history !== undefined && history.length > 0){

                    let oldHistory = history;

                    if(history.findIndex(v=> uniqueHistoryString(v) === uniqueHistoryString(searchResult)) !== -1){
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
            {history?.map((item : HistoryItemType) => 
                <HistoryItem key={uniqueHistoryString(item)} selectHistoryItem={selectHistoryItem} item={item}/>
            )}
        </LayoutGroup>
    )


}
