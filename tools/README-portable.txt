HTML Slide Editor Portable

Recommended launch:
1. Extract the portable zip.
2. Double-click Start-Editor.ps1, or right-click and choose Run with PowerShell.
3. The browser opens http://127.0.0.1:5173/.
4. Drag and drop an .html or .htm slide deck into the editor.
5. Edit the slide.
6. Use Save or Export.

Save behavior:
- If a file is opened with the Open button in a Chromium browser, Save can update
  the selected file directly.
- If a file is loaded by drag and drop, Save downloads the edited HTML.
- Export always downloads the edited HTML.

Fallback:
- You can open index.html directly, but browser security rules can restrict
  sample loading and direct file save behavior. The Start-Editor.ps1 launcher is
  the supported portable workflow.
