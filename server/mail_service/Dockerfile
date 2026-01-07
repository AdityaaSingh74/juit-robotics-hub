# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install ca-certificates for HTTPS
RUN apk add --no-cache ca-certificates

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o mail-service .

# Runtime stage
FROM alpine:3.18

WORKDIR /root/

# Install ca-certificates for HTTPS in runtime
RUN apk add --no-cache ca-certificates

# Copy binary from builder
COPY --from=builder /app/mail-service .

# Create .env file at runtime (will be overridden by environment variables)
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Run the application
CMD ["./mail-service"]
