import config from './config';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';


const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan(config.DEV ? 'dev' : 'combined'));


export default app;
