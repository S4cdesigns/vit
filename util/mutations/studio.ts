import axios from "axios";

import { gqlIp } from "../ip";

export async function favoriteStudio(studioId: string, value: boolean): Promise<void> {
  await axios.post(
    gqlIp(),
    {
      query: `
mutation($ids: [String!]!, $opts: StudioUpdateOpts!) {
  updateStudios(ids: $ids, opts: $opts) {
    favorite
  }
}
      `,
      variables: {
        ids: [studioId],
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

export async function bookmarkStudio(studioId: string, value: Date | null): Promise<void> {
  await axios.post(
    gqlIp(),
    {
      query: `
mutation($ids: [String!]!, $opts: StudioUpdateOpts!) {
  updateStudios(ids: $ids, opts: $opts) {
    bookmark
  }
}
      `,
      variables: {
        ids: [studioId],
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
