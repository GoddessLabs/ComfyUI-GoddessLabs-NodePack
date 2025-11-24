Todo List:

### Folder Browser Node
- Create a config.txt file following the simple style formating as the append options file. This config file has an option to change the default folder path, and the default toggles for properties like auto refresh, show hidden files, etc.




## Future Node Ideas
- Append options node

## Savestates Node
    - **Niche Frustration:** You are tweaking a Sampler to find the perfect settings. You change cfg from 7 to 8, then 8 to 6. You forgot what the settings were 3 steps ago that looked good.
    - **Solution:** Add "Slot" buttons (1, 2, 3) to the node UI.
        - **Save:** Ctrl+Click on "Slot 1" saves the current widget state of the target node to your "Destroy" node's internal memory.
        - **Load:** Click "Slot 1" -> Destroys target node -> Recreates it with the saved settings.
    - **Insight:** This brings video game emulator savestates to node tuning. It's faster than duplicating the node 3 times and rewiring.

### Batch Loader Node
    - **Functionality:** This node would allow users to select a directory and batch load multiple files from it, potentially applying a common operation or processing them sequentially.
    - **Configuration:**
        - **Directory Path:** Input field to specify the source directory.
        - **File Filter:** Options to filter files by extension (e.g., `.jpg`, `.png`), name patterns, or other criteria.
        - **Batch Size:** Define how many files to process in a single batch.
        - **Recursive Search:** Toggle to include files in subdirectories.
    - **Output:**
        - A list of loaded file paths or file contents.
        - A mechanism to iterate through the loaded files for subsequent nodes.

### Run workflow node (runs comfyui at a set time of day, or on a timer)
    - **Trigger Mechanisms:**
        - **Scheduled Execution:** User-defined time of day (e.g., daily at 3 AM), or specific days of the week.
        - **Interval Timer:** Run every X minutes/hours.
        - **Event-Based Trigger:** (e.g., file system change, webhook, new data available).
    - **Workflow Selection:**
        - Dropdown or browser to select a saved ComfyUI workflow.
        - Option to specify workflow parameters (e.g., input images, text prompts).
    - **Execution Environment:**
        - Option to specify ComfyUI instance (local, remote).
        - Resource allocation (GPU priority, CPU limits).
    - **Output Handling:**
        - Save generated images/data to a specified folder.
        - Naming conventions for output files.
        - Option to pass outputs to subsequent nodes.
    - **Logging & Monitoring:**
        - Execution status (running, completed, failed).
        - Detailed logs for debugging.
        - Notifications on completion or error.
    - **Error Handling:**
        - Retry mechanisms.
        - Define behavior on failure (e.g., stop, notify).

## Non Node Ideas
- 'Nudge' a hotkey add-on to control moving a selected node, or group of nodes, by a set amount of pixels using arrow keys. Add's options to the keybinding settings.