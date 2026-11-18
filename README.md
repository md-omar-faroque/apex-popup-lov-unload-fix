# apex-popup-lov-unload-fix

Workaround for an **Oracle APEX Popup LOV** problem on **modal pages** where the
item returns no data after the first use and only works again after a hard
refresh. The trigger is Chrome's deprecation of the `unload` event.

> Console symptom:
> `[Violation] Permissions policy violation: unload is not allowed in this document.`

## The problem

| | |
|---|---|
| Component | Popup LOV item, Modal Dialog page |
| Symptom | First open works. Later opens return nothing / do not populate. |
| Temporary cure | Hard refresh (Ctrl+Shift+R) |
| Console | `Permissions policy violation: unload is not allowed in this document.` |
| Browser | Chrome (rolling out the `unload` deprecation) |

## Root cause (short version)

Chrome is phasing out the `unload` event to make the back/forward cache work
better. When a dialog closes, APEX relies on `unload` to remove the DOM elements
it created for the Popup LOV. With `unload` blocked, that cleanup silently does
not run, so stale `PopupLov_<pageId>_...` elements remain in the DOM and break
the next Popup LOV open.

Details: [docs/root-cause.md](docs/root-cause.md)

> This is a community-reported diagnosis and workaround. Check Oracle's release
> notes / support for an official fix for your APEX version and remove this
> workaround once you have it.

## The fix

On page load, remove any leftover Popup LOV containers for the current page:

```js
let topApex = apex.util.getTopApex();
let currentPage = apex.env.APP_PAGE_ID;

topApex.jQuery('[id^="PopupLov_' + currentPage + '_"]').each(function () {
  $(this).remove();
});
```

No page reload, no change to *Display As*, no data loss.

## Install

### Option 1: single page

Page Designer > Page Properties > JavaScript > **Execute when Page Loads** and
paste [`src/popup-lov-cleanup.snippet.js`](src/popup-lov-cleanup.snippet.js).

### Option 2: whole application (recommended)

1. Shared Components > Static Application Files > **Create File**, name it
   `popup-lov-cleanup.js` (or `custom-script.js`), paste
   [`src/popup-lov-cleanup.js`](src/popup-lov-cleanup.js) (or the minified
   [`dist/popup-lov-cleanup.min.js`](dist/popup-lov-cleanup.min.js)).
2. Copy the file's **Reference** (e.g. `#APP_FILES#popup-lov-cleanup#MIN#.js`).
3. Shared Components > User Interface Attributes > Interface Attributes >
   JavaScript > **File URLs**, paste the reference, and apply.

Every page then runs the cleanup automatically. Full guide with screenshots
checklist: [docs/installation.md](docs/installation.md)

## Which file should I use?

| File | Use when |
|---|---|
| `src/popup-lov-cleanup.snippet.js` | One page, paste into *Execute when Page Loads* |
| `src/popup-lov-cleanup.js` | App-wide static file (guards, cross-origin fallback, error handling) |
| `dist/popup-lov-cleanup.min.js` | Same as above, smaller |

## Verify it works

1. Open the page that contains the Popup LOV and note whether the console shows
   the `unload` violation.
2. Open the Popup LOV, pick a value, then open it again. It should return data
   on every open.
3. In the console you can inspect leftovers:
   ```js
   apex.util.getTopApex().jQuery('[id^="PopupLov_"]').length
   ```

Reproduction and troubleshooting: [docs/reproduce.md](docs/reproduce.md),
[docs/troubleshooting.md](docs/troubleshooting.md)

## Development

```bash
npm install
npm test        # unit tests (Node + jsdom)
npm run build   # build dist/popup-lov-cleanup.min.js
```

## Beyond APEX

Any web app that depends on `unload` listeners for cleanup can hit the same
class of problem as Chrome rolls the deprecation out. Search your own code for
`unload` listeners and prefer `pagehide` (and `visibilitychange`) for cleanup.
See [docs/root-cause.md](docs/root-cause.md).

## License

[MIT](LICENSE)
