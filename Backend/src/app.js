import express from 'express';
import cors from 'cors';
import adminRoutes from './routes/adminRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
const app = express();
app.use(cors());
app.use(express.json());

app.use('/admin', adminRoutes);
app.use('/partner', partnerRoutes);


export default app;