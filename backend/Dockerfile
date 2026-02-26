FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpq-dev \
    postgresql-client \
    && docker-php-ext-install zip pdo pdo_pgsql

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy ALL application files first (including artisan)
COPY . .

# Install dependencies WITHOUT running post-install scripts
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Run post-install scripts manually
RUN php artisan package:discover --ansi

# Run database migrations
RUN php artisan migrate --force

# Expose port
EXPOSE 10000

# Start the application
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=10000"]