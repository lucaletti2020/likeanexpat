#!/bin/bash
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Seeding content..."
python manage.py seed

echo "Starting server..."
exec daphne -b 0.0.0.0 -p ${PORT:-8000} config.asgi:application
