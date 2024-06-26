import { useEffect, useState } from 'react';
import {BookmarkType} from './Bookmark'
import Bookmark from './Bookmark';
import { listen } from '@tauri-apps/api/event';
import ConfirmBookmarkDeletionModal from './ConfirmBookmarkDeletionModal';
import { AnimatePresence } from 'framer-motion';

type BookmarkListProps = {
    selectBookmark: Function,
    bookmarks: BookmarkType[],
    setBookmarks: Function,
    }

export default function BookmarkList({selectBookmark, bookmarks, setBookmarks}: BookmarkListProps){

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
        // <AnimatePresence>
        <>
        <ConfirmBookmarkDeletionModal key="modal" display={showModal} setDisplay={setShowModal} b={bookmarkToDelete} deleteBookmark={handleDeleteBookmark}/>
        
            {bookmarks.map(b => 
            <Bookmark key={b.id} selectBookmark={handleBookmarkClicked} deleteBookmark={handleDeleteClicked} bookmark={b}/>
            )}
        </>
        // </AnimatePresence>
    )
}
