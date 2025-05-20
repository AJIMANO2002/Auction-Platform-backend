import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import Auction from '../models/Auction.js';

const router = express.Router();

// ✅ Create new auction (Protected)
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, image, startingprice, auctionType, endTime } = req.body;
  const sellerId = req.user.userId;

  try {
    const auction = new Auction({
      title,
      description,
      image,
      startingprice,
      currentBid: startingprice,
      auctionType,
      endTime,
      seller: sellerId,
    });

    await auction.save();
    res.status(201).json({ message: "Auction created", auction });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Get all auctions (Public)
router.get('/', async (req, res) => {
  try {
    const auctions = await Auction.find().populate("seller", "name email");
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Get seller's own auctions (Protected) ✅ KEEP THIS ABOVE /:id
router.get('/my-auctions', authMiddleware, async (req, res) => {
  try {
    const auctions = await Auction.find({ seller: req.user.userId }).sort({ createdAt: -1 });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Get auction by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate("seller", "name email");
    if (!auction) return res.status(404).json({ message: "Auction not found" });
    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Edit auction (Protected)
router.put('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const auction = await Auction.findOne({ _id: req.params.id, seller: req.user.userId });

    if (!auction) return res.status(404).json({ message: "Auction not found or unauthorized" });

    const { title, description, image, startingprice, auctionType, endTime, status } = req.body;

    auction.title = title || auction.title;
    auction.description = description || auction.description;
    auction.image = image || auction.image;
    auction.startingprice = startingprice || auction.startingprice;
    auction.auctionType = auctionType || auction.auctionType;
    auction.endTime = endTime || auction.endTime;
    auction.status = status || auction.status;

    await auction.save();
    res.json({ message: "Auction updated", auction });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Delete auction (Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const auction = await Auction.findOneAndDelete({ _id: req.params.id, seller: req.user.userId });
    if (!auction) return res.status(404).json({ message: "Auction not found or unauthorized" });

    res.json({ message: "Auction deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
