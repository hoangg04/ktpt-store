const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const { seedDatabase } = require("./helpers/initData");
const commonFeatureRouter = require("./routes/common/feature-routes");

//create a database connection -> u can also
//create a separate file for this and then import/use that file here
mongoose.set("debug", true);
mongoose
  .connect("mongodb://localhost:27017/ktpt")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));
// require("./helpers/init.redis");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "https://b2e1-116-96-110-215.ngrok-free.app",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.get("/", (req, res) => {
  console.log("TIME:::" , Date.now());
  res.send("Hello World");
});
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/common/feature", commonFeatureRouter);
seedDatabase();


app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
