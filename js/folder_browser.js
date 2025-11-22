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
        alert(`[GoddessLabs] Error: ${e.message || "Unknown error occurred while selecting folder."}`);
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
        // FIX: Copy title to prevent loss
        if (oldNode.title) newNode.title = oldNode.title;

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

                // Version 0.0.55
                this.properties["version"] = "0.0.55";

                // --- CONFIG: Reload Button Visibility & Auto-Reload ---
                if (this.properties["show_reload_button"] === undefined) {
                    this.properties["show_reload_button"] = false;
                }
                if (this.properties["auto_reload_on_change"] === undefined) {
                    this.properties["auto_reload_on_change"] = false;
                }

                // --- FETCH APPEND OPTIONS ---
                let appendOptions = [];
                api.fetchApi("/goddesslabs/append-options")
                    .then(resp => resp.json())
                    .then(data => {
                        if (Array.isArray(data)) {
                            appendOptions = data;
                        }
                    })
                    .catch(err => console.error("[GoddessLabs] Error fetching append options:", err));

                // --- VISUAL STYLING ---
                let isRestoring = false;
                const origConfigure = node.configure;

                node.configure = function (data) {
                    isRestoring = true;
                    if (origConfigure) {
                        origConfigure.apply(this, arguments);
                    }
                    // FIX: Apply reload button state after configuration load
                    if (this.properties["show_reload_button"]) {
                        addReloadButton(this);
                    } else {
                        removeReloadButton(this);
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
                const appendWidget = this.widgets.find(w => w.name === "append");

                if (pathWidget) {
                    // Hook into widget callback for manual changes
                    const origCallback = pathWidget.callback;
                    pathWidget.callback = function (value) {
                        if (origCallback) origCallback.apply(this, arguments);
                        if (node.properties["auto_reload_on_change"]) {
                            reloadConnectedNode(node);
                        }
                    };

                    // Always add Select Folder button
                    this.addWidget(
                        "button",
                        "Select Folder",
                        null,
                        () => {
                            selectFolder(pathWidget).then(() => {
                                // Trigger auto-reload if enabled (selectFolder updates value directly)
                                if (node.properties["auto_reload_on_change"]) {
                                    reloadConnectedNode(node);
                                }
                            });
                        },
                        { serialize: false }
                    );

                    // Add Reload Button only if Config is True
                    if (this.properties["show_reload_button"]) {
                        addReloadButton(this);
                    }
                }

                if (appendWidget) {
                    // Hook into append widget callback for auto-reload
                    const origAppendCallback = appendWidget.callback;
                    appendWidget.callback = function (value) {
                        if (origAppendCallback) origAppendCallback.apply(this, arguments);
                        if (node.properties["auto_reload_on_change"]) {
                            reloadConnectedNode(node);
                        }
                    };
                }

                // --- PROPERTY CHANGE LISTENER ---
                const onPropertyChanged = node.onPropertyChanged;
                node.onPropertyChanged = function (name, value) {
                    if (onPropertyChanged) {
                        onPropertyChanged.apply(this, arguments);
                    }

                    if (name === "show_reload_button") {
                        if (value === true) {
                            addReloadButton(node);
                        } else {
                            removeReloadButton(node);
                        }
                        node.setDirtyCanvas(true, true);
                    }
                };

                // --- SETTINGS GEAR IMPLEMENTATION ---
                const onDrawForeground = node.onDrawForeground;
                node.onDrawForeground = function (ctx) {
                    if (onDrawForeground) onDrawForeground.apply(this, arguments);

                    if (this.flags.collapsed) return;

                    ctx.save();

                    // Position: Right side of the title bar
                    // Title bar height is typically 30px. Center vertically at -15.
                    const x = this.size[0] - 20;
                    const y = -15;

                    ctx.font = "16px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText("⚙️", x, y);

                    ctx.restore();
                };

                const onMouseDown = node.onMouseDown;
                node.onMouseDown = function (e, pos, canvas) {
                    if (e.button === 0) { // Left click
                        const x = this.size[0] - 20;
                        const y = -15;

                        const clickX = pos[0];
                        const clickY = pos[1];

                        // Hit test (approx 20x20 box around the center)
                        const dist = Math.sqrt(Math.pow(clickX - x, 2) + Math.pow(clickY - y, 2));

                        if (dist < 12) { // Radius of hit area
                            showSettingsMenu(this, e);
                            return true; // Consume event
                        }
                    }
                    if (onMouseDown) return onMouseDown.apply(this, arguments);
                };

                function showSettingsMenu(node, e) {
                    const options = [
                        {
                            content: (node.properties["show_reload_button"] ? "✔ " : "  ") + "Show Reload Button",
                            callback: () => {
                                node.properties["show_reload_button"] = !node.properties["show_reload_button"];
                                node.onPropertyChanged("show_reload_button", node.properties["show_reload_button"]);
                            }
                        },
                        {
                            content: (node.properties["auto_reload_on_change"] ? "✔ " : "  ") + "Auto-Reload on Change",
                            callback: () => {
                                node.properties["auto_reload_on_change"] = !node.properties["auto_reload_on_change"];
                                node.onPropertyChanged("auto_reload_on_change", node.properties["auto_reload_on_change"]);
                            }
                        },
                        {
                            content: "Append Extension",
                            has_submenu: true,
                            callback: () => { }, // Submenu handles click
                            submenu: {
                                options: [
                                    ...appendOptions.map(opt => ({
                                        content: opt,
                                        callback: () => {
                                            const appendWidget = node.widgets.find(w => w.name === "append");
                                            if (appendWidget) {
                                                appendWidget.value = opt;
                                                // Trigger callback manually if needed, though append usually doesn't trigger reload
                                                if (appendWidget.callback) {
                                                    appendWidget.callback(appendWidget.value);
                                                }
                                                node.setDirtyCanvas(true, true);
                                            }
                                        }
                                    })),
                                    { content: null }, // Separator
                                    { content: "(append_options.txt to add/remove)", disabled: true }
                                ]
                            }
                        }
                    ];

                    new LiteGraph.ContextMenu(options, { event: e, parentMenu: null, node: node });
                }

                // --- SIZE CALCULATION ---
                const originalComputeSize = this.computeSize;
                this.computeSize = function (size) {
                    const newSize = originalComputeSize ? originalComputeSize.apply(this, arguments) : [0, 0];

                    // Calculate minimum required height based on widgets
                    let requiredHeight = 0;
                    if (this.widgets) {
                        for (const w of this.widgets) {
                            // Use a safe default if computeSize is missing
                            const wHeight = w.computeSize ? w.computeSize(newSize)[1] : 20;
                            requiredHeight += wHeight + 4; // Add spacing
                        }
                    }

                    // Add padding for header/footer
                    requiredHeight += 30;

                    // Respect current size if it's larger than required (prevent shrinking)
                    // But ensure it's at least the required height
                    newSize[1] = Math.max(newSize[1], requiredHeight);

                    // Also respect the input size if it's larger (user manual resize)
                    if (size && size[1] > newSize[1]) {
                        newSize[1] = size[1];
                    }

                    return newSize;
                }
            };
        }
    },
});
