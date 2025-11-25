# ❤️‍🔥💊 GoddessLabs NodePack v0.2.2-beta-release

---


A collection of custom utility nodes for ComfyUI, engineered for **workflow stability, optimization, and quality-of-life enhancements**.

---

## 🚀 Custom Nodes

*   [**❤️‍🔥📂 Folder Browser (Beta)**](https://github.com/GoddessLabs/ComfyUI-GoddessLabs-NodePack/blob/main/README.md#node-state-manager-alpha): Seamless, stable OS-native folder browser using `wxPython`.
*   [**❤️‍🔥💥 Destroy & Recreate (Beta)**](https://github.com/GoddessLabs/ComfyUI-GoddessLabs-NodePack/blob/main/README.md#node-state-manager-alpha): Destroys & recreates nodes clearing their cache.
*   [**❤️‍🔥💾 Node State Manager (Alpha)**](https://github.com/GoddessLabs/ComfyUI-GoddessLabs-NodePack/blob/main/README.md#node-state-manager-alpha): Saves the node's state, allowing it to be changed and reloaded.

---

## 📦 Installation

This node pack requires `wxPython` for the native folder dialog functionality.

### Simple Installation (Zip File) 🥇 (Recommended)

1.  Download the latest release ZIP file from the repository.
2.  Navigate to your ComfyUI `custom_nodes` directory.
3.  **Extract the contents of the ZIP file directly into the `custom_nodes` folder.**
4.  Ensure the resulting folder is named `ComfyUI-GoddessLabs-NodePack`.
5.  The necessary dependencies, including `wxPython`, will be automatically installed when ComfyUI starts, as configured in the `__init__.py` script.

### Automatic Installation (Git Clone)

1.  Navigate to your ComfyUI `custom_nodes` directory.
2.  Clone this repository:

    ```bash
    git clone [https://github.com/GoddessLabs/ComfyUI-GoddessLabs-NodePack.git](https://github.com/GoddessLabs/ComfyUI-GoddessLabs-NodePack.git)
    ```

3.  The necessary dependencies, including `wxPython`, will be automatically installed when ComfyUI starts, as configured in the `__init__.py` script.

### Manual Installation

If automatic installation fails, or for portable ComfyUI versions:

1.  Clone the repository as above (or download the zip).
2.  Install dependencies manually using your local Python executable:

    ```bash
    # For standard environments
    pip install -r requirements.txt

    # For portable versions (adjust path as needed)
    ..\..\..\python_embeded\python.exe -m pip install -r requirements.txt
    ```

---

## ✨ Custom Nodes

All nodes are located under the **GoddessLabs❤️‍🔥💊/Utility** category.

### **❤️‍🔥📂 Folder Browser (Beta)**

**Class Name**: `GoddessLabsFolderSelector`
**Display Name**: `❤️‍🔥📂 Folder Browser (Beta)`

A simple input node that provides an **OS-native file selection dialog** to select a directory.

| Feature | Description |
| :--- | :--- |
| **Native Dialog** | Opens a stable, non-blocking folder selection window using `wxPython`. |
| **Auto-Reload** | Automatically forces downstream nodes to re-execute when the folder path or append value changes (toggleable via the ⚙️ settings gear). |
| **Append Extensions** | Quick menu (in ⚙️ settings gear) to add common extensions like `/*.png` or `/*.mp4` to the path for file listing nodes. |

---

### **❤️‍🔥💥 Destroy & Recreate (Beta)**

**Class Name**: `GoddessLabsDestroyAndRecreate`
**Display Name**: `❤️‍🔥💥 Destroy & Recreate (Beta)`

A powerful **pass-through utility node** designed to deliberately **break the internal caching** of ComfyUI.

| Feature | Description |
| :--- | :--- |
| **Force Reload** | Manually click **"Reload Connected Node ⟳"** to destroy the downstream node and instantly recreate it, forcing a cache reset and re-execution on the next prompt run. |
| **Input-Driven Reload** | Automatically forces a reload event when the input data connected to the node changes. |
| **Pass-Through** | Passes any connected input directly to the output. |

---

### **❤️‍🔥💾 Node State Manager (Alpha)**

**Class Name**: `GoddessLabsNodeStateManager`
**Display Name**: `❤️‍🔥💾 Node State Manager (Alpha)`

A crucial quality-of-life node for **saving, loading, and comparing widget settings** within your workflow.

| Feature | Description |
| :--- | :--- |
| **Save State** | Connect the node's output to any node (e.g., Sampler, Checkpoint Loader). Click **"Save State"** (or the floppy disk 💾 icon) to capture the current values of the connected node's widgets. |
| **Load State** | Click **"Load State"** to instantly restore the captured widget values, allowing for fast A/B testing or configuration switching. |
| **Widget Support** | Works with most standard input types (e.g., numbers, strings, dropdowns). |



---

## ⚙️ Configuration

Customize the behavior of the **Folder Browser** node by editing the configuration files located in `nodes/utility/folder_browser/`.

### `config.txt`

Controls default settings for the node upon creation.

| Setting | Values | Description |
| :--- | :--- | :--- |
| `default_path` | (path string) | Set the starting folder for the native dialog. Leave empty to default to the ComfyUI `input` directory. |
| `auto_reload_on_change` | `true`, `false` | Enable or disable the feature that automatically reloads connected nodes when the path changes. |
| `show_reload_button` | `true`, `false` | Show or hide the explicit "Reload Connected Node" button. |

### `append_options.txt`

A simple text file where you can list file extensions (e.g., `*.png`, `*.webp`) that appear in the "Append Extension" submenu.


