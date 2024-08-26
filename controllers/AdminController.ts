import { NextFunction, Request, Response } from 'express';
import { CreateVandorInput } from '../dto';
import { Vandor } from '../models';
import { GeneratePassword, GenerateSalt } from '../utility';

export const CreateVandor = async (req: Request, res: Response, next: NextFunction) => {
    const { name, address, pincode, foodType, email, password, ownerName, phone } = <CreateVandorInput>req.body;

    const existingVandor = await Vandor.findOne({ email: email });

    if (existingVandor !== null) {
        return res.json({ "message": "A vandor is exist with this email id"});
    }

    // Generate a salt

    const salt = await GenerateSalt();

    const userPassword = await GeneratePassword(password, salt);

    // Encrypt the password using the salt



    const createdVandor = await Vandor.create({
        name: name,
        address: address,
        pincode: pincode,
        foodType: foodType,
        email: email,
        password: userPassword,
        salt: salt,
        ownerName: ownerName,
        phone: phone,
        rating: 0,
        serviceAvailable: false,
        coverImages: [],
    });

    return res.json(createdVandor);
};

export const GetVandors = (req: Request, res: Response, next: NextFunction) => { };

export const GetVandorById = (req: Request, res: Response, next: NextFunction) => { };