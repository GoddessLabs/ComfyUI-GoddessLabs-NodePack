# File: ComfyUI-GoddessLabs-NodePack/nodes/utility/destroy_and_recreate/destroy_and_recreate.py

import server

class AnyType(str):
    """A special class that is always equal in not equal comparisons. Credit to pythongosssss"""
    def __ne__(self, __value):
        return False

any_type = AnyType("*")

class GoddessLabsDestroyAndRecreate:
    """
    A pass-through node that can be "destroyed and recreated" via the frontend
    to force downstream nodes to re-execute (breaking the cache).
    """

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {},
            "optional": {
                "any_input": (any_type,),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
            },
        }

    RETURN_TYPES = (any_type,)
    RETURN_NAMES = ("any_output",)
    FUNCTION = "passthrough"
    CATEGORY = "GoddessLabs❤️‍🔥💊/Utility"

    def __init__(self):
        self.last_input_hash = None

    def passthrough(self, unique_id, any_input=None):
        # Calculate hash of the current input
        current_hash = None
        if any_input is not None:
            try:
                # Try to hash the input directly
                current_hash = hash(str(any_input))
            except Exception:
                # Fallback for unhashable types
                current_hash = str(any_input)

        # Check if input has changed
        if self.last_input_hash is not None and current_hash != self.last_input_hash:
            # Input changed! Trigger reload event.
            server.PromptServer.instance.send_sync("goddesslabs.reload_node", {"node_id": unique_id})

        # Update cache
        self.last_input_hash = current_hash

        return (any_input,)

NODE_CLASS_MAPPINGS = {
    "GoddessLabsDestroyAndRecreate": GoddessLabsDestroyAndRecreate,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "GoddessLabsDestroyAndRecreate": "Destroy & Recreate ❤️‍🔥💊 GoddessLabs",
}
