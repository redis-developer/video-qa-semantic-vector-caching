import config from './config.js';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import router from './router.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan(config.env.DEV ? 'dev' : 'combined'));
app.use('/api', router);
app.use((req: express.Request, res: express.Response) => {
  res.sendStatus(404);
});
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (res.headersSent) {
      return;
    }

    let status: number = (err as any).status;

    if (typeof status === "undefined") {
      status = (err as any).statusCode;
    }

    if (typeof status === "undefined") {
      status = 500;
    }

    res.status(status);

    res.json({
      error: {
        message: err.message,
        stack: config.env.DEV ? err.stack : undefined,
      },
    });
  },
);

export default app;
