const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary'); // Diary 모델 불러오기

// [POST] 새로운 일기 작성
router.post('/', async (req, res) => {
	const { type, content, createdAt } = req.body;
	try {
		// 요청에 createdAt이 있으면 그대로 쓰고, 없으면 기본값 사용
		const payload = { type, content };
		if (createdAt) payload.createdAt = new Date(createdAt);
		
		const newDiary = new Diary(payload);
		await newDiary.save();
		res.status(201).json({ diary: newDiary });
	} catch (error) {
		res.status(500).json({ message: '서버 오류', error });
	}
});


// [GET] 일기 조회 (모든 일기를 최신순으로 정렬)
router.get('/', async (req, res) => {
  try {
    const diaries = await Diary.find().sort({ createdAt: -1 });
    res.json({ diaries });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error });
  }
});

// [PUT] 일기 수정 : URL 예) /diaries/:id
router.put('/:id', async (req, res) => {
  const diaryId = req.params.id;
  const { type, content } = req.body;
  try {
    const updatedDiary = await Diary.findByIdAndUpdate(
      diaryId,
      { type, content },
      { new: true }
    );
    if (!updatedDiary) {
      return res.status(404).json({ message: '해당 일기를 찾을 수 없습니다.' });
    }
    res.json({ message: '일기 수정 완료!', diary: updatedDiary });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error });
  }
});

// [DELETE] 일기 삭제 : URL 예) /diaries/:id
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
