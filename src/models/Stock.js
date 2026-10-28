const mongoose = require('mongoose');
const { MOVEMENT_TYPE } = require('../utils/constants');
const { strictlyPositive } = require('../utils/validators');

const mouvementSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: { values: Object.values(MOVEMENT_TYPE), message: 'Type de mouvement invalide' },
      required: [true, 'Le type est obligatoire'],
    },
    quantite: {
      type: Number,
      required: [true, 'La quantité est obligatoire'],
      validate: strictlyPositive,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: function () {
        return this.type === MOVEMENT_TYPE.EXIT;
      },
    },
    createdAt: { type: Date, default: Date.now, immutable: true },
  },
  { _id: false }
);

const stockSchema = new mongoose.Schema(
  {
    // unique : un seul stock par matière
    matiere: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MatierePremiere',
      required: true,
      unique: true,
    },
    // quantité actuellement disponible
    quantite: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'La quantité en stock ne peut pas être négative'],
    },
    mouvements: { type: [mouvementSchema], default: [] },
  },
  { timestamps: true, toJSON: { versionKey: false } }
);

module.exports = mongoose.model('Stock', stockSchema);
