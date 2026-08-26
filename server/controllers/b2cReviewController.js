const Review = require('../models/WebsiteReview');

exports.getReviews = async (req, res) => {
  try {
    const { productId, page = 1, limit = 50 } = req.query;
    const query = {};
    if (productId) query.productId = productId;

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate({ path: 'productId', model: 'WebsiteProduct', select: 'productName image' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Moderation: remove an inappropriate/spam review.
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
