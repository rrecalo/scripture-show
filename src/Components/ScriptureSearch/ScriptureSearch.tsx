import ScriptureSearchBox from "./ScriptureSearchBox";

export default function ScriptureSearch({performSearch, currentBook, currentChapter}){


    return (
        <div className="w-full flex flex-col h-fit p-2">
            <ScriptureSearchBox performSearch={performSearch}/>
            <div>{currentBook} {currentChapter}</div>
        </div>
    )
}
