1. Avoid feature creep. Do not add unnecessary features. When a sub-feature needs to be added to complete a request, get confirmation first.
2. Maintain consistentcy across the project. Consolidate logic. Example: instead of three different variations on a function with slight variations, create a single function that can handle all variations using consistent design.
3. Update md files as needed to document changes. Take care to not remove any previous information that could be useful for future reference.
4. Maintain consistency in node design and styling. Nodes must be box-shaped, default to purple (`#6a0dad`), and consistently apply common UI elements (e.g., settings gear) where useful.
5. Consistently document changes in the patch notes.

## Technical Guidelines

### Cross-Platform Safety
*   **Dependency Management:** Rely on `requirements.txt` and `__init__.py` for dependencies like `wxPython`.
*   **Execution Context:** Wrap blocking calls (like dialogs) in `asyncio.get_running_loop().run_in_executor(None, ...)` to prevent blocking the ComfyUI API server.
*   **Path Format:** Avoid OS-specific path toggling hacks. Rely on the "Destroy & Recreate" pattern for hard refreshes.

### Path Normalization
*   Ensure directory paths returned to the frontend always end with the correct OS separator (`os.path.sep`).

### JavaScript Widget Sizing
*   **Override `computeSize`:** Hook into the node's `computeSize` method for dynamic sizing.
*   **Dynamic Calculation:** Iterate through `this.widgets` to calculate height. Add padding (width +10px).

### Forcing Node Refreshes
*   **"Destroy & Recreate" Pattern:** To force a hard refresh of connected nodes (bypassing internal caches), use the `reloadConnectedNode` function in JS. This destroys the old node and creates a clone with a new ID.