import 'dotenv/config';
import express from 'express';
import panorama from './routes/panorama.mjs';
import fileUpload from 'express-fileupload';


export function initServer(app) { 
    app.use(express.json());

    app.use(fileUpload({
        useTempFiles: true,
        tempFileDir: process.env.TMPDIR, 
        limits: { fileSize: process.env.MAX_FILE_SIZE * 1024 * 1024 }
    }));

    app.use('/panorama', panorama);
};
