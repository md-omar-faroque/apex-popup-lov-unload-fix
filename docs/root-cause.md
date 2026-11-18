# Root cause

## Background: why Chrome is blocking `unload`

The `unload` event prevents pages from entering the browser's back/forward cache
(bfcache), which makes back/forward navigation slow. Chrome has been
deprecating it gradually, using the **Permissions Policy** mechanism (the
`unload` policy feature) to disable handlers on a growing share of sites.

When a handler is blocked, the browser logs:

```
[Violation] Permissions policy violation: unload is not allowed in this document.
```

## What goes wrong in APEX

1. A Popup LOV opens inside the page (or in the top window when the page is a
   modal dialog) and APEX creates DOM elements whose ids start with
   `PopupLov_<pageId>_`.
2. When the modal dialog closes, APEX's internal cleanup routine depends on the
   `unload` event to remove those elements.
3. With `unload` blocked, the cleanup does not run, and the old elements stay in
   the DOM.
4. The next time the Popup LOV opens, it collides with the stale elements and
   returns no data.
5. A hard refresh rebuilds the DOM, so the problem disappears until the next
   cycle.

## Why the workaround works

Clearing `[id^="PopupLov_<pageId>_"]` on page load removes the leftovers before
the next Popup LOV opens, replacing the cleanup that `unload` no longer performs.
It queries the **top** window (`apex.util.getTopApex()`) because modal dialogs
render in an iframe while the Popup LOV elements live in the parent document.

## Limits of the workaround

- It runs on page load. If a page opens the same Popup LOV repeatedly *without*
  reloading and a stale element is created in between, you may need to run the
  cleanup from a dynamic action on dialog close as well:
  ```js
  popupLovCleanup.cleanupStalePopupLov();
  ```
  (available when using `src/popup-lov-cleanup.js`).
- It is a workaround, not an official patch. Prefer Oracle's fix once available.

## General guidance for other apps

- Replace `window.addEventListener('unload', ...)` with `pagehide`
  (fires reliably, bfcache friendly).
- Use `visibilitychange` for state saving.
- Use `navigator.sendBeacon` or `fetch(..., { keepalive: true })` for last-moment
  network calls.
- Audit third-party libraries for `unload` listeners.

## References

- Chrome developer docs: "Deprecating the unload event"
- MDN: `Window: unload event`, `Window: pagehide event`
- MDN: Permissions-Policy `unload`
