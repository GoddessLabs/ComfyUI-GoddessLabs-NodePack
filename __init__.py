import server
import asyncio
from aiohttp import web
import ctypes
import ctypes.wintypes
import os  # Added for joining paths

# --- Constants for Windows API ---
MAX_PATH = 260  # Safe constant for MAX_PATH
CSIDL_DESKTOP = 0x0000
BIF_RETURNONLYFSDIRS = 0x0001
BIF_NEWDIALOGSTYLE = 0x0040
BIF_EDITBOX = 0x0010  # Flag for edit box
WM_USER = 0x0400
BFFM_INITIALIZED = 1
BFFM_SETSELECTIONW = WM_USER + 107  # Message to set selection

# Define the callback function prototype
# This must be defined before BROWSEINFO so BROWSEINFO can reference it.
# Use ctypes.c_void_p for lParam types to avoid relying on platform-specific ctypes.wintypes aliases.
BrowseCallbackProc = ctypes.WINFUNCTYPE(ctypes.c_int, ctypes.wintypes.HWND, ctypes.c_uint, ctypes.c_void_p,
                                        ctypes.c_void_p)


# --- Ctypes Structures and Functions ---
# Define the BROWSEINFO structure
class BROWSEINFO(ctypes.Structure):
    _fields_ = [
        ("hwndOwner", ctypes.wintypes.HWND),
        ("pidlRoot", ctypes.c_void_p),
        ("pszDisplayName", ctypes.c_wchar * MAX_PATH),
        ("lpszTitle", ctypes.c_wchar_p),
        ("ulFlags", ctypes.c_uint),
        ("lpfn", BrowseCallbackProc),  # Correctly defined as the function prototype
        ("lParam", ctypes.c_void_p),
        ("iImage", ctypes.c_int),
    ]


# --- Ctypes Function Definitions ---
# We must define the argument and result types for all API functions
# to prevent 32-bit/64-bit truncation errors.

# Get pointers to the Windows shell functions
SHBrowseForFolder = ctypes.windll.shell32.SHBrowseForFolderW
SHBrowseForFolder.argtypes = [ctypes.POINTER(BROWSEINFO)]
SHBrowseForFolder.restype = ctypes.c_void_p  # Returns a PIDL (a pointer)

SHGetPathFromIDList = ctypes.windll.shell32.SHGetPathFromIDListW
SHGetPathFromIDList.argtypes = [ctypes.c_void_p, ctypes.c_wchar_p]
SHGetPathFromIDList.restype = ctypes.wintypes.BOOL

CoTaskMemFree = ctypes.windll.ole32.CoTaskMemFree
CoTaskMemFree.argtypes = [ctypes.c_void_p]
CoTaskMemFree.restype = None

CoInitialize = ctypes.windll.ole32.CoInitialize
CoInitialize.argtypes = [ctypes.c_void_p]
CoInitialize.restype = ctypes.c_long  # HRESULT

CoUninitialize = ctypes.windll.ole32.CoUninitialize
CoUninitialize.argtypes = []
CoUninitialize.restype = None

# Definitions for new features
GetForegroundWindow = ctypes.windll.user32.GetForegroundWindow
GetForegroundWindow.restype = ctypes.wintypes.HWND
GetForegroundWindow.argtypes = []

SendMessageW = ctypes.windll.user32.SendMessageW
# Use generic pointer types for WPARAM/LPARAM to avoid missing platform aliases
SendMessageW.argtypes = [ctypes.wintypes.HWND, ctypes.c_uint, ctypes.c_void_p, ctypes.c_void_p]
SendMessageW.restype = ctypes.c_void_p


# --- Helper Function (For Folder Selector Node) ---
def open_folder_dialog(default_path=""):
    """
    Opens a native Windows folder selection dialog using ctypes.
    This version initializes and uninitializes COM for stability,
    includes an edit box, and sets a default path via callback.
    """

    # Callback function to set default path
    # The decorated function is the C-compatible callable object
    @BrowseCallbackProc
    def browse_callback(hwnd, uMsg, lParam, lpData):
        if uMsg == BFFM_INITIALIZED:
            # lpData contains the value we passed in bi.lParam (the default path pointer)
            # Send BFFM_SETSELECTIONW message to the dialog to set the path.
            # WPARAM: TRUE (1) to indicate lParam is a string pointer
            SendMessageW(hwnd, BFFM_SETSELECTIONW, ctypes.c_void_p(1), lpData)
        return 0

    folder_path = ""
    pidl = None

    # Keep a reference to the path pointer to prevent garbage collection
    default_path_ptr = ctypes.c_wchar_p(default_path)

    try:
        print("[GoddessLabs] Initializing COM...")
        # Initialize COM library for the current thread
        CoInitialize(None)

        print("[GoddessLabs] Initializing BROWSEINFO structure...")

        # Set up the browse info structure
        bi = BROWSEINFO()
        bi.hwndOwner = GetForegroundWindow()  # Set to foreground window
        bi.pidlRoot = None  # Start from desktop
        bi.lpszTitle = "GoddessLabs❤️‍🔥💊 - Select Folder (Type or Paste Path)"  # Title
        # Added BIF_EDITBOX flag
        bi.ulFlags = BIF_RETURNONLYFSDIRS | BIF_NEWDIALOGSTYLE | BIF_EDITBOX
        bi.lpfn = browse_callback  # Assign the callable object directly
        bi.lParam = ctypes.cast(default_path_ptr, ctypes.c_void_p)  # Pass default path to callback
        bi.iImage = 0

        print("[GoddessLabs] Opening folder dialog...")
        # Call SHBrowseForFolder, passing the struct by reference
        pidl = SHBrowseForFolder(ctypes.byref(bi))

        if pidl:
            print("[GoddessLabs] User selected a folder, getting path...")
            # Create a buffer to receive the path from SHGetPathFromIDList
            path_buffer = ctypes.create_unicode_buffer(MAX_PATH)

            # Call SHGetPathFromIDList to convert the item ID list (pidl) to a path string
            if SHGetPathFromIDList(pidl, path_buffer):
                folder_path = path_buffer.value
                print(f"[GoddessLabs] Folder selected: {folder_path}")
            else:
                # Fallback: the display name is in our struct (null-terminated array)
                display = "".join(bi.pszDisplayName).split("\x00", 1)[0]
                folder_path = display
                print(f"[GoddessLabs] Folder selected (from display name fallback): {folder_path}")

        else:
            print("[GoddessLabs] No folder selected.")

    except Exception as e:
        print(f"[GoddessLabs] Error opening folder dialog: {e}")

    finally:
        # --- CRITICAL CLEANUP ---
        # This 'finally' block runs no matter what, even if errors occur.
        if pidl:
            # Free the memory allocated by SHBrowseForFolder
            print("[GoddessLabs] Freeing memory...")
            CoTaskMemFree(pidl)

        print("[GoddessLabs] Uninitializing COM.")
        # Uninitialize COM library for the current thread
        CoUninitialize()

    return folder_path


# --- API Route (For Folder Selector Node) ---
@server.PromptServer.instance.routes.get("/goddesslabs/select-folder")
async def get_folder_path(request):
    """
    This is the custom API endpoint that the JavaScript frontend will call.
    It runs the blocking ctypes dialog in an executor thread.
    """
    print("[GoddessLabs] API route /goddesslabs/select-folder hit")

    # Logic to determine default path
    # Get the current path from the query string (sent by JS)
    current_path = request.query.get("current_path", "")

    default_path = ""
    # Check if the provided path is a valid directory
    if current_path and os.path.isdir(current_path):
        default_path = current_path
    elif current_path and "No folder selected" not in current_path:
        # If path is invalid but not the default text, try its parent
        parent_dir = os.path.dirname(current_path)
        if os.path.isdir(parent_dir):
            default_path = parent_dir

    # If no valid path, fallback to ComfyUI input folder
    if not default_path:
        try:
            # Get the base ComfyUI directory from the current file path
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            input_dir = os.path.join(base_dir, "input")
            if os.path.isdir(input_dir):
                default_path = input_dir
        except Exception as e:
            print(f"[GoddessLabs] Could not find ComfyUI input folder: {e}")

    print(f"[GoddessLabs] Using default path: {default_path}")

    loop = asyncio.get_running_loop()

    # Run the blocking dialog code in a separate thread, passing the default path
    folder_path = await loop.run_in_executor(None, open_folder_dialog, default_path)

    # Return the selected path as JSON
    return web.json_response({"folder_path": folder_path})


# --- Custom Node: Folder Selector (Input) ---
class GoddessLabsFolderSelector:
    """
    A simple node that provides a string output for a folder path.
    The path is set by a custom button added via JavaScript.
    """

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                # This string widget will be populated by our JS
                "path_widget": ("STRING", {"default": "No folder selected..."}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("folder_path",)
    FUNCTION = "return_path"
    CATEGORY = "GoddessLabs❤️‍🔥💊"

    def return_path(self, path_widget):
        # The value of the widget is the path we want to output
        return (path_widget,)


# --- Node Mappings ---
# This is how ComfyUI finds your node
NODE_CLASS_MAPPINGS = {
    "GoddessLabsFolderSelector": GoddessLabsFolderSelector,
}

# This is the name that will appear in the "Add Node" menu
NODE_DISPLAY_NAME_MAPPINGS = {
    "GoddessLabsFolderSelector": "GoddessLabs❤️‍🔥💊 Folder Selector",
}

# This tells ComfyUI to look in the /js folder for our frontend script
WEB_DIRECTORY = "js"

print("***********************************")
print("GoddessLabs❤️‍🔥💊 Custom Nodes Loaded (Folder Selector Only)")
print("***********************************")