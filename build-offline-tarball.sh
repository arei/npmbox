#!/bin/bash
BOT_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rm -f npmbox*.tgz
rm -rf build-offline-tarball
set -xev # Stop on first error

#
# Build Bundled Offline Tarball
#
mkdir build-offline-tarball
cd build-offline-tarball
npmbox_location=$(npm install npmbox 2>&1 | grep "npmbox@" | cut -d' ' -f2)
cp $BOT_SCRIPT_DIR/bundle_app.js $npmbox_location
cd $npmbox_location
npm install findit
node bundle_app.js
npm pack
mv npmbox*.tgz $BOT_SCRIPT_DIR
cd $BOT_SCRIPT_DIR

#
# Cleanup
#
rm -rf build-offline-tarball

#
# Testing
#
./test-offline-tarball.sh
