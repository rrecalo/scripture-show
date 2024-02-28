use serde::Serialize;
use tauri::{Manager, Position, State, Window};

use crate::{Bible, Bibles, Book, Verse};

#[derive(Serialize)]
struct VerseTranslation{
    book_name: String,
    chapter_num: i32,
    verses: Vec<Verse>,
}

#[derive(Serialize)]
enum ApplicationError{
    BadVersionName(&'static str),
    NewWindowError(&'static str),
    NoBookFound(&'static str),
}

#[derive(Serialize)]
struct GetOpenWindowsResult{
    windows: Vec<String>
}

#[derive(Serialize)]
struct GetVersesResult{
    book_name: String,
    chapter_num: i32,
    verses: Vec<Verse>,
    translation: VerseTranslation
}

// fn get_non_primary_monitor(window: tauri::Window) -> Option<tauri::Monitor> {
    
//     let monitors = window.available_monitors().expect("No monitors found!");
//     let active_monitor = window.primary_monitor().expect("No primary monitor found!").unwrap();

//     for monitor in monitors.iter(){
//         if active_monitor.name().unwrap() != monitor.name().unwrap() {
//             return Some(monitor.clone())
//         };
//     };
//     None
        
// }

fn convert_to_window_label(original: String) -> String {

    original.replace(" #", "_").clone()

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

  let window_label: &str = &convert_to_window_label(monitor_name.clone());
  let mut new_window: Option<Window> = None::<Window>;
  let wins = app.clone().windows();
    for window in wins.iter(){
        if &window.1.label() == &window_label {
            //let _ = window.1.close();
            new_window = Some(window.1.clone());

        } 
        if &window.1.label() == &"choose_output" {
            //let _ = &window.1.close();
        }
    };

    //start with the 'main' window's monitor as the default (in case the one we want can't be found for some reason)
    let mut chosen_monitor: tauri::Monitor = app.get_window("main").expect("bad!!").primary_monitor().unwrap().unwrap();
    for monitor in app.get_window("main").expect("uhoh!").available_monitors().expect("could not fetch available monitors!"){
            //println!("{0} x:{1}, | y:{2}", monitor.name().unwrap(), monitor.position().x, monitor.position().y);
            if monitor.name().unwrap() == &monitor_name {
                chosen_monitor = monitor.clone();
            }
    }

    println!("Chosen Monitor : {0} | Size : {1} x {2}", monitor_name, chosen_monitor.size().width, chosen_monitor.size().height);

  let window: Option<Window> = match new_window {
    Some(win) => {let _ = win.close(); None},
    None => {
        Some(tauri::WindowBuilder::new(&app, window_label, tauri::WindowUrl::App("monitor.html".into()))
        .always_on_top(true)
        .hidden_title(true)
        .decorations(false)
        .inner_size(800.0, 600.0)
        .build().expect("Failed to create window!"))
        }
    };

    let pos = chosen_monitor.position();

   
   if window.is_some() {
        let win = window.unwrap();
        win.set_position(Position::Physical(
            tauri::PhysicalPosition{
                x: pos.x / 2,
                y: pos.y / 2
            })
        ).expect("Could not set new window's position");

        #[cfg(target_os = "macos")]
        {
            use cocoa::base::id;
            use cocoa::appkit::{ NSWindow, NSMainMenuWindowLevel };
            let ns_win = win.ns_window().unwrap() as id;
            unsafe { 
                ns_win.setLevel_((NSMainMenuWindowLevel + 1) as i64);
            }
        }
        //println!("window is : {0} x {1}", win.inner_size().unwrap().width, win.inner_size().unwrap().height);
        //println!("placed at : x : {0} y : {1}", win.outer_position().unwrap().x, win.outer_position().unwrap().y);
        //unsafe {
            //use cocoa::appkit::{NSApp, NSApplication, NSApplicationActivationPolicy, NSApplicationPresentationOptions};
            //let view: cocoa_id = std::mem::transmute(win.ns_view());
            //let app = NSApplication::sharedApplication(view);
            //let app = NSApp();
            //app.setActivationPolicy_(NSApplicationActivationPolicy::NSApplicationActivationPolicyRegular);
            /*
            let options: NSApplicationPresentationOptions = NSApplicationPresentationOptions::NSApplicationPresentationHideMenuBar
            | NSApplicationPresentationOptions::NSApplicationPresentationHideDock;
            app.setPresentationOptions_(options);
            */
        //}
    }

    true

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
async fn open_configure_screens_window(app: tauri::AppHandle) -> Result<bool, ApplicationError>{

    #[cfg(not(target_os="macos"))]
    let new_window = tauri::WindowBuilder::new(&app, "configure_screens",
        tauri::WindowUrl::App("../configure_screens.html".into()),)
        .title("Configure Screens")
        .min_inner_size(400.0, 200.0)
        .inner_size(400.0, 200.0)
        .always_on_top(true)
        .focused(true)
        .build();

    #[cfg(target_os="macos")]
    let new_window = tauri::WindowBuilder::new(&app, "configure_screens",
        tauri::WindowUrl::App("../configure_screens.html".into()),)
        .title("Configure Screens")
        .min_inner_size(400.0, 200.0)
        .inner_size(400.0, 200.0)
        .always_on_top(true)
        .title_bar_style(tauri::TitleBarStyle::Overlay)
        .hidden_title(true)
        .focused(true)
        .build();

    
    match new_window {
        Ok(_win) => Ok(true),
        Err(_) => Err(ApplicationError::NewWindowError("err: could not open window, maybe it already exists?"))
    }
}

#[tauri::command]
async fn open_projection_customization_window(app: tauri::AppHandle) -> Result<bool, ApplicationError>{
    
    #[cfg(not(target_os="macos"))]
    let new_window = tauri::WindowBuilder::new(&app, "projection_customization",
        tauri::WindowUrl::App("../projection_customization.html".into()),)
        .title("Projection Theme Customization")
        .min_inner_size(800.0, 600.0)
        .inner_size(800.0, 600.0)
        .always_on_top(true)
        .focused(true)
        .build();

    #[cfg(target_os="macos")]
    let new_window = tauri::WindowBuilder::new(&app, "projection_customization",
        tauri::WindowUrl::App("../projection_customization.html".into()),)
        .title("Projection Theme Customization")
        .min_inner_size(800.0, 600.0)
        .inner_size(800.0, 600.0)
        .always_on_top(true)
        .title_bar_style(tauri::TitleBarStyle::Overlay)
        .hidden_title(true)
        .focused(true)
        .build();

    match new_window {
        Ok(_win) => Ok(true),
        Err(_) => Err(ApplicationError::NewWindowError("err: could not open window, maybe it already exists?"))
    }
}

#[tauri::command]
async fn open_new_bookmark_window(app: tauri::AppHandle) -> Result<bool, ApplicationError>{
    
    #[cfg(not(target_os="macos"))]
    let new_window = tauri::WindowBuilder::new(&app, "bookmark",
        tauri::WindowUrl::App("../bookmark.html".into()),)
        .title("Create a Bookmark")
        .min_inner_size(600.0, 500.0)
        .inner_size(600.0, 500.0)
        .always_on_top(true)
        .focused(true)
        .build();

    #[cfg(target_os="macos")]
    let new_window = tauri::WindowBuilder::new(&app, "bookmark",
        tauri::WindowUrl::App("../bookmark.html".into()),)
        .title("Create a Bookmark")
        .min_inner_size(600.0, 500.0)
        .inner_size(600.0, 500.0)
        .always_on_top(true)
        .title_bar_style(tauri::TitleBarStyle::Overlay)
        .hidden_title(true)
        .focused(true)
        .build();


    match new_window {
        Ok(_win) => Ok(true),
        Err(_) => Err(ApplicationError::NewWindowError("err: could not open window, maybe it already exists?"))
    }
}

#[tauri::command]
async fn get_open_windows(app: tauri::AppHandle) -> Result<GetOpenWindowsResult, ApplicationError> {
    let open_windows = app.windows().into_keys().collect();
    Ok(GetOpenWindowsResult { windows: open_windows })
}

pub fn get_handlers() -> Box<dyn Fn(tauri::Invoke<tauri::Wry>) + Send + Sync> {
    Box::new(tauri::generate_handler![
        get_verses,
        open_display_monitor,
        get_chapter_count,
        get_book_list,
        open_configure_screens_window,
        open_projection_customization_window,
        open_new_bookmark_window,
        get_open_windows
    ])
}
