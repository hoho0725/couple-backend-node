require('dotenv').config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');  // 필요한 AWS SDK 명령어 불러오기


// AWS S3 설정 (v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2', // 자신의 S3 버킷이 위치한 리전으로 설정
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Multer 메모리 스토리지 설정 (파일을 메모리에 저장)
const storage = multer.memoryStorage();
const upload = multer({ 
	storage: storage,

  limits: {
    fileSize: 10 * 1024 * 1024  // 10MB
  }
});

// 파일 업로드 API (S3에 파일 업로드)
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '파일 업로드 실패' });
  }

  const fileName = Date.now().toString() + '-' + req.file.originalname;
  const params = {
    Bucket: 'memories-box',  // S3 버킷 이름
    Key: fileName,           // S3에 저장될 파일 이름
    Body: req.file.buffer,   // 업로드할 파일 내용
    ContentType: req.file.mimetype  // 파일 MIME 타입 설정
  };

  try {
    // S3에 파일 업로드
    const data = await s3.send(new PutObjectCommand(params));
    res.status(200).json({ message: '파일 업로드 성공!', file: data });
  } catch (err) {
    console.error('파일 업로드 실패:', err);
    res.status(500).json({ message: '파일 업로드 실패', error: err });
  }
});

// 파일 목록 반환 API (S3에서 파일 목록 가져오기)
router.get('/files', async (req, res) => {
  const params = {
    Bucket: 'memories-box',  // S3 버킷 이름
  };

  try {
    // S3에서 파일 목록 가져오기
    const data = await s3.send(new ListObjectsV2Command(params));
    
    if (!data.Contents) {
      return res.status(200).json({ files: [] });  // 파일이 없다면 빈 배열 반환
    }

    const result = data.Contents.map((file) => {
      const originalName = file.Key.split('-').slice(1).join('-');  // 파일 이름에서 날짜 부분 제거
      return {
        storedName: file.Key,     // 실제 S3에 저장된 이름
        originalName: originalName  // 클라이언트에 보여줄 이름
      };
    });

    res.status(200).json({ files: result });
  } catch (err) {
    console.error('파일 목록을 가져오는 데 실패:', err);
    res.status(500).json({ message: '파일 목록을 가져오는 데 실패했습니다.', error: err });
  }
});

// 파일 다운로드 API (S3에서 파일 다운로드)
router.get('/download/:filename', async (req, res) => {
  const fileName = req.params.filename;
  const params = {
    Bucket: 'memories-box',  // S3 버킷 이름
    Key: fileName  // 파일 키
  };

  try {
    // S3에서 파일 다운로드
    const data = await s3.send(new GetObjectCommand(params));
    res.attachment(fileName);  // 다운로드할 파일 이름 설정
    data.Body.pipe(res);  // 파일 내용을 스트리밍하여 클라이언트로 전송
  } catch (err) {
    console.error('파일 다운로드 실패:', err);
    res.status(500).json({ message: '파일 다운로드 실패', error: err });
  }
});

// 파일 삭제 API (S3에서 파일 삭제)
router.delete('/:filename', async (req, res) => {
  const { filename } = req.params;
  const params = {
    Bucket: 'memories-box',  // S3 버킷 이름
    Key: filename  // 삭제할 파일 키
  };

  try {
    // S3에서 파일 삭제
    const data = await s3.send(new DeleteObjectCommand(params));
    res.status(200).json({ message: '파일 삭제 성공' });
  } catch (err) {
    console.error('파일 삭제 실패:', err);
    res.status(500).json({ message: '파일 삭제 실패', error: err });
  }
});

module.exports = router;
