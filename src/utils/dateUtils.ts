/**
 * 날짜 관련 유틸리티 함수들
 * 24:00시 이후를 다음 날로 인식하는 로직 포함
 */

/**
 * 현재 앱 시간 기준 날짜를 반환 (24:00시 이후는 다음 날로 인식)
 */
export const getCurrentAppDate = (): Date => {
  const now = new Date();
  // 자정(00:00) 이후는 다음 날로 인식
  return now;
};

/**
 * 현재 앱 기준 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export const getTodayString = (): string => {
  const today = getCurrentAppDate();
  return formatDateToString(today);
};

/**
 * Date 객체를 YYYY-MM-DD 형식 문자열로 변환
 */
export const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * YYYY-MM-DD 형식 문자열을 Date 객체로 변환
 */
export const parseStringToDate = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00.000Z');
};

/**
 * 두 날짜 문자열 간의 차이를 일 단위로 계산
 * @param dateString1 비교할 날짜 (YYYY-MM-DD)
 * @param dateString2 기준 날짜 (YYYY-MM-DD), 기본값은 오늘
 * @returns 양수: dateString1이 미래, 음수: dateString1이 과거, 0: 같은 날
 */
export const getDaysDifference = (
  dateString1: string,
  dateString2?: string,
): number => {
  // 날짜 형식 검증
  const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateFormatRegex.test(dateString1)) {
    console.warn(
      `getDaysDifference: 잘못된 날짜 형식이 전달되었습니다. dateString1: "${dateString1}"`,
    );
    return -999; // 과거로 처리
  }

  const date1 = parseStringToDate(dateString1);
  const date2 = parseStringToDate(dateString2 || getTodayString());

  const diffTime = date1.getTime() - date2.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 날짜 문자열이 오늘인지 확인
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getTodayString();
};

/**
 * 날짜 문자열이 어제인지 확인
 */
export const isYesterday = (dateString: string): boolean => {
  return getDaysDifference(dateString) === -1;
};

/**
 * 날짜 문자열이 내일인지 확인
 */
export const isTomorrow = (dateString: string): boolean => {
  return getDaysDifference(dateString) === 1;
};

/**
 * 날짜 문자열을 상대적 표현으로 변환 (오늘, 어제, 내일, N일 전, N일 후)
 */
export const getRelativeDateString = (dateString: string): string => {
  if (isToday(dateString)) {
    return '오늘';
  }

  if (isYesterday(dateString)) {
    return '어제';
  }

  if (isTomorrow(dateString)) {
    return '내일';
  }

  const diff = getDaysDifference(dateString);
  if (diff > 0) {
    return `${diff}일 후`;
  } else {
    return `${Math.abs(diff)}일 전`;
  }
};

/**
 * 날짜 문자열을 한국어 형식으로 표시 (2025년 1월 15일 수요일)
 */
export const formatDateToKorean = (dateString: string): string => {
  const date = parseStringToDate(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
};

/**
 * 날짜 문자열에서 월일만 추출 (1월 15일)
 */
export const formatDateToMonthDay = (dateString: string): string => {
  const date = parseStringToDate(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
};

/**
 * 날짜 문자열에서 요일 추출
 */
export const getDayOfWeek = (dateString: string): string => {
  const days = [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ];
  const date = parseStringToDate(dateString);
  return days[date.getDay()];
};

/**
 * 현재 시간 기준으로 날짜 상태 판별 (과거/현재/미래)
 */
export const getDateStatus = (
  dateString: string,
): 'past' | 'today' | 'future' => {
  // 입력된 날짜 형식 검증
  if (!dateString) {
    console.warn('getDateStatus: 빈 날짜 문자열이 전달되었습니다.');
    return 'past';
  }

  // YYYY-MM-DD 형식이 아닌 경우 경고 로그 출력
  const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateFormatRegex.test(dateString)) {
    console.warn(
      `getDateStatus: 잘못된 날짜 형식이 전달되었습니다. 받은 값: "${dateString}", 예상 형식: "YYYY-MM-DD"`,
    );
    return 'past';
  }

  const diff = getDaysDifference(dateString);

  if (diff < 0) {
    return 'past';
  } else if (diff === 0) {
    return 'today';
  } else {
    return 'future';
  }
};

/**
 * 날짜 범위 생성 (시작일부터 종료일까지)
 */
export const getDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const start = parseStringToDate(startDate);
  const end = parseStringToDate(endDate);

  const current = new Date(start);
  while (current <= end) {
    dates.push(formatDateToString(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

/**
 * N일 전/후 날짜 계산
 */
export const addDays = (dateString: string, days: number): string => {
  const date = parseStringToDate(dateString);
  date.setDate(date.getDate() + days);
  return formatDateToString(date);
};

/**
 * 오늘 기준 N일 전 날짜
 */
export const getDaysAgo = (days: number): string => {
  return addDays(getTodayString(), -days);
};

/**
 * 오늘 기준 N일 후 날짜
 */
export const getDaysLater = (days: number): string => {
  return addDays(getTodayString(), days);
};
