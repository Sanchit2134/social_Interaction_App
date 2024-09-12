import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import userRoute from './routes/userRoute.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

app.use("/api/v1/user", userRoute);  

app.get("/", (_, res) => {
  return res.status(200).json({
    message: "Hello, World!",
    success: true,
  });
});

app.listen(port, () => {
  connectDB();
  console.log(`Server started on port ${port}`);
})