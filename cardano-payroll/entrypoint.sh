#!/usr/bin/env bash
set -e

# Install Node dependencies for the scripts if present
if [ -d "/scripts" ] && [ -f "/scripts/package.json" ]; then
  echo "Installing Node dependencies for scripts..."
  cd /scripts
  npm install --omit=dev || npm install
  cd /app
fi

echo "Starting Spring Boot application..."
exec java -jar app.jar


