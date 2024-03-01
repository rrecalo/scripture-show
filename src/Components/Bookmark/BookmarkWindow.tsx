import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { emit } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import {v4 as uuid} from 'uuid';
import ScriptureSearchBox from "../ScriptureSearch/ScriptureSearchBox";
import { getChapterCount } from "../../App";
import { GetVersesResult } from "../../App";
import VerseComponent from "../VerseComponent";
import Verse from '../../types/Verse';
import { BookmarkType } from "./Bookmark";
import { motion } from "framer-motion";

export default function BookmarkWindow({}){

    const [darkMode, setDarkMode] = useState<Boolean>();
    const [verseRange, setVerseRange] = useState<string>("");
    const [verses, setVerses] = useState<Verse[]>([]);
    const [book, setBook] = useState<String>();
    const [chapter, setChapter] = useState<number>();
    const [chosenVerseNums, setChosenVerseNums] = useState<number[]>();
    const [startingVerseNum, setStartingVerseNum] = useState<number>(1);
    const containerRef = useRef(null);

    useEffect(()=>{
        
        listen('theme_update', (event : any) =>{
            setDarkMode(event.payload);
            });
        
        emit("theme_request", "choose_output");
    },[]);

    function scrollToVerse(){
        if(startingVerseNum && containerRef.current){
            setTimeout(()=>{
                if(containerRef.current){
                    const itemRef = containerRef.current.childNodes[startingVerseNum-1];
                    if (itemRef) {
                        itemRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }, 50);
        }
    }

    useEffect(()=>{
        scrollToVerse();
    }, [startingVerseNum])

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

            }
        }   
    },[verses, verseRange]);

    async function performSearch(searchQuery: String, acceptChoice: boolean){

        searchQuery = searchQuery.trimEnd();
        searchQuery = searchQuery.toLowerCase();
        let starts_with_num = false;
        if(!isNaN(parseInt(searchQuery.charAt(0)))){
            starts_with_num = true;
        }   
        
        let first_space = searchQuery.indexOf(" ");

        let ch_space = searchQuery.substring(first_space+1, searchQuery.length).indexOf(" ")+first_space+1;

        let verse_space = searchQuery.lastIndexOf(" ");

        //console.log(first_space, ch_space, verse_space);

        //default values if somehow the query string won't match any of the
        //filtering below
        let ch_num = "1";
        let book_name = "genesis";

        //if there is more than one space, there must be a chapter number and the
        //book_name can be extrapolated from slice of 0->ch_space
        //example input value : '1 john 3' 
        //'1 jo 3' will also work since the string is split as shown
        //{book_name}[space]{ch_num}
        if(first_space > 0 && ch_space > 0 && first_space !== ch_space && (ch_space !== verse_space || starts_with_num)){
            ch_num = searchQuery.slice(ch_space+1, searchQuery.length);
            book_name = searchQuery.slice(0, ch_space);
        }
        //if there is only ONE space, get the ch num provided (if any);
        else{
            //catches queries for non-numbered book names followed by a chapter number
            //{book_name (non number start)}[space]{ch_num}
            if(!starts_with_num && first_space > 0){
                if(ch_space !== first_space){
                    ch_num = searchQuery.slice(first_space, ch_space);
                    book_name = searchQuery.slice(0, first_space);
                }
                else{
                    ch_num = searchQuery.slice(ch_space+1, searchQuery.length);
                    book_name = searchQuery.slice(0, first_space);
                }
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
                //setTranslatedVerseData(new_verses?.translation as TranslatedVerseData);
                setVerses(new_verses?.verses);
                setBook(new_verses?.book_name);
                setChapter(new_verses?.chapter_num);
                //setVerseRange("1-"+new_verses?.verses.length);
                setVerseRange("1-"+new_verses?.verses.length);
                setChosenVerseNums(undefined);
                //setRemainderVerses([]);
                //if there is a space, there will be a verse number followed by the chapter number (since .trimEnd is being used on inputs)
                if((verse_space !== ch_space) || (!starts_with_num && ch_space !== first_space)){
                    let verse_num_to_select = parseInt(searchQuery.substring(verse_space+1, searchQuery.length));
                    setStartingVerseNum(verse_num_to_select);
                }
                else {
                    setStartingVerseNum(1);
                }
            }
        }
        else{
            return searchQuery === "" ? undefined : new_verses;
        }
  }

    function createBookmark(){
        if(chosenVerseNums){
            //emit("create_bookmark", {id: uuid(), book: book, chapter:chapter, verseStart:chosenVerseNums[0], verseEnd:chosenVerseNums[chosenVerseNums.length-1]} as BookmarkType);
            emit("create_bookmark", {id: uuid(), book: book, chapter:chapter, verseStart:startingVerseNum} as BookmarkType);
            setVerseRange("");
            setVerses([]);
            setBook(undefined);
            setChapter(undefined);
            setChosenVerseNums(undefined);
        }
        
    }

    return (
        <motion.div initial={{opacity:0.5}} animate={{opacity:1}} className={`flex flex-col justify-start items-center cursor-default min-w-screen min-h-screen h-full w-full overflow-clip ${darkMode ? 'dark bg-neutral-900' : ''}`}>
            <div className="fixed top-0 h-6 w-full" data-tauri-drag-region></div>

            <div className="w-full pt-6 bg-neutral-800 border-b border-neutral-700">
                 <div className="flex justify-start items-start pt-1 pl-3 pe-3 text-neutral-200 text-sm h-1/10 pb-1 font-bold w-full">
                    Create Bookmark
                </div>
                <div className="ps-1 pt-1 pl-1 text-neutral-500 border-b border-neutral-700 text-sm w-full">
                    <div className="pl-3">Book and Chapter</div>
                </div>
                <div className="dark:text-neutral-300 w-full ps-2 pt-2 bg-neutral-900 pb-1">
                    <ScriptureSearchBox searchBoxId="bookmark_search" performSearch={performSearch} getChapterCount={getChapterCount}/>  
                </div>

                <div className="ps-1 pt-3 pl-1 text-neutral-500 border-b border-neutral-700 text-sm w-full">
                <div className="pl-3">Verse range</div>
                </div>
                <div className="flex justify-start items-center dark:text-neutral-300 w-full ps-2 pt-2 bg-neutral-900 pb-1">
                    <input className="outline-none w-1/2 h-full bg-inherit p-1 ps-2" autoComplete="off"
                    placeholder="Enter a range of verses (i.e. 1-5)" value={verseRange} onChange={(e)=>setVerseRange(e.target.value)}/>
                    <div className="bg-inherit dark:text-neutral-400 w-1/2 h-full p-1">
                        {verses.length > 0 ? "Verses 1-" : ""}{verses.length > 0 ? verses.length : ''}                    
                    </div>
                </div>
            </div>

            <div className="w-full h-[50%] flex flex-col justify-start items-start">
                <div className="w-full">
                    <div className="w-full pl-3 py-1 dark:text-neutral-300 b backdrop-blur-2xl">
                        {book} {chapter}{verses.length > 0 ? ':' : ''}{verseRange}
                    </div>
                </div>
                <div ref={containerRef} className="overflow-y-auto h-[175px] overflow-x-hidden">
                {
                    verses
                    .filter((v: Verse) => chosenVerseNums?.includes(v.number))
                    ?.map((verse : Verse) => <VerseComponent id={verse.number.toString()} key={verse.number} verse={verse} selectVerse={()=>{}} selectedVerse={verses[startingVerseNum-1]}/>)
                }
                </div>

                <button className="mt-4 ml-4 px-4 py-1.5 dark:bg-neutral-800 rounded-md text-neutral-200 text-sm"
                onClick={createBookmark}>

                    Create Bookmark
                </button>
            </div>
        </motion.div>
    )
}
