// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod modules;
use modules::bible::*;
use modules::commands;
use modules::menu::init_menu;
use modules::bible_reader::create_from_xml;

use tauri::{ Manager, WindowBuilder};
struct Bibles{
    esv: Bible,
    ro: Bible,
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
            .min_inner_size(1280.0, 720.0)
            .inner_size(1280.0, 720.0)
            .menu(menu)
            .build()?;
            #[cfg(target_os="macos")]
            let main_window = WindowBuilder::new(
                app,
                "main",
                tauri::WindowUrl::App("index.html".into()),)
            .title("Scripture Show")
            .title_bar_style(tauri::TitleBarStyle::Overlay)
            .hidden_title(true)
            //.transparent(true)
            .min_inner_size(1280.0, 720.0)
            .inner_size(1280.0, 720.0)
            .focused(true)
            .build()?;
            // #[cfg(not(target_os="macos"))]
            // WindowBuilder::new(app, "configure_screens",
            //     tauri::WindowUrl::App("../configure_screens.html".into()),)
            //     .title("Configure Screens")
            //     .min_inner_size(400.0, 200.0)
            //     .inner_size(200.0, 100.0)
            //     .always_on_top(true)
            //     .build()?;
            // #[cfg(target_os="macos")]
            // tauri::WindowBuilder::new(app, "configure_screens",
            //     tauri::WindowUrl::App("../configure_screens.html".into()),)
            //     .min_inner_size(600.0, 400.0)
            //     .inner_size(600.0, 400.0)
            //     .title_bar_style(tauri::TitleBarStyle::Overlay)
            //     .hidden_title(true)
            //     .always_on_top(true)
            //     .build()?;
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
                "open_configure_screens_window" => {
                    app_handle.emit_to("main", "open_configure_screens", {}).unwrap();
                },
                "open_projection_customization_window" => {
                    app_handle.emit_to("main", "open_projection_customization", {}).unwrap();
                }
                _ => {}
                }
            });
            Ok(())
        })
        .invoke_handler(commands::get_handlers());
        #[cfg(target_os="macos")]
        {
        app.menu(menu).run(tauri::generate_context!()).expect("error while running tauri application");
        }
        #[cfg(not(target_os="macos"))]
        app.run(tauri::generate_context!()).expect("error while running tauri application");

    }
