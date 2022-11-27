import Axios from "axios";

import { gqlIp } from "./ip";

export async function graphqlQuery<T>(
  query: string,
  variables: Record<string, unknown>,
  headers?: Record<string, string>
): Promise<T> {
  const { data: body } = await Axios.post<{
    data: T;
    errors: { message: string }[];
  }>(
    gqlIp(),
    { query, variables },
    {
      headers: {
        "x-pass": "xxx",
        ...headers,
      },
    }
  );

  if (body.errors?.length) {
    console.error(body.errors);
    throw new Error(body.errors[0].message);
  }

  return body.data;
}
