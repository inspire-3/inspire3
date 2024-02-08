# syntax=docker/dockerfile:1.4
ARG DOCKER_IMAGE_PREFIX
ARG DOCKER_IMAGE_BASE_VERSION

# /////////////////////////////////////////////////////////////////////
# frontend-local
FROM ${DOCKER_IMAGE_PREFIX}/frontend:${DOCKER_IMAGE_BASE_VERSION:-base-latest} as frontend-local

# /////////////////////////////////////////////////////////////////////
# frontend-production
FROM ${DOCKER_IMAGE_PREFIX}/frontend:${DOCKER_IMAGE_BASE_VERSION:-base-latest} as frontend-production

WORKDIR /var/www/html
RUN chown -R www-data:www-data /var/www \
    && chmod -R ug+rwx /var/www

COPY --from=frontend-sources --chown=www-data:www-data . ./
RUN yarn install --frozen-lockfile
RUN chown -R cuser:www-data /var/www \
    && chmod -R ug+rwx /var/www
