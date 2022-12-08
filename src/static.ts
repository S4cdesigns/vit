import express, { Application } from "express";

import { getConfig } from "./config";
import { logger } from "./utils/logger";

export function applyPublic(app: Application) {
  const config = getConfig();

  logger.debug("Applying public static routes");
  app.use("/previews", express.static(`${config.persistence.libraryPath}./library/previews`));
  app.use("/assets", express.static("./assets"));
  app.get("/flag/:code", (req, res) => {
    res.redirect(`/assets/flags/${req.params.code.toLowerCase()}.svg`);
  });
}
