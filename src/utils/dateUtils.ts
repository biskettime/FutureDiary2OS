import { DiaryEntry, TimelineItem } from '../types';

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateObj.toDateString() === today.toDateString()) {
    return '오늘';
  } else if (dateObj.toDateString() === yesterday.toDateString()) {
    return '어제';
  } else {
    return dateObj.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  }
};

export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(dateObj)} ${formatTime(dateObj)}`;
};

export const getDaysFromNow = (date: string): number => {
  const targetDate = new Date(date);
  const today = new Date();

  // 시간을 제거하고 날짜만 비교
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getTimelineStatus = (
  date: string,
): 'past' | 'today' | 'future' => {
  const daysFromNow = getDaysFromNow(date);

  if (daysFromNow < 0) return 'past';
  if (daysFromNow === 0) return 'today';
  return 'future';
};

export const createTimelineItems = (entries: DiaryEntry[]): TimelineItem[] => {
  return entries.map(entry => ({
    entry,
    status: getTimelineStatus(entry.date),
    daysFromNow: getDaysFromNow(entry.date),
  }));
};

export const sortTimelineItems = (items: TimelineItem[]): TimelineItem[] => {
  return items.sort((a, b) => {
    // 오늘 항목을 맨 위로
    if (a.status === 'today' && b.status !== 'today') return -1;
    if (b.status === 'today' && a.status !== 'today') return 1;

    // 미래 항목을 날짜순으로 정렬
    if (a.status === 'future' && b.status === 'future') {
      return a.daysFromNow - b.daysFromNow;
    }

    // 과거 항목을 최신순으로 정렬
    if (a.status === 'past' && b.status === 'past') {
      return b.daysFromNow - a.daysFromNow;
    }

    // 미래 > 과거 순서
    if (a.status === 'future' && b.status === 'past') return -1;
    if (a.status === 'past' && b.status === 'future') return 1;

    return 0;
  });
};

export const getTodayEntries = (entries: DiaryEntry[]): DiaryEntry[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return entries.filter(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  });
};

export const isToday = (date: string): boolean => {
  return getDaysFromNow(date) === 0;
};

export const isFuture = (date: string): boolean => {
  return getDaysFromNow(date) > 0;
};

export const isPast = (date: string): boolean => {
  return getDaysFromNow(date) < 0;
};

export const formatDateToMonthDay = (date: string): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
  });
};

export const getDayOfWeek = (date: string): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('ko-KR', {
    weekday: 'short',
  });
};

export const getDateStatus = (date: string): 'past' | 'today' | 'future' => {
  return getTimelineStatus(date);
};
