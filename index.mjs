import express from 'express';
import bodyParser from 'body-parser';
import panorama from './routes/panorama.mjs';
import fileUpload from 'express-fileupload';

const app = express();
app.use(bodyParser.json());



app.use(fileUpload({
	useTempFiles: true,
	tempFileDir: process.env.TMPDIR, 
	limits: { fileSize: 8 * 1024 * 1024 }
}));

app.use('/panorama', panorama);

export default app;
