# Project Blueprint: VIKO Chat

**Vietnamese-Korean AI Translation Chat App**

베트남어-한국어 1:1 실시간 AI 번역 채팅 애플리케이션

---

## Stack Overview

| Layer | Technology | Version |
|-------|------------|---------|
| **Mobile** | Flutter | 3.38.6 (Dart 3.9.0) |
| **Backend** | Node.js + Fastify | 5.7.4 (Node.js 20+) |
| **AI Engine** | Google Gemini API | 2.0 Flash |
| **Database** | Supabase | PostgreSQL + Realtime |
| **Auth** | Supabase Auth | OAuth + Phone |
| **Deployment** | Vercel (Web) + Railway (API) | - |
| **Mobile Deploy** | Play Store + App Store | - |

---

## Project Structure

```
viko-chat/
├── apps/
│   └── mobile/                 # Flutter 앱
│       ├── lib/
│       │   ├── main.dart
│       │   ├── app/            # App configuration
│       │   ├── features/       # Feature modules
│       │   │   ├── auth/       # 로그인/회원가입
│       │   │   ├── chat/       # 채팅 화면
│       │   │   ├── contacts/   # 연락처/친구
│       │   │   └── settings/   # 설정
│       │   ├── core/           # 공통 로직
│       │   │   ├── api/        # API 클라이언트
│       │   │   ├── models/     # 데이터 모델
│       │   │   └── utils/      # 유틸리티
│       │   └── shared/         # 공유 위젯
│       ├── pubspec.yaml
│       └── test/
├── apps/
│   └── api/                    # Fastify 백엔드
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── chat.ts
│       │   │   └── translate.ts
│       │   ├── services/
│       │   │   ├── gemini.ts   # Gemini API 연동
│       │   │   └── supabase.ts
│       │   └── utils/
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/                 # 공유 타입/상수
├── docs/
│   ├── blueprint.md
│   └── api-spec.md
└── CLAUDE.md
```

---

## Key Features

### 1. 실시간 1:1 채팅
- Supabase Realtime 기반 메시지 전송
- 읽음 확인, 타이핑 인디케이터
- 오프라인 큐잉 + 재전송

### 2. AI 번역 (Gemini 2.0 Flash)
- **자동 감지**: 입력 언어 자동 인식 (vi ↔ ko)
- **컨텍스트 번역**: 대화 맥락 고려한 자연스러운 번역
- **슬랭/관용구 처리**: 문화적 표현 적절히 번역
- **원문 보기**: 번역문 탭하면 원문 표시

### 3. 사용자 인증
- 전화번호 인증 (OTP)
- Google/Apple 소셜 로그인
- 프로필 관리 (언어 설정, 사진)

### 4. 연락처 관리
- 전화번호로 친구 추가
- QR 코드 친구 추가
- 차단/신고 기능

---

## Initialization Commands

### 1. Flutter 앱 생성
```bash
cd ~/AI-Project/projects/viko-chat/apps
flutter create mobile --org com.viko --platforms android,ios
cd mobile
flutter pub add supabase_flutter riverpod go_router
flutter pub add flutter_hooks freezed json_annotation
flutter pub add -d build_runner freezed_annotation
```

### 2. Fastify 백엔드 생성
```bash
cd ~/AI-Project/projects/viko-chat/apps
mkdir api && cd api
npm init -y
npm i fastify @fastify/cors @fastify/websocket
npm i @google/generative-ai @supabase/supabase-js
npm i -D typescript @types/node tsx
npx tsc --init
```

---

## Key Dependencies

### Flutter (mobile)
| Package | Purpose |
|---------|---------|
| supabase_flutter | Supabase 클라이언트 |
| riverpod | 상태관리 |
| go_router | 네비게이션 |
| freezed | 불변 모델 |
| flutter_hooks | React-style hooks |

### Node.js (api)
| Package | Purpose |
|---------|---------|
| fastify | 웹 프레임워크 |
| @google/generative-ai | Gemini API |
| @supabase/supabase-js | Supabase 클라이언트 |
| zod | 유효성 검증 |

---

## Database Schema (Supabase)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE,
  name VARCHAR(100),
  avatar_url TEXT,
  preferred_lang VARCHAR(5) DEFAULT 'ko', -- 'ko' or 'vi'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES users(id),
  user2_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  translated TEXT,
  source_lang VARCHAR(5),
  target_lang VARCHAR(5),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/phone | 전화번호 OTP 요청 |
| POST | /auth/verify | OTP 검증 |
| GET | /conversations | 대화 목록 |
| POST | /conversations | 새 대화 시작 |
| GET | /conversations/:id/messages | 메시지 목록 |
| POST | /translate | Gemini 번역 요청 |
| WS | /ws/chat | 실시간 채팅 |

---

## Conventions

### Code Style
- **Flutter**: Dart 공식 스타일, riverpod 패턴
- **Node.js**: ESLint + Prettier, TypeScript strict mode
- **Commit**: `feat(mobile): add chat screen`

### Architecture
- **Flutter**: Feature-first structure, Riverpod providers
- **Backend**: Route → Service → Repository 패턴
- **Error Handling**: Result 타입 사용, 에러 코드 표준화

---

## Environment Variables

### Mobile (.env)
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
API_BASE_URL=https://api.viko.chat
```

### Backend (.env)
```
PORT=3000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
GEMINI_API_KEY=xxx
```

---

## Sources

- [Flutter 3.38 Release Notes](https://docs.flutter.dev/release/release-notes/release-notes-3.38.0)
- [Fastify Official](https://fastify.dev/)
- [Gemini Translation Capabilities](https://blog.google/products/search/gemini-capabilities-translation-upgrades/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
