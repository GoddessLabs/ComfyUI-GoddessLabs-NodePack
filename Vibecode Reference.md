# Vibecode Documentation: GoddessLabs NodePack

This document serves as a guide for future AI agents and developers maintaining this repository. It outlines critical architectural decisions and common pitfalls in ComfyUI custom node development.

## 1. Cross-Platform Safety (Critical)
**The Issue:** This node uses `ctypes.windll` which only exists on Windows.
**The Risk:** Importing this globally will crash ComfyUI on Linux/Mac/Cloud servers immediately.
**The Solution:**
* **Conditional Imports:** Always wrap `ctypes` imports in `try/except` blocks.
* **Runtime Checks:** Use an `IS_WINDOWS` flag to disable functionality gracefully rather than crashing.

## 2. Server-Side vs. Client-Side Context
**The Pitfall:** Calling native dialogs (`tkinter`, `ctypes`) in Python opens windows on the **Server**.
**The Reality:** If the user is on RunPod/Colab, they cannot see this window.
**The Policy:** We explicitly label this node as **"Local Windows Only"**.

## 3. API Route Registration
**The Issue:** `routes.add_route` can throw "Duplicate Route" errors on reload.
**The Best Practice:**
* Use the decorator pattern: `@server.PromptServer.instance.routes.get("/api/...")`.
* **Always** prefix routes with `/api/` to match the frontend `api.fetchApi` behavior.

## 4. Smart Visual Styling
**The Pattern:** Applying custom colors without annoying the user.
* **Mechanism:** In `onNodeCreated`, we hook into the `configure` method to detect if the node is being loaded from a save file.
* **Logic:** We only apply the styling (Purple Color/Box Shape) if `configure` was **NOT** called (meaning it's a fresh drag-and-drop creation). This respects user customizations on saved workflows.

## 5. Widget Sizing
**The Fix:** Standard ComfyUI nodes can feel cramped.
* **Override:** We hook `computeSize` in JavaScript.
* **Adjustment:** We calculate the required height based on widgets, and then add **15px** to the width (`newSize[0] += 15`) to improve readability.