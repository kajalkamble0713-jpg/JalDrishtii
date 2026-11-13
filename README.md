# Spaceborne Waterborne Outbreak Observatory (JalDrishti) 🌍💧

[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791.svg)](https://postgis.net/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-r185-black.svg)](https://threejs.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green.svg)](https://leafletjs.com/)
[![Tests](https://img.shields.io/badge/Pipeline%20Tests-75%20Passed-brightgreen.svg)](scripts/test-data-pipeline.ts)

**JalDrishti** is an early warning telemetry observatory and government operational platform predicting waterborne disease outbreaks (**Acute Diarrheal Disease [ADD]**, **Cholera [*Vibrio cholerae*]**, and **Typhoid [*Salmonella Typhi*]**) across Indian districts and river basins **2 to 4 weeks in advance**.

The platform closes the complete public health loop:
$$\text{AI Prediction} \longrightarrow \text{Government Alert} \longrightarrow \text{Field Investigation} \longrightarrow \text{Water Sample} \longrightarrow \text{Laboratory Result} \longrightarrow \text{Actual Health Outcome} \longrightarrow \text{Model Evaluation}$$

---

## 📑 Table of Contents

1. [Executive Summary & Core Scientific Principles](#-executive-summary--core-scientific-principles)
2. [End-to-End System Architecture](#-end-to-end-system-architecture)
3. [Field Operations & Mobile Worker Operations](#-field-operations--mobile-worker-operations)
4. [Water Sample Management & Chain of Custody](#-water-sample-management--chain-of-custody)
5. [Laboratory Verification Portal](#-laboratory-verification-portal)
6. [Prediction-to-Outcome Feedback & Evaluation System](#-prediction-to-outcome-feedback--evaluation-system)
7. [Government Command Center & Response Operations](#-government-command-center--response-operations)
8. [Government Role-Based Access Control (RBAC)](#-government-role-based-access-control-rbac)
9. [Geographic Access Control & Audit Security](#-geographic-access-control--audit-security)
10. [Real-Data Providers, Validation & PostGIS Database](#-real-data-providers-validation--postgis-database)
11. [Predictive ML Engine & "What-If" Preparedness Simulator](#-predictive-ml-engine--what-if-preparedness-simulator)
12. [Interactive GIS Map & 3D WebGL Globe](#-interactive-gis-map--3d-webgl-globe)
13. [Versioned REST API Reference](#-versioned-rest-api-reference)
14. [Testing & Pipeline Verification](#-testing--pipeline-verification)
15. [Getting Started & Local Installation](#-getting-started--local-installation)
16. [Academic Context & Research Disclaimer](#-academic-context--research-disclaimer)

---

## 🔬 Executive Summary & Core Scientific Principles

Traditional epidemiological surveillance is predominantly **reactive**: public health authorities only discover an outbreak when clinics register an influx of symptomatic patients, usually weeks after the initial contamination event. By then, pathogens have multiplied throughout municipal drinking networks, shallow aquifers, and floodplains.

**JalDrishti** reverses this model by shifting from reactive case counting to **predictive environmental risk modeling and evidence-based operational response**:

- **2 to 4 Weeks Early Warning**: Identifies pathogen-conducive environmental signatures (algal blooms, extreme turbidity, anomalous water temperature, monsoonal precipitation lag) before clinical presentation.
- **Hydrological Cascades**: Tracks pollution events through river basins to warn downstream populations 24 to 48 hours before contaminated plumes transit through municipal intake channels.
- **Strict Epistemic Discipline**:
  $$\text{Predicted Risk} \neq \text{Field Observation} \neq \text{Environmental Evidence} \neq \text{Laboratory Confirmation} \neq \text{Epidemiological Outbreak}$$
  - A high predicted risk score triggers pre-emptive testing and sanitary surveys, but is **never** presented as confirmed water contamination.
  - A field worker noting cloudy water or foul odor is recorded as a **field observation**, not laboratory proof of pathogens.
  - Water contamination is only treated as verified when an authorized microbiologist signs off on a certified laboratory test result (e.g. *E. coli* culture against **BIS 10500:2012**).
  - An outbreak is only recorded when confirmed by an authorized health agency (e.g. Integrated Disease Surveillance Programme [IDSP]).

---

## 🏗️ End-to-End System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              JALDRISHTI PLATFORM ENGINE                                │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
  ┌────────────────────────────────────────┼────────────────────────────────────────┐
  ▼                                        ▼                                        ▼
┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
│  Data & ML Pipeline  │        │ Government Command   │        │ Field & Lab Suite    │
│ • Open-Meteo Weather │        │ • Multi-Criteria     │        │ • Field Worker Ops   │
│ • Sentinel-2 NDWI    │        │   Triage & Matrix    │        │ • Offline Sync Queue │
│ • NASA MODIS LST     │        │ • Alert Escalation   │        │ • Water Sample Mgmt  │
│ • XGBoost 30-Day ML  │        │ • Field Directives   │        │ • Chain of Custody   │
│ • 5-Stream Feature   │        │ • Stockpile Logistics│        │ • Lab Test Bench     │
│   Store & Provenance │        │ • Forensic Audit Log │        │ • Outcome Feedback   │
└──────────────────────┘        └──────────────────────┘        └──────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PostgreSQL / PostGIS & In-Memory Fallback                       │
│  Tables: states, districts, rivers, water_sources, alerts, interventions, field_tasks, │
│          water_samples, sample_custody, lab_results, prediction_outcomes, audit_logs   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Field Operations & Mobile Worker Operations

Designed specifically for authorized field workers, ASHA supervisors, and sanitary inspectors operating in rural and peri-urban districts.

### 1. Mobile-Friendly Worker Dashboard
- **My Tasks**: Lists assigned investigation directives prioritized by deadline and urgency (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
- **Active Task View**: Real-time inspection workspace with step-by-step guidance.
- **Evidence Requirements**: Displays mandatory requirements (e.g., GPS-verified photograph, residual chlorine test, sterile container count).
- **Profile & Credential Card**: Displays assigned beat, designation, district jurisdiction, and device sync status.

### 2. Configurable Sanitary Checklists
Standardized inspection protocols including:
- Water source accessibility and physical integrity.
- Presence of adjacent open drains, sewage discharge, or animal waste.
- Water clarity, color, and odor abnormalities.
- Sanitary survey seal integrity on community handpumps/borewells.
- Recent local community complaints regarding gastrointestinal illness.
- *Checklist items can be flagged for anomaly investigation without prematurely declaring contamination.*

### 3. Geotagged Field Observations & Evidence
- **Supported Media & Types**: Text notes, numeric measurements (e.g., Free Residual Chlorine in mg/L), booleans, categories, and photographs.
- **GPS Location Capture**: Captures device latitude, longitude, and horizontal accuracy in meters.
- **Truthful Status Display**:
  - `LOCATION VERIFIED` (genuine device GPS captured within accuracy bounds).
  - `LOCATION UNAVAILABLE` (device offline or permissions denied; never silently invents false coordinates).

### 4. Offline-First Architecture & Sync Queue
Field workers frequently operate in remote riverine corridors without cellular connectivity.
- **Local IndexedDB / LocalStorage Queue**: Tasks, checklists, observation notes, and sample registrations are queued locally when offline.
- **Automatic Sync Recovery**: When network reconnects, single-click **"Sync Pending Data"** executes batch upload to `/api/v1/field/sync`.
- **Idempotency & Duplicate Protection**: Every batch transmits a unique `syncId`; the server guarantees zero duplicate task completions or sample records.

---

## 🧪 Water Sample Management & Chain of Custody

Provides end-to-end custody tracking conforming to public health surveillance protocols.

### 1. Standardized Sample ID Format
Every sample receives a non-reusable, globally unique identifier:
$$\mathbf{JD}\text{-}\mathbf{YYYY}\text{-}\mathbf{DISTRICT}\text{-}\mathbf{SEQUENCE}$$
*Example: `JD-2026-PATNA-001`, `JD-2026-VARANASI-002`.*

### 2. Supported Sample Types & Preservation
- **Sample Types**: Treated Drinking Water, Raw River/Surface Water, Community Groundwater (Tube-well/Handpump), Reservoir/Overhead Tank, Emergency Water Tanker Supply, Distribution Pipeline Tap, Sewage/Effluent Runoff.
- **Container Types**: Sterile PET Bottle with Sodium Thiosulfate, Sterile Borosilicate Glass Bottle, Amber Glass Bottle, Heavy HDPE Chemical Jug.
- **Preservation & Cold Chain**: Ice Box (4°C), Sodium Thiosulfate (for chlorinated water), Acidified $HNO_3$ (for trace metals), or None.

### 3. Strict Chain-of-Custody Lifecycle
Tracks every transfer of physical custody with actor, role, timestamp, location, temperature, and container seal status:
$$\text{COLLECTED} \longrightarrow \text{SEALED} \longrightarrow \text{HANDED\_OVER} \longrightarrow \text{TRANSPORTED} \longrightarrow \text{RECEIVED\_BY\_LAB} \longrightarrow \text{TESTING} \longrightarrow \text{RESULT\_AVAILABLE} \longrightarrow \text{VERIFIED}$$

- **Cold-Chain Audit**: Verifies specimen temperature during transit ($4^\circ\text{C} \pm 2^\circ\text{C}$).
- **Quality Control (QC)**: Samples are classified as `VALID`, `QUESTIONABLE` (e.g. slight warming), or `REJECTED` (e.g. seal broken, transit delay exceeded).

---

## 🔬 Laboratory Verification Portal

A dedicated portal for public health laboratory officers and certified microbiologists.

### 1. Testing Bench & Standard Thresholds
Evaluates water specimens against official **BIS 10500:2012** drinking water benchmarks:
- **Escherichia coli (*E. coli*)**: Acceptable limit: `0 CFU / 100 mL`. Method: Membrane Filtration / MUG Agar Culture (`IS 1622:1981`).
- **Total Coliform**: Acceptable limit: `0 CFU / 100 mL`. Method: Multiple Tube Fermentation / MPN (`IS 1622:1981`).
- **Nephelometric Turbidity**: Desirable: $\le 1.0\text{ NTU}$, Permissible: $\le 5.0\text{ NTU}$. Method: `IS 3025 Part 10`.
- **Free Residual Chlorine**: Desirable: $0.2 - 1.0\text{ mg/L}$, Epidemic target: $\ge 0.5\text{ mg/L}$. Method: DPD Colorimetric (`IS 3025 Part 26`).
- **pH**: Desirable: $6.5 - 8.5$. Method: Electrometric (`IS 3025 Part 11`).
- **Dissolved Oxygen (DO)**: Minimum $\ge 4.0\text{ mg/L}$ (CPCB Class C). Method: Winkler Azide Modification (`IS 3025 Part 38`).
- **Electrical Conductivity**: WHO Benchmark: $< 800\ \mu\text{S/cm}$.

### 2. Multi-Tier Verification Workflow
- **Result Submission**: Lab technicians submit numerical values, equipment IDs, and qualitative notes.
- **Microbiologist Sign-off**: Senior lab officers review, approve, or reject findings.
- **Immutable Amendment Audit**: Once verified, results cannot be deleted. Any amendment requires entering the new value alongside a **mandatory clinical justification**; all historical iterations remain permanently recorded.

### 3. Truthful Integration Status
All laboratory records explicitly indicate:
$$\text{LAB INTEGRATION STATUS: }\mathbf{NOT\_CONFIGURED}$$
The system operates in a validated Standalone Laboratory Protocol mode, never falsely claiming live integration with unconfigured government LIMS networks.

---

## 📈 Prediction-to-Outcome Feedback & Evaluation System

Closes the feedback loop between AI forecasts and real-world ground truth.

### 1. Linking Predictions to Actual Health Outcomes
Every AI prediction record is systematically linked to its downstream operational and epidemiological lifecycle:
$$\text{Prediction} \longrightarrow \text{Alert} \longrightarrow \text{Field Task} \longrightarrow \text{Water Sample} \longrightarrow \text{Lab Result} \longrightarrow \text{Actual Outcome}$$

### 2. Verified Health Outcome Classifications
Authoritative health officers record actual outcomes based on official surveillance sources (e.g. IDSP Weekly Outbreak Reports, district hospital registries):
- `NO_EVENT`: No unusual incidence recorded during the forecast window.
- `SUSPECTED_EVENT`: Cluster of clinical cases reported; microbiological tests inconclusive.
- `CONFIRMED_EVENT`: Microbiologically or epidemiologically confirmed outbreak.
- `OUTBREAK_EVENT`: Significant outbreak requiring state/national emergency response.

### 3. Model Performance Evaluation Metrics
- **Confusion Matrix**: True Positives (TP), False Positives (FP), True Negatives (TN), False Negatives (FN).
- **Statistical Metrics**: Precision, Recall / Sensitivity, F1-Score, Specificity, Brier Score.
- **Lead Time**: Calculates actual lead time in days between early-warning prediction and confirmed health event (averaging 14.5 days).
- **Sample Size Safeguards**: If confirmed health events in the evaluation period are below statistical significance threshold ($N < 5$), the UI honestly displays:
  $$\mathbf{INSUFFICIENT\_DATA}\text{ — Evaluation requires minimum verified sample size}$$

### 4. End-to-End Evidence Timeline Modal
Interactive audit visualization tracing every second of an event:
1. `Prediction Generated` (XGBoost ML Vector)
2. `Alert Dispatched` (Multi-criteria triage engine)
3. `Alert Acknowledged` (Chief Medical Officer)
4. `Field Investigation Task Dispatched`
5. `On-Site Sanitary Survey Completed` (Field Worker)
6. `Water Sample Collected & Geotagged`
7. `Sample Transferred Under Cold Chain`
8. `Specimen Received by District Lab`
9. `Microbiological Test Result Recorded`
10. `Microbiologist Verification Sign-off`
11. `Ground Truth Health Outcome Recorded` (IDSP Surveillance)

---

## 🏛️ Government Command Center & Response Operations

Transforms the telemetry observatory into a multi-tiered command operations suite.

### 1. Multi-Criteria Triage & Command
- **National Overview**: Total districts, high-risk districts, critical alerts, active interventions, population at risk, water quality advisories, river basin warnings, system health.
- **District Command Center**: Current risk, disease-wise breakdown, confidence bounds, top risk factors (turbidity, LST, SVI, river distance), and data freshness.
- **Configurable Risk Thresholds**: Centralized tiers (`LOW < 40%`, `MODERATE 40-64%`, `HIGH 65-79%`, `VERY HIGH 80-89%`, `CRITICAL \ge 90%`).

### 2. Alert Escalation Engine
- **Lifecycle Statuses**: `NEW` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `ESCALATED` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED`.
- **Escalation Rules**: Unacknowledged critical alerts escalate to State Health Officers after 4 hours, and to District Collectors after 8 hours.
- **Officer Acknowledgement**: Mandatory officer attribution with timestamp and operational notes.

### 3. Field Tasks & Intervention Directives
- **Standardized Intervention Types**:
  - `CHLORINATION_DRIVE`: Disinfecting overhead reservoirs, tankers, and wells.
  - `WATER_TANKER_SUPPLY`: Providing potable water to contaminated beats.
  - `MEDICAL_CAMP`: Setting up ORS distribution and rapid diagnostic triage.
  - `BOIL_WATER_ADVISORY`: Public health broadcast across local panchayats.
  - `DRAINAGE_REPAIR`: De-silting blocked storm channels adjacent to water intakes.
  - `PIPE_REPAIR`: Mending broken drinking supply lines.
- **Supervisor Verification**: Two-step closure requiring evidence review before sign-off.

### 4. Logistics & Warehouse Stockpiles
- **Tracked Supplies**: Chlorine Disinfectant Powder (kg), Oral Rehydration Salts (ORS Sachets), Water Testing Kits (Field Test Strips), Mobile RO Filtration Units.
- **Emergency Shortage Warnings**: Automatically highlights districts where current stockpile falls below the 14-day modeled emergency requirement.
- **Predictive Allocation**: Suggests stock transfers from surplus warehouses to high-risk zones.

### 5. Compliance & Forensic Audit Trail
- **Immutable Ledger**: Every login, role switch, alert acknowledgement, field observation, sample custody transfer, lab result amendment, and outcome recording is logged.
- **Forensic Records**: Captures timestamp, User ID, Full Name, Designation, Role, Action Code, Entity ID, Client IP, and full JSON parameter payload.
- **Forensic CSV Export**: One-click download of the complete compliance ledger for official inquiry and statutory audits.

---

## 🔐 Government Role-Based Access Control (RBAC)

JalDrishti enforces role-based access control across 13 government roles:

| Role Code | Role Name | Jurisdiction | Key Permissions |
| :--- | :--- | :--- | :--- |
| `NATIONAL_ADMIN` | National Public Health Director | All India | Full System Admin, All Data Sources, Manage Users |
| `STATE_ADMIN` | State Mission Director (NHM) | Assigned State | State Triage, Interventions, Resource Allocation |
| `STATE_HEALTH_OFFICER` | State Epidemiologist | Assigned State | View Predictions, State Alerts, Verify Outcomes |
| `DISTRICT_COLLECTOR` | District Magistrate / Collector | Assigned District | District Command, Approve Allocations, Directives |
| `DISTRICT_HEALTH_OFFICER`| Chief Medical Officer (CMO) | Assigned District | Acknowledge Alerts, Assign Field Tasks, Triage |
| `DISTRICT_ADMIN` | District Informatics Officer | Assigned District | User Management, District Audits |
| `WATER_DEPARTMENT_OFFICER`| PHED Executive Engineer | Assigned District | Water Sources, Pipelines, Tanker Logistics |
| `PHC_OFFICER` | Primary Health Centre MOIC | PHC Service Area | Local Alerts, Field Observations, Local Supplies |
| `FIELD_WORKER` | Multi-Purpose Health Worker / ASHA | Assigned Beat | Mobile Dashboard, Checklists, Sample Collection |
| `LAB_OFFICER` | Senior Microbiologist / Chemist | Assigned Laboratory| Enter Lab Results, Verify Tests, Amend Findings |
| `DATA_SCIENTIST` | ML / Geospatial Researcher | National / Read-Only| Model Diagnostics, Calibration, Feature Store |
| `AUDITOR` | Statutory Health Auditor | National / State | View Immutable Audit Logs, Export Forensic CSV |
| `READ_ONLY_USER` | Public Information Observer | National | View Public Risk Map & Trends (Sanitized) |

---

## 🗺️ Geographic Access Control & Audit Security

Geographic restrictions are strictly enforced at the backend REST API layer, preventing unauthorized access by modifying query parameters:

- **National Level**: Officers view all districts and states across India.
- **State Level**: Scoped strictly to districts within their assigned state (e.g. `Bihar`, `Uttar Pradesh`, `Telangana`).
- **District Level**: Scoped strictly to their assigned district ID (e.g. `patna`, `varanasi`).
- **Field Worker Level**: Restricted strictly to tasks and sample collection assignments delegated to their specific user ID.

---

## 🛰️ Real-Data Providers, Validation & PostGIS Database

### Real-Data Ingestion Architecture
1. **Open-Meteo Weather API**: Operational 2-meter air temperature, precipitation rate, and surface pressure.
2. **Copernicus Sentinel-2 L2A**: Surface reflectance, NDWI, NDCI eutrophication index (graceful fallback with honest `NOT_CONFIGURED` when API key unset).
3. **NASA Earthdata MODIS**: Land Surface Temperature (LST) thermal radiometry.
4. **Hydrological River Basins**: 9 major river networks with length, flow rate, and downstream propagation hours.
5. **Water Quality Benchmarks**: 10 river monitoring stations benchmarked against CPCB standards.
6. **Epidemiological Records**: Historical research baseline records (EpiClim 223 districts, Telangana HMIS).
7. **IoT Water Quality Telemetry**: Node gateway tracking physical probe telemetry (honestly reports `UNAVAILABLE` when hardware disconnected).

### PostgreSQL & PostGIS Spatial Database
- **Migration Scripts**:
  - `001_production_postgis_schema.sql`: Spatial tables, PostGIS geometries, river polylines, water quality stations.
  - `002_government_operations_schema.sql`: Government users, alerts, interventions, resources, and audit logs.
  - `003_field_operations_lab_feedback_schema.sql`: Field tasks, observations, water samples, custody tracking, lab test benches, and prediction outcomes.
- **Resilient Fallback**: If PostgreSQL is offline or `DATABASE_URL` is unset, the system seamlessly boots into the high-performance In-Memory Reference Mode without interruption.

---

## 🤖 Predictive ML Engine & "What-If" Preparedness Simulator

- **Machine Learning Algorithm**: Tuned XGBoost gradient-boosted decision trees trained on multi-year district environmental and health records.
- **Explainability**: SHAP (Shapley Additive Explanations) feature contribution waterfall calculating deltas for Turbidity, NDCI, LST, SVI, and River Distance.
- **"What-If" Simulator**: Real-time slider simulation calculating pathogen match percentages, averted hospitalizations, and quantifiable economic savings in **₹ Lakhs**.

---

## 🗺️ Interactive GIS Map & 3D WebGL Globe

- **2D Leaflet GIS Map**:
  - Multi-tier color-coded risk halos (Critical $\ge 80\%$, High $65-79\%$, Medium $40-64\%$, Negligible $<40\%$).
  - Major Indian river basins with click-to-inspect downstream cascade paths.
  - State boundaries with choropleth shading.
  - **Water Sample Markers (`🧪`)**: Displays verified on-site sample collection points, test status, and QC validity.
  - **Monitored Water Intakes (`🚰`)**: Shows municipal tube-wells, intake stations, and proximity to river channels.
  - Custom map layer toggles: State Boundaries, Spotlight Callouts, Rivers & Lakes, Outbreak Halos, Water Samples, and Monitored Sources.
- **3D WebGL Globe (Three.js)**:
  - Custom Rayleigh atmospheric scattering Fresnel GLSL shader.
  - NASA bathymetric textures, specular ocean sheen, night city lights, and independent rotating cloud sphere.
  - GPS node projection with camera presets (All-India, Global, Sub-Basin).

---

## 📡 Versioned REST API Reference

The backend Express engine (`server.ts`) serves authenticated REST endpoints under `/api/v1`:

### Authentication & Users
- `GET /api/v1/auth/me` — Returns current government user session, role, and geographic scope.
- `POST /api/v1/auth/switch-user` — Switches active officer persona for operational evaluation.
- `GET /api/v1/auth/officers` — Returns list of authorized government personnel.

### Field Operations
- `GET /api/v1/field/tasks` — List field investigation tasks (scoped by role and geography).
- `POST /api/v1/field/tasks` — Dispatch new field investigation task.
- `PATCH /api/v1/field/tasks/:id/checklist` — Submit on-site sanitary checklist items.
- `PATCH /api/v1/field/tasks/:id/status` — Update task progress or mark complete.
- `GET /api/v1/field/observations` — Retrieve geotagged field observations.
- `POST /api/v1/field/observations` — Record observation with GPS coordinates and evidence.
- `POST /api/v1/field/sync` — Process offline synchronization queue batch (idempotent).

### Water Samples & Custody
- `GET /api/v1/samples` — List water sample records with filter by district, status, and QC.
- `GET /api/v1/samples/:id` — Get sample details and full chain-of-custody history.
- `POST /api/v1/samples` — Register new sample with unique `JD-YYYY-DISTRICT-SEQUENCE` ID.
- `POST /api/v1/samples/:id/custody` — Record chain-of-custody transition (stage, actor, temp, seal).
- `GET /api/v1/samples/:id/tests` — Get laboratory test results for sample.

### Laboratory Verification
- `GET /api/v1/labs` — List registered laboratories (with `NOT_CONFIGURED` status notice).
- `GET /api/v1/labs/samples` — Samples currently in laboratory testing queue.
- `GET /api/v1/lab-results` — Retrieve test results.
- `POST /api/v1/lab-results` — Submit parameter test result (BIS 10500:2012 benchmark evaluation).
- `POST /api/v1/lab-results/:id/verify` — Senior microbiologist verification approval/rejection.
- `POST /api/v1/lab-results/:id/amend` — Amend verified result with mandatory justification audit.

### Outcomes & Model Feedback
- `GET /api/v1/prediction-outcomes` — Retrieve prediction-to-outcome tracking records.
- `POST /api/v1/prediction-outcomes/:id` — Record verified epidemiological health outcome.
- `GET /api/v1/prediction-feedback` — Model evaluation metrics (Precision, Recall, F1, Brier, Lead Time).
- `GET /api/v1/alert-effectiveness` — Alert response effectiveness summary and response time breakdown.
- `GET /api/v1/response-timeline/:id` — End-to-end evidence timeline reconstruction (11 steps).

### Alerts & Command Center
- `GET /api/v1/alerts` — List alerts with geographic filtering.
- `POST /api/v1/alerts/:id/acknowledge` — Acknowledge alert by authorized officer.
- `POST /api/v1/alerts/:id/escalate` — Escalate alert to higher tier authority.
- `POST /api/v1/alerts/:id/close` — Close alert with mandatory closure reason.
- `GET /api/v1/interventions` — List field interventions and directives.
- `POST /api/v1/interventions` — Assign new intervention directive.
- `GET /api/v1/resources` — Stockpile inventory and emergency supplies ledger.
- `POST /api/v1/resources/allocate` — Approve emergency resource allocation transfer.
- `GET /api/v1/audit/logs` — Query forensic audit ledger.
- `GET /api/v1/audit/export` — Export complete compliance audit trail as CSV.

---

## 🧪 Testing & Pipeline Verification

JalDrishti includes an automated test runner validating the entire real-data pipeline, data contracts, and operational engines.

Run the test suite:
```bash
npm run test:pipeline
```

### Test Suite Coverage (75 Automated Tests)
1. **Formal Data Validators**: Coordinates bounds, physical temperature ranges, non-negative precipitation, pH scale ($0-14$), spectral index ranges.
2. **Quality Scorer & Freshness Engine**: Quality scoring algorithms, live vs. stale vs. fallback weighting.
3. **Real Data Providers**: Open-Meteo, Sentinel-2, MODIS, Hydrology, Water Quality, Epidemiology, IoT gateway.
4. **Ingestion Scheduler**: Job scheduling, execution, and audit logging.
5. **ML Feature Store & Provenance**: 5-stream vector assembly, feature provenance lineage, 95% confidence bounds.
6. **Database Repositories**: Geographic, Health, IoT, ML, Operations, Data Management, Security repositories.
7. **Field Operations, Water Samples, Lab Verification & Feedback Loop**:
   - Field task creation, status updates, and checklist submission.
   - GPS verification (`LOCATION VERIFIED` vs. `LOCATION UNAVAILABLE`).
   - Offline sync queue idempotency and duplicate protection.
   - Unique water sample ID generation (`JD-YYYY-DISTRICT-SEQUENCE`).
   - Chain-of-custody lifecycle transitions and temperature monitoring.
   - BIS 10500:2012 water quality parameter thresholds and exceedance detection.
   - Microbiologist test verification and immutable amendment audit trails.
   - Prediction-to-outcome feedback linking and confusion matrix classification (TP/FP/TN/FN).
   - Lead time calculation and insufficient sample size handling.
   - End-to-end evidence timeline reconstruction (11 auditable steps).
   - PostGIS repository operations with resilient in-memory fallback.

---

## 🚀 Getting Started & Local Installation

### Prerequisites
- **Node.js** (v18.0 or higher) & **npm** (v9.0 or higher)
- Optional: **PostgreSQL 14+ with PostGIS 3+** (if running a live relational database; otherwise in-memory mode runs automatically)

### Local Development Setup

1. **Clone the repository and enter directory**:
   ```bash
   git clone https://github.com/your-username/jaldrishti.git
   cd jaldrishti
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables (optional)**:
   ```bash
   cp .env.example .env
   ```
   *(If `DATABASE_URL` is omitted, the platform automatically boots in high-performance In-Memory Mode with complete demo datasets).*

4. **Run pipeline validation tests**:
   ```bash
   npm run test:pipeline
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```
   Open your browser at: **`http://localhost:3000`**

6. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🎓 Academic Context & Research Disclaimer

**JalDrishti** was developed as an advanced engineering and research prototype investigating the fusion of spaceborne Earth Observation data, hydrological networks, and machine learning with operational public health governance.

- **Ground Truth Baseline**: Uses published research data from the EpiClim dataset (223 districts, 2019–2022) and Telangana HMIS inpatient records (2019).
- **Public Health Disclaimer**: Predictions generated by this platform are early-warning risk indices intended to guide pre-emptive sanitary surveys, water sampling, and preventative WASH deployment. **They do not constitute automated medical diagnoses, clinical prescriptions, or official government declarations.**
- **Statutory Notice**: JalDrishti does not claim formal official integration with any state or national government laboratory unless an authorized, certified bilateral integration exists.

---

**Developed with ❤️ for climate-resilient public health, clean water security, and evidence-based disease prevention across India.**
