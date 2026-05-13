const STATE_CODES: Record<string, string> = {
  "Kuala Lumpur": "KL",
  "Wilayah Persekutuan": "KL",
  "Wilayah Persekutuan Kuala Lumpur": "KL",
  "Selangor": "SGR",
  "Penang": "PNG",
  "Pulau Pinang": "PNG",
  "Putrajaya": "PJY",
  "Johor": "JHR",
  "Sabah": "SBH",
  "Sarawak": "SWK",
  "Singapore": "SG",
}

const COUNTRY_CODES: Record<string, string> = {
  "Malaysia": "MY",
  "Singapore": "SG",
  "Indonesia": "ID",
  "Thailand": "TH",
  "Philippines": "PH",
}

function fallbackCode(value: string, length: number): string {
  const cleaned = value.replace(/[^a-zA-Z]/g, "").toUpperCase()
  return cleaned.slice(0, length) || "??"
}

export function getStateCode(state: string): string {
  return STATE_CODES[state] ?? fallbackCode(state, 3)
}

export function getCountryCode(country: string): string {
  return COUNTRY_CODES[country] ?? fallbackCode(country, 2)
}

export function formatStateCountry(state: string, country: string): string {
  return `${getStateCode(state)}-${getCountryCode(country)}`
}
