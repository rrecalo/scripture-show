import Verse from '../types/Verse'
export default function DisplayMonitor(verseToDisplay : Verse | undefined){

    return (
        <>
        <div className="p-2">Monitoring</div>
           <div className="p-3">
            <div id="display" className="text-2xl">{verseToDisplay?.text || ""}</div>
            <div className="font-bold text-sm">{verseToDisplay?.book_name || ""} 
            {(verseToDisplay?.chapter || "") + ":" + (verseToDisplay?.number || "")}</div>
        </div>
        </>
    )
}
