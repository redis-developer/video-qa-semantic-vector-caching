import config from './config.js';
import { client } from './db.js';
import { LEVEL, MESSAGE, SPLAT } from 'triple-beam';
import winston from 'winston';
import Transport from 'winston-transport';

interface TransportInfo {
    service: string;
    location: string;
    level: string;
    message: string;
    [LEVEL]: string;
    [MESSAGE]: string;
    [SPLAT]: [any];
}

class RedisTransport extends Transport {
    log(info: TransportInfo, callback: () => void) {
        try {
            const level = info[LEVEL];
            let message = info.message;
            let meta = info[SPLAT][0] ?? {};
            const location = meta?.location ?? 'unknown';

            if (level.toLowerCase() === 'info') {
                return callback();
            }

            if (typeof message !== 'string') {
                message = JSON.stringify(message);
            }

            if (typeof meta !== 'string') {
                meta = JSON.stringify(meta);
            }

            // Don't await this so the app can keep moving.
            void client.xAdd(config.log.STREAM, '*', {
                service: config.app.FULL_NAME,
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
  level: config.log.LEVEL.toLowerCase(),
  format: winston.format.json(),
  defaultMeta: { service: config.app.FULL_NAME },
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
