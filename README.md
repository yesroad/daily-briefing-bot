![Daily Briefing Bot](https://img.shields.io/badge/Daily_Briefing_Bot-passing-brightgreen)

# Daily Briefing Bot 📰

> **RSS + OpenAI + GitHub Actions 기반 뉴스 요약 자동화**

매일 저녁 10시(22:00 KST)에 RSS 피드에서 뉴스를 수집하고,  
OpenAI로 요약해서 이메일로 발송하는 자동화 봇입니다.

## 🎯 제작 배경

개인적으로 매일 저녁 주요 뉴스를 요약해서 받아보고 싶어서 만들었습니다.  
실제로 매일 사용하고 있는 실용적인 자동화 프로젝트입니다.

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

OpenAI Structured Output으로 일관된 형식을 보장합니다.

```typescript
{
  summaries: Array<{
    text: string        // 요약 텍스트
    sourceIndex: number // 원본 기사 번호 (1부터 시작)
  }>
}
```

## ⏰ GitHub Actions 스케줄링

워크플로는 `.github/workflows/daily-briefing-bot.yml`에 정의되어 있습니다.

```yaml
schedule:
  - cron: '0 13 * * *'  # 매일 22:00 KST (UTC+9)
```

## 💡 핵심 구현

### RSS 파싱
- 여러 뉴스 소스에서 최신 기사 수집
- 중복 제거 알고리즘으로 유사 뉴스 필터링

### OpenAI 통합
- Structured Output으로 파싱 오류 제거
- JSON 스키마 기반 안정적인 응답
- Token 사용량 최적화

### 이메일 발송
- HTML 템플릿으로 가독성 높은 포맷
- 원본 기사 링크 포함
- nodemailer를 통한 SMTP 전송

### GitHub Actions
- 서버리스 환경에서 자동 실행
- Secrets 관리로 보안 강화
- 실행 이력 추적 및 디버깅

## 📌 실행 흐름

1. GitHub Actions 스케줄 트리거 (매일 22:00 KST)
2. RSS 피드에서 최신 뉴스 수집
3. 중복 제거 및 필터링
4. OpenAI로 요약 생성
5. HTML 이메일 포맷팅
6. SMTP로 이메일 발송

## 🔧 확장 가능성

- 추가 RSS 소스 지원
- 카테고리별 요약
- Slack/Discord 알림 지원
- 웹 UI 대시보드
