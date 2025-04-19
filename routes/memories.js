const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const { Types } = require('mongoose');

// [POST] 추억 글 작성
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

// [GET] 랜덤 추억 하나
router.get('/random', async (req, res) => {
  try {
    const [random] = await Memory.aggregate([{ $sample: { size: 1 } }]);
    res.json({ memory: random });
  } catch (err) {
    res.status(500).json({ message: '랜덤 추억 불러오기 실패', error: err });
  }
});

// [GET] 순차 추억 여러 개 (최신순 or 오래된 순)
// [GET] 순차 추억 여러 개 (최신순 or 오래된 순)
router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;

  try {
    const [memories, total] = await Promise.all([
      Memory.find().sort({ _id: -1 }).skip(skip).limit(limit),
      Memory.countDocuments() // 전체 개수도 함께 조회!
    ]);

    res.json({ memories, total }); // 프론트에서 total 사용 가능!
  } catch (err) {
    res.status(500).json({ message: '추억 불러오기 실패', error: err });
  }
});


// [PUT] 추억 수정
router.put('/:id', async (req, res) => {
  const memoryId = req.params.id;
  const { title, content } = req.body;

  try {
    const updated = await Memory.findByIdAndUpdate(
      memoryId,
      { title, content },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: '해당 추억을 찾을 수 없습니다.' });
    }
    res.json({ message: '수정 완료', memory: updated });
  } catch (err) {
    res.status(500).json({ message: '수정 실패', error: err });
  }
});

// [DELETE] 추억 삭제
router.delete('/:id', async (req, res) => {
  const memoryId = req.params.id;
  try {
    const deleted = await Memory.findByIdAndDelete(memoryId);
    if (!deleted) {
      return res.status(404).json({ message: '해당 추억을 찾을 수 없습니다.' });
    }
    res.json({ message: '삭제 완료', memory: deleted });
  } catch (err) {
    res.status(500).json({ message: '삭제 실패', error: err });
  }
});

module.exports = router;
