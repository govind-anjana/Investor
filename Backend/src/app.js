import express from 'express';
import cors from 'cors';
import adminRoutes from './routes/adminRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import investorRoutes from './routes/investorRoutes.js';
const app = express();
app.use(cors());
app.use(express.json());

app.use('/admin', adminRoutes);
app.use('/partner', partnerRoutes);
app.use("/investor", investorRoutes); // Added route for investor


export default app;