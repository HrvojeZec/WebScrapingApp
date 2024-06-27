import mongoose from "mongoose";

const Schema = mongoose.Schema;

interface IScrape {
  keyword?: string;
  status?: string;
  startTime?: Date;
  endTime?: Date;
}


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

const Scrape = mongoose.model<IScrape>("Scrape", scrapeSchema);

export {Scrape, IScrape}