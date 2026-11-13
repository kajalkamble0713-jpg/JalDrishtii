/**
 * JalDrishti Formal Data Validator
 * Validates environmental telemetry, geographic coordinates, physical ranges,
 * and temporal bounds before ingestion into the ML feature store.
 */

import { ValidationIssue, ValidationResult } from '../types';

export class DataValidator {
  /**
   * Validate geographical latitude & longitude coordinates.
   */
  public static validateCoordinates(lat: unknown, lng: unknown, context = 'Coordinates'): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (typeof lat !== 'number' || isNaN(lat)) {
      issues.push({
        field: 'latitude',
        value: lat,
        rule: 'type_check',
        severity: 'error',
        message: `${context}: Latitude must be a valid finite number.`,
      });
    } else if (lat < -90 || lat > 90) {
      issues.push({
        field: 'latitude',
        value: lat,
        rule: 'range_check',
        severity: 'error',
        message: `${context}: Latitude ${lat} is outside geographical bounds [-90, +90].`,
      });
    }

    if (typeof lng !== 'number' || isNaN(lng)) {
      issues.push({
        field: 'longitude',
        value: lng,
        rule: 'type_check',
        severity: 'error',
        message: `${context}: Longitude must be a valid finite number.`,
      });
    } else if (lng < -180 || lng > 180) {
      issues.push({
        field: 'longitude',
        value: lng,
        rule: 'range_check',
        severity: 'error',
        message: `${context}: Longitude ${lng} is outside geographical bounds [-180, +180].`,
      });
    }

    return issues;
  }

  /**
   * Validate ISO timestamps and temporal plausibility.
   */
  public static validateTimestamp(timestampStr: unknown, context = 'Timestamp'): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!timestampStr || typeof timestampStr !== 'string') {
      issues.push({
        field: 'timestamp',
        value: timestampStr,
        rule: 'required_string',
        severity: 'error',
        message: `${context}: Timestamp string is missing or invalid.`,
      });
      return issues;
    }

    const parsed = new Date(timestampStr);
    if (isNaN(parsed.getTime())) {
      issues.push({
        field: 'timestamp',
        value: timestampStr,
        rule: 'iso_parse',
        severity: 'error',
        message: `${context}: Timestamp "${timestampStr}" cannot be parsed into a valid Date.`,
      });
      return issues;
    }

    // Check future bounds (cannot be more than 24h into the future)
    const now = Date.now();
    const twentyFourHoursFuture = now + 24 * 60 * 60 * 1000;
    if (parsed.getTime() > twentyFourHoursFuture) {
      issues.push({
        field: 'timestamp',
        value: timestampStr,
        rule: 'future_bound',
        severity: 'error',
        message: `${context}: Timestamp "${timestampStr}" is >24 hours in the future.`,
      });
    }

    return issues;
  }

  /**
   * Validate surface and air temperatures in Celsius.
   * Rejects physiologically or meteorologically impossible observations.
   */
  public static validateTemperature(tempC: unknown, fieldName = 'temperature2m'): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    if (typeof tempC !== 'number' || isNaN(tempC)) {
      issues.push({
        field: fieldName,
        value: tempC,
        rule: 'numeric',
        severity: 'error',
        message: `${fieldName} must be a valid numeric value.`,
      });
      return issues;
    }

    // Historical records in India span approximately -15°C (Ladakh winter) to +55°C (Rajasthan heatwave)
    if (tempC < -20 || tempC > 65) {
      issues.push({
        field: fieldName,
        value: tempC,
        rule: 'physical_range',
        severity: 'error',
        message: `Impossible temperature detected: ${tempC}°C (plausible range: -20°C to 65°C).`,
      });
    }

    return issues;
  }

  /**
   * Validate precipitation in millimeters.
   */
  public static validatePrecipitation(precipMm: unknown): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    if (typeof precipMm !== 'number' || isNaN(precipMm)) {
      issues.push({
        field: 'precipitation',
        value: precipMm,
        rule: 'numeric',
        severity: 'error',
        message: 'Precipitation must be a number.',
      });
      return issues;
    }

    if (precipMm < 0) {
      issues.push({
        field: 'precipitation',
        value: precipMm,
        rule: 'non_negative',
        severity: 'error',
        message: `Negative precipitation impossible: ${precipMm} mm.`,
      });
    } else if (precipMm > 2000) {
      // 2000 mm in a single observation is beyond world record daily rainfall
      issues.push({
        field: 'precipitation',
        value: precipMm,
        rule: 'upper_bound',
        severity: 'error',
        message: `Extreme precipitation outlier rejected: ${precipMm} mm.`,
      });
    }

    return issues;
  }

  /**
   * Validate surface barometric pressure in hPa.
   */
  public static validatePressure(pressureHpa: unknown): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    if (typeof pressureHpa !== 'number' || isNaN(pressureHpa)) {
      return issues; // Optional in some datasets
    }

    if (pressureHpa < 400 || pressureHpa > 1100) {
      issues.push({
        field: 'surfacePressure',
        value: pressureHpa,
        rule: 'barometric_bound',
        severity: 'error',
        message: `Barometric pressure ${pressureHpa} hPa is outside physical atmospheric range (400 - 1100 hPa).`,
      });
    }

    return issues;
  }

  /**
   * Validate water quality parameters (pH, Turbidity, DO).
   */
  public static validateWaterQualityParams(params: {
    ph?: unknown;
    turbidityNtu?: unknown;
    dissolvedOxygenMgL?: unknown;
  }): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (params.ph !== undefined && params.ph !== null) {
      if (typeof params.ph !== 'number' || params.ph < 0 || params.ph > 14) {
        issues.push({
          field: 'ph',
          value: params.ph,
          rule: 'ph_scale',
          severity: 'error',
          message: `Water pH value ${params.ph} is outside chemical scale [0.0, 14.0].`,
        });
      }
    }

    if (params.turbidityNtu !== undefined && params.turbidityNtu !== null) {
      if (typeof params.turbidityNtu !== 'number' || params.turbidityNtu < 0 || params.turbidityNtu > 4000) {
        issues.push({
          field: 'turbidityNtu',
          value: params.turbidityNtu,
          rule: 'turbidity_scale',
          severity: 'error',
          message: `Turbidity ${params.turbidityNtu} NTU is invalid (expected 0 to 4000 NTU).`,
        });
      }
    }

    if (params.dissolvedOxygenMgL !== undefined && params.dissolvedOxygenMgL !== null) {
      if (typeof params.dissolvedOxygenMgL !== 'number' || params.dissolvedOxygenMgL < 0 || params.dissolvedOxygenMgL > 30) {
        issues.push({
          field: 'dissolvedOxygenMgL',
          value: params.dissolvedOxygenMgL,
          rule: 'do_scale',
          severity: 'error',
          message: `Dissolved oxygen ${params.dissolvedOxygenMgL} mg/L is outside physical water saturation limit (0 to 30 mg/L).`,
        });
      }
    }

    return issues;
  }

  /**
   * Validate spectral indices (NDWI, NDCI, NDVI).
   */
  public static validateSpectralIndex(val: unknown, indexName: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    if (typeof val !== 'number' || isNaN(val)) {
      issues.push({
        field: indexName,
        value: val,
        rule: 'numeric',
        severity: 'error',
        message: `${indexName} must be a numeric value.`,
      });
      return issues;
    }

    // Normalized ratio indices mathematically lie between -1.0 and +1.0
    if (val < -1.0 || val > 1.0) {
      issues.push({
        field: indexName,
        value: val,
        rule: 'normalized_difference_range',
        severity: 'error',
        message: `${indexName} value ${val} must be constrained to [-1.0, 1.0].`,
      });
    }

    return issues;
  }

  /**
   * Bundle issues into a formal ValidationResult.
   */
  public static createResult(issues: ValidationIssue[]): ValidationResult {
    const hasErrors = issues.some((i) => i.severity === 'error');
    if (hasErrors) {
      console.warn(`[JalDrishti Validator] Validation found ${issues.length} issue(s):`, issues);
    }
    return {
      isValid: !hasErrors,
      issues,
      validatedAt: new Date().toISOString(),
    };
  }
}
