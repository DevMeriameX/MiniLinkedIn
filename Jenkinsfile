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
                // 'SonarQubeServer' doit être le nom configuré dans Administrer Jenkins > Système
                withSonarQubeEnv('SonarQubeServer') {
                    dir('backend') {
                        // On lance le scanner pour inspecter le code
                        bat "${SCANNER_HOME}/bin/sonar-scanner -Dsonar.projectKey=MiniLinkedIn -Dsonar.projectName=MiniLinkedIn -Dsonar.sources=src -Dsonar.java.binaries=target/classes"
                    }
                }
            }
        }

        // Bloque le pipeline si le rapport SonarQube échoue (Quality Gate)
        stage("3b. Quality Gate") {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // ==========================================
        // 4. TESTS DE PERFORMANCE (JMeter)
        // ==========================================
        stage('4. Tests de Performance') {
            steps {
                // On crée un dossier pour stocker les résultats
                bat "mkdir rapports"
                // On lance JMeter en mode console (remplace 'scenario.jmx' par ton fichier de test s'il a un autre nom)
                bat "jmeter -n -t scenario.jmx -l rapports/resultats.jtl"
                
                // Affiche les graphiques JMeter directement dans Jenkins
                perfReport sourceDataFiles: 'rapports/resultats.jtl'
            }
        }
    }
}