export const HTTP_STATUS = {
  OK: 200, // 호출 성공
  CREATED: 201, //생성 성공
  BAD_REQUEST: 400, // 사용자가 잘못 했을 때 (EX:입력 값을 빠뜨렸을 때)
  UNAUTHORIZED: 401, //인증 실패 unauthenciated (EX:비밀번호가 틀렸을 때)
  FORBIDDEN: 403, //인가 실패 unauthoried (EX:접근 권한이 없을 때)
  NOT_FOUND: 404, //데이터가 없는 경우
  CONFLICT: 409, //충돌 발생 (EX:이메일이 중복 되었을 때)
  INTERNAL_SERVER_ERROR: 500, //예상치 못한 에러가 발생했을 때
};
