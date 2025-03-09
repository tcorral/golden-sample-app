// Save this as run.js
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const inputText = process.env.INPUT_TEXT || '';
const apiKey = process.env.ANTHROPIC_API_KEY || '';

// Write the input to a file
fs.writeFileSync('/tmp/input.txt', inputText);

// Set environment variables for claude-code
process.env.INK_DISABLE_SET_RAW_MODE = 'true';

try {
  // Use the full path to the claude-code executable
  const claudeCodePath = '/usr/local/bin/claude-code';
  
  // Run claude-code with appropriate flags for non-interactive usage
  const result = execSync(`${claudeCodePath} run --input-file=/tmp/input.txt --api-key=${apiKey}`, {
    env: {
      ...process.env,
      INK_DISABLE_SET_RAW_MODE: 'true',
      PATH: process.env.PATH
    },
  });
  
  console.log(result.toString());
} catch (error) {
  console.error('Error executing claude-code:', error.message);
  
  // Debug information
  console.error('PATH:', process.env.PATH);
  try {
    const whichResult = execSync('which claude-code || echo "Not found"');
    console.error('Which claude-code:', whichResult.toString());
  } catch (e) {
    console.error('Error finding claude-code:', e.message);
  }
  
  process.exit(1);
}