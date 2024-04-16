const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  keyword: {
    type: String,
    required: true,
  },
  storeName: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
