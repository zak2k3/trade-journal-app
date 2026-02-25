FROM php:8.2-cli-alpine

# Install system dependencies
RUN apk add --no-cache git unzip libzip-dev mysql-client && \
    docker-php-ext-install pdo pdo_mysql pdo_sqlite zip bcmath

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy files
COPY . .

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-dev

# Set permissions
RUN chmod -R 775 storage bootstrap/cache

# Expose port
EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]