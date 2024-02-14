
type BookSelectionProps = {
    bookName: String,
    activeBookName: String,
    openBook: Function
}

export default function BookSelection({bookName, activeBookName, openBook} : BookSelectionProps){

    

    return (
        <div className={`ps-2 font-light text-sm w-full pe-8 whitespace-nowrap select-none cursor-default ${activeBookName === bookName ? 'bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-50' : 'dark:bg-neutral-800 dark:text-neutral-400'}`}
        onClick={()=>{bookName.startsWith("Song") ? openBook("song", true) : openBook(bookName, true)}}
        >{bookName}</div>
    )
}
