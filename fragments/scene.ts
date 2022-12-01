import { actorCardFragment } from "./actor";
import { movieCardFragment } from "./movie";

export const scenePageFragment = `
fragment ScenePage on Scene {
  _id
  name
  favorite
  bookmark
  rating
  description
  releaseDate
  addedOn
  labels {
    _id
    name
    color
  }
  thumbnail {
    _id
  }
  meta {
    duration
    fps
    size
    dimensions {
      width
      height
    }
  }
  actors {
    ...ActorCard
  }
  movies {
    ...MovieCard
  }
  studio {
    _id
    name
    thumbnail {
      _id
    }
  }
  path
  watches
  markers {
    _id
    name
    time
    favorite
    bookmark
    rating
    thumbnail {
      _id
    }
    labels {
      _id
      name
    }
  }
}
${actorCardFragment}
${movieCardFragment}
`;

export const sceneCardFragment = `
fragment SceneCard on Scene {
  _id
  name
  releaseDate
  favorite
  bookmark
  rating
  thumbnail {
    _id
    color
  }
  labels {
    _id
    name
    color
  }
  actors {
    _id
    name
  }
  studio {
    _id
    name
  }
  meta {
    duration
    size
    dimensions {
      width
      height
    }
  }
  watches
  availableFields {
    _id
    name
    type
    unit
  }
  customFields
}
`;
