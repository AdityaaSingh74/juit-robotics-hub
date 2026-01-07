# Build stage
FROM golang:1.25.5-alpine AS builder

WORKDIR /app

# Copy go mod files from server/mail_service
COPY server/mail_service/go.mod .
COPY server/mail_service/go.sum .

# Download dependencies
RUN go mod download

# Copy source code from server/mail_service
COPY server/mail_service/main.go .

# Build the application
RUN go build -o mail-service main.go

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/mail-service .

EXPOSE 3001

CMD ["./mail-service"]
