#!/bin/bash

set -e
set -x

echo "=== Post Clone Script Started ==="

# Install Node.js using the system package manager
brew install node@18
brew link node@18 --force --overwrite

# Navigate to project root
cd $CI_WORKSPACE

# Install npm dependencies
npm install

# Navigate to iOS directory and install pods
cd ios
pod install

echo "=== Post Clone Script Completed === 