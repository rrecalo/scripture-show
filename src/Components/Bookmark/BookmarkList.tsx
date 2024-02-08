import { useEffect, useState } from 'react';
import {BookmarkType} from './Bookmark'
import Bookmark from './Bookmark';
import { listen } from '@tauri-apps/api/event';

type BookmarkListProps = {
    selectBookmark: Function,
    }

export default function BookmarkList({selectBookmark}: BookmarkListProps){

    const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);

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

    function handleDeleteBookmark(e: MouseEvent, b: BookmarkType){
        e.preventDefault();
        e.stopPropagation();
        setBookmarks((state)=> state.filter((bookmark: BookmarkType) => bookmark.id  !== b.id));
    }

    return (
        bookmarks.map(b => 
        <Bookmark key={b.id} selectBookmark={handleBookmarkClicked} deleteBookmark={handleDeleteBookmark} bookmark={b}/>
        )
    )
}
