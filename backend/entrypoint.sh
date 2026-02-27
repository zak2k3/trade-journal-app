#!/bin/bash

# Create directories
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/framework/cache
mkdir -p storage/logs
mkdir -p bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Run migrations (continue even if some tables exist)
php artisan migrate --force --pretend 2>/dev/null || true
php artisan migrate --force 2>&1 | grep -v "already exists" || true

# Start server
php artisan serve --host=0.0.0.0 --port=10000