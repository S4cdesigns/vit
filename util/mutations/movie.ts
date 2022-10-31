import axios from "axios";

import { gqlIp } from "../ip";

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
