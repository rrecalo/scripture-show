import { useEffect, useState } from "react";
import { GetVersesResult } from './../../App';

type ScriptureSearchBoxProps = {
    performSearch : Function
}

export default function ScriptureSearchBox({performSearch} : ScriptureSearchBoxProps){

    const [searchValue, setSearchValue] = useState("");
    const [queryResult, setQueryResult] = useState<String>("");

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
                }
                else{
                    setQueryResult("");
                }

            });
        },[searchValue]);

    return (
        <div className="flex justify-start items-center bg-inherit w-full h-full min-h-[24px]">
            <input className="outline-none w-1/2 h-full bg-inherit"
            onKeyDown={(e)=>handleKeyDown(e)}
            value={searchValue} onChange={(e)=>setSearchValue(e.target.value)}
            placeholder="Search for a book..."></input>
            <div className="bg-inherit dark:text-neutral-400 w-1/2 h-full">
                {queryResult}
            </div>
        </div>
    )
}
