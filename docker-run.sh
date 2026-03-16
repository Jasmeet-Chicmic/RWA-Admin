#!/bin/sh
# Build and run Next.js app in Docker locally.
# Usage: ./docker-run.sh              (uses .env)
# Or:    ./docker-run.sh .env.development

set -e
ENV_FILE="${1:-.env}"

# Resolve path so Docker can find the file
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Env file not found: $ENV_FILE"
  echo "Create $ENV_FILE or run: ./docker-run.sh .env.development"
  exit 1
fi

echo "Building image (ensure .env exists for NEXT_PUBLIC_* at build)..."
docker build --build-arg BUILD_ENV=development -t blackrise-admin .

echo "Running container (env: $ENV_FILE)..."
docker run --rm -p 3000:3000 --env-file "$ENV_FILE" blackrise-admin
