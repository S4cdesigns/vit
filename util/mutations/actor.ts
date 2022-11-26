import axios from "axios";

import { graphqlQuery } from "../gql";
import { gqlIp } from "../ip";

export async function setActorThumbnail(actorId: string, imageId: string) {
  await graphqlQuery(
    `mutation ($ids: [String!]!, $opts: ActorUpdateOpts!) {
      updateActors(ids: $ids, opts: $opts) {
        thumbnail {
          _id
        }
      }
    }`,
    {
      ids: [actorId],
      opts: {
        thumbnail: imageId,
      },
    }
  );
}

export async function setActorAltThumbnail(actorId: string, imageId: string) {
  await graphqlQuery(
    `mutation ($ids: [String!]!, $opts: ActorUpdateOpts!) {
      updateActors(ids: $ids, opts: $opts) {
        altThumbnail {
          _id
        }
      }
    }`,
    {
      ids: [actorId],
      opts: {
        altThumbnail: imageId,
      },
    }
  );
}

export async function setActorAvatar(actorId: string, imageId: string) {
  await graphqlQuery(
    `mutation ($ids: [String!]!, $opts: ActorUpdateOpts!) {
      updateActors(ids: $ids, opts: $opts) {
        avatar {
          _id
        }
      }
    }`,
    {
      ids: [actorId],
      opts: {
        avatar: imageId,
      },
    }
  );
}

export async function setActorHero(actorId: string, imageId: string) {
  await graphqlQuery(
    `mutation ($ids: [String!]!, $opts: ActorUpdateOpts!) {
      updateActors(ids: $ids, opts: $opts) {
        hero {
          _id
        }
      }
    }`,
    {
      ids: [actorId],
      opts: {
        hero: imageId,
      },
    }
  );
}

export async function runActorPlugins(actorId: string): Promise<void> {
  const mutation = `
mutation($id: String!) {
  runActorPlugins(id: $id) {
    _id
  }
}
`;
  await graphqlQuery(mutation, {
    id: actorId,
  });
}

export async function rateActor(actorId: string, rating: number): Promise<void> {
  await axios.post(
    gqlIp(),
    {
      query: `
mutation($ids: [String!]!, $opts: ActorUpdateOpts!) {
  updateActors(ids: $ids, opts: $opts) {
    rating
  }
}
      `,
      variables: {
        ids: [actorId],
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

export async function favoriteActor(actorId: string, value: boolean): Promise<void> {
  await axios.post(
    gqlIp(),
    {
      query: `
mutation($ids: [String!]!, $opts: ActorUpdateOpts!) {
  updateActors(ids: $ids, opts: $opts) {
    favorite
  }
}
      `,
      variables: {
        ids: [actorId],
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

export async function bookmarkActor(actorId: string, value: Date | null): Promise<void> {
  await axios.post(
    gqlIp(),
    {
      query: `
mutation($ids: [String!]!, $opts: ActorUpdateOpts!) {
  updateActors(ids: $ids, opts: $opts) {
    bookmark
  }
}
      `,
      variables: {
        ids: [actorId],
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
