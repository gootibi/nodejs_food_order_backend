import { NextFunction, Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateCustomerInputs, EditCustomerProfileInputs, UserLoginInputs } from '../dto';
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, onRequestOTP, ValidatePassword } from '../utility';
import { Customer } from '../models';

export const CustomerSignUp = async (req: Request, res: Response, next: NextFunction) => {

    const customerInput = plainToClass(CreateCustomerInputs, req.body);

    const inputErrors = await validate(customerInput, { validationError: { target: true } });

    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }

    const { email, phone, password } = customerInput;

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    const { otp, expiry } = GenerateOtp();

    const existCustomer = await Customer.findOne({
        email: email,
    });

    if (existCustomer !== null) {
        return res.status(400).json({ "message": "An user exist with the provided email id" });
    }

    const result = await Customer.create({
        email: email,
        password: userPassword,
        salt: salt,
        phone: phone,
        otp: otp,
        otp_expiry: expiry,
        firstName: '',
        lastName: '',
        address: '',
        verified: false,
        lat: 0,
        lng: 0
    });

    if (result) {

        // Send the OTP to the customer
        await onRequestOTP(otp, phone);

        // Generate the signature
        const signature = GenerateSignature({
            _id: String(result._id),
            email: result.email,
            verified: result.verified,
        })

        // Send the result to client
        return res.status(201).json({
            signature: signature,
            verified: result.verified,
            email: result.email
        });

    }

    return res.status(400).json({ "message": "Error with SignUp" });

};

export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {

    const loginInputs = plainToClass(UserLoginInputs, req.body);

    const loginErrors = await validate(loginInputs, { validationError: { target: true } });


    if (loginErrors.length > 0) {
        return res.status(400).json(loginErrors);
    }

    const { email, password } = loginInputs;

    const customer = await Customer.findOne({ email: email });

    if (customer) {
        const validation = await ValidatePassword(password, customer.password, customer.salt);

        if (validation) {
            // Generate the signature
            const signature = GenerateSignature({
                _id: String(customer._id),
                email: customer.email,
                verified: customer.verified,
            })

            // Send the result to client
            return res.status(201).json({
                signature: signature,
                verified: customer.verified,
                email: customer.email
            });
        }
    }

    return res.status(404).json({ "message": "Login error" });

};

export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {

    const { otp } = req.body;
    const customer = req.user;

    if (customer) {
        const profile = await Customer.findById(customer._id);

        if (profile) {

            if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {

                profile.verified = true;
                const updatedCustomerResponse = await profile.save();

                // Generate the signature
                const signature = GenerateSignature({
                    _id: String(updatedCustomerResponse._id),
                    email: updatedCustomerResponse.email,
                    verified: updatedCustomerResponse.verified
                });

                return res.status(200).json({
                    signature: signature,
                    verified: updatedCustomerResponse.verified,
                    email: updatedCustomerResponse.email
                });
            }

        }
    }

    return res.status(400).json({ "message": "Error with OTP Validation" });

};

export const RequestOtp = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user;

    if (customer) {
        const profile = await Customer.findById(customer._id);

        if (profile) {

            const { otp, expiry } = GenerateOtp();

            profile.otp = otp;
            profile.otp_expiry = expiry;

            await profile.save();
            await onRequestOTP(otp, profile.phone);

            return res.status(200).json({ "message": "OTP sent your registered phone number" });

        }
    }

    return res.status(400).json({ "message": "Error with Request OTP" });
};

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user;

    if (customer) {

        const profile = await Customer.findById(customer?._id);

        if (profile) {

            return res.status(200).json(profile);

        }
    }

    return res.status(404).json({ "message": "Error with Fetch Profile" });

};

export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);

    const profileErrors = await validate(profileInputs, { validationError: { target: true } });

    if (profileErrors.length > 0) {
        return res.status(400).json(profileErrors);
    }

    const { firstName, lastName, address } = profileInputs;

    if (customer) {
        const profile = await Customer.findById(customer._id);

        if (profile) {

            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;

            const result = await profile.save();

            return res.status(200).json(result);

        }
    }

    return res.status(400).json({ "message": "Error with Edit Customer Profile" });

};