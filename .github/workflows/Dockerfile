FROM node:18-slim

# Install claude-code globally and make sure it's in the PATH
RUN npm install -g @anthropic-ai/claude-code && \
    ls -la /usr/local/bin/ | grep claude && \
    echo "PATH=$PATH" && \
    which claude-code || echo "claude-code not found in PATH"

WORKDIR /app

# Copy the Node.js script
COPY run.js /app/run.js

# Set environment variable to disable raw mode
ENV INK_DISABLE_SET_RAW_MODE=true

# Show the installation of claude-code before running
CMD ["sh", "-c", "ls -la /usr/local/bin/ && which claude-code && node /app/run.js"]