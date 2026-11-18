# Contributing

Thanks for helping! This project is a small workaround, so contributions are
mostly about confirming behavior in more environments.

## Useful contributions

- Reports from different APEX versions (23.x, 24.x, 25.x ...) and browsers.
- Confirmation of whether Oracle ships an official fix (link the patch/bug id).
- Improvements to the script or docs.

## Development

```bash
npm install
npm test        # run unit tests
npm run build   # regenerate dist/popup-lov-cleanup.min.js
```

Please keep `src/popup-lov-cleanup.js` dependency-free at runtime (it relies only
on the `apex` and jQuery objects that APEX already provides) and add a test for
any behavior change.

## Pull requests

1. Fork and create a branch.
2. Add or update tests in `test/`.
3. Run `npm test` and `npm run build`.
4. Update `CHANGELOG.md`.
