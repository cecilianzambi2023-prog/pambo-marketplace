# Mobile Asset Scaffolding

Drop your source images in this folder before running Capacitor asset generation.

## Required Files

- `icon.png` (1024x1024, PNG)
- `splash.png` (2732x2732, PNG)

## Quick Validation

- [ ] `resources/icon.png` exists
- [ ] `resources/splash.png` exists
- [ ] Run `npm run cap:assets` successfully
- [ ] Run `npm run cap:prepare` successfully

## Notes

- Keep filenames exactly as above (case-sensitive in some environments).
- Use square images with no transparent artifacts where store guidelines require it.
- Re-run `npm run cap:prepare` before each release build.