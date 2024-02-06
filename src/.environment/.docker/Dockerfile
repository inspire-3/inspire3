# syntax=docker/dockerfile:1.4
# /////////////////////////////////////////////////////////////////////
# environment-local
FROM ubuntu:22.04 as environment-local

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

RUN mkdir -p /.yarn-cache \
    && chmod -R ugo+rw /.yarn-cache \
    && chmod -R ugo+rw /tmp

COPY ./src/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

STOPSIGNAL SIGTERM

# /////////////////////////////////////////////////////////////////////
# environment-builder
FROM environment-local as environment-builder

WORKDIR /environment

COPY --from=environment-sources --chown=www-data:www-data ./src ./src
COPY --from=environment-sources --chown=www-data:www-data package.json ./
COPY --from=environment-sources --chown=www-data:www-data yarn.lock ./

RUN yarn install --frozen-lockfile
RUN chown -R www-data:www-data /environment
RUN chmod ugo+x /environment/src/environment.mjs

FROM environment-local as environment-production

COPY --from=environment-builder --chown=www-data:www-data /environment /environment

WORKDIR /var/www/html
RUN chown -R www-data:www-data /var/www \
    && chmod -R ug+rwx /var/www

