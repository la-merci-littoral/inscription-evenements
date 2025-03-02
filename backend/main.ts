import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface RawRequest extends Request {
    rawBody?: string;
}
import Stripe from 'stripe';


import mongoose from 'mongoose';
import BookingModel from './schemas/bookings';
import EventModel from './schemas/events';
import MemberModel from './schemas/members';
import { IBooking } from './types/booking';
import { IEvent } from './types/event';


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
app.use('/', router);

const stripe = new Stripe(process.env.STRIPE_SK!);

mongoose.connect(process.env.MONGO_CONN_STR!)

async function generatePaymentIntent() {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(process.env.AMOUNT!),
        currency: 'eur'
    });
    return [paymentIntent.id, paymentIntent.client_secret!];
}

router.get("/events", async (req,res) => {
    // const dbEvents = await EventModel.find({date_start: {$gte: new Date()}}).sort({date_start: 1});
    const dbEvents = await EventModel.find({}).sort({ date_start: 1 });
    const events = dbEvents.map((dbEvent) => {
        return {
            ...dbEvent.toObject()
        }
    })
    res.send(events)
})

router.get("/member/:member_id", async (req, res) => {
    const member = await MemberModel.findOne({"member_id": req.params.member_id})
    if (member === null) {
        res.status(404).send("Not found");
    } else {
        res.send({
            name: member.name,
            surname: member.surname,
            email: member.email,
            phone: member.phone
        });
    }
})

router.put("/booking", async (req, res) => {
    var userData = req.body;

    const potentialFind = await BookingModel.findOne({
        $and: [
            { "email": userData.email },
            { "payment.hasPaid": true }
        ]
    })
    if (potentialFind !== null) {
        res.status(409).send("Already paid");
        return;
    }
    
    var paymentIntentSecret = userData.pi_secret
    var paymentIntentId = "";

    if (paymentIntentSecret === "") {
        console.log("Generating new payment intent");
        [paymentIntentId, paymentIntentSecret] = await generatePaymentIntent();
    } else {
        paymentIntentId = RegExp(/(.*)_secret_(.*)/gm).exec(paymentIntentSecret as string)![1]
        await stripe.paymentIntents.retrieve(paymentIntentId).then(async (paymentIntentObject) => {
            if (paymentIntentObject.status === "succeeded") {
                [paymentIntentId, paymentIntentSecret] = await generatePaymentIntent();
            }
        })
    }

    userData = {
        ...userData,
        date: new Date(),
        payment: {
            hasPaid: false,
            date: new Date(0),
            method: "none",
            intentId: paymentIntentId
        }
    }
    delete userData.pi_secret;

    await BookingModel.updateOne({
        $or: [
            { "email": userData.email },
            { "payment.intentId": paymentIntentId }
        ]
    }, userData, {upsert: true})

    res.send({
        clientSecret: paymentIntentSecret,
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
        await BookingModel.findOneAndUpdate({"payment.intentId": event.data.object.id}, {"payment.hasPaid" : true, "payment.date": new Date(), "payment.method": event.data.object.payment_method});
        console.log(event.data.object.id + " has been paid");
    }
    res.json({received: true});
});

router.get("/validate", async (req, res) => {
    const paymentIntent = req.query.pi;
    try {
        const doc = await BookingModel.findOne({"payment.intentId": paymentIntent});
        if (!doc) {
            res.status(404).send("Not found");
        } else {
            if (doc.payment.hasPaid) {
                res.status(200).send({
                    jwt: jwt.sign({booking_id: doc.booking_id}, process.env.JWT_SECRET!, {expiresIn: '1h'}),
                    booking_id: doc.booking_id
                });
            } else {
                res.status(503).send("Not yet")
            }
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

function generatePdfTicket(booking: IBooking, event: IEvent){
    
}

router.get("/ticket/:booking_id", async (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        res.status(401).send("Unauthorized");
        return;
    }
    jwt.verify(token.split(" ")[1], process.env.JWT_SECRET!, async (err, decoded) => {
        if (err || (decoded as any).booking_id !== req.params.booking_id) {
            res.status(403).send("Unauthorized");
            return;
        }
        const booking = await BookingModel.findOne({ booking_id: req.params.booking_id })
        if (!booking) {
            res.status(404).send("Not found");
            return;
        }
        const event = await EventModel.findOne({ event_id: booking.event_id });
        if (!event) {
            res.status(404).send("Not found");
            return;
        }
        generatePdfTicket(booking as IBooking, event as IEvent)
        res.send(booking.toJSON());
    })
}) 

app.listen(5175, () => { console.log("Backend is running on port 5175") });