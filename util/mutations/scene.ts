import axios from "axios";

import { gqlIp } from "../ip";

export async function rateScene(sceneId: string, rating: number): Promise<void> {
  await axios.post(
    gqlIp(),
    {
      query: `
mutation($ids: [String!]!, $opts: SceneUpdateOpts!) {
  updateScenes(ids: $ids, opts: $opts) {
    rating
  }
}
      `,
      variables: {
        ids: [sceneId],
        opts: {
          rating,
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

export async function favoriteScene(sceneId: string, value: boolean): Promise<void> {
  await axios.post(
    gqlIp(),
    {
      query: `
mutation($ids: [String!]!, $opts: SceneUpdateOpts!) {
  updateScenes(ids: $ids, opts: $opts) {
    favorite
  }
}
      `,
      variables: {
        ids: [sceneId],
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

export async function bookmarkScene(sceneId: string, value: Date | null): Promise<void> {
  await axios.post(
    gqlIp(),
    {
      query: `
mutation($ids: [String!]!, $opts: SceneUpdateOpts!) {
  updateScenes(ids: $ids, opts: $opts) {
    bookmark
  }
}
      `,
      variables: {
        ids: [sceneId],
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
