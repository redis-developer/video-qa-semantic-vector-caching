import config from './config.js';
import { client } from './db.js';
import { LEVEL, MESSAGE, SPLAT } from 'triple-beam';
import winston from 'winston';
import Transport from 'winston-transport';

class RedisTransport extends Transport {
    async log(info: any, callback: () => void) {
        try {
            const level = info[LEVEL];
            let message = info[MESSAGE];
            let meta = info[SPLAT]?.[0] ?? {};

            if (level.toLowerCase() === 'info') {
                return callback();
            }

            if (typeof message !== 'string') {
                message = JSON.stringify(message);
            }

            if (typeof meta !== 'string') {
                meta = JSON.stringify(meta);
            }

            const location = meta.location ?? 'unknown';

            await client.xAdd(config.log.STREAM, '*', {
                service: `${config.app.NAME}@${config.app.VERSION}`,
                level,
                location,
                message,
                meta
            });
        } catch (e) {}

        callback();
    }
}

const logger = winston.createLogger({
  level: config.log.LEVEL,
  format: winston.format.json(),
  defaultMeta: { service: `${config.app.NAME}@${config.app.VERSION}` },
  transports: [
    new RedisTransport(),
  ],
});

if (config.env.PROD) {
  logger.add(
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  );
  logger.add(new winston.transports.File({ filename: 'combined.log' }));
}

if (config.env.DEV) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

export default logger;
