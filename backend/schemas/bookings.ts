import { Schema, model } from "mongoose";
import { IBooking } from "../types/booking";
import { customAlphabet, nanoid } from "nanoid";

const BookingSchema: Schema<IBooking> = new Schema({
    _id: { type: String, required: true },
    booking_id: { type: String, required: true, default: () => customAlphabet("1234567890", 6)() },
    member_id: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    event_id: { type: String, required: true},
    date: { type: Date, required: true },
    payment: {
        hasPaid: { type: Boolean, required: true },
        date: { type: Date, required: true },
        method: { type: String, required: true },
        intentId: { type: String, required: true }
    }
})

const BookingModel = model<IBooking>("booking", BookingSchema, "inscription");
export default BookingModel;