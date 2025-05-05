
// const express = require('express')// method-1
import express from "express"; // method-2
import dotenv from "dotenv"; 
import connectDB from "./config/database.js";
import userRoute from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";
import groupRoute from "./routes/groupRouter.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./socket/socket.js";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
dotenv.config({});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// middleware
app.use(express.urlencoded({extended:true}));
app.use(express.json()); 
app.use(cookieParser());

// Configure CORS
const corsOption = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition']
};
app.use(cors(corsOption)); 

// Serve static files from uploads directory with proper MIME types
app.use('/uploads', (req, res, next) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, path) => {
        // Set proper content type for images
        if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            res.set('Content-Type', 'image/jpeg');
        } else if (path.endsWith('.png')) {
            res.set('Content-Type', 'image/png');
        } else if (path.endsWith('.gif')) {
            res.set('Content-Type', 'image/gif');
        }
    }
}));

// routes
app.use("/api/v1/user", userRoute); 
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/group", groupRoute);

server.listen(PORT, () => {
    connectDB();
    console.log(`Server listening at port ${PORT}`);
});
