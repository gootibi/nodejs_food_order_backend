import express from 'express';
import { AdminRoute, VandorRoute } from './routes';
import mongoose from 'mongoose';
import { MONGO_URL } from './config';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/admin', AdminRoute);
app.use('/vandor', VandorRoute);

mongoose.connect(MONGO_URL).then(result => {
    console.log('DB connection established')
}).catch(err => console.log('error', err));

app.listen(8000, () => {
    console.log(`Server listening on the port: 8000`)
});