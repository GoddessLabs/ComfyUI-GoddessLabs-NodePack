// File: ComfyUI-GoddessLabs-NodePack/js/folder_selector.js

import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

async function selectFolder(widget) {
    const currentPath = widget.value;
    try {
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
                const node = this;
                
                // Version 0.0.3
                this.properties["version"] = "0.0.3";

                // --- VISUAL STYLING LOGIC ---
                // 1. Intercept 'configure' to detect restoring from save
                let isRestoring = false;
                const origConfigure = node.configure;
                
                node.configure = function(data) {
                    isRestoring = true; 
                    if (origConfigure) {
                        origConfigure.apply(this, arguments);
                    }
                };

                // 2. Apply Branding only on fresh creation
                setTimeout(() => {
                    if (!isRestoring) {
                        if (!node.color) {
                            node.color = "#633CCA";   // Goddess Purple
                            node.bgcolor = "#633CCA";
                        }
                        node.shape = 1; // Box Shape
                    }
                }, 0);

                const pathWidget = this.widgets.find(w => w.name === "path");
                if (pathWidget) {
                    const selectButton = this.addWidget(
                        "button",
                        "Select Folder",
                        null,
                        () => { selectFolder(pathWidget); },
                        { serialize: false }
                    );
                }

                // --- SIZE CALCULATION ---
                const originalComputeSize = this.computeSize;
                this.computeSize = function(size) {
                    const newSize = originalComputeSize ? originalComputeSize.apply(this, arguments) : [0, 0];
                    
                    // Width Adjustment: +15px (Optimized)
                    newSize[0] += 15; 

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
            };
        }
    },
});