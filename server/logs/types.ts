export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  label: string;
  message: string;
  data?: unknown;
};

export type LogsResponse = {
  logs: LogEntry[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
