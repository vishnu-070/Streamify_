import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import chatRoute from './routes/chat.route.js';
import { connectDb } from './lib/db.js';



dotenv.config();

const app=express();
const PORT=process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',authRoute);
app.use('/api/users',userRoute);
app.use('/api/chat',chatRoute);





app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
    connectDb();
});
