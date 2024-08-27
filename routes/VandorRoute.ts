import express, { NextFunction, Request, Response } from 'express';
import { AddFood, GetFoods, GetVandorProfile, UpdateVandorCoverImage, UpdateVandorProfile, UpdateVandorService, VandorLogin } from '../controllers';
import { Authenticate } from '../middlewares';
import multer from 'multer';

const router = express.Router();

const imageStore = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, 'images')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, "-") + "_" + file.originalname)
    },

})

const images = multer({ storage: imageStore }).array('images', 10);

router.post('/login', VandorLogin);

router.use(Authenticate);
router.get('/profile', GetVandorProfile);
router.patch('/profile', UpdateVandorProfile);
router.patch('/coverimage', images, UpdateVandorCoverImage);
router.patch('/service', UpdateVandorService);

router.post('/food', images, AddFood);
router.get('/foods', GetFoods);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: 'Hello from Vandor' });
});

export { router as VandorRoute };
