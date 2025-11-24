# Best Practices: Custom Node Buttons (The "Gear Icon" Pattern)

When creating custom interactive elements (buttons, icons, toggles) on a LiteGraph node, the standard `addWidget` approach can sometimes be brittle or restrictive.

The most robust and flexible method—used for the "Settings Gear" ⚙️—is **Direct Canvas Drawing & Hit Testing**.

## The Pattern

Instead of creating a "widget" object, you:
1.  **Draw** the element directly onto the node's canvas using `onDrawForeground`.
2.  **Detect** clicks manually using `onMouseDown` and coordinate math.

### Advantages
- **Total Control**: You are not limited by the widget layout system. You can place buttons in the title bar, margins, or overlay them.
- **Stability**: Avoids issues where custom widgets fail to register events or render incorrectly due to LiteGraph version differences.
- **Performance**: Lightweight; no heavy object overhead for simple icons.

---

## Implementation Guide

### 1. Drawing the Button (`onDrawForeground`)

Use the HTML5 Canvas API to draw your text, icon, or shape.

```javascript
const onDrawForeground = node.onDrawForeground;
node.onDrawForeground = function (ctx) {
    if (onDrawForeground) onDrawForeground.apply(this, arguments);
    if (this.flags.collapsed) return; // Don't draw if collapsed

    ctx.save();
    
    // Define Position (e.g., Top-Right Corner)
    const x = this.size[0] - 20; 
    const y = -15; // Negative Y puts it in the title bar area

    // Draw Logic
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff"; // Text color
    ctx.fillText("⚙️", x, y);

    ctx.restore();
};
```

### 2. Handling Clicks (`onMouseDown`)

Override the mouse handler to check if the click coordinates fall within your button's area.

```javascript
const onMouseDown = node.onMouseDown;
node.onMouseDown = function (e, pos, canvas) {
    // pos[0] = x coordinate relative to node
    // pos[1] = y coordinate relative to node
    
    if (e.button === 0) { // Left Click
        const x = this.size[0] - 20; // Same X as drawn
        const y = -15;               // Same Y as drawn
        
        const clickX = pos[0];
        const clickY = pos[1];

        // Circular Hit Test (Good for icons)
        const dist = Math.sqrt(Math.pow(clickX - x, 2) + Math.pow(clickY - y, 2));
        
        // Rectangular Hit Test (Good for buttons)
        // if (clickX > x && clickX < x + width && clickY > y && clickY < y + height) ...

        if (dist < 12) { // 12px Radius
            // ACTION GOES HERE
            console.log("Gear Icon Clicked!");
            
            // Optional: Trigger a menu or function
            showSettingsMenu(this, e);
            
            return true; // STOP propagation (consume event)
        }
    }
    
    // Pass through to original handler if not clicked
    if (onMouseDown) return onMouseDown.apply(this, arguments);
};
```

## Summary Checklist
- [ ] **Draw**: Use `ctx.fillText` or `ctx.fillRect` in `onDrawForeground`.
- [ ] **Position**: Use `this.size[0]` for dynamic right-alignment.
- [ ] **Hit Test**: Calculate distance or bounds in `onMouseDown`.
- [ ] **Return True**: Always `return true` if you handled the click to prevent other widgets from reacting.
