export const studioCardFragment = `
fragment StudioCard on Studio {
  _id
  name
  favorite
  bookmark
  numScenes
  # rating
  thumbnail {
    _id
    color
  }
  labels {
    _id
    name
    color
  }
  parent {
    _id
    name
    thumbnail {
      _id
      color
    }
  }
}
`;
