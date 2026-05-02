#!/bin/bash
set -e
echo "Starting server..."
exec daphne -b 0.0.0.0 -p ${PORT:-8000} config.asgi:application
