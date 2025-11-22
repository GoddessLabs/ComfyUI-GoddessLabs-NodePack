# Common Bug Fixes & Pitfalls

## API Route Registration & URL Prefixes

### The Issue (404 Not Found / URL Mismatch)
* **Frontend:** The ComfyUI JavaScript helper `api.fetchApi("/my-route")` automatically prepends `/api` to the request URL (resulting in `/api/my-route`).
* **Backend:** If you register the route in Python as just `/my-route`, the server won't match the incoming request, causing a 404 error.

### The Fix
* **Explicit Prefix:** Always register your Python backend routes starting with `/api/` (e.g., `/api/goddesslabs/select-folder`) to match the standard ComfyUI frontend behavior.


## 4. Debugging & Error Handling
**The Issue:** A syntax error in one node file can silently fail or crash the entire loading process in `__init__.py`.
**The Fix:**
* **Traceback:** Import `traceback` in `__init__.py` and print the full stack trace in the `except` block.
* **Isolation:** Use a loop to import nodes individually so that one broken node does not prevent others from loading.