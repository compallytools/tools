FROM dunglas/frankenphp:1-php8.4

ARG USER_ID=1000
ARG GROUP_ID=1000

RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip curl bash \
    && rm -rf /var/lib/apt/lists/*

RUN install-php-extensions pdo_pgsql intl zip opcache apcu xdebug

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Symfony CLI
RUN curl -sS https://get.symfony.com/cli/installer | bash \
    && mv /root/.symfony5/bin/symfony /usr/local/bin/symfony \
    && rm -rf /root/.symfony5

RUN cp "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"
COPY conf.d/app.ini $PHP_INI_DIR/conf.d/zz-app.ini

# Utilisateur non-root aligné sur l'utilisateur hôte
RUN groupadd -o -g ${GROUP_ID} app \
    && useradd -o -m -u ${USER_ID} -g ${GROUP_ID} -s /bin/bash app \
    && setcap CAP_NET_BIND_SERVICE=+eip /usr/local/bin/frankenphp \
    && chown -R app:app /data /config /app

ENV SERVER_NAME=":80" \
    COMPOSER_ALLOW_SUPERUSER=0 \
    COMPOSER_HOME=/home/app/.composer

USER app
WORKDIR /app
