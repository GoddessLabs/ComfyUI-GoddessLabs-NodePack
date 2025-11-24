### 1. "Destroy & Recreate" Node
*   **Concept**: A pass-through node (Any Input -> Any Output) with a button to force-reload the upstream chain.
*   **Why**: ComfyUI caches heavily. Sometimes you need to force a node to re-execute (e.g., a seed change didn't propagate, or an external file changed).
*   **Mechanism**: Uses the same "graph topology change" trick as the Folder Browser's auto-reload to force the execution engine to treat it as a new path.
