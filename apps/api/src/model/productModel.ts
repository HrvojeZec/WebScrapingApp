import mongoose from "mongoose";

const Schema = mongoose.Schema;

interface IProduct {
  keyword?: string;
  title?: string;
  description?: string;
  price?: string;
  oldPrice?: string;
  images?: string[];
  link?: string;
  storeId?: string;
  scrapeId?: string;
  productId?: string;
  _id?: string;
}

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
    scrapeId: {
      type: Schema.Types.ObjectId,
      ref: "Scrape",
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model<IProduct>("Product", productSchema);

export {Product, IProduct}