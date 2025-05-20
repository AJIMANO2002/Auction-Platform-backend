import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'seller'], default: 'user' },
    auctions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Auction" }], 
    bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }]
},
    { timestamps: true });


   
const User = mongoose.model('User', userSchema);
export default User;