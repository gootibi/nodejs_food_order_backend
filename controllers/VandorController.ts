import { NextFunction, Request, Response } from 'express';
import { CreateFoodInput, EditVandorInput, VandorLoginInputs } from '../dto';
import { Food } from '../models';
import { GenerateSignature, ValidatePassword } from '../utility';
import { FindVandor } from './AdminController';

export const VandorLogin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = <VandorLoginInputs>req.body;

    const existingVandor = await FindVandor('', email);

    if (existingVandor !== null) {

        // Validation and give access
        const validation = await ValidatePassword(password, existingVandor.password, existingVandor.salt);

        if (validation) {

            const signature = GenerateSignature({
                _id: existingVandor.id,
                email: existingVandor.email,
                foodType: existingVandor.foodType,
                name: existingVandor.name,
            });

            return res.json(signature);
        } else {
            return res.json({ "messsage": "Password is not valid" });
        }

    }

    return res.json({ "messsage": "Login credential not valid" });

};

export const GetVandorProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user) {
        const existingVandor = await FindVandor(user._id);

        return res.json(existingVandor);
    }

    return res.json({ "messsage": "Vandor information not found" });
};

export const UpdateVandorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const { name, address, phone, foodType } = <EditVandorInput>req.body;

    const user = req.user;

    if (user) {
        const existingVandor = await FindVandor(user._id);

        if (existingVandor !== null) {

            existingVandor.name = name;
            existingVandor.address = address;
            existingVandor.foodType = foodType;
            existingVandor.phone = phone;

            const saveResult = await existingVandor.save();
            return res.json(saveResult);

        }

        return res.json(existingVandor);
    }

    return res.json({ "messsage": "Vandor information not found" });
};

export const UpdateVandorCoverImage = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user) {


        const vandor = await FindVandor(user._id);

        if (vandor !== null) {

            const files = req.files as [Express.Multer.File];

            const images = files.map((file: Express.Multer.File) => file.filename);

            vandor.coverImages.push(...images);

            const result = await vandor.save();

            return res.json(result);
        }

    }

    return res.json({ "messsage": "Shomething went wrong with add food" });
    
};

export const UpdateVandorService = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {
        const existingVandor = await FindVandor(user._id);

        if (existingVandor !== null) {
            existingVandor.serviceAvailable = !existingVandor.serviceAvailable;
            const saveResult = await existingVandor.save();

            return res.json(saveResult);
        }

        return res.json(existingVandor);
    }

    return res.json({ "messsage": "Vandor information not found" });
};

export const AddFood = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {

        const { name, description, category, foodType, price, readyTime } = <CreateFoodInput>req.body;

        const vandor = await FindVandor(user._id);

        if (vandor !== null) {

            const files = req.files as [Express.Multer.File];

            const images = files.map((file: Express.Multer.File) => file.filename);

            const createFood = await Food.create({
                vandorId: vandor._id,
                name: name,
                description: description,
                category: category,
                foodType: foodType,
                images: images,
                readyTime: readyTime,
                price: price,
                rating: 0,
            });

            vandor.foods.push(createFood);

            const result = await vandor.save();

            return res.json(result);
        }

    }

    return res.json({ "messsage": "Shomething went wrong with add food" });

};

export const GetFoods = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {
        const foods = await Food.find({ vandorId: user._id });

        if (foods !== null) {
            return res.json(foods);
        }
    }

    return res.json({ "messsage": "Foods information not found" });
};