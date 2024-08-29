// Email

// Notifications

// OTP
export const GenerateOtp = () => {
    /**
     *  We are generating six digits OTP number on line number 14 
     * and
     * We are simply adding 30 minutes extra to expiry date object on line number 16 and
     * finally returning an object with otp and expiry {otp, expiry}
     *  **/

    const otp = Math.floor(100000 + Math.random() * 900000);
    let expiry = new Date();
    expiry.setTime(new Date().getTime() + (30 * 60 * 1000));

    return { otp, expiry };

};

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {
    /** 
     * npm i twilio
     * **/

    const accountSid = 'AC170a6533aa4a5c9b493472c19ec5993c';
    const authToken = '6e0bed1f8904aab3c64fac4d6f9f1e7d';
    const messagingServiceSid = 'MGd58e825c8ee20dd7c20a46f47092e3e8'
    const client = require('twilio')(accountSid, authToken);

    const response = await client.messages
        .create({
            body: `Your OTP is: ${otp}`,
            messagingServiceSid: messagingServiceSid,
            to: `+36${toPhoneNumber}`,
        })

    return response

};

// Payment notification or email