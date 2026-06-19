# 1. Image de base avec Java (OpenJDK 17 ou la version que vous utilisez)
FROM openjdk:17-jdk-slim

# 2. Dossier de travail à l'intérieur du conteneur
WORKDIR /app

# 3. Copier le fichier JAR généré par l'étape Maven (Build & Package)
COPY target/*.jar app.jar

# 4. Exposer le port de l'application (généralement 8080)
EXPOSE 8081

# 5. Commande pour lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]