import { graphqlQuery } from "../gql";

export async function rateMarker(markerId: string, rating: number): Promise<void> {
  const mutation = `
  mutation($ids: [String!]!, $opts: MarkerUpdateOpts!) {
    updateMarkers(ids: $ids, opts: $opts) {
      rating
    }
  }`;
  await graphqlQuery(mutation, {
    ids: [markerId],
    opts: {
      rating,
    },
  });
}

export async function favoriteMarker(markerId: string, value: boolean): Promise<void> {
  const mutation = `
  mutation($ids: [String!]!, $opts: MarkerUpdateOpts!) {
    updateMarkers(ids: $ids, opts: $opts) {
      favorite
    }
  }`;
  await graphqlQuery(mutation, {
    ids: [markerId],
    opts: {
      favorite: value,
    },
  });
}

export async function bookmarkMarker(markerId: string, value: Date | null): Promise<void> {
  const mutation = `
  mutation($ids: [String!]!, $opts: MarkerUpdateOpts!) {
    updateMarkers(ids: $ids, opts: $opts) {
      bookmark
    }
  }`;
  await graphqlQuery(mutation, {
    ids: [markerId],
    opts: {
      bookmark: value && value.valueOf(),
    },
  });
}
