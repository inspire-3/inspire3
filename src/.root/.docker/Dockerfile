# syntax=docker/dockerfile:1.4
# /////////////////////////////////////////////////////////////////////
# root
FROM ubuntu:22.04 as root-base

ARG NODE_VERSION=18
ARG CONTAINER_USERNAME=cuser
ARG WWW_DATA_GID=33

LABEL maintainer="Denny Weiß"

ENV DEBIAN_FRONTEND noninteractive \
    &&TZ=UTC

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN useradd -ms /bin/bash --no-user-group -g $WWW_DATA_GID -u 1337 $CONTAINER_USERNAME

COPY ./src/nodesource.gpg /etc/apt/keyrings/nodesource.gpg
COPY ./src/yarn.gpg /etc/apt/keyrings/yarn.gpg

WORKDIR /var/www/html
RUN chown -R www-data:www-data /var/www \
    && chmod -R ug+rwx /var/www

RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y \
      curl \
      gnupg2 \
      ca-certificates \
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
    && chmod -R ugo+rw /tmp \
    && mkdir /node_modules \
    && chown -R www-data:www-data /node_modules \
    && chmod -R ugo+rw /node_modules

COPY ./src/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

STOPSIGNAL SIGTERM

# /////////////////////////////////////////////////////////////////////
# root-builder
FROM root-base as root-builder

WORKDIR /var/www/html

COPY --from=root-sources --chown=www-data:www-data package.json ./
COPY --from=root-sources --chown=www-data:www-data yarn.lock ./

RUN NO_YARN_POST_INSTALL=true yarn --modules-folder /node_modules install --frozen-lockfile

# /////////////////////////////////////////////////////////////////////
# root-local
FROM root-base as root-local

WORKDIR /var/www/html

COPY --from=root-builder --chown=www-data:www-data /node_modules /node_modules
COPY --from=root-sources --chown=www-data:www-data package.json ./
COPY --from=root-sources --chown=www-data:www-data yarn.lock ./
