FROM openjdk:17

WORKDIR /app

COPY .mvn/ .mvn
COPY mvnw pom.xml ./
COPY src ./src

RUN chmod +x mvnw
RUN ./mvnw package -DskipTests

ENV PORT=8080
EXPOSE ${PORT}

# Use JSON array format without JVM arguments
ENTRYPOINT ["java", "-jar", "target/backend-0.0.1-SNAPSHOT.jar"]