import {BookmarkType} from './Bookmark'
import Bookmark from './Bookmark';

type BookmarkListProps = {
    selectBookmark: Function,
    bookmarks: BookmarkType[]
    }

export default function BookmarkList({selectBookmark, bookmarks}: BookmarkListProps){

    function handleBookmarkClicked(e: MouseEvent, b: BookmarkType){

        e.preventDefault();
        selectBookmark(b);

        }



    return (
        bookmarks.map(b => 
        <Bookmark key={b.verseStart+b.verseEnd} selectBookmark={handleBookmarkClicked} bookmark={b}/>
        )
    )
}
