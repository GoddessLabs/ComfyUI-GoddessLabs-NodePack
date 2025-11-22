# Patch Notes

## V0.0.6 (Stable Release)
- **Config File**: Added `config.txt` in `nodes/utility/folder_browser/` to customize default behavior.
    - `default_path`: Set a custom starting directory for the dialog.
    - `auto_reload_on_change`: Enable/disable auto-reload by default.
    - `show_reload_button`: Show/hide the reload button by default.
- **Fix Default Path**: Resolved an issue where the dialog would not default to the last selected path.
- **Project Structure**: Refactored project structure for better stability and future expansion.
- **Documentation**: Added `AI Ideas.md` for future development concepts.

## V0.0.56.1
- **Fix Default Path**: Resolved an issue where the folder browser would not default to the previously selected path due to a communication error between frontend and backend.
- **Version Display**: Updated to 0.0.56.1.

## V0.0.55
- **Auto-Reload on Append**: The "Auto-Reload on Change" feature now triggers when the `append` widget changes, whether by manual input or selecting from the dropdown.

## V0.0.54.1
- **Append Extension Refinement**:
    - The "Append Extension" dropdown now targets the `append` widget instead of the `path` widget.
    - Configuration has been simplified to a text file: `append_options.txt`.
    - Added a help note in the dropdown menu.

## V0.0.54
- **Append Extension**: Added a new submenu to the Settings Gear to quickly append file extensions to the path.
- **Customization**: Extensions can be customized via `append_options.json` (now replaced by `.txt`).
- **Fix**: Version display now correctly shows "0.0.54".

## V0.0.53 - The "Settings & Stability" Update
**New Features:**
- **Settings Gear Icon:** Added a settings gear icon to the node title bar. Clicking this icon opens a menu to toggle options.
- **Auto-Reload on Change:** Added an option to automatically reload connected nodes whenever the folder path changes (toggleable via Settings Gear).
- **Z-Order Fix:** Resolved a regression where the folder dialog would appear behind the main window. The dialog now correctly stays on top of the ComfyUI window.

**Improvements:**
- **Code Cleanup:** Refactored `js/folder_browser.js` to remove duplicated code and improve maintainability.
- **Documentation:** Updated `README.md` and reference files to reflect the latest changes.

## V0.0.52 - The "Stability & UX" Update
**Bug Fixes:**
- **Fixed Multiple Dialog Crash:** Prevented the application from crashing if the user attempted to open multiple folder dialogs simultaneously. Added a lock mechanism to ensure only one dialog can be open at a time.
- **Fixed Freeze on Cancel:** Resolved an issue where the node would freeze if the user cancelled the folder dialog. This was due to a threading issue with `wxPython` which has now been fixed by using a dedicated single-threaded executor.
- **Fixed Blank Window Crash:** Fixed a crash that occurred when a blank window was created.
- **Fixed Z-Order Issue:** Addressed the issue where the folder dialog would sometimes appear behind the main ComfyUI window.
- **Fixed Node Resizing:** The node no longer unexpectedly resizes itself.
- **Fixed Title Loss:** Connected nodes now retain their titles when the "Reload connections" feature is used.
- **Fixed Settings Persistence:** The `show_reload_button` setting now correctly persists across restarts.

**Technical Changes:**
- **wxPython Lifecycle:** Improved the management of the `wx.App` lifecycle to prevent crashes and ensure stability.
- **Hidden Parent Frame:** Implemented a hidden parent frame for the `wx.DirDialog` to ensure it always appears on top of other windows.

## V0.0.51
- Initial Release of the Folder Browser Node.
- Basic folder selection functionality.
- "Reload Connected Node" button.
