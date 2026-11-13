# JalDrishti — Data Validation Rules & Schema Contracts 🛡️

To prevent corrupted, impossible, or malicious values from polluting the ML prediction engine, all incoming telemetry passes through `DataValidator` before admission into the feature store.

---

## 1. Geographical Coordinates Validation

- **Rule**: `Latitude ∈ [-90.0, +90.0]`, `Longitude ∈ [-180.0, +180.0]`.
- **Type**: Finite 64-bit IEEE floating-point numbers.
- **Action on Violation**: Rejection with `severity: error`. The request falls back to district centroid coordinates.

---

## 2. Atmospheric & Meteorological Validation

| Metric | Valid Range | Physical Justification |
| :--- | :--- | :--- |
| **Air Temperature** | `-20.0°C` to `+65.0°C` | Historical Indian meteorological extremes (Ladakh winter to Thar Desert heatwave). |
| **Precipitation** | `0.0 mm` to `2000.0 mm` | Negative rainfall is physically impossible; upper bound exceeds world record daily rainfall. |
| **Barometric Pressure** | `400.0 hPa` to `1100.0 hPa` | Physical atmospheric range from Himalayan altitude to sea-level tropical depressions. |

---

## 3. Water Quality Biophysical Validation

| Parameter | Valid Range | Rationale |
| :--- | :--- | :--- |
| **pH** | `0.0` to `14.0` | Standard logarithmic hydronium ion concentration scale. |
| **Turbidity** | `0.0` to `4000.0 NTU/FNU` | Negative turbidity is impossible; upper bound covers severe flash-flood silt slurries. |
| **Dissolved Oxygen** | `0.0` to `30.0 mg/L` | 0 mg/L represents total anoxia; 30 mg/L exceeds physical cold-water oxygen supersaturation. |

---

## 4. Spectral Ratio Indices Validation

- **Indices**: NDWI (Water Index), NDCI (Chlorophyll Index), NDVI (Vegetation Index).
- **Rule**: Mathematically bounded by formula `(Band_A - Band_B) / (Band_A + Band_B)` to `[-1.0, +1.0]`.
- **Action on Violation**: Values `< -1.0` or `> +1.0` trigger an immediate validation error.

---

## 5. Temporal Plausibility Validation

- **Rule**: Timestamps must be parseable ISO 8601 strings.
- **Future Limit**: Observations dated more than `24 hours in the future` are rejected to prevent system clock drift corruption.
