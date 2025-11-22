- **Fixed Title Loss:** Connected nodes now retain their titles when the "Reload connections" feature is used.
- **Fixed Settings Persistence:** The `show_reload_button` setting now correctly persists across restarts.

**Technical Changes:**
- **wxPython Lifecycle:** Improved the management of the `wx.App` lifecycle to prevent crashes and ensure stability.
- **Hidden Parent Frame:** Implemented a hidden parent frame for the `wx.DirDialog` to ensure it always appears on top of other windows.

## V0.0.51
- Initial Release of the Folder Browser Node.
- Basic folder selection functionality.
- "Reload Connected Node" button.
