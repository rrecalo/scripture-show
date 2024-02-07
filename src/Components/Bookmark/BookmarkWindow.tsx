import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { emit } from "@tauri-apps/api/event";
import { useEffect, useState } from "react"
import ScriptureSearchBox from "../ScriptureSearch/ScriptureSearchBox";
import { getChapterCount } from "../../App";
import { GetVersesResult } from "../../App";
import {TranslatedVerseData} from '../../App';
import VerseComponent from "../VerseComponent";
import Verse from '../../types/Verse';
import { BookmarkType } from "./Bookmark";

export default function BookmarkWindow({}){

    const [darkMode, setDarkMode] = useState<Boolean>();
    const [verseRange, setVerseRange] = useState<string>("");
    const [verses, setVerses] = useState<Verse[]>([]);
    const [translatedVerseData, setTranslatedVerseData] = useState<TranslatedVerseData>();
    const [book, setBook] = useState<String>();
    const [chapter, setChapter] = useState<number>();
    const [chosenVerseNums, setChosenVerseNums] = useState<number[]>();


    useEffect(()=>{
        
        listen('theme_update', (event : any) =>{
            setDarkMode(event.payload);
            });
        
        emit("theme_request", "choose_output");
    },[]);

    useEffect(()=>{
        if(verseRange.length > 0){
            let matches = verseRange.match(/(\d+)-(\d+)/);
            if(matches){
                let nums: number[] = [];
                let startVerseNum = parseInt(matches[1]);
                let endVerseNum = parseInt(matches[2]);
                for(let i=startVerseNum; i<=endVerseNum; i++){
                    nums.push(i);
                };
                setChosenVerseNums(nums);
                console.log(nums);

            }
        }   
    },[verseRange]);

    async function performSearch(searchQuery: String, acceptChoice: boolean){
        searchQuery = searchQuery.toLowerCase();
        let starts_with_num = false;
        if(!isNaN(parseInt(searchQuery.charAt(0)))){
            starts_with_num = true;
        }   
        
        let first_space = searchQuery.indexOf(" ");
        let last_space = searchQuery.lastIndexOf(" ");
        //default values if somehow the query string won't match any of the
        //filtering below
        let ch_num = "1";
        let book_name = "genesis";

        //if there is more than one space, there must be a chapter number and the
        //book_name can be extrapolated from slice of 0->last_space
        //example input value : '1 john 3' 
        //'1 jo 3' will also work since the string is split as shown
        //{book_name}[space]{ch_num}
        if(first_space > 0 && last_space > 0 && first_space !== last_space){
            //ch_num = searchQuery.slice(last_space+1, last_space+2);
            ch_num = searchQuery.slice(last_space+1, searchQuery.length);
            book_name = searchQuery.slice(0, last_space);
        }
        //if there is only ONE space, get the ch num provided (if any);
        else{
            //catches queries for non-numbered book names followed by a chapter number
            //{book_name (non number start)}[space]{ch_num}
            if(!starts_with_num && first_space > 0){
            //ch_num = searchQuery.slice(first_space+1, first_space+2);
            ch_num = searchQuery.slice(last_space+1, searchQuery.length);
            book_name = searchQuery.slice(0, first_space);
            }
            //catches just book name queries that have no spaces
            //'proverbs' 'Revelations
            else{
                book_name = searchQuery.toString();
            }
        }

        let new_verses = await invoke("get_verses", {bookName: book_name, chNum: parseInt(ch_num), translations:["ro"]}) as GetVersesResult;
        if(acceptChoice){
            if(new_verses){
            
            setTranslatedVerseData(new_verses?.translation as TranslatedVerseData);
            setVerses(new_verses?.verses);
            setBook(new_verses?.book_name);
            setChapter(new_verses?.chapter_num);
            setVerseRange("1-"+new_verses?.verses.length);
            setChosenVerseNums(undefined); 
            
            }
        }
        else{
            return searchQuery === "" ? undefined : new_verses;
        }

    }

    function createBookmark(){
        if(chosenVerseNums){
            emit("create_bookmark", {book: book, chapter:chapter, verseStart:chosenVerseNums[0], verseEnd:chosenVerseNums[chosenVerseNums.length-1]} as BookmarkType);
            setVerseRange("");
            setChosenVerseNums(undefined);
        }
        
    }

    return (
        <div className={`flex flex-col justify-start items-start ps-0 pt-1 cursor-default min-w-screen min-h-screen h-full w-full ${darkMode ? 'dark bg-neutral-900' : ''}`}>
            <div className="ps-1 pt-1 pl-1 text-neutral-500 border-b border-neutral-700 text-sm w-full">
                Book and Chapter
            </div>
            <div className="dark:text-neutral-300 w-full ps-2 pt-2 bg-neutral-800">
                <ScriptureSearchBox performSearch={performSearch} getChapterCount={getChapterCount}/>  
            </div>

            <div className="ps-1 pt-3 pl-1 text-neutral-500 border-b border-neutral-700 text-sm w-full">
                Verse range
            </div>
            <div className="dark:text-neutral-300 w-full ps-2 pt-2 bg-neutral-800 flex justify-between items-center">
                <input className="outline-none w-1/2 h-full bg-inherit" autoComplete="off"
                placeholder="Enter a range of verses (i.e. 1-5)" value={verseRange} onChange={(e)=>setVerseRange(e.target.value)}/>
                <div className="bg-inherit dark:text-neutral-400 w-1/2 h-full">
                    Verses 1-{verses.length}                    
                </div>
            </div>

            <div className="ps-1 pt-3 pl-1 text-neutral-500 border-b border-neutral-700 text-sm w-full">
                Bookmark Preview
            </div>
            <div className="pl-3 py-2 dark:text-neutral-300">
                {book} {chapter}:{verseRange}
            </div>
            <div className="overflow-y-scroll h-[200px]">
            {
                verses
                .filter((v: Verse) => chosenVerseNums?.includes(v.number))
                ?.map((verse : Verse) => <VerseComponent key={verse.number} verse={verse} selectVerse={()=>{}} selectedVerse={undefined}/>)
            }
            </div>

            <button className="mt-4 ml-4 px-4 py-1.5 dark:bg-neutral-800 rounded-md text-neutral-200 text-sm"
            onClick={createBookmark}>

                Create Bookmark
            </button>
        </div>
    )
}
