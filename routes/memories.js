// routes/memories.js
const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');

// POST: 추억 글 작성
router.post('/', async (req, res) => {
  const { title, author, content } = req.body;
  try {
    const memory = new Memory({ title, author, content });
    await memory.save();
    res.status(201).json({ memory });
  } catch (err) {
    res.status(500).json({ message: '추억 저장 실패', error: err });
  }
});

// GET: 랜덤 추억 10개
router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  try {
    const memories = await Memory.aggregate([{ $sample: { size: limit } }]);
    res.json({ memories });
  } catch (err) {
    res.status(500).json({ message: '추억 불러오기 실패', error: err });
  }
});

module.exports = router;
