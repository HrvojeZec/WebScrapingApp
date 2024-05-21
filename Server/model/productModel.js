const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    price: {
      type: String,
      required: true,
    },
    oldPrice: {
      type: String,
      required: false,
    },
    images: {
      type: [String],
      required: true,
    },
    link: {
      type: String,
      required: true,
    },

    keyword: {
      type: String,
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
