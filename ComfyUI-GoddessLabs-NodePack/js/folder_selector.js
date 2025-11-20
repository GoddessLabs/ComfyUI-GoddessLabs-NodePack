// File: ComfyUI-GoddessLabs-NodePack/js/folder_selector.js

import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

async function selectFolder(widget) {
    const currentPath = widget.value;
    try {
        // api.fetchApi automatically prepends '/api', so we request:
        // /api/goddesslabs/select-folder
        const resp = await api.fetchApi("/goddesslabs/select-folder", {
            method: "GET",
            cache: "no-store",
            params: {
                current_path: encodeURIComponent(currentPath)
            }
        });
        
        if (resp.status === 200) {
            const data = await resp.json();
            if (data.error) {
                alert("[GoddessLabs] " + data.error);
                return;
            }
            if (data.folder_path) {
                widget.value = data.folder_path;
            }
        } else {
            console.error(`[GoddessLabs] Error fetching folder path: ${resp.status}`);
            alert(`[GoddessLabs] Connection Error (${resp.status}). Check console.`);
        }
    } catch (e) {
        console.error(`[GoddessLabs] Error fetching folder path:`, e);
    }
}

app.registerExtension({
    name: "GoddessLabs.FolderSelector",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "GoddessLabsFolderSelector") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                onNodeCreated?.apply(this, arguments);

                const pathWidget = this.widgets.find(w => w.name === "path_widget");
                if (pathWidget) {
                    const selectButton = this.addWidget(
                        "button",
                        "Select Folder",
                        null,
                        () => { selectFolder(pathWidget); },
                        { serialize: false }
                    );
                    
                    // Ensure button visibility
                    const originalComputeSize = this.computeSize;
                    this.computeSize = function(size) {
                        const newSize = originalComputeSize ? originalComputeSize.apply(this, arguments) : [0, 0];
                        let requiredHeight = 0;
                        if (this.widgets) {
                            for (const w of this.widgets) {
                                requiredHeight += (w.computeSize ? w.computeSize(newSize)[1] : 20) + 4; 
                            }
                        }
                        if (newSize[1] < requiredHeight + 30) {
                            newSize[1] = requiredHeight + 30;
                        }
                        return newSize;
                    }
                }
            };
        }
    },
});