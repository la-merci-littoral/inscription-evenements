import mongoose, { Schema } from "mongoose";
import Stripe from 'stripe'

interface IPerson extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    surname: string;
    email: string;
    phone: string;
    address: string;
    zip: string;
    city: string;
    country: string;
    initDate: Date;
    adhesion: {
        initDate: Date;
        payment: {
            hasPaid: boolean;
            date: Date;
            method: string;
            intentId: string;
        }
    }
}

export default IPerson