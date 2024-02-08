import {AiOutlineDelete} from 'react-icons/ai'
import {uuid} from 'uuidv4';


export type BookmarkType = {
    id: string,
    book: String,
    chapter: number,
    verseStart: number,
    verseEnd: number,
}

type BookmarkProps = {
    bookmark: BookmarkType,
    selectBookmark: Function,
    deleteBookmark: Function,

}

export default function Bookmark({bookmark, selectBookmark, deleteBookmark} : BookmarkProps){


    return(
        <div onClick={(e:any) => selectBookmark(e, bookmark)}
        className={`flex justify-between items-baseline w-full ps-1 font-light text-sm w-full pe-4 whitespace-nowrap select-none cursor-default text-neutral-400`}>
            {bookmark.book + " " + bookmark.chapter+":"+bookmark.verseStart + "-" + bookmark.verseEnd}
            <div className="w-3 h-3 text-red-500">
                <AiOutlineDelete className="" onClick={(e: MouseEvent) => deleteBookmark(e, bookmark)}/>
            </div>
        </div>
    )

}
