# syntax=docker/dockerfile:1.4
ARG DOCKER_IMAGE_PREFIX
ARG DOCKER_IMAGE_BASE_VERSION

# /////////////////////////////////////////////////////////////////////
# api-php-local
FROM ${DOCKER_IMAGE_PREFIX}/api:${DOCKER_IMAGE_BASE_VERSION:-base-latest} as api-php-local

RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y php8.3-xdebug \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY src/php-local.ini /etc/php/8.3/cli/conf.d/99-api.ini
COPY src/unit-config-local.json /docker-entrypoint.d

# /////////////////////////////////////////////////////////////////////
# api-php-pre-production
FROM ${DOCKER_IMAGE_PREFIX}/api:${DOCKER_IMAGE_BASE_VERSION:-base-latest} as api-php-pre-production

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
FROM ${DOCKER_IMAGE_PREFIX}/api-node:${DOCKER_IMAGE_BASE_VERSION:-base-latest} as api-node-local

# /////////////////////////////////////////////////////////////////////
# api-node-production
FROM ${DOCKER_IMAGE_PREFIX}/api-node:${DOCKER_IMAGE_BASE_VERSION:-base-latest} as api-node-production

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
