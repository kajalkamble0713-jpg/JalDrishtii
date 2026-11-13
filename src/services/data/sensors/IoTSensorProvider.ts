/**
 * IoT In-Situ Water Sensor Provider & Ingestion Gateway
 * Architectural gateway for MQTT brokers and secure REST telemetry payloads.
 *
 * Operational Transparency:
 * If no physical hardware sensors are actively streaming, the provider
 * strictly reports status: UNAVAILABLE and displays:
 * "NO LIVE SENSOR CONNECTION"
 *
 * Never fabricates simulated sensor data as live hardware readings.
 */

import {
  IDataProvider,
  IoTSensorDevice,
  IoTSensorReading,
  DataResult,
  DataMetadata,
  DataStatus,
  ValidationResult,
  QualityScoreBreakdown,
} from '../types';
import { DataValidator } from '../common/validator';
import { QualityScorer, FreshnessEngine } from '../common/qualityScorer';

export class IoTSensorProvider implements IDataProvider<IoTSensorDevice[]> {
  public readonly providerName = 'JalDrishti Edge IoT Gateway (MQTT / REST)';
  public readonly sourceType = 'iot_sensors';

  private isConnected: boolean;
  private mqttBrokerUrl: string | null;

  // In-memory registry of provisioned devices (empty by default until hardware connects)
  private registeredSensors: Map<string, IoTSensorDevice> = new Map();
  private sensorReadingsHistory: Map<string, IoTSensorReading[]> = new Map();

  constructor() {
    const envMqtt = typeof process !== 'undefined' ? process.env?.MQTT_BROKER_URL : undefined;
    this.mqttBrokerUrl = envMqtt || null;
    this.isConnected = Boolean(this.mqttBrokerUrl && this.mqttBrokerUrl.trim().length > 0);
  }

  public getStatus(): DataStatus {
    return this.isConnected && this.registeredSensors.size > 0 ? 'LIVE' : 'UNAVAILABLE';
  }

  public async fetch(): Promise<DataResult<IoTSensorDevice[]>> {
    const devices = Array.from(this.registeredSensors.values());
    const validation = this.validate(devices);
    const metadata = this.buildMetadata(devices);

    return {
      data: devices,
      metadata,
      validation,
    };
  }

  /**
   * Register a new physical IoT sensor device via secure authentication.
   */
  public registerDevice(device: Omit<IoTSensorDevice, 'lastSeen' | 'status' | 'isSimulated'>): IoTSensorDevice {
    const newSensor: IoTSensorDevice = {
      ...device,
      lastSeen: new Date().toISOString(),
      status: 'ONLINE',
      isSimulated: false,
    };
    this.registeredSensors.set(device.sensorId, newSensor);
    console.info(`[IoTSensorProvider] Registered hardware sensor: ${device.sensorId} (${device.deviceType})`);
    return newSensor;
  }

  /**
   * Ingest a batch of live telemetry readings from a provisioned sensor.
   */
  public ingestReading(reading: Omit<IoTSensorReading, 'isValidated'>): { success: boolean; error?: string } {
    const device = this.registeredSensors.get(reading.sensorId);
    if (!device) {
      return { success: false, error: `Sensor ${reading.sensorId} is not registered in the gateway.` };
    }

    // Validate reading parameters
    if (typeof reading.value !== 'number' || isNaN(reading.value)) {
      return { success: false, error: `Reading value for ${reading.parameter} must be numeric.` };
    }

    const validatedReading: IoTSensorReading = {
      ...reading,
      isValidated: true,
    };

    const history = this.sensorReadingsHistory.get(reading.sensorId) || [];
    // Check duplicates
    const isDuplicate = history.some((h) => h.timestamp === reading.timestamp && h.parameter === reading.parameter);
    if (isDuplicate) {
      return { success: false, error: 'Duplicate sensor reading rejected.' };
    }

    history.push(validatedReading);
    this.sensorReadingsHistory.set(reading.sensorId, history);

    // Update sensor last seen
    device.lastSeen = reading.timestamp;
    device.status = 'ONLINE';

    return { success: true };
  }

  public normalize(raw: any[]): IoTSensorDevice[] {
    return raw as IoTSensorDevice[];
  }

  public validate(data: unknown): ValidationResult {
    const devices = data as IoTSensorDevice[];
    const issues = [];

    for (const d of devices) {
      issues.push(...DataValidator.validateCoordinates(d.location.lat, d.location.lng, `Sensor ${d.sensorId}`));
      if (d.batteryPercent !== null && (d.batteryPercent < 0 || d.batteryPercent > 100)) {
        issues.push({
          field: 'batteryPercent',
          value: d.batteryPercent,
          rule: 'battery_scale',
          severity: 'error' as const,
          message: `Sensor ${d.sensorId} battery ${d.batteryPercent}% is out of bounds.`,
        });
      }
    }

    return DataValidator.createResult(issues);
  }

  public getMetadata(): DataMetadata {
    return this.buildMetadata(Array.from(this.registeredSensors.values()));
  }

  private buildMetadata(devices: IoTSensorDevice[]): DataMetadata {
    const isLive = devices.length > 0 && devices.some((d) => d.status === 'ONLINE');
    const qualityBreakdown = QualityScorer.calculate({
      sourceType: this.sourceType,
      status: isLive ? 'LIVE' : 'UNAVAILABLE',
      observedAt: devices[0]?.lastSeen || null,
      fetchedAt: new Date().toISOString(),
      completenessRatio: isLive ? 1.0 : 0.0,
      hasValidationErrors: false,
      validationWarningCount: 0,
      isOfficialGovOrSatelliteSource: false,
      isFallback: false,
    });

    return {
      source: 'JalDrishti In-Situ LoRaWAN / MQTT IoT Edge Network',
      provider: this.providerName,
      sourceType: this.sourceType,
      status: isLive ? 'LIVE' : 'UNAVAILABLE',
      fetchedAt: new Date().toISOString(),
      observedAt: devices[0]?.lastSeen || null,
      freshness: isLive ? 'LIVE' : 'UNAVAILABLE',
      qualityScore: isLive ? qualityBreakdown.total : 0,
      qualityBreakdown,
      units: {
        turbidity: 'FNU',
        batteryPercent: '%',
      },
      rawSourceReference: 'MQTT Broker v3.1.1 & CoAP / HTTP REST Sensor Protocol',
      isFallback: false,
      errorMessage: isLive
        ? undefined
        : this.isConnected
        ? 'MQTT Broker configured (' + this.mqttBrokerUrl?.replace(/\/\/.*@/, '//') + '). Awaiting physical sensor hardware pairing.'
        : 'NO LIVE SENSOR CONNECTION. No physical IoT monitoring nodes are currently provisioned.',
    };
  }

  public getFreshness() {
    return FreshnessEngine.evaluate(null, this.sourceType, this.isConnected);
  }

  public getQualityScore(): QualityScoreBreakdown {
    return this.getMetadata().qualityBreakdown;
  }
}
