#!/usr/bin/env bash

do_environment_checks() {
    if ! which direnv &>/dev/null; then
      show_error "'direnv' is missing but required!"
      exit 1
    fi

    if ! which docker &>/dev/null; then
      show_error "'docker' is missing but required!"
      exit 1
    fi

    if [ -z "${DOCKER_COMPOSE_EXECUTABLE}" ]; then
      show_error "'docker[-]compose' is missing but required!"
      exit 1
    fi

    if [[ \
        -z "${APP_ENV}" \
        && "${HIDE_ENV_NOT_LOADED_BANNER:-false}" == 'false' \
        && "${1}" != 'setup' \
        && "${1}" != 'env' \
        && "${1}" != 'environment' \
        && "${1}" != 'e' \
        ]];
    then
      echo -en "${c_red}"
      echo "# |||||||||||||||||||||||||||||||||||||||||||| #"
      echo "# |${c_lred}>>        Environment not loaded        <<${c_red}| #"
      echo "# |||||||||||||||||||||||||||||||||||||||||||| #"
      echo "${c_reset}"
    fi

    if [[ \
        -z "${API_DEFAULT_SERVICES}" \
        && "${HIDE_API_DEFAULT_SERVICES_WARNING:-false}" == 'false' \
        && "${1}" != 'env' \
        && "${1}" != 'environment' \
        && "${1}" != 'e' \
        ]];
    then
        show_warning "'\$API_DEFAULT_SERVICES' definition is missing but required!"
        echo
    fi
}

ensure_doctl_is_present() {
    if ! which doctl &>/dev/null; then
        show_error "doctl required but missing"
        exit 1
    fi
}

ensure_jq_is_present() {
    if ! which jq &>/dev/null; then
        show_error "jq required but missing"
        exit 1
    fi
}

ensure_curl_present() {
    if ! which curl &>/dev/null; then
        show_error "curl required but missing"
        exit 1
    fi
}

ensure_tool_is_present() {
    local tool="${1:-null}"

    [[ "${tool}" == 'null' ]] \
       && show_error "'${tool}' argument is missing, but required" \
       && exit 1

    case ${MODE:-fail} in
        fail)
            if ! which "${tool}" &>/dev/null; then \
                show_error "'${tool}' required but missing" \
                exit 1
            fi
        ;;
        *|notice)
            show_notice "'${tool}' is missing"
            return 0
        ;;
    esac
}

resolve_sed_command() {
    GUESSED_OS=$(uname -s)
    case "${GUESSED_OS}" in
        Linux*)
            SED_COMMAND='sed'
        ;;
        Darwin|Darwin*)
            SED_COMMAND='gsed'
        ;;
        *)
            echo "Unsupported operating system [${GUESSED_OS}]. 'just' supports macOS, Linux, and Windows (WSL2)." >&2
            exit 1
        ;;
    esac

    if ! which "${SED_COMMAND}" &>/dev/null; then
        show_error "'${SED_COMMAND}' is missing but required!"
        exit 1
    fi

    echo "${SED_COMMAND}"
}
