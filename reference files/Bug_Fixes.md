# Common Bug Fixes & Pitfalls

## API Route Registration & URL Prefixes

### The Issue (404 Not Found / URL Mismatch)
* **Frontend:** The ComfyUI JavaScript helper `api.fetchApi("/my-route")` automatically prepends `/api` to the request URL (resulting in `/api/my-route`).
* **Backend:** If you register the route in Python as just `/my-route`, the server won't match the incoming request, causing a 404 error.

### The Fix
* **Explicit Prefix:** Always register your Python backend routes starting with `/api/` (e.g., `/api/goddesslabs/select-folder`) to match the standard ComfyUI frontend behavior.
