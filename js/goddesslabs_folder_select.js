import { app } from "/scripts/app.js";
// --- FIXED: Import the 'api' object needed for backend communication ---
import { api } from "/scripts/api.js";

// Function to call the backend API
async function selectFolder(widget) {
    // Get the current path from the widget to send to the backend
    const currentPath = widget.value;

    try {
        // Now 'api' is defined and this call will work
        const resp = await api.fetchApi("/goddesslabs/select-folder", {
            method: "GET",
            cache: "no-store",
            params: {
                // Send the current path as a query parameter
                current_path: encodeURIComponent(currentPath)
            }
        });
        
        if (resp.status === 200) {
            const data = await resp.json();
            if (data.folder_path) {
                // Set the widget's value to the selected path
                widget.value = data.folder_path;
            } else {
                console.warn("[GoddessLabs] No folder path received from backend.");
            }
        } else {
            console.error(`[GoddessLabs] Error fetching folder path: ${resp.status} ${resp.statusText}`);
        }
    } catch (e) {
        console.error(`[GoddessLabs] Error fetching folder path:`, e);
    }
}

// Extend the app
app.registerExtension({
    name: "GoddessLabs.FolderSelector",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        // Check if this is the correct node
        if (nodeData.name === "GoddessLabsFolderSelector") {
            
            // This function is called when the graph is re-drawn
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                onNodeCreated?.apply(this, arguments);

                // Find the 'path_widget'
                const pathWidget = this.widgets.find(w => w.name === "path_widget");

                if (pathWidget) {
                    // Create the "Select Folder" button
                    const selectButton = this.addWidget(
                        "button",
                        "Select Folder",
                        null,
                        () => {
                            // Call our API function when the button is clicked
                            selectFolder(pathWidget);
                        },
                        {
                            // Styling options for the button
                            serialize: false 
                        }
                    );

                    // Make the button more visible
                    selectButton.serialize = false;
                    
                    // --- RE-CALCULATE NODE SIZE ---
                    // This ensures the node is tall enough for the new button
                    const originalComputeSize = this.computeSize;
                    this.computeSize = function() {
                        const size = originalComputeSize.apply(this, arguments);
                        // Make the node slightly taller to fit the button
                        // We check if the button is already added to avoid errors
                        if (this.widgets[this.widgets.length - 1] === selectButton) {
                             size[1] += selectButton.computeSize([size[0], size[1]])[1] + 5; 
                        }
                        return size;
                    }
                } else {
                    console.error("[GoddessLabs] Could not find 'path_widget' on node.");
                }
            };
        }
    },
});
