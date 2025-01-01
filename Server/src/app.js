import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { app, server } from "./utils/socket.js";
import dotenv from 'dotenv'
import connectDB from './db/index.js'
dotenv.config({
    path: './.env',
})

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded(({ limit: '10mb', extended: true })))
app.use(cookieParser())


import userRouter from "./routes/User.routes.js"
import messageRouter from "./routes/Message.routes.js"
app.use('/api/v1/user', userRouter)
app.use('/api/v1/message', messageRouter)

// connectDB()
// .then(()=>{
//     server.listen(process.env.PORT || 8000, ()=>{
//         console.log(`Server is running at Port http://localhost:${process.env.PORT}`);
//     })
// })
// .catch((error) =>{
//     console.error('Error occured while connecting database to app'+ error.message);
// })
server.listen(process.env.PORT, () => {
    console.log(`\nServer is running at Port http://localhost:${process.env.PORT}`);
    connectDB();
  });