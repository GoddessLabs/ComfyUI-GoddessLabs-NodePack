# Discarded Approaches & Architectural Constraints

## Server-Side Native Dialogs (Remote Context)

### The Concept
ComfyUI separates the Python "Backend" (Server) from the JavaScript "Frontend" (Browser).

### The Pitfall
* Calling a native dialog (`tkinter`, `PyQt`, `wxPython`) in Python opens a window **on the server**.
* If the server is remote (Cloud GPU), the user cannot see or interact with this window. The node will hang indefinitely.

### The Decision
* For this specific node (`Folder Browser`), we explicitly acknowledge it is for **Local GUI Environments Only** (Windows, Linux with X Server, macOS).
* **Discarded Alternative:** We rejected the idea of supporting headless/cloud environments for this specific version to prioritize native OS integration features.
* **Best Practice (for future reference):** For true cross-platform file selection (especially cloud/headless), implement a custom JavaScript UI that browses the server's file system via API endpoints (similar to ComfyUI-Manager).
