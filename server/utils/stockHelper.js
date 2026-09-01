const WebsiteProduct = require("../models/Products");

// ============================================
// STOCK HELPER
// direction = -1  => deduct stock (quotation converted from invoice)
// direction =  1  => restore stock (converted quotation deleted)
// ============================================
const adjustProductStock = async (items = [], direction = -1) => {
  for (const it of items) {
    const productId = it.itemId || it._id;

    if (!productId) continue;

    const qty = Math.abs(Number(it.qty || 0));

    if (!qty) continue;

    try {
      const product = await WebsiteProduct.findById(productId);

      if (!product) continue;

      const currentStock = Number(product.stock || 0);

      let newStock = currentStock + direction * qty;

      if (newStock < 0) newStock = 0;

      product.stock = newStock;

      await product.save();
    } catch (stockErr) {
      console.log("STOCK ADJUST ERROR =>", stockErr.message);
    }
  }
};

module.exports = { adjustProductStock };
