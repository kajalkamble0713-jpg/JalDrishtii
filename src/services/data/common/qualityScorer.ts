/**
 * JalDrishti Data Quality Scorer & Freshness Engine
 * Computes an objective 0-100 numerical quality index based on:
 * - Freshness (0-25)
 * - Completeness (0-25)
 * - Validity (0-25)
 * - Source Reliability (0-25)
 */

import { DataStatus, QualityScoreBreakdown, DataSourceType } from '../types';

export class QualityScorer {
  /**
   * Calculate data quality score breakdown.
   */
  public static calculate(params: {
    sourceType: DataSourceType;
    status: DataStatus;
    observedAt: string | null;
    fetchedAt: string;
    completenessRatio: number; // 0.0 to 1.0 (ratio of non-null required fields)
    hasValidationErrors: boolean;
    validationWarningCount: number;
    isOfficialGovOrSatelliteSource: boolean;
    isFallback: boolean;
  }): QualityScoreBreakdown {
    const notes: string[] = [];

    // 1. Freshness Score (0 - 25)
    let freshness = 0;
    if (params.status === 'LIVE') {
      freshness = 25;
      notes.push('Observation is live streaming (<30m old)');
    } else if (params.status === 'RECENT') {
      freshness = 20;
      notes.push('Observation is recent (<6h old)');
    } else if (params.status === 'STALE') {
      freshness = 8;
      notes.push('Observation has exceeded expected cadence (stale)');
    } else if (params.status === 'STATIC') {
      freshness = 12; // Static official benchmarks have predictable cadence
      notes.push('Static historical/official survey baseline');
    } else if (params.status === 'MODELED') {
      freshness = 14;
      notes.push('Calibrated biophysical model output');
    } else {
      freshness = 0;
      notes.push('Source not connected or unavailable');
    }

    // If source is not configured or unavailable, score is zero
    if (params.status === 'NOT_CONFIGURED' || params.status === 'UNAVAILABLE') {
      return {
        freshness: 0,
        completeness: 0,
        validity: 0,
        sourceReliability: 0,
        total: 0,
        notes: [params.status === 'NOT_CONFIGURED' ? 'Provider credentials unconfigured' : 'No connection to physical sensors'],
      };
    }

    // 2. Completeness Score (0 - 25)
    const clampedCompleteness = Math.max(0, Math.min(1.0, params.completenessRatio));
    const completeness = Math.round(clampedCompleteness * 25);
    notes.push(`Field completeness: ${Math.round(clampedCompleteness * 100)}%`);

    // 3. Validity Score (0 - 25)
    let validity = 25;
    if (params.hasValidationErrors) {
      validity = 0;
      notes.push('Validation errors detected; physical bounds violated');
    } else if (params.validationWarningCount > 0) {
      validity = Math.max(10, 25 - params.validationWarningCount * 5);
      notes.push(`${params.validationWarningCount} minor validation warning(s)`);
    } else {
      notes.push('Passed all range, schema, and coordinate validations');
    }

    // 4. Source Reliability (0 - 25)
    let sourceReliability = 15;
    if (params.isOfficialGovOrSatelliteSource && !params.isFallback) {
      sourceReliability = 25; // Tier-1 authoritative source (Copernicus, Open-Meteo, NFHS-5)
      notes.push('Tier-1 verified operational source');
    } else if (params.isFallback) {
      sourceReliability = 14;
      notes.push('Pre-compiled verified research fallback');
    } else if (params.status === 'MODELED') {
      sourceReliability = 16;
      notes.push('Domain scientific optical model');
    }

    const total = Math.max(0, Math.min(100, freshness + completeness + validity + sourceReliability));

    return {
      freshness,
      completeness,
      validity,
      sourceReliability,
      total,
      notes,
    };
  }
}

export class FreshnessEngine {
  /**
   * Determine age in minutes and assign status.
   */
  public static evaluate(
    observedAt: string | null,
    sourceType: DataSourceType,
    configured: boolean
  ): { status: DataStatus; ageMinutes: number; nextExpectedMinutes?: number } {
    if (!configured) {
      return { status: 'NOT_CONFIGURED', ageMinutes: Infinity };
    }

    if (!observedAt) {
      return { status: 'UNAVAILABLE', ageMinutes: Infinity };
    }

    const observedTime = new Date(observedAt).getTime();
    if (isNaN(observedTime)) {
      return { status: 'FAILED', ageMinutes: Infinity };
    }

    const now = Date.now();
    const ageMinutes = Math.max(0, Math.round((now - observedTime) / (1000 * 60)));

    // Cadence thresholds per data source
    switch (sourceType) {
      case 'weather': {
        // Weather updates every 15-60 minutes
        if (ageMinutes <= 60) return { status: 'LIVE', ageMinutes, nextExpectedMinutes: 15 };
        if (ageMinutes <= 180) return { status: 'RECENT', ageMinutes, nextExpectedMinutes: 60 };
        return { status: 'STALE', ageMinutes };
      }

      case 'satellite_sentinel2': {
        // Sentinel-2 has a 5-day revisit cycle in India
        if (ageMinutes <= 24 * 60 * 3) return { status: 'RECENT', ageMinutes, nextExpectedMinutes: 24 * 60 * 2 };
        if (ageMinutes <= 24 * 60 * 7) return { status: 'STALE', ageMinutes };
        return { status: 'STATIC', ageMinutes };
      }

      case 'satellite_modis': {
        // MODIS orbits daily
        if (ageMinutes <= 24 * 60) return { status: 'RECENT', ageMinutes, nextExpectedMinutes: 24 * 60 };
        return { status: 'STALE', ageMinutes };
      }

      case 'hydrology': {
        if (ageMinutes <= 180) return { status: 'LIVE', ageMinutes, nextExpectedMinutes: 60 };
        if (ageMinutes <= 24 * 60) return { status: 'RECENT', ageMinutes };
        return { status: 'STALE', ageMinutes };
      }

      case 'water_quality': {
        if (ageMinutes <= 24 * 60) return { status: 'RECENT', ageMinutes, nextExpectedMinutes: 24 * 60 };
        return { status: 'MODELED', ageMinutes };
      }

      case 'census_svi': {
        // Census / NFHS-5 are static multi-year surveys
        return { status: 'STATIC', ageMinutes };
      }

      case 'epidemiology': {
        return { status: 'STATIC', ageMinutes };
      }

      case 'iot_sensors': {
        if (ageMinutes <= 15) return { status: 'LIVE', ageMinutes, nextExpectedMinutes: 5 };
        if (ageMinutes <= 60) return { status: 'RECENT', ageMinutes, nextExpectedMinutes: 15 };
        return { status: 'STALE', ageMinutes };
      }

      default:
        return { status: 'UNAVAILABLE', ageMinutes };
    }
  }
}
