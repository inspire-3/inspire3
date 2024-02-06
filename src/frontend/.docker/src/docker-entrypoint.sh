#!/usr/bin/env bash

set -e

if [ ! -z "$USERID" ]; then
    usermod -u $USERID cuser &>/dev/null
fi

case ${1} in
  '')
      exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
  ;;
  *)
    if [ ! -z "$USERID" ]; then
      exec gosu $USERID "$@"
    else
      exec "$@"
    fi
  ;;
esac
