import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import financeRoutes from './routes/finance.js';
import mongoose from 'mongoose';


require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());

app.get('/', (req, res) => {
  res.send('Backend is working !');
});

app.use('/api/finance', financeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});