import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import ScriptureSearchBox from "./Components/ScriptureSearchBox";

type Verse = {
    number: number,
    text: String
}

function App() {
  const [verses, setVerses] = useState<any>([]);

  //async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    //setGreetMsg(await invoke("greet", { name }));
  //}
  
  useEffect(()=>{
      invoke("get_verses", {bookName:"john",chNum: 1}).then(res=>setVerses(res));
      },[]);

  useEffect(()=>{
    //console.log(verses);
  }, [verses]);

    async function searchForBook(searchQuery: String){

    searchQuery = searchQuery.toLowerCase();
    let starts_with_num = false;
    if(!isNaN(parseInt(searchQuery.charAt(0)))){
        starts_with_num = true;
    }   
    
    let first_space = searchQuery.indexOf(" ");
    let last_space = searchQuery.lastIndexOf(" ");
    
    //default values if somehow the query string won't match any of the
    //filtering below
    let ch_num = "1";
    let book_name = "genesis";

    //if there is more than one space, there must be a chapter number and the
    //book_name can be extrapolated from slice of 0->last_space
    //example input value : '1 john 3' 
    //'1 jo 3' will also work since the string is split as shown
    //{book_name}[space]{ch_num}
    if(first_space > 0 && last_space > 0 && first_space !== last_space){
        ch_num = searchQuery.slice(last_space+1, last_space+2);
        book_name = searchQuery.slice(0, last_space);

    }
    //if there is only ONE space, get the ch num provided (if any);
    else{
        //catches queries for non-numbered book names followed by a chapter number
        //{book_name (non number start)}[space]{ch_num}
        if(!starts_with_num && first_space > 0){
        ch_num = searchQuery.slice(first_space+1, first_space+2);
        book_name = searchQuery.slice(0, first_space);
        }
        //catches just book name queries that have no spaces
        //'proverbs' 'Revelations
        else{
            book_name = searchQuery.toString();
        }
    }

    let new_verses = await invoke("get_verses", {bookName: book_name, chNum: parseInt(ch_num)});

    setVerses(new_verses);
  }

  return (
    <div className="container">
    <ScriptureSearchBox performSearch={searchForBook}/>
    {verses?.map((verse : Verse) => <div className="font-light">{verse.number} | {verse.text}</div>)}
    </div>
  );
}

export default App;
