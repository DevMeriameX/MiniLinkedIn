pipeline {
    agent any

    environment {
        MAVEN_HOME   = tool 'Maven3' // Installation automatique de Maven
        SCANNER_HOME = tool 'SonarQubeScanner' // Installation de SonarQube Scanner
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
                    // Compilation et génération du fichier .jar sans rejouer les tests
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
        // 4. CONTENEURISATION (Docker Build en parallèle)
        // ==========================================
        stage('4. Docker Build') {
            parallel {
                stage('Docker Build - Backend') {
                    steps {
                        dir('backend') {
                            bat "docker build -t minilinkedin:1.0.0 ."
                        }
                    }
                }
                stage('Docker Build - Frontend') {
                    steps {
                        dir('frontend') {
                            // On construit l'image de production React + Nginx
                            bat "docker build -t minilinkedin-frontend:1.0.0 ."
                        }
                    }
                }
            }
        }

        // ==========================================
        // 5. DÉPLOIEMENT AUTOMATIQUE (Docker Run)
        // ==========================================
        stage('5. Déploiement Automatique') {
            steps {
                echo 'Nettoyage des anciens conteneurs...'
                // Arrêt et suppression des anciens conteneurs s'ils existent (évite les conflits)
                bat "docker stop minilinkedin-app react-app 2>nul || exit 0"
                bat "docker rm minilinkedin-app react-app 2>nul || exit 0"
                
                echo 'Déploiement du Backend sur le port 8081...'
                bat "docker run -d --name minilinkedin-app --add-host=host.docker.internal:host-gateway -p 8081:8081 minilinkedin:1.0.0"

                echo 'Déploiement du Frontend React sur le port 5173...'
                // On mappe le port 5173 de votre machine Windows sur le port 80 de Nginx
                bat "docker run -d --name react-app -p 5173:80 minilinkedin-frontend:1.0.0"
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
                bat "C:\\apache-jmeter-5.6.3\\bin\\jmeter.bat -n -t scenario.jmx -l rapports/resultats.jtl"
                
                // Affiche les graphiques JMeter directement dans Jenkins
                perfReport sourceDataFiles: 'rapports/resultats.jtl'
            }
        }
    }
}