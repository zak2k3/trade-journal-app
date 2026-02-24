# Use PHP CLI image
FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libzip-dev \
    default-mysql-client \
    sqlite3 \
    libsqlite3-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite zip bcmath \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy the entire app (composer.json, artisan, everything)
COPY . .

# Run Composer as root (to avoid permissions issues)
RUN composer install --optimize-autoloader --no-dev --prefer-dist --no-interaction --ignore-platform-reqs

# Set proper permissions for Laravel
RUN chown -R www-data:www-data storage bootstrap/cache vendor

# Expose port
EXPOSE 8000

# Start Laravel
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]