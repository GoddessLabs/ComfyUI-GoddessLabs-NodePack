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

version_code = [0, 0, 2]
version_str = f"V{version_code[0]}.{version_code[1]}" + (f'.{version_code[2]}' if len(version_code) > 2 else '')

logging.info(f"### Loading: ComfyUI-GoddessLabs-NodePack ({version_str})")

node_list = [
    "folder_selector",
]

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}

for module_name in node_list:
    try:
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