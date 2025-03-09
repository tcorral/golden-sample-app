// Save this as run.js
const fs = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const inputText = process.env.INPUT_TEXT || '';
const apiKey = process.env.ANTHROPIC_API_KEY || '';

// Write the input to a file
fs.writeFileSync('/tmp/input.txt', inputText);

// Set environment variable to disable raw mode
process.env.INK_DISABLE_SET_RAW_MODE = 'true';

try {
  // Find where npm installed the claude-code package
  const modulePath = execSync('npm root -g').toString().trim();
  console.log(`Module path: ${modulePath}`);
  
  // Assuming claude-code has a bin script that's exposed via npm
  const claudeCodeBin = path.join(modulePath, '@anthropic-ai', 'claude-code', 'bin', 'claude-code');
  console.log(`Looking for claude-code at: ${claudeCodeBin}`);
  
  if (fs.existsSync(claudeCodeBin)) {
    console.log('Found claude-code binary');
    
    // Execute claude-code directly with Node.js
    const result = spawnSync('node', [
      claudeCodeBin,
      'run',
      `--input-file=/tmp/input.txt`,
      `--api-key=${apiKey}`
    ], {
      env: {
        ...process.env,
        INK_DISABLE_SET_RAW_MODE: 'true'
      },
      stdio: 'inherit'
    });
    
    if (result.status !== 0) {
      console.error('Error running claude-code:', result.error);
      process.exit(result.status);
    }
  } else {
    console.error('Could not find claude-code binary');
    
    // List the contents of the module directory to debug
    const moduleContents = fs.readdirSync(modulePath);
    console.log('Available modules:', moduleContents);
    
    if (moduleContents.includes('@anthropic-ai')) {
      const anthropicContents = fs.readdirSync(path.join(modulePath, '@anthropic-ai'));
      console.log('@anthropic-ai contents:', anthropicContents);
      
      if (anthropicContents.includes('claude-code')) {
        const claudeCodeContents = fs.readdirSync(path.join(modulePath, '@anthropic-ai', 'claude-code'));
        console.log('claude-code contents:', claudeCodeContents);
      }
    }
    
    process.exit(1);
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

function execSync(command) {
  return require('child_process').execSync(command, { encoding: 'utf8' });
}