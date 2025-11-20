# Vibecode Documentation: GoddessLabs NodePack

This document serves as a guide for future AI agents and developers maintaining this repository. It outlines critical architectural decisions, common pitfalls in ComfyUI custom node development, and specifics regarding the "Folder Browser" node.

## 1. Cross-Platform Safety (Critical)
**The Issue:** The `folder_browser` node uses `ctypes.windll` and `ctypes.wintypes`. These libraries **do not exist** on Linux or macOS.
**The Risk:** Importing these at the top level of a Python file will cause ComfyUI to crash immediately on startup in cloud environments (RunPod, Colab, Vast.ai) or non-Windows local machines.
**The Solution:**
* **Conditional Imports:** Always wrap Windows-specific imports in `try/except` blocks or check `if os.name == 'nt'`.
* **Flagging:** Use a global flag (e.g., `IS_WINDOWS`) to disable functionality at runtime rather than crash at import time.
* **Dummy Definitions:** If you reference a Windows class (like `BROWSEINFO`) in a function signature, define it as `None` in the `else` block of your import check to prevent `NameError` on Linux.

## 2. Server-Side vs. Client-Side Context
**The Concept:** ComfyUI separates the Python "Backend" (Server) from the JavaScript "Frontend" (Browser).
**The Pitfall:**
* Calling a native dialog (`tkinter`, `PyQt`, `ctypes`) in Python opens a window **on the server**.
* If the server is remote (Cloud GPU), the user cannot see or interact with this window. The node will hang indefinitely.
**The Solution:**
* For this specific node (`Folder Browser`), we explicitly acknowledge it is for **Local Windows Only**.
* **Best Practice:** For true cross-platform file selection, implement a custom JavaScript UI that browses the server's file system via API endpoints (similar to ComfyUI-Manager).

## 3. API Route Registration & URL Prefixes
**The Issue A (Duplicate Routes):** `server.PromptServer.instance.routes.add_route` raises a `RuntimeError` if you try to register a route that already exists (common during reloads).
**The Fix A:**
* **Check Before Add:** Iterate through existing routes to check if your path is already present before calling `add_route`.

**The Issue B (404 Not Found / URL Mismatch):**
* **Frontend:** The ComfyUI JavaScript helper `api.fetchApi("/my-route")` automatically prepends `/api` to the request URL (resulting in `/api/my-route`).
* **Backend:** If you register the route in Python as just `/my-route`, the server won't match the incoming request, causing a 404 error.
**The Fix B:**
* **Explicit Prefix:** Always register your Python backend routes starting with `/api/` (e.g., `/api/goddesslabs/select-folder`) to match the standard ComfyUI frontend behavior.

## 4. Path Normalization
**The Feature:** Users expect directory paths to be ready for immediate string concatenation with filenames.
**The Implementation:**
* The `open_folder_dialog` function in Python explicitly checks if the returned path ends with a backslash (`\`).
* If missing, it automatically appends it before returning the value to the frontend.

## 5. JavaScript Widget Sizing
**The Issue:** When adding custom buttons to a node via JavaScript extensions, they often overlap existing widgets or get cut off.
**The Fix:**
* **Override `computeSize`:** You must hook into the node's `computeSize` method.
* **Dynamic Calculation:** Do not hardcode height. Iterate through `this.widgets`, sum their heights (usually `widget.computeSize()[1]`), and add padding.
* **Optimization (V0.0.4):** Width padding reduced to `+5px` for a tighter fit.
* **Code Snippet:**
    ```javascript
    this.computeSize = function(size) {
        newSize[0] += 5; // Width padding
        // ... calculate requiredHeight loop ...
        if (newSize[1] < requiredHeight + padding) {
            newSize[1] = requiredHeight + padding;
        }
        return newSize;
    }
    ```

## 6. Debugging & Error Handling
**The Issue:** A syntax error in one node file can silently fail or crash the entire loading process in `__init__.py`.
**The Fix:**
* **Traceback:** Import `traceback` in `__init__.py` and print the full stack trace in the `except` block.
* **Isolation:** Use a loop to import nodes individually so that one broken node does not prevent others from loading.

## 7. Forcing Node Refreshes (The "Destroy & Recreate" Pattern)
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