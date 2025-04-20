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
    const encodedFileName = encodeURIComponent(file.originalname);
    cb(null, Date.now() + '-' + encodedFileName);
  }
});

// 모든 파일 업로드를 허용하도록 multer 설정
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
      const originalPart = storedName.split('-').slice(1).join('-'); // 시간 제거
      const decoded = decodeURIComponent(originalPart);
      return {
        storedName,     // 실제 서버에 저장된 이름
        originalName: decoded  // 클라이언트에 보여줄 이름
      };
    });

    res.status(200).json({ files: result });
  });
});

// 파일 다운로드 API
router.get('/download/:filename', (req, res) => {
  const fileName = decodeURIComponent(req.params.filename); // URL 디코딩
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
  const filePath = path.join(__dirname, '../uploads', decodeURIComponent(filename));

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('파일 삭제 실패:', err);
      return res.status(500).json({ message: '파일 삭제 실패' });
    }
    res.status(200).json({ message: '파일 삭제 성공' });
  });
});

module.exports = router;
