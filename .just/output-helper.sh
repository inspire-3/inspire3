#!/usr/bin/env bash

c_reset=''
c_red=''
c_lred=''
c_green=''
c_lgreen=''
c_yellow=''
c_lyellow=''

if [[ ${IS_CI} == 'false' ]]; then
  c_reset=$(echo -en '\033[0m')
  c_red=$(echo -en '\033[00;31m')
  c_lred=$(echo -en '\033[01;31m')
  c_green=$(echo -en '\033[00;32m')
  c_lgreen=$(echo -en '\033[01;32m')
  c_yellow=$(echo -en '\033[00;33m')
  c_lyellow=$(echo -en '\033[01;33m')
  c_magenta=$(echo -en '\033[00;35m')
  c_lmagenta=$(echo -en '\033[01;35m')
  c_gray=$(echo -en '\033[00;90m')
  c_lgray=$(echo -en '\033[01;90m')
fi

show_project_title() {
  if [[ "${HIDE_PROJECT_TITLE:-false}" == 'true' ]]; then
    return
  fi
  content="${1}"
  project_title_content="++${c_yellow} ${content} CLI${c_reset} ++"

  case ${APP_ENV} in
    base)
      project_title_content="${project_title_content} (🚨️${c_lred}${APP_ENV}${c_reset})"
    ;;
    local)
      project_title_content="${project_title_content} (${c_green}${APP_ENV}${c_reset})"
    ;;
    pr|staging|testing)
      project_title_content="${project_title_content} (${c_lyellow}${APP_ENV}${c_reset})"
    ;;
    production)
      project_title_content="${project_title_content} (${c_lred}${APP_ENV}${c_reset})"
    ;;
    *)
    ;;
  esac

  echo -e "${project_title_content}"
  echo
}

show_command_title() {
  if [[ ${HIDE_COMMAND_TITLE:-false} == 'true' ]]; then
    return
  fi

  local subproject_name="${1}"
  shift
  local location="${1}"
  shift
  local action="${@}"
  local message="${c_lyellow}${subproject_name}${c_reset}"

  message="${message} ${location}"

  if [[ -n "${action}" ]]; then
    message="${message} ${action}"
  fi

  echo -e "// ${message}"
  echo
}

show_info() {
  local message="${1}"
  echo -en "${c_lgreen}"
  echo "💡 INFO:${c_reset}   ${message}"
}

show_notice() {
  local message="${1}"
  echo -en "${c_lgray}"
  echo "📢 NOTICE:${c_reset} ${message}"
}

show_warning() {
  local message="${1}"
  echo -en "${c_lyellow}"
  echo "⚠️  WARN:${c_reset}  ${message}"
}

show_question() {
  local message="${1}"
  echo -en "${c_red}"
  echo "❓️  ${message}${c_reset}"
}

show_error() {
  local message="${1}"
  echo -en "${c_lred}"
  echo "❗️ ERROR:${c_reset}  ${message}"
  echo
}

indent() {
  local message="${1}"
  echo "    ${message}"
}
