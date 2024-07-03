import { createLogger, format, transports } from 'winston';

import { isProduction, isTest } from '../constants';

const loggerFromat = isProduction
  ? format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json(),
    )
  : format.combine(
      format.colorize(),
      format.errors({ stack: true }),
      format.simple(),
    );

const applicationLogger = createLogger({
  level: 'debug',
  silent: isTest,
  format: loggerFromat,
  transports: [new transports.Console()],
});

export default applicationLogger;
