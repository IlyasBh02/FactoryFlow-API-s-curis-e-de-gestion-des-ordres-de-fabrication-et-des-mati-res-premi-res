const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: [true, 'La référence est obligatoire'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
    },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true, toJSON: { versionKey: false } }
);

module.exports = mongoose.model('Produit', produitSchema);