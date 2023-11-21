import VerseComponent from '../VerseComponent';
import Verse from '../../types/Verse';
import {useEffect, useState} from 'react';

type ScriptureSearchResultsProps = {
    verses: Verse[],
    changeSelectedVerse: Function
}

export default function ScriptureSearchResults({verses, changeSelectedVerse} : ScriptureSearchResultsProps){

    const [selectedVerse, setSelectedVerse] = useState<Verse>();
    
    useEffect(()=>{
        selectedVerse ? changeSelectedVerse(selectedVerse) : {};
        }, [selectedVerse]);

    function selectVerse(verse: Verse){
        setSelectedVerse(verse);
    }

    return (
        <div id="search_results" className="flex flex-col px-2 w-full overflow-auto">
            {verses?.map((verse : Verse) => <VerseComponent key={verse.number} className="font-light" verse={verse} selectVerse={selectVerse} selectedVerse={selectedVerse}/>)}
        </div>
    )
}
