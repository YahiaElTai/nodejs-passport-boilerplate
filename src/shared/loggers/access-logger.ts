import { createLogger, format, transports } from 'winston';

import { isProduction, isTest } from '../constants';

const loggerFromat = isProduction
  ? format.combine(
      format.timestamp({
        format: 'YYYY-MM-DDTHH:mm:ssZ',
      }),
      format.json(),
    )
  : format.combine(
      format.colorize(),
      format.printf(({ message }) => message),
    );

const accessLogger = createLogger({
  level: 'debug',
  silent: isTest,
  format: loggerFromat,
  transports: [new transports.Console()],
});

export default accessLogger;
