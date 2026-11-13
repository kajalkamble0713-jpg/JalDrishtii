import { RiverData } from '../types';

export const INDIA_RIVERS_DATA: RiverData[] = [
  {
    id: 'ganges',
    name: 'Ganges River (Ganga)',
    type: 'Major River',
    lengthKm: 2525,
    origin: 'Gangotri Glacier, Uttarakhand (3,892m ASL)',
    outflow: 'Bay of Bengal (Sundarbans Delta)',
    turbidity: '4.85 FNU',
    turbidityValue: 4.85,
    ndciValue: 0.38,
    cdomValue: 1.82,
    dissolvedOxygenMgL: 5.2,
    phLevel: 7.6,
    flowRate: '12,000 m³/s',
    waterTempCelsius: 27.4,
    outbreakRiskLevel: 'Very High',
    statesTransited: ['Uttarakhand', 'Uttar Pradesh', 'Bihar', 'Jharkhand', 'West Bengal'],
    districtsTransited: [
      { name: 'Uttarkashi', state: 'Uttarakhand', role: 'Source / Upper Course', riskLevel: 'Low' },
      { name: 'Haridwar', state: 'Uttarakhand', role: 'Source / Upper Course', riskLevel: 'Moderate' },
      { name: 'Kanpur Nagar', state: 'Uttar Pradesh', role: 'Mid-Course Basin', riskLevel: 'Very High' },
      { name: 'Prayagraj (Allahabad)', state: 'Uttar Pradesh', role: 'Mid-Course Basin', riskLevel: 'Very High' },
      { name: 'Varanasi', state: 'Uttar Pradesh', role: 'Mid-Course Basin', riskLevel: 'Very High' },
      { districtId: 'patna_bihar', name: 'Patna', state: 'Bihar', role: 'Mid-Course Basin', riskLevel: 'Very High' },
      { name: 'Bhagalpur', state: 'Bihar', role: 'Mid-Course Basin', riskLevel: 'High' },
      { name: 'Murshidabad', state: 'West Bengal', role: 'Downstream Estuary / Delta', riskLevel: 'High' },
      { name: 'Kolkata', state: 'West Bengal', role: 'Downstream Estuary / Delta', riskLevel: 'Very High' }
    ],
    downstreamPropagationHours: 48,
    basinPopulationMillions: 400,
    keyOutbreakThreat: 'Monsoon sewage overflow & high industrial turbidity triggering Cholera (Vibrio cholerae) & Acute Diarrheal Disease spikes.',
    recommendedWashAction: 'Deploy solar emergency chlorination units & rapid antigen test kits in Patna & Kanpur flood shelter centers.',
    path: [
      [30.98, 78.93], // Gangotri
      [30.15, 78.30], // Rishikesh / Haridwar
      [28.80, 80.50], 
      [26.44, 80.33], // Kanpur
      [25.43, 81.84], // Prayagraj
      [25.31, 82.97], // Varanasi
      [25.59, 85.13], // Patna
      [25.24, 87.01], // Bhagalpur
      [24.18, 88.27], // Murshidabad
      [22.57, 88.36], // Kolkata
      [21.60, 88.10]  // Bay of Bengal outlet
    ]
  },
  {
    id: 'yamuna',
    name: 'Yamuna River',
    type: 'Major River',
    lengthKm: 1376,
    origin: 'Yamunotri Glacier, Uttarakhand (6,387m ASL)',
    outflow: 'Confluence with Ganges at Prayagraj (Triveni Sangam)',
    turbidity: '4.20 FNU',
    turbidityValue: 4.20,
    ndciValue: 0.35,
    cdomValue: 1.68,
    dissolvedOxygenMgL: 3.8,
    phLevel: 7.2,
    flowRate: '2,950 m³/s',
    waterTempCelsius: 29.1,
    outbreakRiskLevel: 'Very High',
    statesTransited: ['Uttarakhand', 'Himachal Pradesh', 'Haryana', 'Delhi NCR', 'Uttar Pradesh'],
    districtsTransited: [
      { name: 'Uttarkashi', state: 'Uttarakhand', role: 'Source / Upper Course', riskLevel: 'Low' },
      { name: 'YAMUNANAGAR', state: 'Haryana', role: 'Upper Course', riskLevel: 'Moderate' },
      { name: 'Delhi NCR', state: 'Delhi', role: 'Mid-Course Basin', riskLevel: 'Very High' },
      { name: 'Mathura', state: 'Uttar Pradesh', role: 'Mid-Course Basin', riskLevel: 'High' },
      { name: 'Agra', state: 'Uttar Pradesh', role: 'Mid-Course Basin', riskLevel: 'Very High' },
      { name: 'Etawah', state: 'Uttar Pradesh', role: 'Mid-Course Basin', riskLevel: 'High' },
      { name: 'Prayagraj', state: 'Uttar Pradesh', role: 'Downstream Estuary / Delta', riskLevel: 'Very High' }
    ],
    downstreamPropagationHours: 36,
    basinPopulationMillions: 57,
    keyOutbreakThreat: 'High urban runoff & low dissolved oxygen leading to Typhoid & bacterial Gastroenteritis clusters.',
    recommendedWashAction: 'Increase booster chlorination at Agra & Mathura water intake stations; issue boil-water alerts.',
    path: [
      [31.01, 78.45], // Yamunotri
      [30.32, 77.28], // Yamunanagar
      [28.61, 77.20], // Delhi NCR
      [27.49, 77.67], // Mathura
      [27.17, 78.00], // Agra
      [26.78, 79.02], // Etawah
      [25.43, 81.84]  // Prayagraj Sangam
    ]
  },
  {
    id: 'godavari',
    name: 'Godavari River (Dakshin Ganga)',
    type: 'Major River',
    lengthKm: 1465,
    origin: 'Trimbakeshwar, Nashik, Maharashtra (920m ASL)',
    outflow: 'Bay of Bengal (Narsapur, Andhra Pradesh)',
    turbidity: '3.95 FNU',
    turbidityValue: 3.95,
    ndciValue: 0.28,
    cdomValue: 1.62,
    dissolvedOxygenMgL: 6.1,
    phLevel: 7.8,
    flowRate: '3,500 m³/s',
    waterTempCelsius: 28.5,
    outbreakRiskLevel: 'High',
    statesTransited: ['Maharashtra', 'Telangana', 'Chhattisgarh', 'Andhra Pradesh'],
    districtsTransited: [
      { name: 'Nashik', state: 'Maharashtra', role: 'Source / Upper Course', riskLevel: 'Moderate' },
      { name: 'Nanded', state: 'Maharashtra', role: 'Mid-Course Basin', riskLevel: 'Moderate' },
      { districtId: 'nizamabad_telangana', name: 'Nizamabad', state: 'Telangana', role: 'Mid-Course Basin', riskLevel: 'High' },
      { name: 'Karimnagar', state: 'Telangana', role: 'Mid-Course Basin', riskLevel: 'High' },
      { districtId: 'khammam_telangana', name: 'Khammam', state: 'Telangana', role: 'Mid-Course Basin', riskLevel: 'High' },
      { name: 'East Godavari (Rajahmundry)', state: 'Andhra Pradesh', role: 'Downstream Estuary / Delta', riskLevel: 'Very High' },
      { name: 'West Godavari', state: 'Andhra Pradesh', role: 'Downstream Estuary / Delta', riskLevel: 'High' }
    ],
    downstreamPropagationHours: 52,
    basinPopulationMillions: 75,
    keyOutbreakThreat: 'Agricultural runoff & seasonal flooding spreading Salmonella Typhi & Cholera downriver to Godavari delta villages.',
    recommendedWashAction: 'Chlorine tablet distribution in Khammam & East Godavari relief camps; continuous Sentinel-2 NDCI monitoring.',
    path: [
      [19.93, 73.53], // Nashik
      [19.15, 77.31], // Nanded
      [18.67, 78.09], // Nizamabad
      [18.43, 79.12], // Karimnagar
      [17.24, 80.15], // Khammam
      [17.00, 81.78], // Rajahmundry
      [16.43, 81.70]  // Narsapur Estuary
    ]
  },
  {
    id: 'krishna',
    name: 'Krishna River',
    type: 'Major River',
    lengthKm: 1400,
    origin: 'Mahabaleshwar, Western Ghats, Maharashtra (1,337m ASL)',
    outflow: 'Bay of Bengal (Hamsaladeevi, Andhra Pradesh)',
    turbidity: '3.40 FNU',
    turbidityValue: 3.40,
    ndciValue: 0.24,
    cdomValue: 1.45,
    dissolvedOxygenMgL: 6.4,
    phLevel: 7.9,
    flowRate: '2,200 m³/s',
    waterTempCelsius: 28.1,
    outbreakRiskLevel: 'High',
    statesTransited: ['Maharashtra', 'Karnataka', 'Telangana', 'Andhra Pradesh'],
    districtsTransited: [
      { name: 'Satara', state: 'Maharashtra', role: 'Source / Upper Course', riskLevel: 'Low' },
      { name: 'Sangli', state: 'Maharashtra', role: 'Upper Course', riskLevel: 'Moderate' },
      { name: 'Bagalkot', state: 'Karnataka', role: 'Mid-Course Basin', riskLevel: 'Moderate' },
      { districtId: 'mahabubnagar_telangana', name: 'Mahabubnagar', state: 'Telangana', role: 'Mid-Course Basin', riskLevel: 'High' },
      { districtId: 'nalgonda_telangana', name: 'Nalgonda', state: 'Telangana', role: 'Mid-Course Basin', riskLevel: 'High' },
      { name: 'Guntur', state: 'Andhra Pradesh', role: 'Downstream Estuary / Delta', riskLevel: 'High' },
      { name: 'Vijayawada (Krishna)', state: 'Andhra Pradesh', role: 'Downstream Estuary / Delta', riskLevel: 'Very High' }
    ],
    downstreamPropagationHours: 42,
    basinPopulationMillions: 80,
    keyOutbreakThreat: 'Heavy dam discharges & urban sewage in Vijayawada causing acute diarrheal outbreaks.',
    recommendedWashAction: 'Deploy mobile water purification vans along Prakasam Barrage canal networks.',
    path: [
      [17.92, 73.65], // Mahabaleshwar
      [16.85, 74.56], // Sangli
      [16.18, 75.69], // Bagalkot
      [16.74, 77.98], // Mahabubnagar
      [17.05, 79.26], // Nalgonda
      [16.50, 80.64], // Vijayawada
      [15.78, 80.93]  // Hamsaladeevi Estuary
    ]
  },
  {
    id: 'musi',
    name: 'Musi River (Hyderabad Urban Basin)',
    type: 'Urban Tributary',
    lengthKm: 240,
    origin: 'Ananthagiri Hills, Vikarabad, Telangana',
    outflow: 'Confluence with Krishna River at Wadapally, Nalgonda',
    turbidity: '4.42 FNU',
    turbidityValue: 4.42,
    ndciValue: 0.36,
    cdomValue: 1.95,
    dissolvedOxygenMgL: 2.1,
    phLevel: 6.9,
    flowRate: '180 m³/s',
    waterTempCelsius: 31.2,
    outbreakRiskLevel: 'Very High',
    statesTransited: ['Telangana'],
    districtsTransited: [
      { name: 'Vikarabad', state: 'Telangana', role: 'Source / Upper Course', riskLevel: 'Low' },
      { districtId: 'medak_telangana', name: 'Medak / Rangareddy Border', state: 'Telangana', role: 'Mid-Course Basin', riskLevel: 'Moderate' },
      { name: 'Hyderabad Urban', state: 'Telangana', role: 'Mid-Course Basin', riskLevel: 'Very High' },
      { districtId: 'nalgonda_telangana', name: 'Nalgonda', state: 'Telangana', role: 'Downstream Estuary / Delta', riskLevel: 'High' }
    ],
    downstreamPropagationHours: 18,
    basinPopulationMillions: 11,
    keyOutbreakThreat: 'Critical urban sewage contamination causing high Salmonella Typhi endemism & monsoon Cholera spikes.',
    recommendedWashAction: 'STP effluent surveillance; distribution of home chlorination drops to Musi riverbank settlements.',
    path: [
      [17.31, 77.85], // Vikarabad
      [17.38, 78.48], // Hyderabad City
      [17.15, 79.10], // Choutuppal
      [16.88, 79.62]  // Wadapally Confluence
    ]
  },
  {
    id: 'brahmaputra',
    name: 'Brahmaputra River',
    type: 'Major River',
    lengthKm: 2900,
    origin: 'Angsi Glacier, Burang, Tibet (5,210m ASL)',
    outflow: 'Bay of Bengal (Paddma / Meghna Delta, Bangladesh)',
    turbidity: '5.10 FNU',
    turbidityValue: 5.10,
    ndciValue: 0.42,
    cdomValue: 2.10,
    dissolvedOxygenMgL: 6.8,
    phLevel: 7.4,
    flowRate: '19,800 m³/s',
    waterTempCelsius: 24.2,
    outbreakRiskLevel: 'Very High',
    statesTransited: ['Arunachal Pradesh', 'Assam'],
    districtsTransited: [
      { name: 'Pasighat', state: 'Arunachal Pradesh', role: 'Source / Upper Course', riskLevel: 'Low' },
      { name: 'Dibrugarh', state: 'Assam', role: 'Upper Course', riskLevel: 'High' },
      { name: 'Jorhat (Majuli)', state: 'Assam', role: 'Mid-Course Basin', riskLevel: 'Very High' },
      { name: 'Tezpur', state: 'Assam', role: 'Mid-Course Basin', riskLevel: 'High' },
      { name: 'Guwahati (Kamrup)', state: 'Assam', role: 'Mid-Course Basin', riskLevel: 'Very High' },
      { name: 'Dhubri', state: 'Assam', role: 'Downstream Estuary / Delta', riskLevel: 'Very High' }
    ],
    downstreamPropagationHours: 30,
    basinPopulationMillions: 65,
    keyOutbreakThreat: 'Catastrophic annual monsoon erosion & village submergence triggering massive Cholera & dysentery waves.',
    recommendedWashAction: 'Deploy boat-mounted water filtration units to flood-isolated island char settlements in Majuli & Dhubri.',
    path: [
      [28.06, 95.33], // Pasighat
      [27.47, 94.91], // Dibrugarh
      [26.75, 94.20], // Jorhat / Majuli
      [26.63, 92.80], // Tezpur
      [26.18, 91.73], // Guwahati
      [26.02, 89.98]  // Dhubri (Border)
    ]
  },
  {
    id: 'narmada',
    name: 'Narmada River (Reva)',
    type: 'Major River',
    lengthKm: 1312,
    origin: 'Amarkantak, Anuppur, Madhya Pradesh (1,048m ASL)',
    outflow: 'Gulf of Khambhat, Arabian Sea (Bharuch, Gujarat)',
    turbidity: '2.80 FNU',
    turbidityValue: 2.80,
    ndciValue: 0.18,
    cdomValue: 1.15,
    dissolvedOxygenMgL: 7.2,
    phLevel: 8.1,
    flowRate: '1,440 m³/s',
    waterTempCelsius: 26.8,
    outbreakRiskLevel: 'Moderate',
    statesTransited: ['Madhya Pradesh', 'Maharashtra', 'Gujarat'],
    districtsTransited: [
      { name: 'Anuppur (Amarkantak)', state: 'Madhya Pradesh', role: 'Source / Upper Course', riskLevel: 'Low' },
      { name: 'Jabalpur', state: 'Madhya Pradesh', role: 'Upper Course', riskLevel: 'Moderate' },
      { name: 'Hoshangabad (Narmadapuram)', state: 'Madhya Pradesh', role: 'Mid-Course Basin', riskLevel: 'Moderate' },
      { name: 'Narmada (Kevadia)', state: 'Gujarat', role: 'Mid-Course Basin', riskLevel: 'Low' },
      { name: 'Bharuch', state: 'Gujarat', role: 'Downstream Estuary / Delta', riskLevel: 'Moderate' }
    ],
    downstreamPropagationHours: 40,
    basinPopulationMillions: 22,
    keyOutbreakThreat: 'Localized runoff around dam reservoirs during early monsoon bursts causing moderate ADD incidence.',
    recommendedWashAction: 'Routine monitoring at Sardar Sarovar dam intake towers.',
    path: [
      [22.67, 81.75], // Amarkantak
      [23.18, 79.98], // Jabalpur
      [22.75, 77.72], // Hoshangabad
      [21.88, 73.55], // Kevadia
      [21.70, 72.97]  // Bharuch Estuary
    ]
  },
  {
    id: 'mahanadi',
    name: 'Mahanadi River',
    type: 'Major River',
    lengthKm: 900,
    origin: 'Sihawa, Dhamtari, Chhattisgarh (442m ASL)',
    outflow: 'Bay of Bengal (False Point, Odisha)',
    turbidity: '3.75 FNU',
    turbidityValue: 3.75,
    ndciValue: 0.27,
    cdomValue: 1.58,
    dissolvedOxygenMgL: 6.3,
    phLevel: 7.7,
    flowRate: '2,100 m³/s',
    waterTempCelsius: 28.2,
    outbreakRiskLevel: 'High',
    statesTransited: ['Chhattisgarh', 'Odisha'],
    districtsTransited: [
      { name: 'Dhamtari', state: 'Chhattisgarh', role: 'Source / Upper Course', riskLevel: 'Low' },
      { name: 'Raipur', state: 'Chhattisgarh', role: 'Upper Course', riskLevel: 'Moderate' },
      { name: 'Sambalpur (Hirakud)', state: 'Odisha', role: 'Mid-Course Basin', riskLevel: 'High' },
      { name: 'Cuttack', state: 'Odisha', role: 'Downstream Estuary / Delta', riskLevel: 'Very High' },
      { name: 'Puri', state: 'Odisha', role: 'Downstream Estuary / Delta', riskLevel: 'High' }
    ],
    downstreamPropagationHours: 32,
    basinPopulationMillions: 32,
    keyOutbreakThreat: 'Hirakud dam release surges washing silt & bacterial pathogens down into Cuttack urban drinking supplies.',
    recommendedWashAction: 'Boil-water alerts & rapid chlorination at Cuttack municipal intake stations.',
    path: [
      [20.30, 81.82], // Dhamtari
      [21.25, 81.63], // Raipur
      [21.46, 83.98], // Sambalpur
      [20.46, 85.88], // Cuttack
      [20.27, 86.70]  // False Point Estuary
    ]
  },
  {
    id: 'kaveri',
    name: 'Kaveri River (Cauvery)',
    type: 'Major River',
    lengthKm: 805,
    origin: 'Talakaveri, Kodagu, Western Ghats, Karnataka (1,341m ASL)',
    outflow: 'Bay of Bengal (Poompuhar, Tamil Nadu)',
    turbidity: '2.10 FNU',
    turbidityValue: 2.10,
    ndciValue: 0.15,
    cdomValue: 1.05,
    dissolvedOxygenMgL: 7.5,
    phLevel: 8.0,
    flowRate: '670 m³/s',
    waterTempCelsius: 27.1,
    outbreakRiskLevel: 'Low',
    statesTransited: ['Karnataka', 'Tamil Nadu'],
    districtsTransited: [
      { name: 'Kodagu (Coorg)', state: 'Karnataka', role: 'Source / Upper Course', riskLevel: 'Low' },
      { name: 'Mysuru', state: 'Karnataka', role: 'Upper Course', riskLevel: 'Low' },
      { name: 'Mandya', state: 'Karnataka', role: 'Mid-Course Basin', riskLevel: 'Low' },
      { name: 'Salem (Mettur)', state: 'Tamil Nadu', role: 'Mid-Course Basin', riskLevel: 'Moderate' },
      { name: 'Tiruchirappalli', state: 'Tamil Nadu', role: 'Mid-Course Basin', riskLevel: 'Moderate' },
      { name: 'Thanjavur', state: 'Tamil Nadu', role: 'Downstream Estuary / Delta', riskLevel: 'Moderate' }
    ],
    downstreamPropagationHours: 24,
    basinPopulationMillions: 30,
    keyOutbreakThreat: 'Low water velocity in summer causing localized algal blooms near Mettur Dam & Trichy delta.',
    recommendedWashAction: 'Algicide & water quality testing at Trichy municipal intake works.',
    path: [
      [12.38, 75.48], // Talakaveri
      [12.29, 76.63], // Mysuru
      [12.52, 76.89], // Mandya
      [11.79, 77.80], // Mettur / Salem
      [10.79, 78.70], // Tiruchirappalli
      [11.14, 79.85]  // Poompuhar Estuary
    ]
  },
  {
    id: 'tungabhadra',
    name: 'Tungabhadra River (Karnataka Basin)',
    type: 'Major River',
    lengthKm: 531,
    origin: 'Confluence of Tunga & Bhadra, Koodli, Shivamogga, Karnataka',
    outflow: 'Confluence with Krishna River near Alampur, Telangana / Andhra border',
    turbidity: '3.65 FNU',
    turbidityValue: 3.65,
    ndciValue: 0.26,
    cdomValue: 1.48,
    dissolvedOxygenMgL: 6.2,
    phLevel: 7.7,
    flowRate: '1,850 m³/s',
    waterTempCelsius: 28.6,
    outbreakRiskLevel: 'High',
    statesTransited: ['Karnataka', 'Andhra Pradesh', 'Telangana'],
    districtsTransited: [
      { name: 'Shivamogga (Koodli)', state: 'Karnataka', role: 'Source / Upper Course', riskLevel: 'Low' },
      { name: 'Davanagere', state: 'Karnataka', role: 'Upper Course', riskLevel: 'Moderate' },
      { name: 'Vijayanagara (Hampi)', state: 'Karnataka', role: 'Mid-Course Basin', riskLevel: 'Moderate' },
      { name: 'Ballari', state: 'Karnataka', role: 'Mid-Course Basin', riskLevel: 'High' },
      { name: 'Raichur', state: 'Karnataka', role: 'Mid-Course Basin', riskLevel: 'High' },
      { name: 'Kurnool', state: 'Andhra Pradesh', role: 'Downstream Estuary / Delta', riskLevel: 'High' }
    ],
    downstreamPropagationHours: 28,
    basinPopulationMillions: 18,
    keyOutbreakThreat: 'Agricultural runoff & reservoir sediment release causing post-monsoon Acute Diarrheal Disease & E. coli surges.',
    recommendedWashAction: 'Intensify daily free residual chlorine checks at TB Dam intake and Ballari municipal pumping stations.',
    path: [
      [14.02, 75.67], // Koodli / Shivamogga origin
      [14.35, 75.82], // Honnali
      [14.47, 75.92], // Davanagere border
      [15.15, 76.25], // Tungabhadra Dam (Hosapete)
      [15.33, 76.46], // Hampi / Vijayanagara
      [15.35, 76.75], // Kampli
      [15.65, 77.05], // Siruguppa / Ballari border
      [15.90, 77.30], // Raichur south
      [15.88, 78.13]  // Sangameswaram confluence with Krishna
    ]
  }
];
