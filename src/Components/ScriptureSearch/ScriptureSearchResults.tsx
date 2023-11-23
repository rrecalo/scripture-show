import VerseComponent from '../VerseComponent';
import Verse from '../../types/Verse';
import {useEffect, useState} from 'react';

type ScriptureSearchResultsProps = {
    verses: Verse[],
    changeSelectedVerse: Function,
}

export default function ScriptureSearchResults({verses, changeSelectedVerse} : ScriptureSearchResultsProps){

    const [selectedVerse, setSelectedVerse] = useState<Verse>();
  
    useEffect(()=>{
        
    }, []);

    useEffect(()=>{
        selectedVerse ? changeSelectedVerse(selectedVerse) : {};
        document.addEventListener('keydown', handleKey);
        return () => {document.removeEventListener('keydown', handleKey);}
        }, [selectedVerse]);

    function selectVerse(verse: Verse){
        setSelectedVerse(verse);
    }

    function handleKey(e: any){
        if(e.key === "ArrowLeft"){
            if(selectedVerse && selectedVerse.number > 1){
                let newVerse = verses.find(someVerse => someVerse.number === selectedVerse?.number - 1);
                changeSelectedVerse(newVerse);
                setSelectedVerse(newVerse);
            }
        }
        if(e.key === "ArrowRight"){
            if(selectedVerse && selectedVerse.number < verses.length){
                let newVerse = verses.find(someVerse => someVerse.number === selectedVerse?.number + 1);
                changeSelectedVerse(newVerse);
                setSelectedVerse(newVerse);
            }

        }
    }

    return (
        <div id="search_results" className="flex flex-col px-2 w-full overflow-auto">
            {verses?.map((verse : Verse) => <VerseComponent key={verse.number} className="font-light" verse={verse} selectVerse={selectVerse} selectedVerse={selectedVerse}/>)}
        </div>
    )
}
