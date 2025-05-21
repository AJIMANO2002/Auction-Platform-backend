const sellerMiddleware = (req, res, next) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: "Access denied. Only sellers can perform this action." });
  }
  next();
};

export default sellerMiddleware;
