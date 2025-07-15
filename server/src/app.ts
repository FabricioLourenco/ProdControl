import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

import express from 'express';
import { errorHandler } from './middlewares/error.middleware';
import productRoutes from './routes/product.routes';
import testRoutes from './routes/test.routes';

if (process.env.NODE_ENV === 'test' && process.env.DATABASE_URL !== 'file:./dev-test.db')
    throw new Error('Using non test database in a test environment!');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/products', productRoutes);

if (process.env.NODE_ENV === 'test')
    app.use('/test', testRoutes);

app.use(errorHandler);

export default app;