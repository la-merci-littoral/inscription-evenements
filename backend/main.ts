import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import ejs from 'ejs';

interface RawRequest extends Request {
    rawBody?: string;
}
import Stripe from 'stripe';

import mongoose from 'mongoose';
import BookingModel from './schemas/bookings';
import EventModel from './schemas/events';
import MemberModel from './schemas/members';

import { Template } from '@pdfme/common';
import { text, barcodes, rectangle, line } from '@pdfme/schemas';
import { generate } from '@pdfme/generator';
import { IBooking } from './types/booking';

const envPath = process.env.NODE_ENV === 'production' ? '../.env.production' : '../.env.development';
require('dotenv').config({path: envPath});

const mailTransport = nodemailer.createTransport({
    pool: true,
    host: process.env.EMAIL_HOST!,
    port: parseInt(process.env.EMAIL_PORT!),
    auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!
    },
    connectionTimeout: 3000,
});

const emailTemplates: { [key: string]: string } = {};

fs.readdirSync(path.resolve('./emails')).forEach(file => {
    if (fs.statSync(path.resolve('./emails', file)).isDirectory()) {
        return;
    }
    const templateName = file.replace('.ejs', '');
    const templateContent = fs.readFileSync(`./emails/${file}`, 'utf-8');
    emailTemplates[templateName] = templateContent;
});

const ticketTemplate: Template = JSON.parse(fs.readFileSync(path.resolve('./ticket.json'), 'utf-8'));
const pdfPlugins = {
    text,
    qrcode: barcodes.qrcode,
    rectangle,
    line
}

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

async function generatePaymentIntent(amount: number) {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'eur'
    });
    return [paymentIntent.id, paymentIntent.client_secret!];
}

router.get("/events", async (req,res) => {
    // const dbEvents = await EventModel.find({date_start: {$gte: new Date()}}).sort({date_start: 1});
    const dbEvents = await EventModel.find({});
    const events = dbEvents.map((dbEvent) => {
        return {
            ...dbEvent.toObject()
        }
    })
    await Promise.all(events.map(async (event) => {
        event.bookings_left = event.limit - await BookingModel.countDocuments({"event_id": event._id, "payment.hasPaid": true}) as number;
    }));
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
    console.log(userData)

    if (userData.selectedEvent === undefined) {
        res.status(400).send("No event selected");
        return;
    }

    var searchCond: Array<{ booking_id?: any; email?: string }> = [{ "booking_id": userData.booking_id }];
    if (userData.email !== ''){
        searchCond.push({ "email": userData.email })
    }

    const potentialFind = await BookingModel.findOne({
        $and: [
            {
                $or: searchCond
            },
            { "payment.hasPaid": true }
        ]
    })
    if (potentialFind !== null) {
        res.status(409).send("Already paid");
        return;
    }

    const event = await EventModel.findById(userData.selectedEvent.id);
    if (event === null) {
        res.status(404).send("Event not found");
        return;
    }

    if (event.limit - await BookingModel.countDocuments({"event_id": event._id, "payment.hasPaid": true}) <= 0) {
        res.status(409).send("No more tickets available");
        return;
    }

    var minPrice = 0;
    for (const cat of event.price_categories) {
        let shouldMin: boolean;
        switch (cat.type) {
            case "member":
                shouldMin = (userData.member_id != 0) && (await MemberModel.findOne({ "member_id": userData.member_id }) !== null);
                break;
            case "minor":
                shouldMin = (userData.birth != "") && (new Date(userData.birth).getTime() < new Date().getTime() - 18 * 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                shouldMin = false;
                break;
        }
        if ((shouldMin && cat.price < minPrice) || minPrice === 0) {
            minPrice = cat.price;
        }
    }
    
    var paymentIntentSecret = userData.pi_secret
    var paymentIntentId = "";
    const price = minPrice

    if (price > 0){
        if (paymentIntentSecret === "") {
            // console.log("Generating new payment intent");
            [paymentIntentId, paymentIntentSecret] = await generatePaymentIntent(price*100);
        } else {
            paymentIntentId = RegExp(/(.*)_secret_(.*)/gm).exec(paymentIntentSecret as string)![1]
            await stripe.paymentIntents.retrieve(paymentIntentId).then(async (paymentIntentObject) => {
                if (paymentIntentObject.status === "succeeded") {
                    [paymentIntentId, paymentIntentSecret] = await generatePaymentIntent(price*100);
                }
            })
        }
    } else {
        paymentIntentId = "none";
    }

    userData = {
        ...userData,
        event_id: userData.selectedEvent.id,
        date: new Date(),
        payment: {
            hasPaid: false,
            date: new Date(0),
            method: "none",
            intentId: paymentIntentId,
            price: price
        }
    }
    delete userData.pi_secret;

    const doc = await BookingModel.findOneAndUpdate({
        $or: searchCond
    }, userData, {upsert: true, new: true});

    res.send({
        clientSecret: paymentIntentSecret,
        amount: price,
        booking_id: doc.booking_id
    })

});

async function generateTicket(doc: IBooking) {
    const event = await EventModel.findById(doc.event_id)
    const fullname = doc.name + " " + doc.surname;

    const pdf = await generate({
        template: ticketTemplate,
        plugins: pdfPlugins,
        inputs: [{
            ticketQR: doc.booking_id,
            ticketNumber: doc.booking_id,
            eventName: event!.display_name,
            eventDate: event!.date_start.toLocaleString("fr-FR", { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
            eventLocation: event!.location,
            personName: fullname == " " ? "Non renseigné" : fullname,
            personCategory: event!.price_categories.find((cat) => cat.price == doc.payment.price)!.display,
            price: String(doc.payment.price) + " €",
            accompanying: String(doc.attendants - 1)
        }]
    })

    return Buffer.from(pdf)
}

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
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const updateResult = await BookingModel.findOneAndUpdate(
            { "adhesion.payment.intentId": paymentIntent.id },
            {
                $set: {
                    "adhesion.payment.hasPaid": true,
                    "adhesion.payment.date": new Date(),
                    "adhesion.payment.method": paymentIntent.payment_method
                }
            },
            { new: true } // Return the updated document
        );

        if (!updateResult) {
            res.status(404).send("Not found");
            return;
        }

        (updateResult as any).base_url = process.env.BASE_URL;
        mailTransport.sendMail({
            from: 'La Merci Ne pas Répondre ne-pas-repondre@amis-du-littoral.fr',
            to: updateResult.email,
            subject: "La Merci Littoral - Confirmation d'inscription",
            html: ejs.render(emailTemplates['inscription-confirm'], updateResult),
            attachments: [
                {
                    filename: "Ticket " + updateResult.booking_id + " - " + updateResult.surname + ".pdf",
                    content: await generateTicket(updateResult)
                }
            ]
        });
    }

    res.json({received: true});
});

router.post("/payment/null", async (req, res) => {
    await BookingModel.findOneAndUpdate({"booking_id": req.body.booking_id}, {"payment.hasPaid" : true, "payment.date": new Date(), "payment.method": 'none'});
    res.json({received: true});
})

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

router.get("/ticket/:booking_id", async (req, res) => {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send("Authorization header missing");
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
        res.status(403).send("Invalid or expired token");
        return;
    }

    const doc = await BookingModel.findOne({booking_id: req.params.booking_id})

    if (doc === null) {
        res.status(404).send("Not found");
        return
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.send(await generateTicket(doc));
})

app.listen(5175, () => { console.log("Backend is running on port 5175") });