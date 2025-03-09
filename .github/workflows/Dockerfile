FROM node:18-slim

# Install claude-code globally
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /app

# Copy the Node.js script
COPY run.js /app/run.js

# Set environment variable to disable raw mode
ENV INK_DISABLE_SET_RAW_MODE=true

# Run the Node.js script directly
CMD ["node", "/app/run.js"]