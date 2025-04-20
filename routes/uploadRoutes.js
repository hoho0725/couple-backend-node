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
    // 현재 시간과 원본 파일 이름을 합쳐서 저장 (예: 1681403200000-original.pdf)
    const encodedFileName = encodeURIComponent(file.originalname); // 파일 이름을 URL 인코딩
    cb(null, Date.now() + '-' + encodedFileName); // 날짜와 인코딩된 파일 이름을 합쳐서 저장
  }
});

// 모든 파일 업로드를 허용하도록 multer 설정
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB로 파일 크기 제한
});

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

    // 파일 이름에서 날짜 부분을 제거하고 순수 파일 이름만 추출
    const cleanFiles = files.map((file) => {
      const fileNameWithoutTimestamp = file.split('-').slice(1).join('-'); // 날짜 부분 제거
      return decodeURIComponent(fileNameWithoutTimestamp); // 디코딩 처리
    });

    res.status(200).json({ files: cleanFiles }); // 'decodedFiles' -> 'files'
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
  const { filename } = req.params; // URL 파라미터에서 파일 이름 받기
  const filePath = path.join(__dirname, '../uploads', decodeURIComponent(filename)); // URL 디코딩

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('파일 삭제 실패:', err);
      return res.status(500).json({ message: '파일 삭제 실패' });
    }
    res.status(200).json({ message: '파일 삭제 성공' });
  });
});

module.exports = router;
