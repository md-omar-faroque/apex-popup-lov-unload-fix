# Reproducing the issue

Use these steps to confirm you are hitting this bug before installing the
workaround.

## Setup

- A page with a **Popup LOV** item (Page Item type *Popup LOV*).
- The page is opened as a **Modal Dialog** (or contains a modal that contains the
  Popup LOV).
- Chrome with DevTools open on the **Console** tab.

## Steps

1. Open the modal page.
2. Click the Popup LOV icon, choose a value. It works.
3. Close the modal and reopen it (or open the Popup LOV a second time).
4. The list is empty / returns no data.
5. Check the console for:
   ```
   [Violation] Permissions policy violation: unload is not allowed in this document.
   ```
6. Inspect leftovers:
   ```js
   apex.util.getTopApex().jQuery('[id^="PopupLov_"]').length
   ```
   A non-zero count between opens indicates stale elements.
7. Hard refresh. It works once more.

## After installing the fix

Repeat steps 1-4. The Popup LOV should return data every time, and the count in
step 6 should be 0 right after page load.
