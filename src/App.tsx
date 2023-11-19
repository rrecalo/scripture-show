import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
  const [verses, setVerses] = useState([]);

  //async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    //setGreetMsg(await invoke("greet", { name }));
  //}
  
  useEffect(()=>{
      invoke("get_verses", {bookName:"john",chNum: 1}).then(res=>setVerses(res));
      },[]);

  useEffect(()=>{
    console.log(verses);
  }, [verses]);

  return (
    <div className="container">
    {verses?.map(verse => <div className="font-light">{verse.number} | {verse.text}</div>)}
    </div>
  );
}

export default App;
