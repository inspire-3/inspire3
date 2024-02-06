# syntax=docker/dockerfile:1.4
FROM joseluisq/static-web-server:2-alpine

RUN mkdir -p /public
COPY --from=sws-sources ./public /public
