import pino, { Logger } from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger: Logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  base: {
    env: process.env.NODE_ENV,
    app: 'stax-ai-tutor',
  },
});

export function childLogger(scope: string): Logger {
  return logger.child({ scope });
}

export default logger;
