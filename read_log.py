import sys

try:
    with open('build_error.log', 'rb') as f:
        content = f.read()
    
    # Try decoding as UTF-16LE or UTF-8
    try:
        print(content.decode('utf-16le'))
    except:
        print(content.decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
