#!/bin/bash
# Use ufw (uncomplicated firewall) to test offline deployments
# of npmbox.

#
# PARAMETERS
#
is_ubuntu=false
lsb_release -d | grep Ubuntu
if [ $? -eq 0 ]
then
  is_ubuntu=true
fi

#
# CHECKS
#
if [ $(whoami) != "root" ]
then
  echo "You must be root to run this script."
  exit 1
fi

set -e  # Stop on first error

#
# Test That Bundled Offline Tarball Works Without Internet
# (Only for Debian Based Distros)
#
if [ $is_ubuntu != true ]
then
  echo "[WARNING] Ubuntu not detected. Skipping ufw firewall test against npm install. Please manually validate that interrupting internet access does not fail the npm install of the generated offline tarball." 
else
  ufw deny out to any
  ufw allow in to any
  echo "y" | ufw enable
  npm install -g npmbox*.tgz
  set +e  # Custom error handling
  which npmbox
  if [ $? -eq 0 ]
  then
    echo "[SUCCESS] Npmbox established without internet access."
  else
    echo "[ERROR] Npmbox could not be established without internet access."
    exit 1
  fi

  set -e # Stop on first error
  ufw disable
fi
