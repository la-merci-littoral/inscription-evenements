import { Document, Schema } from "mongoose";

interface IBooking extends Document {
    _id: string;
    booking_id: string;
    member_id: Schema.Types.ObjectId;
    name: string;
    surname: string;
    email: string;
    phone: string;
    event_id: string;
    date: Date;
    payment: {
        hasPaid: boolean;
        date: Date;
        method: string;
        intentId: string;
    }
}