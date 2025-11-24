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
*   **State Saving**: Save and load widget states for any node.

## Custom Nodes

### Utility

#### Folder Browser ❤️‍🔥💊
A native folder selection dialog for ComfyUI.
*   **Path**: `GoddessLabs❤️‍🔥💊/Utility/Folder Browser`
*   **Features**: Native OS dialog, Auto-Reload, Append Extensions.

#### Destroy & Recreate ❤️‍🔥💊 GoddessLabs
A pass-through node to force-reload downstream connections.
*   **Path**: `GoddessLabs❤️‍🔥💊/Utility/Destroy & Recreate`
*   **Usage**: Connect it between any two nodes. Click "Reload Node ⟳" to force the next execution to ignore the cache for downstream nodes.

#### Save State ❤️‍🔥💊
A utility node to save and load widget values of connected nodes.
*   **Path**: `GoddessLabs❤️‍🔥💊/Utility/Save State`
*   **Usage**: Connect to the output of a node you want to control.
    *   **Save**: Click the "Save" button (or floppy disk icon) to capture the current widget values of the connected node.
    *   **Load**: Click the "Load" button to apply the saved values back to the connected node.
    *   **Slots**: Use the gear icon ⚙️ to add multiple save slots for different configurations.

If you encounter issues with the dialog not appearing, ensure you have the latest version installed.