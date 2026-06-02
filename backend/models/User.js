const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  action: String, // e.g., "clicked_link", "reported_phishing"
  is_phishing: Boolean,
  timestamp: { type: Date, default: Date.now },
  details: String
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  risk_score: { type: Number, default: 0 },
  phishing_attempts: { type: Number, default: 0 },
  failed_attempts: { type: Number, default: 0 },
  interactions: [interactionSchema]
});

// Helper to determine risk category
userSchema.virtual('risk_category').get(function() {
  if (this.risk_score <= 30) return 'Low Risk';
  if (this.risk_score <= 70) return 'Medium Risk';
  return 'High Risk';
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
