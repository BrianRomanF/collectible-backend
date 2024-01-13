// collectible.js
import mongoose from 'mongoose';

const subSubcategorySchema = new mongoose.Schema({
  CollectibleName: {
    type: String,
    required: true,
  },
  Issue: {
    type: Number,
    required: true,
  },
  Stock: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  info: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  imgType: {
    type: String, // Add this line for imgType
  },
  platform: {
    type: String,
    required: false,
  },
});

const subcategorySchema = new mongoose.Schema({
  subcategory: {
    type: String,
    required: true,
  },
  collectibles: [subSubcategorySchema],
});

const collectibleTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  typeImg: {
    type: String, // Add this line for typeImg
  },
  subcategories: [subcategorySchema],
});

const collectibleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  collectibleType: [collectibleTypeSchema],
});

const Collectible = mongoose.model('Collectible', collectibleSchema);

export default Collectible;
