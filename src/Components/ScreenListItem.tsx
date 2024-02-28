import { useEffect, useState } from 'react'
import { CustomScreen } from './ConfigureScreens'
import { motion } from 'framer-motion'
import { MdOutlineEdit, MdOutlineDelete } from 'react-icons/md'

type Props = {
    s: CustomScreen,
    isActive?: boolean,
    toggleScreen: Function
    renameCustomScreen: Function,
    setIsEditing: Function,
    setScreenToDelete: Function,
}

function ScreenListItem({s, isActive, toggleScreen, renameCustomScreen, setIsEditing, setScreenToDelete} : Props){

    const [hover, setHover] = useState<boolean>();
    const [editing, setEditing] = useState<boolean>(false);
    const [nameInput, setNameInput] = useState<string>();
    
    useEffect(() => {
        if(editing){
            let input = document.getElementById("screen_name_edit");
            input ? input.focus() : {};
        }
    }, [editing]);

    function startEditing(){
        setNameInput(s.customName);
        setEditing(true);
        setIsEditing(true);

    }

    function openDeleteModal(){
        setScreenToDelete(s);
        stopEditing();
    }

    function stopEditing(){
        if(nameInput){
            renameCustomScreen(s, nameInput.trimEnd());
        }
        setNameInput(undefined);
        setEditing(false);
        setIsEditing(false);
    }
    
    function handleKeyDown(e: KeyboardEvent){
        if(e.key === "Enter"){
            e.preventDefault();
            e.stopPropagation();
            stopEditing();
        }
    }

  return (
    <div onMouseOver={()=>setHover(true)} onMouseOut={()=>setHover(false)}
    className="w-full py-2 ps-2 pe-3 border border-neutral-700 rounded-md text-neutral-200 text-sm flex justify-between items-center">
        <div className='flex flex-col w-7/12 h-full justify-start items-start gap-2'>
            <div className='flex flex-row justify-between gap-1 items-center align-middle w-full text-neutral-300'>
                {!editing ?
                <div className='w-full'>
                {s.customName}
                
                </div>
                :
                <motion.input onKeyDown={handleKeyDown as any} className="text-neutral-100 outline-none bg-transparent" initial={{opacity:0}} animate={{opacity:1}} id="screen_name_edit" value={nameInput} onChange={(e)=>setNameInput(e.target.value.trimStart())} autoCapitalize='off' autoComplete='off' autoCorrect='off' maxLength={20}/>
                }
                
            </div>
            <div className='w-full h-6'>
                {!editing ? 
                <div className='flex justify-start items-center align-middle gap-2'>
                <motion.div className="w-6 h-6 p-1 border border-neutral-700 rounded-md" onClick={()=>startEditing()} animate={{opacity: hover ? 1 : 0, display: hover ? 'block' : 'none'}}>
                <MdOutlineEdit className/>
                </motion.div>
                <motion.div className="w-6 h-6 p-1 border border-neutral-700 rounded-md" onClick={()=>openDeleteModal()} animate={{opacity: hover ? 1 : 0, display: hover ? 'block' : 'none'}}>
                    <MdOutlineDelete className/>
                </motion.div>
                </div>
                :<></>}
            </div>
        </div>
        <div className='flex w-5/12 h-full justify-end items-end'>
            <div className="flex flex-col justify-end items-end">
                    <div className="ml-2 text-neutral-400 text-xs w-full whitespace-nowrap">
                        {s.screen.name}
                    </div>
                    <div className="w-fit">
                        <motion.span className="border rounded-full border-neutral-500 inline-flex items-center cursor-pointer w-11 h-6 justify-start mt-2 mx-auto"
                        onClick={()=>toggleScreen(s.screen.name)}
                        initial={{background: isActive ? "#f3553c" : ""}}
                        animate={{background: isActive ? "#f3553c" : ""}}
                        transition={{delay:0.15, duration:0}}
                        >
                        <motion.span className="rounded-full size-5 bg-neutral-50 shadow" 
                            initial={{x: isActive ? "100%" : "0%"}}
                            animate={{x: isActive ? "100%" : "0%"}}
                            transition={{duration:0.15, ease:"linear"}}/>
                        </motion.span>
                    </div>
                </div>
        </div>

    </div>
  )
}

export default ScreenListItem