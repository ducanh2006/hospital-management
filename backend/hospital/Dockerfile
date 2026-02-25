# Build stage using Maven with Eclipse Temurin JDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy only what is needed for a build (helps layer caching)
COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY src ./src

# Build the fat jar (skip tests for faster builds; remove -DskipTests to run tests)
RUN mvn -B -DskipTests package

## Runtime stage
FROM openjdk:21-jdk-slim
WORKDIR /app

# Expose the application port
EXPOSE 8080

# Create directory for uploaded assets and expose via env override
VOLUME /assets
ENV APP_UPLOAD_DIR=file:/assets

# Copy jar from build stage (uses wildcard to match generated jar)
COPY --from=build /app/target/*.jar ./app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
