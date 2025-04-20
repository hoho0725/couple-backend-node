const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');

// [POST] 새로운 일기 작성
router.post('/', async (req, res) => {
	console.log("aaa");
  const { type, title, content, createdAt } = req.body;

  try {
    const payload = { type, title, content };
    if (createdAt) {
      const parsed = new Date(createdAt);
      if (!isNaN(parsed)) {
        payload.createdAt = parsed;
      }
    }

    const newDiary = new Diary(payload);
    await newDiary.save();
    res.status(201).json({ diary: newDiary });
  } catch (error) {
    console.error('Error saving diary:', error.message);
    res.status(500).json({ message: '서버 오류', error });
  }
});

// [GET] 일기 전체 조회
router.get('/', async (req, res) => {
  try {
    const diaries = await Diary.find().sort({ createdAt: -1 });
    res.json({ diaries });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error });
  }
});

// [PUT] 일기 수정
router.put('/:id', async (req, res) => {
  const diaryId = req.params.id;
  const { title, content } = req.body;

  try {
    const updatedDiary = await Diary.findByIdAndUpdate(
      diaryId,
      { title, content },
      { new: true }
    );
    if (!updatedDiary) {
      return res.status(404).json({ message: '해당 일기를 찾을 수 없습니다.' });
    }
    res.json({ message: '일기 수정 완료!', diary: updatedDiary });
  } catch (error) {
    console.error('Error updating diary:', error.message);
    res.status(500).json({ message: '서버 오류', error });
  }
});

// [DELETE] 일기 삭제
router.delete('/:id', async (req, res) => {
  const diaryId = req.params.id;
  try {
    const deletedDiary = await Diary.findByIdAndDelete(diaryId);
    if (!deletedDiary) {
      return res.status(404).json({ message: '해당 일기를 찾을 수 없습니다.' });
    }
    res.json({ message: '일기 삭제 완료!', diary: deletedDiary });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error });
  }
});

module.exports = router;
