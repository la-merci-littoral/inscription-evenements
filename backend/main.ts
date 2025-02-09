import express from 'express';
import Stripe from 'stripe';
import mongoose from 'mongoose';


const envPath = process.env.NODE_ENV === 'production' ? '../.env.production' : '../.env.development';
require('dotenv').config({path: envPath});

const app = express();
const router = express.Router();
router.use(express.json());
app.use('/api', router);

const stripe = new Stripe(process.env.STRIPE_SK!);

const mongo = mongoose.createConnection(process.env.MONGO_URI!, {
    user: process.env.MONGO_USER!,
    pass: process.env.MONGO_PWD!,
    sanitizeFilter: true,
    authSource: 'admin',
});





router.get("/payment/intent", async (req, res) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(process.env.AMOUNT!),
        currency: 'eur'
    });

    res.send({
        clientSecret: paymentIntent.client_secret
    })
});

router.put("/user", async (req, res) => {
    const userData = req.body;
    res.send(userData);
});

router.post("/payment/webhook", async (req, res) => {});

router.get("/test", (req, res) => {
    res.send("Test route");
});







app.listen(5174, () => { console.log("Backend is running on port 5174") });