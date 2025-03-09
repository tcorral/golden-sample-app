#!/bin/bash
set -e

# Debug: show environment
echo "Current working directory: $(pwd)"
echo "PATH: $PATH"
echo "Node modules: $(npm root -g)"

# Install claude-code if not already installed
echo "Installing claude-code..."
npm install -g @anthropic-ai/claude-code

# Find the claude-code package directory
CLAUDE_CODE_DIR=$(find $(npm root -g) -name "@anthropic-ai" -type d 2>/dev/null)
if [ -z "$CLAUDE_CODE_DIR" ]; then
  echo "ERROR: Could not find @anthropic-ai directory!"
  exit 1
fi

CLAUDE_CODE_DIR="$CLAUDE_CODE_DIR/claude-code"
echo "Found claude-code directory at: $CLAUDE_CODE_DIR"

# Check for cli.js file
if [ ! -f "$CLAUDE_CODE_DIR/cli.js" ]; then
  echo "ERROR: cli.js not found in claude-code directory!"
  ls -la "$CLAUDE_CODE_DIR"
  exit 1
fi

echo "Found cli.js at: $CLAUDE_CODE_DIR/cli.js"

# Write input to file
echo "$INPUT_TEXT" > /tmp/input.txt

# Set environment variables
export INK_DISABLE_SET_RAW_MODE=true

# Run claude-code using the cli.js file directly
echo "Running claude-code using cli.js..."
node "$CLAUDE_CODE_DIR/cli.js" run --input-file=/tmp/input.txt --api-key="$ANTHROPIC_API_KEY" --no-interactive