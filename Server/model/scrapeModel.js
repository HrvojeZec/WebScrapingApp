const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const scrapeSchema = new Schema({
  keyword: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["initial", "started", "finished"],
    default: "initial",
  },
  startTime: { type: Date },
  endTime: { type: Date },
});

module.exports = mongoose.model("Scrape", scrapeSchema);
