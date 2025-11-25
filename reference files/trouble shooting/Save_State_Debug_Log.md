# Save State Node - Widget Troubleshooting Log

**Date**: 2025-11-22
**Issue**: The "Save State" node button became non-functional ("broke") after attempting to implement a custom split-button widget.

## Symptoms
- The button may not appear, or clicks are not registered.
- The expected split-view (Load | Save) is not functioning as intended.

## Technical Analysis
The likely cause is the method used to add the custom widget.
- **Code Used**: `node.addCustomWidget(customWidget)`
- **Potential Issue**: `addCustomWidget` may not be a standard method in the version of LiteGraph being used, or it behaves differently than expected.
- **Standard Approach**: Custom widgets are typically added by directly pushing to the `node.widgets` array or using `node.addWidget` with specific parameters.

## Event Handling
- Custom widgets require manual event handling because LiteGraph's default `onMouseDown` only handles standard widget types efficiently.
- The implemented `onMouseDown` override attempts to delegate clicks to `widget.mouse()`, but if the widget wasn't correctly added to the `node.widgets` array, this loop will fail or find nothing.

## Resolution Plan (Attempt 1 - Failed)
1.  **Correct Widget Registration**: Use the standard `node.widgets.push()` method instead of the non-existent `addCustomWidget`.
2.  **Dynamic Hit Testing**: Implement a robust `isWithinBounds(x, y)` check within the widget's `mouse` method that calculates positions dynamically relative to the node, removing reliance on potentially stale `last_y` values.
3.  **Event Delegation Mixin**: Create a reusable `enableCustomWidgetEvents(node)` helper that properly wraps `onMouseDown` to delegate events to *any* custom widget, ensuring scalability and stability across the node pack.

**Result**: The above attempt failed. The custom widget approach with manual event delegation is proving brittle in this environment.

## Resolution Plan (Attempt 3 - Horizontal Split)
1.  **Single Custom Widget**: Create one widget that draws two buttons side-by-side ("Stacked Horizontally").
2.  **Direct Event Handling**: Override `node.onMouseDown` to explicitly call the widget's `mouse` method, avoiding generic mixins that might fail.
3.  **Visual Feedback**: Ensure clear visual distinction between "Load" (Green) and "Save" (Grey/Icon).
4.  **Console Logging**: Add `console.log` for debugging click events.
