# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Build Go Backend
FROM golang:1.23-alpine AS backend-builder
WORKDIR /app

ENV CGO_ENABLED=0 \
    GOOS=linux

COPY backend/ ./
RUN go mod tidy
RUN go build -ldflags="-s -w" -o /app/films-server ./cmd/server

# Stage 3: Minimal Runtime
FROM alpine:3.20
WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata \
    && mkdir -p /data /app/frontend/dist

COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
COPY --from=backend-builder /app/films-server /app/films-server
COPY seed.csv /app/seed.csv

ENV PORT=7070 \
    DB_PATH=/data/films.db \
    SEED_CSV=/app/seed.csv \
    STATIC_DIR=/app/frontend/dist

EXPOSE 7070
VOLUME ["/data"]

CMD ["/app/films-server"]
