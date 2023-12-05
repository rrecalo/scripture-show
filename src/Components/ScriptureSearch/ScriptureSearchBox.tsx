import { useEffect, useState } from "react";
import { GetVersesResult } from './../../App';

type ScriptureSearchBoxProps = {
    performSearch : Function,
    getChapterCount : Function,
}

export default function ScriptureSearchBox({performSearch, getChapterCount} : ScriptureSearchBoxProps){

    const [searchValue, setSearchValue] = useState("");
    const [queryResult, setQueryResult] = useState<String>("");
    const [chapterCount, setChapterCount] = useState<number>();

    function handleKeyDown(e: any){
        if(e.key === "Enter"){
            //e.preventDefault();
            performSearch(searchValue, true);
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

    return (
        <div className="flex justify-start items-center bg-inherit w-full h-full min-h-[24px]">
            <input className="outline-none w-1/2 h-full bg-inherit"
            autoComplete="off"
            onKeyDown={(e)=>handleKeyDown(e)}
            value={searchValue} onChange={(e)=>setSearchValue(e.target.value)}
            placeholder="Search for a book..."></input>
            <div className="bg-inherit dark:text-neutral-400 w-1/2 h-full">
                {queryResult} {chapterCount !== undefined ? ("1-"+chapterCount) : ""}
            </div>
        </div>
    )
}
