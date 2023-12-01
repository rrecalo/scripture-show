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
    const [startAtFirst, setStartAtFirst] = useState<Boolean>(false);

    useEffect(()=>{
        if(selectedVerse){
            setStartAtFirst(true);
        }
    }, [verses]);

    useEffect(()=>{
        if(selectedVerse){
            console.log(startAtFirst);
            let nextVerses = getNextVerses(selectedVerse, 2);
            nextVerses.unshift(selectedVerse);
            if(!startAtFirst){
            changeSelectedVerse(nextVerses);
            }
        }
        document.addEventListener('keydown', handleKey);
        return () => {document.removeEventListener('keydown', handleKey);}
        }, [selectedVerse, startAtFirst]);

    function getNextVerses(startingVerse: Verse | undefined, nextVerseCount: number){

        let nextVerses = [];

        for(let i = 1; i < nextVerseCount; i++){
            nextVerses.push(verses.find(some => some.number === (startingVerse?.number + i)));
        }

        return nextVerses 
    }

    function selectVerse(verse: Verse){
        if(startAtFirst){
            setStartAtFirst(false, setSelectedVerse(verse));
        }
        else{
            setSelectedVerse(verse);
        }
    }

    function handleKey(e: any){
        if(e.key === "ArrowLeft"){
            if(startAtFirst){
                setSelectedVerse(verses[0]);
                setStartAtFirst(false);
            }
            else if(selectedVerse && selectedVerse.number > verseCount){
                let newVerse = verses.find(someVerse => someVerse.number === selectedVerse?.number - verseCount);
                setSelectedVerse(newVerse);
            }
            else if(selectedVerse && selectedVerse.number <= verseCount){
                let newVerse = verses.find(someVerse => someVerse.number === 1);
                setSelectedVerse(newVerse);
            }
        }
        if(e.key === "ArrowRight"){
            if(startAtFirst){
                setSelectedVerse(verses[0]);
                setStartAtFirst(false);
            }
            else if(selectedVerse && (verses.length - selectedVerse.number >= verseCount)){
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
        <div id="search_results" className="flex flex-col px-0 w-full overflow-auto select-none dark:bg-neutral-900">
            {verses?.map((verse : Verse) => <VerseComponent key={verse.number} className="font-light" verse={verse} selectVerse={selectVerse} selectedVerse={selectedVerse}/>)}
        </div>
    )
}
