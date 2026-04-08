import os

def find_string(search_dir, target):
    found = []
    for root, dirs, files in os.walk(search_dir):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        for file in files:
            if file.endswith(('.jsx', '.js', '.css', '.html')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        if target in f.read():
                            found.append(path)
                except:
                    pass
    return found

print(find_string('c:\\Users\\NISHIT\\OneDrive\\Desktop\\blender alternateive\\src', 'ORB_MODES.map'))
