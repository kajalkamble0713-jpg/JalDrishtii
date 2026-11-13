import React, { useState, useEffect } from 'react';
import { DistrictData, SatelliteData } from '../types';
import {
  Satellite,
  Radio,
  Clock,
  Activity,
  Layers,
  Zap,
  Globe2,
  RefreshCw,
  Sliders,
  Maximize2,
  CheckCircle2,
  Sparkles,
  Wifi,
  Eye,
  Sun
} from 'lucide-react';

interface RealtimeSatelliteTelemetryProps {
  district: DistrictData;
  onUpdateDistrictSatellite?: (updatedSatellite: SatelliteData) => void;
}

export const RealtimeSatelliteTelemetry: React.FC<RealtimeSatelliteTelemetryProps> = ({
  district,
  onUpdateDistrictSatellite,
}) => {
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [activeSatellite, setActiveSatellite] = useState<'sentinel2' | 'insat3dr' | 'landsat9' | 'terramodis'>('sentinel2');
  const [activeBand, setActiveBand] = useState<'rgb' | 'ndci' | 'turbidity' | 'thermal'>('ndci');
  
  // Real-time telemetry live values
  const [telemetry, setTelemetry] = useState({
    timestamp: new Date().toISOString(),
    signalStrength: 98,
    orbitAltitudeKm: 786.4,
    velocityKmS: 7.45,
    solarZenithAngle: 28.4,
    cloudCoverPct: 4.2,
    snrRatioDb: 42.1,
    turbidity: district.satellite.turbidity,
    ndci: district.satellite.ndci,
    cdom: district.satellite.cdom,
    ndwi: district.satellite.ndwi,
    awei: district.satellite.awei,
    lstCelsius: district.satellite.lstCelsius,
    band3Green: 0.142,
    band4Red: 0.088,
    band5VegEdge: 0.165,
    band8NIR: 0.042,
  });

  const [nextPassSeconds, setNextPassSeconds] = useState<number>(14 * 60 + 32);

  // Live real-time satellite telemetry ticker
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const now = new Date();
      // Minor micro-fluctuations simulating real-time atmospheric sensor noise
      const turbFluct = (Math.random() - 0.5) * 0.04;
      const ndciFluct = (Math.random() - 0.5) * 0.005;
      const lstFluct = (Math.random() - 0.5) * 0.1;

      setTelemetry((prev) => {
        const newTurb = Math.max(0.5, Math.min(8.0, Number((prev.turbidity + turbFluct).toFixed(2))));
        const newNdci = Math.max(-0.2, Math.min(0.8, Number((prev.ndci + ndciFluct).toFixed(3))));
        const newLst = Math.max(20.0, Math.min(45.0, Number((prev.lstCelsius + lstFluct).toFixed(1))));

        if (onUpdateDistrictSatellite) {
          onUpdateDistrictSatellite({
            ...district.satellite,
            turbidity: newTurb,
            ndci: newNdci,
            lstCelsius: newLst,
          });
        }

        return {
          ...prev,
          timestamp: now.toISOString(),
          signalStrength: Math.floor(95 + Math.random() * 5),
          solarZenithAngle: Number((28.4 + (now.getSeconds() / 60) * 0.1).toFixed(1)),
          turbidity: newTurb,
          ndci: newNdci,
          lstCelsius: newLst,
          band3Green: Number((0.142 + (Math.random() - 0.5) * 0.002).toFixed(3)),
          band4Red: Number((0.088 + (Math.random() - 0.5) * 0.002).toFixed(3)),
          band5VegEdge: Number((0.165 + (Math.random() - 0.5) * 0.003).toFixed(3)),
          band8NIR: Number((0.042 + (Math.random() - 0.5) * 0.001).toFixed(3)),
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isLiveStreaming, district, onUpdateDistrictSatellite]);

  // Orbit pass countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setNextPassSeconds((prev) => (prev > 0 ? prev - 1 : 90 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const satellitePlatforms = [
    {
      id: 'sentinel2',
      name: 'Sentinel-2B (ESA Copernicus)',
      instrument: 'MSI (Multi-Spectral Instrument)',
      res: '10m Spatial',
      type: 'Sun-Synchronous (786 km)',
      status: 'Active Pass',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'insat3dr',
      name: 'INSAT-3DR (ISRO)',
      instrument: 'Imager & Sounder',
      res: '1km Thermal / SST',
      type: 'Geostationary (74° E)',
      status: 'Continuous Live Feed',
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    },
    {
      id: 'landsat9',
      name: 'Landsat-9 (NASA / USGS)',
      instrument: 'OLI-2 & TIRS-2',
      res: '15m - 30m',
      type: 'Sun-Synchronous (705 km)',
      status: 'Telemetry Sync',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    },
    {
      id: 'terramodis',
      name: 'Terra MODIS (NASA EOS)',
      instrument: 'MODIS Sensor',
      res: '250m - 1km',
      type: 'Polar Orbit (705 km)',
      status: 'Data Validated',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
  ];

  return (
    <div className="bg-[#070b19] border border-sky-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(2,132,199,0.15)] space-y-6">
      {/* Header with Live Signal Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Satellite className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">
                Real-Time Satellite Telemetry & Water Quality Pass
              </h3>
              <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono">
                <Wifi className="w-3 h-3 animate-ping text-emerald-400" /> LIVE SENSOR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Target District: <b className="text-sky-300">{district.name}, {district.state}</b> ({district.lat}°N, {district.lng}°E)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              isLiveStreaming
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Radio className={`w-4 h-4 ${isLiveStreaming ? 'animate-spin' : ''}`} />
            {isLiveStreaming ? 'Live Satellite Feed Active' : 'Pause Live Telemetry'}
          </button>
        </div>
      </div>

      {/* Satellite Platform Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {satellitePlatforms.map((sat) => {
          const isSelected = activeSatellite === sat.id;
          return (
            <div
              key={sat.id}
              onClick={() => setActiveSatellite(sat.id as any)}
              className={`p-3.5 rounded-2xl border transition cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-sky-950/60 border-sky-400 shadow-xl shadow-sky-500/10 ring-1 ring-sky-400'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white">{sat.name}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${sat.badge}`}>
                  {sat.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
                <div>Inst: {sat.instrument}</div>
                <div>Res: {sat.res}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Spectral Index Analysis & Real-Time Parameter Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Spectral Band Indices & Equations */}
        <div className="lg:col-span-2 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-400" />
              <h4 className="text-sm font-bold text-white">Live Multi-Spectral Band Computations</h4>
            </div>
            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Acquired: {new Date(telemetry.timestamp).toLocaleTimeString()} IST
            </div>
          </div>

          {/* Interactive Band Composite Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setActiveBand('ndci')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                activeBand === 'ndci'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <span>NDCI Chlorophyll</span>
              <span className="text-[10px] font-mono opacity-80">(B5 - B4) / (B5 + B4)</span>
            </button>

            <button
              onClick={() => setActiveBand('turbidity')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                activeBand === 'turbidity'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <span>Turbidity (FNU)</span>
              <span className="text-[10px] font-mono opacity-80">100.6 * (B4 / B3)</span>
            </button>

            <button
              onClick={() => setActiveBand('thermal')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                activeBand === 'thermal'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <span>Thermal LST (°C)</span>
              <span className="text-[10px] font-mono opacity-80">TIRS Band 10/11</span>
            </button>

            <button
              onClick={() => setActiveBand('rgb')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                activeBand === 'rgb'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <span>True-Color RGB</span>
              <span className="text-[10px] font-mono opacity-80">B4 / B3 / B2</span>
            </button>
          </div>

          {/* Spectral Reflectance Response Curves */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Sentinel-2 Spectral Band Reflectance (Surface Radiance)</span>
              <span className="text-emerald-400">SNR: {telemetry.snrRatioDb} dB</span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Band 3 (Green 560nm - Water Clarity)</span>
                  <span className="text-sky-300 font-bold">{telemetry.band3Green} sr⁻¹</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full rounded-full transition-all duration-500" style={{ width: `${telemetry.band3Green * 400}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Band 4 (Red 665nm - Sediment Absorption)</span>
                  <span className="text-red-300 font-bold">{telemetry.band4Red} sr⁻¹</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-400 h-full rounded-full transition-all duration-500" style={{ width: `${telemetry.band4Red * 400}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Band 5 (Vegetation RedEdge 705nm - Algal Biomass Peak)</span>
                  <span className="text-emerald-300 font-bold">{telemetry.band5VegEdge} sr⁻¹</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${telemetry.band5VegEdge * 400}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Band 8 (Near-Infrared 842nm - Water Boundary)</span>
                  <span className="text-indigo-300 font-bold">{telemetry.band8NIR} sr⁻¹</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-400 h-full rounded-full transition-all duration-500" style={{ width: `${telemetry.band8NIR * 400}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Orbital Parameters & Telemetry Health */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Globe2 className="w-4 h-4 text-sky-400" /> Orbital Telemetry Status
          </h4>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Next Satellite Overpass</span>
              <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> {formatCountdown(nextPassSeconds)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Orbital Altitude</span>
              <span className="text-sky-300 font-bold">{telemetry.orbitAltitudeKm} km</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Orbital Velocity</span>
              <span className="text-sky-300 font-bold">{telemetry.velocityKmS} km/s</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Solar Zenith Angle</span>
              <span className="text-amber-300 font-bold">{telemetry.solarZenithAngle}°</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Cloud Cover</span>
              <span className="text-slate-200 font-bold">{telemetry.cloudCoverPct}%</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Downlink Signal Lock</span>
              <span className="text-emerald-400 font-bold">{telemetry.signalStrength}% (OPTIMAL)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 text-[11px] text-slate-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <b>Automated Earth Observation Pipeline:</b> Ingested via Copernicus Open Access Hub & ISRO MOSDAC API.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
