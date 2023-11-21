// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod modules;
use modules::bible::*;
use tauri::State;
use modules::bible_reader::create_from_xml;
use serde::Serialize;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Serialize)]
struct GetVersesResult{
    book_name: String,
    chapter_num: i32,
    verses: Vec<Verse>
}

#[tauri::command]
fn get_verses(bible: State<Bible>, book_name: String, ch_num: i32) -> Option<GetVersesResult> {   

    let book = bible.get_book_by_name(&book_name)?;
    let ch = book.get_chapter(ch_num)?;

    Some(GetVersesResult{book_name: book.name, chapter_num: ch_num, verses:ch.get_all_verses()})

}

/*
#[tauri::command]
fn get_book_and_chapter(bible: State<Bible>, book_name: String, ch_num: i32) -> Option<Vec<Verse>> {
    
    let book = bible.get_book_by_name(&book_name)?;
    let ch = book.get_chapter(ch_num)?;

    Some(ch.get_all_verses())

}
*/

fn main() {
    
    let bible = create_from_xml("./ESV.xml");

    tauri::Builder::default()
        .manage(bible)
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![get_verses])
        //.invoke_handler(tauri::generate_handler![get_book_and_chapter])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

        }
