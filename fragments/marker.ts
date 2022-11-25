export const markerPageFragment = `
fragment MarkerPage on Marker {
  _id
  name
  time
  rating
  favorite
  bookmark
  labels {
    _id
    name
  }
  thumbnail {
    _id
    name
  }
}
`;

export const markerCardFragment = `
fragment MarkerCard on Marker {
  _id
  name
  favorite
`;
