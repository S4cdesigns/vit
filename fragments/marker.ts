export const markerPageFragment = `
fragment MarkerPage on Scene {
  _id
  name
  favorite
}
`;

export const markerCardFragment = `
fragment MarkerCard on Marker {
  _id
  name
  favorite
`;
