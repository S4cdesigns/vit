import express, { Application } from "express";
import path from "path";

import { getConfig } from "./config";
import { logger } from "./utils/logger";

export function applyPublic(app: Application) {
  const config = getConfig();

  const previewPath = path.resolve(config.persistence.libraryPath, "library/previes");
  logger.info(`Applying public static routes, preview path is ${previewPath}`);
  app.use("/previews", express.static(previewPath));
  app.use("/assets", express.static("./assets"));
  app.get("/flag/:code", (req, res) => {
    res.redirect(`/assets/flags/${req.params.code.toLowerCase()}.svg`);
  });
}
