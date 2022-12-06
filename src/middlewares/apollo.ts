import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import { graphqlUploadExpress } from "graphql-upload";
import http from "http";

import schema from "../graphql/types";
import cors from "./cors";

/* const apolloLogger: ApolloServerPlugin = {
  requestDidStart(_requestContext): GraphQLRequestListener {
    return {
      didEncounterErrors(requestContext) {
        logger.error(`Error in graphql api: ${formatMessage(requestContext.errors)}`);
      },
    };
  },
}; */

export async function mountApolloServer(app: express.Application): Promise<void> {
  /*   const server = new ApolloServer({
    schema,
    context: ({ req }) => ({
      req,
    }),
    debug: true,
    introspection: true,
    uploads: false,
    playground: !!process.env.PV_QL_PLAYGROUND,
    plugins: [apolloLogger],
  });
  app.use(graphqlUploadExpress());
  server.applyMiddleware({ app, path: "/api/ql" }); */

  const httpServer = http.createServer(app);

  const getTokenForRequest = (req) => {
    return Promise.resolve("lol");
  };

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true,
  });
  await server.start();

  app.use(
    "/api/ql",
    graphqlUploadExpress(),
    cors,
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => ({
        token: await getTokenForRequest(req),
      }),
    })
  );
}
