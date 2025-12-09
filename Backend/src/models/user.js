import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now}
});

const User = mongoose.model("User", UserSchema);

export default User;