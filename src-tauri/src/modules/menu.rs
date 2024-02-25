use tauri::{CustomMenuItem, Menu, Submenu};

pub fn init_menu() -> Menu{
    
    // here `"quit".to_string()` defines the menu item id, and the second parameter is the menu item label.
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let file_submenu = Submenu::new("File", Menu::new().add_item(quit));

    let dark = CustomMenuItem::new("dark".to_string(), "Dark");
    let light = CustomMenuItem::new("light".to_string(), "Light");
    let theme_submenu = Submenu::new("Theme", Menu::new().add_item(dark).add_item(light));
    let prefs_submenu = Submenu::new("Preferences", Menu::new().add_submenu(theme_submenu));
    let configure_screens = CustomMenuItem::new("open_configure_screens_window".to_string(), "Configure Screens");
    let projection_customization = CustomMenuItem::new("open_projection_customization_window".to_string(), "Projection Customization");
    let settings_submenu = Submenu::new("Settings", Menu::new().add_submenu(prefs_submenu).add_item(configure_screens).add_item(projection_customization));
    Menu::new()
    .add_submenu(file_submenu)
    .add_submenu(settings_submenu)

}