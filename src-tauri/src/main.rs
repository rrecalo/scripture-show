// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod modules;
use modules::bible::*;
use tauri::State;
use modules::bible_reader::create_from_xml;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_verses(bible: State<Bible>, book_name: String, ch_num: i32) -> Vec<Verse>{
   
    let book = bible.get_book_by_name(&book_name);
    let ch = book.get_chapter(ch_num);
    ch.get_all_verses()

}

fn main() {
    
    let bible = create_from_xml("./ESV.xml");

    tauri::Builder::default()
        .manage(bible)
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![get_verses])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

        }
