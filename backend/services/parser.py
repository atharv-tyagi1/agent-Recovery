import os

def get_language(filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    mapping = {
        '.py': 'python',
        '.js': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'tsx',
        '.jsx': 'jsx',
        '.html': 'html',
        '.css': 'css',
        '.json': 'json',
        '.yml': 'yaml',
        '.yaml': 'yaml',
        '.env': 'env'
    }
    return mapping.get(ext, 'text')

def build_file_tree(dir_path: str) -> list:
    """Builds a nested dictionary representing the file tree for the frontend."""
    tree = []
    try:
        entries = sorted(os.listdir(dir_path))
    except FileNotFoundError:
        return []
        
    for entry in entries:
        # Ignore common hidden/build folders
        if entry in ['.git', 'node_modules', '__pycache__', '.next', 'venv', '.env']:
            continue
            
        full_path = os.path.join(dir_path, entry)
        if os.path.isdir(full_path):
            children = build_file_tree(full_path)
            if children: # only add non-empty folders (or empty if you prefer, but usually better to prune empty)
                tree.append({
                    "name": entry,
                    "type": "folder",
                    "children": children
                })
        else:
            tree.append({
                "name": entry,
                "type": "file",
                "language": get_language(entry)
            })
    return tree

def get_all_files(dir_path: str) -> list:
    """Returns a flat list of all absolute file paths."""
    files = []
    try:
        for root, dirs, filenames in os.walk(dir_path):
            # Ignore __MACOSX or hidden files if necessary
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__', '.next', 'venv']]
            for f in filenames:
                if f == '.DS_Store': continue
                files.append(os.path.join(root, f))
    except FileNotFoundError:
        pass
    return files
