#!/usr/bin/env bash

set -e

if [ ! -z "$USERID" ]; then
    usermod -u $USERID cuser &>/dev/null
fi

case ${1} in
  bash)
    if [ ! -z "$USERID" ]; then
      exec gosu $USERID "$@"
    else
      exec "$@"
    fi
  ;;
  code:analyse|code:analyse:fix|code:style|code:style:fix)
    export PATH=/node_modules/.bin:$PATH
    if [ ! -z "$USERID" ]; then
      exec gosu $USERID /usr/bin/yarn --cwd /var/www/html --modules-folder /node_modules "$@"
    else
      exec /usr/bin/yarn --cwd /var/www/html --modules-folder /node_modules "$@"
    fi
  ;;
  yarn)
    shift
    if [ ! -z "$USERID" ]; then
      exec gosu $USERID /usr/bin/yarn "$@"
    else
      exec /usr/bin/yarn "$@"
    fi
  ;;
  *)
    if [ ! -z "$USERID" ]; then
      exec gosu $USERID "$@"
    else
      exec "$@"
    fi
  ;;
esac
