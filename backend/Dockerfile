# Base PHP image
FROM php:8.2-cli

# Install system deps
RUN apt-get update && apt-get install -y git unzip libzip-dev

# Set working directory
WORKDIR /var/www

# Copy everything including vendor
COPY . .

# Set permissions (important for Laravel)
# RUN chown -R www-data:www-data storage bootstrap/cache vendor

# Expose port
EXPOSE 8000

# Start PHP built-in server
CMD php artisan serve --host=0.0.0.0 --port=8000