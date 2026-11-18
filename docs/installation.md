# Installation

## Option 1: single page

1. Open the page in **Page Designer**.
2. Select the page node (top of the left tree) > **JavaScript** section.
3. Paste the contents of `src/popup-lov-cleanup.snippet.js` into
   **Execute when Page Loads**.
4. Save and run the page.

Use this to confirm the fix works before rolling it out everywhere.

## Option 2: whole application (recommended)

### Create the static file

1. **Shared Components > Static Application Files > Create File**.
2. File Name: `popup-lov-cleanup.js` (any name works, e.g. `custom-script.js`).
3. Paste `src/popup-lov-cleanup.js` (or `dist/popup-lov-cleanup.min.js`).
4. Click **Create**, then copy the **Reference** shown for the file.

   Typical references:
   - `#APP_FILES#popup-lov-cleanup.js`
   - `#APP_FILES#popup-lov-cleanup#MIN#.js` (when you upload both a normal and a
     `.min.js` file, `#MIN#` picks the right one automatically)

### Load it on every page

1. **Shared Components > User Interface Attributes > Interface Attributes**
   (Desktop).
2. **JavaScript > File URLs**: paste the reference. Add it on its own line if
   other files are already listed.
3. **Apply Changes**.

If your app uses a different theme/UI (e.g. a separate login or mobile UI),
repeat for each user interface.

## Already have a `custom-script.js`?

Append the contents of `src/popup-lov-cleanup.js` to it instead of creating a
second file.

## Optional: run cleanup when a dialog closes

If a page opens the same Popup LOV many times without reloading, add a Dynamic
Action on **Dialog Closed** (or on the item's change event) with a **Execute
JavaScript Code** action:

```js
popupLovCleanup.cleanupStalePopupLov();
```

## Uninstall

Remove the file reference from *Interface Attributes* (or clear the page's
*Execute when Page Loads* code). Do this once Oracle ships an official fix.
