import express, { Router } from 'express';
import { CustomerLogin, CustomerSignUp, CustomerVerify, EditCustomerProfile, GetCustomerProfile, RequestOtp } from '../controllers';
import { Authenticate } from '../middlewares';
const router: Router = express.Router();

/** -------------------- Signup / Create Customer -------------------- **/
router.post('/signup', CustomerSignUp);

/** -------------------- Login -------------------- **/
router.post('/login', CustomerLogin);


// Get authentication
router.use(Authenticate);

/** -------------------- Verify Customer Account -------------------- **/
router.patch('/verify', CustomerVerify);

/** -------------------- OTP / Requesting OTP -------------------- **/
router.get('/otp', RequestOtp);

/** -------------------- Profile -------------------- **/
router.get('/profile', GetCustomerProfile);

router.patch('/profile', EditCustomerProfile);

// Cart section

// Order section

// Payment section

export { router as CustomerRoute };
