const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false;

export const logger = {
  log: (...args: unknown[]) => { if (isDev) console.log(...args); },
  warn: (...args: unknown[]) => { if (isDev) console.warn(...args); },
  error: (...args: unknown[]) => console.error(...args),
};
