# Patch Notes: GoddessLabs ❤️‍🔥💊  NodePack 

## V0.0.51: The "Visual Polish" Update
**Focus:** User Interface Refinement
* **Visuals:**
    * **Width Padding:** Increased default node width padding from **5px** to **10px** for improved text widget visibility and breathing room.

---

## V0.0.5: The "Cross-Platform" Update
**Focus:** Platform Compatibility & Dependency Modernization
* **Core Change:**
    * **Folder Browser:** The underlying native folder selection logic has been completely replaced.
    * **Removed:** Windows-specific `ctypes` and `wintypes` APIs.
    * **Added:** Cross-platform **wxPython** library (`wx.DirDialog`).
    * **Result:** The `Folder Browser` node is now compatible with Linux (with a GUI environment) and macOS, in addition to Windows.
* **Dependencies:**
    * The `__init__.py` dependency check now uses `import wx` to confirm environment readiness.

---

## V0.0.4: The "Force Reload" Update
**Focus:** Interactivity & Cache Busting
* **Renaming:**
    * **File:** Renamed `folder_selector.py` to `folder_browser.py`.
    * **Title:** Node title changed to **Folder Browser ❤️‍🔥💊 GoddessLabs**.
* **New Feature:**
    * **Reload Connected Node ⟳ Button:** Added a button to the Folder Browser node.
    * **Configuration:** The button is hidden by default. It can be enabled via the **Properties** panel (`show_reload_button`: true).
    * **Functionality:** Clicking this button finds the connected downstream node (e.g., JOV Video Queue), deletes it, and immediately replaces it with a fresh clone.
    * **Why:** This solves the issue where nodes with aggressive internal caching wouldn't see new files added to a folder until ComfyUI was fully restarted.
* **Visuals:**
    * **Padding:** Reduced default width padding from 15px to **5px** for a cleaner look.
* **Improvement:**
    * **Stability:** Optimized the node recreation logic to ensure all wires (inputs and outputs) are preserved during the reload process.

## V0.0.3: The "Visual Style" Update
**Focus:** Stability & Visual Polish
* **Visuals:**
    * **Name:** Node is now titled **Folder Selector ❤️‍🔥💊 GoddessLabs**.
    * **Styling:** Defaults to **Purple (#633CCA)** and **Box Shape** upon creation.
    * **Smart Styling:** Styling is only applied when dragging a *new* node; it will not override custom colors on saved workflows.
* **User Experience:**
    * **Width:** Node initializes with **+15px** extra width to ensure text labels aren't cramped.
    * **Simplified Inputs:**
        * `Path` (String Widget)
        * `Append` (String Widget)
    * *Note: Previous experimental toggle features were removed to prioritize rock-solid stability.*
* **Technical:**
    * **Safety:** `ctypes` imports are wrapped to preventing crashing on non-Windows systems.
    * **API:** Route registration uses the robust `@routes.get` decorator with `/api/` prefixes.

## V0.0.2: The "Vibecode" Stabilization
* **Focus:** Architecture Fixes.
* **Critical:** Fixed API 404 errors and Linux import crashes.

## V0.0.1: Initial Prototype
* **Limitation:** Strictly local Windows execution only.