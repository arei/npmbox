#!/bin/bash
rm -f npmbox*.tgz
set -e  # Stop on first error

#
# Build Bundled Offline Tarball
#
mkdir build-offline-tarball
cd build-offline-tarball
npm install npmbox
cd node_modules
cd npmbox
npm pack
mv npmbox*.tgz ../../../
cd ../../../

#
# Cleanup
#
rm -rf build-offline-tarball

#
# Testing
#
./test-offline-tarball.sh
