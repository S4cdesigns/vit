import express, { Application } from "express";

import { getConfig } from "./config";
import { logger } from "./utils/logger";

export function applyPublic(app: Application) {
  const config = getConfig();

  const previewPath = `${config.persistence.libraryPath}/library/previews`;
  logger.info(`Applying public static routes, preview path is ${previewPath}`);
  app.use("/previews", express.static(previewPath));
  app.use("/assets", express.static("./assets"));
  app.get("/flag/:code", (req, res) => {
    res.redirect(`/assets/flags/${req.params.code.toLowerCase()}.svg`);
  });
}
