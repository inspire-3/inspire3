#!/usr/bin/env bash

case "${1}" in
    app:id)
        shift 1
        ensure_doctl_is_present
        ensure_jq_is_present
        app_name="${1:-null}"

        [[ "${app_name}" == 'null' ]] \
            && show_error "app name argument required, but missing" \
            && exit 1

        doctl app list --output json \
         | jq -r --arg app_name "${app_name}" '[.[] | select(.spec.name == $app_name) | .id][0]'
    ;;
    app:name)
        shift 1
        app_name="${DIGITALOCEAN_APP_NAME:-null}"
        [[ "${app_name}" == 'null' ]] \
            && show_error "\$APP_NAME is missing but required" \
            && exit 1

        environment="${1:-null}"
        pr_id=${2:-null}

        just cicd resolve "${app_name}" "${environment}" "${pr_id}"
    ;;
    app:delete)
        shift 1
        ensure_doctl_is_present
        ensure_jq_is_present
        app_name="${1:-null}"
        app_id="$(just cicd do app:id "${app_name}")"

        [[ "${app_id}" == 'null' ]] \
            && show_info "App '${app_name}' with id '${app_id}' is already absent" \
            && return 0

        doctl apps delete ${app_id} --force
    ;;
    app:exists)
        shift 1
        ensure_doctl_is_present
        ensure_jq_is_present
        app_name="${1:-null}"
        [[ "${app_name}" == 'null' ]] \
            && show_error "\$APP_NAME is missing but required" \
            && exit 1

        result="$(doctl apps list --output json | jq -r --arg app_name "${app_name}" '[.[] | select(.spec.name == $app_name)][0].id')"

        if [[ "${result}" == 'null' ]]; then
            echo 'false'
        else
            echo 'true'
        fi
    ;;
    app:list)
        shift 1
        ensure_doctl_is_present
        doctl apps list "$@"
        ;;
    app:deploy)
        shift 1
        ensure_doctl_is_present
        ensure_jq_is_present

        environment="${1:-null}"
        [[ "${environment}" == 'pr' && "$#" != '5' ]] \
            && show_error "required arguments: environment, version, db_password, app_exists & pr_id missing" \
            && exit 1

        [[ "${environment}" != 'pr' && "$#" < '4' ]] \
            && show_error "required arguments: environment, version, db_password & app_exists missing" \
            && exit 1

        version="${2:-null}"
        db_password=${3:-null}
        app_exists="${4:-false}"
        pr_id=${5}

        repository="${DOCKER_REPOSITORY:-null}"
        [[ "${repository}" == 'null' ]] \
            && show_error "'\$DOCKER_REPOSITORY' is required but missing" \
            && exit 1

        services="${DIGITALOCEAN_SERVICES:-null}"
        [[ "${services}" == 'null' ]] \
            && show_error "'\$DIGITALOCEAN_SERVICES' is required but missing" \
            && exit 1

        for service in $(echo ${services} | jq -r '.[]'); do
            just cicd do image:version:validate ${version} ${repository} ${service}
        done

        app_name="$(just cicd resolve "${DIGITALOCEAN_APP_NAME:-null}" "${environment}" "${pr_id}")"
        app_spec_template_file="app-spec.${environment}.template.yml"
        app_spec_file="app-spec.${environment}.yml"

        if [[ "${app_exists}" == 'false' ]]; then
            show_notice "App deployment: [initial]"
            echo "           Initial app deployment, notice we will require a another deployments to bring the whole stack up"
        fi

        HIDE_PROJECT_TITLE=true HIDE_COMMAND_TITLE=true \
            just env app-spec inject "${environment}" "${version}" \
                --app-name "${app_name}" \
                --app-domain "$(just cicd resolve "${DIGITALOCEAN_APP_DOMAIN:-null}" "${environment}" "${pr_id}")" \
                --app-domain-zone "$(just cicd resolve "${DIGITALOCEAN_APP_DOMAIN_ZONE:-null}" "${environment}" "${pr_id}")" \
                --app-url "$(just cicd resolve "${APP_URL}" "${environment}" "${pr_id}")" \
                --db-name "$(just cicd resolve "${DB_DATABASE}" "${environment}" "${pr_id}")" \
                --db-user "$(just cicd resolve "${DB_USERNAME}" "${environment}" "${pr_id}")" \
                --db-password "${db_password}" \
                --app-exists "${app_exists}"

        app_spec_validate_result="$(doctl apps spec validate "${app_spec_file}")"

        [[ "${DEBUG:-false}" == 'true' ]] \
            && echo "${app_spec_validate_result}"
        [[ "${DRY_RUN:-false}" == 'true' ]] \
            && return 0

        doctl apps create --spec "${app_spec_file}" --upsert --wait

        if [[ "${app_exists}" == 'true' ]]; then
            just cicd do app:deploy:validation "${app_name}"
        fi
    ;;
    app:deploy:url)
        shift 1
        ensure_doctl_is_present
        ensure_jq_is_present
        app_name="${1:-null}"
        [[ "${app_name}" == 'null' ]] \
            && show_error "app_name parameter is missing, but required" \
            && exit 1

        app_id="$(just cicd do app:id "${app_name}")"
        [[ "${app_id}" == 'null' ]] \
            && echo 'null' \
            && exit 0

        doctl apps get "${app_id}" --output json | jq -r '.[].live_url'
    ;;
    app:deploy:validation)
        shift 1
        ensure_curl_present
        app_name="${1:-null}"
        live_url="$(just cicd do app:deploy:url ${app_name})"

        set +e
        curl -fsSL \
          -H "Accept: application/vnd.api+json" \
          -H "Content-Type: application/vnd.api+json" \
          "${live_url}" &>/dev/null
        result=$?
        set -e

        [[ "${result}" != '0' ]] \
            && show_error "Deployment validation failed, used url: '${live_url}'"

        exit ${result}
    ;;
    db:user:list)
        shift 1
        ensure_doctl_is_present
        ensure_jq_is_present

        do_cluster_id="${1:-null}"
        [[ "${do_cluster_id}" == 'null' ]] \
            && show_error "digitalocean cluster id argument required, but missing" \
            && exit 1

        shift 1
        doctl databases user list "${do_cluster_id}" "$@"
    ;;
    db:user:create)
        shift 1
        ensure_doctl_is_present
        ensure_jq_is_present

        [[ "$#" < '2' ]] \
            && show_error "arguments cluster id and/or user name missing, but missing" \
            && exit 1

        do_cluster_id="${1:-null}"
        user_name="${2:-null}"
        shift 2

        users_as_json="$(just cicd do db:user:list "${do_cluster_id}" --output json)"
        resolved_user_name="$(echo "${users_as_json}" | jq -r --arg db_user "${user_name}" '[.[] | select(.name == $db_user)][0].name')"

        [[ "${resolved_user_name}" == "${user_name}" ]] \
            && show_info "DB user '${user_name}' does already exist in '${do_cluster_id}' cluster" \
            && return 0

        doctl databases user create "${do_cluster_id}" "${user_name}" >&/dev/null
    ;;
    db:user:pw|db:user:password)
        shift 1
        ensure_doctl_is_present
        ensure_jq_is_present

        [[ "$#" < '2' ]] \
            && show_error "arguments cluster id and/or user name missing, but missing" \
            && exit 1

        do_cluster_id="${1:-null}"
        user_name="${2:-null}"
        shift 2

        users_as_json="$(just cicd do db:user:list "${do_cluster_id}" --output json)"
        resolved_password="$(echo "${users_as_json}" | jq -r --arg db_user "${user_name}" '[.[] | select(.name == $db_user)][0].password')"

        [[ "${resolved_password}" == "null" ]] \
            && show_error "DB user password could not be resolved for '${user_name}'" \
            && return 1

        echo "${resolved_password}"
    ;;
    db:user:delete)
        shift 1
        ensure_doctl_is_present
        ensure_jq_is_present

        do_cluster_id="${1:-null}"
        user_name="${2:-null}"
        shift 2

        users_as_json="$(just cicd do db:user:list "${do_cluster_id}" --output json)"
        resolved_user_name="$(echo "${users_as_json}" | jq -r --arg db_user "${user_name}" '[.[] | select(.name == $db_user)][0].name')"

        [[ "${resolved_user_name}" == "null" ]] \
            && show_info "DB user '${user_name}' is already absent in '${do_cluster_id}' cluster" \
            && return 0

        doctl databases user delete "${do_cluster_id}" "${resolved_user_name}" --force
    ;;
    db:list)
        shift 1
        ensure_doctl_is_present
        ensure_jq_is_present
        do_cluster_id="${1:-null}"
        [[ "${do_cluster_id}" == 'null' ]] \
            && show_error "db cluster id argument required, but missing" \
            && exit 1

        doctl databases db list "${do_cluster_id}" "$@"
    ;;
    db:create)
        shift 1
        ensure_doctl_is_present
        ensure_jq_is_present
        do_cluster_id="${1:-null}"
        [[ "${do_cluster_id}" == 'null' ]] \
            && show_error "db cluster id argument required, but missing" \
            && exit 1

        db_name="${2:-null}"
        [[ "${db_name}" == 'null' ]] \
            && show_error "db name argument required, but missing" \
            && exit 1

        set +e
        doctl databases db create "${do_cluster_id}" "$db_name" &>/dev/null
        success=$?
        set -e

        [[ "${success}" != "0" ]] \
            && show_info "db '${db_name}' already exists"
        exit 0
    ;;
    db:delete)
        shift 1
        ensure_doctl_is_present
        ensure_jq_is_present
        do_cluster_id="${1:-null}"
        [[ "${do_cluster_id}" == 'null' ]] \
            && show_error "db cluster id argument required, but missing" \
            && exit 1

        db_name="${2:-null}"
        [[ "${db_name}" == 'null' ]] \
            && show_error "db name argument required, but missing" \
            && exit 1

        doctl databases db delete "${do_cluster_id}" "$db_name" --force &>/dev/null
    ;;
    db:firewall:list)
        shift 1
        ensure_doctl_is_present
        ensure_jq_is_present
        do_cluster_id="${1:-null}"
        [[ "${do_cluster_id}" == 'null' ]] \
            && show_error "db cluster id argument required, but missing" \
            && exit 1
        shift 1
        doctl db firewalls list "${do_cluster_id}" "$@"
    ;;
    db:firewall:add)
        shift 1
        ensure_doctl_is_present
        ensure_jq_is_present
        do_cluster_id="${1:-null}"
        [[ "${do_cluster_id}" == 'null' ]] \
            && show_error "db cluster id argument required, but missing" \
            && exit 1
        shift 1

        type="${1:-null}"
        case ${type} in
            ip_addr|tag|app|droplet)
            ;;
            *)
                show_error "firewall type '${type}' is not supported, use: [ip_addr,tag,app,droplet]"
            ;;
        esac
        shift 1

        value="${1:-null}"
        [[ "${value}" == 'null' ]] \
            && show_error "value is missing but required, but missing" \
            && exit 1
        shift 1

        firewall_id=$(
            just cicd do db:firewall:list $do_cluster_id --output json \
                | jq -r --arg type "${type}" --arg value "${value}" '[.[] | select(.type==$type and .value==$value) ] | first.uuid'
        )

        if [[ "${firewall_id}" != 'null' ]]; then
            [[ "${QUIET:-false}" == 'false' ]] \
                && show_info "Firewall with id '${firewall_id}' and settings '${type}:${value}' is already present"
            return 0
        fi

        doctl databases firewalls append "${do_cluster_id}" --rule "${type}:${value}" "$@"
    ;;
    db:firewall:remove)
        shift 1
        ensure_doctl_is_present
        ensure_jq_is_present
        do_cluster_id="${1:-null}"
        [[ "${do_cluster_id}" == 'null' ]] \
            && show_error "db cluster id argument required, but missing" \
            && exit 1
        shift 1

        type="${1:-null}"
        case ${type} in
            ip_addr|tag|app|droplet)
            ;;
            *)
                show_error "firewall type '${type}' is not supported, use: [ip_addr,tag,app,droplet]"
            ;;
        esac
        shift 1

        value="${1:-null}"
        [[ "${value}" == 'null' ]] \
            && show_error "value is missing but required, but missing" \
            && exit 1
        shift 1

        firewall_id=$(
            just cicd do db:firewall:list $do_cluster_id --output json \
                | jq -r --arg type "${type}" --arg value "${value}" '[.[] | select(.type==$type and .value==$value) ] | first.uuid'
        )

        if [[ "${firewall_id}" == 'null' ]]; then
            [[ "${QUIET:-false}" == 'false' ]] \
                && show_info "firewall_id is already absent"
            return 0
        fi

        doctl db firewalls remove "${do_cluster_id}" --uuid ${firewall_id} "$@"
    ;;
    db:firewall:add:external-ip)
        shift 1
        do_cluster_id="${1:-null}"
        type='ip_addr'
        value="$(just cicd ip:v4:fetch)"

        QUIET='true' just cicd do db:firewall:add ${do_cluster_id} ${type} ${value} --output text
        echo
        show_info "Firewall rule is '${type}:${value}' added/present"
    ;;
    db:firewall:remove:external-ip)
        shift 1
        do_cluster_id="${1:-null}"
        type='ip_addr'
        value="$(just cicd ip:v4:fetch)"

        QUIET='true' just cicd do db:firewall:remove "${do_cluster_id}" "${type}" "${value}"
        show_info "Firewall rule is '${type}:${value}' removed/absent"
    ;;
    image:version:validate)
        shift 1
        ensure_doctl_is_present
        ensure_jq_is_present

        version="${1:-null}"
        [[ "${version}" == 'null' ]] \
            && show_error "version argument required, but missing" \
            && exit 1

        repository="${2:-null}"
        [[ "${repository}" == 'null' ]] \
            && show_error "repository argument required, but missing" \
            && exit 1

        image="${3:-null}"
        [[ "${image}" == 'null' ]] \
            && show_error "image argument required, but missing" \
            && exit 1

        repository_with_tag="$repository/$image"

        set +e
        tags_as_json="$(doctl registry repository list-tags "${repository_with_tag}" --output json)"
        success=$?
        set -e

        [[ "${success}" != "0" ]] \
            && show_error "Could not find version: '${version}' of '${repository_with_tag}'" \
            && exit 1

        image_count="$(echo "${tags_as_json}" \
            | jq --arg version "$version" '[.[] | select(.tag == $version)] | length')"

        if [[ "${image_count}" != '1' ]]; then
            show_error "Could not find version: '${version}' of '${repository_with_tag}'"
            exit 1
        fi
    ;;
    *)
        echo -e "  ${c_red}USAGE:${c_reset} just|j ${CICD_SUBPROJECT_NAME}|ci do [command]"
        echo
        echo -e "  supported commands:\n"
        #       "    |
        echo -e "    app:id [app_name]"
        echo -e "    app:delete [app_name]"
        echo -e "    app:list"
        echo -e "    app:deploy [environment] [version] [db_password] [pr_id*]"
        echo -e "    app:deploy:url [app_name]"
        echo -e "    app:deploy:validation [app_name]"
        echo -e "    db:user:list [do_cluster_id]"
        echo -e "    db:user:create [do_cluster_id] [user_name]"
        echo -e "    db:user:pw [do_cluster_id] [user_name]"
        echo -e "    db:user:delete [do_cluster_id] [user_name]"
        echo -e "    db:list [do_cluster_id]"
        echo -e "    db:create [do_cluster_id] [db_name]"
        echo -e "    db:delete [do_cluster_id] [db_name]"
        echo -e "    db:delete [do_cluster_id] [db_name]"
        echo -e "    db:firewall:list [do_cluster_id]"
        echo -e "    db:firewall:add [do_cluster_id] [type=ip_addr|tag|app|droplet] [value]"
        echo -e "    db:firewall:remove [do_cluster_id] [type=ip_addr|tag|app|droplet] [value]"
        echo -e "    db:firewall:add:external-ip [do_cluster_id]"
        echo -e "    db:firewall:remove:external-ip [do_cluster_id]"
        echo -e "    image:version:validate [version] [repository] [image]"
        echo
        exit 1
    ;;
esac
