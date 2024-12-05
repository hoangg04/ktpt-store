const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  cartItems: [
    {
      productId: String,
      title: String,
      image: String,
      price: String,
      quantity: Number,
    },
  ],
  addressId: mongoose.Schema.Types.ObjectId,
  orderStatus: String,
  paymentMethod: String,
  paymentStatus: String,
  totalAmount: Number,
  orderDate: Date,
});

module.exports = mongoose.model("Order", OrderSchema);
