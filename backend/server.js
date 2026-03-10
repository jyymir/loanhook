import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import financeRoutes from './routes/finance.js';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import ApplicantProfile from './models/ApplicantProfile.js';
import generateApplicant from './utils/generateApplicant.js';
import dashboardRoutes from './routes/dashboardRoutes.js'

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5001;

const createTestUser = async () => {
  const testEmail = "testuser@loanhook.app";
  let user = await User.findOne({ email: testEmail });

  if (!user){
    const hashedPassword = await bcrypt.hash("testpassword123", 10);
    user = await User.create({
      fullName: "Demo User",
      email: testEmail,
      password: hashedPassword
    });
    console.log("Demo account created: testuser@loanhook.app");
  }
  const existingProfile = await ApplicantProfile.findOne({ userId: user._id});
  
  if (!existingProfile) {
    const applicantData = generateApplicant(user.fullName);
    await ApplicantProfile.create({
      userId: user._id,
      ...applicantData
    });
    console.log("✅ Demo account profile created");
  }
};

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await createTestUser();
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Backend is working !');
});

app.use('/api/finance', financeRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

