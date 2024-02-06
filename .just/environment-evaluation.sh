#!/usr/bin/env bash

if docker compose &> /dev/null; then
  export DOCKER_COMPOSE_EXECUTABLE='docker compose'
fi

if [ -z "${DOCKER_COMPOSE_EXECUTABLE}" ] && which docker-compose &>/dev/null ; then
  export DOCKER_COMPOSE_EXECUTABLE='docker-compose'
fi

if [[ -z "${APP_ENV}" && -z "${GIT_CURRENT_COMMIT_ID}" ]]; then
    export GIT_CURRENT_COMMIT_ID=null
fi

if [[ -z "${APP_ENV}" && -z "${API_DEFAULT_SERVICES}" ]]; then
    export API_DEFAULT_SERVICES=null
fi
