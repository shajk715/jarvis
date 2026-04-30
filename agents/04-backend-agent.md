# ⚙️ Backend Agent

## 역할 요약
루미의 실질적인 기능들을 구현하는 에이전트. 외부 API 연동부터 일정/메모/타이머 같은 생산성 기능까지 담당한다.

---

## 책임 범위

| 파일 | 기능 |
|------|------|
| `features/schedule.js` | 일정 추가/조회/삭제 |
| `features/memo.js` | 메모 저장/조회 |
| `features/timer.js` | 타이머/알람 |
| `features/briefing.js` | 하루 브리핑 |
| `features/youtube.js` | 유튜브 음악 검색 및 재생 |
| `features/maps.js` | 맛집 추천 + 길 안내 |
| `utils/storage.js` | localStorage 헬퍼 |

---

## 기능별 상세

### 📅 schedule.js
```javascript
// 구현할 함수들
addSchedule(title, datetime)      // 일정 추가
getSchedules(date)                // 날짜별 일정 조회
deleteSchedule(id)                // 일정 삭제
getTodaySchedules()               // 오늘 일정 전체
```
- 저장: localStorage (`jarvis_schedules`)
- 형식: `{ id, title, datetime, createdAt }`

### 📝 memo.js
```javascript
addMemo(content)                  // 메모 저장
getMemos()                        // 전체 메모 조회
deleteMemo(id)                    // 메모 삭제
getLastMemo()                     // 마지막 메모 조회
```
- 저장: localStorage (`jarvis_memos`)

### ⏰ timer.js
```javascript
startTimer(seconds, label)        // 타이머 시작
cancelTimer()                     // 타이머 취소
setAlarm(datetime, label)         // 알람 설정
```
- 타이머 완료 시 TTS로 알림음 + 음성 안내

### ☀️ briefing.js
```javascript
getDailyBriefing()               // 오늘 일정 + 날씨 + 뉴스 요약 생성
```
- 오늘 일정: localStorage에서 조회
- 날씨/뉴스: Claude API 웹 검색 활용
- 매일 아침 자동 실행 (앱 켰을 때 오전 6~10시면 자동 브리핑)

### 🎵 youtube.js
```javascript
searchAndPlay(query)              // 검색어로 유튜브 영상 재생
pauseMusic()                      // 일시정지
resumeMusic()                     // 재생
stopMusic()                       // 정지
```
- YouTube Data API v3 사용
- `YOUTUBE_API_KEY` 환경변수 참조
- iframe으로 재생 (모바일 웹 제약 고려)

### 🗺️ maps.js
```javascript
findNearbyRestaurants(location, keyword)  // 근처 맛집 검색
getDirections(destination)               // 길 안내 URL 생성
```
- Google Maps API 사용
- `GOOGLE_MAPS_API_KEY` 환경변수 참조
- 길 안내는 구글맵 앱 딥링크로 연결

### 🗄️ storage.js (헬퍼)
```javascript
save(key, data)                   // JSON 저장
load(key)                         // JSON 불러오기
remove(key)                       // 삭제
```

---

## 환경변수 참조 방식
```javascript
const YOUTUBE_KEY = process.env.YOUTUBE_API_KEY
const MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY
```

---

## 완료 기준
- [ ] schedule.js — CRUD 동작
- [ ] memo.js — CRUD 동작
- [ ] timer.js — 타이머/알람 + TTS 연동
- [ ] briefing.js — 아침 자동 브리핑 동작
- [ ] youtube.js — 음성 명령으로 재생
- [ ] maps.js — 맛집 검색 + 길 안내 딥링크
- [ ] storage.js — 저장/불러오기 정상 동작
- [ ] PM Agent에게 완료 보고
