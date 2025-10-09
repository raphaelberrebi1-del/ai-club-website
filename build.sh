#!/bin/bash
# Copy all files from public to the output directory
mkdir -p .vercel/output/static
cp -r public/* .vercel/output/static/
echo "Build complete - files copied from public/ to .vercel/output/static/"
