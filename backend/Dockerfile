FROM php:8.2-cli-alpine

RUN apk add --no-cache git unzip libzip-dev mysql-client && \
    docker-php-ext-install pdo pdo_mysql zip bcmath

COPY --from=composer:2poser /usr/bin/composer

WORK /usr/bin/comDIR /var/www

COPY . .

RUN composer install --optimize-autoloader --no-dev

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

CMD ["/entrypoint.sh"]