# 🏥 Healthcare Management Platform for Clinical Operations

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Healthcare%20Digital%20Twin-blue?style=for-the-badge&logo=heartbeat" alt="Platform Banner" />
  <img src="https://img.shields.io/badge/Architecture-Microservices-brightgreen?style=for-the-badge&logo=spring" alt="Microservices Architecture" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react" alt="React Vite" />
  <img src="https://img.shields.io/badge/Backend-Spring%20Boot%203.x-6DB33F?style=for-the-badge&logo=springboot" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/AI Engine-Python%20Flask%20%7C%20Scikit--Learn-3776AB?style=for-the-badge&logo=python" alt="Python AI Engine" />
  <img src="https://img.shields.io/badge/Auth-Keycloak%20OAuth2-4D90FE?style=for-the-badge&logo=redhat" alt="Keycloak Auth" />
  <img src="https://img.shields.io/badge/Streaming-Apache%20Kafka-231F20?style=for-the-badge&logo=apachekafka" alt="Apache Kafka" />
</p>

---

## 📌 Executive Summary

The **Healthcare Management Platform for Clinical Operations & Digital Health Twin** is a modern, enterprise-grade clinical management system. It pairs real-time **Digital Twin modeling** with predictive **Artificial Intelligence** and streaming telemetry to deliver real-time patient monitoring, predictive risk scoring (diabetes, heart disease, vital anomalies), automated clinical care plans, and granular consent management.

Engineered with a **cloud-native microservice architecture**, the platform decouples business domains into specialized Spring Boot services, orchestrated via **Spring Cloud Netflix Eureka** and routed through a resilient **Spring Cloud API Gateway** with **Keycloak OAuth2 JWT authentication**.

---

## 👥 Project Contributors

| Contributor Name | GitHub Profile | Project Role |
| :--- | :--- | :--- |
| **Gnaneswar** | [@gnaneswar666](https://github.com/gnaneswar666) | 👑 **Team Leader** |
| **Keerthi** | [@keerthi4242](https://github.com/keerthi4242) | 🤝 **Team Member** |
| **Nishikant Dalal** | [@NishikantDalal20](https://github.com/NishikantDalal20) | 🤝 **Team Member** |
| **Santhosh** | [@santhosh2007-art](https://github.com/santhosh2007-art) | 🤝 **Team Member** |
| **Srija Thota** | [@srijathota5323](https://github.com/srijathota5323) | 🤝 **Team Member** |

---

## 🚀 Key Highlights & Capabilities

- 🧬 **Digital Health Twin Technology**: Dynamic 360° virtual representation of patient vitals, biometric baselines, historical diagnostics, and personalized risk profiles.
- 🤖 **AI-Driven Clinical Risk Prediction**: Machine learning models providing real-time risk scores for Diabetes, Cardiovascular Disease, and Vital Signs deterioration.
- ⚡ **Real-Time Stream Processing**: Kafka-powered streaming architecture for continuous vital sign telemetry, instant threshold breaches, and continuous anomaly detection.
- 🔍 **Explainable AI (XAI)**: SHAP-based model explanations for clinicians, delivering transparent visual feature importance for AI recommendations.
- 🔒 **Keycloak RBAC & OAuth2**: Fine-grained role-based access control (RBAC) supporting distinct portals for **Administrators**, **Clinicians/Doctors**, and **Patients**.
- 📋 **Care Plan Generation**: Automated and clinician-curated care plans with dynamic recommendations based on patient vitals and predictive diagnostic output.
- 🛡️ **Patient Consent Governance**: Comprehensive patient consent tracking granting or revoking health data visibility to clinical providers.

---

## 📐 System Architecture

The ecosystem consists of **17 Spring Boot Microservices**, a **Flask AI Prediction Engine**, a **React 19 Vite SPA**, **Apache Kafka**, and **Keycloak Identity Broker**.

```mermaid
flowchart TD
    subgraph Client Layer
        UI["💻 React 19 + Vite Frontend SPA (healthtwin-ui)<br/>Port: 5173"]
    end

    subgraph Identity & Gateway Layer
        KC["🔐 Keycloak Auth Broker<br/>Port: 9090"]
        GW["🌐 Spring Cloud API Gateway<br/>Port: 8089"]
        EUREKA["🔎 Eureka Service Discovery<br/>Port: 8761"]
    end

    subgraph Microservice Mesh
        AUTH["Auth Service<br/>Port: 8085"]
        PATIENT["Medisphere Patient Service<br/>Port: 8081"]
        TWIN["HealthTwin Service<br/>Port: 8082"]
        VITAL["Vital Service<br/>Port: 8083"]
        CONSENT["Consent Service<br/>Port: 8084"]
        DIAG["Diagnostic Service<br/>Port: 8087"]
        AUDIT["Audit Service<br/>Port: 8088"]
        EXPLAIN["Explanation Service<br/>Port: 9093"]
        SIM["Simulation Service<br/>Port: 9094"]
        AIMODEL["AI Model Registry<br/>Port: 9095"]
        DIABETES["Diabetes Service<br/>Port: 9096"]
        DOCTOR["Doctor Service<br/>Port: 9098"]
        ALERT["Alert Service<br/>Port: 9191"]
        ANOMALY["AI Anomaly Service<br/>Port: 9192"]
        CARE["CarePlan Service<br/>Port: 9193"]
        AIPRED["AI Predict Service<br/>Port: 8086"]
    end

    subgraph AI Engine & Telemetry
        FLASK["🐍 Flask AI Engine (Medisphere_AI)<br/>Port: 5000"]
        KAFKA["⚡ Apache Kafka Event Bus<br/>Port: 9092"]
    end

    UI -->|1. Authenticate| KC
    UI -->|2. API Requests + Bearer JWT| GW
    GW <-->|Service Discovery| EUREKA
    Microservice Mesh <-->|Register / Discover| EUREKA

    GW --> AUTH
    GW --> PATIENT
    GW --> TWIN
    GW --> VITAL
    GW --> CONSENT
    GW --> DIAG
    GW --> EXPLAIN
    GW --> SIM
    GW --> AIMODEL
    GW --> DIABETES
    GW --> DOCTOR
    GW --> ALERT
    GW --> ANOMALY
    GW --> CARE
    GW --> AIPRED

    VITAL -->|Publish Vitals| KAFKA
    KAFKA -->|Consume Streams| TWIN
    KAFKA -->|Consume Vitals| ANOMALY

    AIPRED <-->|ML Inference| FLASK
    AIMODEL <-->|Model Registry| FLASK
```

---

## 🗂️ Microservices Directory & Port Registry

| Service Name | Port | Route Prefix | Primary Responsibilities |
| :--- | :---: | :---: | :--- |
| **Eureka Server** | `8761` | `/` | Central Service Discovery and Registry Server |
| **API Gateway** | `8089` | `/` | Spring Cloud Gateway, Routing, JWT Validation & CORS |
| **Medisphere (Patient)** | `8081` | `/patient/**` | Patient Registration, Demographics, Profile Lifecycle |
| **HealthTwin Service** | `8082` | `/twin/**` | Digital Twin Patient State Aggregation & Vital Consumer |
| **Vital Service** | `8083` | `/vital/**` | Vital Telemetry Ingestion & Kafka Event Producer |
| **Consent Service** | `8084` | `/consent/**` | Patient Data Privacy, Granular Consent Rules |
| **Auth Service** | `8085` | `/auth/**` | Keycloak Identity Synchronization & User Profile Mapping |
| **AI Predict Service** | `8086` | `/predict/**` | Spring Boot AI Bridge to Flask Predictor |
| **Diagnostic Service** | `8087` | `/diagnostic/**` | Laboratory Tests, Diagnostics, Clinical Records |
| **Audit Service** | `8088` | `/audit/**` | HIPAA & Regulatory Access Logging |
| **Explanation Service** | `9093` | `/explanations/**` | SHAP/LIME Explainable AI Insights for Risk Predictions |
| **Simulation Service** | `9094` | `/simulation/**` | What-If Clinical Trajectory & Outcome Simulations |
| **AI Model Service** | `9095` | `/model/**` | ML Model Versioning, Metrics, and Retraining Triggers |
| **Diabetes Service** | `9096` | `/diabetes/**` | Specialized Diabetes Risk Monitoring & Metrics |
| **Doctor Service** | `9098` | `/doctor/**` | Clinician Workflows, Patient Assignment, Consult Notes |
| **Alert Service** | `9191` | `/api/alerts/**` | Vital Threshold Alert Generation & Notification Dispatch |
| **AI Anomaly Service** | `9192` | `/anomaly/**` | Real-time Vital Stream Anomaly Detection Engine |
| **CarePlan Service** | `9193` | `/careplan/**` | Personalized Care Plan Creation & Recommendation Engine |
| **Flask AI Engine** | `5000` | Direct / Internal | Python Flask ML Model Serving (Scikit-Learn, Pandas) |

---

## 🎭 System User Roles & Permissions Matrix

The platform defines three distinct user personas, enforced via **Keycloak OAuth2 JWT Roles**:

| Role Avatar | Persona | Keycloak Role | Scope & Permissions | Key Operational Capabilities |
| :---: | :--- | :--- | :--- | :--- |
| 👑 | **Administrator** | `ROLE_ADMIN` | **System-Wide Full Access** | • Onboard & manage Doctor and Patient accounts.<br/>• Assign patients to attending doctors.<br/>• Access systemic Health Twin metrics & microservice status.<br/>• Manage AI model registry, trigger retraining & monitor audit logs. |
| 🩺 | **Doctor / Clinician** | `ROLE_DOCTOR` | **Clinical & Assigned Patient Access** | • Access assigned patients' 360° Medical Profiles & Health Twins.<br/>• Trigger real-time AI risk predictions (Heart/Diabetes).<br/>• Review SHAP Explainable AI feature visualizations.<br/>• Formulate, edit, and assign personalized clinical Care Plans.<br/>• Monitor immediate vital anomaly triggers & alert notifications. |
| 👤 | **Patient** | `ROLE_PATIENT` | **Personal Health Portal Access** | • View personal Digital Health Twin, vitals, BMI & biometrics.<br/>• Manage granular consent rules (grant/revoke doctor data access).<br/>• Review personal AI disease risk scores & patient-friendly insights.<br/>• Track active Care Plan tasks, medications & lifestyle targets. |

---

## 🖥️ Portal Experiences

### 👑 1. Administrator Workspace
- **System Dashboard**: Operational metrics, total active patients, doctor assignments, and active alerts.
- **Microservice & Model Registry**: Monitor AI model versions, predictive metrics, and anomaly statistics.
- **Identity & Access Management**: Manage doctor/patient accounts and Keycloak role bindings.
- **Digital Twin Administration**: Aggregate cross-system Health Twin status and telemetry feeds.

### 🩺 2. Clinician / Doctor Workspace
- **Patient 360° Command Center**: Complete unified medical view containing historical vitals, diagnosis logs, active care plans, and risk metrics.
- **AI Risk Analytics & XAI**: Review predictive risk percentages (Heart Disease, Diabetes) alongside SHAP explanation charts detailing underlying risk factors.
- **Care Plan Studio**: Create, edit, and assign custom treatment protocols to assigned patients.
- **Real-Time Alert Board**: Monitor active physiological anomaly triggers and critical vitals warnings.

### 👤 3. Patient Workspace
- **Personal Health Twin Dashboard**: Interactive visual metrics for height, weight, BMI, blood group, vital signs, and overall health status.
- **Consent Governance Center**: Grant or revoke data sharing permissions for attending healthcare providers.
- **Personal AI Risk Insights**: View individualized risk assessments and medical explanations in patient-friendly terms.
- **Care Plan Action Center**: Track prescribed lifestyle modifications, medications, and clinical recommendations.

---

## 🛠️ Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend UI** | React 19, Vite 8, Framer Motion 12, Tailwind CSS 4, Lucide React, Recharts, Keycloak JS |
| **API Gateway & Discovery**| Spring Cloud API Gateway (WebFlux), Spring Cloud Netflix Eureka |
| **Backend Services** | Java 17, Spring Boot 3.x, Spring Data JPA, Spring Security OAuth2 Resource Server |
| **AI / ML Pipeline** | Python 3.10+, Flask, Scikit-Learn, Pandas, NumPy, SHAP |
| **Messaging & Streaming** | Apache Kafka, Spring Kafka |
| **Security & Identity** | Keycloak 26 (OAuth2 / OIDC, JWT Tokens, Role-Based Access Control) |
| **Databases & Persistence**| PostgreSQL / MySQL / H2, Hibernate ORM |
| **Build Tools** | Apache Maven 3.8+, Node.js 20+, npm |

---

## ⚡ Getting Started & Installation

> [!IMPORTANT]
> Ensure you have **Java 17+**, **Maven 3.8+**, **Node.js 20+**, **Python 3.10+**, **Docker** (optional, for Kafka & Keycloak), and **Git** installed on your system.

### Step 1: Clone the Repository
```bash
git clone https://github.com/gnaneswar666/Healthcare-Management-Platform-for-Clinical-Operations-Group-2.git
cd Healthcare-Management-Platform-for-Clinical-Operations-Group-2
```

---

### Step 2: Infrastructure Setup (Kafka & Keycloak)

1. **Start Keycloak Identity Server**:
   Ensure Keycloak is running on `http://localhost:9090` with the realm `healthtwin` configured.
2. **Start Apache Kafka**:
   Ensure Kafka broker is running on `localhost:9092` with the required vital telemetry topics created.

---

### Step 3: Run the AI Prediction Engine (Python Flask)

```bash
cd Healthcare_frontend/Medisphere_AI
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python predictor/app.py
```
*The Flask AI Engine will start serving predictions on `http://localhost:5000`.*

---

### Step 4: Launch Microservices (Backend)

1. **Start Eureka Server (Service Discovery)**:
   ```bash
   cd HealthCare_BackEnd/eurekaServer
   mvn spring-boot:run
   ```
   *Verify Eureka Dashboard at `http://localhost:8761`.*

2. **Start API Gateway**:
   ```bash
   cd HealthCare_BackEnd/ApiGateway
   mvn spring-boot:run
   ```
   *API Gateway starts on `http://localhost:8089`.*

3. **Start Core Microservices**:
   Run each microservice in sequence (or launch via your IDE / Docker Compose):
   ```bash
   # Example: Launching Vital Service
   cd HealthCare_BackEnd/VitalService
   mvn spring-boot:run
   ```

---

### Step 5: Launch Frontend (React 19 + Vite)

```bash
cd Healthcare_frontend/healthtwin-ui
npm install
npm run dev
```
*Access the Web Application in your browser at `http://localhost:5173`.*

---

## 📁 Repository Structure

```
HealthCare/
├── README.md                                          # Main Project Overview & Setup Guide
├── HealthCare_BackEnd/                                 # 17 Spring Boot Microservices
│   ├── README.md                                      # Microservices Architecture & Port Mapping
│   ├── eurekaServer/                                  # Eureka Service Discovery (Port: 8761)
│   ├── ApiGateway/                                    # Spring Cloud API Gateway (Port: 8089)
│   ├── auth-service/                                  # Keycloak Auth & Profile Sync (Port: 8085)
│   ├── Medisphere/                                    # Patient Management Service (Port: 8081)
│   ├── HealthTwin/                                    # Digital Health Twin Service (Port: 8082)
│   ├── VitalService/                                  # Telemetry Ingestion & Kafka Producer (Port: 8083)
│   ├── consestService/                                # Patient Privacy & Consent Service (Port: 8084)
│   ├── ai-predict/                                    # AI Prediction Service Bridge (Port: 8086)
│   ├── diagnostic-service/                            # Diagnostics & Lab Service (Port: 8087)
│   ├── Audit-Microservice/                            # Audit Logging Service (Port: 8088)
│   ├── explanation-service/                           # Explainable AI SHAP Service (Port: 9093)
│   ├── SIMULATION-SERVICE/                            # Digital Twin Simulation Service (Port: 9094)
│   ├── AI-MODEL-SERVICE/                              # ML Model Registry Service (Port: 9095)
│   ├── DIABETES-SERVICE/                              # Diabetes Assessment Service (Port: 9096)
│   ├── doctor-service/                                # Doctor Management Service (Port: 9098)
│   ├── alert-Service/                                 # Physiological Alert Service (Port: 9191)
│   ├── AI-ANOMALY-SERVICE/                            # Real-time Anomaly Detection (Port: 9192)
│   └── CAREPLAN-SERVICE/                              # Treatment Care Plan Service (Port: 9193)
└── Healthcare_frontend/                               # Frontend & Python AI Services
    ├── README.md                                      # UI Architecture & Keycloak Guide
    ├── healthtwin-ui/                                 # React 19 + Vite + Tailwind CSS SPA
    │   ├── src/
    │   │   ├── components/                            # Reusable UI & Navigation Components
    │   │   ├── pages/                             # Admin, Doctor, and Patient Pages
    │   │   ├── services/                          # API Axios Clients & Endpoints
    │   │   └── keycloak.js                            # Keycloak OAuth2 Client Initialization
    │   └── package.json
    └── Medisphere_AI/                                 # Python AI Inference Engine & Datasets
        ├── predictor/                                 # Flask App (`app.py`)
        ├── models/                                    # Pre-trained `.pkl` ML Models
        └── train/                                     # Model Training Scripts
```

---

## 🔒 Security & Privacy Compliance

> [!CAUTION]
> Healthcare data requires strict access controls and privacy safeguards.

- **OAuth2 / OIDC Standards**: All microservice communication is validated via JWT tokens issued by Keycloak.
- **Granular Consent Enforcement**: Access to patient data via the `Consent Service` is restricted to authorized clinicians who have explicit active patient consent.
- **Audit Logging**: All write and read operations on sensitive patient fields are logged by `Audit-Microservice` for compliance reporting.

---

## 👥 Contributors & Acknowledgements

Developed by **Clinical Operations Group 2** for next-generation healthcare operations and digital twin innovation. Special thanks to team lead **@gnaneswar666** and all project contributors.

---

<p align="center">
  <sub>Built with ❤️ for Clinical Excellence & Patient Care.</sub>
</p>
