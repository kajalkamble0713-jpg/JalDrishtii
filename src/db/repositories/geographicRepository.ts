/**
 * JalDrishti Geographic Repository
 * Handles States, Districts, Villages, River Basins, Rivers, Water Sources.
 * Implements SQL persistence with in-memory reference data fallback.
 */

import { DatabaseManager } from '../connection';
import { DISTRICTS_DATA } from '../../data/jaldrishtiData';
import { INDIA_RIVERS_DATA } from '../../data/riverData';

export interface StateRecord {
  stateId: string;
  name: string;
  code: string;
  country: string;
}

export interface DistrictRecord {
  districtId: string;
  stateId: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  populationCensus2011?: number;
  sviScore: number;
  sviSource: string;
}

export interface VillageRecord {
  villageId: string;
  districtId: string;
  name: string;
  latitude: number;
  longitude: number;
  population?: number;
  isFloodProne: boolean;
}

export interface RiverBasinRecord {
  basinId: string;
  name: string;
  majorRiverName: string;
  drainageAreaSqKm?: number;
}

export interface RiverRecord {
  riverId: string;
  basinId: string;
  name: string;
  type: string;
  lengthKm: number;
  originPoint: string;
  outflowPoint: string;
  flowRate: string;
  path: [number, number][];
}

export interface WaterSourceRecord {
  sourceId: string;
  districtId: string;
  riverId?: string;
  name: string;
  sourceType: string;
  latitude: number;
  longitude: number;
  isDrinkingSource: boolean;
}

export class GeographicRepository {
  private static instance: GeographicRepository;

  private constructor() {}

  public static getInstance(): GeographicRepository {
    if (!GeographicRepository.instance) {
      GeographicRepository.instance = new GeographicRepository();
    }
    return GeographicRepository.instance;
  }

  // -------------------------------------------------------------
  // States
  // -------------------------------------------------------------
  public async getStates(): Promise<StateRecord[]> {
    const db = DatabaseManager.getInstance();
    const res = await db.query<any>('SELECT state_id, name, code, country FROM states ORDER BY name ASC;');
    if (res && res.rows.length > 0) {
      return res.rows.map((r) => ({
        stateId: r.state_id,
        name: r.name,
        code: r.code,
        country: r.country,
      }));
    }

    // In-Memory Fallback
    const uniqueStates = Array.from(new Set(DISTRICTS_DATA.map((d) => d.state)));
    return uniqueStates.map((name) => ({
      stateId: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      code: name.substring(0, 2).toUpperCase(),
      country: 'India',
    }));
  }

  // -------------------------------------------------------------
  // Districts
  // -------------------------------------------------------------
  public async getDistricts(filter: { state?: string; search?: string; page?: number; limit?: number } = {}): Promise<{
    districts: DistrictRecord[];
    total: number;
  }> {
    const db = DatabaseManager.getInstance();
    if (db.getStatus().isConnected) {
      let query = `
        SELECT d.district_id, d.state_id, d.name, s.name as state, d.latitude, d.longitude,
               d.population_census2011, v.svi_score, v.survey_source
        FROM districts d
        JOIN states s ON d.state_id = s.state_id
        LEFT JOIN vulnerability_indicators v ON d.district_id = v.district_id
        WHERE 1=1
      `;
      const params: any[] = [];
      let idx = 1;

      if (filter.state) {
        query += ` AND (LOWER(s.name) = LOWER($${idx}) OR LOWER(d.state_id) = LOWER($${idx}))`;
        params.push(filter.state);
        idx++;
      }

      if (filter.search) {
        query += ` AND (d.name ILIKE $${idx} OR s.name ILIKE $${idx})`;
        params.push(`%${filter.search}%`);
        idx++;
      }

      query += ` ORDER BY d.name ASC`;

      const res = await db.query<any>(query, params);
      if (res) {
        const rows = res.rows.map((r) => ({
          districtId: r.district_id,
          stateId: r.state_id,
          name: r.name,
          state: r.state,
          latitude: Number(r.latitude),
          longitude: Number(r.longitude),
          populationCensus2011: r.population_census2011,
          sviScore: Number(r.svi_score ?? 0.5),
          sviSource: r.survey_source ?? 'NFHS-5',
        }));

        const total = rows.length;
        const page = filter.page || 1;
        const limit = filter.limit || 50;
        const paged = rows.slice((page - 1) * limit, page * limit);
        return { districts: paged, total };
      }
    }

    // In-Memory Reference Data Fallback
    let filtered = [...DISTRICTS_DATA];
    if (filter.state) {
      filtered = filtered.filter(
        (d) =>
          d.state.toLowerCase() === filter.state?.toLowerCase() ||
          d.state.toLowerCase().replace(/\s+/g, '_') === filter.state?.toLowerCase()
      );
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter((d) => d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q));
    }

    const total = filtered.length;
    const page = filter.page || 1;
    const limit = filter.limit || 50;
    const paged = filtered.slice((page - 1) * limit, page * limit);

    return {
      districts: paged.map((d) => ({
        districtId: d.id,
        stateId: d.state.toLowerCase().replace(/\s+/g, '_'),
        name: d.name,
        state: d.state,
        latitude: d.lat,
        longitude: d.lng,
        populationCensus2011: 1500000,
        sviScore: d.sviScore,
        sviSource: d.sviSource,
      })),
      total,
    };
  }

  public async getDistrictById(districtId: string): Promise<DistrictRecord | null> {
    const list = await this.getDistricts();
    return list.districts.find((d) => d.districtId === districtId) || null;
  }

  // -------------------------------------------------------------
  // Villages
  // -------------------------------------------------------------
  public async getVillages(districtId?: string): Promise<VillageRecord[]> {
    const db = DatabaseManager.getInstance();
    if (db.getStatus().isConnected) {
      let query = 'SELECT village_id, district_id, name, ST_Y(location) as lat, ST_X(location) as lng, population, is_flood_prone FROM villages';
      const params: any[] = [];
      if (districtId) {
        query += ' WHERE district_id = $1';
        params.push(districtId);
      }
      const res = await db.query<any>(query, params);
      if (res && res.rows.length > 0) {
        return res.rows.map((r) => ({
          villageId: r.village_id,
          districtId: r.district_id,
          name: r.name,
          latitude: Number(r.lat),
          longitude: Number(r.lng),
          population: r.population,
          isFloodProne: Boolean(r.is_flood_prone),
        }));
      }
    }

    // In-Memory Representative Villages
    const dId = districtId || 'patna_bihar';
    const dist = DISTRICTS_DATA.find((d) => d.id === dId) || DISTRICTS_DATA[0];
    return [
      {
        villageId: `${dist.id}_v1`,
        districtId: dist.id,
        name: `${dist.name} Diara Basin`,
        latitude: dist.lat + 0.02,
        longitude: dist.lng + 0.03,
        population: 4200,
        isFloodProne: true,
      },
      {
        villageId: `${dist.id}_v2`,
        districtId: dist.id,
        name: `${dist.name} Rural Char Settlement`,
        latitude: dist.lat - 0.04,
        longitude: dist.lng + 0.01,
        population: 2800,
        isFloodProne: true,
      },
    ];
  }

  // -------------------------------------------------------------
  // River Basins
  // -------------------------------------------------------------
  public async getRiverBasins(): Promise<RiverBasinRecord[]> {
    return INDIA_RIVERS_DATA.map((r) => ({
      basinId: `basin_${r.id}`,
      name: `${r.name} Basin`,
      majorRiverName: r.name,
      drainageAreaSqKm: r.lengthKm * 180,
    }));
  }

  // -------------------------------------------------------------
  // Rivers
  // -------------------------------------------------------------
  public async getRivers(): Promise<RiverRecord[]> {
    return INDIA_RIVERS_DATA.map((r) => ({
      riverId: r.id,
      basinId: `basin_${r.id}`,
      name: r.name,
      type: r.type,
      lengthKm: r.lengthKm,
      originPoint: r.origin,
      outflowPoint: r.outflow,
      flowRate: r.flowRate,
      path: r.path,
    }));
  }

  public async getRiverById(riverId: string): Promise<RiverRecord | null> {
    const rivers = await this.getRivers();
    return rivers.find((r) => r.riverId === riverId) || null;
  }

  // -------------------------------------------------------------
  // Water Sources
  // -------------------------------------------------------------
  public async getWaterSources(districtId?: string): Promise<WaterSourceRecord[]> {
    const districts = districtId ? DISTRICTS_DATA.filter((d) => d.id === districtId) : DISTRICTS_DATA;
    return districts.map((d, idx) => ({
      sourceId: `WS_${d.id.toUpperCase()}_01`,
      districtId: d.id,
      riverId: d.waterProximityKm < 3.0 ? 'ganges' : undefined,
      name: `${d.name} Municipal River Surface Intake`,
      sourceType: d.waterProximityKm < 3.0 ? 'River Surface Intake' : 'Deep Alluvial Wellfield',
      latitude: d.lat + 0.01,
      longitude: d.lng + 0.01,
      isDrinkingSource: true,
    }));
  }
}
