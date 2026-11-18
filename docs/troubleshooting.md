# Troubleshooting

## The fix does nothing

- Confirm the file actually loads: in DevTools > Network, filter by `popup-lov`.
  A 404 means the reference in *File URLs* is wrong.
- Confirm `popupLovCleanup` exists in the console. If it is `undefined`, the
  script is not loaded on that page / UI.
- Make sure you are testing the page that **shows** the Popup LOV, not only the
  parent page.

## `$ is not defined` / `apex is not defined`

The snippet must run in an APEX page (after APEX's core JS). Put it in *Execute
when Page Loads* or in *File URLs*, not in a plain HTML region with an early
`<script>`.

## Works for one Popup LOV, not another on the same page

Run the cleanup after each dialog closes (see the Dynamic Action in
`docs/installation.md`). The default behavior only runs on page load.

## Console still shows the `unload` violation

That is expected. The warning comes from APEX's own `unload` listener and is not
fixed by this workaround. The workaround removes the *consequence* (stale
elements).

## Cross-origin / embedded apps

When the top window is on a different origin, `apex.util.getTopApex()` may throw.
The hardened script catches this and falls back to the current window's jQuery.

## Still broken?

Open an issue and include APEX version, browser version, console output, and the
result of:

```js
apex.util.getTopApex().jQuery('[id^="PopupLov_"]').length
```
