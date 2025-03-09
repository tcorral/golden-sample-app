FROM node:18-slim

# Install 'script' (from util-linux) to simulate a TTY.
RUN apt-get update && apt-get install -y util-linux

# Install claude-code globally.
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /app

# Copy the entrypoint script into the container.
COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh

ENTRYPOINT ["/app/run.sh"]
