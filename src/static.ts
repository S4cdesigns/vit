import express, { Application } from "express";

import { logger } from "./utils/logger";

export function applyPublic(app: Application) {
  logger.debug("Applying public static routes");
  app.use("/previews", express.static("./library/previews"));
  app.use("/assets", express.static("./assets"));
  app.get("/flag/:code", (req, res) => {
    res.redirect(`/assets/flags/${req.params.code.toLowerCase()}.svg`);
  });
}
