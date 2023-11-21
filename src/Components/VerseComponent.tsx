import {useState, useEffect} from 'react'
import Verse from '../types/Verse';


type VerseComponentProps = {
    verse : Verse,
    selectVerse : Function,
    selectedVerse : Verse | undefined,
}

export default function VerseComponent({verse, selectVerse, selectedVerse} : VerseComponentProps){


    return (
        <div className={`${verse?.text === selectedVerse?.text ? 'bg-neutral-200' : ''} select-none cursor-default`} onClick={()=>selectVerse(verse)}>
            {verse.number} | {verse.text}
        </div>
    )

}
