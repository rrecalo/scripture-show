
type BookSelectionProps = {
    bookName: String,
    activeBookName: String,
    openBook: Function
}

export default function BookSelection({bookName, activeBookName, openBook} : BookSelectionProps){

    

    return (
        <div className={`ps-1 font-light text-sm w-full pe-8 whitespace-nowrap select-none cursor-default ${activeBookName === bookName ? 'bg-neutral-300' : ''}`}
        onClick={()=>{bookName.startsWith("Song") ? openBook("song") : openBook(bookName)}}
        >{bookName}</div>
    )
}
