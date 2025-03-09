FROM node:18-slim

# Install findutils for the 'find' command
RUN apt-get update && apt-get install -y findutils

# Install claude-code globally
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /app

# Copy the bash script
COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh

# Set environment variable to disable raw mode
ENV INK_DISABLE_SET_RAW_MODE=true

# Run the script
ENTRYPOINT ["/app/run.sh"]