import "./types";
import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import chalk from "chalk";
import * as DBController from "./db/mongoose";
import Util from "./utils/util";
import morgan from "./utils/morgan";

const app = express();

app.use(cors());
app.use(morgan.successHandler);
app.use(morgan.errorHandler);
app.use(
  express.urlencoded({
    extended: false,
    limit: "10mb",
    parameterLimit: 5000,
  }),
);
app.use(express.json({ limit: "10mb" }));

const routesPath = path.join(__dirname, "routes");
fs.readdirSync(routesPath).forEach((file) => {
  if (path.extname(file) === ".js") {
    const mod = require(path.join(routesPath, file));
    app.use(mod.default ?? mod);
  }
});

app.get("/", (_req, res) => {
  res.sendStatus(200);
});

DBController.initConnection(() => {
  const httpServer = require("http").createServer(app);
  httpServer.listen(process.env.PORT, () => {
    console.log(
      chalk.cyan.italic.underline(`Server running on ${Util.getBaseURL()}`),
    );
  });
});
