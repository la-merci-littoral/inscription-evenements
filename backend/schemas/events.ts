import { model, Model, Schema } from "mongoose";
import { IEvent } from "../types/event";
import BookingModel from "./bookings";

const EventSchema: Schema<IEvent> = new Schema({
    display_name: { type: String, required: true },
    date_start: { type: Date, required: true },
    date_end: { type: Date, required: true },
    location: { type: String, required: true },
    price_categories: [{
        type: { type: String, required: true },
        price: { type: Number, required: true },
        display: { type: String, required: true }
    }],
    order: { type: Number, required: true },
    limit: { type: Number, required: true },
    booking_open: { type: Date, required: true },
    booking_close: { type: Date, required: true },
});

const EventModel: Model<IEvent> = model("event", EventSchema, "evenement");
export default EventModel;