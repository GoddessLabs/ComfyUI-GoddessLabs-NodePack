
import server

class AnyType(str):
    """A special class that is always equal in not equal comparisons."""
    def __ne__(self, __value):
        return False

any_type = AnyType("*")

class GoddessLabsSaveState:
    """
    A utility node that stores widget states of connected downstream nodes.
    States are saved in the node's properties and managed via the frontend.
    """

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {},
            "optional": {
                # Input is optional to support the Toggle ON/OFF feature in JS
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

    def passthrough(self, unique_id, any_input=None):
        return (any_input,)

NODE_CLASS_MAPPINGS = {
    "GoddessLabsSaveState": GoddessLabsSaveState,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "GoddessLabsSaveState": "❤️‍🔥💾 Save State (Alpha)",
}