import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import chatRoute from './routes/chat.route.js';
import { connectDb } from './lib/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app=express();
const PORT=process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',authRoute);
app.use('/api/users',userRoute);
app.use('/api/chat',chatRoute);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../frontend/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../../frontend', 'dist', 'index.html'));
    });
}

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDb();
});
