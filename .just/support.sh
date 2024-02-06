#!/usr/bin/env bash

run_or_exec() {
  local service=${1}
  shift
  result="run --rm ${service}"
  check='default'

  if docker compose ps api --format "{{.Status}}" | grep Up &>/dev/null; then
    check='service-is-running'
  fi

  if [[ "${check}" == 'service-is-running' && "${USE_ROOT:-false}" == "true" ]]; then
    check='service-is-running-use-root'
  fi

  case ${check} in
    service-is-running)
      result="exec --user cuser ${@} ${service}"
      ;;
    service-is-running-use-root)
      result="exec ${@} ${service}"
      ;;
    *|default)
      result="run --rm ${service}"
      ;;
  esac

  echo "${result}"
}

image_build_and_push_command() {
  local command_name="${1}"
  local service_name="${2}"
  shift 2

  case ${command_name} in
    build)
      show_info "Build '${service_name}' image"
      ${DOCKER_COMPOSE_EXECUTABLE} build "$@" "${service_name}"
      ;;
    pull)
      show_info "Pull '${service_name}' image"
      echo
      ${DOCKER_COMPOSE_EXECUTABLE} pull "$@" "${service_name}"
      ;;
    push)
      show_info "Push '${service_name}' image"
      echo
      for image in $(docker image ls --format '{{.Repository}}:{{.Tag}}' | grep "${DOCKER_REGISTRY}/${DOCKER_ORGANISATION}/.*/${service_name}"); do
        if ! echo "$image" | grep '<none>' &>/dev/null; then
          docker push "$@" ${image}
          echo
          echo "  - '${image}' pushed"
          echo
        fi
      done
      ;;
    *)
      echo -e "  ${c_red}USAGE:${c_reset} just|j api|a image"
      echo
      echo -e "  supported commands:\n"
      echo -e "    build"
      echo -e "    push"
      echo -e "    pull"
      exit 1
      ;;
  esac
}

do_update_dotenv_file() {
    if [[ -f .env ]]; then
        mkdir -p .tmp
        backup_file=".tmp/.env.backup.$(date "+%Y%m%d%H%M%S")"
        cp .env "${backup_file}"
        rm .env
        show_info "Backup of '.env' -> '${backup_file}' created & '.env' removed"
    fi

    if [[ ! -f .env ]]; then
        export HIDE_COMMAND_TITLE=true
        export HIDE_ENV_NOT_LOADED_BANNER=true
        export HIDE_API_DEFAULT_SERVICES_WARNING=true
        just env decrypt "${environment_name}"
        just env activate "${environment_name}"
    fi

    show_warning "Make use of the updated '.env' by running 'just setup' again but deny another update."
    echo
}
