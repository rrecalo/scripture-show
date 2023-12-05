// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod modules;
use core::panic;

use modules::bible::*;
use tauri::{State, WindowBuilder, Manager, PhysicalPosition, LogicalPosition, http::status::StatusCode, Error, Monitor, Window, Menu, MenuItem, Submenu, CustomMenuItem};

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
async fn open_display_monitor(app: tauri::AppHandle, monitor_name: String) -> bool {

  let mut new_window: Option<_> = None;
  let wins = app.clone().windows();
    for window in wins.iter(){
        if &window.1.label() == &"display_monitor" {
            //let _ = window.1.close();
            new_window = Some(window.1);

        } 
        if &window.1.label() == &"choose_output" {
            let _ = &window.1.close();
        }
    };

  let window = match new_window{
        Some(win) => win.clone(),
        None => tauri::WindowBuilder::new(&app, "display_monitor", tauri::WindowUrl::App("monitor.html".into()))
    .build()
    .unwrap()

  };

  let mut alt_monitor: tauri::Monitor = window.primary_monitor().unwrap().unwrap();
  for monitor in window.available_monitors().expect("could not fetch available monitors!"){
        if monitor.name().unwrap() == &monitor_name {
            alt_monitor = monitor.clone();
        }
  }

  let _ = window.set_position(PhysicalPosition {
      x:alt_monitor.position().x,
      y:0
  });

  let _ = window.set_fullscreen(false);
  let _ = window.set_title("Verse Display");

  println!("Chosen Monitor : {0} | Projecting To : {1}", monitor_name, alt_monitor.name().unwrap());

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

#[derive(Serialize)]
enum ApplicationError{
    BadVersionName(&'static str),
    NewWindowError(&'static str),
    NoBookFound(&'static str),
}

#[tauri::command]
fn get_chapter_count(bible: State<Bibles>, book_name: String, version: &str) -> Result<u32, ApplicationError> {
    
    let bible_version: &Bible = match version {
        "esv" => &bible.esv,
        "ro" => &bible.ro,
        _ => panic!("No version string passed as argument!"),
    };

    let book_found = bible_version.books.iter().find(|book| book.name == book_name);

    match book_found {
        Some(book) => {return Ok(book.chapters.len() as u32)}
        None => {return Err(ApplicationError::NoBookFound("No book found by given name!"));},
    }    
    
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
            Err(ApplicationError::BadVersionName("Bad bible version name received!"))
        }
    }

}

#[tauri::command]
async fn open_choose_output_window(app: tauri::AppHandle) -> Result<bool, ApplicationError>{
    
    let new_window = tauri::WindowBuilder::new(&app, "choose_output",
        tauri::WindowUrl::App("../choose_output.html".into()),)
        .title("Choose Display Output")
        .inner_size(400.0, 200.0)
        .build();
    
    match new_window {
        Ok(_win) => Ok(true),
        Err(_) => Err(ApplicationError::NewWindowError("Err: Could not open window, maybe it already exists?"))
    }
}


struct Bibles{
    esv: Bible,
    ro: Bible,
}

fn init_menu() -> Menu{
    
    // here `"quit".to_string()` defines the menu item id, and the second parameter is the menu item label.
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let file_submenu = Submenu::new("File", Menu::new().add_item(quit));

    let dark = CustomMenuItem::new("dark".to_string(), "Dark");
    let light = CustomMenuItem::new("light".to_string(), "Light");
    let theme_submenu = Submenu::new("Theme", Menu::new().add_item(dark).add_item(light));
    let prefs_submenu = Submenu::new("Preferences", Menu::new().add_submenu(theme_submenu));
    let choose_output = CustomMenuItem::new("open_choose_output_window".to_string(), "Choose Output");
    let settings_submenu = Submenu::new("Settings", Menu::new().add_submenu(prefs_submenu).add_item(choose_output));
    Menu::new()
    .add_submenu(file_submenu)
    .add_submenu(settings_submenu)

}

fn main() {
    
    let menu = init_menu();

    let app = tauri::Builder::default()
        .setup(|app| {
            let resources_path = app.path_resolver().resource_dir().expect("Failed to get resource directory");
            let esv_path = resources_path.clone().join("_up_/resources/ESV.xml");
            let ro_path = resources_path.clone().join("_up_/resources/ro.xml");
            let bible_data: Bibles = Bibles { esv: create_from_xml(esv_path), ro: create_from_xml(ro_path)};
            app.manage(bible_data);
            #[cfg(not(target_os="macos"))]
            let main_window = WindowBuilder::new(
                app,
                "main",
                tauri::WindowUrl::App("index.html".into()),)
            .title("Scripture Show")
            .inner_size(1280.0, 720.0)
            .menu(menu)
            .build()?;
            #[cfg(target_os="macos")]
            let main_window = WindowBuilder::new(
                app,
                "main",
                tauri::WindowUrl::App("index.html".into()),)
            .title("Scripture Show")
            .inner_size(1280.0, 720.0)
            .build()?;
            WindowBuilder::new(
                app,
                "choose_output",
                tauri::WindowUrl::App("choose_output.html".into()),)
                .title("Choose Display Output")
                .inner_size(400.0, 200.0)
                .build()?;
            let app_handle = app.handle();
            main_window.on_menu_event(move |event| {
                match event.menu_item_id() {
                "quit" => {
                    std::process::exit(0);
                },
                "dark" => {
                    app_handle.emit_to("main", "dark_mode", true).unwrap();
                },
                "light" => {
                    app_handle.emit_to("main", "dark_mode", false).unwrap();
                },
                "open_choose_output_window" => {
                    app_handle.emit_to("main", "open_choose_output", {}).unwrap();
                }
                _ => {}
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_verses, open_display_monitor, get_book_list,
        open_choose_output_window, get_chapter_count]);
        #[cfg(target_os="macos")]
        {
        app.menu(menu).run(tauri::generate_context!()).expect("error while running tauri application");
        }
        #[cfg(not(target_os="macos"))]
        app.run(tauri::generate_context!()).expect("error while running tauri application");

    }
