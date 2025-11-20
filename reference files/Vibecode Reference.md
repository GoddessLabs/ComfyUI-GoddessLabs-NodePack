# Vibecode Documentation: GoddessLabs NodePack

This document serves as a guide for future AI agents and developers maintaining this repository. It outlines critical architectural decisions, common pitfalls in ComfyUI custom node development, and specifics regarding the "Folder Browser" node.

## 1. Cross-Platform Safety (Critical)
**The Issue:** The `folder_browser` node previously used Windows-specific `ctypes` for native dialogs, limiting compatibility. It has now switched to the **wxPython** library.
**The Risk:** While `wxPython` is cross-platform, improper installation or execution without an underlying GUI server (e.g., attempting to run on a headless Linux server) will still cause the process to hang or fail.
**The Solution (Post V0.0.5):**
* **Dependency Management:** Rely on `requirements.txt` and the `__init__.py` auto-installer to ensure `wxPython` is present.
* **Execution Context:** The `open_folder_dialog` function must be wrapped in `asyncio.get_running_loop().run_in_executor(None, ...)` to prevent blocking the ComfyUI API server while the user interacts with the native dialog.
* **Toggling Path Format:** The Windows-specific Short/Long path cache-busting logic in `toggle_path_format` has been removed in favor of relying on the JavaScript "Destroy & Recreate" pattern for hard refreshes.

## 2. Path Normalization
**The Feature:** Users expect directory paths to be ready for immediate string concatenation with filenames.
**The Implementation:**
* The `open_folder_dialog` function in Python explicitly checks if the returned path ends with a directory separator (`os.path.sep`).
* If missing, it automatically appends it before returning the value to the frontend.

## 3. JavaScript Widget Sizing
**The Issue:** When adding custom buttons to a node via JavaScript extensions, they often overlap existing widgets or get cut off.
**The Fix:**
* **Override `computeSize`:** You must hook into the node's `computeSize` method.
* **Dynamic Calculation:** Do not hardcode height. Iterate through `this.widgets`, sum their heights (usually `widget.computeSize()[1]`), and add padding.
* **Optimization (V0.0.6):** Width padding adjusted to `+10px` for better widget visibility.
* **Code Snippet:**
    ```javascript
    this.computeSize = function(size) {
        newSize[0] += 10; // Width padding
        // ... calculate requiredHeight loop ...
        if (newSize[1] < requiredHeight + padding) {
            newSize[1] = requiredHeight + padding;
        }
        return newSize;
    }
    ```

## 4. Debugging & Error Handling
**The Issue:** A syntax error in one node file can silently fail or crash the entire loading process in `__init__.py`.
**The Fix:**
* **Traceback:** Import `traceback` in `__init__.py` and print the full stack trace in the `except` block.
* **Isolation:** Use a loop to import nodes individually so that one broken node does not prevent others from loading.

## 5. Forcing Node Refreshes (The "Destroy & Recreate" Pattern)
**The Issue:** Certain nodes (e.g., Jovimetrix Queue) cache their inputs aggressively. Even if you update the input string, the node may still rely on an internal cache and fail to reload new files from the disk.
**The Fix:**
* **Reload Connected Node ⟳ Button:** We implemented a JavaScript function `reloadConnectedNode`.
* **Logic:**
    1. Find the target node connected to the `folder_path` output.
    2. Clone its properties (position, size, colors) and widget values.
    3. **Destroy** the old node instance (`graph.remove(oldNode)`).
    4. **Create** a new node instance (`LiteGraph.createNode(type)`).
    5. Reconnect all input and output links to the new node.
* **Result:** This generates a new Node ID, forcing the ComfyUI backend to treat it as a completely new entity, effectively performing a "Hard Reload" of that specific node without restarting the server.