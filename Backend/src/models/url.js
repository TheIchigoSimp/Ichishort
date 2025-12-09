import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    target: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type:Date },
    clicks: { type: Number, default: 0 }
});

const Url = mongoose.model("Url", urlSchema);

export default Url;