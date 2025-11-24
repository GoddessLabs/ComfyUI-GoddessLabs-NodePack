// File: ComfyUI-GoddessLabs-NodePack/js/save_state.js

import { app } from "/scripts/app.js";

/**
 * Custom Widget: Save/Load Split Button
 * Draws a single button ("Save") or a split button ("Load" | "Save") depending on state.
 */
function createSaveLoadWidget(node, name, slotIndex, data, callbacks) {
    const widget = {
        type: "custom",
        name: name,
        value: data,
        options: { serialize: false },
        draw: function (ctx, node, widget_width, y, widget_height) {
            const margin = 10;
            const buttonHeight = widget_height - margin;
            const savedData = node.properties.saved_states[slotIndex];

            ctx.save();
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            if (!savedData) {
                // STATE 1: No Save - Full Width "Save" Button
                ctx.fillStyle = "#222";
                ctx.fillRect(margin, y, widget_width - margin * 2, buttonHeight);
                ctx.strokeStyle = "#555";
                ctx.strokeRect(margin, y, widget_width - margin * 2, buttonHeight);

                ctx.fillStyle = "#ccc";
                ctx.fillText(`Save State ${slotIndex + 1}`, widget_width / 2, y + buttonHeight / 2);
            } else {
                // STATE 2: Saved - Split Row (Load | Save)
                const midX = widget_width / 2;

                // Left Button (Load)
                ctx.fillStyle = "#2a4"; // Greenish for Load
                ctx.fillRect(margin, y, midX - margin - 2, buttonHeight);
                ctx.fillStyle = "#000";
                ctx.fillText(`Load ${slotIndex + 1}`, (margin + midX) / 2, y + buttonHeight / 2);

                // Right Button (Overwrite/Save)
                ctx.fillStyle = "#222";
                ctx.fillRect(midX + 2, y, midX - margin - 2, buttonHeight);
                ctx.strokeStyle = "#555";
                ctx.strokeRect(midX + 2, y, midX - margin - 2, buttonHeight);

                ctx.fillStyle = "#888";
                ctx.fillText("💾", (midX + widget_width - margin) / 2, y + buttonHeight / 2);
            }

            ctx.restore();
        },
        mouse: function (event, pos, node) {
            // Helper to check click bounds
            const widgetWidth = node.size[0];
            const margin = 10;
            const midX = widgetWidth / 2;
            const savedData = node.properties.saved_states[slotIndex];

            if (event.type === "mousedown") {
                if (!savedData) {
                    // Full width click -> Save
                    if (pos[0] > margin && pos[0] < widgetWidth - margin) {
                        callbacks.onSave(slotIndex);
                    }
                } else {
                    // Split width click
                    if (pos[0] > margin && pos[0] < midX - 2) {
                        // Left -> Load
                        callbacks.onLoad(slotIndex);
                    } else if (pos[0] > midX + 2 && pos[0] < widgetWidth - margin) {
                        // Right -> Save (Overwrite)
                        callbacks.onSave(slotIndex);
                    }
                }
            }
            return true;
        },
        computeSize: function (width) {
            return [width, 30]; // Standard height
        }
    };
    return widget;
}

/**
 * Logic to capture the downstream node's state
 */
function getTargetNode(sourceNode) {
    const graph = app.graph;
    const output = sourceNode.outputs[0];
    if (!output || !output.links || output.links.length === 0) return null;

    // Just grab the first connection for now
    const linkId = output.links[0];
    const link = graph.links[linkId];
    if (!link) return null;

    return graph.getNodeById(link.target_id);
}

function saveState(node, slotIndex) {
    const target = getTargetNode(node);
    if (!target) {
        alert("[GoddessLabs] No downstream node connected to save!");
        return;
    }

    const state = {
        title: target.title,
        widgets: {}
    };

    if (target.widgets) {
        for (const w of target.widgets) {
            state.widgets[w.name] = w.value;
        }
    }

    // Initialize array if needed
    if (!node.properties.saved_states) node.properties.saved_states = [];

    node.properties.saved_states[slotIndex] = state;
    refreshWidgets(node);
}

function loadState(node, slotIndex) {
    const state = node.properties.saved_states[slotIndex];
    if (!state) return;

    const target = getTargetNode(node);
    if (!target) {
        alert("[GoddessLabs] No downstream node found to load state into!");
        return;
    }

    // Optional: Check if node type matches? For now, we assume user knows what they are doing.

    if (target.widgets) {
        let changed = false;
        for (const w of target.widgets) {
            if (state.widgets.hasOwnProperty(w.name)) {
                if (w.value !== state.widgets[w.name]) {
                    w.value = state.widgets[w.name];
                    if (w.callback) {
                        w.callback(w.value);
                    }
                    changed = true;
                }
            }
        }
        if (changed) {
            target.setDirtyCanvas(true, true);
            app.graph.setDirtyCanvas(true, true);
        }
    }
}

/**
 * Rebuilds the widgets based on the number of slots
 */
function refreshWidgets(node) {
    // Clear existing widgets (except maybe input/output placeholders if any, but this node uses custom ones)
    node.widgets = [];

    const count = node.properties.slot_count || 1;

    for (let i = 0; i < count; i++) {
        const w = createSaveLoadWidget(node, `slot_${i}`, i, null, {
            onSave: (idx) => saveState(node, idx),
            onLoad: (idx) => loadState(node, idx)
        });
        node.widgets.push(w);
    }

    // Force resize
    node.setSize(node.computeSize());
    node.setDirtyCanvas(true, true);
}


app.registerExtension({
    name: "GoddessLabs.SaveState",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "GoddessLabsSaveState") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;

            nodeType.prototype.onNodeCreated = function () {
                if (onNodeCreated) onNodeCreated.apply(this, arguments);
                const node = this;

                // --- DEFAULTS ---
                if (!this.properties["slot_count"]) this.properties["slot_count"] = 1;
                if (!this.properties["saved_states"]) this.properties["saved_states"] = [];

                // --- STYLE ---
                setTimeout(() => {
                    if (!node.color) {
                        node.color = "#633CCA";
                        node.bgcolor = "#633CCA";
                    }
                }, 0);

                // --- INITIAL WIDGET BUILD ---
                refreshWidgets(node);

                // --- SETTINGS GEAR ---
                const onDrawForeground = node.onDrawForeground;
                node.onDrawForeground = function (ctx) {
                    if (onDrawForeground) onDrawForeground.apply(this, arguments);
                    if (this.flags.collapsed) return;

                    ctx.save();
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
                        const dist = Math.sqrt(Math.pow(clickX - x, 2) + Math.pow(clickY - y, 2));

                        if (dist < 12) {
                            showSettingsMenu(this, e);
                            return true;
                        }
                    }
                    if (onMouseDown) return onMouseDown.apply(this, arguments);
                };

                function showSettingsMenu(node, e) {
                    const options = [
                        {
                            content: "➕ Add Save Slot",
                            callback: () => {
                                node.properties["slot_count"]++;
                                refreshWidgets(node);
                            }
                        },
                        {
                            content: "➖ Remove Save Slot",
                            disabled: node.properties["slot_count"] <= 1,
                            callback: () => {
                                if (node.properties["slot_count"] > 1) {
                                    node.properties["slot_count"]--;
                                    // Optional: Clear data for the removed slot?
                                    // node.properties["saved_states"].pop(); 
                                    refreshWidgets(node);
                                }
                            }
                        },
                        { content: null }, // Separator
                        {
                            content: "❌ Clear All States",
                            callback: () => {
                                node.properties["saved_states"] = [];
                                refreshWidgets(node);
                            }
                        }
                    ];
                    new LiteGraph.ContextMenu(options, { event: e, parentMenu: null, node: node });
                }
            };

            // Ensure properties persist on load
            const onConfigure = nodeType.prototype.onConfigure;
            nodeType.prototype.onConfigure = function () {
                if (onConfigure) onConfigure.apply(this, arguments);
                refreshWidgets(this);
            };
        }
    }
});