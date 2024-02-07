
export type BookmarkType = {
    book: String,
    chapter: number,
    verseStart: number,
    verseEnd: number
}

type BookmarkProps = {
    bookmark: BookmarkType,
    selectBookmark: Function
}

export default function Bookmark({bookmark, selectBookmark} : BookmarkProps){

    return(
        <div onClick={(e:any) => selectBookmark(e, bookmark)}
        className={`w-full ps-1 font-light text-sm w-full pe-8 whitespace-nowrap select-none cursor-default text-neutral-400`}>
            {bookmark.book + " " + bookmark.chapter+":"+bookmark.verseStart + "-" + bookmark.verseEnd}
        </div>
    )

}
