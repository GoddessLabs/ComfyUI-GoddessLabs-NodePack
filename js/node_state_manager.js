import { app } from "/scripts/app.js";

app.registerExtension({
    name: "GoddessLabs.NodeStateManager",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "GoddessLabsNodeStateManager") {

            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                if (onNodeCreated) onNodeCreated.apply(this, arguments);
                const node = this;

                // --- VISUAL STYLING ---
                // Apply immediately to prevent lag
                if (!node.color) {
                    node.color = "#633CCA";   // Goddess Purple
                    node.bgcolor = "#633CCA";
                }
                node.shape = 1; // Box Shape
                node.size = [200, 70]; // Force initial size to prevent clipping

                let isRestoring = false;
                const origConfigure = node.configure;

                node.configure = function (data) {
                    isRestoring = true;
                    if (origConfigure) {
                        origConfigure.apply(this, arguments);
                    }
                };

                node.computeSize = function () {
                    return [200, 70]; // Min width 200, Min height 70 (Header + 20px Button + Padding)
                };

                // --- DRAWING (The View) ---
                const onDrawForeground = node.onDrawForeground;
                node.onDrawForeground = function (ctx) {
                    if (onDrawForeground) onDrawForeground.apply(this, arguments);
                    if (this.flags.collapsed) return;
                    if (app.canvas.ds.scale < 0.55) return; // Hide if zoomed out

                    // Define Button Area
                    const margin = 10;
                    const buttonHeight = 20; // Standard LiteGraph height
                    const y = 38; // Draw below the header (adjusted to match standard nodes)
                    const width = this.size[0] - (margin * 2);

                    ctx.save();
                    ctx.font = "14px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";

                    const hasState = !!node.properties.saved_state;
                    const flashBtn = node._flash_info ? node._flash_info.button : null;

                    if (!hasState) {
                        // --- STATE 1: NO SAVE (Full Width "Save") ---
                        const isFlashing = flashBtn === "save";

                        ctx.fillStyle = isFlashing ? "#666" : "#222";
                        ctx.fillRect(margin, y, width, buttonHeight);
                        ctx.strokeStyle = "#555";
                        ctx.strokeRect(margin, y, width, buttonHeight);

                        ctx.fillStyle = isFlashing ? "#fff" : "#ccc";
                        ctx.fillText("Save State", margin + width / 2, y + buttonHeight / 2);
                    } else {
                        // --- STATE 2: SAVED (Horizontal Split) ---
                        // [ Load State (70%) ] [ 💾 (30%) ]

                        const splitRatio = 0.75;
                        const loadWidth = width * splitRatio;
                        const saveWidth = width - loadWidth;

                        // 1. Load Button (Left) - Default Colors
                        const isLoadFlashing = flashBtn === "load";
                        ctx.fillStyle = isLoadFlashing ? "#555" : "#222"; // Default Dark Grey
                        ctx.fillRect(margin, y, loadWidth, buttonHeight);
                        ctx.strokeStyle = "#555";
                        ctx.strokeRect(margin, y, loadWidth, buttonHeight);

                        ctx.fillStyle = isLoadFlashing ? "#fff" : "#ccc";
                        ctx.fillText("Load State", margin + loadWidth / 2, y + buttonHeight / 2);

                        // 2. Save Button (Right)
                        const isSaveFlashing = flashBtn === "save";
                        ctx.fillStyle = isSaveFlashing ? "#555" : "#222"; // Default Dark Grey
                        ctx.fillRect(margin + loadWidth, y, saveWidth, buttonHeight);
                        ctx.strokeStyle = "#555";
                        ctx.strokeRect(margin + loadWidth, y, saveWidth, buttonHeight);

                        ctx.fillStyle = isSaveFlashing ? "#fff" : "#888";
                        ctx.fillText("💾", margin + loadWidth + saveWidth / 2, y + buttonHeight / 2);
                    }

                    ctx.restore();
                };

                // --- INTERACTION (The Controller) ---
                const onMouseDown = node.onMouseDown;
                node.onMouseDown = function (e, pos, canvas) {
                    if (e.button === 0) { // Left Click
                        // Check zoom level first
                        if (app.canvas.ds.scale < 0.55) return onMouseDown ? onMouseDown.apply(this, arguments) : undefined;

                        const x = pos[0];
                        const y = pos[1];

                        // Define Button Area (Must match onDrawForeground)
                        const margin = 10;
                        const buttonHeight = 20; // Adjusted to 20px
                        const buttonY = 38; // Match onDrawForeground
                        const width = this.size[0] - (margin * 2);

                        // 1. Check if click is within the vertical band of the buttons
                        if (y >= buttonY && y <= buttonY + buttonHeight) {
                            const hasState = !!node.properties.saved_state;

                            if (!hasState) {
                                // Full Width Save Button
                                if (x >= margin && x <= margin + width) {
                                    triggerFlash(node, "save");
                                    doSave(node);
                                    return true; // Consume event
                                }
                            } else {
                                // Split Buttons
                                const splitRatio = 0.75;
                                const loadWidth = width * splitRatio;

                                // Check Load (Left)
                                if (x >= margin && x <= margin + loadWidth) {
                                    triggerFlash(node, "load");
                                    doLoad(node);
                                    return true;
                                }
                                // Check Save (Right)
                                if (x > margin + loadWidth && x <= margin + width) {
                                    triggerFlash(node, "save");
                                    doSave(node);
                                    return true;
                                }
                            }
                        }
                    }

                    // Pass to original handler
                    if (onMouseDown) return onMouseDown.apply(this, arguments);
                };

                // --- HELPERS ---

                function triggerFlash(node, buttonName) {
                    node._flash_info = { button: buttonName, startTime: Date.now() };
                    node.setDirtyCanvas(true, true);

                    setTimeout(() => {
                        node._flash_info = { button: null, startTime: 0 };
                        node.setDirtyCanvas(true, true);
                    }, 100); // 100ms flash
                }

                function doSave(node) {
                    const graph = app.graph;
                    const output = node.outputs[0];
                    if (!output || !output.links || output.links.length === 0) {
                        alert("Connect a node to the output first!");
                        return;
                    }

                    const link = graph.links[output.links[0]];
                    const targetNode = graph.getNodeById(link.target_id);
                    if (!targetNode) return;

                    const state = { widgets: {} };
                    if (targetNode.widgets) {
                        for (const w of targetNode.widgets) {
                            state.widgets[w.name] = w.value;
                        }
                    }
                    node.properties.saved_state = state;
                    node.setDirtyCanvas(true, true); // Force Redraw
                }

                function doLoad(node) {
                    const graph = app.graph;
                    const state = node.properties.saved_state;
                    if (!state) return;

                    const output = node.outputs[0];
                    if (!output || !output.links || output.links.length === 0) return;

                    const link = graph.links[output.links[0]];
                    const targetNode = graph.getNodeById(link.target_id);
                    if (!targetNode) return;

                    if (targetNode.widgets && state.widgets) {
                        for (const w of targetNode.widgets) {
                            if (state.widgets[w.name] !== undefined) {
                                w.value = state.widgets[w.name];
                                if (w.callback && w.type !== "button") {
                                    w.callback(w.value, graph.canvas, targetNode, targetNode.pos, null);
                                }
                            }
                        }
                        targetNode.setDirtyCanvas(true, true);
                    }
                }

            };
        }
    }
});