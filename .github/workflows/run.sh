#!/bin/bash
# This uses 'script' to allocate a pseudo-TTY, then runs an inner bash
# which echoes the INPUT_TEXT and pipes it to claude -p.
script -q -c "bash -c 'echo \"$INPUT_TEXT\" | claude -p'"
