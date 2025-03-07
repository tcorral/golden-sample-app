import os
import sys
import json
import subprocess
import glob
from pathlib import Path

# Load files to modify
with open('files_to_modify.json', 'r') as f:
    file_paths = json.load(f)

# Expand any glob patterns and verify file existence
resolved_files = []
for file_path in file_paths:
    # Check if it's a glob pattern (contains * or ?)
    if '*' in file_path or '?' in file_path:
        matching_files = glob.glob(file_path)
        if matching_files:
            resolved_files.extend(matching_files)
            print(f"Expanded '{file_path}' to {len(matching_files)} files")
        else:
            print(f"Warning: No files match the pattern '{file_path}'")
    else:
        # Check if path exists (could be directory or file)
        if Path(file_path).exists():
            resolved_files.append(file_path)
            print(f"Found file/directory: {file_path}")
        else:
            print(f"Warning: Path does not exist: {file_path}")

if not resolved_files:
    print("No valid files found to modify. Exiting.")
    with open('changes_made.txt', 'w') as f:
        f.write('false')
    sys.exit(0)

# Prepare Aider command with resolved files
aider_cmd = ['aider', '--no-auto-commit', '--yes']
aider_cmd.extend(resolved_files)

# Load prompt
with open('aider_prompt.txt', 'r') as f:
    prompt = f.read()

# Write prompt to a file
prompt_file = Path('prompt_for_aider.txt')
prompt_file.write_text(prompt)

print(f"Running Aider with files: {', '.join(resolved_files)}")
print(f"Command: {' '.join(aider_cmd)}")

# Run Aider with the prompt
with open('prompt_for_aider.txt', 'r') as prompt_file:
    result = subprocess.run(
        aider_cmd,
        stdin=prompt_file,
        capture_output=True,
        text=True
    )

# Log output
print("Aider stdout:")
print(result.stdout)
print("Aider stderr:")
print(result.stderr)
print(f"Aider exit code: {result.returncode}")

# Check for changes using git status
git_status = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True)
changes_made = bool(git_status.stdout.strip())

print(f"Git status: {git_status.stdout}")
print(f"Changes detected: {changes_made}")

# Write result to file
with open('changes_made.txt', 'w') as f:
    f.write(str(changes_made).lower())
