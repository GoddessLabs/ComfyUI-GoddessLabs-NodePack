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

## Custom Nodes

### Utility

*   **Folder Browser ❤️‍🔥💊 GoddessLabs**:
    *   Opens a native folder picker (Cross-Platform).
    *   **Features:**
        *   **Reload Button:** Optional button to reload the connected node, useful for refreshing nodes that cache data.
        *   **Settings Gear:** A gear icon in the title bar allows you to easily toggle settings.
        *   **Auto-Reload:** Option to automatically reload connected nodes when the folder path changes.
        *   **Append Extension:** Quickly append file extensions to the path via the Settings Gear menu.
    *   **Usage:**
        *   Connect the `folder_path` output to any node expecting a path string.
        *   Click "Select Folder" to choose a directory.
        *   Use the Settings Gear (⚙️) to enable "Show Reload Button" or "Auto-Reload on Change".

## Troubleshooting

If you encounter issues with the dialog not appearing, ensure you have the latest version installed.