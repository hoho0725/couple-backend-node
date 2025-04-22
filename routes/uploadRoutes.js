require('dotenv').config();
const express = require('express');
const router = express.Router();
const { S3Client, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// AWS S3 설정
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// ✅ Presigned URL 생성 API (프론트가 이 UR
router.get('/presigned-url', async (req, res) => {
  const { filename, filetype } = req.query;

  console.log('🟢 Presigned URL 요청 도착');
  console.log('📎 filename:', filename);
  console.log('📎 filetype:', filetype);

  if (!filename || !filetype) {
    console.warn('❗ filename 또는 filetype 누락');
    return res.status(400).json({ message: 'filename과 filetype은 필수입니다.' });
  }

  const key = `${Date.now()}-${encodeURIComponent(filename)}`;

  const command = new PutObjectCommand({
    Bucket: 'memories-box',
    Key: key,
    ContentType: filetype
  });

  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    console.log('✅ presigned URL 생성 성공');
    console.log('🔗 URL:', signedUrl);

    res.status(200).json({ url: signedUrl, key });
  } catch (err) {
    console.error('❌ presigned URL 생성 실패');
    console.error('📛 오류 메시지:', err.message);
    console.error('📂 전체 오류 객체:', JSON.stringify(err, null, 2)); // 구조화된 로그
    res.status(500).json({
      message: 'Presigned URL 생성 실패',
      error: err.message,
      detail: err
    });
  }
});

// 📄 S3 파일 목록 반환
router.get('/files', async (req, res) => {
  const params = {
    Bucket: 'memories-box',
  };

  try {
    const data = await s3.send(new ListObjectsV2Command(params));
    if (!data.Contents) {
      return res.status(200).json({ files: [] });
    }

    const result = data.Contents.map((file) => {
      const originalName = file.Key.split('-').slice(1).join('-');
      return {
        storedName: file.Key,
        originalName: originalName
      };
    });

    res.status(200).json({ files: result });
  } catch (err) {
    console.error('파일 목록을 가져오는 데 실패:', err);
    res.status(500).json({ message: '파일 목록을 가져오는 데 실패했습니다.', error: err });
  }
});

// 📥 S3 파일 다운로드
router.get('/download/:filename', async (req, res) => {
  const { filename } = req.params;

  const command = new GetObjectCommand({
    Bucket: 'memories-box',
    Key: filename,
  });

  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 유효시간 60초
    res.status(200).json({ url: signedUrl });
  } catch (err) {
    console.error('Presigned 다운로드 URL 생성 실패:', err);
    res.status(500).json({ message: '다운로드 URL 생성 실패', error: err });
  }
});

// ❌ S3 파일 삭제
router.delete('/:filename', async (req, res) => {
  const { filename } = req.params;
  const params = {
    Bucket: 'memories-box',
    Key: filename
  };

  try {
    const data = await s3.send(new DeleteObjectCommand(params));
    res.status(200).json({ message: '파일 삭제 성공' });
  } catch (err) {
    console.error('파일 삭제 실패:', err);
    res.status(500).json({ message: '파일 삭제 실패', error: err });
  }
});

module.exports = router;
