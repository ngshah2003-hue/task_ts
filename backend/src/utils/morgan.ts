import morgan from "morgan";
import chalk from "chalk";
import logger from "./logger";
import type { Request, Response } from "express";

const isDev = process.env.NODE_ENV !== "production";

morgan.token("message", (_req: Request, res: Response) => (res.locals as { errorMessage?: Error }).errorMessage?.message ?? "");

morgan.token("real-ip", (req: Request) =>
  (req.ip ?? (req.connection as { remoteAddress?: string })?.remoteAddress ?? "").replace(/^::ffff:/, ""),
);

const getIpFormat = (): string => ":real-ip - ";

const formatWithColor = (
  tokens: morgan.TokenIndexer<Request, Response>,
  req: Request,
  res: Response,
): string => {
  const status = tokens.status(req, res);
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const responseTime = tokens["response-time"](req, res);
  const ip = tokens["real-ip"](req, res);
  const message = tokens.message(req, res);

  let statusColor = chalk.green;
  if (Number(status) >= 500) statusColor = chalk.red;
  else if (Number(status) >= 400) statusColor = chalk.yellow;
  else if (Number(status) >= 300) statusColor = chalk.cyan;

  return [
    chalk.gray(ip),
    chalk.blue(String(method).padEnd(6)),
    url,
    statusColor(String(status)),
    "-",
    chalk.magenta(`${responseTime} ms`),
    message ? chalk.red(`\n⛔ ${message}`) : "",
  ].join(" ");
};

const successHandler = isDev
  ? morgan(formatWithColor, {
      skip: (_req, res) => res.statusCode >= 400,
      stream: { write: (message: string) => logger.info(message.trim()) },
    })
  : morgan(`${getIpFormat()}:method :url :status - :response-time ms`, {
      skip: (_req, res) => res.statusCode >= 400,
      stream: { write: (message: string) => logger.info(message.trim()) },
    });

const errorHandler = isDev
  ? morgan(formatWithColor, {
      skip: (_req, res) => res.statusCode < 400,
      stream: { write: (message: string) => logger.error(message.trim()) },
    })
  : morgan(`${getIpFormat()}:method :url :status - :response-time ms - message: :message`, {
      skip: (_req, res) => res.statusCode < 400,
      stream: { write: (message: string) => logger.error(message.trim()) },
    });

export default {
  successHandler,
  errorHandler,
};
