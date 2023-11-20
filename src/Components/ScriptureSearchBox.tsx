import { useState } from "react";

export default function ScriptureSearchBox({performSearch}){

    const [searchValue, setSearchValue] = useState("");

    function handleKeyDown(e: any){
        if(e.key === "Enter"){
            e.preventDefault();
            performSearch(searchValue);
        }
    }

    return (

        <input className="outline-none"
        onKeyDown={(e)=>handleKeyDown(e)}
        value={searchValue} onChange={(e)=>setSearchValue(e.target.value)}
        placeholder="Search for a book..."></input>

    )
}
