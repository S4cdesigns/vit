import { graphqlQuery } from "../gql";

export async function runScenePlugins(sceneId: string): Promise<void> {
  const mutation = `
mutation($id: String!) {
  runScenePlugins(id: $id) {
    _id
  }
}
`;
  await graphqlQuery(mutation, {
    id: sceneId,
  });
}

export async function watchScene(sceneId: string): Promise<number[]> {
  const mutation = `
mutation($id: String!) {
  watchScene(id: $id) {
    watches
  }
}`;
  const {
    watchScene: { watches },
  } = await graphqlQuery<{
    watchScene: {
      watches: number[];
    };
  }>(mutation, {
    id: sceneId,
  });
  return watches;
}

export async function unwatchScene(sceneId: string): Promise<number[]> {
  const mutation = `
mutation($id: String!) {
  unwatchScene(id: $id) {
    watches
  }
}`;
  const {
    unwatchScene: { watches },
  } = await graphqlQuery<{
    unwatchScene: {
      watches: number[];
    };
  }>(mutation, {
    id: sceneId,
  });
  return watches;
}

export async function rateScene(sceneId: string, rating: number): Promise<void> {
  const mutation = `
  mutation($ids: [String!]!, $opts: SceneUpdateOpts!) {
    updateScenes(ids: $ids, opts: $opts) {
      rating
    }
  }`;
  await graphqlQuery(mutation, {
    ids: [sceneId],
    opts: {
      rating,
    },
  });
}

export async function favoriteScene(sceneId: string, value: boolean): Promise<void> {
  const mutation = `
  mutation($ids: [String!]!, $opts: SceneUpdateOpts!) {
    updateScenes(ids: $ids, opts: $opts) {
      favorite
    }
  }`;
  await graphqlQuery(mutation, {
    ids: [sceneId],
    opts: {
      favorite: value,
    },
  });
}

export async function bookmarkScene(sceneId: string, value: Date | null): Promise<void> {
  const mutation = `
  mutation($ids: [String!]!, $opts: SceneUpdateOpts!) {
    updateScenes(ids: $ids, opts: $opts) {
      bookmark
    }
  }`;
  await graphqlQuery(mutation, {
    ids: [sceneId],
    opts: {
      bookmark: value && value.valueOf(),
    },
  });
}

export async function screenshotScene(sceneId: string, time: number): Promise<void> {
  const mutation = `
  mutation($id: String!, $sec: Float!) {
    screenshotScene(id: $id, sec: $sec) {
      bookmark
    }
  }`;
  await graphqlQuery(mutation, {
    id: sceneId,
    sec: time,
  });
}
