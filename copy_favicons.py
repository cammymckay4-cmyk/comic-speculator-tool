#!/usr/bin/env python3
import shutil
import os

# List of favicon files to copy
favicon_files = [
    'apple-touch-icon.png',
    'favicon-96x96.png', 
    'favicon.svg',
    'web-app-manifest-192x192.png',
    'web-app-manifest-512x512.png'
]

# Copy each file
for filename in favicon_files:
    source = filename
    destination = os.path.join('public', filename)
    
    if os.path.exists(source):
        shutil.copy2(source, destination)
        print(f"Copied {filename} to public/ directory")
    else:
        print(f"Warning: {filename} not found in root directory")

# List the public directory contents
print("\nPublic directory contents:")
for item in os.listdir('public'):
    full_path = os.path.join('public', item)
    size = os.path.getsize(full_path)
    print(f"  {item} ({size} bytes)")