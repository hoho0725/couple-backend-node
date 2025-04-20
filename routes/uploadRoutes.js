// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 파일 시스템 설정 (모든 파일 업로드 가능)
// 운영 시에는 AWS S3와 같은 외부 스토리지를 사용하는 것이 좋습니다.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // 'uploads' 폴더에 파일 저장
  },
  filename: function (req, file, cb) {
    // 현재 시간과 원본 파일 이름을 합쳐서 저장 (예: 1681403200000-original.pdf)
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// 모든 파일 업로드를 허용하도록 multer 설정
const upload = multer({ storage: storage });

router.post('/', upload.single('file'), (req, res) => {
  // 업로드가 성공하면, 파일 정보는 req.file에 담김
  if (!req.file) {
    return res.status(400).json({ message: '파일 업로드 실패' });
  }
  res.status(200).json({ message: '파일 업로드 성공!', file: req.file });
});

// 파일 목록 반환 API
router.get('/files', (req, res) => {
  const directoryPath = path.join(__dirname, '../uploads');
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: '파일 목록을 가져오는 데 실패했습니다.' });
    }
    res.status(200).json({ files });
  });
});

// 파일 다운로드 API
router.get('/download/:filename', (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', fileName);
  res.download(filePath, fileName, (err) => {
    if (err) {
      return res.status(500).json({ message: '파일 다운로드 실패' });
    }
  });
});

module.exports = router;
