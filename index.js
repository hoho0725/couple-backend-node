// index.js

// 1. 필수 모듈들을 최상단에 require
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// index.js 최상단 모듈 불러오기 부분에 추가:
const helmet = require('helmet');



// 2. 라우터들 불러오기
const diaryRoutes = require('./routes/diaryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const memoryRoutes = require('./routes/memories');

// 3. Express 앱과 HTTP 서버, Socket.IO 설정
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // 모든 출처 허용 (테스트 단계에서는 이렇게 설정, 보안상 나중에 특정 도메인으로 제한 권장)
    methods: ["GET", "POST"]
  }
});

// 4. Middleware 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. 기본 라우트 (예: 테스트용 /hello)
app.get('/hello', (req, res) => {
  res.send('Hello from Couple Node.js Server!');
});

// 6. API 라우터 등록
app.use('/diaries', diaryRoutes);
app.use('/upload', uploadRoutes);
app.use('/memories', memoryRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 7. Socket.IO 설정 (실시간 채팅)
io.on('connection', (socket) => {
  console.log('새 클라이언트가 연결됨:', socket.id);

  // 채팅 메시지 이벤트 처리
  socket.on('chat message', (msg) => {
    console.log('메시지:', msg);
    io.emit('chat message', msg);  // 모든 클라이언트에게 메시지 전송
  });

  socket.on('disconnect', () => {
    console.log('클라이언트 연결 종료:', socket.id);
  });
});

// 8. MongoDB 연결 설정 (연결 성공 후 서버 시작)
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://chs3112a:chs040201!@cluster0.niznsxw.mongodb.net/couple_db?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB에 연결 성공!');

    // 9. DB 연결 후 서버 실행 (포트 3000 또는 환경변수 PORT 사용)
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`서버가 ${PORT}번 포트에서 실행 중...`);
    });
  })
  .catch((err) => {
    console.error('MongoDB 연결 오류:', err);
  });

const axios = require('axios');

// RequestBin URL
const requestBinUrl = 'https://eoue6ir2z9uhjxr.m.pipedream.net';

// 예시로 서버가 실행될 때마다 RequestBin에 GET 요청을 보내는 코드
axios.get(requestBinUrl)
  .then(response => {
    console.log('RequestBin 응답:', response.data);
  })
  .catch(error => {
    console.error('RequestBin 요청 실패:', error);
  });