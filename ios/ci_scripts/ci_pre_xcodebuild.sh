#!/bin/bash

# Exit on any error
set -e

# Print commands as they're executed
set -x

echo "Starting pre-xcodebuild script"

# Install Node.js (latest LTS version)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use Node.js LTS
nvm install --lts
nvm use --lts

# Verify Node.js installation
node --version
npm --version

# Navigate to project root
cd $CI_WORKSPACE

# Install npm dependencies
npm install

# Navigate to iOS directory
cd ios

# Install CocoaPods if not already installed
if ! command -v pod &> /dev/null; then
    echo "Installing CocoaPods..."
    gem install cocoapods
fi

# Install pod dependencies
pod install --verbose

echo "Pre-xcodebuild script completed successfully" 