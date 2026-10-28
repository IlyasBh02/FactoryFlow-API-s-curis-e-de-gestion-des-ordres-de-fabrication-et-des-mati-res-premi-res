const mongoose = require('mongoose');

const installationStateSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'installation', unique: true, immutable: true },
    installed: { type: Boolean, default: true },
    installedAt: { type: Date, default: Date.now },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { toJSON: { versionKey: false } }
);

module.exports = mongoose.model('InstallationState', installationStateSchema);