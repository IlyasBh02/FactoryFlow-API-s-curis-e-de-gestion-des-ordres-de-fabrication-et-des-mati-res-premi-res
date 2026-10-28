const mongoose = require('mongoose');

const matierePremiereSchema = new mongoose.Schema(
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
    unite: {
      type: String,
      required: [true, "L'unité de mesure est obligatoire"],
      trim: true,
    },
    seuilAlerte: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Le seuil d'alerte ne peut pas être négatif"],
    },
  },
  {
    timestamps: true,
    id: false,
    collection: 'matieres_premieres',
    toJSON: { virtuals: true, versionKey: false },
  }
);

// Le stock (une seule ligne par matière) est lu depuis la collection stocks
matierePremiereSchema.virtual('stock', {
  ref: 'Stock',
  localField: '_id',
  foreignField: 'matiere',
  justOne: true,
});

module.exports = mongoose.model('MatierePremiere', matierePremiereSchema);
