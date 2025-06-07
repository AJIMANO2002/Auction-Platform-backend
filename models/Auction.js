import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    startingprice: { type: Number, required: true },
    currentBid: { type: Number, default: 0 },
    auctionType: {
      type: String,
      enum: ["traditional", "sealed", "reverse"],
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bid",
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    startTime: { type: Date, required: true },

    endTime: { type: Date, required: true },
  },
  { timestamps: true }
);

const Auction = mongoose.model("Auction", auctionSchema);

export default Auction;
