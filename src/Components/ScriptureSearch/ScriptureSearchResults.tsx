import VerseComponent from '../VerseComponent';
import Verse from '../../types/Verse';
import {useEffect, useState} from 'react';

type ScriptureSearchResultsProps = {
    verses: Verse[],
    changeSelectedVerse: Function,
    verseCount: number,
}

export default function ScriptureSearchResults({verses, changeSelectedVerse, verseCount} : ScriptureSearchResultsProps){

    const [selectedVerse, setSelectedVerse] = useState<Verse>();
  
    useEffect(()=>{
        
    }, []);

    useEffect(()=>{
        if(selectedVerse){
        let nextVerses = getNextVerses(selectedVerse, 2);
        nextVerses.unshift(selectedVerse);
        changeSelectedVerse(nextVerses);
        }
        document.addEventListener('keydown', handleKey);
        return () => {document.removeEventListener('keydown', handleKey);}
        }, [selectedVerse]);

    function getNextVerses(startingVerse: Verse | undefined, nextVerseCount: number){

        let nextVerses = [];

        for(let i = 1; i < nextVerseCount; i++){
            nextVerses.push(verses.find(some => some.number === (startingVerse?.number + i)));
        }

        return nextVerses 
    }

    function selectVerse(verse: Verse){
        setSelectedVerse(verse);
    }

    function handleKey(e: any){
        if(e.key === "ArrowLeft"){
            if(selectedVerse && selectedVerse.number > verseCount){
                let newVerse = verses.find(someVerse => someVerse.number === selectedVerse?.number - verseCount);
                setSelectedVerse(newVerse);
            }
            else if(selectedVerse && selectedVerse.number <= verseCount){
                let newVerse = verses.find(someVerse => someVerse.number === 1);
                setSelectedVerse(newVerse);
            }
        }
        if(e.key === "ArrowRight"){
            if(selectedVerse && (verses.length - selectedVerse.number >= verseCount)){
                let newVerse = verses.find(someVerse => someVerse.number === selectedVerse?.number + verseCount);
                setSelectedVerse(newVerse);
            }
            else if (selectedVerse && (verses.length - selectedVerse.number < verseCount)){
                let newVerse = verses.find(someVerse => someVerse.number === verses.length);
                setSelectedVerse(newVerse);
            }
        }
    }

    return (
        <div id="search_results" className="flex flex-col px-2 w-full overflow-auto select-none">
            {verses?.map((verse : Verse) => <VerseComponent key={verse.number} className="font-light" verse={verse} selectVerse={selectVerse} selectedVerse={selectedVerse}/>)}
        </div>
    )
}
