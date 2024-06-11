# recruitment-site

# 환경변수

- '.env.example'파일의 이름을 '.env'로 변경하고 아래 내용을 채움

```sh
DATABASE_URL=mysql://계정이름:비밀번호@주소:포트/DB명
SERVER_PORT=서버 포트
ACCESS_TOKEN_SECRET=JWT 생성을 위한 비밀키
REFRESH_TOKEN_SECRET=JWT 생성을 위한 비밀키
```

## 프로젝트 목표

“Express.js, MySQL을 활용해 나만의 채용 서비스 백엔드 서버 만들기”

## 프로젝트 내용

1. 회원 가입 및 로그인을 통해 유저를 생성할 수 있다.

2. 이력서를 관리할 수 있다. (생성, 목록 조회, 상세 조회, 수정, 삭제 기능 구현)

## 프로젝트 실행 방법

- 필요한 패키지 설치
  `yarn`

- 서버 실행(배포용)
  `yarn start`

- 서버 실행(개발용)
  `yarn dev`

# API 명세서

https://www.notion.so/Node-js-API-e98b987233234ae8b05b09f3298fd12e

# ERD

https://drawsql.app/teams/soobeen/diagrams/-2
