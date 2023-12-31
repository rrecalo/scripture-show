import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { emit, listen } from '@tauri-apps/api/event';
import "./App.css";
import {BaseDirectory, createDir, readBinaryFile, writeBinaryFile} from '@tauri-apps/api/fs';
import Verse from "./types/Verse";
import ScriptureSearch from './Components/ScriptureSearch/ScriptureSearch';
import ScriptureSearchResults from "./Components/ScriptureSearch/ScriptureSearchResults";
import BookSelection from "./Components/BookSelection";
import MonitoringDisplay from './Components/MonitoringDisplay';
import { fs } from "@tauri-apps/api";
import { ProjectionConfiguration } from "./Components/MonitoringDisplay";
import ProjectionControls from "./Components/ProjectionControls";

export type GetVersesResult = {
    book_name: String,
    chapter_num: number,
    verses: Verse[],
    translation: any
}
type TranslatedVerseData = {
    book_name: String,
    chapter_num: number,
    verses: Verse[]
}

function App() {

  const appName = "scripture-show";
  const jsonConfigName = "scripture-show-config.json";
  const defaultVerseCount = 1;
  const defaultFontSize = 36;
  const defaultTranslations = ["esv", "ro"];
  const [verses, setVerses] = useState<Verse[]>([]);
  const [translatedVerseData, setTranslatedVerseData] = useState<TranslatedVerseData>();
  const [book, setBook] = useState<String>();
  const [chapter, setChapter] = useState<number>();
  const [shownVerses, setShownVerses] = useState<Verse[]>();
  const [displayOpened, setDisplayOpened] = useState<Boolean>(false);
  const [verseCount, setVerseCount] = useState<number>(1);
  const [darkMode, setDarkMode] = useState<Boolean>();
  const [bookList, setBookList] = useState<String[]>();
  const [projectionConfig, setProjectionConfig] = useState<ProjectionConfiguration>(
  {
      verseCount: defaultVerseCount,
      fontSize: defaultFontSize,
      translations: defaultTranslations,
  });

  useEffect(()=>{
    searchForBook("genesis", true);
    if(!displayOpened){
        setDisplayOpened(true);
    }
    (invoke("get_book_list", {version: "esv"}) as Promise<String[]>).then(
    (books : String[]) =>{
        setBookList(books);
    });

    listen("dark_mode", (event)=>{
        if(event.payload){
            setDarkMode(true);
            savePreferences({darkMode: true});
        }
        else{
            setDarkMode(false);
            savePreferences({darkMode: false});
        }
    });
    const unlisten = listen("open_choose_output", (_)=>{
        invoke("open_choose_output_window").then((response)=>{console.log(response)});;
    });
    
    emit('theme_update', darkMode);

    loadPreferences();
    return () => {unlisten.then(f=>f())};
    },[]);

  useEffect(()=>{
    if(projectionConfig){
        emit('projection_format', projectionConfig);
        const unlisten = listen('request_format', (_)=>{
            emit('projection_format', projectionConfig);
        });
        
        return () => {
            unlisten.then(f => f());
        }
    };
  },[projectionConfig]);

  useEffect(()=>{
    if(shownVerses){
        emit('display_verse', {eng: shownVerses, ro:  getTranslation(shownVerses)});
        const unlisten = listen('request_verses', (_)=>{
            emit('display_verse', {eng: shownVerses, ro:  getTranslation(shownVerses)});
        });

        return () => {
            unlisten.then(f => f());
        }
    }
  }, [shownVerses]);

  useEffect(()=>{
    listen("theme_request", (_)=>{
        if(darkMode !== undefined && darkMode !== null){
            emit('theme_update', darkMode);
        }
    });
    emit('theme_update', darkMode);
  },[darkMode])


    function loadPreferences(){
        const decoder = new TextDecoder();
        readBinaryFile(jsonConfigName, {dir:BaseDirectory.AppConfig}).then(
        res => {
            if(res){
            const prefs = JSON.parse(decoder.decode(res));
            setDarkMode(prefs.darkMode);
            }
        });
    }

    function savePreferences(preferences : any){
      const encoder = new TextEncoder();
      const prefsString = JSON.stringify(preferences);
      const encodedPrefs = encoder.encode(prefsString);
      console.log(BaseDirectory.Config);
      fs.exists(appName, {dir: BaseDirectory.Config}).then(exists =>
        {
        if(!exists){
            createDir(appName, {dir: BaseDirectory.Config });
        }
        
        writeBinaryFile(jsonConfigName, encodedPrefs, {dir: BaseDirectory.AppConfig});
        });
    }

    function getTranslation(verses: Verse[]){
        let translatedVerses:any[] = [];
        verses.forEach(verse => {
            translatedVerses.push(translatedVerseData?.verses.find(some => some.number === verse?.number));
        });
    
        return translatedVerses;

    }

    async function searchForBook(searchQuery: String, acceptChoice: boolean){
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
    console.log(book_name);
    let new_verses = await invoke("get_verses", {bookName: book_name, chNum: parseInt(ch_num), translations:["ro"]}) as GetVersesResult;
    if(acceptChoice){
        if(new_verses){
        setTranslatedVerseData(new_verses?.translation as TranslatedVerseData);
        setVerses(new_verses?.verses);
        setBook(new_verses?.book_name);
        setChapter(new_verses?.chapter_num);
        }
    }
    else{
        return searchQuery === "" ? undefined : new_verses;
    }
  }

  async function getChapterCount(bookName: string){
    if(bookName !== ""){
        let ch_count = await invoke("get_chapter_count", {bookName: bookName, version:"esv"}) as number;
        return ch_count;
    }
    else return undefined;
  }

  function handleChangeShownVerse(newVersesToShow: Verse[]){
    setShownVerses(newVersesToShow);
  }

  return (
    <div className={`container flex flex-row min-w-screen w-screen h-screen mx-auto ${darkMode ? 'dark bg-neutral-900' : ''}`}>
        <div id="book_list_container" className="border-black dark:border-neutral-700 border-r-0 overflow-y-auto w-fit overflow-x-hidden h-1/2">
            {bookList?.map(bookName => <BookSelection bookName={bookName} activeBookName={verses[0].book_name} openBook={searchForBook} />)}
        </div>
        <div className="flex flex-col w-7/12 h-1/2 overflow-y-auto overflow-x-hidden">
            <ScriptureSearch performSearch={searchForBook} currentBook={book} currentChapter={chapter} getChapterCount={getChapterCount}/>

            <div id="search_results" className="flex flex-col px-0 w-full overflow-y-auto select-none dark:bg-neutral-900">
                <ScriptureSearchResults verses={verses} changeSelectedVerse={handleChangeShownVerse} verseCount={verseCount}/>
            </div>

        </div>
        
        <div id="monitoring_area" className="flex flex-col w-5/12 h-screen bg-neutral-100 dark:bg-neutral-900">
            <div className="w-full min-h-[50%] max-h-[50%] bg-white">
                <MonitoringDisplay verseToDisplay={shownVerses?.slice(0, 1)[0]}/>
            </div>
            <div className="p-5 w-full h-full flex justify-start items-start dark:bg-neutral-900">
                <ProjectionControls config={projectionConfig} setConfig={setProjectionConfig}/>
            </div>
        </div>
    </div>
  );
}

export default App;
