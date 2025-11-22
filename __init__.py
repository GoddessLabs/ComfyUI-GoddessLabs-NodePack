# File: ComfyUI-GoddessLabs-NodePack/__init__.py

"""
@author: GoddessLabs
@title: GoddessLabs NodePack
@nickname: GoddessLabs
@description: Custom nodes to conveniently enhance images through Detector, Detailer, Upscaler, Pipe, and more.
"""

import importlib
import logging
import traceback
import os
import subprocess
import sys

# Version 0.0.5
version_code = [0, 0, 5]
version_str = f"V{version_code[0]}.{version_code[1]}" + (f'.{version_code[2]}' if len(version_code) > 2 else '')

logging.info(f"### Loading: ComfyUI-GoddessLabs-NodePack ({version_str})")

# --- START: Automatic Dependency Installation Logic ---
# This checks for the requirements.txt and installs them if a dependency is missing.
FILE_DIR = os.path.dirname(__file__)
REQUIREMENTS_PATH = os.path.join(FILE_DIR, "requirements.txt")


# We can check for a specific dependency like 'tk' (the dependency in your requirements.txt)
# to see if we should run the installer.

def check_and_install_dependencies():
    """
    Checks if a dependency is missing and installs all requirements if needed.
    This function uses a subprocess to run 'pip install -r requirements.txt'.
    """
    try:
        # Check for a specific package (e.g., 'wx' is used in your requirements.txt)
        # If the import succeeds, dependencies are likely satisfied.
        # Note: If your dependency is a sub-module (e.g., 'PIL' for 'Pillow'), check the top-level name.
        importlib.import_module('wx')
        return
    except ImportError:
        # If the import fails, proceed with installation.
        logging.warning("[GoddessLabs] Dependencies not found. Attempting to install packages from requirements.txt...")

    if not os.path.exists(REQUIREMENTS_PATH):
        logging.error(f"[GoddessLabs] ERROR: requirements.txt not found at {REQUIREMENTS_PATH}")
        return

    try:
        # Determine the correct python executable path
        # Using sys.executable ensures we use the same Python environment that is running ComfyUI.
        python_exec = sys.executable

        # Use the subprocess to run pip install
        command = [python_exec, "-m", "pip", "install", "-r", REQUIREMENTS_PATH]

        logging.info(f"[GoddessLabs] Running installation command: {' '.join(command)}")

        process = subprocess.Popen(
            command,
            cwd=FILE_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = process.communicate()

        if process.returncode == 0:
            logging.info("[GoddessLabs] Successfully installed dependencies.")
        else:
            logging.error(f"[GoddessLabs] Dependency installation failed (Return Code {process.returncode}).")
            logging.error(f"STDOUT:\n{stdout}")
            logging.error(f"STDERR:\n{stderr}")

    except Exception as e:
        logging.error(f"[GoddessLabs] An unexpected error occurred during dependency installation: {e}")
        traceback.print_exc()


check_and_install_dependencies()
# --- END: Automatic Dependency Installation Logic ---

node_list = [
    "utility.folder_browser.folder_browser",
]

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}

for module_name in node_list:
    try:
        # The importlib.reload is useful here after installing new modules
        # It attempts to reload the module if it was already loaded before the dependency installation.
        if ".nodes.{}".format(module_name) in sys.modules:
            importlib.reload(sys.modules[".nodes.{}".format(module_name)])

        imported_module = importlib.import_module(".nodes.{}".format(module_name), __name__)

        if hasattr(imported_module, 'NODE_CLASS_MAPPINGS'):
            NODE_CLASS_MAPPINGS.update(imported_module.NODE_CLASS_MAPPINGS)

        if hasattr(imported_module, 'NODE_DISPLAY_NAME_MAPPINGS'):
            NODE_DISPLAY_NAME_MAPPINGS.update(imported_module.NODE_DISPLAY_NAME_MAPPINGS)

        logging.info(f"[GoddessLabs] Successfully loaded node module: {module_name}")

    except Exception as e:
        logging.error(f"[GoddessLabs] ERROR loading node module '{module_name}'")
        traceback.print_exc()

WEB_DIRECTORY = "js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]

logging.info(f"***********************************")
logging.info(f"GoddessLabs❤️‍🔥💊 Custom Nodes Loaded ({len(NODE_CLASS_MAPPINGS)} Node Classes Total)")
logging.info(f"***********************************")