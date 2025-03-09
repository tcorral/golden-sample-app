#!/bin/bash
set -e

# Debug: show environment
echo "Current working directory: $(pwd)"
echo "PATH: $PATH"
echo "Node modules: $(npm root -g)"

# Try to find claude-code
CLAUDE_CODE_PATH=$(find $(npm root -g) -name "claude-code" -type f 2>/dev/null | head -n 1)

if [ -z "$CLAUDE_CODE_PATH" ]; then
  echo "Could not find claude-code executable. Installing now..."
  npm install -g @anthropic-ai/claude-code
  
  # Try again after installation
  CLAUDE_CODE_PATH=$(find $(npm root -g) -name "claude-code" -type f 2>/dev/null | head -n 1)
  
  if [ -z "$CLAUDE_CODE_PATH" ]; then
    echo "ERROR: Still could not find claude-code after installation!"
    ls -la $(npm root -g)/@anthropic-ai/claude-code || echo "Claude-code directory not found"
    exit 1
  fi
fi

echo "Found claude-code at: $CLAUDE_CODE_PATH"

# Write input to file
echo "$INPUT_TEXT" > /tmp/input.txt

# Set environment variables
export INK_DISABLE_SET_RAW_MODE=true

# Run claude-code
echo "Running claude-code..."
node "$CLAUDE_CODE_PATH" run --input-file=/tmp/input.txt --api-key="$ANTHROPIC_API_KEY" --no-interactive