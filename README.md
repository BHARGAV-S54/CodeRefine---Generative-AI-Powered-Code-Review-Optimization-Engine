# AI Code Review & Rewrite Agent - Local Setup Guide

This guide provides the fix for path resolution, syntax errors, and the "White Screen" issue on Windows.

## 1. The "Ultimate Fix" for Path Errors
If you see errors like `'-rewrite-agent' is not recognized` or `MODULE_NOT_FOUND`, it is because your folder path contains special characters (`&`, `(`, `)`, spaces).

### 🛑 STOP: Rename your folder now
Windows and Node.js often fail to resolve paths containing symbols.
1. Close your terminal.
2. Rename the folder to something simple like **`code-review-agent`**.
3. Open a new terminal in that renamed folder.

---

## 2. Installation Steps (In the renamed folder)

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
# Create a file named .env in the root folder and add:
VITE_API_KEY=your_actual_google_api_key_here

# 3. Start the application
npm run dev
```

## 3. Troubleshooting Errors

### Issue: Empty White Page (localhost:5173 is blank)
**Solution:** 
1. **Script Tag**: Ensure your `index.html` has `<script type="module" src="/index.tsx"></script>` inside the `<body>` tag.
2. **Import Map**: Remove any `<script type="importmap">` from your `index.html` as it can conflict with Vite's local module resolution.
3. **Console Check**: Press `F12` in your browser and check the "Console" tab. If you see "process is not defined", ensure your `vite.config.ts` is correctly mapping the API key.

### Error: `The character ">" is not valid inside a JSX element`
**Fix:** This is a JSX syntax restriction. I have updated `App.tsx` to wrap `>` characters in braces: `{">"}`.

### Error: `'-rewrite-agent' is not recognized`
**Cause:** PowerShell sees the `&` or other symbols in your folder path and thinks it is a command separator.
**Fix:** Rename folder to remove all symbols (use only letters and hyphens).
