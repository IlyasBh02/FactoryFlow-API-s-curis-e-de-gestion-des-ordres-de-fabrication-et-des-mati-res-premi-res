const mongoose = require('mongoose');
const { strictlyPositive } = require('../utils/validators');

const composantSchema = new mongoose.Schema(
  {
    produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true },
    matiere: { type: mongoose.Schema.Types.ObjectId, ref: 'MatierePremiere', required: true },
    quantite: {
      type: Number,
      required: [true, 'La quantité est obligatoire'],
      validate: strictlyPositive,
    },
  },
  { timestamps: true, toJSON: { versionKey: false } }
);

composantSchema.index({ produit: 1, matiere: 1 }, { unique: true });

module.exports = mongoose.model('Composant', composantSchema);