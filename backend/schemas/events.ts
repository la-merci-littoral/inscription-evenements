import { model, Model, Schema } from "mongoose";
import { IEvent } from "../types/event";

const EventSchema: Schema<IEvent> = new Schema({
    _id: { type: String, required: true },
    display_name: { type: String, required: true },
    prices: {
        member: { type: Number, required: true },
        non_member: { type: Number, required: true }
    }
})

const EventModel: Model<IEvent> = model("event", EventSchema, "evenement");
export default EventModel;