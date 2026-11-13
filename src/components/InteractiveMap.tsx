import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DiseaseType, DistrictData, RiverData } from '../types';
import { INDIA_STATES_GEOJSON } from '../data/indiaGeoJson';
import { INDIA_RIVERS_DATA } from '../data/riverData';
import { RiverDetailModal } from './RiverDetailModal';
import { Layers, ShieldAlert, Waves, ZoomIn, ZoomOut, Maximize2, Clock, Globe, Flame, Radio, ArrowUpRight, CheckCircle2, Search, Crosshair, ChevronRight, Info, TestTube2, Droplets, MapPin } from 'lucide-react';

// Fix Leaflet marker default icon issue in React/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  districts: DistrictData[];
  disease: DiseaseType;
  selectedDistrict: DistrictData | null;
  onSelectDistrict: (district: DistrictData) => void;
  onFocusGlobeDistrict?: (district: DistrictData) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  districts,
  disease,
  selectedDistrict,
  onSelectDistrict,
  onFocusGlobeDistrict,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const riversLayerRef = useRef<L.LayerGroup | null>(null);
  const statePolygonsLayerRef = useRef<L.GeoJSON | null>(null);
  const placeLabelsLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapTile, setMapTile] = useState<'dark' | 'satellite' | 'streets'>('dark');
  const [currentZoom, setCurrentZoom] = useState<number>(5);
  const [showPlaceLabels, setShowPlaceLabels] = useState<boolean>(true);
  const [showStatePolygons, setShowStatePolygons] = useState<boolean>(true);
  const [showRivers, setShowRivers] = useState<boolean>(true);
  const [showSpotlightCallouts, setShowSpotlightCallouts] = useState<boolean>(true);
  const [showRiskHalos, setShowRiskHalos] = useState<boolean>(true);
  const [showFieldSamples, setShowFieldSamples] = useState<boolean>(true);
  const [showWaterSources, setShowWaterSources] = useState<boolean>(true);
  const [samplesData, setSamplesData] = useState<any[]>([]);
  const [mapMode, setMapMode] = useState<'india' | 'world' | 'karnataka'>('india');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected river state for hydro-telemetry analysis
  const [selectedRiver, setSelectedRiver] = useState<RiverData | null>(null);
  const [activeRiverModal, setActiveRiverModal] = useState<RiverData | null>(null);

  // Filtered districts for search autocomplete dropdown
  const filteredDistricts = searchQuery.trim().length > 0
    ? districts.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.state.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Real-time ticking clock for live status
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase() +
        ' • ' +
        now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' IST'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch verified water samples data
  useEffect(() => {
    fetch('/api/v1/samples')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.samples) setSamplesData(d.samples);
      })
      .catch(() => {});
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center over Telangana / Central India
    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    // Dark Mode Tiles by default for Safeture/Riskline 2026 aesthetics
    const darkTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO &mdash; Risk Map 2026 Live GIS Engine',
      maxZoom: 18,
    }).addTo(map);

    // Layer groups for dynamic markers, rivers, and place labels
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    const riversGroup = L.layerGroup().addTo(map);
    riversLayerRef.current = riversGroup;

    const placeLabelsGroup = L.layerGroup().addTo(map);
    placeLabelsLayerRef.current = placeLabelsGroup;

    // Listen to zoom changes to dynamically reveal Google Maps style place labels
    const onZoom = () => {
      setCurrentZoom(map.getZoom());
    };
    map.on('zoomend', onZoom);
    setCurrentZoom(map.getZoom());

    return () => {
      map.off('zoomend', onZoom);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const isInitialMountRef = useRef<boolean>(true);

  // Switch between India Focus, World View & Karnataka Regional Focus
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    try {
      if (mapMode === 'india') {
        mapInstanceRef.current.flyTo([20.5937, 78.9629], 5, { duration: 1.5 });
      } else if (mapMode === 'karnataka') {
        mapInstanceRef.current.flyTo([14.5, 75.8], 7, { duration: 1.5 });
      } else {
        mapInstanceRef.current.flyTo([20.0, 10.0], 2, { duration: 1.5 });
      }
    } catch (err) {
      console.warn('[InteractiveMap] flyTo skipped during transition:', err);
    }
  }, [mapMode]);

  // Update Tile Layer on toggle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrls = {
      dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      streets: 'https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png',
    };

    const baseLayer = L.tileLayer(tileUrls[mapTile], {
      attribution: '&copy; OpenStreetMap &copy; CARTO &copy; Esri &mdash; Risk Map 2026 Live GIS',
      maxZoom: 19,
    }).addTo(map);

    // If Satellite mode is chosen, add Carto Voyager or Esri Reference label overlay so cities/borders/places are visible like Google Satellite Hybrid
    if (mapTile === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        opacity: 0.9,
      }).addTo(map);
    }
  }, [mapTile]);

  // Render State Polygon Boundaries (Choropleth Risk Map 2026)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (statePolygonsLayerRef.current) {
      map.removeLayer(statePolygonsLayerRef.current);
      statePolygonsLayerRef.current = null;
    }

    if (!showStatePolygons) return;

    const getStateColor = (riskTier: string) => {
      switch (riskTier) {
        case 'Very High': return '#dc2626'; // Critical Red
        case 'High': return '#ea580c'; // Orange
        case 'Moderate': return '#eab308'; // Yellow
        case 'Low': return '#16a34a'; // Green
        default: return '#16a34a';
      }
    };

    const geoJsonLayer = L.geoJSON(INDIA_STATES_GEOJSON as any, {
      style: (feature) => {
        const isKarnataka = feature?.properties?.name === 'Karnataka';
        const riskTier = feature?.properties?.riskTier || 'Low';
        const color = isKarnataka ? '#f59e0b' : getStateColor(riskTier);
        return {
          fillColor: color,
          fillOpacity: isKarnataka ? 0.45 : 0.35,
          weight: isKarnataka ? 3.5 : 2,
          color: isKarnataka ? '#fbbf24' : color,
          opacity: 1.0,
          dashArray: isKarnataka ? '4, 4' : '2, 4',
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        const isKarnataka = props.name === 'Karnataka';
        
        layer.bindTooltip(`
          <div style="font-family: system-ui, sans-serif; font-size: 11px; font-weight: 700; padding: 4px 6px; background: #080d22; border-radius: 8px; border: 1.5px solid ${isKarnataka ? '#fbbf24' : '#38bdf8'}; color: #fff;">
            <div style="color: ${isKarnataka ? '#fbbf24' : '#38bdf8'}; font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 4px;">
              ${isKarnataka ? '🟡 ' : ''}${props.name} (${props.code})
            </div>
            <div>Risk Index: <b style="color: ${props.riskTier === 'High' ? '#ea580c' : '#eab308'};">${props.riskTier}</b> (${(props.riskScore * 100).toFixed(0)}%)</div>
            <div style="font-size: 10px; color: #94a3b8;">Capital: ${props.capital}</div>
            ${props.population ? `<div style="font-size: 10px; color: #cbd5e1;">Pop: ${props.population}</div>` : ''}
            ${props.keyWaterBasins ? `<div style="font-size: 9.5px; color: #38bdf8; margin-top: 2px;">🌊 Basins: ${Array.isArray(props.keyWaterBasins) ? props.keyWaterBasins.join(', ') : props.keyWaterBasins}</div>` : ''}
            ${props.monitoredDistricts ? `<div style="font-size: 9.5px; color: #a7f3d0;">📍 Monitored: ${Array.isArray(props.monitoredDistricts) ? props.monitoredDistricts.join(', ') : props.monitoredDistricts}</div>` : ''}
            ${isKarnataka ? `<div style="font-size: 9px; color: #fbbf24; font-weight: 800; margin-top: 3px;">✨ High Priority Monitored State</div>` : ''}
          </div>
        `, {
          permanent: false,
          direction: 'center',
          className: 'state-risk-tooltip',
        });

        layer.on('mouseover', (e) => {
          const l = e.target;
          l.setStyle({
            fillOpacity: isKarnataka ? 0.65 : 0.6,
            weight: isKarnataka ? 5 : 3.5,
            color: isKarnataka ? '#fef08a' : '#ffffff',
          });
        });

        layer.on('mouseout', (e) => {
          geoJsonLayer.resetStyle(e.target);
        });

        layer.on('click', () => {
          if (isKarnataka && mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([14.5, 75.8], 7, { duration: 1.2 });
            setMapMode('karnataka');
          }
        });
      }
    }).addTo(map);

    statePolygonsLayerRef.current = geoJsonLayer;
  }, [showStatePolygons]);

  // Render Major Indian Rivers & Waterways
  useEffect(() => {
    if (!mapInstanceRef.current || !riversLayerRef.current) return;
    const riversGroup = riversLayerRef.current;
    riversGroup.clearLayers();

    if (!showRivers) return;

    INDIA_RIVERS_DATA.forEach(river => {
      const isSelected = selectedRiver?.id === river.id;
      const weight = isSelected ? 6.5 : 4.0;
      const opacity = isSelected ? 1.0 : 0.85;
      const color = isSelected
        ? '#00f2fe'
        : river.outbreakRiskLevel === 'Very High'
        ? '#ef4444'
        : river.outbreakRiskLevel === 'High'
        ? '#f97316'
        : '#38bdf8';

      const polyline = L.polyline(river.path as [number, number][], {
        color: color,
        weight: weight,
        opacity: opacity,
        dashArray: isSelected ? undefined : '6, 6',
      });

      polyline.bindTooltip(`
        <div style="font-family: system-ui, sans-serif; padding: 6px; font-size: 11px; background: #080d22; color: #ffffff; border-radius: 8px; border: 1.5px solid ${color}; shadow: 0 4px 12px rgba(0,0,0,0.8);">
          <div style="font-weight: 800; color: #38bdf8; font-size: 12px; margin-bottom: 2px;">🌊 ${river.name}</div>
          <div style="color: #cbd5e1; font-size: 10px; margin-bottom: 3px;">${river.type} • ${river.lengthKm.toLocaleString()} KM Basin</div>
          <div>Turbidity: <b style="color: #fbbf24;">${river.turbidity}</b> • Flow: <b>${river.flowRate}</b></div>
          <div>Outbreak Risk: <b style="color: ${color};">${river.outbreakRiskLevel}</b></div>
          <div style="font-size: 10px; color: #38bdf8; font-weight: 700; margin-top: 5px; text-decoration: underline;">👉 Click river to view transited districts & hydro-telemetry</div>
        </div>
      `, { permanent: false, sticky: true });

      polyline.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedRiver(river);
        setActiveRiverModal(river);

        if (mapInstanceRef.current) {
          const bounds = L.polyline(river.path as [number, number][]).getBounds();
          mapInstanceRef.current.flyToBounds(bounds, { padding: [60, 60], duration: 1.2 });
        }
      });

      polyline.on('mouseover', (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 7,
          opacity: 1.0,
          color: '#00f2fe',
        });
      });

      polyline.on('mouseout', (e) => {
        const layer = e.target;
        if (selectedRiver?.id !== river.id) {
          layer.setStyle({
            weight: 4.0,
            opacity: 0.85,
            color: color,
          });
        }
      });

      riversGroup.addLayer(polyline);
    });
  }, [showRivers, selectedRiver]);

  // Render District Markers & Callout Spotlight Annotations (Safeture 2026 Style)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    const getProb = (d: DistrictData) => {
      if (disease === 'ADD') return d.addProbability;
      if (disease === 'Cholera') return d.choleraProbability;
      return d.typhoidProbability;
    };

    const activeDistricts = mapMode === 'karnataka'
      ? districts.filter((d) => d.state === 'Karnataka')
      : districts;

    // Determine top 3 highest risk districts to feature cleanly with offset callouts
    const sortedByRisk = activeDistricts.slice().sort((a, b) => getProb(b) - getProb(a));
    const featuredDistrictIds = new Set([
      ...(selectedDistrict ? [selectedDistrict.id] : []),
      ...sortedByRisk.slice(0, 3).map((d) => d.id),
    ]);

    // Offset anchors to prevent overlapping callout boxes
    const anchorOffsets: [number, number][] = [
      [-15, 40],    // Top-Right offset
      [150, -25],   // Bottom-Right offset
      [-160, -20],  // Top-Left offset
      [20, -55],    // Bottom-Left offset
    ];

    activeDistricts.forEach((d, index) => {
      const prob = getProb(d);

      let color = '#22c55e'; // Low
      if (prob >= 0.8) color = '#ef4444'; // Very High
      else if (prob >= 0.65) color = '#f97316'; // High
      else if (prob >= 0.4) color = '#eab308'; // Moderate

      const isSelected = selectedDistrict?.id === d.id;
      const isFeatured = featuredDistrictIds.has(d.id);

      // Custom Glowing Pin
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '36px' : '28px'};
            height: ${isSelected ? '36px' : '28px'};
            background: ${color};
            border: ${isSelected ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.9)'};
            border-radius: 50%;
            box-shadow: 0 0 18px ${color};
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <span style="
              color: white;
              font-weight: 900;
              font-size: ${isSelected ? '12px' : '10px'};
              font-family: monospace;
            ">${(prob * 100).toFixed(0)}%</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([d.lat, d.lng], { icon: customIcon });

      // Clean, non-overlapping Callout Spotlight Card for Featured Districts
      if (showSpotlightCallouts && isFeatured) {
        const offsetIndex = (index % anchorOffsets.length);
        const anchorOffset = anchorOffsets[offsetIndex];

        const calloutHtml = `
          <div style="
            background: rgba(6, 10, 24, 0.94);
            backdrop-filter: blur(12px);
            border: 1.5px solid ${color};
            border-radius: 10px;
            padding: 6px 10px;
            color: #ffffff;
            font-family: system-ui, sans-serif;
            box-shadow: 0 8px 20px rgba(0,0,0,0.85);
            white-space: nowrap;
            pointer-events: none;
          ">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
              <span style="font-weight: 800; font-size: 11px; color: #f8fafc;">${d.name}</span>
              <span style="background: ${color}; color: #fff; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 999px;">
                ${(prob * 100).toFixed(0)}% ${d.riskTier.toUpperCase()}
              </span>
            </div>
            <div style="font-size: 9.5px; color: #94a3b8; margin-top: 2px;">
              ${d.state} • Turbidity: <b style="color: #fbbf24;">${d.satellite.turbidity} FNU</b>
            </div>
          </div>
        `;

        const calloutIcon = L.divIcon({
          className: 'spotlight-callout-card',
          html: calloutHtml,
          iconSize: [160, 50],
          iconAnchor: anchorOffset,
        });

        const calloutMarker = L.marker([d.lat, d.lng], { icon: calloutIcon, interactive: false });
        markersGroup.addLayer(calloutMarker);
      }

      // Popup Content on Click
      const isKarnataka = d.state === 'Karnataka';
      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 285px; max-width: 320px; padding: 4px; color: #0f172a;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #0f172a; line-height: 1.2;">
                ${d.name}, ${d.state}
              </div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                GPS: ${d.lat.toFixed(3)}°N, ${d.lng.toFixed(3)}°E • River: <b>${d.waterProximityKm} km</b>
              </div>
            </div>
            <span style="background: ${color}20; color: ${color}; border: 1px solid ${color}60; font-size: 11px; font-weight: 800; padding: 2px 7px; border-radius: 999px; white-space: nowrap;">
              ${(prob * 100).toFixed(0)}% ${d.riskTier.toUpperCase()}
            </span>
          </div>

          ${isKarnataka ? `
            <div style="display: inline-block; background: #fef3c7; color: #92400e; font-size: 9.5px; font-weight: 800; padding: 2px 7px; border-radius: 6px; margin-bottom: 6px; border: 1px solid #fde68a;">
              ⭐ Karnataka Hydrological Network
            </div>
          ` : ''}

          <!-- Header for the 6 Water Quality Indices -->
          <div style="background: #f1f5f9; border-radius: 7px; padding: 5px 8px; margin: 6px 0; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
              6 Water Quality & Satellite Indices
            </span>
            <span style="font-size: 9px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 1px 5px; border-radius: 4px;">
              Sentinel-2 & MODIS
            </span>
          </div>

          <!-- 6 Water Quality Indices 2-Column Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 7px;">
            <!-- 1. Turbidity -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 7px;">
              <div style="font-size: 9.5px; color: #64748b; font-weight: 600;">1. Turbidity (Clarity)</div>
              <div style="font-size: 12px; font-weight: 800; color: ${d.satellite.turbidity > 3.5 ? '#dc2626' : '#0284c7'}; font-family: monospace;">
                ${d.satellite.turbidity} <span style="font-size: 9px; font-weight: 600;">FNU</span>
              </div>
            </div>

            <!-- 2. NDCI (Chlorophyll-a) -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 7px;">
              <div style="font-size: 9.5px; color: #64748b; font-weight: 600;">2. NDCI (Algal/Chl-a)</div>
              <div style="font-size: 12px; font-weight: 800; color: ${d.satellite.ndci > 0.28 ? '#dc2626' : '#16a34a'}; font-family: monospace;">
                ${d.satellite.ndci}
              </div>
            </div>

            <!-- 3. CDOM (Dissolved Organics) -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 7px;">
              <div style="font-size: 9.5px; color: #64748b; font-weight: 600;">3. CDOM (Organic Matter)</div>
              <div style="font-size: 12px; font-weight: 800; color: #7c3aed; font-family: monospace;">
                ${d.satellite.cdom} <span style="font-size: 9px; font-weight: 600;">rel</span>
              </div>
            </div>

            <!-- 4. NDWI (Water Extent) -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 7px;">
              <div style="font-size: 9.5px; color: #64748b; font-weight: 600;">4. NDWI (Water Index)</div>
              <div style="font-size: 12px; font-weight: 800; color: #0284c7; font-family: monospace;">
                ${d.satellite.ndwi}
              </div>
            </div>

            <!-- 5. AWEI (Water Extraction) -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 7px;">
              <div style="font-size: 9.5px; color: #64748b; font-weight: 600;">5. AWEI (Water Extract)</div>
              <div style="font-size: 12px; font-weight: 800; color: #0d9488; font-family: monospace;">
                ${d.satellite.awei}
              </div>
            </div>

            <!-- 6. LST (Water Surface Temp) -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 7px;">
              <div style="font-size: 9.5px; color: #64748b; font-weight: 600;">6. LST (Surface Temp)</div>
              <div style="font-size: 12px; font-weight: 800; color: ${d.satellite.lstCelsius > 34 ? '#ea580c' : '#2563eb'}; font-family: monospace;">
                ${d.satellite.lstCelsius}°C
              </div>
            </div>
          </div>

          <!-- SVI & River distance footer -->
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #475569; background: #f8fafc; padding: 4px 8px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 6px;">
            <span>• <b>SVI Score:</b> ${d.sviScore} (${d.sviSource})</span>
            <span>• <b>Outbreak Records:</b> ${d.outbreakRecords || 12}</span>
          </div>

          ${onFocusGlobeDistrict ? `
            <button
              id="focus-btn-${d.id}"
              style="width: 100%; padding: 6px 10px; background: linear-gradient(135deg, #0284c7, #2563eb); color: #ffffff; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 2px 4px rgba(2,132,199,0.25);"
            >
              Focus District Telemetry & 30-Day Forecast →
            </button>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, { minWidth: 285 });
      marker.on('click', () => onSelectDistrict(d));
      marker.on('popupopen', () => {
        onSelectDistrict(d);
        const btn = document.getElementById(`focus-btn-${d.id}`);
        if (btn && onFocusGlobeDistrict) {
          btn.onclick = () => onFocusGlobeDistrict(d);
        }
      });
      markersGroup.addLayer(marker);
    });


    // Water Samples Investigation Markers
    if (showFieldSamples && samplesData.length > 0) {
      samplesData.forEach((sample) => {
        if (sample.latitude && sample.longitude) {
          const sampleIcon = L.divIcon({
            className: 'field-sample-marker',
            html: `
              <div style="
                background: rgba(13, 148, 136, 0.95);
                border: 2px solid #5eead4;
                border-radius: 9999px;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 14px rgba(20, 184, 166, 0.8);
                font-size: 14px;
                cursor: pointer;
              ">
                🧪
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const sampleMarker = L.marker([sample.latitude, sample.longitude], { icon: sampleIcon });
          sampleMarker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; min-width: 230px; padding: 6px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 800; color: #0f766e; font-size: 13px;">Water Sample Record</span>
                <span style="background: #ccfbf1; color: #0f766e; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 9999px;">
                  ${sample.status}
                </span>
              </div>
              <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">
                ID: ${sample.sampleId}
              </div>
              <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
                Source: <b>${sample.waterSourceName}</b> (${sample.districtName})
              </div>
              <div style="font-size: 11px; color: #334155; line-height: 1.5; background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0;">
                • <b>Type:</b> ${sample.sampleType}<br/>
                • <b>Preservation:</b> ${sample.preservationMethod}<br/>
                • <b>QC Status:</b> <span style="font-weight: 800; color: ${sample.qcStatus === 'VALID' ? '#16a34a' : '#d97706'}">${sample.qcStatus}</span><br/>
                • <b>Collector:</b> ${sample.collectorName} (${sample.collectorRole})<br/>
                • <b>Location:</b> ${sample.locationVerified ? '✅ GPS Verified' : '⚠️ Location Unavailable'}
              </div>
            </div>
          `);
          markersGroup.addLayer(sampleMarker);
        }
      });
    }

    // Monitored Water Sources Markers
    if (showWaterSources) {
      districts.forEach((d) => {
        // Offset slightly from district centroid to represent monitored water source
        const sourceLat = d.lat + 0.035;
        const sourceLng = d.lng - 0.035;
        const sourceIcon = L.divIcon({
          className: 'water-source-marker',
          html: `
            <div style="
              background: rgba(2, 132, 199, 0.95);
              border: 2px solid #7dd3fc;
              border-radius: 9999px;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
              font-size: 12px;
              cursor: pointer;
            ">
              🚰
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const srcMarker = L.marker([sourceLat, sourceLng], { icon: sourceIcon });
        srcMarker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 220px; padding: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 800; color: #0369a1; font-size: 12px;">Monitored Water Intake</span>
              <span style="background: #e0f2fe; color: #0369a1; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 9999px;">
                ACTIVE STATION
              </span>
            </div>
            <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">
              ${d.name} Central Water Intake & Handpumps
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
              Coordinates: ${sourceLat.toFixed(3)}°N, ${sourceLng.toFixed(3)}°E
            </div>
            <div style="font-size: 11px; color: #334155; line-height: 1.5; background: #f0f9ff; padding: 6px; border-radius: 6px; border: 1px solid #bae6fd;">
              • <b>River Proximity:</b> ${d.waterProximityKm} km<br/>
              • <b>Turbidity Index:</b> ${d.satellite.turbidity} FNU<br/>
              • <b>Catchment Population:</b> ${(d as any).population ? `${(((d as any).population) / 1000).toFixed(0)}k` : '420k'} residents
            </div>
          </div>
        `);
        markersGroup.addLayer(srcMarker);
      });
    }
  }, [districts, disease, selectedDistrict, showSpotlightCallouts, showFieldSamples, showWaterSources, samplesData, mapMode]);

  // Google Maps Style Hierarchical Place Names on Zoom (National -> State Capitals -> District HQs -> Towns & Landmarks)
  useEffect(() => {
    if (!mapInstanceRef.current || !placeLabelsLayerRef.current) return;
    const labelsGroup = placeLabelsLayerRef.current;
    labelsGroup.clearLayers();

    if (!showPlaceLabels) return;

    // Major Indian Cities, State Capitals, Sub-districts, Towns, and Geographic Landmarks
    const HIERARCHICAL_PLACES: Array<{
      name: string;
      lat: number;
      lng: number;
      type: 'major' | 'city' | 'town' | 'landmark';
      minZoom: number;
      subtitle?: string;
    }> = [
      // Major Metros (Visible at zoom >= 5)
      { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, type: 'major', minZoom: 5, subtitle: 'Karnataka Capital' },
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, type: 'major', minZoom: 5, subtitle: 'Telangana Capital' },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777, type: 'major', minZoom: 5, subtitle: 'Maharashtra Capital' },
      { name: 'New Delhi', lat: 28.6139, lng: 77.2090, type: 'major', minZoom: 5, subtitle: 'National Capital' },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707, type: 'major', minZoom: 5, subtitle: 'Tamil Nadu Capital' },
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639, type: 'major', minZoom: 5, subtitle: 'West Bengal Capital' },
      { name: 'Patna', lat: 25.5941, lng: 85.1376, type: 'major', minZoom: 5, subtitle: 'Bihar Capital' },
      { name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'major', minZoom: 5, subtitle: 'UP Capital' },

      // Key Regional Cities & State Hubs (Visible at zoom >= 6)
      { name: 'Mysuru', lat: 12.2958, lng: 76.6394, type: 'city', minZoom: 6, subtitle: 'Heritage City' },
      { name: 'Hubballi-Dharwad', lat: 15.3647, lng: 75.1240, type: 'city', minZoom: 6 },
      { name: 'Belagavi', lat: 15.8497, lng: 74.4977, type: 'city', minZoom: 6 },
      { name: 'Kalaburagi', lat: 17.3297, lng: 76.8343, type: 'city', minZoom: 6, subtitle: 'North Karnataka' },
      { name: 'Mangaluru', lat: 12.9141, lng: 74.8560, type: 'city', minZoom: 6, subtitle: 'Coastal Port' },
      { name: 'Udupi', lat: 13.3409, lng: 74.7421, type: 'city', minZoom: 6 },
      { name: 'Ballari', lat: 15.1394, lng: 76.9214, type: 'city', minZoom: 6 },
      { name: 'Davanagere', lat: 14.4644, lng: 75.9218, type: 'city', minZoom: 6 },
      { name: 'Shivamogga', lat: 13.9299, lng: 75.5681, type: 'city', minZoom: 6 },
      { name: 'Vijayapura', lat: 16.8302, lng: 75.7100, type: 'city', minZoom: 6 },
      { name: 'Raichur', lat: 16.2120, lng: 77.3439, type: 'city', minZoom: 6 },
      { name: 'Bidar', lat: 17.9104, lng: 77.5199, type: 'city', minZoom: 6 },
      { name: 'Tumakuru', lat: 13.3379, lng: 77.1006, type: 'city', minZoom: 6 },
      { name: 'Kolar', lat: 13.1358, lng: 78.1348, type: 'city', minZoom: 6 },
      { name: 'Hassan', lat: 13.0033, lng: 76.1004, type: 'city', minZoom: 6 },
      { name: 'Mandya', lat: 12.5218, lng: 76.8951, type: 'city', minZoom: 6 },
      { name: 'Warangal', lat: 17.9689, lng: 79.5941, type: 'city', minZoom: 6 },
      { name: 'Khammam', lat: 17.2473, lng: 80.1514, type: 'city', minZoom: 6 },
      { name: 'Nizamabad', lat: 18.6725, lng: 78.0941, type: 'city', minZoom: 6 },
      { name: 'Karimnagar', lat: 18.4386, lng: 79.1288, type: 'city', minZoom: 6 },
      { name: 'Varanasi', lat: 25.3176, lng: 82.9739, type: 'city', minZoom: 6 },
      { name: 'Prayagraj', lat: 25.4358, lng: 81.8463, type: 'city', minZoom: 6 },
      { name: 'Kanpur', lat: 26.4499, lng: 80.3319, type: 'city', minZoom: 6 },
      { name: 'Gaya', lat: 24.7914, lng: 85.0002, type: 'city', minZoom: 6 },
      { name: 'Muzaffarpur', lat: 26.1209, lng: 85.3647, type: 'city', minZoom: 6 },

      // District Sub-divisions, Taluks, Towns (Revealed as user zooms to 7-8+)
      { name: 'Hosapete (Hampi)', lat: 15.2689, lng: 76.3909, type: 'town', minZoom: 7, subtitle: 'UNESCO / TB Basin' },
      { name: 'Chikkamagaluru', lat: 13.3161, lng: 75.7720, type: 'town', minZoom: 7, subtitle: 'Western Ghats' },
      { name: 'Madikeri (Coorg)', lat: 12.4244, lng: 75.7382, type: 'town', minZoom: 7, subtitle: 'Talakaveri Source' },
      { name: 'Karwar', lat: 14.8136, lng: 74.1298, type: 'town', minZoom: 7, subtitle: 'Kali Estuary' },
      { name: 'Bhatkal', lat: 13.9839, lng: 74.5583, type: 'town', minZoom: 7 },
      { name: 'Kundapura', lat: 13.6268, lng: 74.6917, type: 'town', minZoom: 7 },
      { name: 'Gokak Falls', lat: 16.1667, lng: 74.8333, type: 'town', minZoom: 7 },
      { name: 'Bagalkote', lat: 16.1691, lng: 75.6615, type: 'town', minZoom: 7 },
      { name: 'Gadag', lat: 15.4299, lng: 75.6268, type: 'town', minZoom: 7 },
      { name: 'Haveri', lat: 14.7963, lng: 75.3999, type: 'town', minZoom: 7 },
      { name: 'Koppal', lat: 15.3456, lng: 76.1556, type: 'town', minZoom: 7 },
      { name: 'Yadgir', lat: 16.7645, lng: 77.1378, type: 'town', minZoom: 7 },
      { name: 'Chitradurga', lat: 14.2251, lng: 76.3980, type: 'town', minZoom: 7 },
      { name: 'Chamarajanagar', lat: 11.9261, lng: 76.9437, type: 'town', minZoom: 7 },
      { name: 'Srirangapatna', lat: 12.4238, lng: 76.6830, type: 'town', minZoom: 8, subtitle: 'Kaveri River Island' },
      { name: 'Talakaveri', lat: 12.3870, lng: 75.4920, type: 'landmark', minZoom: 8, subtitle: 'Kaveri Origin' },
      { name: 'Koodli', lat: 14.0200, lng: 75.6700, type: 'landmark', minZoom: 8, subtitle: 'Tunga-Bhadra Confluence' },
      { name: 'Tungabhadra Dam', lat: 15.2850, lng: 76.3400, type: 'landmark', minZoom: 8, subtitle: 'Key Hydro Station' },
      { name: 'KRS Dam (Mysuru)', lat: 12.4247, lng: 76.5728, type: 'landmark', minZoom: 8, subtitle: 'Kaveri Reservoir' },
      { name: 'Nagarjuna Sagar', lat: 16.5794, lng: 79.3130, type: 'landmark', minZoom: 8, subtitle: 'Krishna Basin' },
      { name: 'Almatti Dam', lat: 16.3292, lng: 75.8872, type: 'landmark', minZoom: 8, subtitle: 'Krishna Reservoir' },
      { name: 'Bhadrachalam', lat: 17.6689, lng: 80.8935, type: 'town', minZoom: 7, subtitle: 'Godavari Basin' },
      { name: 'Suryapet', lat: 17.1439, lng: 79.6239, type: 'town', minZoom: 7 },
      { name: 'Miryalaguda', lat: 16.8744, lng: 79.5639, type: 'town', minZoom: 7 },
      { name: 'Ramagundam', lat: 18.7551, lng: 79.5147, type: 'town', minZoom: 7 },
      { name: 'Mancherial', lat: 18.8679, lng: 79.4639, type: 'town', minZoom: 7 },
      { name: 'Kamareddy', lat: 18.3247, lng: 78.3394, type: 'town', minZoom: 7 },
      { name: 'Bodhan', lat: 18.6639, lng: 77.8972, type: 'town', minZoom: 7 },
      { name: 'Siddipet', lat: 18.1018, lng: 78.8520, type: 'town', minZoom: 7 },
      { name: 'Mahabubnagar', lat: 16.7488, lng: 77.9847, type: 'town', minZoom: 7 },
      { name: 'Gadwal', lat: 16.2300, lng: 77.8000, type: 'town', minZoom: 7 },
      { name: 'Nalgonda', lat: 17.0577, lng: 79.2684, type: 'town', minZoom: 7 },

      // Neighborhoods & Urban Hubs in Bengaluru when zooming in closely (zoom >= 9)
      { name: 'Whitefield', lat: 12.9698, lng: 77.7499, type: 'landmark', minZoom: 9 },
      { name: 'Electronic City', lat: 12.8399, lng: 77.6770, type: 'landmark', minZoom: 9 },
      { name: 'Hebbal (Lake Basin)', lat: 13.0358, lng: 77.5970, type: 'landmark', minZoom: 9 },
      { name: 'Bellandur Lake Basin', lat: 12.9363, lng: 77.6628, type: 'landmark', minZoom: 9, subtitle: 'Monitored Catchment' },
      { name: 'Yelahanka', lat: 13.1007, lng: 77.5963, type: 'town', minZoom: 9 },
      { name: 'Kengeri', lat: 12.9177, lng: 77.4838, type: 'town', minZoom: 9 },
      { name: 'Varthur', lat: 12.9392, lng: 77.7471, type: 'landmark', minZoom: 9 }
    ];

    // Filter places based on the current zoom level, exactly like Google Maps
    const visiblePlaces = HIERARCHICAL_PLACES.filter(place => currentZoom >= place.minZoom);

    visiblePlaces.forEach(place => {
      const isMajor = place.type === 'major';
      const isCity = place.type === 'city';
      const isLandmark = place.type === 'landmark';

      const dotColor = isMajor ? '#38bdf8' : isCity ? '#cbd5e1' : isLandmark ? '#06b6d4' : '#94a3b8';
      const fontClass = isMajor ? 'place-label-city' : isCity ? 'place-label-town' : isLandmark ? 'place-label-landmark' : 'place-label-town';

      const labelHtml = `
        <div class="place-label-text ${fontClass}">
          <span style="display: inline-block; width: ${isMajor ? '6px' : '4px'}; height: ${isMajor ? '6px' : '4px'}; border-radius: 50%; background: ${dotColor}; box-shadow: 0 0 6px ${dotColor}; margin-right: 2px;"></span>
          <span>${place.name}</span>
          ${place.subtitle && currentZoom >= (place.minZoom + 1) ? `<span style="font-size: 8.5px; opacity: 0.8; font-weight: 500; color: #94a3b8;">(${place.subtitle})</span>` : ''}
        </div>
      `;

      const labelIcon = L.divIcon({
        className: 'google-place-label',
        html: labelHtml,
        iconSize: [120, 20],
        iconAnchor: [-6, 10], // Offset to the right of the place dot
      });

      const marker = L.marker([place.lat, place.lng], {
        icon: labelIcon,
        interactive: false,
      });

      labelsGroup.addLayer(marker);
    });
  }, [currentZoom, showPlaceLabels]);

  // Center map when selected district changes
  useEffect(() => {
    if (
      selectedDistrict &&
      typeof selectedDistrict.lat === 'number' &&
      !isNaN(selectedDistrict.lat) &&
      typeof selectedDistrict.lng === 'number' &&
      !isNaN(selectedDistrict.lng) &&
      mapInstanceRef.current
    ) {
      try {
        mapInstanceRef.current.flyTo([selectedDistrict.lat, selectedDistrict.lng], 8, { duration: 1.2 });
      } catch (err) {
        console.warn('[InteractiveMap] flyTo failed for district:', selectedDistrict.name, err);
      }
    }
  }, [selectedDistrict]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9)] bg-[#02040a]">
      {/* Top Banner: Safeture Risk Map 2026 Live Real-Time Header */}
      <div className="bg-[#050816]/95 border-b border-white/10 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Globe className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-wide uppercase font-mono">
                RISK MAP 2026 <span className="text-sky-400 text-xs font-normal">| INDIA & GLOBAL</span>
              </h1>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold">
                <Radio className="w-3 h-3 animate-ping" /> LIVE SENSOR FEED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Earth Observation & Water Quality Risk Index • Powered by INSAT-3DR & Sentinel-2
            </p>
          </div>
        </div>

        {/* Live Real-Time Timestamp Clock */}
        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-slate-200">
          <Clock className="w-4 h-4 text-sky-400" />
          <span>{currentTime || 'AUG 01, 2026 • LIVE'}</span>
        </div>
      </div>

      {/* Real Rivers Basin Quick Select Bar */}
      <div className="bg-[#080d22] p-3 rounded-2xl border border-cyan-500/30 space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
            <Waves className="w-4 h-4 text-cyan-400" />
            Major Indian River Basins Hydro-Explorer (Click to inspect actual river course & connected districts)
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            {INDIA_RIVERS_DATA.length} Actual Rivers Mapped
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {INDIA_RIVERS_DATA.map((river) => {
            const isSelected = selectedRiver?.id === river.id;
            return (
              <button
                key={river.id}
                onClick={() => {
                  setSelectedRiver(river);
                  setActiveRiverModal(river);
                  if (mapInstanceRef.current) {
                    const bounds = L.polyline(river.path as [number, number][]).getBounds();
                    mapInstanceRef.current.flyToBounds(bounds, { padding: [60, 60], duration: 1.2 });
                  }
                }}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105 border border-cyan-300/50'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-cyan-400/40'
                }`}
              >
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                <span>{river.name.split(' ')[0]}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                  river.outbreakRiskLevel === 'Very High' ? 'bg-red-950 text-red-400 border border-red-800' :
                  river.outbreakRiskLevel === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  river.outbreakRiskLevel === 'Moderate' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {river.turbidity}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative w-full h-[540px]">
        {/* Leaflet Map DOM Element */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Top Left: GIS Layer Control Panel & Live District Search */}
        <div className="absolute top-4 left-4 z-[400] bg-[#050814]/90 backdrop-blur-xl p-3.5 rounded-2xl border border-sky-500/30 text-slate-100 shadow-2xl space-y-3 max-w-xs">
          {/* District Search Bar */}
          <div className="relative">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
              <Search className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <input
                type="text"
                placeholder="Search district name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white focus:outline-none w-full text-xs placeholder:text-slate-500"
              />
            </div>

            {/* Autocomplete Results */}
            {filteredDistricts.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-slate-950 border border-sky-500/40 rounded-xl shadow-2xl z-50 p-1 divide-y divide-slate-800">
                {filteredDistricts.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      onSelectDistrict(d);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2 hover:bg-slate-800/80 rounded-lg text-xs flex items-center justify-between text-slate-200 transition"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-1">
                        <Crosshair className="w-3 h-3 text-sky-400" /> {d.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{d.state}</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-sky-400">
                      {(d.riskScore * 100).toFixed(0)}%
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-sky-300 text-xs uppercase tracking-wider">GIS Map Layers</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">2026 GIS</span>
          </div>

          {/* Map Scope Switcher */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/80 rounded-xl border border-white/5">
            <button
              onClick={() => setMapMode('india')}
              className={`py-1.5 px-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                mapMode === 'india' ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇮🇳 India
            </button>
            <button
              onClick={() => setMapMode('karnataka')}
              className={`py-1.5 px-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                mapMode === 'karnataka' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow ring-1 ring-amber-300' : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              🟡 Karnataka (31)
            </button>
            <button
              onClick={() => setMapMode('world')}
              className={`py-1.5 px-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                mapMode === 'world' ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌐 Global
            </button>
          </div>

          {/* Tile Switcher */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/80 rounded-xl border border-white/5">
            <button
              onClick={() => setMapTile('dark')}
              className={`py-1 text-[10px] font-bold rounded-lg ${mapTile === 'dark' ? 'bg-sky-500 text-white' : 'text-slate-400'}`}
            >
              Dark GIS
            </button>
            <button
              onClick={() => setMapTile('satellite')}
              className={`py-1 text-[10px] font-bold rounded-lg ${mapTile === 'satellite' ? 'bg-sky-500 text-white' : 'text-slate-400'}`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapTile('streets')}
              className={`py-1 text-[10px] font-bold rounded-lg ${mapTile === 'streets' ? 'bg-sky-500 text-white' : 'text-slate-400'}`}
            >
              Streets
            </button>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-1 text-xs">
            <label className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 cursor-pointer">
              <span className="text-sky-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-400" /> Place Names on Zoom
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  z{currentZoom}
                </span>
                <input
                  type="checkbox"
                  checked={showPlaceLabels}
                  onChange={(e) => setShowPlaceLabels(e.target.checked)}
                  className="accent-sky-500 rounded"
                />
              </div>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 cursor-pointer">
              <span className="text-slate-300">State Risk Boundaries</span>
              <input
                type="checkbox"
                checked={showStatePolygons}
                onChange={(e) => setShowStatePolygons(e.target.checked)}
                className="accent-sky-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 cursor-pointer">
              <span className="text-slate-300">Spotlight Callout Cards</span>
              <input
                type="checkbox"
                checked={showSpotlightCallouts}
                onChange={(e) => setShowSpotlightCallouts(e.target.checked)}
                className="accent-sky-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 cursor-pointer">
              <span className="text-slate-300 flex items-center gap-1"><Waves className="w-3 h-3 text-sky-400" /> Rivers & Lakes</span>
              <input
                type="checkbox"
                checked={showRivers}
                onChange={(e) => setShowRivers(e.target.checked)}
                className="accent-sky-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 cursor-pointer">
              <span className="text-slate-300 flex items-center gap-1"><Flame className="w-3 h-3 text-amber-400" /> Outbreak Halos</span>
              <input
                type="checkbox"
                checked={showRiskHalos}
                onChange={(e) => setShowRiskHalos(e.target.checked)}
                className="accent-sky-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 cursor-pointer">
              <span className="text-teal-300 flex items-center gap-1"><TestTube2 className="w-3 h-3 text-teal-400" /> Water Samples (🧪)</span>
              <input
                type="checkbox"
                checked={showFieldSamples}
                onChange={(e) => setShowFieldSamples(e.target.checked)}
                className="accent-teal-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 cursor-pointer">
              <span className="text-sky-300 flex items-center gap-1"><Droplets className="w-3 h-3 text-sky-400" /> Monitored Sources (🚰)</span>
              <input
                type="checkbox"
                checked={showWaterSources}
                onChange={(e) => setShowWaterSources(e.target.checked)}
                className="accent-sky-500 rounded"
              />
            </label>
          </div>
        </div>

        {/* Top Right Zoom Controls */}
        <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-2.5 rounded-xl bg-[#050814]/90 hover:bg-slate-800 backdrop-blur-xl border border-white/10 text-white shadow-xl transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-2.5 rounded-xl bg-[#050814]/90 hover:bg-slate-800 backdrop-blur-xl border border-white/10 text-white shadow-xl transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setMapMode('india');
              mapInstanceRef.current?.flyTo([20.5937, 78.9629], 5);
            }}
            className="p-2.5 rounded-xl bg-[#050814]/90 hover:bg-slate-800 backdrop-blur-xl border border-white/10 text-white shadow-xl transition"
            title="Reset to India Center"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[400] bg-[#050814]/90 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-5 text-xs font-semibold text-slate-200">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">2026 Risk Legend:</span>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-red-600 shadow-sm shadow-red-600/50"></span>
            <span>Critical Risk (≥80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-orange-500 shadow-sm shadow-orange-500/50"></span>
            <span>High Risk (65-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-yellow-500 shadow-sm shadow-yellow-500/50"></span>
            <span>Medium Risk (40-64%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <span>Negligible (&lt;40%)</span>
          </div>
        </div>
      </div>

      {/* Karnataka High-Visibility Regional Spotlight Bar */}
      <div className="bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-slate-900/60 border-t border-b border-amber-500/30 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="font-bold text-amber-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
            🟡 Karnataka State Monitoring Active
          </span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            • {districts.filter(d => d.state === 'Karnataka').length} Districts Monitored • Cauvery, Krishna, Tungabhadra & Coastal Basins
          </span>

        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {districts.filter(d => d.state === 'Karnataka').map((d) => (
            <button
              key={d.id}
              onClick={() => {
                onSelectDistrict(d);
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([d.lat, d.lng], 9, { duration: 1.2 });
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-500/30 hover:border-amber-400 font-mono text-[11px] font-semibold transition flex items-center gap-1"
            >
              <span>{d.name.split(' ')[0]}</span>
              <span className={`px-1 rounded text-[9px] font-bold ${
                d.riskTier === 'Very High' ? 'bg-red-500/20 text-red-300' :
                d.riskTier === 'High' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {(d.riskScore * 100).toFixed(0)}%
              </span>
            </button>
          ))}
          <button
            onClick={() => {
              setMapMode('karnataka');
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([14.5, 75.8], 7, { duration: 1.5 });
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[11px] hover:bg-amber-400 transition shadow-md shadow-amber-500/20"
          >
            Center Karnataka
          </button>
        </div>
      </div>

      {/* Bottom Panel: Safeture 2026 Style Ranking & Insights Dashboard */}
      <div className="bg-[#050714] border-t border-white/10 p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Top 5 Critical Risk Districts */}
        <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/5 space-y-2">
          <div className="font-bold text-red-400 uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            Top 5 Critical Outbreak Risk
          </div>
          <div className="space-y-1.5 font-mono">
            {districts
              .slice()
              .sort((a, b) => b.riskScore - a.riskScore)
              .slice(0, 5)
              .map((d, idx) => (
                <div
                  key={d.id}
                  onClick={() => onSelectDistrict(d)}
                  className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 hover:bg-slate-800/80 cursor-pointer text-[11px] transition"
                >
                  <span className="text-slate-200">
                    <span className="text-slate-500 mr-1.5">{idx + 1}.</span> {d.name} ({d.state})
                  </span>
                  <span className="font-bold text-red-400">{(d.riskScore * 100).toFixed(0)}%</span>
                </div>
              ))}
          </div>
        </div>

        {/* Highest Turbidity Water Quality Hotspots */}
        <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/5 space-y-2">
          <div className="font-bold text-amber-400 uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
            <Waves className="w-3.5 h-3.5 text-amber-500" />
            Highest Water Turbidity (FNU)
          </div>
          <div className="space-y-1.5 font-mono">
            {districts
              .slice()
              .sort((a, b) => b.satellite.turbidity - a.satellite.turbidity)
              .slice(0, 5)
              .map((d, idx) => (
                <div
                  key={d.id}
                  onClick={() => onSelectDistrict(d)}
                  className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 hover:bg-slate-800/80 cursor-pointer text-[11px] transition"
                >
                  <span className="text-slate-200">
                    <span className="text-slate-500 mr-1.5">{idx + 1}.</span> {d.name}
                  </span>
                  <span className="font-bold text-amber-400">{d.satellite.turbidity} FNU</span>
                </div>
              ))}
          </div>
        </div>

        {/* Social Vulnerability Index (SVI) Hotspots */}
        <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/5 space-y-2">
          <div className="font-bold text-sky-400 uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
            Social Vulnerability (SVI)
          </div>
          <div className="space-y-1.5 font-mono">
            {districts
              .slice()
              .sort((a, b) => b.sviScore - a.sviScore)
              .slice(0, 5)
              .map((d, idx) => (
                <div
                  key={d.id}
                  onClick={() => onSelectDistrict(d)}
                  className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 hover:bg-slate-800/80 cursor-pointer text-[11px] transition"
                >
                  <span className="text-slate-200">
                    <span className="text-slate-500 mr-1.5">{idx + 1}.</span> {d.name}
                  </span>
                  <span className="font-bold text-sky-300">{d.sviScore} ({d.sviSource})</span>
                </div>
              ))}
          </div>
        </div>

        {/* Lowest Risk Safe Regions */}
        <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/5 space-y-2">
          <div className="font-bold text-emerald-400 uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Safest Water Supply Regions
          </div>
          <div className="space-y-1.5 font-mono">
            {districts
              .slice()
              .sort((a, b) => a.riskScore - b.riskScore)
              .slice(0, 5)
              .map((d, idx) => (
                <div
                  key={d.id}
                  onClick={() => onSelectDistrict(d)}
                  className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 hover:bg-slate-800/80 cursor-pointer text-[11px] transition"
                >
                  <span className="text-slate-200">
                    <span className="text-slate-500 mr-1.5">{idx + 1}.</span> {d.name} ({d.state})
                  </span>
                  <span className="font-bold text-emerald-400">{(d.riskScore * 100).toFixed(0)}%</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Interactive River Detail Modal */}
      {activeRiverModal && (
        <RiverDetailModal
          river={activeRiverModal}
          onClose={() => setActiveRiverModal(null)}
          onSelectDistrictByName={(distName) => {
            const matched = districts.find(
              (d) => d.name.toLowerCase() === distName.toLowerCase()
            );
            if (matched) {
              onSelectDistrict(matched);
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([matched.lat, matched.lng], 9, { duration: 1.2 });
              }
            }
          }}
        />
      )}
    </div>
  );
};
