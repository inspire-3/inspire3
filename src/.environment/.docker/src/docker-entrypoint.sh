#!/usr/bin/env bash

set -e

if [ ! -z "$USERID" ]; then
    usermod -u $USERID cuser &>/dev/null
fi

if [ ! -z "$USERID" ]; then
  exec gosu ${USERID:-33} node /environment/src/environment.mjs "${@}"
else
  echo "❗️ERROR: '\$USERID' missing, but required"
  echo
  exit 1
fi
