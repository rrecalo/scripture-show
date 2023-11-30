import { MdLightMode, MdDarkMode } from "react-icons/md";

type DarkModeSelectorProps = {
    darkMode: boolean,
    toggleDarkMode: Function,
}

export default function DarkModeSelector({darkMode, toggleDarkMode}: DarkModeSelectorProps){

    return (
        <div className="w-8 h-8 p-1.5 dark:hover:bg-neutral-700 rounded-xl hover:bg-neutral-300" onClick={()=>{toggleDarkMode()}}>
        {
        darkMode ?
        <MdDarkMode className="w-full h-full dark:text-neutral-200"/>
        :
        <MdLightMode className="w-full h-full text-neutral-700"/>
        }
        </div>

    )

}
