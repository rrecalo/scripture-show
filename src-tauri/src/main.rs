// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod modules;
use modules::bible::*;
use tauri::{State, WindowBuilder, Manager, PhysicalPosition, LogicalPosition, http::status::StatusCode, Error};

use modules::bible_reader::create_from_xml;
use serde::Serialize;
//use breadx::{prelude::*, display::DisplayConnection, protocol::xproto};


// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Serialize)]
struct VerseTranslation{
    book_name: String,
    chapter_num: i32,
    verses: Vec<Verse>,
}

#[derive(Serialize)]
struct GetVersesResult{
    book_name: String,
    chapter_num: i32,
    verses: Vec<Verse>,
    translation: VerseTranslation
}

#[tauri::command]
fn get_verses(bible: State<Bibles>, book_name: String, ch_num: i32, translations: Vec<String>) -> Option<GetVersesResult> {   
    let book = bible.esv.get_book_by_name(&book_name)?;
    let ch = book.get_chapter(ch_num)?;

    let mut alt_lang: Option<VerseTranslation> = None;

    for translation in translations.iter(){
        if translation == &"ro" {

            let book_num: usize = bible.esv.books.iter().position(|b| b.name == book.clone().name).expect("book number could not be extrapolated!");
            let ro_book: &Book = &bible.ro.books.get(book_num).expect("could not get RO translation of book at given index!");
            let ro_ch = ro_book.get_chapter(ch_num)?;

            alt_lang = Some(VerseTranslation {
                book_name: ro_book.clone().name,
                chapter_num: ro_ch.number,
                verses: ro_ch.get_all_verses(),
            });
        };
    };

    Some(GetVersesResult{book_name: book.name, chapter_num: ch_num, verses:ch.get_all_verses(), translation: alt_lang.expect("No RO translation found!!!")})

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

  let _ = window.set_fullscreen(true);

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

#[derive(Serialize)]
enum ApplicationError{
    BadVersion(&'static str),
}

#[tauri::command]
fn get_book_list(bible: State<Bibles>, version: &str) -> Result<Vec<String>, ApplicationError> {
    
    match version {
        "esv" => {
            
            let book_names = bible.esv.books.clone().iter().map(|b| b.name.clone()).collect();
            Ok(book_names)
        }
        "ro" => {
            let book_names = bible.esv.books.clone().iter().map(|b| b.name.clone()).collect();
            Ok(book_names)
        }
        _ => {
            Err(ApplicationError::BadVersion("Bad bible version name received!"))
        }
    }

}

struct Bibles{
    esv: Bible,
    ro: Bible,
}

fn main() {
    
    let bible_data: Bibles = Bibles { esv: create_from_xml("./ESV.xml"), ro: create_from_xml("./ro.xml")};
        
    tauri::Builder::default()
        .manage(bible_data)
        .invoke_handler(tauri::generate_handler![get_verses, open_display_monitor, get_book_list])
        //.invoke_handler(tauri::generate_handler![get_book_and_chapter])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

        }
