import ScriptureSearchBox from "./ScriptureSearchBox";

export default function ScriptureSearch({performSearch, currentBook, currentChapter}){


    function decrementChapter(){
        performSearch(currentBook+" "+(currentChapter-1));
    }

    function incrementChapter(){
        performSearch(currentBook+" "+(currentChapter+1));
    }

    return (
        <div className="w-full flex flex-col h-fit p-2 dark:bg-neutral-900 dark:text-neutral-300">
            <ScriptureSearchBox performSearch={performSearch}/>
            <div className="flex flex-row justify-between items-center pe-2 py-1 border-black">
                <div className="select-none cursor-default">{currentBook} {currentChapter}</div>
                <div className="flex flex-row gap-2 justify-center items-center">
                    <button className="outline-none hover:bg-neutral-200 dark:hover:bg-neutral-800 w-5 h-full" onClick={()=>{decrementChapter()}}>&#8592;</button>
                    Chapter {currentChapter}
                    <button className="outline-none hover:bg-neutral-200 dark:hover:bg-neutral-800 w-5 h-full" onClick={()=>{incrementChapter()}}>&#8594;</button>
                </div>

            </div>
        </div>
    )
}
