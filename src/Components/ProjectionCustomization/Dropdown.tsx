import { motion } from "framer-motion";
import { BiExpandVertical } from "react-icons/bi"
import { removeExtension } from "./ProjectionControls";
import "../../App.css"
import { useEffect } from "react";

type Props = {
    hidden: boolean,
    setExpanded: Function,
    expanded: boolean,
    value?: string,
    options: string[],
    placeholderText?: string,
    hasChanges: boolean,
    setSelection : Function,
    tempTheme? : string,
    setTempTheme : Function,
}

function Dropdown({hidden, value, options, expanded, setExpanded, placeholderText, 
    tempTheme, setTempTheme,
    hasChanges, setSelection} : Props) {

    useEffect(()=>{
        if(tempTheme === undefined){
            setExpanded(false);
        }
    }, [tempTheme])

    function showOptions(){
        if(options?.length > 0){
            setExpanded(!expanded);
        }
    }

    function handleChange(optionToSelect: string){
        if(hasChanges == false){
        setSelection(optionToSelect);
        setExpanded(!expanded);
        }
        else{
            setTempTheme(optionToSelect);
        }
    }

  return (
    <div hidden={hidden} className="relative bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-md min-w-full">
        <div onMouseDown={showOptions} className="flex gap-1 justify-between items-center align-middle py-1 px-1 ps-2">
            {options?.length > 0 ?
            <>
                <motion.div key={value} initial={{opacity:0}} animate={{opacity:1}}>
                    {removeExtension(value || "")}
                </motion.div>
                <BiExpandVertical className="w-3 h-3 text-neutral-300"/>
            </>
            :   
            <motion.div key={value} initial={{opacity:0}} animate={{opacity:1}} className="text-neutral-400">
                {placeholderText || "No Themes"}
            </motion.div>
            }
        </div>

        <motion.div id="options" initial={{opacity:0}} animate={{opacity: expanded ? 1 : 0, display: expanded ? "block" : "none",  transition:{duration:0.25}}} className="absolute px-1 pe-3 bg-neutral-800 top-full border border-neutral-700 w-full h-fit max-h-[150px] mt-1.5 rounded-md">
        <div className="pt-1"></div>
        {options?.map(
            option => {
                let isSelected = option === value;
                return (<motion.div key={option} onClick={isSelected ? ()=>{} : ()=>handleChange(option)} className={`w-full ps-2 py-1.5 m-1 rounded-md border-neutral-700 ${isSelected ? 'border' :''}`}
                animate={{backgroundColor: "#262626", pointerEvents: expanded ? 'auto' : 'none',}} whileHover={{backgroundColor: isSelected ? "#262626" : "#404040" }}>
                    {removeExtension(option)}
                </motion.div>
            )
            }
        )}
        <div className="pt-1"></div>
        </motion.div>
    </div>
  )
}

export default Dropdown