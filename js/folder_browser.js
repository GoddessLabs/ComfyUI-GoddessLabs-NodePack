// File: ComfyUI-GoddessLabs-NodePack/js/folder_browser.js

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
        }
    } catch (e) {
        console.error(`[GoddessLabs] Error fetching folder path:`, e);
    }
}

/**
 * Finds the node connected to the "folder_path" output, destroys it,
 * and creates a fresh clone with the same settings/connections.
 */
function reloadConnectedNode(sourceNode) {
    const graph = app.graph;
    const output = sourceNode.outputs[0];
    if (!output || !output.links || output.links.length === 0) {
        alert("[GoddessLabs] No node connected to 'folder_path' link!");
        return;
    }

    const linkIds = [...output.links];
    let reloadedCount = 0;

    linkIds.forEach(linkId => {
        const link = graph.links[linkId];
        if (!link) return;

        const oldNode = graph.getNodeById(link.target_id);
        if (!oldNode) return;

        const newNode = LiteGraph.createNode(oldNode.type);
        newNode.pos = [oldNode.pos[0], oldNode.pos[1]];
        newNode.size = [...oldNode.size];
        
        if (oldNode.properties) newNode.properties = JSON.parse(JSON.stringify(oldNode.properties));
        if (oldNode.color) newNode.color = oldNode.color;
        if (oldNode.bgcolor) newNode.bgcolor = oldNode.bgcolor;
        
        graph.add(newNode);

        if (oldNode.widgets && newNode.widgets) {
            for (let i = 0; i < oldNode.widgets.length; i++) {
                const sourceWidget = oldNode.widgets[i];
                const destWidget = newNode.widgets.find(w => w.name === sourceWidget.name);
                if (destWidget) {
                    destWidget.value = sourceWidget.value;
                }
            }
        }

        if (oldNode.inputs) {
            for (let i = 0; i < oldNode.inputs.length; i++) {
                const input = oldNode.inputs[i];
                if (input.link !== null) {
                    const inputLink = graph.links[input.link];
                    const originNode = graph.getNodeById(inputLink.origin_id);
                    originNode.connect(inputLink.origin_slot, newNode, i);
                }
            }
        }

        if (oldNode.outputs) {
            for (let i = 0; i < oldNode.outputs.length; i++) {
                const output = oldNode.outputs[i];
                if (output.links) {
                    const outputLinkIds = [...output.links];
                    outputLinkIds.forEach(outLinkId => {
                        const outLink = graph.links[outLinkId];
                        const targetNode = graph.getNodeById(outLink.target_id);
                        newNode.connect(i, targetNode, outLink.target_slot);
                    });
                }
            }
        }

        graph.remove(oldNode);
        reloadedCount++;
    });

    if (reloadedCount > 0) {
        app.graph.setDirtyCanvas(true, true);
    }
}

// Helper to add the button
function addReloadButton(node) {
    // Prevent duplicates
    if (node.widgets && node.widgets.find(w => w.name === "Reload Connected Node ⟳")) return;
    
    node.addWidget(
        "button",
        "Reload Connected Node ⟳",
        null,
        () => { reloadConnectedNode(node); },
        { serialize: false }
    );
}

// Helper to remove the button
function removeReloadButton(node) {
    if (!node.widgets) return;
    const index = node.widgets.findIndex(w => w.name === "Reload Connected Node ⟳");
    if (index !== -1) {
        node.widgets.splice(index, 1);
    }
}

app.registerExtension({
    name: "GoddessLabs.FolderBrowser",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "GoddessLabsFolderSelector") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            
            nodeType.prototype.onNodeCreated = function () {
                onNodeCreated?.apply(this, arguments);
                const node = this;
                
                // Version 0.0.4
                this.properties["version"] = "0.0.4";

                // --- CONFIG: Reload Button Visibility ---
                if (this.properties["show_reload_button"] === undefined) {
                    this.properties["show_reload_button"] = false;
                }

                // --- VISUAL STYLING ---
                let isRestoring = false;
                const origConfigure = node.configure;
                
                node.configure = function(data) {
                    isRestoring = true; 
                    if (origConfigure) {
                        origConfigure.apply(this, arguments);
                    }
                };

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
                    // Always add Select Folder button
                    this.addWidget(
                        "button",
                        "Select Folder",
                        null,
                        () => { selectFolder(pathWidget); },
                        { serialize: false }
                    );

                    // Add Reload Button only if Config is True
                    if (this.properties["show_reload_button"]) {
                        addReloadButton(this);
                    }
                }

                // --- PROPERTY CHANGE LISTENER ---
                const onPropertyChanged = node.onPropertyChanged;
                node.onPropertyChanged = function(name, value) {
                    if (onPropertyChanged) {
                        onPropertyChanged.apply(this, arguments);
                    }
                    
                    if (name === "show_reload_button") {
                        if (value === true) {
                            addReloadButton(node);
                        } else {
                            removeReloadButton(node);
                        }
                        
                        // Force resize to fit/shrink
                        if (node.size) {
                           node.setSize(node.computeSize([node.size[0], node.size[1]]));
                        }
                    }
                };

                // --- SIZE CALCULATION ---
                const originalComputeSize = this.computeSize;
                this.computeSize = function(size) {
                    const newSize = originalComputeSize ? originalComputeSize.apply(this, arguments) : [0, 0];
                    
                    // Width Adjustment: +5px (Updated)
                    newSize[0] += 5; 

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