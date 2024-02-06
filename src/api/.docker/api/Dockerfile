# syntax=docker/dockerfile:1.4
# /////////////////////////////////////////////////////////////////////
# api-php-base
FROM ubuntu:22.04 as api-php-base

LABEL maintainer="Denny Weiß"

ARG POSTGRES_VERSION=15
ARG CONTAINER_USERNAME=cuser
ARG WWW_DATA_GID=33

LABEL maintainer="Denny Weiß"

ENV DEBIAN_FRONTEND noninteractive \
    TZ=UTC \
    COMPOSER_MAX_PARALLEL_HTTP=24

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN useradd -ms /bin/bash --no-user-group -g $WWW_DATA_GID -u 1337 $CONTAINER_USERNAME

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN mkdir -p /.composer && chmod -R ugo+rw /.composer

COPY ./src/nginx-keyring.gpg /etc/apt/keyrings/nginx-keyring.gpg
COPY ./src/pgdg.gpg /etc/apt/keyrings/pgdg.gpg
COPY ./src/ppa_ondrej_php.gpg /etc/apt/keyrings/ppa_ondrej_php.gpg
ADD ./src/api-base-system-packages.txt /tmp/api-base-system-packages.txt
ADD ./src/api-php8.3-packages.txt /tmp/api-php8.3-packages.txt

RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y \
      curl \
      ca-certificates \
      gnupg2 \
    && echo "deb [signed-by=/etc/apt/keyrings/pgdg.gpg] http://apt.postgresql.org/pub/repos/apt jammy-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && echo "deb [signed-by=/etc/apt/keyrings/ppa_ondrej_php.gpg] https://ppa.launchpadcontent.net/ondrej/php/ubuntu jammy main" > /etc/apt/sources.list.d/ppa_ondrej_php.list \
    && echo "deb [signed-by=/etc/apt/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ jammy unit" >> /etc/apt/sources.list.d/unit.list \
    && echo "deb-src [signed-by=/etc/apt/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ jammy unit" >> /etc/apt/sources.list.d/unit.list \
    && apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y $(cat /tmp/api-base-system-packages.txt) \
    && apt-get install --no-install-recommends --no-install-suggests -y $(cat /tmp/api-php8.3-packages.txt) \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY ./src/php-local.ini /etc/php/8.3/cli/conf.d/99-api.ini
COPY ./src/docker-entrypoint-php.sh /usr/local/bin/docker-entrypoint.sh

RUN mkdir -p /etc/unit/config \
    && mkdir -p /docker-entrypoint.d \
    && setcap "cap_net_bind_service=+ep" /usr/bin/php8.3 \
    && echo "net.core.somaxconn=100000" | tee -a /etc/sysctl.d/99-network-tuning.conf

WORKDIR /var/www/html
RUN chown -R www-data:www-data /var/www \
    && chmod -R ug+rwx /var/www

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
EXPOSE 80
CMD ["unitd", "--no-daemon", "--control", "unix:/var/run/control.unit.sock" ]

# syntax=docker/dockerfile:1.4
ARG DOCKER_IMAGE_PREFIX
ARG DOCKER_IMAGE_BASE_VERSION

# /////////////////////////////////////////////////////////////////////
# api-php-local
FROM api-php-base as api-php-local

RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y php8.3-xdebug \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY src/php-local.ini /etc/php/8.3/cli/conf.d/99-api.ini
COPY src/unit-config-local.json /docker-entrypoint.d

# /////////////////////////////////////////////////////////////////////
# api-php-pre-production
FROM api-php-base as api-php-pre-production

COPY src/php-production.ini /etc/php/8.3/cli/conf.d/99-api.ini
COPY src/unit-config-production.json /docker-entrypoint.d

COPY --from=api-sources --chown=www-data:www-data . ./

RUN composer install -o \
    && echo "php artisan view:cache" \
    && echo "php artisan event:cache" \
    && echo "php artisan route:cache" \
    && echo "php artisan icons:cache"

RUN chown -R www-data:www-data . \
    && chmod -R ug+rw .

# /////////////////////////////////////////////////////////////////////
# api-node-local
FROM ubuntu:22.04 as api-node-base

ARG NODE_VERSION=18
ARG CONTAINER_USERNAME=cuser
ARG WWW_DATA_GID=33

LABEL maintainer="Denny Weiß"

ENV DEBIAN_FRONTEND noninteractive \
    && TZ=UTC

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN useradd -ms /bin/bash --no-user-group -g $WWW_DATA_GID -u 1337 $CONTAINER_USERNAME

COPY ./src/nodesource.gpg /etc/apt/keyrings/nodesource.gpg
COPY ./src/yarn.gpg /etc/apt/keyrings/yarn.gpg

RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y \
      curl \
      ca-certificates\
      gnupg2 \
      gosu \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_VERSION.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && echo "deb [signed-by=/etc/apt/keyrings/yarn.gpg] https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list \
    && apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y \
      nodejs \
      yarn \
    && npm install -g npm \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN mkdir /.yarn-cache  \
    && chmod -R ugo+rw /.yarn-cache \
    && chmod -R ugo+rw /tmp

COPY ./src/docker-entrypoint-node.sh /usr/local/bin/docker-entrypoint.sh

WORKDIR /var/www/html
RUN chown -R www-data:www-data /var/www \
    && chmod -R ug+rwx /var/www

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
EXPOSE 3000

# /////////////////////////////////////////////////////////////////////
# api-node-local
FROM api-node-base as api-node-local

# /////////////////////////////////////////////////////////////////////
# api-node-production
FROM api-node-base as api-node-production

COPY --from=api-php-pre-production --chown=www-data:www-data /var/www/html /var/www/html
RUN yarn install --frozen-lockfile \
    && yarn build \
    && chown -R www-data:www-data ./public

# /////////////////////////////////////////////////////////////////////
# api-php-production
FROM api-php-pre-production as api-php-production
COPY --from=api-node-production --chown=www-data:www-data /var/www/html/public /var/www/html/public

FROM api-php-production as api-php-testing

COPY src/php-local.ini /etc/php/8.3/cli/conf.d/99-api.ini
COPY --from=api-sources --chown=www-data:www-data ./.env ./
