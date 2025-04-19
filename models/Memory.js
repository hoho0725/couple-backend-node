// models/Memory.js
const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true, enum: ['호성', '진서'] },
  content: { type: String, required: true }
});

module.exports = mongoose.model('Memory', memorySchema);
