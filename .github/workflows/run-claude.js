const { spawnSync } = require("child_process");

const inputText = process.env.INPUT_TEXT || "";

const result = spawnSync("npx", ["@anthropic-ai/claude-code", "-p", inputText], {
  stdio: ["ignore", "inherit", "inherit"], // Prevent stdin from being read
  env: { ...process.env, NODE_NO_READLINE: "1" },
});

process.exit(result.status);