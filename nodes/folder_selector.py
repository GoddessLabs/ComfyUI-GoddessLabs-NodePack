# File: ComfyUI-GoddessLabs-NodePack/nodes/folder_selector.py

import server
import asyncio
from aiohttp import web
import os
import sys
import logging

# --- Safe Import for Windows logic ---
try:
    import ctypes
    from ctypes import wintypes

    IS_WINDOWS = True
except (ImportError, AttributeError):
    IS_WINDOWS = False

# --- Constants for Windows API ---
MAX_PATH = 260
BIF_RETURNONLYFSDIRS = 0x0001
BIF_NEWDIALOGSTYLE = 0x0040
BIF_EDITBOX = 0x0010
WM_USER = 0x0400
BFFM_INITIALIZED = 1
BFFM_SETSELECTIONW = WM_USER + 107

# --- Ctypes Structures and Functions (Windows Only) ---
if IS_WINDOWS:
    BrowseCallbackProc = ctypes.WINFUNCTYPE(ctypes.c_int, wintypes.HWND, ctypes.c_uint, ctypes.c_void_p,
                                            ctypes.c_void_p)


    class BROWSEINFO(ctypes.Structure):
        _fields_ = [
            ("hwndOwner", wintypes.HWND),
            ("pidlRoot", ctypes.c_void_p),
            ("pszDisplayName", ctypes.c_wchar * MAX_PATH),
            ("lpszTitle", ctypes.c_wchar_p),
            ("ulFlags", ctypes.c_uint),
            ("lpfn", BrowseCallbackProc),
            ("lParam", ctypes.c_void_p),
            ("iImage", ctypes.c_int),
        ]


    SHBrowseForFolder = ctypes.windll.shell32.SHBrowseForFolderW
    SHBrowseForFolder.argtypes = [ctypes.POINTER(BROWSEINFO)]
    SHBrowseForFolder.restype = ctypes.c_void_p

    SHGetPathFromIDList = ctypes.windll.shell32.SHGetPathFromIDListW
    SHGetPathFromIDList.argtypes = [ctypes.c_void_p, ctypes.c_wchar_p]
    SHGetPathFromIDList.restype = wintypes.BOOL

    CoTaskMemFree = ctypes.windll.ole32.CoTaskMemFree
    CoTaskMemFree.argtypes = [ctypes.c_void_p]
    CoTaskMemFree.restype = None

    CoInitialize = ctypes.windll.ole32.CoInitialize
    CoInitialize.argtypes = [ctypes.c_void_p]
    CoInitialize.restype = ctypes.c_long

    CoUninitialize = ctypes.windll.ole32.CoUninitialize
    CoUninitialize.argtypes = []
    CoUninitialize.restype = None

    GetForegroundWindow = ctypes.windll.user32.GetForegroundWindow
    GetForegroundWindow.restype = wintypes.HWND
    GetForegroundWindow.argtypes = []

    SendMessageW = ctypes.windll.user32.SendMessageW
    SendMessageW.argtypes = [wintypes.HWND, ctypes.c_uint, ctypes.c_void_p, ctypes.c_void_p]
    SendMessageW.restype = ctypes.c_void_p
else:
    BROWSEINFO = None


def open_folder_dialog(default_path=""):
    if not IS_WINDOWS:
        print("[GoddessLabs] Error: Native folder dialogs are only supported on Windows hosts.")
        return None

    @BrowseCallbackProc
    def browse_callback(hwnd, uMsg, lParam, lpData):
        if uMsg == BFFM_INITIALIZED:
            SendMessageW(hwnd, BFFM_SETSELECTIONW, ctypes.c_void_p(1), lpData)
        return 0

    folder_path = ""
    pidl = None
    default_path_ptr = ctypes.c_wchar_p(default_path)

    try:
        CoInitialize(None)
        bi = BROWSEINFO()
        bi.hwndOwner = GetForegroundWindow()
        bi.pidlRoot = None
        bi.lpszTitle = "GoddessLabs❤️‍🔥💊 - Select Folder"
        bi.ulFlags = BIF_RETURNONLYFSDIRS | BIF_NEWDIALOGSTYLE | BIF_EDITBOX
        bi.lpfn = browse_callback
        bi.lParam = ctypes.cast(default_path_ptr, ctypes.c_void_p)
        bi.iImage = 0

        pidl = SHBrowseForFolder(ctypes.byref(bi))
        if pidl:
            path_buffer = ctypes.create_unicode_buffer(MAX_PATH)
            if SHGetPathFromIDList(pidl, path_buffer):
                folder_path = path_buffer.value
                if folder_path and not folder_path.endswith("\\"):
                    folder_path += "\\"
            else:
                display = "".join(bi.pszDisplayName).split("\x00", 1)[0]
                folder_path = display
    except Exception as e:
        print(f"[GoddessLabs] Error opening folder dialog: {e}")
    finally:
        if pidl:
            CoTaskMemFree(pidl)
        CoUninitialize()

    return folder_path


# --- API Route Registration ---
routes = server.PromptServer.instance.routes


@routes.get("/api/goddesslabs/select-folder")
async def get_folder_path(request):
    if not IS_WINDOWS:
        return web.json_response({"folder_path": "", "error": "Not supported on non-Windows OS"})

    current_path = request.query.get("current_path", "")
    default_path = ""

    if current_path and os.path.isdir(current_path):
        default_path = current_path
    elif current_path and "No folder selected" not in current_path:
        parent_dir = os.path.dirname(current_path)
        if os.path.isdir(parent_dir):
            default_path = parent_dir

    if not default_path:
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            input_dir = os.path.join(base_dir, "input")
            if os.path.isdir(input_dir):
                default_path = input_dir
        except Exception:
            pass

    loop = asyncio.get_running_loop()
    folder_path = await loop.run_in_executor(None, open_folder_dialog, default_path)
    return web.json_response({"folder_path": folder_path})


class GoddessLabsFolderSelector:
    """
    Selects a folder and allows appending a string (Widget only).
    """

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "path": ("STRING", {"default": "No folder selected..."}),
                "append": ("STRING", {"default": "", "multiline": False}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("folder_path",)
    FUNCTION = "return_path"
    CATEGORY = "GoddessLabs❤️‍🔥💊"

    def return_path(self, path, append):
        final_path = path + append
        return (final_path,)


NODE_CLASS_MAPPINGS = {
    "GoddessLabsFolderSelector": GoddessLabsFolderSelector,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "GoddessLabsFolderSelector": "Folder Selector ❤️‍🔥💊 GoddessLabs",
}