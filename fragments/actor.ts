export const actorCardFragment = `
fragment ActorCard on Actor {
  _id
  name
  age
  rating
  favorite
  bookmark
  bornOn
  thumbnail {
    _id
    color
  }
  altThumbnail {
    _id
  }
  labels {
    _id
    name
    color
  }
  nationality {
    name
    alpha2
    nationality
    alias
  }
  externalLinks {
    url
    text
  }
}
`;
