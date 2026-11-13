import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { DistrictData, GlobeControlsState } from '../types';
import { Camera, Eye, Globe2, Moon, Sun, Sparkles, Navigation, Layers, ShieldAlert, Cpu } from 'lucide-react';

interface EarthCanvas3DProps {
  districts: DistrictData[];
  selectedDistrict: DistrictData | null;
  onSelectDistrict: (district: DistrictData) => void;
  controlsState: GlobeControlsState;
}

// Convert GPS (lat, lng) to 3D Cartesian coordinates on sphere of radius R
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Convert 3D position vector back to Approximate Lat/Lng
function vector3ToLatLng(vector: THREE.Vector3, radius: number): { lat: number; lng: number } {
  const norm = vector.clone().normalize();
  const lat = 90 - Math.acos(norm.y) * (180 / Math.PI);
  let lng = Math.atan2(norm.z, -norm.x) * (180 / Math.PI) - 180;
  if (lng < -180) lng += 360;
  return { lat, lng };
}

// High-resolution realistic Day texture map (2048x1024 equirectangular projection)
function createPhotorealisticDayCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep Ocean Hydrographic Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#021024'); // Arctic ocean
  oceanGrad.addColorStop(0.2, '#0d2b45'); 
  oceanGrad.addColorStop(0.5, '#123c69'); // Equatorial ocean
  oceanGrad.addColorStop(0.8, '#0d2b45'); 
  oceanGrad.addColorStop(1, '#021024'); // Antarctic ocean
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Shallow coastal shelf glow
  const drawShelf = (path: () => void) => {
    ctx.save();
    ctx.strokeStyle = '#20639b';
    ctx.lineWidth = 8;
    ctx.shadowColor = '#00a8cc';
    ctx.shadowBlur = 10;
    path();
    ctx.stroke();
    ctx.restore();
  };

  // 2. Realistic Continent Paths
  // North America
  const drawNA = () => {
    ctx.beginPath();
    ctx.moveTo(280, 180);
    ctx.bezierCurveTo(340, 160, 480, 180, 580, 220);
    ctx.bezierCurveTo(620, 280, 580, 420, 500, 460);
    ctx.bezierCurveTo(440, 480, 380, 450, 340, 400);
    ctx.bezierCurveTo(300, 350, 250, 240, 280, 180);
    ctx.closePath();
  };

  // South America
  const drawSA = () => {
    ctx.beginPath();
    ctx.moveTo(520, 480);
    ctx.bezierCurveTo(600, 520, 680, 620, 640, 760);
    ctx.bezierCurveTo(600, 840, 540, 880, 500, 800);
    ctx.bezierCurveTo(460, 720, 480, 580, 520, 480);
    ctx.closePath();
  };

  // Europe
  const drawEurope = () => {
    ctx.beginPath();
    ctx.moveTo(980, 200);
    ctx.bezierCurveTo(1060, 180, 1180, 200, 1220, 260);
    ctx.bezierCurveTo(1200, 320, 1120, 350, 1040, 340);
    ctx.bezierCurveTo(960, 320, 940, 240, 980, 200);
    ctx.closePath();
  };

  // Africa
  const drawAfrica = () => {
    ctx.beginPath();
    ctx.moveTo(960, 360);
    ctx.bezierCurveTo(1100, 360, 1200, 440, 1180, 600);
    ctx.bezierCurveTo(1160, 720, 1080, 800, 1000, 740);
    ctx.bezierCurveTo(940, 660, 920, 480, 960, 360);
    ctx.closePath();
  };

  // Asia
  const drawAsia = () => {
    ctx.beginPath();
    ctx.moveTo(1200, 180);
    ctx.bezierCurveTo(1400, 160, 1750, 200, 1850, 280);
    ctx.bezierCurveTo(1880, 360, 1800, 480, 1650, 520);
    ctx.bezierCurveTo(1520, 500, 1380, 440, 1280, 380);
    ctx.bezierCurveTo(1220, 340, 1180, 240, 1200, 180);
    ctx.closePath();
  };

  // INDIA Subcontinent (Accurate Peninsular shape with Bay of Bengal & Arabian Sea)
  const drawIndia = () => {
    ctx.beginPath();
    // 68°E to 97°E, 8°N to 37°N equirectangular conversion
    ctx.moveTo(1410, 320); // Northern Himalayas
    ctx.bezierCurveTo(1450, 340, 1510, 370, 1540, 410); // North-East
    ctx.lineTo(1520, 480); // East Coast / Kolkata / Odisha
    ctx.lineTo(1475, 575); // Kanyakumari (Southernmost tip)
    ctx.lineTo(1420, 495); // Malabar / Goa / Mumbai
    ctx.lineTo(1380, 440); // Gujarat / Rann of Kutch
    ctx.lineTo(1395, 370); // Punjab / Rajasthan
    ctx.closePath();
  };

  // Australia
  const drawAustralia = () => {
    ctx.beginPath();
    ctx.moveTo(1650, 620);
    ctx.bezierCurveTo(1780, 600, 1880, 660, 1840, 780);
    ctx.bezierCurveTo(1740, 820, 1620, 760, 1650, 620);
    ctx.closePath();
  };

  // Draw Coastal Shelves
  [drawNA, drawSA, drawEurope, drawAfrica, drawAsia, drawIndia, drawAustralia].forEach(drawShelf);

  // Fill Continents (Lush Vegetative Green)
  ctx.fillStyle = '#2d5a27';
  [drawNA, drawSA, drawEurope, drawAfrica, drawAsia, drawAustralia].forEach(fn => { fn(); ctx.fill(); });

  // Fill India with vibrant green terrain
  drawIndia();
  const indiaGrad = ctx.createLinearGradient(1410, 320, 1475, 575);
  indiaGrad.addColorStop(0, '#387038'); // Himalayas
  indiaGrad.addColorStop(0.3, '#4d8a4d'); // Gangetic Plains
  indiaGrad.addColorStop(0.7, '#326632'); // Deccan Plateau
  indiaGrad.addColorStop(1, '#244d24'); // Peninsula
  ctx.fillStyle = indiaGrad;
  ctx.fill();

  // Desert Belts (Sahara, Arabian Peninsula, Thar Desert)
  ctx.fillStyle = '#9e8052';
  ctx.beginPath();
  ctx.ellipse(1060, 410, 110, 50, 0, 0, Math.PI * 2); // Sahara
  ctx.ellipse(1230, 390, 60, 35, 0, 0, Math.PI * 2);  // Arabia
  ctx.ellipse(1395, 395, 30, 20, 0, 0, Math.PI * 2);  // Thar
  ctx.fill();

  // Ice Caps
  ctx.fillStyle = '#f0f4f8';
  ctx.fillRect(0, 0, canvas.width, 65); // Arctic
  ctx.fillRect(0, canvas.height - 75, canvas.width, 75); // Antarctic

  return canvas;
}

// Night City Lights Canvas (NASA Black Marble equirectangular fallback)
function createPhotorealisticNightCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const addUrbanCluster = (cx: number, cy: number, radius: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.6) * radius;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;

      ctx.fillStyle = Math.random() > 0.6 ? '#ffc107' : Math.random() > 0.3 ? '#ff9800' : '#ffe082';
      ctx.beginPath();
      ctx.arc(px, py, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Indian Cities
  addUrbanCluster(1420, 370, 30, 220); // Delhi NCR
  addUrbanCluster(1405, 480, 25, 180); // Mumbai
  addUrbanCluster(1445, 485, 24, 170); // Hyderabad / Telangana
  addUrbanCluster(1440, 530, 22, 150); // Bengaluru
  addUrbanCluster(1460, 525, 20, 130); // Chennai
  addUrbanCluster(1500, 440, 25, 180); // Kolkata
  addUrbanCluster(1460, 410, 22, 140); // Patna / Gangetic Belt

  // Global Metropolises
  addUrbanCluster(480, 320, 50, 300);  // US East Coast
  addUrbanCluster(1120, 280, 60, 350); // Europe
  addUrbanCluster(1660, 340, 45, 280); // East Asia

  return canvas;
}

// Specular Ocean Canvas
function createSpecularOceanCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // White = Water (reflects sunlight), Black = Land (absorbs light)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(280, 180, 90, 0, Math.PI * 2); // NA
  ctx.arc(320, 320, 85, 0, Math.PI * 2); // SA
  ctx.arc(580, 130, 80, 0, Math.PI * 2); // Europe
  ctx.arc(520, 260, 100, 0, Math.PI * 2); // Africa
  ctx.arc(750, 150, 110, 0, Math.PI * 2); // Asia
  ctx.arc(880, 340, 60, 0, Math.PI * 2); // Australia
  ctx.fill();

  return canvas;
}

// Realistic Swirling Clouds Canvas
function createCloudCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const rx = Math.random() * 80 + 20;
    const ry = Math.random() * 30 + 10;
    const rot = Math.random() * Math.PI;

    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

export const EarthCanvas3D: React.FC<EarthCanvas3DProps> = ({
  districts,
  selectedDistrict,
  onSelectDistrict,
  controlsState,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const cloudMeshRef = useRef<THREE.Mesh | null>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const orbitGroupRef = useRef<THREE.Group | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictData | null>(null);
  const [telemetry, setTelemetry] = useState({ lat: 17.385, lng: 78.486, cameraMode: 'NASA Orbit Horizon' });
  const [cameraPreset, setCameraPreset] = useState<'horizon' | 'india' | 'night' | 'global'>('horizon');

  const EARTH_RADIUS = 2.0;

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup - Default angled for cinematic Horizon View (matching NASA low orbit photos!)
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(-2.8, 1.4, 2.9);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer setup with high quality ACES tone mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Photorealistic Sunlight & Ambient
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x223344, 0.75);
    scene.add(ambientLight);

    // 5. Earth Parent Group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // Default angle so India & equator curve smoothly across the horizon
    earthGroup.rotation.y = -Math.PI / 2.3;
    earthGroup.rotation.x = 0.28;

    // 6. Generate Textures & Load Actual Real NASA Satellite Imagery
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    const dayCanvas = createPhotorealisticDayCanvas();
    const fallbackDayTexture = new THREE.CanvasTexture(dayCanvas);
    fallbackDayTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const nightCanvas = createPhotorealisticNightCanvas();
    const fallbackNightTexture = new THREE.CanvasTexture(nightCanvas);
    fallbackNightTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const specCanvas = createSpecularOceanCanvas();
    const fallbackSpecTexture = new THREE.CanvasTexture(specCanvas);

    // Earth Sphere Mesh
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 96, 96);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: fallbackDayTexture,
      emissiveMap: fallbackNightTexture,
      emissive: new THREE.Color(0xffffdd),
      emissiveIntensity: controlsState.nightLights ? 0.85 : 0.0,
      specularMap: fallbackSpecTexture,
      specular: new THREE.Color(0x223344), // Natural soft ocean sheen
      shininess: 12,
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);

    // Load REAL High-Resolution NASA Earth Satellite Textures
    const realDayTextureUrl = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
    const realNightTextureUrl = 'https://unpkg.com/three-globe/example/img/earth-night-lights.png';
    const realSpecularTextureUrl = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_specular_2048.jpg';
    const realCloudTextureUrl = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_clouds_2048.png';

    textureLoader.load(
      realDayTextureUrl,
      (tex) => {
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        earthMaterial.map = tex;
        earthMaterial.needsUpdate = true;
      },
      undefined,
      () => {
        // Fallback CDN if unpkg is blocked
        textureLoader.load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_atmos_2048.jpg', (tex) => {
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          earthMaterial.map = tex;
          earthMaterial.needsUpdate = true;
        });
      }
    );

    textureLoader.load(
      realNightTextureUrl,
      (tex) => {
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        earthMaterial.emissiveMap = tex;
        earthMaterial.needsUpdate = true;
      },
      undefined,
      () => {
        textureLoader.load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_lights_2048.png', (tex) => {
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          earthMaterial.emissiveMap = tex;
          earthMaterial.needsUpdate = true;
        });
      }
    );

    textureLoader.load(realSpecularTextureUrl, (tex) => {
      earthMaterial.specularMap = tex;
      earthMaterial.needsUpdate = true;
    });

    // 7. Swirling Cloud Layer
    const cloudCanvas = createCloudCanvas();
    const fallbackCloudTexture = new THREE.CanvasTexture(cloudCanvas);
    const cloudGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.014, 80, 80);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: fallbackCloudTexture,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudMeshRef.current = cloudMesh;
    earthGroup.add(cloudMesh);

    textureLoader.load(realCloudTextureUrl, (tex) => {
      cloudMaterial.map = tex;
      cloudMaterial.needsUpdate = true;
    });

    // 8. Custom Rayleigh Atmospheric Limb Scattering Shader
    const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.09, 80, 80);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform vec3 color;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float intensity = pow(0.72 - dot(vNormal, viewDir), 2.8);
          gl_FragColor = vec4(color, max(0.0, intensity) * 0.9);
        }
      `,
      uniforms: {
        color: { value: new THREE.Color(0x00d2ff) }, // Vibrant electric cyan Rayleigh scattering
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphereMeshRef.current = atmosphereMesh;
    scene.add(atmosphereMesh);

    // 9. Deep Space Starfield
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 1800;
    const starPos = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 120;
      starPos[i + 1] = (Math.random() - 0.5) * 120;
      starPos[i + 2] = -Math.random() * 60 - 10;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.14,
      transparent: true,
      opacity: 0.9,
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 10. 3D Animated Satellite Orbit Path (Sentinel-2 / Terra MODIS)
    const orbitGroup = new THREE.Group();
    orbitGroupRef.current = orbitGroup;
    earthGroup.add(orbitGroup);

    const orbitCurve = new THREE.EllipseCurve(
      0, 0,
      EARTH_RADIUS * 1.25, EARTH_RADIUS * 1.25,
      0, 2 * Math.PI,
      false,
      0
    );
    const orbitPoints = orbitCurve.getPoints(100);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(
      orbitPoints.map(p => new THREE.Vector3(p.x, p.y, 0))
    );
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    orbitLine.rotation.x = Math.PI / 3;
    orbitLine.rotation.y = Math.PI / 6;
    orbitGroup.add(orbitLine);

    // Satellite Node
    const satGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const satMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const satMesh = new THREE.Mesh(satGeo, satMat);
    orbitGroup.add(satMesh);

    // 11. District Markers & Vertical Laser Beacons
    const markersGroup = new THREE.Group();
    markersGroupRef.current = markersGroup;
    earthGroup.add(markersGroup);

    districts.forEach((d) => {
      const pos = latLngToVector3(d.lat, d.lng, EARTH_RADIUS * 1.015);

      let markerColor = 0x22c55e;
      if (d.riskTier === 'Moderate') markerColor = 0xf59e0b;
      if (d.riskTier === 'High') markerColor = 0xea580c;
      if (d.riskTier === 'Very High') markerColor = 0xef4444;

      // Surface pin sphere
      const pinGeo = new THREE.SphereGeometry(0.04, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: markerColor });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.userData = { district: d };
      markersGroup.add(pinMesh);

      // Pulsing Base Ring
      const ringGeo = new THREE.RingGeometry(0.05, 0.08, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: markerColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      ringMesh.userData = { district: d };
      markersGroup.add(ringMesh);

      // 3D Laser Beacon Shaft for High/Very High Risk Districts
      if (d.riskTier === 'High' || d.riskTier === 'Very High') {
        const beamHeight = d.riskTier === 'Very High' ? 0.35 : 0.22;
        const beamGeo = new THREE.CylinderGeometry(0.008, 0.018, beamHeight, 12);
        const beamMat = new THREE.MeshBasicMaterial({
          color: markerColor,
          transparent: true,
          opacity: 0.65,
        });
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);
        
        // Orient beam outwards along sphere radius
        const normal = pos.clone().normalize();
        const beamPos = pos.clone().add(normal.clone().multiplyScalar(beamHeight / 2));
        beamMesh.position.copy(beamPos);
        beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        markersGroup.add(beamMesh);
      }
    });

    // Mouse Interaction
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current && cameraRef.current && earthGroupRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );

        // Raycast for lat/lng & hover
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, cameraRef.current);
        
        if (markersGroupRef.current) {
          const intersects = raycaster.intersectObjects(markersGroupRef.current.children);
          if (intersects.length > 0) {
            const district = intersects[0].object.userData.district;
            if (district) setHoveredDistrict(district);
          } else {
            setHoveredDistrict(null);
          }
        }
      }

      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      if (earthGroupRef.current) {
        earthGroupRef.current.rotation.y += deltaX * 0.004;
        earthGroupRef.current.rotation.x += deltaY * 0.004;
      }

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !markersGroupRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(markersGroupRef.current.children);
      if (intersects.length > 0) {
        const district = intersects[0].object.userData.district as DistrictData;
        if (district) onSelectDistrict(district);
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('click', handleClick);

    // Animation Loop
    let animationFrameId: number;
    let satAngle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto rotation
      if (controlsState.autoRotate && !isDraggingRef.current && earthGroupRef.current) {
        earthGroupRef.current.rotation.y += 0.0012 * controlsState.rotationSpeed;
      }

      // Cloud rotation
      if (cloudMeshRef.current && controlsState.showClouds) {
        cloudMeshRef.current.rotation.y += 0.0006;
      }

      // Satellite node orbit position update
      satAngle += 0.015;
      const satR = EARTH_RADIUS * 1.25;
      const satX = Math.cos(satAngle) * satR;
      const satY = Math.sin(satAngle) * satR;
      if (satMesh) {
        satMesh.position.set(satX, satY, 0);
      }

      // Pulse ring markers
      if (markersGroupRef.current) {
        const time = Date.now() * 0.003;
        markersGroupRef.current.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.geometry instanceof THREE.RingGeometry) {
            const scale = 1 + Math.sin(time + child.position.x) * 0.25;
            child.scale.set(scale, scale, scale);
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [districts]);

  // Controls Visibility
  useEffect(() => {
    if (cloudMeshRef.current) cloudMeshRef.current.visible = controlsState.showClouds;
    if (atmosphereMeshRef.current) atmosphereMeshRef.current.visible = controlsState.atmosphereGlow;
    if (markersGroupRef.current) markersGroupRef.current.visible = controlsState.showDistrictMarkers;
  }, [controlsState]);

  // Selected District Focus
  useEffect(() => {
    if (selectedDistrict && earthGroupRef.current) {
      const targetLng = selectedDistrict.lng;
      const targetLat = selectedDistrict.lat;

      const rotY = -(targetLng + 180) * (Math.PI / 180) + Math.PI;
      const rotX = targetLat * (Math.PI / 180) * 0.45;

      earthGroupRef.current.rotation.y = rotY;
      earthGroupRef.current.rotation.x = rotX;
    }
  }, [selectedDistrict]);

  // Apply Camera Presets
  const applyCameraPreset = (preset: 'horizon' | 'india' | 'night' | 'global') => {
    setCameraPreset(preset);
    if (!cameraRef.current || !earthGroupRef.current) return;

    if (preset === 'horizon') {
      // Cinematic low-orbit horizon limb angle (Matching NASA Space Photos!)
      cameraRef.current.position.set(-2.8, 1.4, 2.9);
      cameraRef.current.lookAt(0, 0, 0);
      earthGroupRef.current.rotation.set(0.28, -Math.PI / 2.3, 0);
    } else if (preset === 'india') {
      // Focused directly on Telangana & India
      cameraRef.current.position.set(0, 0, 3.8);
      cameraRef.current.lookAt(0, 0, 0);
      earthGroupRef.current.rotation.set(0.25, -Math.PI / 1.7, 0);
    } else if (preset === 'night') {
      // Rotated to Black Marble night city light view
      cameraRef.current.position.set(0, 0, 4.2);
      cameraRef.current.lookAt(0, 0, 0);
      earthGroupRef.current.rotation.set(0.15, Math.PI / 1.2, 0);
    } else if (preset === 'global') {
      // Full distance orbital view
      cameraRef.current.position.set(0, 0, 6.2);
      cameraRef.current.lookAt(0, 0, 0);
      earthGroupRef.current.rotation.set(0.2, -Math.PI / 2, 0);
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden bg-[#020308] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: NASA Mission Control Telemetry HUD */}
      <div className="absolute top-4 left-4 z-10 bg-[#050814]/85 backdrop-blur-xl p-4 rounded-2xl border border-sky-500/30 text-slate-200 text-xs shadow-2xl space-y-3 max-w-xs">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="font-bold text-sky-400 tracking-wide uppercase text-[11px]">NASA Earth Observatory</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-sky-950/80 px-2 py-0.5 rounded border border-sky-500/20">
            MODIS / 3D
          </span>
        </div>

        {/* Live Status Toggles readout */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <span className="text-slate-400 flex items-center gap-1">
              <Moon className="w-3 h-3 text-amber-400" /> Lights
            </span>
            <span className={controlsState.nightLights ? 'text-amber-400 font-bold' : 'text-slate-500'}>
              {controlsState.nightLights ? 'ON' : 'OFF'}
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <span className="text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-sky-300" /> Clouds
            </span>
            <span className={controlsState.showClouds ? 'text-sky-300 font-bold' : 'text-slate-500'}>
              {controlsState.showClouds ? 'ON' : 'OFF'}
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Atmosphere
            </span>
            <span className={controlsState.atmosphereGlow ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
              {controlsState.atmosphereGlow ? 'ON' : 'OFF'}
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-emerald-400" /> Outbreaks
            </span>
            <span className="text-emerald-400 font-bold">
              {districts.length} Pins
            </span>
          </div>
        </div>
      </div>

      {/* Top Right: Camera Mode Presets (Enables user to instantly switch to the NASA Horizon View like the reference image!) */}
      <div className="absolute top-4 right-4 z-10 bg-[#050814]/85 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-1.5 text-xs">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono px-2 hidden sm:inline">Camera Angles:</span>
        <button
          onClick={() => applyCameraPreset('horizon')}
          className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
            cameraPreset === 'horizon'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 border border-sky-400/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Horizon Curve</span>
        </button>

        <button
          onClick={() => applyCameraPreset('india')}
          className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
            cameraPreset === 'india'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 border border-sky-400/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Telangana Focus</span>
        </button>

        <button
          onClick={() => applyCameraPreset('night')}
          className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
            cameraPreset === 'night'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 border border-sky-400/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Night Lights</span>
        </button>

        <button
          onClick={() => applyCameraPreset('global')}
          className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
            cameraPreset === 'global'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 border border-sky-400/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>Global View</span>
        </button>
      </div>

      {/* Hovered District Tooltip */}
      {hoveredDistrict && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-[#080d1e]/95 backdrop-blur-xl px-5 py-3 rounded-2xl border border-sky-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-slate-100 flex items-center gap-4 animate-fade-in">
          <div>
            <div className="font-bold text-sm text-sky-300 flex items-center gap-2">
              {hoveredDistrict.name}, {hoveredDistrict.state}
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                {hoveredDistrict.lat.toFixed(2)}°N, {hoveredDistrict.lng.toFixed(2)}°E
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Outbreak Risk: <span className="font-bold text-white">{(hoveredDistrict.riskScore * 100).toFixed(0)}%</span> • SVI Score: {hoveredDistrict.sviScore}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            hoveredDistrict.riskTier === 'Very High' ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-lg shadow-red-500/20' :
            hoveredDistrict.riskTier === 'High' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-lg shadow-amber-500/20' :
            hoveredDistrict.riskTier === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
            'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
          }`}>
            {hoveredDistrict.riskTier}
          </span>
        </div>
      )}

      {/* Selected District Lock Banner */}
      {selectedDistrict && (
        <div className="absolute bottom-6 right-6 z-10 bg-[#080d1e]/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-sky-400/40 text-xs text-slate-200 flex items-center gap-3 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
          <div>
            <span className="text-slate-400">Locked Focus: </span>
            <span className="font-bold text-sky-300">{selectedDistrict.name}</span>
          </div>
          <button
            onClick={() => onSelectDistrict(selectedDistrict)}
            className="ml-2 px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 text-[11px] font-semibold transition"
          >
            Open Analytics →
          </button>
        </div>
      )}
    </div>
  );
};
