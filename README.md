[![LinkTree Badge](https://img.shields.io/badge/linktree-39E09B?style=for-the-badge&logo=linktree&logoColor=white)](https://linktr.ee/goddessofai) <sup>**(18+)**</sup>

# ComfyUI-GoddessLabs-NodePack

**Custom node pack for ComfyUI**
This node pack helps to conveniently enhance images through Detector, Detailer, Upscaler, Pipe, and more.

## NOTICE 
* V0.02: Working Prototype
* **IMPORTANT:** The `Folder Selector` node uses native Windows dialogs. It will **only work** if you are running ComfyUI on a local Windows machine. It will not work on Colab, RunPod, or Linux servers.

## How To Install

### **Manual**
* Navigate to `ComfyUI/custom_nodes` in your terminal (cmd).
* Clone the repository under the `custom_nodes` directory using the following command: git clone https://github.com/GoddessLabs/ComfyUI-GoddessLabs-NodePack

* Install dependencies in your Python environment.
  * For Windows Portable, run the following command inside `ComfyUI\custom_nodes\ComfyUI-GoddessLabs-NodePack`:
      ```
      ..\..\..\python_embeded\python.exe -m pip install -r requirements.txt
      ```

## Custom Nodes
### Utility
* **GoddessLabs Folder Selector**: A helper node that opens a native Windows folder picker to easily select paths for batch processing or saving.