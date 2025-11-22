# Node Segmentation & Isolation Guidelines

## Purpose
To prevent regressions and maintain stability, all nodes in the `ComfyUI-GoddessLabs-NodePack` must adhere to a strict segmentation policy. This ensures that changes to one node do not inadvertently break others and keeps the codebase organized.

## 1. Directory Structure
All new nodes must be placed in their own dedicated subdirectory within the `nodes/` folder, categorized by function.

**Format:** `nodes/<category>/<node_name>/`

**Example:**
```
nodes/
  utility/
    folder_browser/
      folder_browser.py
      append_options.txt
      requirements.txt (if specific to this node)
  image/
    pixel_perfect/
      pixel_perfect.py
```

## 2. File Isolation
*   **Python Code:** All Python logic for a node should be contained within its dedicated folder. Avoid shared utility files in the root unless absolutely necessary and approved.
*   **Configuration:** Config files (e.g., `.txt`, `.json`) must reside in the same folder as the node's Python file.
*   **JavaScript:** Currently, JS files remain in the root `js/` folder for ComfyUI compatibility. Ensure JS filenames match the node name (e.g., `js/folder_browser.js`).

## 3. Development Rules
*   **One Node at a Time:** Focus on a single node during a development session. Do not touch code in other node directories unless explicitly instructed.
*   **Import Paths:** Use relative imports or full package paths (e.g., `nodes.utility.folder_browser...`) carefully.
*   **Testing:** When modifying a node, verify that it loads correctly and does not interfere with the loading of other nodes.

## 4. Adding New Nodes
1.  Create the directory structure: `nodes/<category>/<node_name>/`.
2.  Add your node file: `<node_name>.py`.
3.  Update `__init__.py` in the root to import the new node module path (e.g., `"utility.folder_browser.folder_browser"`).
