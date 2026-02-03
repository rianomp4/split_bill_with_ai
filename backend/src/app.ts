import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import healthRouter from './routes/health';
import transactionsRouter from './routes/transactions';
import evidenceRouter from './routes/evidence';
import authRouter from './routes/auth';
import usersRouter from './routes/users';

const app = express();
app.use(cors());
app.use(json());

app.use('/api/health', healthRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api', evidenceRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

app.get('/', (req, res) => res.send('split-bill-backend'));

export default app;
