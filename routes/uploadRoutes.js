const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 파일 시스템 설정 (모든 파일 업로드 가능)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // 'uploads' 폴더에 파일 저장
  },
  filename: function (req, file, cb) {
    // 서버에 저장할 때, 파일 이름을 그대로 사용
    cb(null, Date.now() + '-' + file.originalname);  // 파일 이름에 날짜 추가
  }
});

// 파일 업로드 설정
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 * 1024 }
});

// 파일 업로드 API
router.post('/', upload.single('file'), (req, res) => {
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

    const result = files.map((storedName) => {
      const originalPart = storedName.split('-').slice(1).join('-'); // 날짜 부분 제거
      return {
        storedName,     // 실제 서버에 저장된 이름
        originalName: originalPart  // 클라이언트에 보여줄 이름 (디코딩 없이 그대로 사용)
      };
    });

    res.status(200).json({ files: result });
  });
});

// 파일 다운로드 API
router.get('/download/:filename', (req, res) => {
  const fileName = req.params.filename; // URL 디코딩 없이 파일 이름 사용
  const filePath = path.join(__dirname, '../uploads', fileName);
  res.download(filePath, fileName, (err) => {
    if (err) {
      return res.status(500).json({ message: '파일 다운로드 실패' });
    }
  });
});

// 파일 삭제 API
router.delete('/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('파일 삭제 실패:', err);
      return res.status(500).json({ message: '파일 삭제 실패' });
    }
    res.status(200).json({ message: '파일 삭제 성공' });
  });
});

module.exports = router;
