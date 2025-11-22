# Commit Notes - V0.0.6 Stable Release (Cumulative Update)

## Summary
This cumulative update brings the GoddessLabs NodePack from V0.0.51 to V0.0.6. It includes significant stability improvements, new features like the Append Extension and Settings Menu, a complete project restructuring, and a new configuration system.

## Key Changes (Since V0.0.51)

### 1. New Features
- **Settings Menu**: Added a gear icon (⚙️) to the node title bar for quick access to options.
- **Append Extension**:
    - Added a submenu to quickly append file extensions to the path.
    - Configurable via `nodes/utility/folder_browser/append_options.txt`.
    - Targets a dedicated `append` widget to prevent path corruption.
- **Auto-Reload**:
    - Added "Auto-Reload on Change" option to automatically refresh connected nodes when the path or append value changes.
    - Uses a "Destroy & Recreate" strategy to force ComfyUI to reload cached files.
- **Configuration File**:
    - Introduced `nodes/utility/folder_browser/config.txt` to customize default behaviors (`default_path`, `auto_reload`, `show_reload_button`).

### 2. Stability & Bug Fixes
- **wxPython Threading**: Fixed freezing issues when cancelling the dialog by moving `wxPython` calls to a dedicated single-threaded executor.
- **Z-Order Fixes**: Implemented a hidden parent frame to ensure the folder dialog always appears on top of the ComfyUI window.
- **Crash Prevention**: Added a global lock to prevent multiple dialogs from opening simultaneously and crashing the application.
- **State Persistence**: Fixed issues where node resizing, titles, and settings were lost or reset unexpectedly.
- **Default Path Logic**: Resolved communication errors ensuring the dialog defaults to the last selected path.

### 3. Project Restructuring (V0.0.6)
- **Node Isolation**: Moved the Folder Browser node to `nodes/utility/folder_browser/`.
- **Modularization**: Separated Python logic, configuration files, and documentation for better maintainability.
- **Guidelines**: Added `Node_Segmentation_Guidelines.md` to enforce strict separation for future nodes.

### 4. Documentation
- **Patch Notes**: Restored and updated full patch history.
- **AI Ideas**: Added `AI Ideas.md` for tracking future high-quality node concepts.
- **Updated**: `README.md` updated with new installation and configuration instructions.

## Version History
- **V0.0.6**: Stable Release (Restructuring, Config File).
- **V0.0.56.1**: Default Path Fix.
- **V0.0.55**: Auto-Reload on Append.
- **V0.0.54.x**: Append Extension & Refinements.
- **V0.0.53**: Settings Gear & Auto-Reload.
- **V0.0.52**: Major Stability & Threading Fixes.
