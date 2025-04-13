// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer  = require('multer');

// 로컬 저장용 파일 시스템 설정 (테스트용)
// 운영 시에는 AWS S3 같은 외부 스토리지 사용 권장
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // 'uploads' 폴더에 파일 저장
  },
  filename: function (req, file, cb) {
    // 현재 시간과 원본 파일 이름을 합쳐서 저장 (예: 1681403200000-original.jpg)
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// 단일 파일 업로드 엔드포인트 (폼 필드 이름은 "image")
router.post('/', upload.single('image'), (req, res) => {
  // 업로드가 성공하면, 파일 정보는 req.file에 담김
  if (!req.file) {
    return res.status(400).json({ message: '파일 업로드 실패' });
  }
  res.status(200).json({ message: '파일 업로드 성공!', file: req.file });
});

module.exports = router;
