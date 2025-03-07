import os
import sys
import json
import subprocess
from pathlib import Path

# Load files to modify
with open('files_to_modify.json', 'r') as f:
    files_to_modify = json.load(f)

# Load prompt
with open('aider_prompt.txt', 'r') as f:
    prompt = f.read()

# Get ANTHROPIC API key from environment
anthropic_api_key = os.environ.get('ANTHROPIC_API_KEY')
if not anthropic_api_key:
    print("Error: ANTHROPIC_API_KEY environment variable not set")
    sys.exit(1)

# Prepare basic Aider command
aider_cmd = ['aider', '--no-auto-commit', '--yes']

# Add files to modify if specified
if files_to_modify:
    aider_cmd.extend(files_to_modify)

# Write prompt to a file that Aider can read
prompt_file = Path('prompt_for_aider.txt')
prompt_file.write_text(prompt)

# Set up a way to capture and send the prompt to Aider
print(f"Running command: {' '.join(aider_cmd)}")

# Run Aider with input from prompt file
with open('prompt_for_aider.txt', 'r') as prompt_file:
    result = subprocess.run(
        aider_cmd,
        stdin=prompt_file,
        capture_output=True,
        text=True
    )

# Log the output
print("Aider stdout:")
print(result.stdout)

print("Aider stderr:")
print(result.stderr)

# Check exit code
print(f"Aider exit code: {result.returncode}")

# Write true/false to a file based on whether changes were made
# We need to check git status for changes since Aider doesn't auto-commit
git_status = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True)
changes_made = bool(git_status.stdout.strip())

print(f"Git status output: {git_status.stdout}")
print(f"Changes detected: {changes_made}")

with open('changes_made.txt', 'w') as f:
    f.write(str(changes_made).lower())
