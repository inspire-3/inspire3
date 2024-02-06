#!/usr/bin/env bash

set -e

if [ ! -z "$USERID" ]; then
    usermod -u $USERID cuser &>/dev/null
fi

case ${1} in
    '')
      exec gosu ${USERID:-33} /usr/bin/yarn dev
    ;;
    bash)
      if [ ! -z "$USERID" ]; then
        exec gosu $USERID "$@"
      else
        exec "$@"
      fi
    ;;
    *)
      if [ ! -z "$USERID" ]; then
        exec gosu $USERID /usr/bin/yarn "$@"
      else
        exec /usr/bin/yarn "$@"
      fi
    ;;
esac
