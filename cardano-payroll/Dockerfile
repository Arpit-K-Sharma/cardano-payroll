FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy Maven wrapper and pom first for better layer caching
COPY pom.xml .
COPY mvnw mvnw.cmd ./
COPY .mvn .mvn

# Download dependencies (uses pom.xml and wrapper)
RUN ./mvnw -q -B dependency:go-offline

# Copy the rest of the source
COPY src ./src

# Build the application
RUN ./mvnw -q -B clean package -DskipTests

# ------------------------------
# Runtime image
# ------------------------------
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/cardano-payroll-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]


