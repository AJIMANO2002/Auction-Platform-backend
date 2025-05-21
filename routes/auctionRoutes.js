import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import sellerMiddleware from '../middleware/SellerMiddleware.js';
import Auction from '../models/Auction.js';

const router = express.Router();

router.post('/', authMiddleware, sellerMiddleware, async (req, res) => {
  try {
    const { title, description, image, startingprice, auctionType, endTime } = req.body;

    const auction = new Auction({
      title,
      description,
      image,
      startingprice,
      currentBid: startingprice,
      auctionType,
      endTime,
      seller: req.user.userId,
    });

    await auction.save();
    res.status(201).json({ message: 'Auction created successfully', auction });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const auctions = await Auction.find().populate('seller', 'name email');
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/my-auctions', authMiddleware, sellerMiddleware, async (req, res) => {
  try {
    const auctions = await Auction.find({ seller: req.user.userId }).sort({ createdAt: -1 });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate('seller', 'name email');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', authMiddleware, sellerMiddleware, async (req, res) => {
  try {
    const auction = await Auction.findOne({ _id: req.params.id, seller: req.user.userId });
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found or unauthorized' });
    }

    const { title, description, image, startingprice, auctionType, endTime, status } = req.body;

    auction.title = title || auction.title;
    auction.description = description || auction.description;
    auction.image = image || auction.image;
    auction.startingprice = startingprice || auction.startingprice;
    auction.auctionType = auctionType || auction.auctionType;
    auction.endTime = endTime || auction.endTime;
    auction.status = status || auction.status;

    await auction.save();
    res.json({ message: 'Auction updated successfully', auction });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.delete('/:id', authMiddleware, sellerMiddleware, async (req, res) => {
  try {
    const auction = await Auction.findOneAndDelete({ _id: req.params.id, seller: req.user.userId });
    if (!auction) return res.status(404).json({ message: 'Auction not found or unauthorized' });
    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
