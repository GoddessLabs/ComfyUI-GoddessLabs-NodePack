# Patch Notes: GoddessLabs ❤️‍🔥💊  NodePack 

## V0.0.3: The "Visual Style" Update (Final)
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