// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod modules;
use modules::bible::*;
use tauri::{State, WindowBuilder, Manager, PhysicalPosition, LogicalPosition};

use modules::bible_reader::create_from_xml;
use serde::Serialize;
//use breadx::{prelude::*, display::DisplayConnection, protocol::xproto};


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

#[tauri::command]
async fn open_display_monitor(app: tauri::AppHandle) -> bool {

  let window = tauri::WindowBuilder::new(&app, "display_monitor", tauri::WindowUrl::App("monitor.html".into()))
    .build()
    .unwrap();

  let alt_monitor = get_non_primary_monitor(window.clone()).unwrap();
  

  let _ = window.set_position(PhysicalPosition {
      x:alt_monitor.position().x,
      y:0
  });

  window.set_fullscreen(true);

  true

}

fn get_non_primary_monitor(window: tauri::Window) -> Option<tauri::Monitor> {
    
    let monitors = window.available_monitors().expect("No monitors found!");
    let active_monitor = window.primary_monitor().expect("No primary monitor found!").unwrap();

    for monitor in monitors.iter(){
        if active_monitor.name().unwrap() != monitor.name().unwrap() {
            return Some(monitor.clone())
        };
    };
    None
        
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
        .invoke_handler(tauri::generate_handler![get_verses, open_display_monitor])
        //.invoke_handler(tauri::generate_handler![get_book_and_chapter])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

        }
