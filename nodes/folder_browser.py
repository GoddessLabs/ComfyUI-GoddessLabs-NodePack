# File: ComfyUI-GoddessLabs-NodePack/nodes/folder_browser.py

import server
import asyncio
from aiohttp import web
import os
import sys
import logging

# --- Cross-Platform wxPython Import ---
try:
    import wx

    IS_WXP_AVAILABLE = True
except ImportError:
    IS_WXP_AVAILABLE = False
    logging.warning("[GoddessLabs] Warning: wxPython is not installed. Folder Browser will not function.")


# --- Folder Dialog Implementation using wxPython ---

def open_folder_dialog(default_path=""):
    """
    Opens a native folder selection dialog using wxPython.
    This function should be executed on the main thread or in a way
    that allows wxPython to run its event loop (executed via run_in_executor).
    """
    if not IS_WXP_AVAILABLE:
        print("[GoddessLabs] Error: wxPython not available.")
        return None

    # Use a minimal wx.App and wx.Frame to host the dialog
    # wx.App(False) prevents stdout/stderr redirection
    app = wx.App(False)
    # A Frame is needed to host the dialog
    frame = wx.Frame(None)

    # Path normalization for default_path
    if not os.path.isdir(default_path):
        default_path = ""

    folder_path = None

    try:
        # Use DirDialog to select a folder
        with wx.DirDialog(
                frame,
                "GoddessLabs❤️‍🔥💊 - Select Folder",
                defaultPath=default_path,
                style=wx.DD_DEFAULT_STYLE | wx.DD_DIR_MUST_EXIST
        ) as dlg:

            # The previous Z-ORDER FIX (frame.Show(True) and frame.Raise()) has been removed
            # as it was causing crashes.

            if dlg.ShowModal() == wx.ID_OK:
                folder_path = dlg.GetPath()
    except Exception as e:
        print(f"[GoddessLabs] Error opening wxPython folder dialog: {e}")
        logging.error(f"[GoddessLabs] Error opening wxPython folder dialog: {e}")
    finally:
        # Clean up wx resources
        frame.Destroy()
        app.ExitMainLoop()
        # Ensure wx.App instance is cleaned up
        if app:
            del app

    # Ensure path ends with the correct OS separator
    if folder_path and not folder_path.endswith(os.path.sep):
        folder_path += os.path.sep

    return folder_path


def toggle_path_format(path):
    """
    Placeholder for the old Windows-specific cache-busting function (Short/Long Path).
    It now returns the path unchanged, relying on the JS side node-recreation for cache-busting.
    """
    return path


# --- API Route Registration ---
routes = server.PromptServer.instance.routes


@routes.get("/api/goddesslabs/select-folder")
async def get_folder_path(request):
    if not IS_WXP_AVAILABLE:
        return web.json_response(
            {"folder_path": "", "error": "wxPython is not installed. Folder selection is unavailable."})

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
            # Fallback logic to ComfyUI input directory
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            input_dir = os.path.join(base_dir, "input")
            if os.path.isdir(input_dir):
                default_path = input_dir
        except Exception:
            pass

    loop = asyncio.get_running_loop()
    # Run the blocking wxPython dialog in a separate executor thread
    folder_path = await loop.run_in_executor(None, open_folder_dialog, default_path)
    return web.json_response({"folder_path": folder_path})


@routes.get("/api/goddesslabs/refresh-path")
async def refresh_path_trigger(request):
    """API to handle path refresh (now uses the placeholder toggle_path_format)."""
    path = request.query.get("path", "")
    if not IS_WXP_AVAILABLE or not path:
        return web.json_response({"path": path})

    loop = asyncio.get_running_loop()
    new_path = await loop.run_in_executor(None, toggle_path_format, path)

    return web.json_response({"path": new_path})


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
    "GoddessLabsFolderSelector": "Folder Browser ❤️‍🔥💊 GoddessLabs",
}