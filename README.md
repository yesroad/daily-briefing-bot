![Daily Briefing Bot](https://github.com/yesroad/daily-briefing-bot/actions/workflows/daily-briefing-bot.yml/badge.svg)

매일 22:00(KST)에 RSS 뉴스를 수집하고, 중복 제거/대표 선별 후 LLM 요약을 생성해 이메일로 발송하는 봇입니다. GitHub Actions 스케줄로 자동 실행됩니다.

## 주요 기능

- RSS 뉴스 10~15개 수집 및 중복 완화
- 고정 JSON 스키마 요약 생성 (LLM)
- SMTP 이메일 발송 (text + HTML)
- GitHub Actions 스케줄 실행

## 기술 스택

- Node.js + TypeScript + tsx
- rss-parser, zod, OpenAI SDK, nodemailer
- GitHub Actions (schedule)

## 로컬 실행

```bash
yarn install
yarn dev
```

## 환경 변수

로컬 개발 시 `.env`를 사용합니다. 실제 비밀키는 GitHub Actions Secrets에만 저장하세요.

필수 값:

- `OPENAI_API_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SMTP_TO`

## 요약 스키마

LLM 출력은 고정 JSON 스키마를 따릅니다. 배열 항목은 `{ text, sourceIndex }` 형태이며 `sourceIndex`는 입력 기사 번호(1부터 시작)입니다.

## GitHub Actions

워크플로는 `.github/workflows/daily-briefing-bot.yml`에 있으며, 기본 스케줄은 매일 KST 22:00입니다.실행 명령은 `yarn run`이며,
로컬에서는 `yarn dev`로 동일한 동작을 확인할 수 있습니다.

## 개발 규칙

- 불필요한 리팩토링 금지, 변경 최소화
- 링크/출처/URL은 LLM 출력에 포함하지 않음
- 이메일 템플릿은 인라인 스타일만 사용
