// routes/diaryRoutes.js
const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary'); // Diary 모델 불러오기

// [POST] 새로운 일기 작성 (기존 코드)
router.post('/', async (req, res) => {
  const { type, content } = req.body;
  try {
    const newDiary = new Diary({ type, content });
    await newDiary.save();
    res.status(201).json({ message: '일기 작성 완료!', diary: newDiary });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error });
  }
});

// [GET] 일기 조회 API : 작성된 일기를 모두 조회함 (최신 순으로 정렬)
router.get('/', async (req, res) => {
  try {
    // Diary 컬렉션에서 모든 일기를 조회하고, createdAt(작성일) 내림차순 정렬
    const diaries = await Diary.find().sort({ createdAt: -1 });
    res.json({ diaries });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error });
  }
});

module.exports = router;
