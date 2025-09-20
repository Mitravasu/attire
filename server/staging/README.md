# Photo Staging Directory

This directory is where you should place your photos before importing them into the database.

## How to use:

1. Copy all your clothing photos (80 photos) into this `staging` directory
2. Run the bulk import script to preview what will be imported:
   ```
   npm run bulk-import -- --source "C:\Users\mitra\Documents\GitHub\attire\server\staging" --dry-run
   ```
3. If the preview looks good, run the actual import:
   ```
   npm run bulk-import -- --source "C:\Users\mitra\Documents\GitHub\attire\server\staging"
   ```

## Supported file formats:
- .jpg / .jpeg
- .png
- .gif
- .bmp
- .webp

## Notes:
- The script will automatically generate titles from your photo filenames
- All photos will be copied to the uploads directory with unique names
- Default tags: "clothing"
- Default status: "dirty"
- You can customize these settings using command line options

## Examples:

### Preview import with custom tags:
```
npm run bulk-import -- --source "C:\Users\mitra\Documents\GitHub\attire\server\staging" --tags "summer,casual,winter" --dry-run
```

### Import with custom status:
```
npm run bulk-import -- --source "C:\Users\mitra\Documents\GitHub\attire\server\staging" --status "washed"
```

### Import without automatic title generation:
```
npm run bulk-import -- --source "C:\Users\mitra\Documents\GitHub\attire\server\staging" --no-title-generation
```