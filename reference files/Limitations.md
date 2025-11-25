# Python Portable Environment Limitations

## Missing Base DLLs for Tkinter

### The Issue
The portable Python distribution used in this ComfyUI environment is a minimal build. It does not include the necessary Tcl/Tk libraries and DLLs required to run `tkinter`.

### Impact on Development
* **No Tkinter Fallback:** We cannot use `tkinter` as a fallback for `wxPython` because `import tkinter` will fail or the GUI will not initialize due to missing system dependencies.
* **Dependency on wxPython:** This necessitates a strict dependency on `wxPython` for any native GUI dialogs. If `wxPython` is not installed or fails to load, the node cannot function.

### Future Considerations
If a fallback is absolutely required, it would need to be a non-GUI fallback (e.g., text input only) or a completely custom JavaScript-based file browser that does not rely on Python's native GUI capabilities.
