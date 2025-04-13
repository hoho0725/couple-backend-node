// models/Diary.js
const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['남자', '여자', '데이트후기-남자', '데이트후기-여자'] },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Diary', diarySchema);
