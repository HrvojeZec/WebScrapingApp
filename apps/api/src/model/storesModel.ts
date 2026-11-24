import mongoose from "mongoose";

const Schema = mongoose.Schema;

interface IStore {
  logo?: string;
  storeName?: string;
}

const storesSchema = new Schema({
  logo: {
    type: String,
    required: false,
  },
  storeName: {
    type: String,
    required: true,
  },
});

const Stores =  mongoose.model<IStore>("Stores", storesSchema);

export{Stores, IStore}