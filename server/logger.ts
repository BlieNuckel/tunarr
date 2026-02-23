type LogLevel = "debug" | "info" | "warn" | "error";

interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: "DEBUG",
  info: "INFO",
  warn: "WARN",
  error: "ERROR",
};

function formatData(data: unknown): string {
  if (data instanceof Error) {
    return data.stack || `${data.name}: ${data.message}`;
  }
  return JSON.stringify(data, null, 2);
}

function formatMessage(
  level: LogLevel,
  label: string,
  message: string
): string {
  const timestamp = new Date().toISOString();
  return `${timestamp} [${LEVEL_LABELS[level]}] [${label}] ${message}`;
}

export function createLogger(label: string): Logger {
  return {
    debug(_message: string, _data?: unknown) {
      // no-op by default
    },

    info(message: string, data?: unknown) {
      const line = formatMessage("info", label, message);
      if (data !== undefined) {
        console.log(line, "\n" + formatData(data));
      } else {
        console.log(line);
      }
    },

    warn(message: string, data?: unknown) {
      const line = formatMessage("warn", label, message);
      if (data !== undefined) {
        console.warn(line, "\n" + formatData(data));
      } else {
        console.warn(line);
      }
    },

    error(message: string, data?: unknown) {
      const line = formatMessage("error", label, message);
      if (data !== undefined) {
        console.error(line, "\n" + formatData(data));
      } else {
        console.error(line);
      }
    },
  };
}
