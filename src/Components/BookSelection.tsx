
type BookSelectionProps = {
    bookName: String,
    activeBookName: String,
}

export default function BookSelection({bookName, activeBookName} : BookSelectionProps){

    return (
        <div className={`ps-1 font-light text-sm w-full pe-8 whitespace-nowrap ${activeBookName === bookName ? 'bg-neutral-300' : ''}`}>{bookName}</div>
    )
}
