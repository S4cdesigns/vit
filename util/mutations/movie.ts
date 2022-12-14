import axios from "axios";

import { graphqlQuery } from "../gql";
import { gqlIp } from "../ip";

export async function setMovieSpine(movieId: string, imageId: string) {
  await graphqlQuery(
    `
mutation ($ids: [String!]!, $opts: MovieUpdateOpts!) {
  updateMovies(ids: $ids, opts: $opts) {
    spineCover {
      _id
      color
    }
  }
}`,
    {
      ids: [movieId],
      opts: {
        spineCover: imageId,
      },
    }
  );
}

export async function setMovieBackCover(movieId: string, imageId: string) {
  await graphqlQuery(
    `
mutation ($ids: [String!]!, $opts: MovieUpdateOpts!) {
  updateMovies(ids: $ids, opts: $opts) {
    backCover {
      _id
      color
    }
  }
}`,
    {
      ids: [movieId],
      opts: {
        backCover: imageId,
      },
    }
  );
}

export async function setMovieFrontCover(movieId: string, imageId: string) {
  await graphqlQuery(
    `
mutation ($ids: [String!]!, $opts: MovieUpdateOpts!) {
  updateMovies(ids: $ids, opts: $opts) {
    frontCover {
      _id
      color
    }
  }
}`,
    {
      ids: [movieId],
      opts: {
        frontCover: imageId,
      },
    }
  );
}

export async function favoriteMovie(movieId: string, value: boolean): Promise<void> {
  await axios.post(
    gqlIp(),
    {
      query: `
mutation($ids: [String!]!, $opts: MovieUpdateOpts!) {
  updateMovies(ids: $ids, opts: $opts) {
    favorite
  }
}
      `,
      variables: {
        ids: [movieId],
        opts: {
          favorite: value,
        },
      },
    },
    {
      headers: {
        "x-pass": "xxx",
      },
    }
  );
}

export async function bookmarkMovie(movieId: string, value: Date | null): Promise<void> {
  await axios.post(
    gqlIp(),
    {
      query: `
mutation($ids: [String!]!, $opts: MovieUpdateOpts!) {
  updateMovies(ids: $ids, opts: $opts) {
    bookmark
  }
}
      `,
      variables: {
        ids: [movieId],
        opts: {
          bookmark: value && value.valueOf(),
        },
      },
    },
    {
      headers: {
        "x-pass": "xxx",
      },
    }
  );
}
