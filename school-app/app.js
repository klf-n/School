const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// NEIS API 기본 URL
const NEIS_BASE_URL = 'https://open.neis.go.kr/hub';

// 학교 검색 API
app.get('/api/schools', async (req, res) => {
  try {
    const { schoolName } = req.query;
    const response = await axios.get(`${NEIS_BASE_URL}/schoolInfo`, {
      params: {
        KEY: process.env.NEIS_API_KEY,
        Type: 'json',
        SCHUL_NM: schoolName
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: '학교 정보를 가져오는데 실패했습니다.' });
  }
});

// 시간표 API
app.get('/api/timetable', async (req, res) => {
    const { schoolCode, grade, classNum, schoolType } = req.query;
    const ATPT_OFCDC_SC_CODE = schoolCode.substring(0, 3);
    const SD_SCHUL_CODE = schoolCode;
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  
    let apiUrl;
    let timetableKey;
    switch(schoolType) {
      case 'elementary':
        apiUrl = 'http://open.neis.go.kr/hub/elsTimetable';
        timetableKey = 'elsTimetable';
        break;
      case 'middle':
        apiUrl = 'http://open.neis.go.kr/hub/misTimetable';
        timetableKey = 'misTimetable';
        break;
      case 'high':
        apiUrl = 'http://open.neis.go.kr/hub/hisTimetable';
        timetableKey = 'hisTimetable';
        break;
      default:
        return res.status(400).json({ error: '잘못된 학교 유형입니다. (elementary, middle, high 중 하나여야 합니다)' });
    }
  
    try {
      console.log('Fetching timetable data...');
      console.log('School Type:', schoolType);
      console.log('API URL:', apiUrl);
      const timetableResponse = await axios.get(apiUrl, {
        params: {
          KEY: process.env.NEIS_API_KEY,
          Type: 'json',
          pIndex: 1,
          pSize: 100,
          ATPT_OFCDC_SC_CODE: ATPT_OFCDC_SC_CODE,
          SD_SCHUL_CODE: SD_SCHUL_CODE,
          GRADE: grade,
          CLASS_NM: classNum,
          ALL_TI_YMD: today
        }
      });
      console.log('Timetable response:', timetableResponse.data);
  
      let timetableData = [];
      if (timetableResponse.data[timetableKey]) {
        timetableData = timetableResponse.data[timetableKey][1].row;
      }
  
      res.json({ timetable: timetableData });
    } catch (error) {
      console.error('Error fetching timetable:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: '시간표 정보를 가져오는데 실패했습니다.' });
    }
  });

// 급식 API
app.get('/api/meal', async (req, res) => {
  try {
    const { schoolCode } = req.query;
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const response = await axios.get(`${NEIS_BASE_URL}/mealServiceDietInfo`, {
      params: {
        KEY: process.env.NEIS_API_KEY,
        Type: 'json',
        ATPT_OFCDC_SC_CODE: schoolCode.substring(0, 3),
        SD_SCHUL_CODE: schoolCode,
        MLSV_YMD: today
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: '급식 정보를 가져오는데 실패했습니다.' });
  }
});

app.get('/api/school-details', async (req, res) => {
    const { schoolCode } = req.query;
    try {
      // 여기에 실제 학교 정보를 가져오는 로직을 구현해야 합니다.
      // 예를 들어, NEIS API를 호출하거나 데이터베이스에서 조회하는 등의 작업이 필요합니다.
      // 지금은 임시로 더미 데이터를 반환하겠습니다.
      const schoolDetails = {
        grades: [1, 2, 3],
        classes: [1, 2, 3, 4, 5, 6, 7, 8]
      };
      res.json({ schoolDetails });
    } catch (error) {
      console.error('Error fetching school details:', error);
      res.status(500).json({ error: '학교 상세 정보를 가져오는데 실패했습니다.' });
    }
  });

// 라우트 설정
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/timetable', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'timetable.html'));
});

app.get('/meal', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'meal.html'));
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});