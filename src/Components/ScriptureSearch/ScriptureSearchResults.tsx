import VerseComponent from '../VerseComponent';
import Verse from '../../types/Verse';
import {useEffect, useState} from 'react';
import { AnimatePresence } from 'framer-motion';

type ScriptureSearchResultsProps = {
    book: string,
    verses: Verse[],
    changeSelectedVerse: Function,
    verseCount: number,
}

export default function ScriptureSearchResults({book, verses, changeSelectedVerse, verseCount} : ScriptureSearchResultsProps){

    const [selectedVerse, setSelectedVerse] = useState<Verse>();
    const [startAtFirst, setStartAtFirst] = useState<Boolean>(false);

    useEffect(()=>{
        setStartAtFirst(true);
    }, [book]);

    useEffect(()=>{
        if(selectedVerse){
            //console.log(startAtFirst);
            //let nextVerses = [];
            let nextVerses = getNextVerses(selectedVerse, verseCount);
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
            setStartAtFirst(false);
            setSelectedVerse(verse);
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
            //if you are NOT on the first verse within the selection, continue
            //iterating through
            else if(selectedVerse && (selectedVerse.number - verses[0].number) > verseCount){
                let newVerse = verses.find(someVerse => someVerse.number === selectedVerse?.number - verseCount);
                setSelectedVerse(newVerse);
            }
            //if you are on the first verse in the selection, do NOT move past
            //it (stay on the first verse)
            else if(selectedVerse && (selectedVerse.number - verses[0].number) <= verseCount){
                let newVerse = verses.find(someVerse => someVerse.number === verses[0].number);
                setSelectedVerse(newVerse);
            }
        }
        if(e.key === "ArrowRight"){
            if(startAtFirst){
                setSelectedVerse(verses[0]);
                setStartAtFirst(false);
            }
            //if there are verses left to select, select the next verse
            else if(selectedVerse && ((verses[0].number + verses.length - selectedVerse.number) > verseCount)){
                
                let newVerse = verses.find(someVerse => someVerse.number === selectedVerse?.number + verseCount);
                setSelectedVerse(newVerse);
            }
            //if there is only one verse left to select, select it
            else if (selectedVerse && ((verses[0].number + verses.length - selectedVerse.number) < verseCount)){
                let newVerse = verses.find(someVerse => someVerse.number === verses.length);
                setSelectedVerse(newVerse);
            }
        }
    }

    return (
        <AnimatePresence mode='wait'>
            {verses?.map((verse : Verse) => <VerseComponent key={verse.text} verse={verse} selectVerse={selectVerse} selectedVerse={selectedVerse}/>)}
        </AnimatePresence>
    )
}
