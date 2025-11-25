import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";



/**
 * Finds the node connected to the output, destroys it,
 * and creates a fresh clone with the same settings/connections.
 * Implements "Ghost" connections to prevent visual flickering.
 */
function reloadConnectedNode(sourceNode) {
    const graph = app.graph;
    const output = sourceNode.outputs[0];
    if (!output || !output.links || output.links.length === 0) {
        // alert("[GoddessLabs] No node connected to output!");
        return;
    }

    const linkIds = [...output.links];
    let reloadedCount = 0;

    linkIds.forEach(linkId => {
        const link = graph.links[linkId];
        if (!link) return;

        const oldNode = graph.getNodeById(link.target_id);
        if (!oldNode) return;

        // 1. Create the new node
        const newNode = LiteGraph.createNode(oldNode.type);
        newNode.pos = [oldNode.pos[0], oldNode.pos[1]];
        newNode.size = [...oldNode.size];

        // 2. Copy properties
        if (oldNode.properties) newNode.properties = JSON.parse(JSON.stringify(oldNode.properties));
        if (oldNode.color) newNode.color = oldNode.color;
        if (oldNode.bgcolor) newNode.bgcolor = oldNode.bgcolor;
        if (oldNode.title) newNode.title = oldNode.title;

        // 3. Add new node to graph (Ghost phase: both nodes exist)
        graph.add(newNode);

        // 4. Copy widgets
        if (oldNode.widgets && newNode.widgets) {
            for (let i = 0; i < oldNode.widgets.length; i++) {
                const sourceWidget = oldNode.widgets[i];
                const destWidget = newNode.widgets.find(w => w.name === sourceWidget.name);
                if (destWidget) {
                    destWidget.value = sourceWidget.value;
                }
            }
        }

        // 5. Reconnect Inputs (Ghost connections)
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

        // 6. Reconnect Outputs (Ghost connections)
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

        // 7. Remove old node (Ghost phase ends)
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
    name: "GoddessLabs.DestroyAndRecreate",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "GoddessLabsDestroyAndRecreate") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;

            nodeType.prototype.onNodeCreated = function () {
                onNodeCreated?.apply(this, arguments);
                const node = this;

                // Default size
                node.size = [200, 60];

                // --- VISUAL STYLING ---
                // --- VISUAL STYLING ---
                // Apply immediately to prevent lag
                if (!node.color) {
                    node.color = "#633CCA";   // Goddess Purple
                    node.bgcolor = "#633CCA";
                }
                node.shape = 1; // Box Shape

                // --- DEFAULT PROPERTIES ---
                if (this.properties["show_reload_button"] === undefined) this.properties["show_reload_button"] = true;
                if (this.properties["reload_on_input_change"] === undefined) this.properties["reload_on_input_change"] = true;
                if (this.properties["show_input"] === undefined) this.properties["show_input"] = true;

                // --- INITIAL SETUP ---
                setTimeout(() => {
                    // Button Visibility
                    if (this.properties["show_reload_button"]) {
                        addReloadButton(this);
                    } else {
                        removeReloadButton(this);
                    }

                    // Input Visibility
                    if (!this.properties["show_input"]) {
                        if (this.inputs && this.inputs.length > 0) {
                            this.removeInput(0);
                        }
                    } else {
                        if (!this.inputs || this.inputs.length === 0) {
                            this.addInput("any", "*");
                        }
                    }
                }, 50);

                // --- PROPERTY CHANGE LISTENER ---
                const onPropertyChanged = node.onPropertyChanged;
                node.onPropertyChanged = function (name, value) {
                    if (onPropertyChanged) onPropertyChanged.apply(this, arguments);

                    if (name === "show_reload_button") {
                        if (value === true) addReloadButton(node);
                        else removeReloadButton(node);
                    }

                    if (name === "show_input") {
                        if (value === true) {
                            if (!node.inputs || node.inputs.length === 0) node.addInput("any", "*");
                        } else {
                            if (node.inputs && node.inputs.length > 0) node.removeInput(0);
                        }
                        node.setDirtyCanvas(true, true);
                    }
                };

                // --- SETTINGS GEAR IMPLEMENTATION ---
                const onDrawForeground = node.onDrawForeground;
                node.onDrawForeground = function (ctx) {
                    if (onDrawForeground) onDrawForeground.apply(this, arguments);

                    if (this.flags.collapsed) return;
                    if (app.canvas.ds.scale < 0.55) return; // Hide if zoomed out

                    ctx.save();

                    // Position: Right side of the title bar
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
                        // Check zoom level first
                        if (app.canvas.ds.scale < 0.55) return onMouseDown ? onMouseDown.apply(this, arguments) : undefined;

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
                            content: (node.properties["reload_on_input_change"] ? "✔ " : "  ") + "Reload on Input Change",
                            callback: () => {
                                node.properties["reload_on_input_change"] = !node.properties["reload_on_input_change"];
                                node.onPropertyChanged("reload_on_input_change", node.properties["reload_on_input_change"]);
                            }
                        },
                        {
                            content: (node.properties["show_input"] ? "✔ " : "  ") + "Show Input",
                            callback: () => {
                                node.properties["show_input"] = !node.properties["show_input"];
                                node.onPropertyChanged("show_input", node.properties["show_input"]);
                            }
                        }
                    ];

                    new LiteGraph.ContextMenu(options, { event: e, parentMenu: null, node: node });
                }

                // --- CONNECTION CHANGE LISTENER ---
                const onConnectionsChange = node.onConnectionsChange;
                node.onConnectionsChange = function (type, index, connected, link_info, slot) {
                    if (onConnectionsChange) onConnectionsChange.apply(this, arguments);

                    // Input Connection (type === 1) on Slot 0
                    if (type === 1 && index === 0) {
                        if (connected) {
                            // Connected: Update output type to match source
                            // Fix: link_info can be null during initial load
                            if (link_info && app.graph.links[link_info.id]) {
                                const link = app.graph.links[link_info.id];
                                const originNode = app.graph.getNodeById(link.origin_id);
                                if (originNode && originNode.outputs && originNode.outputs[link.origin_slot]) {
                                    const originType = originNode.outputs[link.origin_slot].type;
                                    node.outputs[0].type = originType;
                                    node.outputs[0].name = originType; // Optional: Update label
                                }
                            }
                        } else {
                            // Disconnected: Revert to wildcard
                            node.outputs[0].type = "*";
                            node.outputs[0].name = "any";
                        }
                    }

                    // Reload Logic (Only on new connection + toggle enabled)
                    if (type === 1 && connected && index === 0 && this.properties["reload_on_input_change"]) {
                        setTimeout(() => {
                            reloadConnectedNode(node);
                        }, 10);
                    }
                };

                // --- EVENT LISTENER FOR INPUT-DRIVEN RELOAD ---
                api.addEventListener("goddesslabs.reload_node", (event) => {
                    if (node.properties["reload_on_input_change"] && event.detail && event.detail.node_id === node.id.toString()) {
                        reloadConnectedNode(node);
                    }
                });
            };
        }
    },
});
