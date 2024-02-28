import { useEffect, useState } from "react";
import { GetVersesResult } from './../../App';
import { IoSearch } from "react-icons/io5";
import { easeInOut, motion } from "framer-motion";
import { listen } from "@tauri-apps/api/event";
// import { register } from "@tauri-apps/api/globalShortcut";

type ScriptureSearchBoxProps = {
    performSearch : Function,
    getChapterCount : Function,
    searchBoxId?: string,
}

    export default function ScriptureSearchBox({performSearch, getChapterCount, searchBoxId} : ScriptureSearchBoxProps){

    const [searchValue, setSearchValue] = useState("");
    const [queryResult, setQueryResult] = useState<String>("");
    const [chapterCount, setChapterCount] = useState<number>();
    const [isSearching, setSearching] = useState<boolean>(false);

    useEffect(()=>{
        let root = document.getElementById("root");
        if(root){
            root.addEventListener("click", stopSearch);    

            return () => {root?.removeEventListener("click", stopSearch);}
        }

    }, [])

    function stopSearch(e: any){
        if(e.target.id !== "search_container" && e.target.id !== "search_box" && e.target.id !== "search_icon" && e.target.id !== "search_icon_container" 
        && e.target.id !== "search_box_container" && e.target.id !== searchBoxId){
            setSearching(false);
            setSearchValue("");
        }

    }

    function handleKeyDown(e: any){
        if(e.key === "Enter"){
            //e.preventDefault();
            performSearch(searchValue, true);
            setSearching(false);
            setSearchValue("");
            let input = document.getElementById(searchBoxId || "search_box");
            input?.blur();
        }
        else if(e.key === "Tab"){
            e.preventDefault();
            setSearchValue(queryResult.toString());
            //to make autocomplete automatically retrieve book, uncomment below
            //performSearch(queryResult, true);
            setQueryResult("");
        }
        else{
            
        }
    }

    useEffect(()=>{
        performSearch(searchValue, false).then((res: GetVersesResult) =>{
                if(res){
                    setQueryResult(res.book_name);
                    getChapterCount(res.book_name).then((result : any)=>{
                        if(result){
                            setChapterCount(result);
                        }
                    });
                }
                else{
                    setQueryResult("");
                    setChapterCount(undefined);
                }
 
            });
        },[searchValue]);

    function handleSearchDivClick(){
        setSearching(true);
        let searchBox = document.getElementById(searchBoxId || "search_box");
        if(searchBox){
            searchBox.focus();
        }

    }

    return (
        <div id="search_container" className="flex justify-start items-center bg-inherit w-full h-full min-h-[35px] pt-2 pb-2 rounded-md"
        onClick={()=>handleSearchDivClick()}>
            <motion.div className="w-1/4 flex justify-start items-center" layout
            animate={{width: isSearching ? "100%" : "25%", x: isSearching ? "0px": 0, paddingLeft : isSearching ? "0px" : "0px",
             transition:{duration:0.35}}}>
                <div id="search_box_container" className={`flex w-full justify-center items-center gap-2 border border-neutral-700 rounded-lg ${isSearching ? 'pl-0' : 'pl-2'}`}>
                    <motion.div onClick={(e)=>{e.preventDefault(); e.stopPropagation(); handleSearchDivClick();}}
                    id="search_icon_container" layout="preserve-aspect" className="w-4 h-4" animate={{opacity: isSearching ? 0 : 1, width: isSearching ? "0px": "24px",
                        transition:{duration:0.5}}}>
                        <IoSearch id="search_icon" className="w-4 h-4 text-neutral-400"/> 
                    </motion.div>
                    <input id={searchBoxId || "search_box"} className={`text-left outline-none w-full h-full bg-inherit py-1 ${isSearching ? "cursor-text": "cursor-default" }`}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    onKeyDown={(e)=>handleKeyDown(e)}
                    value={searchValue} onChange={(e)=>setSearchValue(e.target.value)}
                    placeholder="Search"></input>
                    {
                    queryResult
                    ?
                    <motion.div className="bg-inherit dark:text-neutral-400 w-1/2 h-full text-center" initial={{opacity:0}} animate={{opacity:1}}>
                        {queryResult} {chapterCount !== undefined ? ("1-"+chapterCount) : ""}
                    </motion.div>
                    : <div className="bg-inherit w-1/2 h-full"></div>
                    }
                </div>
            </motion.div>
        </div>
    )
}
