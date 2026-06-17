import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # If the file doesn't have require api, maybe it's fine, but let's check
    if 'require(\'../services/api\')' not in content and 'require(\'../../services/api\')' not in content:
        # Also ensure React is imported
        if 'import React' not in content and '<' in content:
            content = "import React from 'react';\n" + content
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
        return

    # Find the depth
    if "require('../services/api')" in content:
        api_path = "'../services/api'"
    else:
        api_path = "'../../services/api'"

    # Remove the require statement
    new_content = re.sub(r'const\s+api\s*=\s*require\([^\)]+\);', '', content)

    # Add the static import at the top
    import_stmt = f"import * as api from {api_path};\n"
    
    # Also add import React if missing
    if 'import React' not in new_content:
        import_stmt = "import React from 'react';\n" + import_stmt

    new_content = import_stmt + new_content

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

def main():
    base_dirs = ['src/pages', 'src/components']
    for base_dir in base_dirs:
        for root, dirs, files in os.walk(base_dir):
            for file in files:
                if file.endswith('.test.jsx'):
                    process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
