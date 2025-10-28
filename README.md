[![LinkTree Badge](https://img.shields.io/badge/linktree-39E09B?style=for-the-badge&logo=linktree&logoColor=white)](https://linktr.ee/goddessofai) <sup>**(18+)**</sup>

# ComfyUI-GoddessLabs-NodePack

**Custom node pack for ComfyUI**
This node pack helps to conveniently enhance images through Detector, Detailer, Upscaler, Pipe, and more.

## NOTICE 
* V0.01: Working Prototype


## How To Install

### **Manual**
* Navigate to `ComfyUI/custom_nodes` in your terminal (cmd).
* Clone the repository under the `custom_nodes` directory using the following command:
  ```
  git clone https://github.com/GoddessLabs/ComfyUI-GoddessLabs-NodePack
  cd comfyui-impact-pack
  ```
* Install dependencies in your Python environment.
    * For Windows Portable, run the following command inside `ComfyUI\custom_nodes\comfyui-impact-pack`:
        ```
        ..\..\..\python_embeded\python.exe -m pip install -r requirements.txt
        ```
    * If using venv or conda, activate your Python environment first, then run:
        ```
        pip install -r requirements.txt

## Custom Nodes
### [Detector nodes](https://github.com/ltdrdata/ComfyUI-extension-tutorials/blob/Main/ComfyUI-Impact-Pack/tutorial/detectors.md)
  * `SAMLoader (Impact)` - Loads the SAM model.

