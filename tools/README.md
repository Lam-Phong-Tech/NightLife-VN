# Tools & Generators

This directory contains utility scripts to generate and convert HTML wireframes into Next.js React components.

## Files
- `convert-responsive.mjs`: Main script that takes desktop and mobile HTML files from `Wirefame_Nightlight/` and generates responsive Next.js `page.tsx` files inside `frontend/apps/web/src/app/`.
- `convert-mobile.mjs`, `convert.mjs`: Legacy/alternative scripts for conversion.
- `fix-svg.js`, `process_svgs.js`: Utility scripts to fix and optimize SVG assets.
- `Wirefame_Nightlight/`: The source directory containing original HTML mockups from the design team.

## Usage
To run the responsive generator:
```bash
node convert-responsive.mjs
```
*Note: Make sure your working directory paths inside the script are correct relative to your current location.*
