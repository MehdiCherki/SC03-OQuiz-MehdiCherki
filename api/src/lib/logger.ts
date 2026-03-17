import { createLogger, format, transports } from "winston";
import { config } from "../../config.ts";
import process from "node:process";

export const logger = createLogger({
  level: config.logLevel || "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        service: "oquiz",
        pid: process.pid,
        ...meta,
      });
    }),
  ),
  transports: [
    // journal des erreurs
    new transports.File({
      filename: "combined.log",
      maxsize: 5242880, // 5 Mo
      maxFiles: 10,
      tailable: true,
    }),
    // tous les logs combinés
    new transports.File({
      filename: "error.log",
      level: "error",
      maxsize: 5242880, // 5 Mo
      maxFiles: 10,
      tailable: true,
    }),
    new transports.Http({
      host: config.logServiceHost,
      port: config.logServicePort,
      path: "/api/logs",
      level: "http",
    }),
  ],
  // Gérer les exceptions non capturées
  exceptionHandlers: [new transports.File({ filename: "exceptions.log" })],
  // Gérer les rejets de promesses
  rejectionHandlers: [new transports.File({ filename: "rejections.log" })],
});

// Ajouter la console en développement
if (process.env.NODE_ENV === "development") {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple(),
        format.printf(({ timestamp, level, message, stack, ...meta }) => {
          const metaString = Object.keys(meta).length
            ? JSON.stringify(meta, null, 2)
            : "";
          const stackString = stack ? `\n${stack}` : "";
          return `${timestamp} [${level}]: ${message}${stackString}${metaString ? `\n${metaString}` : ""}`;
        }),
      ),
    }),
  );
}
