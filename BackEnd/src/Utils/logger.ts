import { ConsoleHandler, getLogger, LogRecord, setup } from "log";

const isDevelopment = Deno.env.get("MODO") !== "PRODUCCION";

setup({
  handlers: {
    console: new ConsoleHandler("DEBUG", {
      formatter: (record: LogRecord) => {
        const timestamp = new Date().toISOString();
        const args = record.args.map(arg => 
          arg instanceof Error ? `${arg.message}\n${arg.stack}` : JSON.stringify(arg)
        ).join(" ");
        return `${record.levelName}         ${timestamp}        ${record.msg} ${args}`;
      },
    }),
  },
  loggers: {
    default: {
      level: isDevelopment ? "DEBUG" : "ERROR",
      handlers: ["console"],
    },
  },
});

export const logger = getLogger();
