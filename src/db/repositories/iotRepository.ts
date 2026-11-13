/**
 * JalDrishti IoT Water Sensor Telemetry Repository
 * Manages physical/edge telemetry nodes, readings, and hardware battery/signal health.
 * Interacts with PostgreSQL PostGIS tables with in-memory store fallback.
 */

import { DatabaseManager } from '../connection.js';

export interface SensorRecord {
  sensorId: string;
  districtId: string;
  waterSourceId?: string;
  deviceType: string;
  hardwareModel?: string;
  firmwareVersion: string;
  latitude: number;
  longitude: number;
  status: 'ONLINE' | 'OFFLINE' | 'NO_CONNECTION' | 'DEGRADED';
  lastSeen?: string;
  created_at?: string;
}

export interface SensorReadingRecord {
  readingId: string;
  sensorId: string;
  parameter: string;
  value: number;
  unit: string;
  timestamp: string;
  receivedAt: string;
  qualityStatus: string;
  validationStatus: string;
}

export interface SensorHealthRecord {
  healthId: string;
  sensorId: string;
  batteryPercent: number;
  signalStrengthDbm: number;
  packetLossRate: number;
  reportedAt: string;
}

export class IoTRepository {
  private static instance: IoTRepository;

  private inMemorySensors: SensorRecord[] = [
    {
      sensorId: 'NODE_GANGES_PATNA_01',
      districtId: 'patna_bihar',
      deviceType: 'Multi-Parameter Optical Sonde',
      hardwareModel: 'YSI EXO2 LoRaWAN Gateway',
      firmwareVersion: 'v2.1.4-lora',
      latitude: 25.5941,
      longitude: 85.1376,
      status: 'NO_CONNECTION',
      lastSeen: undefined,
    },
    {
      sensorId: 'NODE_BHAGALPUR_02',
      districtId: 'bhagalpur_bihar',
      deviceType: 'Turbidity & Fluorometer Probe',
      hardwareModel: 'In-Situ Aqua TROLL 600',
      firmwareVersion: 'v1.8.0-mesh',
      latitude: 25.2425,
      longitude: 86.9842,
      status: 'NO_CONNECTION',
      lastSeen: undefined,
    },
  ];

  private inMemoryReadings: SensorReadingRecord[] = [];
  private inMemoryHealth: SensorHealthRecord[] = [];

  private constructor() {}

  public static getInstance(): IoTRepository {
    if (!IoTRepository.instance) {
      IoTRepository.instance = new IoTRepository();
    }
    return IoTRepository.instance;
  }

  public async getSensors(districtId?: string): Promise<SensorRecord[]> {
    const db = DatabaseManager.getInstance();
    let sql = `
      SELECT sensor_id, district_id, water_source_id, device_type, hardware_model,
             firmware_version, latitude, longitude, status, last_seen
      FROM sensors
      WHERE 1=1
    `;
    const values: any[] = [];
    if (districtId) {
      sql += ` AND district_id = $1`;
      values.push(districtId);
    }
    sql += ` ORDER BY sensor_id ASC;`;

    const res = await db.query<any>(sql, values);
    if (res && res.rows.length > 0) {
      return res.rows.map((r) => ({
        sensorId: r.sensor_id,
        districtId: r.district_id,
        waterSourceId: r.water_source_id,
        deviceType: r.device_type,
        hardwareModel: r.hardware_model,
        firmwareVersion: r.firmware_version,
        latitude: r.latitude,
        longitude: r.longitude,
        status: r.status,
        lastSeen: r.last_seen,
      }));
    }

    return districtId
      ? this.inMemorySensors.filter((s) => s.districtId === districtId)
      : this.inMemorySensors;
  }

  public async registerSensor(sensor: SensorRecord): Promise<SensorRecord> {
    const db = DatabaseManager.getInstance();
    await db.query(
      `INSERT INTO sensors (sensor_id, district_id, water_source_id, device_type, hardware_model, firmware_version, location, latitude, longitude, status)
       VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326), $8, $7, $9)
       ON CONFLICT (sensor_id) DO UPDATE SET
         status = EXCLUDED.status,
         firmware_version = EXCLUDED.firmware_version,
         updated_at = NOW();`,
      [
        sensor.sensorId,
        sensor.districtId,
        sensor.waterSourceId || null,
        sensor.deviceType,
        sensor.hardwareModel || 'Generic Probe',
        sensor.firmwareVersion,
        sensor.longitude,
        sensor.latitude,
        sensor.status,
      ]
    );

    const existingIdx = this.inMemorySensors.findIndex((s) => s.sensorId === sensor.sensorId);
    if (existingIdx >= 0) {
      this.inMemorySensors[existingIdx] = sensor;
    } else {
      this.inMemorySensors.push(sensor);
    }

    return sensor;
  }

  public async addReading(reading: SensorReadingRecord): Promise<void> {
    const db = DatabaseManager.getInstance();
    await db.query(
      `INSERT INTO sensor_readings (reading_id, sensor_id, parameter, value, unit, timestamp, received_at, quality_status, validation_status)
       VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (sensor_id, parameter, timestamp) DO NOTHING;`,
      [
        reading.readingId,
        reading.sensorId,
        reading.parameter,
        reading.value,
        reading.unit,
        reading.timestamp,
        reading.receivedAt,
        reading.qualityStatus,
        reading.validationStatus,
      ]
    );

    this.inMemoryReadings.push(reading);
  }

  public async getReadings(sensorId?: string, limit = 50): Promise<SensorReadingRecord[]> {
    const db = DatabaseManager.getInstance();
    let sql = `
      SELECT reading_id, sensor_id, parameter, value, unit, timestamp, received_at, quality_status, validation_status
      FROM sensor_readings
      WHERE 1=1
    `;
    const values: any[] = [];
    if (sensorId) {
      sql += ` AND sensor_id = $1`;
      values.push(sensorId);
    }
    sql += ` ORDER BY timestamp DESC LIMIT $${values.length + 1};`;
    values.push(limit);

    const res = await db.query<any>(sql, values);
    if (res && res.rows.length > 0) {
      return res.rows.map((r) => ({
        readingId: r.reading_id,
        sensorId: r.sensor_id,
        parameter: r.parameter,
        value: r.value,
        unit: r.unit,
        timestamp: r.timestamp,
        receivedAt: r.received_at,
        qualityStatus: r.quality_status,
        validationStatus: r.validation_status,
      }));
    }

    return sensorId
      ? this.inMemoryReadings.filter((r) => r.sensorId === sensorId).slice(0, limit)
      : this.inMemoryReadings.slice(0, limit);
  }
}
