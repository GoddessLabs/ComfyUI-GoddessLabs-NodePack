# ComfyUI-GoddessLabs-NodePack

A collection of custom nodes for ComfyUI by GoddessLabs.

## Installation

1.  Navigate to your ComfyUI `custom_nodes` directory.
2.  Clone this repository:
    ```bash
    git clone https://github.com/GoddessLabs/ComfyUI-GoddessLabs-NodePack.git
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
    Or for portable versions:
    ```bash
    ..\..\..\python_embeded\python.exe -m pip install -r requirements.txt
    ```

### Configuration
The node's behavior can be customized by editing the text files in `nodes/utility/folder_browser/`:
*   **`append_options.txt`**: Add or remove file extensions for the "Append Extension" menu.
*   **`config.txt`**:
    *   `default_path`: Set the starting folder for the dialog.
    *   `auto_reload_on_change`: Enable/disable auto-reload by default.
    *   `show_reload_button`: Show/hide the reload button by default.

### Features
*   **Native Folder Dialog**: Opens a standard OS folder selection window.
*   **Auto-Reload**: Automatically refreshes connected nodes when the path changes (configurable).
*   **Append Extensions**: Quickly add file extensions to your path via the settings menu.
*   **Smart Caching**: Uses a "Destroy & Recreate" strategy to force ComfyUI to reload files even if the path string hasn't changed (e.g., content changed).

## Custom Nodes

### Utility

If you encounter issues with the dialog not appearing, ensure you have the latest version installed.