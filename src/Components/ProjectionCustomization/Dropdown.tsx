import { motion } from "framer-motion";
import { BiExpandVertical } from "react-icons/bi"
import { removeExtension } from "./ProjectionControls";
import "../../App.css"

type Props = {
    hidden: boolean,
    setExpanded: Function,
    expanded: boolean,
    value: string,
    onChange: Function,
    options: string[],
    onMouseDown: Function
    
}

function Dropdown({hidden, value, options, onChange, onMouseDown, expanded, setExpanded} : Props) {

    function showOptions(){
        setExpanded(!expanded);
    }

    function handleChange(optionToSelect: string){
        console.log(optionToSelect);
        onChange(optionToSelect);
        setExpanded(!expanded);
    }

  return (
    <div hidden={hidden} className="relative bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-md min-w-full">
        <div onMouseDown={showOptions} className="flex gap-1 justify-between items-center align-middle py-1 px-1 ps-2">
            <div>
                {removeExtension(value || "")}
            </div>
            <BiExpandVertical className="w-3 h-3 text-neutral-300"/>
        </div>

        <motion.div initial={{opacity:0}} animate={{opacity: expanded ? 1 : 0,  transition:{duration:0.25}}} id="options" className="absolute mt-1 top-full w-full px-1 h-fit max-h-[150px] overflow-y-scroll bg-neutral-800 border border-neutral-700 rounded-md">
            {options.map(
                option => {
                 let isSelected = option === value;
                 return (<motion.div onClick={isSelected ? ()=>{} : ()=>handleChange(option)} className={`w-full ps-2 py-1 m-1 rounded-md border-neutral-700 ${isSelected ? 'border' :''}`}
                    animate={{backgroundColor:isSelected ? "" : "rgb(38, 38, 38)", pointerEvents: expanded ? 'auto' : 'none',}} whileHover={{backgroundColor: isSelected ? "" : "rgb(64, 64, 64)" }}>
                        {removeExtension(option)}
                    </motion.div>
                )
                }
            )}
        </motion.div>
    </div>
  )
}

export default Dropdown