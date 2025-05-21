import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import Auction from '../models/Auction.js';
import Bid from '../models/bid.js';
import User from '../models/User.js';

const router = express.Router();


router.post("/:auctionId", authMiddleware, async (req, res) => {
  const { auctionId } = req.params;
  const { amount } = req.body;
  const userId = req.user.userId;


  try {
    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    if (auction.status !== "active") {
      return res.status(400).json({ message: "Auction is not active" });
    }

    if (amount <= auction.currentBid) {
      return res.status(400).json({ message: "Bid must be higher than current bid" });
    }

    const newBid = new Bid({ auction: auctionId, bidder: userId, amount });
    await newBid.save();


    auction.currentBid = amount;
    auction.bids.push(newBid._id);
    await auction.save();


    await User.findByIdAndUpdate(userId, { $push: { bids: newBid._id } });

    res.status(201).json({ message: "Bid placed successfully", bid: newBid });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }

});


router.get("/:auctionId", async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId }).populate("bidder", "name email");
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/user/history", authMiddleware, async (req, res) => {
  try {
    const userBids = await Bid.find({ bidder: req.user.userId }).populate("auction", "title");
    res.json(userBids);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
