# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy Maven files from cardano-payroll
COPY cardano-payroll/pom.xml .
COPY cardano-payroll/.mvn .mvn
COPY cardano-payroll/mvnw .

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source
COPY cardano-payroll/src ./src

# Build
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install Node.js
RUN apk add --no-cache nodejs npm

# Copy JAR
COPY --from=build /app/target/*.jar app.jar

# Copy scripts from ROOT (not cardano-payroll/scripts)
COPY scripts ./scripts

# Install Node dependencies
WORKDIR /app/scripts
RUN npm ci --production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]