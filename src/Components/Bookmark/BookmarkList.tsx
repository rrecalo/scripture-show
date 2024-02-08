import { useEffect, useState } from 'react';
import {BookmarkType} from './Bookmark'
import Bookmark from './Bookmark';
import { listen } from '@tauri-apps/api/event';
import ConfirmBookmarkDeletionModal from './ConfirmBookmarkDeletionModal';

type BookmarkListProps = {
    selectBookmark: Function,
    }

export default function BookmarkList({selectBookmark}: BookmarkListProps){

    const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
    const [bookmarkToDelete, setBookmarkToDelete] = useState<BookmarkType>();
    const [showModal, setShowModal] = useState<Boolean>(false);

    useEffect(()=>{
        listen("create_bookmark", (event)=>{
        if(event.payload){
            console.log(event.payload);
            setBookmarks(bookmarks => [event.payload as BookmarkType, ...bookmarks].sort((a:BookmarkType, b:BookmarkType) => {return a.book.localeCompare(b.book) }));
        }
    });
        },[]);

    function handleBookmarkClicked(e: MouseEvent, b: BookmarkType){
        e.preventDefault();
        selectBookmark(b);

        }

    function handleDeleteClicked(e: MouseEvent, b: BookmarkType){
        e.stopPropagation();
        setBookmarkToDelete(b);
        setShowModal(true);
    }
    
    function handleDeleteBookmark(b: BookmarkType){
        setBookmarks((state)=> state.filter((bookmark: BookmarkType) => bookmark.id  !== b.id));
        setShowModal(false);
    }

    return (
        <>
        <ConfirmBookmarkDeletionModal display={showModal} setDisplay={setShowModal} b={bookmarkToDelete} deleteBookmark={handleDeleteBookmark}/>
        {bookmarks.map(b => 
        <Bookmark key={b.id} selectBookmark={handleBookmarkClicked} deleteBookmark={handleDeleteClicked} bookmark={b}/>
        )}
        </>
    )
}
