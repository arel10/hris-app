# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git ca-certificates

# Download dependencies first (layer cache)
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" -o /app/server ./cmd/api

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM alpine:latest

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

# Copy binary and migration files
COPY --from=builder /app/server ./server
COPY --from=builder /app/migrations ./migrations

# Non-root user for security
RUN adduser -D -g '' appuser
USER appuser

EXPOSE 8080

CMD ["./server"]

