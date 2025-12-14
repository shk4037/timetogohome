# Sanctuary: Time to go home

공간 메타포 기반 자기분석 웹앱으로, 사용자가 자신의 취향을 텍스트로 입력하면 AI가 이를 시각적 오브젝트(이모지)로 변환해 방에 배치합니다.

## 설정

### 1. OpenAI API Key 설정

프로젝트 루트에 `.env` 파일을 생성하고 OpenAI API 키를 추가하세요:

```bash
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

`.env.example` 파일을 참고하세요.

**중요:** 
- `.env` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.
- Netlify에 배포할 때는 Netlify 대시보드의 환경 변수 설정에서 `VITE_OPENAI_API_KEY`를 추가해야 합니다.

### 2. CORS 이슈 해결 (필요한 경우)

브라우저에서 직접 OpenAI API를 호출할 때 CORS 문제가 발생할 수 있습니다. 

**해결 방법:**
- Netlify Functions를 사용하여 프록시 서버를 만들거나
- 개발 환경에서는 Vite의 프록시 설정을 사용할 수 있습니다

현재는 API 키가 없거나 오류 발생 시 폴백 변환 로직이 작동합니다.

## 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프리뷰
npm run preview
```

## 사용 방법

1. 메인 화면에서 "새 방 만들기"를 클릭하거나 기존 방을 선택합니다.
2. 방 화면에서 텍스트 입력창에 취향을 입력하고 Enter를 누릅니다.
3. 입력한 텍스트가 이모지로 변환되어 방에 배치됩니다.
4. 방 이름을 클릭하여 수정할 수 있습니다.
5. 오브젝트에 마우스를 올리면 삭제 버튼이 나타납니다.

## 기술 스택

- Vite
- Vanilla JavaScript
- LocalStorage (상태 관리)
- OpenAI GPT API (이모지 변환)

## 설계 원칙

- 사용자의 자율성 최우선
- AI는 판단자가 아닌 번역자
- 말보다 시각적 변화가 중요
- 조용한 따뜻함 톤



