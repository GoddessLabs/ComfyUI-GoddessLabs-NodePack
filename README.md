[![LinkTree Badge](https://img.shields.io/badge/linktree-39E09B?style=for-the-badge&logo=linktree&logoColor=white)](https://linktr.ee/goddessofai) <sup>**(18+)**</sup>

# ComfyUI-GoddessLabs-NodePack

**Custom node pack for ComfyUI**
This node pack helps to conveniently enhance images through Detector, Detailer, Upscaler, Pipe, and more.

NOTE: The UltralyticsDetectorProvider node is not part of the ComfyUI-Impact-Pack. To use the UltralyticsDetectorProvider node, please install the ComfyUI-Impact-Subpack separately.

## NOTICE 
* V8.24: This compatibility patch requires ComfyUI version 0.3.63 or higher due to structural changes in DifferentialDiffusion.
* V8.19: legacy nodes (mmdet and etc.) are removed



## How To Install

### **Recommended**
* Install via [ComfyUI-Manager](https://github.com/ltdrdata/ComfyUI-Manager).

### **Manual**
* Navigate to `ComfyUI/custom_nodes` in your terminal (cmd).
* Clone the repository under the `custom_nodes` directory using the following command:
  ```
  git clone https://github.com/ltdrdata/ComfyUI-Impact-Pack comfyui-impact-pack
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
  * `ONNXDetectorProvider` - Loads the ONNX model to provide BBOX_DETECTOR.
  * `CLIPSegDetectorProvider` - Wrapper for CLIPSeg to provide BBOX_DETECTOR.
    * You need to install the ComfyUI-CLIPSeg node extension.
  * `SEGM Detector (combined)` - Detects segmentation and returns a mask from the input image.
  * `BBOX Detector (combined)` - Detects bounding boxes and returns a mask from the input image.
  * `SAMDetector (combined)` - Utilizes the SAM technology to extract the segment at the location indicated by the input SEGS on the input image and outputs it as a unified mask.
  * `SAMDetector (Segmented)` - It is similar to `SAMDetector (combined)`, but it separates and outputs the detected segments. Multiple segments can be found for the same detected area, and currently, a policy is in place to group them arbitrarily in sets of three. This aspect is expected to be improved in the future.
    * As a result, it outputs the `combined_mask`, which is a unified mask, and `batch_masks`, which are multiple masks grouped together in batch form.
    * While `batch_masks` may not be completely separated, it provides functionality to perform some level of segmentation.
  * `Simple Detector (SEGS)` - Operating primarily with `BBOX_DETECTOR`, and with the additional provision of `SAM_MODEL` or `SEGM_DETECTOR`, this node internally generates improved SEGS through mask operations on both *bbox* and *silhouette*. It serves as a convenient tool to simplify a somewhat intricate workflow.
  * `Simple Detector for Video (SEGS)` – Performs detection on videos composed of image frames. Instead of using a single mask, it performs detection individually on each image frame and generates a SEGS object with a batch of masks. 
  * `SAM2 Video Detector (SEGS)` – Similar to `Simple Detector for Video (SEGS)`, but utilizes SAM2’s video tracking technology to generate a SEGS object with a batch of masks. 
      * To use this node, you must select a SAM2 model in the SAMLoader.


Trung0246/[ComfyUI-0246](https://github.com/Trung0246/ComfyUI-0246) - Nice bypass hack!

Layer-norm/[comfyui-lama-remover](https://github.com/Layer-norm/comfyui-lama-remover) - Required for using `LamaRemoverDetailerHook`.
