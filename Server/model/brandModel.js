const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const brandSchema = new Schema({
  logo: {
    type: String,
    required: true,
  },
  brandName: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Brand", brandSchema);
