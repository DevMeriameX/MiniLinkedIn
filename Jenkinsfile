pipeline {
    agent any

    environment {
        MAVEN_HOME   = tool 'Maven3' // Utilise ton installation automatique appelée Maven3
        SCANNER_HOME = tool 'SonarQubeScanner' // /!\ Assure-toi d'avoir configuré un SonarQube Scanner dans Jenkins sous ce nom
    }

    stages {
        
        // ==========================================
        // 1. TESTS UNITAIRES (Parallèle)
        // ==========================================
        stage('1. Tests Unitaires') {
            parallel {
                stage('Backend - JUnit') {
                    steps {
                        dir('backend') {
                            bat "${MAVEN_HOME}/bin/mvn test"
                        }
                    }
                }
                stage('Frontend - Tests') {
                    steps {
                        dir('frontend') {
                            bat "npm ci"
                            bat "npm run test"
                        }
                    }
                }
            }
        }

        // ==========================================
        // 2. COMPILATION & PACKAGING
        // ==========================================
        stage('2. Build & Package') {
            steps {
                dir('backend') {
                    // On compile et on génère le fichier .jar/.war exigé, sans rejouer les tests
                    bat "${MAVEN_HOME}/bin/mvn clean package -DskipTests"
                }
            }
        }

        // ==========================================
        // 3. ANALYSE SÉCURITÉ (SonarQube)
        // ==========================================
         stage('3. Analyse Sécurité & Qualité') {
            steps {
                withSonarQubeEnv('SonarQubeServer') {
                    dir('backend') {
                        bat """
                            ${SCANNER_HOME}/bin/sonar-scanner \
                            -Dsonar.projectKey=MiniLinkedIn \
                            -Dsonar.projectName=MiniLinkedIn \
                            -Dsonar.projectVersion=1.0.0 \
                            -Dsonar.sources=src/main/java \
                            -Dsonar.tests=src/test/java \
                            -Dsonar.java.binaries=target/classes \
                            -Dsonar.java.libraries=target/**/*.jar \
                            -Dsonar.java.test.binaries=target/test-classes \
                            -Dsonar.java.test.libraries=target/**/*.jar \
                            -Dsonar.exclusions=**/generated/** \
                            -Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml \
                            -Dsonar.junit.reportPaths=target/surefire-reports
                        """
                    }
                }
            }
         }

        // Bloque le pipeline si le rapport SonarQube échoue (Quality Gate)
        stage("3b. Quality Gate") {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // ==========================================
        // 4. CONTENEURISATION (Docker Build)
        // ==========================================
        stage('4. Docker Build') {
            steps {
                dir('backend') {
                    // Construction de l'image Docker de MiniLinkedIn à partir du Dockerfile
                    bat "docker build -t minilinkedin:1.0.0 ."
                }
            }
        }

        // ==========================================
        // 5. DÉPLOIEMENT AUTOMATIQUE (Docker Run)
        // ==========================================
        stage('5. Déploiement Automatique') {
            steps {
                // Arrêt et suppression de l'ancien conteneur s'il existe pour libérer le port 8080
                bat "docker stop minilinkedin-app || true"
                bat "docker rm minilinkedin-app || true"
                
                // Lancement du nouveau conteneur en arrière-plan
                bat "docker run -d --name minilinkedin-app -p 8080:8080 minilinkedin:1.0.0"
            }
        }

        // ==========================================
        // 6. TESTS DE PERFORMANCE (JMeter)
        // ==========================================
        stage('6. Tests de Performance') {
            steps {
                // On nettoie l'ancien dossier s'il existe, puis on le crée pour stocker les résultats
                bat "if exist rapports rmdir /s /q rapports"
                bat "mkdir rapports"
                
                // On lance JMeter en mode console qui va cibler l'application fraîchement déployée
                bat "jmeter -n -t scenario.jmx -l rapports/resultats.jtl"
                
                // Affiche les graphiques JMeter directement dans Jenkins
                perfReport sourceDataFiles: 'rapports/resultats.jtl'
            }
        }
    }
}