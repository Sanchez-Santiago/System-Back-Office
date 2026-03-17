import winston from 'winston';

const isDevelopment = process.env.MODO !== "PRODUCCION";

export const logger = winston.createLogger({
  level: isDevelopment ? "debug" : "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
      return `${info.level.toUpperCase()}         ${info.timestamp}        ${info.message}`;
    })
  ),
  transports: [
    new winston.transports.Console()
  ],
});

