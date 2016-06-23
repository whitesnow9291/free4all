// LatLng Helper

export const is_equal_latlng = (latlng1, latlng2) => latlng1 && latlng2 && latlng1.lat && latlng1.lng && latlng2.lat && latlng2.lng && latlng1.lat == latlng2.lat && latlng1.lng == latlng2.lng;
export const mongoCoords = (coords) => [coords.lng, coords.lat];
export const mongoBounds = (mapBounds) => [mongoCoords(mapBounds._southWest), mongoCoords(mapBounds._northEast)];
export const lnglat2latlng = (lnglat) => [lnglat[1], lnglat[0]];