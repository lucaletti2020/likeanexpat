# Stage 1: build React app
FROM node:20-slim AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Django backend
FROM python:3.12-slim
WORKDIR /backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
# Copy built React app so WhiteNoise can serve it
COPY --from=frontend /app/dist ./frontend_dist
RUN python manage.py collectstatic --noinput
EXPOSE 8000
CMD daphne -b 0.0.0.0 -p ${PORT:-8000} config.asgi:application
