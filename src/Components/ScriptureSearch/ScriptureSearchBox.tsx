import { useEffect, useState } from "react";
import { GetVersesResult } from './../../App';
import { IoSearch } from "react-icons/io5";
import { easeInOut, motion } from "framer-motion";

type ScriptureSearchBoxProps = {
    performSearch : Function,
    getChapterCount : Function,
}

export default function ScriptureSearchBox({performSearch, getChapterCount} : ScriptureSearchBoxProps){

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
        if(e.target.id !== "search_container" && e.target.id !== "search_box" && e.target.id !== "search_icon" && e.target.id !== "search_icon_container" ){
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
            let input = document.getElementById("search_box");
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

    //justifyContent: isSearching ? "left" : "center",
    //width: isSearching ? "100%" : "50%",

    function handleSearchDivClick(){
        console.log("div clicked!");
        setSearching(true);
        let searchBox = document.getElementById("search_box");
        if(searchBox){
            searchBox.focus();
        }

    }

    return (
        <div id="search_container" className="flex justify-center items-center bg-inherit w-full h-full min-h-[30px] p-1 ps-2 pt-2 rounded-md"
        onClick={()=>handleSearchDivClick()}>
            <motion.div className="w-1/4 flex justify-start items-center" layout
            animate={{width: isSearching ? "100%" : "25%", x: isSearching ? "-8px": 0,
             transition:{duration:0.35}}}>
                <div className="flex w-full justify-center items-center gap-2">
                    <motion.div  onClick={(e)=>{e.preventDefault(); e.stopPropagation(); handleSearchDivClick();}}
                    id="search_icon_container" layout="preserve-aspect" className="w-5 h-5" animate={{opacity: isSearching ? 0 : 1, width: isSearching ? "0px": "20px",
                        transition:{duration:0.5}}}>
                        <IoSearch id="search_icon" className="w-full h-5 text-neutral-400"/> 
                    </motion.div>
                    <input id="search_box" className="text-left outline-none w-1/2 h-full bg-inherit"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    onKeyDown={(e)=>handleKeyDown(e)}
                    value={searchValue} onChange={(e)=>setSearchValue(e.target.value)}
                    placeholder="Search"></input>
                    {
                    queryResult
                    ?
                    <motion.div className="bg-inherit dark:text-neutral-400 w-1/2 h-full" initial={{opacity:0}} animate={{opacity:1}}>
                        {queryResult} {chapterCount !== undefined ? ("1-"+chapterCount) : ""}
                    </motion.div>
                    : <div className="bg-inherit w-1/2 h-full"></div>
                    }
                </div>
            </motion.div>
        </div>
    )
}
