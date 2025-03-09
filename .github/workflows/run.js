// Save this as run.js
const fs = require('fs');
const { execSync } = require('child_process');

const inputText = process.env.INPUT_TEXT || '';
const apiKey = process.env.ANTHROPIC_API_KEY || '';

// Write the input to a file
fs.writeFileSync('/tmp/input.txt', inputText);

// Set environment variables for claude-code
process.env.INK_DISABLE_SET_RAW_MODE = 'true';

try {
  // Run claude-code with appropriate flags for non-interactive usage
  const result = execSync('claude-code run --input-file=/tmp/input.txt --api-key=' + apiKey, {
    env: {
      ...process.env,
      INK_DISABLE_SET_RAW_MODE: 'true',
    },
  });
  
  console.log(result.toString());
} catch (error) {
  console.error('Error executing claude-code:', error.message);
  process.exit(1);
}