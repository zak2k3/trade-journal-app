#!/bin/sh

# Create storage directories at runtime
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/framework/cache
mkdir -p storage/logs
mkdir -p bootstrap/cache

# Set permissions
chmod -R 775 storage bootstrap/cache

# Run Laravel
php artisan serve --host=0.0.0.0 --port=8000