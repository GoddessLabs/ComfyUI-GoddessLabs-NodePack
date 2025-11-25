# AI Ideas

This document serves as a repository for high-quality, niche, and QOL node ideas for the GoddessLabs NodePack. These ideas focus on utility, stability, and enhancing the user experience without unnecessary complexity.

## Utility Nodes



### 2. Batch Image Previewer
*   **Concept**: A node that points to a folder and allows cycling through images with a "Previous/Next" button and a preview window.
*   **Why**: Loading specific images from a large dataset for img2img or controlnet often requires an external viewer. This brings it in-graph.
*   **Features**:
    *   Folder selection (reuse Folder Browser logic).
    *   Index slider/buttons.
    *   Output: IMAGE, MASK, FILE_PATH.



## Workflow Organization

### 4.1. Seamless Markdown Label/Note
*   **Concept**: A node that renders Markdown text directly on the canvas without a visible node frame, title, or ports, akin to `rgthree`'s Label node.
*   **Why**: Provides rich, unobtrusive annotation directly within the workflow canvas, improving readability and documentation for complex graphs without the visual clutter of traditional node UI. Ideal for sectioning off parts of a workflow, adding concise instructions, or linking to external resources using Markdown.
*   **Features**:
    *   Renders Markdown (headers, lists, links, etc.).
    *   No visible node UI (border, title, ports).
    *   Text content editable directly on the canvas or via a small configuration panel.

### 5. Generic Timer
*   **Concept**: A versatile timer node that can measure durations between arbitrary events within the workflow. It can be triggered by specific nodes to start or stop, or configured to run automatically.
*   **Why**: Provides flexible timing capabilities for benchmarking, performance analysis, or simply tracking durations of specific workflow segments. This is crucial for optimizing complex graphs, comparing different model configurations, or understanding the time impact of various processing steps.
*   **Features**:
    *   **Triggering**: Input/Output ports that can be linked to other nodes to start and stop the timer.
    *   **Event Naming**: A string input to define a unique timer ID or event name, allowing multiple timers to run concurrently and report distinct measurements.
    *   **Auto-Start**: A boolean property to automatically start the timer at the beginning of the workflow execution.
    *   **Auto-Stop**: If only one timer is active and not explicitly stopped, it will automatically record its duration at the end of the workflow run.
    *   **Output**: Logs the measured duration (e.g., in seconds or milliseconds) to the console, associated with its event name.

## Developer Tools

### 6. JSON/Dict Inspector
*   **Concept**: A node that takes any input and attempts to pretty-print its internal structure (attributes, dictionary keys) to the console or a text output.
*   **Why**: Debugging custom nodes or unknown data types passed between nodes.
