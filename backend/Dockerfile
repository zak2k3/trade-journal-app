FROM php:8.2-cli-alpine

RUN apk add --no-cache git unzip libzip-dev mysql-client sqlite-dev && \
    docker-php-ext-install pdo pdo_mysql pdo_sqlite zip bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --optimize-autoloader --no-dev

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

CMD ["/entrypoint.sh"]