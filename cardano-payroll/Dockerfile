# Multi-stage build for Spring Boot application
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests


# Final runtime image with Java + Node.js support
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install Node.js and npm alongside Java runtime
RUN apk add --no-cache nodejs npm curl && \
    # Verify Node.js installation
    node --version && npm --version

# Copy the built JAR from the build stage
COPY --from=build /app/target/cardano-payroll-0.0.1-SNAPSHOT.jar app.jar


# Copy scripts directory and package.json for ADA transaction processing
COPY ../scripts/ ./scripts/
COPY ../scripts/package*.json ./scripts/

# Install Node.js dependencies for Cardano scripts
RUN cd /app/scripts && npm install --production && \
    # Make scripts executable
    chmod +x *.js && \
    # Clean up npm cache to reduce image size
    npm cache clean --force


# Copy Docker-specific configuration to resources
COPY ../docker/application-docker.properties ./src/main/resources/application-docker.properties

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

# Expose the port the app runs on
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1


# Run the application with Docker profile
ENTRYPOINT ["java", "-Dspring-boot.run.profiles=docker", "-jar", "app.jar"]

