import { ApolloServer, BaseContext } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import { graphqlUploadExpress } from "graphql-upload";
import http from "http";

import { MovieDataSource } from "../graphql/datasources/MovieDataSource";
import { SceneDataSource } from "../graphql/datasources/SceneDataSource";
import schema from "../graphql/types";
import cors from "./cors";

export interface IzzyContext extends BaseContext {
  sceneDataSource: SceneDataSource;
  movieDataSource: MovieDataSource;
}

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
        // https://www.apollographql.com/docs/apollo-server/data/fetching-data/#batching-and-caching
        // https://levelup.gitconnected.com/solve-n-1-query-problem-in-graphql-with-dataloaders-18e16ac17b21
        sceneDataSource: new SceneDataSource(),
        movieDataSource: new MovieDataSource(),
      }),
    })
  );
}
