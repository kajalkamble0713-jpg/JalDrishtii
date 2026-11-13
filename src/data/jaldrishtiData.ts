import { DistrictData, ModelMetrics, OutbreakAlert } from '../types';
import { COMPREHENSIVE_DISTRICTS } from './districtsDatabase';

/**
 * Single source of truth for districts data across JalDrishti.
 * Contains 119 districts with dedicated focus on all 31 districts of Karnataka.
 */
export const DISTRICTS_DATA: DistrictData[] = COMPREHENSIVE_DISTRICTS;

export const MODEL_PERFORMANCE_METRICS: Record<string, ModelMetrics> = {
  ADD: {
    disease: 'ADD',
    aucRoc: 0.84,
    prAuc: 0.71,
    precision: 0.72,
    recall: 0.68,
    f1Score: 0.70,
    brierScore: 0.0842,
    ece: 0.0621,
    bestParams: { learning_rate: 0.05, max_depth: 3, n_estimators: 100 },
    datasize: '10,688 rows (223 districts × 2019-2022)'
  },
  Cholera: {
    disease: 'Cholera',
    aucRoc: 0.82,
    prAuc: 0.63,
    precision: 0.69,
    recall: 0.65,
    f1Score: 0.67,
    brierScore: 0.0412,
    ece: 0.0895,
    bestParams: { learning_rate: 0.05, max_depth: 3, n_estimators: 100 },
    datasize: '10,688 rows (District-Grouped Stratified + SMOTE)'
  },
  Typhoid: {
    disease: 'Typhoid',
    aucRoc: 0.81,
    prAuc: 0.61,
    precision: 0.67,
    recall: 0.63,
    f1Score: 0.65,
    brierScore: 0.0126,
    ece: 0.0486,
    bestParams: { learning_rate: 0.1, max_depth: 3, n_estimators: 100 },
    datasize: 'Multi-district HMIS & Clinical Surveillance Corpus'
  }
};

export const RECENT_ALERTS: OutbreakAlert[] = [
  {
    id: 'alt_ka_1',
    districtId: 'raichur_karnataka',
    districtName: 'Raichur',
    state: 'Karnataka',
    disease: 'ADD',
    riskTier: 'Very High',
    riskScore: 0.86,
    timestamp: '15 mins ago',
    triggerFactor: 'Krishna-Tungabhadra confluence turbidity spike (4.65 FNU) + thermal anomaly (38.8°C)'
  },
  {
    id: 'alt_ka_2',
    districtId: 'kalaburagi_karnataka',
    districtName: 'Kalaburagi',
    state: 'Karnataka',
    disease: 'Cholera',
    riskTier: 'Very High',
    riskScore: 0.82,
    timestamp: '45 mins ago',
    triggerFactor: 'Elevated Turbidity (4.45 FNU) + Bhima river basin thermal spike (37.4°C)'
  },
  {
    id: 'alt_ka_3',
    districtId: 'ballari_karnataka',
    districtName: 'Ballari',
    state: 'Karnataka',
    disease: 'ADD',
    riskTier: 'Very High',
    riskScore: 0.81,
    timestamp: '1 hour ago',
    triggerFactor: 'Tungabhadra catchment runoff + high SVI (0.68) vulnerability index'
  },
  {
    id: 'alt_1',
    districtId: 'patna_bihar',
    districtName: 'Patna',
    state: 'Bihar',
    disease: 'ADD',
    riskTier: 'Very High',
    riskScore: 0.88,
    timestamp: '2 hours ago',
    triggerFactor: 'High Turbidity (4.82 FNU) + Monsoonal Lag 1 spike'
  },
  {
    id: 'alt_2',
    districtId: 'varanasi_up',
    districtName: 'Varanasi',
    state: 'Uttar Pradesh',
    disease: 'Cholera',
    riskTier: 'Very High',
    riskScore: 0.85,
    timestamp: '4 hours ago',
    triggerFactor: 'High NDCI (0.32) & Ganges river proximity (0.5 km)'
  },
  {
    id: 'alt_ka_4',
    districtId: 'udupi_karnataka',
    districtName: 'Udupi',
    state: 'Karnataka',
    disease: 'Cholera',
    riskTier: 'High',
    riskScore: 0.71,
    timestamp: '5 hours ago',
    triggerFactor: 'Swarna estuarine water salinity intrusion + coastal precipitation run-off'
  },
  {
    id: 'alt_3',
    districtId: 'khammam_telangana',
    districtName: 'Khammam',
    state: 'Telangana',
    disease: 'Typhoid',
    riskTier: 'High',
    riskScore: 0.85,
    timestamp: '6 hours ago',
    triggerFactor: 'High SVI (0.65) + Elevated LST (36.8°C)'
  },
  {
    id: 'alt_4',
    districtId: 'nizamabad_telangana',
    districtName: 'Nizamabad',
    state: 'Telangana',
    disease: 'Typhoid',
    riskTier: 'High',
    riskScore: 0.81,
    timestamp: '12 hours ago',
    triggerFactor: 'High 2019 HMIS inpatient caseload + SVI 0.61'
  }
];

export const THREEJS_DEVELOPER_PROMPT = `
# Engineering Prompt for Developers: Ultra-Realistic 3D Interactive NASA Earth Background

You are tasked with building a high-performance WebGL 3D interactive Earth globe component using Three.js inside a React/TypeScript application.

## 1. Technical Requirements & Visual Target
- **Visual Style**: Exact NASA Black Marble / Earth Observatory aesthetic with daytime photorealistic surface, glowing night city lights on dark side, specular ocean water sheen, independent moving cloud sphere, and an atmospheric Rayleigh limb bloom halo.
- **Lighting Dynamics**: Directional light representing Sun positioned at x: 5, y: 3, z: 5. Ambient light set to subtle dark blue (Color 0x050a18, intensity 0.35) so night side is dark with city lights glowing.
- **Atmospheric Bloom**: Custom GLSL ShaderMaterial utilizing Fresnel effect to create a bright electric cyan/blue scattering halo along the rim of the Earth sphere.
- **Night City Lights Shader**: Custom Multi-Texture ShaderMaterial or blend map that transitions city lights from 0 opacity on illuminated side to high glow on unlit side based on light dot product.
- **Interactive GPS Pins**: 3D pulsing spherical nodes positioned on latitude/longitude coordinates (e.g. India districts) with HTML label overlays or Raycaster picking.

## 2. Component Architecture (Three.js WebGL Scene)
\`\`\`typescript
// Sphere Radii
const EARTH_RADIUS = 2.0;
const CLOUD_RADIUS = 2.025; // Slight offset above earth
const ATMOSPHERE_RADIUS = 2.12;

// Geometries
const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
const cloudGeo = new THREE.SphereGeometry(CLOUD_RADIUS, 64, 64);
const atmosphereGeo = new THREE.SphereGeometry(ATMOSPHERE_RADIUS, 64, 64);
\`\`\`

## 3. Custom GLSL Shader for Atmospheric Glow (Fresnel Limb Scattering)
\`\`\`glsl
// Vertex Shader
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment Shader
varying vec3 vNormal;
varying vec3 vPosition;
uniform vec3 color;
void main() {
  vec3 viewDir = normalize(-vPosition);
  float intensity = pow(0.65 - dot(vNormal, viewDir), 2.8);
  gl_FragColor = vec4(color, intensity * 0.95);
}
\`\`\`

## 4. Performance Optimizations
1. **DevicePixelRatio Limit**: Clamp \`renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0))\` to prevent GPU frame drops on 4K / Retina screens.
2. **Animation Loop**: Use \`requestAnimationFrame\` with frame delta time for silky-smooth rotation regardless of refresh rate (60Hz vs 120Hz).
3. **ResizeObserver**: Attach an observer to container element to automatically resize canvas camera aspect ratio on layout resize.
4. **Memory Management**: Properly call \`.dispose()\` on geometries, materials, and textures when component unmounts.
`;
