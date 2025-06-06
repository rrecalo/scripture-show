import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { emit, listen } from '@tauri-apps/api/event';
import "./App.css";
import {BaseDirectory, createDir, readBinaryFile, writeBinaryFile} from '@tauri-apps/api/fs';
import Verse from "./types/Verse";
import ScriptureSearch from './Components/ScriptureSearch/ScriptureSearch';
import ScriptureSearchResults from "./Components/ScriptureSearch/ScriptureSearchResults";
import BookSelection from "./Components/MainWindow/BookSelection";
import { fs } from "@tauri-apps/api";
import ProjectionDisplay from "./Components/ProjectionView/ProjectionDisplay";
import BookmarkList from "./Components/Bookmark/BookmarkList";
import { BookmarkType } from "./Components/Bookmark/Bookmark";
import { AiOutlinePlus } from 'react-icons/ai';
import VerseHistory from "./Components/History/VerseHistory";
import ProjectionConfiguration from "./types/ProjectionConfiguration";
import { motion } from "framer-motion";
import { CustomScreen } from "./Components/ConfigureScreens/ConfigureScreens";
import ScreenToggleComponent from "./Components/MainWindow/ScreenToggleComponent";
import ThemeChangeComponent from "./Components/MainWindow/ThemeChangeComponent";
import FindVerseComponent from "./Components/MainWindow/FindVerseComponent";

export type GetVersesResult = {
    book_name: String,
    chapter_num: number,
    verses: Verse[],
    translation: any
}
export type TranslatedVerseData = {
    book_name: String,
    chapter_num: number,
    verses: Verse[]
}

export async function getChapterCount(bookName: string){
    if(bookName !== ""){
        let ch_count = await invoke("get_chapter_count", {bookName: bookName, version:"esv"}) as number;
        return ch_count;
    }
    else return undefined;
  }

export const appName = "scripture-show";

function App() {

  const jsonConfigName = "scripture-show-config.json";
  const defaultVerseCount = 1;
  const defaultFontSize = 2;
  const defaultTranslations = ["esv", "ro"];
  const verseCount = 1;
  const [verses, setVerses] = useState<Verse[]>([]);
  const [translatedVerseData, setTranslatedVerseData] = useState<TranslatedVerseData>();
  const [book, setBook] = useState<String>();
  const [chapter, setChapter] = useState<number>();
  const [shownVerses, setShownVerses] = useState<Verse[]>();
  const [displayOpened, setDisplayOpened] = useState<Boolean>(false);
  const [darkMode, setDarkMode] = useState<Boolean>();
  const [bookList, setBookList] = useState<String[]>();
  const [customScreens, setCustomScreens] = useState<CustomScreen[]>();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const verseContainerRef = useRef(null);
  const bookContainerRef = useRef(null);
  const [projectionConfig, setProjectionConfig] = useState<ProjectionConfiguration>(
  {
      verseCount: defaultVerseCount,
      fontSize: defaultFontSize,
      translations: defaultTranslations,
      bgColor: "#ffffff",
      textColor: "#101219",
      verseTextWeight: 500,
      verseNumberWeight: 500,
      verseInfoWeight: 500,
  });


  const [lastTheme, setLastTheme] = useState<string>("");

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
    
    const unlisten_configure_screens = listen("open_configure_screens", (_)=>{
        invoke("open_configure_screens_window").then((response)=>{console.log(response)});
    });
    
    const unlisten_projection_customization = listen("open_projection_customization", (_) =>{
        invoke("open_projection_customization_window").then((response)=>{console.log(response)});
    });
    
    const unlisten_screens = listen("custom_screens_changed", (event)=>{
        setCustomScreens((event?.payload as any).screens);
    });

    emit('theme_update', darkMode);
    emit("load_projection_customization", projectionConfig);

    listen("search_hotkey", ()=>{
        let input = document.getElementById("search_box");
        if(input){
            input.click();
            input.focus();
        }
    })

    loadPreferences();
    
    return () => {
        unlisten_configure_screens.then(f=>f());
        unlisten_projection_customization.then(f=>f());
        unlisten_screens.then(f=>f());
        // unlisten_projection_customization_updates.then(f=>f());
        };
    },[]);

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
    const unlisten_theme = listen("theme_request", (_)=>{
        if(darkMode !== undefined && darkMode !== null){
            //console.log("sent darkMode: ", darkMode);
            emit('theme_update', darkMode);
        }
    });
    emit('theme_update', darkMode);
    
    return () => {
        unlisten_theme.then(f=>f());
    }
  },[darkMode])

  //this effect will recreate a listener each time the projectionConfig is
  //changed. this way, when the projection customization window is opened, it
  //can take off from where it left the configuration at previously
  useEffect(()=>{
        
  }, [projectionConfig]);

  useEffect(()=>{
    if(lastTheme){
        const unlisten = listen("last_theme", (event : any) =>{
            setLastTheme(event?.payload?.lastTheme);
        })

        const listen_theme_request = listen("last_theme_request", () =>{
            emit("load_last_theme", {lastTheme: lastTheme});
        });

        return () =>{
            unlisten.then(f=>f());
            listen_theme_request.then(f=>f());
        }
    }   
  }, [lastTheme]);

  useEffect(()=>{
    if(customScreens){
        const listen_screen_request = listen("request_custom_screens", ()=>{
            emit("send_screens", {screens: customScreens});
        });
        const unlisten_screens = listen("custom_screens_changed", (event)=>{
            setCustomScreens((event?.payload as any).screens);
        });
        return ()=>{
            unlisten_screens.then(f=>f());
            listen_screen_request.then(f=>f());
        }
    }
  }, [customScreens])

    function scrollToVerse(){
        if(shownVerses && verseContainerRef.current){
            setTimeout(()=>{
                if(verseContainerRef.current){
                    const itemRef = verseContainerRef.current.childNodes[shownVerses[0].number-1];
                    if (itemRef) {
                        itemRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }, 25);
        }
    }

    function scrollToBook(){
        if(shownVerses && bookContainerRef.current){
            setTimeout(()=>{
                if(bookContainerRef.current && bookList){
                    let index = bookList.findIndex(b=>b===book);
                    const itemRef = bookContainerRef.current.childNodes[index];
                    if (itemRef) {
                        itemRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }, 25);
        }
    }

useEffect(()=>{
    scrollToVerse();
}, [shownVerses])

useEffect(()=>{
    scrollToBook();
}, [book, bookList])

  useEffect(()=>{
    if(projectionConfig && darkMode && lastTheme && customScreens && bookmarks){
        savePreferences({...projectionConfig, darkMode, lastTheme, customScreens, bookmarks});

        emit('theme_update', darkMode);

        const configChangedListener = listen('projection_format', (event)=>{
            setProjectionConfig(event?.payload as any);
        });

        const unlisten = listen("projection_customization_request", (_)=>{
            if(projectionConfig){
                emit("load_projection_customization", projectionConfig);
            }
        });
        const unlisten_format = listen("request_format", (_)=>{
            if(projectionConfig){
                emit("projection_format", projectionConfig);
            }
        });
        return () => {
            unlisten.then(f=>f());
            unlisten_format.then(f=>f());
            configChangedListener.then(f=>f());

        }
    }
  }, [projectionConfig, darkMode, lastTheme, customScreens, bookmarks]);


    function loadPreferences(){
        const decoder = new TextDecoder();
        //appConfigDir().then(res=>{console.log(res)});
        //console.log(BaseDirectory.Config);
        readBinaryFile(jsonConfigName, {dir:BaseDirectory.AppConfig}).then(
        res => {
            if(res){
            const prefs = JSON.parse(decoder.decode(res));
                setDarkMode(prefs.darkMode);
                setLastTheme(prefs.lastTheme);
                setCustomScreens(prefs.customScreens);
                prefs.bookmarks ? setBookmarks(prefs.bookmarks) : setBookmarks([]);
                
                emit('send_screens', {screens:prefs.customScreens});
                //if default verse count is not found in the preferences, that means there probably aren't any preferences
                //in this case, set the preferences as the defaults
                if(prefs.verseCount === undefined || prefs.verseCount === null){
                    let defaults = {
                        verseCount: defaultVerseCount,
                        fontSize: defaultFontSize,
                        translations: defaultTranslations,
                        bgColor: "#ffffff",
                        textColor: "#101219",
                        verseTextWeight: 500,
                        verseNumberWeight: 500,
                        verseInfoWeight: 500,
                    } as ProjectionConfiguration;
                    setProjectionConfig(defaults);
                    emit('projection_format', defaults as ProjectionConfiguration);
                }
                else {
                    setProjectionConfig(prefs as ProjectionConfiguration);
                    emit('projection_format', prefs as ProjectionConfiguration);
                }
            }
        });
    }

    function savePreferences(preferences : any){
      const encoder = new TextEncoder();
      const prefsString = JSON.stringify(preferences);
      const encodedPrefs = encoder.encode(prefsString);
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

        searchQuery = searchQuery.trimEnd();
        searchQuery = searchQuery.toLowerCase();
        let starts_with_num = false;
        if(!isNaN(parseInt(searchQuery.charAt(0)))){
            starts_with_num = true;
        }   
        
        let first_space = searchQuery.indexOf(" ");

        let ch_space = searchQuery.substring(first_space+1, searchQuery.length).indexOf(" ")+first_space+1;

        let verse_space = searchQuery.lastIndexOf(" ");

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
        //console.log(book_name, ch_num);
        let new_verses = await invoke("get_verses", {bookName: book_name, chNum: parseInt(ch_num), translations:["ro"]}) as GetVersesResult;
        if(acceptChoice){
            if(new_verses){
                setTranslatedVerseData(new_verses?.translation as TranslatedVerseData);
                setVerses(new_verses?.verses);
                setBook(new_verses?.book_name);
                setChapter(new_verses?.chapter_num);
                //if there is a space, there will be a verse number followed by the chapter number (since .trimEnd is being used on inputs)
                //console.log(first_space, ch_space, verse_space);
                let verse_num_to_select = 1;
                if((verse_space !== ch_space) || (!starts_with_num && ch_space !== first_space)){
                    verse_num_to_select = parseInt(searchQuery.substring(verse_space+1, searchQuery.length));
                    let verse_to_select = new_verses?.verses[verse_num_to_select-1];
                    if(verse_to_select){
                        emit("select_verse", {verse: verse_to_select})
                        setShownVerses([verse_to_select]);
                    }
                    else {
                        emit("select_verse", {verse: new_verses?.verses[0]})
                        setShownVerses([new_verses?.verses[0]]);
                    }
                }
                else {
                    // if there is no verse_space, set the first verse as shown
                    emit("select_verse", {verse: new_verses?.verses[0]})
                    setShownVerses([new_verses?.verses[0]]);
                }
                emit("search_result", {book: new_verses?.book_name, chapter: new_verses?.chapter_num, verseStart: verse_num_to_select});

            }
        }
        else{
            return searchQuery === "" ? undefined : new_verses;
        }
  }

  

  function handleChangeShownVerse(newVersesToShow: Verse[]){
    setShownVerses(newVersesToShow);
  }
    
  async function openBookmark(bookmark: BookmarkType){
    let fullChapter = await invoke("get_verses", {bookName: bookmark.book.toLowerCase(), chNum: bookmark.chapter, translations:["ro"]}) as GetVersesResult;

    let newVerses = fullChapter?.verses;
   
    setShownVerses([newVerses[bookmark.verseStart-1]]);
    emit("select_verse", {verse: newVerses[bookmark.verseStart-1]});
    setVerses(newVerses);
    setTranslatedVerseData(fullChapter.translation as TranslatedVerseData);
    setBook(fullChapter?.book_name);
    setChapter(fullChapter?.chapter_num);

  }
    

  async function openBookmarkWindow(){
    await invoke("open_new_bookmark_window");
  }

  function toggleAllScreens(){
    let screens = customScreens;
    if(!screens){return;}
    for(let i = 0; i < screens.length; i++){
        let screenToUpdate = screens?.find(screen => screen.screen.name === screens[i].screen.name);
        if(screenToUpdate){
            screenToUpdate.screen.active = !screenToUpdate?.screen.active;
            invoke("open_display_monitor", {monitorName: screens[i].screen.name});
        }
    }
    setCustomScreens(screens);
}

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className={`container flex flex-row min-w-screen w-screen h-screen overflow-clip border border-neutral-950 
    dark:bg-neutral-800 bg-neutral-100 select-none 
    rounded-lg mx-auto ${darkMode ? 'dark bg-neutral-900' : ''}`}>
        <div className="fixed top-0 h-6 w-full" data-tauri-drag-region></div>
        <div className="pt-6 flex flex-col justify-start items-center dark:bg-neutral-800 bg-neutral-100 border border-l-0 border-neutral-700">
            <div className="w-full h-1/3 ps-1">
                <div className="flex justify-between items-center pt-1 pl-1 pe-3 text-neutral-200 text-sm h-1/10 pb-1 font-bold">
                    Bookmarks
                    
                    <motion.div animate={{color:"#a3a3a3", scale:1}} whileHover={{color: "#f5f5f5", scale:1.1}} onClick={openBookmarkWindow}>
                        <AiOutlinePlus />
                    </motion.div>
                </div>
                <div  className="w-full border-black dark:border-neutral-700 border-r-0 overflow-y-auto overflow-x-clip h-9/10 ">
                    <BookmarkList selectBookmark={openBookmark} bookmarks={bookmarks} setBookmarks={setBookmarks}/>
                </div>
            </div>  
            
            <div className="w-full h-1/3 ps-1 border-t border-neutral-700">
                <div className="pt-1 pl-1 text-neutral-200 text-sm px-1 h-1/10 pb-1 font-bold">
                    Book
                </div>
                <div ref={bookContainerRef} id="book_list_container" className="border-black dark:border-neutral-700 border-r-0 overflow-y-auto w-fit overflow-x-hidden h-[85%]">
                    {bookList?.map(bookName => <BookSelection key={bookName as any} bookName={bookName} activeBookName={verses[0].book_name} openBook={searchForBook} />)}
                </div>
            </div>
            
            <div className="w-full h-1/3 ps-1 border-t border-neutral-700">
                <div className="pt-1 pl-1 pb-1 text-neutral-200 text-sm px-1 h-1/10 font-bold">
                    History 
                </div>
                <div id="verse_history_container" className="border-black dark:border-neutral-700 border-r-0 overflow-x-hidden h-9/10 max-h-[90%] w-full pb-5">
                    <VerseHistory selectHistoryItem={openBookmark}/>
                </div>
            </div>

        </div>
        <div className="relative flex flex-col w-7/12 h-full overflow-y-auto overflow-x-hidden dark:bg-neutral-900">

            <ScriptureSearch performSearch={searchForBook} currentBook={book || ""} currentChapter={chapter || 1} getChapterCount={getChapterCount}/>
            <div id="search_results" ref={verseContainerRef} className="pt-2 pb-6 h-full flex flex-col px-0 w-full overflow-y-auto select-none dark:bg-neutral-900 overflow-x-clip">
                <ScriptureSearchResults book={book || ""} verses={verses} changeSelectedVerse={handleChangeShownVerse} verseCount={verseCount}/>
            </div>
        </div>
        
        <div id="monitoring_area" className="pt-2 flex flex-col w-5/12 h-full dark:bg-neutral-800 border border-neutral-700">
            <div className="pt-1 pl-2 pb-1 ps-3 text-neutral-200 text-sm font-bold">
                Display Monitor
            </div>
            {/* <MonitoringDisplay verseToDisplay={shownVerses?.slice(0, 1)[0]}/> */}
            <div className="w-full h-1/2 flex justify-center items-center border-b border-neutral-700">
                <div className="w-fit scale-[0.35] aspect-video">
                    <ProjectionDisplay audience={false}/>
                </div>
                
            </div>
            <div className="flex w-full h-full min-h-full">
                <div className="text-neutral-400 ps-3 flex-col justify-start items-center h-full w-1/2 border-r border-neutral-700">
                    <div className="pt-2 pb-1 text-neutral-200 text-sm h-1/10 font-bold">
                        Search by Phrase
                    </div>
                    <div className="h-[90%]">
                        <FindVerseComponent openReference={openBookmark}/>
                    </div>
                    
                </div>
                
                <div className="text-neutral-400 flex-col justify-start items-center w-1/2 h-full border-neutral-700">
                    {/* <div className="w-full border-b border-neutral-700 ps-3 pe-2 h-[12.5%]">
                        <div className="pt-2 pb-1 text-neutral-200 text-sm h-1/10 font-bold">
                            Quick Themes
                        </div>
                        <div className="w-full pt-1">
                            <ThemeChangeComponent lastTheme={lastTheme} setProjectionConfig={setProjectionConfig}/>
                        </div>
                    </div> */}
                    <div className="w-full ps-3 pe-2 h-5/6 bg-neutral-900">
                        <div className="flex justify-between items-center h-1/10 pt-2 pb-1">
                            <div className=" text-neutral-200 text-sm h-fit font-bold">
                                Screens 
                                
                            </div>
                            <motion.button whileHover={{backgroundColor: "#262626", color:"#f5f5f5"}} animate={{backgroundColor:"#171717", color:"#d4d4d4"}} className='w-fit px-2 h-fit py-1 rounded-lg text-sm border border-neutral-800' onClick={()=>toggleAllScreens()}>Master Toggle</motion.button>
                        </div>
                        <div className="h-[85%] overflow-y-auto pt-1">
                        <ScreenToggleComponent customScreens={customScreens} setCustomScreens={setCustomScreens}/>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    </motion.div>
  );
}

export default App;
