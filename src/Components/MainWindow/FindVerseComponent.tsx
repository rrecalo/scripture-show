import { invoke } from "@tauri-apps/api";
import { motion } from "framer-motion";
import { Key, useState } from "react";
import { IoSearch } from "react-icons/io5";

type ReferenceMatch = {
  reference: String,
  similarity: number,
}

type Props = {
  openReference: Function,
}

function FindVerseComponent({openReference} : Props) {

  const [searchValue, setSearchValue] = useState<String>("");
  const [matches, setMatches] = useState<any[]>();
  const [isSearching, setSearching] = useState<boolean>(true);

  async function searchForPhrase(){
    let matching_verses = await invoke("search_for_match", {query: searchValue, version:"esv"}) as ReferenceMatch[];
    matching_verses.sort((a, b) => b.similarity - a.similarity);
    setMatches(matching_verses);
  }

  function handleKeyDown(e: any){
    if(e.key === "Enter"){
        if(searchValue.length > 8){
        searchForPhrase();
        setSearching(false);
        setSearchValue("");
        let input = document.getElementById("search_box");
        input?.blur();
        }
    }
    else if(e.key === "Tab"){
        e.preventDefault();
    }
    else{
        
    }
}

  return (
    <div className="w-full h-fit flex flex-col">
      <div>
        <motion.div className="w-1/4 flex justify-start items-center pe-2" layout
            animate={{width: isSearching || true ? "100%" : "25%", x: isSearching || true ? "0px": 0, paddingLeft : true ? "0px" : "0px",
             transition:{duration:0.25}}}>
                <div id="search_box_container" className={`flex w-full justify-center items-center gap-2 border border-neutral-700 rounded-lg pl-2`}>
                    <motion.div onClick={(e)=>{e.preventDefault(); e.stopPropagation(); 
                    }}
                    id="search_icon_container" layout="preserve-aspect" className="w-4 h-4" 
                    >
                        <IoSearch id="search_icon" className="w-4 h-4 text-neutral-400"/> 
                    </motion.div>
                    <input id={"search_box"} className={`text-left outline-none w-full h-full bg-inherit py-1 ${isSearching ? "cursor-text": "cursor-default" }`}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    onKeyDown={(e)=>handleKeyDown(e)}
                    value={searchValue} onChange={(e)=>setSearchValue(e.target.value.trimStart())}
                    placeholder="Search"></input>

                </div>
            </motion.div>
      </div>
      <div className="max-h-[50%] pt-2">
      {matches?.map(m=><div className='text-sm text-neutral-400' key={m.reference as Key}>
        {m.reference}
        {/* + " - " + Math.trunc(m.similarity*100)/100 */}
      </div>)}
      </div>
    </div>      
  )
}

export default FindVerseComponent