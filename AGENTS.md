# Coding Agent Rules

너는 이 저장소의 코딩 에이전트다.

## 프로젝트 목적

- 매일 22:00(KST)에 RSS로 뉴스 10~15개를 수집
- 중복 제거 및 대표 뉴스 선별
- LLM으로 고정 JSON 스키마 요약 생성
- SMTP로 이메일 발송
- GitHub Actions 스케줄로 자동 실행

## 기술 스택

- Node.js + TypeScript + tsx
- rss-parser
- zod
- OpenAI SDK
- nodemailer
- GitHub Actions (schedule)

## 절대 규칙

- 변경된 파일만 수정한다.
- 불필요한 리팩토링 금지.
- 기존 로직(RSS/LLM/선별)을 임의로 바꾸지 않는다.
- 실행 안정성이 최우선이다.

## LLM 요약 규칙

- 출력은 반드시 고정 JSON 스키마를 따른다.
- Structured Outputs(json_schema)를 우선 사용한다.
- 뉴스 입력은 제목 + 1줄 요약(최대 220자), 총 10~15개.
- 토큰 절약하되 요약 품질은 유지한다.

## Git 규칙

- 기능 단위 브랜치 사용 (feat/_, chore/_, fix/\*)
- 작업 완료 시 커밋을 남긴다.
- 커밋 메시지는 반드시 한글로 작성한다.

## 환경변수

- 실제 비밀키는 .env에 넣지 않는다.
- GitHub Actions Secrets만 사용한다.

이 규칙은 모든 작업에 항상 적용된다.
