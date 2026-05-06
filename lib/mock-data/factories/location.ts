export interface LocationSuggestion {
  id: string
  description: string
  mainText: string
  secondaryText: string
  lat?: number
  lon?: number
}

export const MOCK_LOCATION_SUGGESTIONS: LocationSuggestion[] = [
  { id: "loc-001", description: "Suria KLCC, Kuala Lumpur City Centre, Kuala Lumpur", mainText: "Suria KLCC", secondaryText: "Kuala Lumpur City Centre, Kuala Lumpur", lat: 3.1579, lon: 101.7123 },
  { id: "loc-002", description: "Pavilion Kuala Lumpur, Jalan Bukit Bintang, Kuala Lumpur", mainText: "Pavilion Kuala Lumpur", secondaryText: "Jalan Bukit Bintang, Kuala Lumpur", lat: 3.1488, lon: 101.7131 },
  { id: "loc-003", description: "Solaris Dutamas, Mont Kiara, Kuala Lumpur", mainText: "Solaris Dutamas", secondaryText: "Mont Kiara, Kuala Lumpur", lat: 3.1726, lon: 101.6652 },
  { id: "loc-004", description: "PJ Trade Centre, Petaling Jaya, Selangor", mainText: "PJ Trade Centre", secondaryText: "Petaling Jaya, Selangor", lat: 3.1073, lon: 101.6067 },
  { id: "loc-005", description: "Sunway Pyramid, Bandar Sunway, Selangor", mainText: "Sunway Pyramid", secondaryText: "Bandar Sunway, Selangor", lat: 3.0733, lon: 101.6072 },
  { id: "loc-006", description: "Gurney Plaza, Georgetown, Penang", mainText: "Gurney Plaza", secondaryText: "Georgetown, Penang", lat: 5.4356, lon: 100.3069 },
  { id: "loc-007", description: "IOI City Mall, Putrajaya, Selangor", mainText: "IOI City Mall", secondaryText: "Putrajaya, Selangor", lat: 2.9742, lon: 101.7241 },
  { id: "loc-008", description: "The Gardens Mall, Mid Valley City, Kuala Lumpur", mainText: "The Gardens Mall", secondaryText: "Mid Valley City, Kuala Lumpur", lat: 3.1181, lon: 101.6768 },
]
