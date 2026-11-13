# System Architecture & Automation Workflow

This document explains the conceptual automation pipeline and the logical engine that powers the **Spaceborne Waterborne Outbreak Observatory (JalDrishti)**.

## 1. Automated Data Ingestion (Simulated)
In a real-world scenario, the platform would automatically ingest data from multiple sources via APIs or scheduled cron jobs. Currently, this process is simulated in the application state.
* **Satellite Telemetry (Sentinel-2 L2A / Landsat):** Periodically pulls spectral indices for major water bodies.
  * **Turbidity (FNU):** Measures suspended particles. High turbidity often follows heavy rainfall and carries bacterial loads.
  * **NDCI (Normalized Difference Chlorophyll Index):** Detects algal blooms which deplete oxygen and alter pH.
  * **CDOM (Colored Dissolved Organic Matter):** Indicates organic pollution (e.g., sewage or agricultural runoff).
* **Ground Sensors:** IoT sensors providing real-time Water Temp and Dissolved Oxygen (DO) mg/L.

## 2. Risk Calculation Engine
Once the data is ingested, an automated "Risk Engine" evaluates the parameters against known epidemiological thresholds for diseases like Cholera and Typhoid.

**Automation Logic (Example Ruleset):**
* **IF** `Turbidity > 4.5 FNU` **AND** `Dissolved Oxygen < 4.0 mg/L` 
  * **THEN** Risk Level = **`Very High`**
* **IF** `Water Temp > 28°C` **AND** `CDOM > 1.5`
  * **THEN** Risk Level = **`High`**

## 3. Downstream Propagation Algorithm
The system doesn't just look at isolated districts; it understands the geographical flow of rivers.
* **The Automation:** When a "Source / Upper Course" district (e.g., Kanpur on the Ganges) triggers a `Very High` alert due to an industrial sewage spill, the system calculates the `downstreamPropagationHours` (e.g., 48 hours).
* **The Result:** The system automatically raises pre-emptive alerts for downstream districts (e.g., Varanasi and Patna), allowing authorities to act *before* the contaminated water arrives.

## 4. Automated Alerting & WASH Response
When a district crosses into `High` or `Very High` risk, the system automatically maps the specific threat to an actionable response.
* **Trigger:** Cholera risk detected in River Delta.
* **Automated Output (WASH Action):** "Deploy boat-mounted water filtration units and distribute rapid antigen test kits to flood-isolated island char settlements."

## 5. UI & Dashboard Updates
The frontend React application continuously "listens" to this data engine.
* **Map Rendering:** The Leaflet map automatically changes the color of river polylines (Blue -> Red) and district markers based on the live calculated risk.
* **Notification Bell:** New high-risk assessments are automatically pushed to the notification center for immediate operator attention.

---
*Note: In this React/TypeScript prototype, this automation pipeline is demonstrated using the structured datasets in `/src/data/jaldrishtiData.ts` and `/src/data/riverData.ts`, simulating what a live Python/Node.js backend cron-job would output.*
