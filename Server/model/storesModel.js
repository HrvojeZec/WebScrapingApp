const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const storesSchema = new Schema({
  logo: {
    type: String,
    required: true,
  },
  storeName: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Stores", storesSchema);
