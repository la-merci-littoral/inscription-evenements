import mongoose, { mongo, Schema, Model } from "mongoose";
import IMember from "../types/member";
import { customAlphabet } from "nanoid";

const MemberSchema: Schema<IMember> = new Schema({
    member_id: { type: String, required: true, default: customAlphabet("1234567890", 6)() },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    zip: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    adhesion: {
        date: { type: Date, required: true },
        payment: {
            hasPaid: { type: Boolean, required: true },
            date: { type: Date, required: true },
            method: { type: String, required: true },
            intentId: { type: String, required: true }
        }
    }
});

const AdhesionModel: Model<IMember> = mongoose.model("adhesion", MemberSchema, "adhesion");

export default AdhesionModel;
