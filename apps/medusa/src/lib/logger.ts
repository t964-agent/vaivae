import type pinoType from "pino";
import type { Logger, LoggerOptions } from "pino";

const pino = require("pino") as typeof pinoType;

const redactPaths = [
  "email",
  "*.email",
  "phone",
  "*.phone",
  "address",
  "address.*",
  "*.address",
  "*.address.*",
  "payment",
  "payment.*",
  "*.payment",
  "*.payment.*",
  "card",
  "card.*",
  "*.card",
  "*.card.*",
];

const loggerOptions: LoggerOptions = {
  level: process.env["LOG_LEVEL"] ?? "info",
  redact: {
    paths: redactPaths,
    censor: "[redacted]",
  },
};

if (process.env["NODE_ENV"] !== "production") {
  loggerOptions.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname",
      translateTime: "SYS:standard",
    },
  };
}

const logger = pino(loggerOptions);

function child(scope: string): Logger {
  return logger.child({ scope });
}

module.exports = { child, logger };
