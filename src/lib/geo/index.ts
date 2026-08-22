/**
 * Geo-hulpmiddelen. Afstand via haversine. Voor de MVP gebruiken we een kleine
 * ingebouwde gazetteer van Nederlandse plaatsen zodat locatie-matching werkt
 * zonder externe geocoder. De architectuur blijft provider-agnostisch: later kan
 * een echte geocoding-service `geocodeNL` vervangen. Zie docs/ARCHITECTURE.md §2.
 */
export interface LatLng {
  lat: number;
  lng: number;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Beknopte gazetteer (benaderende coördinaten). Uitbreidbaar / te vervangen.
const PLAATSEN: Record<string, LatLng> = {
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  rotterdam: { lat: 51.9244, lng: 4.4777 },
  "den haag": { lat: 52.0705, lng: 4.3007 },
  utrecht: { lat: 52.0907, lng: 5.1214 },
  eindhoven: { lat: 51.4416, lng: 5.4697 },
  groningen: { lat: 53.2194, lng: 6.5665 },
  tilburg: { lat: 51.5555, lng: 5.0913 },
  almere: { lat: 52.3508, lng: 5.2647 },
  breda: { lat: 51.5719, lng: 4.7683 },
  nijmegen: { lat: 51.8126, lng: 5.8372 },
  enschede: { lat: 52.2215, lng: 6.8937 },
  haarlem: { lat: 52.3874, lng: 4.6462 },
  arnhem: { lat: 51.9851, lng: 5.8987 },
  zwolle: { lat: 52.5168, lng: 6.083 },
  amersfoort: { lat: 52.1561, lng: 5.3878 },
  apeldoorn: { lat: 52.2112, lng: 5.9699 },
  leeuwarden: { lat: 53.2012, lng: 5.7999 },
  assen: { lat: 52.9925, lng: 6.5649 },
  emmen: { lat: 52.7792, lng: 6.9061 },
  drachten: { lat: 53.1122, lng: 6.0989 },
  veendam: { lat: 53.1044, lng: 6.8776 },
  winschoten: { lat: 53.1436, lng: 7.0343 },
  hoogezand: { lat: 53.1626, lng: 6.7625 },
  appingedam: { lat: 53.3217, lng: 6.8583 },
  delfzijl: { lat: 53.335, lng: 6.9219 },
  stadskanaal: { lat: 52.9903, lng: 6.9525 },
  leek: { lat: 53.1616, lng: 6.3878 },
  haren: { lat: 53.1739, lng: 6.6017 },
  zuidhorn: { lat: 53.2447, lng: 6.4064 },
  "ten boer": { lat: 53.2761, lng: 6.6667 },
  meppel: { lat: 52.6957, lng: 6.1934 },
  hoogeveen: { lat: 52.7225, lng: 6.4758 },
  heerenveen: { lat: 52.9597, lng: 5.9195 },
  sneek: { lat: 53.0326, lng: 5.6581 },
  deventer: { lat: 52.2551, lng: 6.1639 },
  lelystad: { lat: 52.5185, lng: 5.4714 },
};

export function geocodeNL(plaats: string): LatLng | null {
  const key = plaats.trim().toLowerCase();
  return PLAATSEN[key] ?? null;
}
