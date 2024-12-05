const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const Address = require("../../models/Address");
const RedisService = require("../../services/redis.service");
const redisClient = new RedisService();
const createOrder = async (req, res) => {
  const {
    userId,
    cartItems,
    addressId,
    orderStatus,
    paymentMethod,
    paymentStatus,
    totalAmount,
    orderDate,
  } = req.body;
  try {
    const cart = await Cart.findOne({ userId });
    const holderAddress = await Address.findOne({
      userId,
      _id: addressId,
    })
    if (!holderAddress) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong",
      });
    }
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }
    // check item in cart and product in database
    const isCartItemsValid = cart.items.every((item) => {
      return cartItems.some((cartItem) => cartItem.productId === item.productId?.toString());
    });
    if (!isCartItemsValid) {
      return res.status(400).json({
        success: false,
        message: "Cart items are not valid",
      })
    }

    // use primitive lock here to prevent
    // multiple order creation at the same time
    const checkProducts = []
    for (let item of cart.items) {
      const { productId, quantity } = item;
      const product = await Product.findById(productId);
      redisClient.set("stock" + productId, product.totalStock);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Product not found",
        });
      }
      const key = await redisClient.acquireLock({ productId, quantity });
      if (key) {
        await redisClient.releaseKey(key);
      }
      checkProducts.push(key ? true : false);
    }
    console.log("checkProducts", userId, checkProducts)
    if (checkProducts.includes(false)) {
      return res.status(400).json({
        success: false,
        message: "Some products are changed, please review again",
      });
    }

    const newlyCreatedOrder = await Order.create({
      userId,
      cartItems,
      addressId,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
    });
    if (!newlyCreatedOrder) {
      throw new Error("Order not created");
    }
    await Cart.findOneAndUpdate(
      { userId: userId }, { items: [] });
    res.status(201).json({
      success: true,
      orderId: newlyCreatedOrder._id,
      message: "Order created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }



};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for this product ${product.title}`,
        });
      }

      product.totalStock -= item.quantity;

      await product.save();
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
