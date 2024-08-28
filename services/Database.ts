import mongoose from 'mongoose';
import { MONGO_URL } from '../config';

export default async () => {

    try {
        await mongoose.connect(MONGO_URL);
        console.clear();
        console.log('DB connected...');
    } catch (ex) {
        console.log(ex);
    }

};




