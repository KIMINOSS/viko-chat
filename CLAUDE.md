# VIKO Chat - Vietnamese-Korean AI Translation Chat

## Project Overview
베트남어-한국어 1:1 실시간 AI 번역 채팅 PWA

## Stack
- **Web**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4
- **Backend**: Node.js 20+ / Fastify 5.x
- **AI**: Google Gemini 2.0 Flash
- **Database**: Supabase (PostgreSQL + Realtime)
- **Auth**: Supabase Auth (이메일/비밀번호)
- **State**: Zustand 5
- **PWA**: vite-plugin-pwa (Workbox)
- **Deployment**: Vercel (Web) + Railway (API)

## Directory Structure
```
viko-chat/
├── apps/
│   ├── web/           # React PWA
│   │   ├── src/
│   │   │   ├── app/           # Router
│   │   │   ├── features/      # Feature modules
│   │   │   │   ├── auth/      # Login, ProfileSetup, useAuth
│   │   │   │   ├── chat/      # ChatRoom, ConversationList, stores
│   │   │   │   ├── contacts/  # ContactsPage (email search)
│   │   │   │   └── settings/  # SettingsPage
│   │   │   ├── lib/           # supabase, api, constants
│   │   │   ├── shared/        # BottomNav, Avatar, Loading
│   │   │   ├── styles/        # Tailwind CSS
│   │   │   └── types/         # TypeScript types
│   │   └── vite.config.ts
│   ├── api/           # Fastify 백엔드
│   │   ├── src/
│   │   │   ├── middleware/    # auth.ts (JWT 검증)
│   │   │   ├── routes/       # translate, chat, auth
│   │   │   └── services/     # gemini, supabase
│   │   └── supabase/
│   │       └── migrations/   # DB 스키마
│   └── mobile/        # Flutter 앱 (미구현)
├── docs/
│   └── blueprint.md
└── CLAUDE.md
```

## Commands
| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | `apps/api` | API 개발 서버 (port 3000) |
| `npm run dev` | `apps/web` | Web 개발 서버 (port 5173) |
| `npm run build` | `apps/web` | TypeScript 체크 + Vite 빌드 |

## Key Files
| File | Purpose |
|------|---------|
| `apps/api/src/services/gemini.ts` | Gemini 번역 로직 |
| `apps/api/src/services/supabase.ts` | DB 연동 |
| `apps/api/src/routes/auth.ts` | 인증 API (프로필, 검색) |
| `apps/api/src/middleware/auth.ts` | JWT 미들웨어 |
| `apps/api/supabase/migrations/001_initial_schema.sql` | DB 스키마 |
| `apps/web/src/features/chat/hooks/useMessages.ts` | 메시지 + Realtime |
| `apps/web/src/features/chat/stores/chatStore.ts` | Zustand 상태 |

## Environment Variables
### Backend (apps/api/.env)
- `GEMINI_API_KEY` - Gemini API 키
- `SUPABASE_URL` - Supabase 프로젝트 URL
- `SUPABASE_SERVICE_KEY` - Supabase 서비스 키

### Frontend (apps/web/.env)
- `VITE_SUPABASE_URL` - Supabase 프로젝트 URL
- `VITE_SUPABASE_ANON_KEY` - Supabase Anon 키
- `VITE_API_URL` - 백엔드 API URL

## Code Conventions
- **TypeScript**: ESLint + strict mode, ESM
- **Commit**: `feat(web): add chat room UI`
- **Architecture**: Feature-first (auth, chat, contacts, settings)

## TODO
- [ ] Supabase 마이그레이션 실행
- [ ] PWA 아이콘 생성 (icon-192.png, icon-512.png)
- [ ] Vercel 배포
- [ ] OTP/소셜 로그인 추가
- [ ] 음성 메시지 지원
