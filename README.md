![Daily Briefing Bot](https://img.shields.io/badge/Daily_Briefing_Bot-passing-brightgreen)

# Daily Briefing Bot 📰

> **AI를 활용한 뉴스 요약 자동화**  
> Vibe Coding으로 제작한 실험적 프로젝트입니다.

매일 저녁 10시(22:00 KST)에 RSS 피드에서 뉴스를 수집하고,  
OpenAI LLM으로 요약해서 이메일로 발송하는 자동화 봇입니다.

## 🎯 제작 배경

개인적으로 매일 저녁 주요 뉴스를 요약해서 받아보고 싶어서 만들었습니다.  
AI와 자동화를 직접 경험해보고자 빠르게(Vibe Coding) 구현한 프로젝트입니다.

## ✨ 주요 기능

- **RSS 뉴스 수집**: 10~15개 뉴스 피드 자동 수집
- **중복 제거**: 유사한 뉴스 필터링
- **LLM 요약**: OpenAI API로 고정 JSON 스키마 기반 요약 생성
- **이메일 발송**: HTML 형식으로 정리된 요약 전송
- **GitHub Actions**: 매일 저녁 10시 자동 실행

## 🛠 기술 스택

- **Language**: Node.js + TypeScript + tsx
- **Libraries**: 
  - `rss-parser` - RSS 피드 파싱
  - `zod` - 데이터 검증
  - `OpenAI SDK` - LLM 요약
  - `nodemailer` - 이메일 발송
- **Automation**: GitHub Actions (schedule)

## 🚀 로컬 실행
```bash
yarn install
yarn start
```

## ⚙️ 환경 변수

로컬 개발 시 `.env` 파일 사용, 실제 배포는 GitHub Actions Secrets에 저장:
```env
OPENAI_API_KEY=your_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
SMTP_FROM=sender_email
SMTP_TO=recipient_email
```

## 📊 요약 스키마

LLM 출력은 고정 JSON 스키마를 따릅니다.  
배열 형식으로 `{ text, sourceIndex }` 형태이며, `sourceIndex`는 원본 기사 번호(1부터 시작)입니다.

## ⏰ GitHub Actions

워크플로는 `.github/workflows/daily-briefing-bot.yml`에 있으며,  
기본 스케줄은 매일 KST 22:00입니다. 실행 명령은 `yarn start`입니다.

## 💡 개발 규칙

- **Vibe Coding**: 빠른 프로토타이핑 우선, 점진적 개선
- **실용성**: 실제로 매일 사용하는 것이 목표
- **실험적**: 새로운 기술(LLM, 자동화)을 시도하는 학습 프로젝트
