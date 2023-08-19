export const API_URL =  process.env.NODE_ENV === 'production' ? 'https://zete.com' : 'http://localhost:4000';

// 메모리스트 요청 limit 지정
export const MEMO_LIST_REQUEST_LIMIT = 16;

// 정규식 상수
export const PATTERNS = {
    VALID_PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
    INPUT_PASSWORD: /[^A-Za-z\d@$!%*#?&]+/g,
    EMAIL: /^[0-9a-zA-Z]([-_\\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i,
    INPUT_PHONE: /^(\d{0,3})(\d{0,4})(\d{0,4})$/g,
};