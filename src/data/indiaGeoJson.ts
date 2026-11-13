// GeoJSON boundaries for Indian States with Risk Index assignments
export const INDIA_STATES_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Telangana", code: "TG", riskTier: "High", riskScore: 0.78, capital: "Hyderabad" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.2, 18.2], [78.2, 19.9], [79.9, 19.8], [80.8, 18.8],
          [81.3, 17.8], [80.5, 16.9], [79.2, 16.2], [77.8, 15.9],
          [77.2, 18.2]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Andhra Pradesh", code: "AP", riskTier: "High", riskScore: 0.72, capital: "Amaravati" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.0, 15.8], [79.2, 16.2], [80.5, 16.9], [81.3, 17.8],
          [83.8, 18.8], [84.7, 19.1], [83.2, 17.2], [80.3, 13.5],
          [79.1, 13.5], [78.2, 14.5], [77.0, 15.8]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Bihar", code: "BR", riskTier: "Very High", riskScore: 0.88, capital: "Patna" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [83.3, 27.5], [88.2, 26.5], [88.1, 25.2], [83.8, 24.5], [83.3, 27.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Maharashtra", code: "MH", riskTier: "Moderate", riskScore: 0.58, capital: "Mumbai" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.6, 20.2], [76.5, 21.8], [80.9, 21.3], [80.3, 18.8],
          [78.2, 19.9], [73.5, 15.8], [72.8, 18.9], [72.6, 20.2]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Assam", code: "AS", riskTier: "Very High", riskScore: 0.84, capital: "Dispur" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [89.7, 26.8], [95.8, 27.9], [96.0, 26.8], [92.5, 24.2], [89.7, 26.8]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Uttar Pradesh", code: "UP", riskTier: "High", riskScore: 0.76, capital: "Lucknow" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.1, 29.8], [84.6, 27.3], [84.1, 24.8], [78.2, 24.2], [77.1, 29.8]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "West Bengal", code: "WB", riskTier: "High", riskScore: 0.74, capital: "Kolkata" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [86.0, 27.1], [89.8, 26.8], [88.8, 21.5], [86.8, 22.2], [86.0, 27.1]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Odisha", code: "OD", riskTier: "High", riskScore: 0.71, capital: "Bhubaneswar" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [81.4, 22.5], [87.5, 22.0], [86.9, 19.8], [81.8, 17.8], [81.4, 22.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Karnataka",
        code: "KA",
        riskTier: "High",
        riskScore: 0.72,
        capital: "Bengaluru",
        population: "67.6 Million",
        monitoredDistricts: "Bengaluru Urban, Mysuru, Belagavi, Kalaburagi, Udupi, Ballari",
        keyWaterBasins: "Kaveri, Krishna, Tungabhadra, Sharavathi"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.48, 18.45], // Aurad / Bidar north tip
          [77.72, 17.85], // Humnabad
          [77.35, 17.15], // Kalaburagi east
          [77.58, 16.52], // Raichur / Krishna confluence
          [77.30, 15.85], // Tungabhadra river entry
          [76.92, 15.15], // Ballari
          [77.20, 14.15], // Pavagada border
          [77.60, 13.80], // Chikkaballapura
          [78.35, 13.35], // Kolar gold fields east tip
          [78.10, 12.80], // Malur / Hosur border
          [77.72, 12.45], // Anekal / Bengaluru border
          [77.40, 12.05], // Kanakapura
          [77.10, 11.90], // Chamarajanagar east
          [76.95, 11.60], // Gundlupet / Bandipur south tip
          [76.35, 11.85], // Hunsur / Nagarhole
          [75.72, 12.10], // Kodagu / Brahmagiri
          [75.35, 12.50], // Talakaveri / Western Ghats
          [74.98, 12.87], // Mangaluru / Arabian Sea coast
          [74.74, 13.34], // Udupi coast
          [74.45, 14.10], // Bhatkal / Murudeshwar
          [74.30, 14.80], // Karwar / Kali river estuary
          [74.15, 15.00], // Majali / Goa border
          [74.25, 15.60], // Belagavi west / Chorla ghat
          [74.75, 16.20], // Nipani
          [75.30, 16.85], // Vijayapura north
          [76.15, 17.35], // Aland
          [77.05, 18.05], // Bhalki
          [77.48, 18.45]  // Back to Bidar north tip
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Tamil Nadu", code: "TN", riskTier: "Low", riskScore: 0.32, capital: "Chennai" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [76.2, 13.5], [80.3, 13.5], [79.8, 8.1], [77.2, 8.2], [76.2, 13.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Kerala", code: "KL", riskTier: "Low", riskScore: 0.28, capital: "Thiruvananthapuram" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [74.9, 12.8], [76.8, 11.8], [77.2, 8.2], [76.1, 10.2], [74.9, 12.8]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Gujarat", code: "GJ", riskTier: "Moderate", riskScore: 0.52, capital: "Gandhinagar" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [68.2, 23.8], [74.4, 24.7], [73.5, 20.2], [68.8, 22.0], [68.2, 23.8]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Rajasthan", code: "RJ", riskTier: "Moderate", riskScore: 0.55, capital: "Jaipur" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [69.5, 28.5], [78.2, 27.8], [76.8, 23.5], [70.2, 24.5], [69.5, 28.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Madhya Pradesh", code: "MP", riskTier: "High", riskScore: 0.68, capital: "Bhopal" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [74.0, 26.8], [82.8, 24.5], [81.5, 21.5], [74.5, 21.2], [74.0, 26.8]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Jharkhand", code: "JH", riskTier: "High", riskScore: 0.73, capital: "Ranchi" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [83.3, 25.2], [87.9, 25.0], [87.6, 22.0], [83.5, 22.0], [83.3, 25.2]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Chhattisgarh", code: "CG", riskTier: "High", riskScore: 0.70, capital: "Raipur" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [80.2, 24.1], [84.4, 23.8], [83.1, 17.8], [80.3, 18.8], [80.2, 24.1]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Punjab & Haryana", code: "PB-HR", riskTier: "Moderate", riskScore: 0.45, capital: "Chandigarh" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [73.8, 32.5], [77.6, 31.0], [77.4, 27.8], [74.2, 29.5], [73.8, 32.5]
        ]]
      }
    }
  ]
};

// Major Water Bodies & Rivers with telemetry station data
export const INDIA_WATER_BODIES = [
  {
    name: "Ganges River",
    type: "River",
    turbidity: "4.85 FNU",
    flowRate: "12,000 m³/s",
    path: [
      [30.1, 78.6], [28.8, 80.5], [26.8, 82.2], [25.6, 85.1], [25.2, 87.5], [22.5, 88.3]
    ]
  },
  {
    name: "Yamuna River",
    type: "River",
    turbidity: "4.20 FNU",
    flowRate: "2,950 m³/s",
    path: [
      [31.0, 78.4], [28.6, 77.2], [27.1, 78.0], [25.4, 81.8]
    ]
  },
  {
    name: "Brahmaputra River",
    type: "River",
    turbidity: "5.10 FNU",
    flowRate: "19,800 m³/s",
    path: [
      [27.9, 95.8], [27.2, 94.0], [26.2, 91.8], [25.2, 89.8]
    ]
  },
  {
    name: "Godavari River",
    type: "River",
    turbidity: "3.95 FNU",
    flowRate: "3,500 m³/s",
    path: [
      [19.9, 73.5], [19.2, 76.5], [18.8, 79.2], [17.5, 81.8], [16.8, 82.2]
    ]
  },
  {
    name: "Krishna River",
    type: "River",
    turbidity: "3.40 FNU",
    flowRate: "2,200 m³/s",
    path: [
      [17.9, 73.6], [16.5, 76.8], [16.0, 80.2], [15.8, 80.9]
    ]
  },
  {
    name: "Narmada River",
    type: "River",
    turbidity: "2.80 FNU",
    flowRate: "1,440 m³/s",
    path: [
      [22.7, 81.7], [22.8, 78.2], [21.8, 73.2]
    ]
  },
  {
    name: "Mahanadi River",
    type: "River",
    turbidity: "3.75 FNU",
    flowRate: "2,100 m³/s",
    path: [
      [20.3, 81.8], [21.5, 83.9], [20.4, 86.7]
    ]
  },
  {
    name: "Kaveri River",
    type: "River",
    turbidity: "2.10 FNU",
    flowRate: "670 m³/s",
    path: [
      [12.4, 75.8], [11.8, 78.2], [11.1, 79.8]
    ]
  },
  {
    name: "Musi River (Hyderabad)",
    type: "Urban Tributary",
    turbidity: "4.42 FNU",
    flowRate: "180 m³/s",
    path: [
      [17.4, 78.1], [17.37, 78.48], [16.9, 79.6]
    ]
  }
];

