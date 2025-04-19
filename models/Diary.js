const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['호성', '진서', '데이트후기-호성', '데이트후기-진서']
  },
  title: { type: String }, // ✅ 제목 추가
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Diary', diarySchema);
