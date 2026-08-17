export function mapsUrl(place) {
  const query = `${place.name}, ${place.address}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
