#!/bin/bash

# Copy favicon files to public directory
cp apple-touch-icon.png public/
cp favicon-96x96.png public/
cp favicon.svg public/
cp web-app-manifest-192x192.png public/
cp web-app-manifest-512x512.png public/

echo "Files copied successfully"
ls -la public/