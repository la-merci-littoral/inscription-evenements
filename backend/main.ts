import express, { Request, Response } from 'express';

interface RawRequest extends Request {
    rawBody?: string;
}
import Stripe from 'stripe';
import mongoose from 'mongoose';
import AdhesionModel from './schemas/adhesion';


const envPath = process.env.NODE_ENV === 'production' ? '../.env.production' : '../.env.development';
require('dotenv').config({path: envPath});

const app = express(); 
const router = express.Router();     
router.use(express.json({
    verify: (req: Request, res: Response, buf: Buffer) => {
        if (req.path.includes("/payment/webhook")) {
            (req as RawRequest).rawBody = buf.toString();
        }
    }
}));
app.use('/api', router);

const stripe = new Stripe(process.env.STRIPE_SK!);

mongoose.connect(process.env.MONGO_CONN_STR!)



router.put("/person", async (req, res) => {
    const userData = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(process.env.AMOUNT!),
        currency: 'eur'
    });

    userData.adhesion = {
        date: new Date(),
        payment: {
            hasPaid: false,
            date: new Date(0),
            method: "none",
            intentId: paymentIntent.id
        }
    }
    await AdhesionModel.updateOne({email: userData.email}, userData, {upsert: true})
    res.send({
        clientSecret: paymentIntent.client_secret
    })

    
});

router.post("/payment/webhook", express.raw({type: 'application/json'}),async (req, res) => {

    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent((req as RawRequest).rawBody!, sig!, process.env.STRIPE_WBH_SECRET!);
    } catch (err: any | Error) {
        console.error(err.message)
        res.status(400).send(`Webhook Error: ${err.message}`);
        return
    }
    event = req.body as Stripe.Event;
    if (event.type == 'payment_intent.succeeded') {
        await AdhesionModel.findOneAndUpdate({"adhesion.payment.intentId": event.data.object.id}, {"adhesion.payment.hasPaid" : true, "adhesion.payment.date": new Date(), "adhesion.payment.method": event.data.object.payment_method});
    }
    res.json({received: true});
});

app.listen(5174, () => { console.log("Backend is running on port 5174") });