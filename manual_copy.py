import os

def copy_binary_file(src, dst):
    """Copy a binary file from src to dst"""
    try:
        with open(src, 'rb') as src_file:
            data = src_file.read()
        
        with open(dst, 'wb') as dst_file:
            dst_file.write(data)
        
        return True
    except Exception as e:
        print(f"Error copying {src} to {dst}: {e}")
        return False

# Files to copy
files_to_copy = [
    'apple-touch-icon.png',
    'favicon-96x96.png', 
    'favicon.svg',
    'web-app-manifest-192x192.png',
    'web-app-manifest-512x512.png'
]

# Copy each file
for filename in files_to_copy:
    src_path = filename
    dst_path = os.path.join('public', filename)
    
    if os.path.exists(src_path):
        success = copy_binary_file(src_path, dst_path)
        if success:
            src_size = os.path.getsize(src_path)
            dst_size = os.path.getsize(dst_path)
            print(f"Successfully copied {filename} ({src_size} bytes -> {dst_size} bytes)")
        else:
            print(f"Failed to copy {filename}")
    else:
        print(f"Source file {filename} not found")

print("\nFinal public directory listing:")
for item in sorted(os.listdir('public')):
    full_path = os.path.join('public', item)
    if os.path.isfile(full_path):
        size = os.path.getsize(full_path)
        print(f"  {item} ({size:,} bytes)")